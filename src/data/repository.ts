import type { Account, Claim, PaymentOption, PayoutDestination } from '../types';
import { supabase } from './supabase';

export interface AppData {
  account: Account;
  claims: Claim[];
  destinations: PayoutDestination[];
}

// --- row <-> domain mappers ------------------------------------------------

type AccountRow = {
  name: string;
  email: string;
  avatar_initials: string;
  member_since: string;
  credit_limit: number | string;
  available_balance: number | string;
  outstanding_balance: number | string;
  apr: number | string;
  property?: string | null;
  phone?: string | null;
  dob?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
  ssn_last4?: string | null;
  employer?: string | null;
  annual_income?: number | string | null;
  processing_fee: number | string;
  network_charge: number | string;
  vat_rate: number | string;
  fee_paid: boolean;
  fee_payment_options?: PaymentOption[] | null;
  officer_name?: string | null;
  officer_email?: string | null;
};

const num = (v: number | string) => (typeof v === 'string' ? parseFloat(v) : v);

function rowToAccount(r: AccountRow): Account {
  return {
    name: r.name,
    email: r.email,
    avatarInitials: r.avatar_initials,
    memberSince: r.member_since,
    creditLimit: num(r.credit_limit),
    availableBalance: num(r.available_balance),
    outstandingBalance: num(r.outstanding_balance),
    apr: num(r.apr),
    property: r.property ?? undefined,
    phone: r.phone ?? undefined,
    dob: r.dob ?? undefined,
    addressStreet: r.address_street ?? undefined,
    addressCity: r.address_city ?? undefined,
    addressState: r.address_state ?? undefined,
    addressZip: r.address_zip ?? undefined,
    ssnLast4: r.ssn_last4 ?? undefined,
    employer: r.employer ?? undefined,
    annualIncome: r.annual_income != null ? num(r.annual_income) : undefined,
    processingFee: num(r.processing_fee),
    networkCharge: num(r.network_charge),
    vatRate: num(r.vat_rate),
    feePaid: r.fee_paid,
    feePaymentOptions:
      Array.isArray(r.fee_payment_options) && r.fee_payment_options.length > 0
        ? r.fee_payment_options
        : [{ method: 'card' }],
    officerName: r.officer_name ?? 'Michael Brown',
    officerEmail: r.officer_email ?? 'michael.brown@pridebankheloc.com',
  };
}

function accountToRow(a: Account): AccountRow {
  return {
    name: a.name,
    email: a.email,
    avatar_initials: a.avatarInitials,
    member_since: a.memberSince,
    credit_limit: a.creditLimit,
    available_balance: a.availableBalance,
    outstanding_balance: a.outstandingBalance,
    apr: a.apr,
    property: a.property ?? null,
    phone: a.phone ?? null,
    dob: a.dob ?? null,
    address_street: a.addressStreet ?? null,
    address_city: a.addressCity ?? null,
    address_state: a.addressState ?? null,
    address_zip: a.addressZip ?? null,
    ssn_last4: a.ssnLast4 ?? null,
    employer: a.employer ?? null,
    annual_income: a.annualIncome ?? null,
    processing_fee: a.processingFee,
    network_charge: a.networkCharge,
    vat_rate: a.vatRate,
    fee_paid: a.feePaid,
    fee_payment_options: a.feePaymentOptions,
    officer_name: a.officerName,
    officer_email: a.officerEmail,
  };
}

type ClaimRow = {
  id: string;
  reference: string;
  amount: number | string;
  method: Claim['method'];
  status: Claim['status'];
  created_at: string;
  note: string | null;
  destination: string;
  direction?: 'in' | 'out' | null;
  source?: string | null;
};

function rowToClaim(r: ClaimRow): Claim {
  return {
    id: r.id,
    reference: r.reference,
    amount: num(r.amount),
    method: r.method,
    status: r.status,
    createdAt: r.created_at,
    note: r.note ?? undefined,
    destination: r.destination,
    direction: r.direction ?? 'out',
    source: r.source ?? undefined,
  };
}

function claimToRow(c: Claim, userId: string): ClaimRow & { user_id: string } {
  return {
    user_id: userId,
    id: c.id,
    reference: c.reference,
    amount: c.amount,
    method: c.method,
    status: c.status,
    created_at: c.createdAt,
    note: c.note ?? null,
    destination: c.destination,
    direction: c.direction ?? 'out',
    source: c.source ?? null,
  };
}

// --- reads/writes ----------------------------------------------------------

/** Load the full app state from Supabase, or null on failure / not configured. */
export async function fetchAppData(): Promise<AppData | null> {
  if (!supabase) return null;
  try {
    const [acc, dest, cl] = await Promise.all([
      supabase.from('accounts').select('*').order('created_at', { ascending: true }).limit(1).single(),
      supabase.from('payout_destinations').select('*').order('sort_order', { ascending: true }),
      supabase.from('claims').select('*').order('created_at', { ascending: false }),
    ]);
    if (acc.error || dest.error || cl.error) throw acc.error || dest.error || cl.error;
    return {
      account: rowToAccount(acc.data as AccountRow),
      destinations: (dest.data ?? []).map((d) => ({
        id: d.id,
        label: d.label,
        method: d.method,
        detail: d.detail,
      })),
      claims: (cl.data ?? []).map((r) => rowToClaim(r as ClaimRow)),
    };
  } catch (err) {
    console.warn('[supabase] fetchAppData failed, using local data:', err);
    return null;
  }
}

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function persistClaim(claim: Claim, account: Account): Promise<void> {
  if (!supabase) return;
  const userId = await currentUserId();
  if (!userId) return;
  const { error: claimErr } = await supabase.from('claims').insert(claimToRow(claim, userId));
  if (claimErr) throw claimErr;
  // Reflect the new balances on the user's account row (RLS scopes by user).
  const { error: accErr } = await supabase
    .from('accounts')
    .update({
      available_balance: account.availableBalance,
      outstanding_balance: account.outstandingBalance,
    })
    .eq('user_id', userId);
  if (accErr) throw accErr;
}

export async function persistAccount(account: Account): Promise<void> {
  if (!supabase) return;
  const userId = await currentUserId();
  if (!userId) return;
  const { error } = await supabase.from('accounts').update(accountToRow(account)).eq('user_id', userId);
  if (error) throw error;
}

/** Mark the current user's processing fee as paid (unlocks fund access). */
export async function payProcessingFee(): Promise<void> {
  if (!supabase) return;
  const userId = await currentUserId();
  if (!userId) return;
  const { error } = await supabase.from('accounts').update({ fee_paid: true }).eq('user_id', userId);
  if (error) throw error;
}

// --- Admin operations (RLS grants these to admins only) -------------------

export interface AdminAccount extends Account {
  userId: string;
}

export async function adminListAccounts(): Promise<AdminAccount[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...rowToAccount(r as AccountRow), userId: (r as { user_id: string }).user_id }));
}

export async function adminListClaims(userId: string): Promise<Claim[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToClaim(r as ClaimRow));
}

export async function adminUpdateAccount(
  userId: string,
  patch: {
    availableBalance?: number;
    outstandingBalance?: number;
    processingFee?: number;
    networkCharge?: number;
    vatRate?: number;
    feePaymentOptions?: PaymentOption[];
    officerName?: string;
    officerEmail?: string;
  },
): Promise<void> {
  if (!supabase) return;
  const row: Record<string, unknown> = {};
  if (patch.availableBalance != null) row.available_balance = patch.availableBalance;
  if (patch.outstandingBalance != null) row.outstanding_balance = patch.outstandingBalance;
  if (patch.processingFee != null) row.processing_fee = patch.processingFee;
  if (patch.networkCharge != null) row.network_charge = patch.networkCharge;
  if (patch.vatRate != null) row.vat_rate = patch.vatRate;
  if (patch.feePaymentOptions != null) row.fee_payment_options = patch.feePaymentOptions;
  if (patch.officerName != null) row.officer_name = patch.officerName;
  if (patch.officerEmail != null) row.officer_email = patch.officerEmail;
  const { error } = await supabase.from('accounts').update(row).eq('user_id', userId);
  if (error) throw error;
}

/** Permanently delete a user: removes the auth row and cascades all owned data. */
export async function adminDeleteUser(userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc('admin_delete_user', { target: userId });
  if (error) throw error;
}

export async function adminAddClaim(
  userId: string,
  input: { amount: number; direction: 'in' | 'out'; source?: string; destination: string; note?: string },
): Promise<void> {
  if (!supabase) return;
  const id = 'adm-' + Math.random().toString(36).slice(2, 12);
  const claim: Claim = {
    id,
    reference: 'TXN-' + new Date().getFullYear() + '-' + id.slice(-6).toUpperCase(),
    amount: input.amount,
    method: 'bank',
    status: 'completed',
    createdAt: new Date().toISOString(),
    note: input.note,
    destination: input.destination,
    direction: input.direction,
    source: input.source,
  };
  const { error } = await supabase.from('claims').insert(claimToRow(claim, userId));
  if (error) throw error;
}

import { useEffect, useState, type FormEvent } from 'react';
import { Lock, Mail, ShieldAlert, LogOut, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { BottomSheet } from '../components/ui/BottomSheet';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAuth } from '../data/auth';
import {
  adminListAccounts,
  adminListClaims,
  adminUpdateAccount,
  adminAddClaim,
  adminDeleteUser,
  type AdminAccount,
} from '../data/repository';
import { formatCurrency, formatDate } from '../utils/format';
import type { Claim } from '../types';

export default function Admin() {
  const { session, isAdmin, roleResolved, signIn, signOut } = useAuth();

  if (session && !roleResolved) {
    return <Centered><Spinner /></Centered>;
  }
  if (!session) return <AdminLogin onSignIn={signIn} />;
  if (!isAdmin) {
    return (
      <Centered>
        <div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-card-hover">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-crimson-50 text-crimson-600">
            <ShieldAlert size={28} />
          </span>
          <h1 className="text-xl font-extrabold text-navy-900">Not authorized</h1>
          <p className="mt-2 text-sm text-navy-500">This account does not have admin access.</p>
          <Button variant="outline" fullWidth className="mt-6" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </Centered>
    );
  }
  return <AdminDashboard onSignOut={signOut} />;
}

function AdminLogin({ onSignIn }: { onSignIn: (e: string, p: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSignIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Centered>
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card-hover">
        <Logo className="mx-auto mb-5 h-7" />
        <h1 className="text-center text-xl font-extrabold text-navy-900">Admin Console</h1>
        <p className="mt-1 text-center text-sm text-navy-500">Staff sign in</p>
        <div className="mt-6 space-y-3">
          <span className="flex items-center gap-2.5 rounded-2xl border border-navy-200 bg-navy-50/50 px-3.5 py-3 focus-within:border-navy-400">
            <Mail size={18} className="text-navy-400" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin email" className="w-full bg-transparent outline-none placeholder:text-navy-300" />
          </span>
          <span className="flex items-center gap-2.5 rounded-2xl border border-navy-200 bg-navy-50/50 px-3.5 py-3 focus-within:border-navy-400">
            <Lock size={18} className="text-navy-400" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent outline-none placeholder:text-navy-300" />
          </span>
          {error && <p className="rounded-xl bg-crimson-50 px-3 py-2 text-sm text-crimson-600">{error}</p>}
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Sign in
          </Button>
        </div>
      </form>
    </Centered>
  );
}

function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminAccount | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setAccounts(await adminListAccounts());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = accounts.filter((a) => {
    const q = query.trim().toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
  });

  const totalBalance = accounts.reduce((s, a) => s + a.availableBalance, 0);
  const feesPaid = accounts.filter((a) => a.feePaid).length;

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-navy-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <Logo className="h-6" />
            <span className="rounded-lg bg-navy-900 px-2 py-0.5 text-xs font-bold text-white">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={16} />} onClick={refresh}>
              Refresh
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<LogOut size={16} />} className="!text-crimson-600" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-5 py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Total users" value={String(accounts.length)} />
          <Stat label="Total balances" value={formatCurrency(totalBalance, { compact: true })} />
          <Stat label="Fees paid" value={`${feesPaid} / ${accounts.length}`} />
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-navy-100 bg-white px-4">
          <Search size={18} className="text-navy-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" className="w-full bg-transparent py-3 outline-none placeholder:text-navy-300" />
        </div>

        {error && <p className="rounded-xl bg-crimson-50 px-3 py-2 text-sm text-crimson-600">{error}</p>}

        <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50/60 text-xs uppercase tracking-wide text-navy-500">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold">Proc. fee</th>
                <th className="px-4 py-3 font-semibold">VAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-navy-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-navy-400">No users found</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.userId} onClick={() => setSelected(a)} className="cursor-pointer transition-colors hover:bg-navy-50/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy-900">{a.name || '—'}</div>
                      <div className="text-xs text-navy-400">{a.email}</div>
                    </td>
                    <td className="tabular px-4 py-3 font-bold text-navy-900">{formatCurrency(a.availableBalance)}</td>
                    <td className="tabular px-4 py-3 text-navy-600">{formatCurrency(a.processingFee)}</td>
                    <td className="tabular px-4 py-3 text-navy-600">{a.vatRate.toFixed(2)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <AdminUserSheet
        account={selected}
        onClose={() => setSelected(null)}
        onChanged={async () => {
          await refresh();
        }}
      />
    </div>
  );
}

function AdminUserSheet({
  account,
  onClose,
  onChanged,
}: {
  account: AdminAccount | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [balance, setBalance] = useState('');
  const [fee, setFee] = useState('');
  const [network, setNetwork] = useState('');
  const [vat, setVat] = useState('');
  const [offName, setOffName] = useState('');
  const [offEmail, setOffEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  // Add-transaction form
  const [txAmount, setTxAmount] = useState('');
  const [txDir, setTxDir] = useState<'in' | 'out'>('in');
  const [txParty, setTxParty] = useState('American Pride Bank');
  const [txNote, setTxNote] = useState('');

  useEffect(() => {
    if (account) {
      setBalance(String(account.availableBalance));
      setFee(String(account.processingFee));
      setNetwork(String(account.networkCharge));
      setVat(String(account.vatRate));
      setOffName(account.officerName || '');
      setOffEmail(account.officerEmail || '');
      setConfirmDelete(false);
      adminListClaims(account.userId).then(setClaims).catch(() => setClaims([]));
    }
  }, [account]);

  if (!account) return null;

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet open={!!account} onClose={onClose} title={account.name || account.email} description={account.email}>
      <div className="space-y-5">
        {/* Claim charges */}
        <div className="rounded-2xl border border-navy-100 p-4">
          <p className="text-sm font-bold text-navy-900">Claim charges</p>
          <p className="text-xs text-navy-400">Applied to every claim this user makes.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <label className="text-xs font-semibold text-navy-600">
              Processing ($)
              <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className={boxCls} />
            </label>
            <label className="text-xs font-semibold text-navy-600">
              Network ($)
              <input type="number" value={network} onChange={(e) => setNetwork(e.target.value)} className={boxCls} />
            </label>
            <label className="text-xs font-semibold text-navy-600">
              VAT (%)
              <input type="number" value={vat} onChange={(e) => setVat(e.target.value)} className={boxCls} />
            </label>
          </div>
          <Button
            size="sm"
            variant="outline"
            fullWidth
            className="mt-2"
            loading={busy}
            onClick={() =>
              run(() =>
                adminUpdateAccount(account.userId, {
                  processingFee: Number(fee),
                  networkCharge: Number(network),
                  vatRate: Number(vat),
                }),
              )
            }
          >
            Save charges
          </Button>
        </div>

        {/* Account officer */}
        <div className="rounded-2xl border border-navy-100 p-4">
          <p className="text-sm font-bold text-navy-900">Account officer</p>
          <p className="text-xs text-navy-400">Assigned manager shown to the user for complaints & correspondence.</p>
          <div className="mt-2 space-y-2">
            <input value={offName} onChange={(e) => setOffName(e.target.value)} placeholder="Officer name" className={boxCls} />
            <input value={offEmail} onChange={(e) => setOffEmail(e.target.value)} placeholder="Officer email" className={boxCls} />
          </div>
          <Button
            size="sm"
            variant="outline"
            fullWidth
            className="mt-2"
            loading={busy}
            onClick={() =>
              run(() =>
                adminUpdateAccount(account.userId, {
                  officerName: offName.trim() || 'Michael Brown',
                  officerEmail: offEmail.trim() || 'michael.brown@pridebankheloc.com',
                }),
              )
            }
          >
            Save officer
          </Button>
        </div>

        {/* Balance control */}
        <div className="rounded-2xl border border-navy-100 p-4">
          <p className="text-sm font-bold text-navy-900">Available balance</p>
          <div className="mt-2 flex items-end gap-2">
            <label className="flex-1 text-xs font-semibold text-navy-600">
              Set balance (USD)
              <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className={boxCls} />
            </label>
            <Button size="sm" variant="outline" loading={busy} onClick={() => run(() => adminUpdateAccount(account.userId, { availableBalance: Number(balance) }))}>
              Save
            </Button>
          </div>
        </div>

        {/* Add transaction */}
        <div className="rounded-2xl border border-navy-100 p-4">
          <p className="text-sm font-bold text-navy-900">Add transaction</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select value={txDir} onChange={(e) => setTxDir(e.target.value as 'in' | 'out')} className={boxCls}>
              <option value="in">Deposit (in)</option>
              <option value="out">Claim (out)</option>
            </select>
            <input type="number" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} placeholder="Amount" className={boxCls} />
            <input value={txParty} onChange={(e) => setTxParty(e.target.value)} placeholder={txDir === 'in' ? 'Source' : 'Destination'} className={boxCls} />
            <input value={txNote} onChange={(e) => setTxNote(e.target.value)} placeholder="Note (optional)" className={boxCls} />
          </div>
          <Button
            size="sm"
            fullWidth
            className="mt-2"
            loading={busy}
            disabled={!txAmount}
            onClick={() =>
              run(async () => {
                await adminAddClaim(account.userId, {
                  amount: Number(txAmount),
                  direction: txDir,
                  source: txDir === 'in' ? txParty : undefined,
                  destination: txDir === 'out' ? txParty : txParty,
                  note: txNote || undefined,
                });
                setTxAmount('');
                setTxNote('');
                adminListClaims(account.userId).then(setClaims).catch(() => {});
              })
            }
          >
            Add transaction
          </Button>
        </div>

        {/* Recent transactions */}
        <div>
          <p className="mb-2 text-sm font-bold text-navy-900">Transactions ({claims.length})</p>
          <ul className="space-y-1.5">
            {claims.slice(0, 8).map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl bg-navy-50/60 px-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-navy-800">
                    {c.direction === 'in' ? `Deposit · ${c.source ?? 'Bank'}` : c.destination}
                  </span>
                  <span className="text-xs text-navy-400">{formatDate(c.createdAt)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className={`tabular font-bold ${c.direction === 'in' ? 'text-emerald-600' : 'text-navy-900'}`}>
                    {c.direction === 'in' ? '+' : '−'}{formatCurrency(c.amount)}
                  </span>
                  <StatusBadge status={c.status} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-crimson-200 bg-crimson-50/40 p-4">
          <p className="text-sm font-bold text-crimson-700">Delete user</p>
          <p className="text-xs text-crimson-600/80">
            Permanently removes this user's login and all of their accounts and transactions. This cannot be undone.
          </p>
          {confirmDelete ? (
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="ghost" className="flex-1" disabled={busy} onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                fullWidth
                className="!bg-crimson-600 hover:!bg-crimson-700"
                loading={busy}
                onClick={() =>
                  run(async () => {
                    await adminDeleteUser(account.userId);
                    onClose();
                  })
                }
              >
                Yes, delete permanently
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              fullWidth
              leftIcon={<Trash2 size={16} />}
              className="mt-3 !border-crimson-300 !text-crimson-600"
              onClick={() => setConfirmDelete(true)}
            >
              Delete this user
            </Button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

const boxCls = 'mt-1 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm outline-none focus:border-navy-400';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-4">
      <p className="text-xs font-medium text-navy-400">{label}</p>
      <p className="tabular mt-0.5 text-2xl font-extrabold text-navy-900">{value}</p>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-navy-900 p-6">{children}</div>;
}

function Spinner() {
  return <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />;
}

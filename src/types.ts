export type ClaimStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';

export type ClaimMethod = 'bank' | 'wire' | 'card';

/** 'in' = incoming deposit/credit, 'out' = outgoing claim/withdrawal. */
export type TxDirection = 'in' | 'out';

export interface Claim {
  id: string;
  reference: string;
  amount: number;
  method: ClaimMethod;
  status: ClaimStatus;
  createdAt: string; // ISO date
  note?: string;
  destination: string;
  direction?: TxDirection;
  /** Originating institution for incoming deposits, e.g. "US Bank". */
  source?: string;
}

export interface Account {
  name: string;
  email: string;
  avatarInitials: string;
  memberSince: string;
  creditLimit: number;
  availableBalance: number;
  outstandingBalance: number;
  apr: number;
  property?: string;
  // Contact & KYC details captured at signup
  phone?: string;
  dob?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  ssnLast4?: string;
  employer?: string;
  annualIncome?: number;
  // Processing fee gate
  processingFee: number;
  feePaid: boolean;
}

export interface PayoutDestination {
  id: string;
  label: string;
  method: ClaimMethod;
  detail: string;
}

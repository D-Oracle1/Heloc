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
  /** Originating institution for incoming deposits, e.g. "American Pride Bank". */
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
  // Per-claim charges (admin-configurable)
  processingFee: number;
  networkCharge: number;
  vatRate: number; // percent of claim amount
  feePaid: boolean;
  // Payment methods the admin enabled for paying the charges (user picks one)
  feePaymentOptions: PaymentOption[];
  // Assigned account officer / manager (admin-set)
  officerName: string;
  officerEmail: string;
}

export interface PaymentOption {
  method: string;
  instructions?: string;
}

export interface PayoutDestination {
  id: string;
  label: string;
  method: ClaimMethod;
  detail: string;
}

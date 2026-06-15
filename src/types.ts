export type ClaimStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';

export type ClaimMethod = 'bank' | 'wire' | 'card';

export interface Claim {
  id: string;
  reference: string;
  amount: number;
  method: ClaimMethod;
  status: ClaimStatus;
  createdAt: string; // ISO date
  note?: string;
  destination: string;
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
  property: string;
}

export interface PayoutDestination {
  id: string;
  label: string;
  method: ClaimMethod;
  detail: string;
}

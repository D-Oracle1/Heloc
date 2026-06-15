import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Account, Claim, ClaimMethod, PayoutDestination } from '../types';

const STORAGE_KEY = 'heloc.state.v1';

const DEFAULT_ACCOUNT: Account = {
  name: 'Jordan Avery',
  email: 'jordan.avery@example.com',
  avatarInitials: 'JA',
  memberSince: '2021-03-14',
  creditLimit: 150000,
  availableBalance: 92450.75,
  outstandingBalance: 57549.25,
  apr: 7.85,
  property: '128 Maple Crest Ave, Austin, TX',
};

const DEFAULT_DESTINATIONS: PayoutDestination[] = [
  { id: 'dest-1', label: 'Chase Checking', method: 'bank', detail: '•••• 4821' },
  { id: 'dest-2', label: 'Wells Fargo Savings', method: 'bank', detail: '•••• 9034' },
  { id: 'dest-3', label: 'Wire Transfer', method: 'wire', detail: 'Intl. SWIFT' },
  { id: 'dest-4', label: 'Visa Debit', method: 'card', detail: '•••• 1290' },
];

const DEFAULT_CLAIMS: Claim[] = [
  {
    id: 'c-1007',
    reference: 'HE-2026-1007',
    amount: 5200,
    method: 'bank',
    status: 'completed',
    createdAt: '2026-06-02T14:21:00Z',
    destination: 'Chase Checking •••• 4821',
    note: 'Kitchen remodel deposit',
  },
  {
    id: 'c-1006',
    reference: 'HE-2026-1006',
    amount: 12000,
    method: 'wire',
    status: 'processing',
    createdAt: '2026-06-08T09:05:00Z',
    destination: 'Wire Transfer Intl. SWIFT',
    note: 'Contractor milestone',
  },
  {
    id: 'c-1005',
    reference: 'HE-2026-1005',
    amount: 850,
    method: 'card',
    status: 'completed',
    createdAt: '2026-05-21T17:48:00Z',
    destination: 'Visa Debit •••• 1290',
  },
  {
    id: 'c-1004',
    reference: 'HE-2026-1004',
    amount: 3000,
    method: 'bank',
    status: 'approved',
    createdAt: '2026-06-11T11:30:00Z',
    destination: 'Wells Fargo Savings •••• 9034',
    note: 'Emergency fund',
  },
  {
    id: 'c-1003',
    reference: 'HE-2026-1003',
    amount: 450,
    method: 'card',
    status: 'rejected',
    createdAt: '2026-05-09T08:12:00Z',
    destination: 'Visa Debit •••• 1290',
    note: 'Limit exceeded for method',
  },
];

interface PersistedState {
  account: Account;
  claims: Claim[];
  destinations: PayoutDestination[];
}

interface ClaimInput {
  amount: number;
  method: ClaimMethod;
  destinationId: string;
  note?: string;
}

interface AppStore extends PersistedState {
  submitClaim: (input: ClaimInput) => Claim;
  resetDemo: () => void;
  updateAccount: (patch: Partial<Account>) => void;
}

const AppStoreContext = createContext<AppStore | null>(null);

function loadState(): PersistedState {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed.account && parsed.claims && parsed.destinations) return parsed;
      }
    } catch {
      /* ignore corrupt state */
    }
  }
  return {
    account: DEFAULT_ACCOUNT,
    claims: DEFAULT_CLAIMS,
    destinations: DEFAULT_DESTINATIONS,
  };
}

let claimCounter = 1100;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable */
    }
  }, [state]);

  const submitClaim = useCallback((input: ClaimInput): Claim => {
    const destination = DEFAULT_DESTINATIONS.find((d) => d.id === input.destinationId);
    const ref = `HE-2026-${++claimCounter}`;
    const claim: Claim = {
      id: `c-${claimCounter}`,
      reference: ref,
      amount: input.amount,
      method: input.method,
      status: 'pending',
      createdAt: new Date().toISOString(),
      note: input.note,
      destination: destination ? `${destination.label} ${destination.detail}` : 'Linked account',
    };

    setState((prev) => ({
      ...prev,
      claims: [claim, ...prev.claims],
      account: {
        ...prev.account,
        availableBalance: Math.max(0, prev.account.availableBalance - input.amount),
        outstandingBalance: prev.account.outstandingBalance + input.amount,
      },
    }));

    return claim;
  }, []);

  const resetDemo = useCallback(() => {
    setState({
      account: DEFAULT_ACCOUNT,
      claims: DEFAULT_CLAIMS,
      destinations: DEFAULT_DESTINATIONS,
    });
  }, []);

  const updateAccount = useCallback((patch: Partial<Account>) => {
    setState((prev) => ({ ...prev, account: { ...prev.account, ...patch } }));
  }, []);

  const value = useMemo<AppStore>(
    () => ({ ...state, submitClaim, resetDemo, updateAccount }),
    [state, submitClaim, resetDemo, updateAccount],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

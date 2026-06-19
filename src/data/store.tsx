import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Account, Claim, PayoutDestination } from '../types';
import type { AccountType } from './banks';
import { isSupabaseEnabled } from './supabase';
import { fetchAppData, persistAccount, persistClaim } from './repository';
import { useAuth } from './auth';

const STORAGE_KEY = 'heloc.state.v1';

/** Neutral placeholder until the signed-in user's data loads. No demo identity. */
const EMPTY_ACCOUNT: Account = {
  name: '',
  email: '',
  avatarInitials: '',
  memberSince: new Date().toISOString().slice(0, 10),
  creditLimit: 0,
  availableBalance: 0,
  outstandingBalance: 0,
  apr: 0,
  processingFee: 5000,
  networkCharge: 150,
  vatRate: 3.076923,
  feePaid: false,
  feePaymentOptions: [{ method: 'card' }],
  officerName: 'Michael Brown',
  officerEmail: 'michael.brown@pridebankheloc.com',
};

interface PersistedState {
  account: Account;
  claims: Claim[];
  destinations: PayoutDestination[];
}

interface ClaimInput {
  amount: number;
  bankName: string;
  accountHolder: string;
  accountType: AccountType;
  note?: string;
}

interface AppStore extends PersistedState {
  /** False until the authenticated user's data has loaded (always true in demo mode). */
  ready: boolean;
  submitClaim: (input: ClaimInput) => Promise<Claim>;
  resetDemo: () => void;
  updateAccount: (patch: Partial<Account>) => void;
}

const AppStoreContext = createContext<AppStore | null>(null);

const EMPTY_STATE: PersistedState = {
  account: EMPTY_ACCOUNT,
  claims: [],
  destinations: [],
};

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
  return EMPTY_STATE;
}

let claimCounter = 1100;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const { session, demoMode } = useAuth();
  // In demo mode, hydrate from localStorage/defaults synchronously and stay ready.
  const [state, setState] = useState<PersistedState>(() => (demoMode ? loadState() : EMPTY_STATE));
  const [ready, setReady] = useState(demoMode);
  // Latest state for synchronous reads inside callbacks.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load the authenticated user's data; refetch whenever the user changes.
  useEffect(() => {
    if (demoMode || !isSupabaseEnabled) {
      setReady(true);
      return;
    }
    if (!session) {
      // Signed out: clear any in-memory and cached data.
      setState(EMPTY_STATE);
      setReady(false);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    let active = true;
    setReady(false);
    fetchAppData().then((remote) => {
      if (!active) return;
      if (remote) setState(remote);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [session, demoMode]);

  // Cache to localStorage in demo mode so the app loads instantly and works offline.
  useEffect(() => {
    if (!demoMode) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable */
    }
  }, [state, demoMode]);

  const submitClaim = useCallback(async (input: ClaimInput): Promise<Claim> => {
    const ref = `HE-${new Date().getFullYear()}-${++claimCounter}`;
    const claim: Claim = {
      id: `c-${claimCounter}-${Math.random().toString(36).slice(2, 7)}`,
      reference: ref,
      amount: input.amount,
      method: 'bank',
      status: 'processing',
      createdAt: new Date().toISOString(),
      note: input.note,
      destination: `${input.bankName} · ${input.accountHolder}`,
      direction: 'out',
    };

    const prevAccount = stateRef.current.account;
    const account: Account = {
      ...prevAccount,
      availableBalance: Math.max(0, prevAccount.availableBalance - input.amount),
      outstandingBalance: prevAccount.outstandingBalance + input.amount,
    };

    // Optimistic local update for instant feedback.
    setState((prev) => ({ ...prev, claims: [claim, ...prev.claims], account }));

    // Await persistence so a quick refresh can't cancel the write.
    try {
      await persistClaim(claim, account);
    } catch (e) {
      console.warn('[supabase] persistClaim failed:', e);
    }

    return claim;
  }, []);

  const resetDemo = useCallback(() => {
    // With Supabase, "reset" reloads the server's truth; otherwise clear local state.
    if (isSupabaseEnabled) {
      fetchAppData().then((remote) => {
        if (remote) setState(remote);
      });
      return;
    }
    setState(EMPTY_STATE);
  }, []);

  const updateAccount = useCallback((patch: Partial<Account>) => {
    setState((prev) => {
      const account = { ...prev.account, ...patch };
      persistAccount(account).catch((e) => console.warn('[supabase] persistAccount failed:', e));
      return { ...prev, account };
    });
  }, []);

  const value = useMemo<AppStore>(
    () => ({ ...state, ready, submitClaim, resetDemo, updateAccount }),
    [state, ready, submitClaim, resetDemo, updateAccount],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

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
import type { Account, Claim, ClaimMethod, PayoutDestination } from '../types';
import { isSupabaseEnabled } from './supabase';
import { fetchAppData, payProcessingFee, persistAccount, persistClaim } from './repository';
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
  processingFee: 500,
  feePaid: false,
};

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
  /** False until the authenticated user's data has loaded (always true in demo mode). */
  ready: boolean;
  submitClaim: (input: ClaimInput) => Claim;
  resetDemo: () => void;
  updateAccount: (patch: Partial<Account>) => void;
  /** Pay the processing fee that unlocks fund access. */
  payFee: () => void;
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
  // Latest destinations for synchronous lookups in submitClaim.
  const destinationsRef = useRef(state.destinations);
  destinationsRef.current = state.destinations;

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

  const submitClaim = useCallback((input: ClaimInput): Claim => {
    const destination = destinationsRef.current.find((d) => d.id === input.destinationId);
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

    setState((prev) => {
      const account: Account = {
        ...prev.account,
        availableBalance: Math.max(0, prev.account.availableBalance - input.amount),
        outstandingBalance: prev.account.outstandingBalance + input.amount,
      };
      // Persist in the background; local state is the source of truth for UI.
      persistClaim(claim, account).catch((e) => console.warn('[supabase] persistClaim failed:', e));
      return { ...prev, claims: [claim, ...prev.claims], account };
    });

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

  const payFee = useCallback(() => {
    setState((prev) => {
      payProcessingFee().catch((e) => console.warn('[supabase] payProcessingFee failed:', e));
      return { ...prev, account: { ...prev.account, feePaid: true } };
    });
  }, []);

  const updateAccount = useCallback((patch: Partial<Account>) => {
    setState((prev) => {
      const account = { ...prev.account, ...patch };
      persistAccount(account).catch((e) => console.warn('[supabase] persistAccount failed:', e));
      return { ...prev, account };
    });
  }, []);

  const value = useMemo<AppStore>(
    () => ({ ...state, ready, submitClaim, resetDemo, updateAccount, payFee }),
    [state, ready, submitClaim, resetDemo, updateAccount, payFee],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

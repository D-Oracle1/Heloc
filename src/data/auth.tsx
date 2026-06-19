import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseEnabled } from './supabase';

export interface SignUpProfile {
  fullName: string;
  phone?: string;
  dob?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  employer?: string;
  annualIncome?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  /** True once admin status has been resolved for the current session. */
  roleResolved: boolean;
  /** True when Supabase isn't configured — app runs in local demo mode. */
  demoMode: boolean;
  signUp: (email: string, password: string, profile: SignUpProfile) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseEnabled);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleResolved, setRoleResolved] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Resolve admin status whenever the user changes.
  useEffect(() => {
    if (!supabase || !session) {
      setIsAdmin(false);
      setRoleResolved(true);
      return;
    }
    let active = true;
    setRoleResolved(false);
    supabase.rpc('is_admin').then(({ data }) => {
      if (!active) return;
      setIsAdmin(data === true);
      setRoleResolved(true);
    });
    return () => {
      active = false;
    };
  }, [session]);

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      isAdmin,
      roleResolved,
      demoMode: !isSupabaseEnabled,
      async signUp(email, password, profile) {
        if (!supabase) throw new Error('Auth is not configured.');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: profile.fullName,
              phone: profile.phone ?? '',
              dob: profile.dob ?? '',
              address_street: profile.addressStreet ?? '',
              address_city: profile.addressCity ?? '',
              address_state: profile.addressState ?? '',
              address_zip: profile.addressZip ?? '',
              employer: profile.employer ?? '',
              annual_income: profile.annualIncome ?? '',
            },
          },
        });
        if (error) throw error;
        // When email confirmation is on, no session is returned.
        return { needsConfirmation: !data.session };
      },
      async signIn(email, password) {
        if (!supabase) throw new Error('Auth is not configured.');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [session, loading, isAdmin, roleResolved],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

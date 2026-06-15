import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when both env vars are present — i.e. the app can talk to Supabase. */
export const isSupabaseEnabled = Boolean(url && anonKey);

/**
 * Shared client, or null when not configured. When null the app runs in
 * offline/demo mode backed by localStorage (see src/data/store.tsx).
 */
export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

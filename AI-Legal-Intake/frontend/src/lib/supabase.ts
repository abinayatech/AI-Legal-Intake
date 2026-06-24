import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client.
 * Reads the SAME env vars your original repo used (VITE_SUPABASE_URL,
 * VITE_SUPABASE_ANON_KEY). Set them in Project Settings → Secrets.
 * If missing, we still export a client so the app boots; calls will fail
 * with a clear runtime error instead of crashing the bundle.
 */
export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  anonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const supabaseConfigured = Boolean(url && anonKey);
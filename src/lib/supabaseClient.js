import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const configured = Boolean(url && anonKey);

// A single client for the whole app. Supabase explicitly recommends against
// running more than one GoTrueClient in the same browser context — a
// previous version of this file created a second client (for a "tab-only"
// remember-me session) and the two clients raced over token refresh,
// intermittently leaving requests unauthenticated even right after a
// successful sign-in.
export const supabase = configured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage },
    })
  : null;

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const configured = Boolean(url && anonKey);

// Two clients so "Remember me" can genuinely choose between a persistent
// (localStorage) session and a tab-only (sessionStorage) session, rather
// than just being a decorative checkbox.
export const supabasePersist = configured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage },
    })
  : null;

export const supabaseSession = configured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storage: window.sessionStorage },
    })
  : null;

const REMEMBER_KEY = "smp_remember_me";

export function getPreferredClient() {
  const remember = localStorage.getItem(REMEMBER_KEY) !== "0";
  return remember ? supabasePersist : supabaseSession;
}

export function setRememberMe(remember) {
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

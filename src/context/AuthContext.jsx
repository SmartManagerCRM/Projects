import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { configured, supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

// The session itself always lives in localStorage (one client, per Supabase's
// own guidance). "Remember me" is layered on top with two small flags: a
// sessionStorage marker that only survives while the tab stays open, and a
// localStorage marker recorded at sign-in time. If the tab was closed and
// reopened (sessionStorage marker gone) after an "unchecked" sign-in
// (localStorage marker says ephemeral), we sign out on boot before anything
// else runs — giving a real "forget me after this browser session" without
// running two competing Supabase clients.
const EPHEMERAL_KEY = "smp_ephemeral_login";
const TAB_ALIVE_KEY = "smp_tab_alive";

export function markLoginPersistence(remember) {
  localStorage.setItem(EPHEMERAL_KEY, remember ? "0" : "1");
  sessionStorage.setItem(TAB_ALIVE_KEY, "1");
}

async function enforceRememberMe() {
  if (localStorage.getItem(EPHEMERAL_KEY) === "1" && !sessionStorage.getItem(TAB_ALIVE_KEY)) {
    localStorage.removeItem(EPHEMERAL_KEY);
    await supabase.auth.signOut();
  }
  sessionStorage.setItem(TAB_ALIVE_KEY, "1");
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    enforceRememberMe().then(() =>
      supabase.auth.getSession().then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setLoading(false);
      })
    );
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      configured,
      supabase,
      session,
      user: session?.user || null,
      loading,
      async signUp({ email, password, fullName, phone, companyName, companyType, country }) {
        return supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || "",
              company_name: companyName || "",
              company_type: companyType || "",
              country: country || "",
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
      },
      async signIn({ email, password, remember = true }) {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (!result.error) markLoginPersistence(remember);
        return result;
      },
      async resendVerification(email) {
        return supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${window.location.origin}/` } });
      },
      async requestPasswordReset(email) {
        return supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      },
      async updatePassword(password) {
        return supabase.auth.updateUser({ password });
      },
      async signOut() {
        localStorage.removeItem(EPHEMERAL_KEY);
        sessionStorage.removeItem(TAB_ALIVE_KEY);
        return supabase.auth.signOut();
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

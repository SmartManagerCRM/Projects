import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { configured, getPreferredClient, setRememberMe, supabasePersist } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [client, setClient] = useState(() => getPreferredClient() || supabasePersist);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }
    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [client]);

  const value = useMemo(
    () => ({
      configured,
      supabase: client,
      session,
      user: session?.user || null,
      loading,
      async signUp({ email, password, fullName, phone, companyName, companyType, country }) {
        return client.auth.signUp({
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
      async signIn({ email, password, remember }) {
        setRememberMe(remember);
        const target = getPreferredClient();
        const result = await target.auth.signInWithPassword({ email, password });
        if (!result.error) setClient(target);
        return result;
      },
      async resendVerification(email) {
        return client.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${window.location.origin}/` } });
      },
      async requestPasswordReset(email) {
        return client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      },
      async updatePassword(password) {
        return client.auth.updateUser({ password });
      },
      async signOut() {
        return client.auth.signOut();
      },
    }),
    [client, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

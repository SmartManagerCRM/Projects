import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button, Field, inputCls, useToast } from "../../components/ui.jsx";

export default function Login() {
  const { signIn, configured } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn({ email, password, remember });
    setLoading(false);
    if (err) {
      setError(err.message === "Email not confirmed" ? "Please verify your email before signing in." : err.message);
      return;
    }
    push("Welcome back.", "success");
    navigate(location.state?.from || "/app", { replace: true });
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink-900">Sign in</h1>
      <p className="mt-1.5 text-sm text-ink-500">Welcome back. Enter your details to access your workspace.</p>

      {!configured && (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          Supabase isn't configured yet. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your
          <code> .env</code> file — see the README.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Email">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@company.com" />
        </Field>
        <Field label="Password">
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
        </Field>

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-600">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-ink-300" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-navy-800 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={loading || !configured} className="w-full" size="lg">
          <LogIn size={16} /> {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-navy-800 hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}

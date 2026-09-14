import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthLayout from "./AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button, Field, inputCls } from "../../components/ui.jsx";

export default function ForgotPassword() {
  const { requestPasswordReset, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await requestPasswordReset(email);
    setLoading(false);
    if (err) return setError(err.message);
    setSent(true);
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink-900">Reset your password</h1>
      <p className="mt-1.5 text-sm text-ink-500">We'll email you a secure link to set a new password.</p>

      {sent ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Check your inbox</p>
            <p className="mt-1 text-emerald-700/90">
              If an account exists for <span className="font-medium">{email}</span>, a password reset link is on its way.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Email" required>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@company.com" />
          </Field>
          {error && (
            <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}
          <Button type="submit" disabled={loading || !configured} className="w-full" size="lg">
            <Mail size={16} /> {loading ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-500">
        <Link to="/login" className="font-semibold text-navy-800 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

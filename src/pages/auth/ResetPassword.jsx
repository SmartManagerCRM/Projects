import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button, Field, inputCls, useToast } from "../../components/ui.jsx";

export default function ResetPassword() {
  const { updatePassword, session } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    const { error: err } = await updatePassword(password);
    setLoading(false);
    if (err) return setError(err.message);
    push("Password updated. You're all set.", "success");
    navigate("/app", { replace: true });
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-ink-900">Set a new password</h1>
      <p className="mt-1.5 text-sm text-ink-500">
        {session ? "Choose a new password for your account." : "Open the reset link from your email to continue on this device."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="New Password" required hint="At least 8 characters.">
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} disabled={!session} />
        </Field>
        <Field label="Confirm New Password" required>
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} disabled={!session} />
        </Field>
        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}
        <Button type="submit" disabled={loading || !session} className="w-full" size="lg">
          <KeyRound size={16} /> {loading ? "Updating…" : "Update Password"}
        </Button>
      </form>
    </AuthLayout>
  );
}

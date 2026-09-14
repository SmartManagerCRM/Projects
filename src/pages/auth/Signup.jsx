import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button, Field, inputCls } from "../../components/ui.jsx";
import { COMPANY_TYPES, COUNTRIES } from "../../lib/constants.js";

export default function Signup() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phone: "",
    country: COUNTRIES[0],
    companyType: COMPANY_TYPES[0].value,
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!form.agree) return setError("Please accept the Terms & Conditions to continue.");

    setLoading(true);
    const { data, error: err } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
      companyName: form.companyName,
      companyType: form.companyType,
      country: form.country,
    });
    setLoading(false);
    if (err) return setError(err.message);

    if (data.session) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/verify-email", { state: { email: form.email }, replace: true });
    }
  }

  return (
    <AuthLayout wide>
      <h1 className="text-2xl font-bold text-ink-900">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-500">Set up your company workspace on SmartManager Projects.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company Name" required>
            <input required value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className={inputCls} placeholder="Horizon Contracting Co." />
          </Field>
          <Field label="Full Name" required>
            <input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputCls} placeholder="Ahmed Al-Fahad" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Work Email" required>
            <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} placeholder="you@company.com" />
          </Field>
          <Field label="Phone Number">
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} placeholder="+966 5xx xxx xxx" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country" required>
            <select value={form.country} onChange={(e) => update("country", e.target.value)} className={inputCls}>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Company Type" required>
            <select value={form.companyType} onChange={(e) => update("companyType", e.target.value)} className={inputCls}>
              {COMPANY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" required hint="At least 8 characters.">
            <input type="password" required value={form.password} onChange={(e) => update("password", e.target.value)} className={inputCls} placeholder="••••••••" />
          </Field>
          <Field label="Confirm Password" required>
            <input type="password" required value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className={inputCls} placeholder="••••••••" />
          </Field>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-ink-600">
          <input type="checkbox" checked={form.agree} onChange={(e) => update("agree", e.target.checked)} className="mt-0.5 rounded border-ink-300" />
          I agree to the <span className="font-semibold text-navy-800">Terms &amp; Conditions</span>
        </label>

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}

        <Button type="submit" disabled={loading || !configured} className="w-full" size="lg">
          <UserPlus size={16} /> {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-navy-800 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

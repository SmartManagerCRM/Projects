import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MailCheck, RefreshCw } from "lucide-react";
import AuthLayout from "./AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button, useToast } from "../../components/ui.jsx";

export default function VerifyEmail() {
  const { resendVerification } = useAuth();
  const { push } = useToast();
  const location = useLocation();
  const email = location.state?.email;
  const [sending, setSending] = useState(false);

  async function handleResend() {
    if (!email) return;
    setSending(true);
    const { error } = await resendVerification(email);
    setSending(false);
    push(error ? error.message : "Verification email re-sent.", error ? "error" : "success");
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-navy-900/5 p-4 text-navy-800">
          <MailCheck size={30} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-ink-900">Verify your email</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          We've sent a verification link to {email ? <span className="font-semibold text-ink-800">{email}</span> : "your inbox"}. Click
          it to activate your account, then sign in to continue setup.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <Button onClick={handleResend} variant="outline" disabled={sending || !email} className="w-full">
            <RefreshCw size={15} className={sending ? "animate-spin" : ""} /> Resend verification email
          </Button>
          <Link to="/login">
            <Button className="w-full">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

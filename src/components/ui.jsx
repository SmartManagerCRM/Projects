import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

/* ---------------------------------- Toasts --------------------------------- */

const ToastContext = createContext(null);

const TOAST_ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const TOAST_STYLE = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-navy-200 bg-white text-ink-900",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info", timeout = 4200) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      if (timeout) setTimeout(() => dismiss(id), timeout);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((t) => {
          const Icon = TOAST_ICON[t.type] || Info;
          return (
            <div
              key={t.id}
              className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-panel animate-[fadeIn_.15s_ease-out] ${TOAST_STYLE[t.type]}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm leading-snug">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-current/60 hover:text-current">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ------------------------------- Basic atoms -------------------------------- */

export function Button({ as: As = "button", variant = "primary", size = "md", className = "", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const sizes = { sm: "text-xs px-3 py-1.5", md: "text-sm px-4 py-2.5", lg: "text-[15px] px-5 py-3" };
  const variants = {
    primary: "bg-navy-900 text-white hover:bg-navy-800",
    gold: "bg-gold-500 text-navy-950 hover:bg-gold-400",
    outline: "border border-ink-200 text-ink-900 bg-white hover:bg-ink-50",
    ghost: "text-ink-700 hover:bg-ink-100",
    danger: "bg-red-600 text-white hover:bg-red-500",
    subtle: "bg-navy-50 text-navy-900 hover:bg-navy-100",
  };
  return (
    <As className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </As>
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`rounded-2xl border border-ink-100 bg-white shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Badge({ tone = "default", className = "", children }) {
  const tones = {
    default: "bg-ink-100 text-ink-700",
    navy: "bg-navy-900 text-white",
    gold: "bg-gold-500/15 text-gold-600",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    slate: "bg-slate-100 text-slate-600",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}>{children}</span>;
}

export function StatCard({ icon: Icon, label, value, sub, tone = "navy", accent }) {
  const tones = {
    navy: "bg-navy-900 text-white",
    gold: "bg-gold-500 text-navy-950",
    white: "bg-white text-ink-900 border border-ink-100",
  };
  return (
    <Card className={`p-5 ${tones[tone]} border-0`}>
      <div className="flex items-start justify-between">
        <p className={`text-xs font-medium uppercase tracking-wide ${tone === "white" ? "text-ink-500" : "text-white/70"}`}>{label}</p>
        {Icon && (
          <div className={`rounded-lg p-2 ${tone === "white" ? "bg-navy-50 text-navy-800" : "bg-white/10"}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className={`mt-1 text-xs ${tone === "white" ? "text-ink-500" : "text-white/60"}`}>{sub}</p>}
      {accent}
    </Card>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-3 rounded-full bg-navy-900/5 p-3 text-navy-800">
          <Icon size={22} />
        </div>
      )}
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ComingSoon({ icon: Icon, title, description, previewStats }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-ink-100 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-6 py-10 text-white">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="rounded-xl bg-white/10 p-2.5">
              <Icon size={22} />
            </div>
          )}
          <div>
            <Badge tone="gold">Interactive demonstration</Badge>
            <h2 className="mt-2 text-xl font-bold">{title}</h2>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-white/70">{description}</p>
      </div>
      {previewStats && (
        <div className="grid grid-cols-2 gap-px bg-ink-100 sm:grid-cols-4">
          {previewStats.map((s) => (
            <div key={s.label} className="bg-white px-5 py-4">
              <p className="text-xl font-bold text-ink-900">{s.value}</p>
              <p className="mt-0.5 text-xs text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-ink-100 ${className}`} />;
}

export function FullPageSpinner({ label = "Loading SmartManager Projects…" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-navy-950 text-white">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-gold-500" />
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-panel`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4">
          <h3 className="text-base font-bold text-ink-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="sticky bottom-0 flex justify-end gap-2 border-t border-ink-100 bg-white px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", description, confirmLabel = "Confirm", danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </>
    }>
      <p className="text-sm text-ink-600">{description}</p>
    </Modal>
  );
}

export function Field({ label, required, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/10 disabled:bg-ink-50";

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-ink-200">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors ${
            active === t.key ? "text-navy-900" : "text-ink-400 hover:text-ink-700"
          }`}
        >
          {t.icon && <t.icon size={15} />}
          {t.label}
          {active === t.key && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gold-500" />}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, tone = "navy", height = "h-2" }) {
  const tones = { navy: "bg-navy-800", gold: "bg-gold-500", green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500" };
  return (
    <div className={`w-full overflow-hidden rounded-full bg-ink-100 ${height}`}>
      <div className={`${height} rounded-full ${tones[tone]} transition-all`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-600 ring-1 ring-inset ring-gold-500/30">
      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" /> Demo Environment
    </span>
  );
}

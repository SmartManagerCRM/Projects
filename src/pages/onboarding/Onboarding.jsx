import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Sparkles, Building2, ListChecks, FolderKanban } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Button, Field, inputCls, useToast } from "../../components/ui.jsx";
import { COMPANY_TYPES, COUNTRIES, EMPLOYEE_RANGES, MODULES, PROJECT_TYPES, CURRENCIES } from "../../lib/constants.js";
import logoMark from "../../assets/logoMark.js";

const STEPS = ["Welcome", "Your Company", "What to Manage", "First Project"];

export default function Onboarding() {
  const { user } = useAuth();
  const { bootstrapCompany } = useCompany();
  const { push } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({
    name: user?.user_metadata?.company_name || "",
    country: user?.user_metadata?.country || COUNTRIES[0],
    city: "",
    company_type: user?.user_metadata?.company_type || COMPANY_TYPES[0].value,
    employees_range: EMPLOYEE_RANGES[0],
    currency: "SAR",
  });
  const [modules, setModules] = useState(MODULES.map((m) => m.key));
  const [project, setProject] = useState({
    name: "",
    project_type: PROJECT_TYPES[0],
    client: "",
    location: companyInfo.city ? `${companyInfo.city}, ${companyInfo.country}` : companyInfo.country,
    contract_value: "",
    start_date: "",
    planned_completion_date: "",
    project_manager: user?.user_metadata?.full_name || "",
  });

  function toggleModule(key) {
    setModules((prev) => (prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]));
  }

  async function finish() {
    setSubmitting(true);
    try {
      await bootstrapCompany({ companyInfo, modules, project });
      push("Your workspace is ready.", "success");
      navigate("/app", { replace: true });
    } catch (e) {
      push(e.message || "Something went wrong setting up your workspace.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div dangerouslySetInnerHTML={{ __html: logoMark }} className="h-9 w-9" />
          <p className="text-sm font-bold text-white">SmartManager Projects</p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  i < step ? "bg-emerald-500 text-white" : i === step ? "bg-gold-500 text-navy-950" : "bg-white/10 text-white/40"
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? "bg-emerald-500" : "bg-white/15"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
                <Sparkles size={26} />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-ink-900">Welcome to SmartManager Projects</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm text-ink-500">
                In a few steps we'll set up your company workspace and your first project — so you can see the platform
                the way your team will use it.
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <StepHeader icon={Building2} title="Tell us about your company" subtitle="This appears across your reports and dashboards." />
              <div className="mt-6 space-y-4">
                <Field label="Company Name" required>
                  <input value={companyInfo.name} onChange={(e) => setCompanyInfo((c) => ({ ...c, name: e.target.value }))} className={inputCls} required />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Country" required>
                    <select value={companyInfo.country} onChange={(e) => setCompanyInfo((c) => ({ ...c, country: e.target.value }))} className={inputCls}>
                      {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="City">
                    <input value={companyInfo.city} onChange={(e) => setCompanyInfo((c) => ({ ...c, city: e.target.value }))} className={inputCls} placeholder="Jeddah" />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Company Type" required>
                    <select value={companyInfo.company_type} onChange={(e) => setCompanyInfo((c) => ({ ...c, company_type: e.target.value }))} className={inputCls}>
                      {COMPANY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Number of Employees">
                    <select value={companyInfo.employees_range} onChange={(e) => setCompanyInfo((c) => ({ ...c, employees_range: e.target.value }))} className={inputCls}>
                      {EMPLOYEE_RANGES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Default Currency">
                  <select value={companyInfo.currency} onChange={(e) => setCompanyInfo((c) => ({ ...c, currency: e.target.value }))} className={inputCls}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <StepHeader icon={ListChecks} title="What do you want to manage?" subtitle="You can change this anytime in Company Settings." />
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {MODULES.map((m) => (
                  <label
                    key={m.key}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-3 text-sm font-medium transition-colors ${
                      modules.includes(m.key) ? "border-navy-800 bg-navy-50 text-navy-900" : "border-ink-200 text-ink-500 hover:border-ink-300"
                    }`}
                  >
                    <input type="checkbox" className="rounded border-ink-300" checked={modules.includes(m.key)} onChange={() => toggleModule(m.key)} />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <StepHeader icon={FolderKanban} title="Create your first project" subtitle="You can add the rest of your portfolio right after." />
              <div className="mt-6 space-y-4">
                <Field label="Project Name" required>
                  <input value={project.name} onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Al Salam Residential Development" required />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Project Type">
                    <select value={project.project_type} onChange={(e) => setProject((p) => ({ ...p, project_type: e.target.value }))} className={inputCls}>
                      {PROJECT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Client">
                    <input value={project.client} onChange={(e) => setProject((p) => ({ ...p, client: e.target.value }))} className={inputCls} placeholder="Al Salam Real Estate" />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Location">
                    <input value={project.location} onChange={(e) => setProject((p) => ({ ...p, location: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label={`Contract Value (${companyInfo.currency})`}>
                    <input type="number" min="0" value={project.contract_value} onChange={(e) => setProject((p) => ({ ...p, contract_value: e.target.value }))} className={inputCls} placeholder="18500000" />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Start Date">
                    <input type="date" value={project.start_date} onChange={(e) => setProject((p) => ({ ...p, start_date: e.target.value }))} className={inputCls} />
                  </Field>
                  <Field label="Planned Completion Date">
                    <input type="date" value={project.planned_completion_date} onChange={(e) => setProject((p) => ({ ...p, planned_completion_date: e.target.value }))} className={inputCls} />
                  </Field>
                </div>
                <Field label="Project Manager">
                  <input value={project.project_manager} onChange={(e) => setProject((p) => ({ ...p, project_manager: e.target.value }))} className={inputCls} />
                </Field>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-5">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft size={15} /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !companyInfo.name}>
                Continue <ArrowRight size={15} />
              </Button>
            ) : (
              <Button onClick={finish} disabled={submitting || !project.name} variant="gold">
                {submitting ? "Setting up…" : "Enter SmartManager Projects"} <ArrowRight size={15} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-navy-900/5 p-2.5 text-navy-800">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-ink-900">{title}</h2>
        <p className="text-sm text-ink-500">{subtitle}</p>
      </div>
    </div>
  );
}

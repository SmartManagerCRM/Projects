import { useEffect, useState } from "react";
import { Building2, Save, Users, ShieldCheck, Bell, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Badge, Button, Card, Field, inputCls, PageHeader, useToast } from "../../components/ui.jsx";
import { COMPANY_TYPES, COUNTRIES, CURRENCIES, MEMBER_ROLES, MEMBER_ROLE_LABEL, MODULES, ROLE_PERMISSIONS } from "../../lib/constants.js";
import { initials } from "../../lib/format.js";

const NOTIF_KEY = "smp_notification_prefs";
const NOTIF_DEFAULTS = { rfiOverdue: true, approvalPending: true, projectDelay: true, budgetThreshold: true, dailyReport: false };

export default function CompanySettings() {
  const { supabase } = useAuth();
  const { company, role, refreshCompany } = useCompany();
  const { push } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState(null);
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      return { ...NOTIF_DEFAULTS, ...JSON.parse(localStorage.getItem(NOTIF_KEY) || "{}") };
    } catch {
      return NOTIF_DEFAULTS;
    }
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || "",
        company_type: company.company_type || COMPANY_TYPES[0].value,
        country: company.country || COUNTRIES[0],
        city: company.city || "",
        phone: company.phone || "",
        email: company.email || "",
        tax_number: company.tax_number || "",
        currency: company.currency || "SAR",
        logo_url: company.logo_url || "",
        modules: company.modules || [],
      });
    }
  }, [company]);

  useEffect(() => {
    if (!company) return;
    supabase
      .from("company_members")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at")
      .then(({ data }) => setMembers(data || []));
  }, [supabase, company]);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleModule(key) {
    setForm((f) => ({ ...f, modules: f.modules.includes(key) ? f.modules.filter((m) => m !== key) : [...f.modules, key] }));
  }

  function handleLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("logo_url", reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("companies").update(form).eq("id", company.id);
    setSaving(false);
    if (error) return push(error.message, "error");
    push("Company settings updated.", "success");
    refreshCompany();
  }

  async function updateMemberRole(id, newRole) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    const { error } = await supabase.from("company_members").update({ role: newRole }).eq("id", id);
    if (error) push(error.message, "error");
  }

  function toggleNotif(key) {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  }

  if (!form) return null;

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Company Settings" subtitle="Manage your company profile, team, roles and preferences." />

      <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-ink-900"><Building2 size={16} /> Company Information</p>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
                  {form.logo_url ? <img src={form.logo_url} alt="Logo" className="h-full w-full object-cover" /> : <ImageIcon size={22} className="text-ink-300" />}
                </div>
                <label className="cursor-pointer rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-50">
                  Change Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </label>
              </div>

              <Field label="Company Name">
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Country">
                  <select value={form.country} onChange={(e) => update("country", e.target.value)} className={inputCls}>
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="City">
                  <input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone">
                  <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Email">
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tax / VAT Number">
                  <input value={form.tax_number} onChange={(e) => update("tax_number", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Default Currency">
                  <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className={inputCls}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-ink-700">Active Modules</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MODULES.map((m) => (
                    <label key={m.key} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium ${form.modules.includes(m.key) ? "border-navy-800 bg-navy-50 text-navy-900" : "border-ink-200 text-ink-500"}`}>
                      <input type="checkbox" checked={form.modules.includes(m.key)} onChange={() => toggleModule(m.key)} className="rounded border-ink-300" />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-ink-900"><Users size={16} /> Users</p>
            <div className="mt-3 space-y-2">
              {members === null && <p className="text-sm text-ink-400">Loading…</p>}
              {members?.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border border-ink-100 px-3.5 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white">{initials(m.full_name || m.email)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{m.full_name || m.email}</p>
                    <p className="truncate text-xs text-ink-400">{m.email}</p>
                  </div>
                  <select value={m.role} onChange={(e) => updateMemberRole(m.id, e.target.value)} className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs">
                    {MEMBER_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-ink-900"><ShieldCheck size={16} /> Roles &amp; Permissions</p>
            <div className="mt-3 space-y-3">
              {Object.entries(ROLE_PERMISSIONS)
                .filter(([key]) => key !== "super_admin")
                .map(([key, r]) => (
                  <div key={key} className="rounded-lg border border-ink-100 p-3">
                    <p className="text-sm font-semibold text-ink-900">{r.label}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {r.perms.map((p) => (
                        <Badge key={p} tone="slate">{p}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-ink-900"><Bell size={16} /> Notification Settings</p>
            <div className="mt-3 space-y-1">
              {[
                ["rfiOverdue", "RFI overdue"],
                ["approvalPending", "Approval pending"],
                ["projectDelay", "Project delay detected"],
                ["budgetThreshold", "Budget threshold reached"],
                ["dailyReport", "Daily report generated"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-ink-700 hover:bg-ink-50">
                  {label}
                  <input type="checkbox" checked={notifPrefs[key]} onChange={() => toggleNotif(key)} className="rounded border-ink-300" />
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-bold text-ink-900">Your Role</p>
            <p className="mt-1 text-xs text-ink-500">Your access level in this workspace.</p>
            <Badge tone="navy" className="mt-3">{MEMBER_ROLE_LABEL[role] || role}</Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}

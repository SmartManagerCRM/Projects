import { useEffect, useState } from "react";
import { Zap, ArrowRight, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Badge, Card, EmptyState, PageHeader, Skeleton, useToast } from "../../components/ui.jsx";

export default function AutomationCenter() {
  const { supabase } = useAuth();
  const { company } = useCompany();
  const { push } = useToast();
  const [rows, setRows] = useState(null);

  async function load() {
    if (!company) return;
    const { data } = await supabase.from("automations").select("*").eq("company_id", company.id).order("created_at");
    setRows(data || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id]);

  async function toggle(row) {
    const next = !row.enabled;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, enabled: next } : r)));
    const { error } = await supabase.from("automations").update({ enabled: next }).eq("id", row.id);
    if (error) {
      push(error.message, "error");
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, enabled: row.enabled } : r)));
      return;
    }
    push(`${row.name} ${next ? "enabled" : "disabled"}.`, next ? "success" : "info");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Business Automation"
        title="Automation Center"
        subtitle="Automate repetitive project-management work."
      />

      {rows === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={Zap} title="No automations configured" description="Automations are created automatically when your workspace is set up." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <Card key={r.id} className={`p-5 transition ${r.enabled ? "" : "opacity-70"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2.5 ${r.enabled ? "bg-navy-900 text-gold-400" : "bg-ink-100 text-ink-400"}`}>
                    <Zap size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-900">{r.name}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{r.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(r)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${r.enabled ? "bg-emerald-500" : "bg-ink-200"}`}
                  aria-label="Toggle automation"
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${r.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div className="mt-4 space-y-2 rounded-lg bg-ink-50 p-3 text-xs">
                <p className="flex items-start gap-1.5 text-ink-600">
                  <span className="font-semibold text-ink-800">Trigger:</span> {r.trigger_text}
                </p>
                <p className="flex items-start gap-1.5 text-ink-600">
                  <ArrowRight size={12} className="mt-0.5 shrink-0" /> <span className="font-semibold text-ink-800">Action:</span> {r.action_text}
                </p>
                <p className="flex items-center gap-1.5 text-ink-600">
                  <Users size={12} /> <span className="font-semibold text-ink-800">Recipients:</span> {r.recipients}
                </p>
              </div>

              <div className="mt-3">
                <Badge tone={r.enabled ? "green" : "slate"}>{r.enabled ? "Active" : "Paused"}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

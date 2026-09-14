import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Wallet,
  TrendingUp,
  Gauge,
  AlarmClockOff,
  FileQuestion,
  ClipboardCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Button, Card, EmptyState, Modal, PageHeader, StatCard, useToast } from "../../components/ui.jsx";
import { HEALTH_META } from "../../lib/constants.js";
import { formatMoney, formatPercent } from "../../lib/format.js";
import { loadDemoData } from "../../lib/demoData.js";
import ProjectCard from "../projects/ProjectCard.jsx";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function Dashboard() {
  const { user, supabase } = useAuth();
  const { company, projects, refreshProjects, refreshNotifications } = useCompany();
  const { push } = useToast();
  const [counts, setCounts] = useState({ rfis: 0, approvals: 0, risks: 0, delayed: 0 });
  const [seeding, setSeeding] = useState(false);
  const [healthModal, setHealthModal] = useState(null);

  const projectIds = useMemo(() => projects.map((p) => p.id), [projects]);

  useEffect(() => {
    if (projectIds.length === 0) {
      setCounts({ rfis: 0, approvals: 0, risks: 0, delayed: 0 });
      return;
    }
    (async () => {
      const [{ count: rfis }, { count: approvals }, { count: risks }] = await Promise.all([
        supabase.from("rfis").select("id", { count: "exact", head: true }).in("project_id", projectIds).in("status", ["open", "overdue"]),
        supabase.from("approvals").select("id", { count: "exact", head: true }).in("project_id", projectIds).eq("status", "pending"),
        supabase.from("risks").select("id", { count: "exact", head: true }).in("project_id", projectIds).eq("status", "open").in("probability", ["high", "medium"]).eq("impact", "high"),
      ]);
      const delayed = projects.filter((p) => Number(p.progress) < Number(p.planned_progress)).length;
      setCounts({ rfis: rfis || 0, approvals: approvals || 0, risks: risks || 0, delayed });
    })();
  }, [projectIds, projects, supabase]);

  const kpis = useMemo(() => {
    const active = projects.filter((p) => p.status === "active");
    const totalValue = projects.reduce((s, p) => s + Number(p.contract_value || 0), 0);
    const avgProgress = projects.length ? projects.reduce((s, p) => s + Number(p.progress || 0), 0) / projects.length : 0;
    const avgBudget = projects.length ? projects.reduce((s, p) => s + Number(p.budget_utilization || 0), 0) / projects.length : 0;
    return { active: active.length, totalValue, avgProgress, avgBudget };
  }, [projects]);

  const healthSummary = useMemo(() => {
    const dims = ["schedule_health", "cost_health", "quality_health", "procurement_health", "safety_health"];
    return dims.map((dim) => {
      const worst = projects.some((p) => p[dim] === "at_risk") ? "at_risk" : projects.some((p) => p[dim] === "attention") ? "attention" : "on_track";
      return { dim, status: worst };
    });
  }, [projects]);

  const currency = company?.currency || "SAR";

  async function handleLoadDemo() {
    setSeeding(true);
    try {
      await loadDemoData(supabase, company, user.id);
      await refreshProjects();
      await refreshNotifications();
      push("Demo data loaded — your workspace now reflects a live multi-project portfolio.", "success");
    } catch (e) {
      push(e.message || "Couldn't load demo data.", "error");
    } finally {
      setSeeding(false);
    }
  }

  const dimLabel = { schedule_health: "Schedule", cost_health: "Cost", quality_health: "Quality", procurement_health: "Procurement", safety_health: "Safety" };

  return (
    <div>
      <PageHeader
        eyebrow="Executive Dashboard"
        title={`${greeting()}, ${(user?.user_metadata?.full_name || "there").split(" ")[0]}`}
        subtitle="Here's what's happening across your projects."
        actions={
          !company?.demo_seeded && (
            <Button variant="gold" onClick={handleLoadDemo} disabled={seeding}>
              <Sparkles size={16} /> {seeding ? "Loading demo data…" : "Load Demo Data"}
            </Button>
          )
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Your portfolio is empty"
          description="Load a realistic demo portfolio to explore SmartManager Projects end-to-end, or add your first real project."
          action={
            <div className="flex justify-center gap-2">
              <Button variant="gold" onClick={handleLoadDemo} disabled={seeding}>
                <Sparkles size={15} /> {seeding ? "Loading…" : "Load Demo Data"}
              </Button>
              <Link to="/app/projects">
                <Button variant="outline">Add a Project</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Building2} label="Active Projects" value={kpis.active} tone="navy" />
            <StatCard icon={Wallet} label="Total Contract Value" value={formatMoney(kpis.totalValue, currency, { compact: true })} tone="navy" />
            <StatCard icon={TrendingUp} label="Portfolio Progress" value={formatPercent(kpis.avgProgress)} tone="white" />
            <StatCard icon={Gauge} label="Budget Utilization" value={formatPercent(kpis.avgBudget)} tone="white" />
            <StatCard icon={AlarmClockOff} label="Delayed Activities" value={counts.delayed} tone="white" />
            <StatCard icon={FileQuestion} label="Pending RFIs" value={counts.rfis} tone="white" />
            <StatCard icon={ClipboardCheck} label="Pending Approvals" value={counts.approvals} tone="white" />
            <StatCard icon={ShieldAlert} label="Critical Risks" value={counts.risks} tone="white" />
          </div>

          <Card className="mt-6 p-5">
            <p className="text-sm font-bold text-ink-900">Project Health</p>
            <p className="mt-0.5 text-xs text-ink-500">Portfolio-wide status — click a dimension for the project-by-project breakdown.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {healthSummary.map(({ dim, status }) => {
                const meta = HEALTH_META[status];
                return (
                  <button
                    key={dim}
                    onClick={() => setHealthModal(dim)}
                    className={`rounded-xl border px-3.5 py-3.5 text-left transition hover:shadow-card ${meta.bg} border-transparent ring-1 ${meta.ring}`}
                  >
                    <p className="text-xs font-semibold text-ink-500">{dimLabel[dim]}</p>
                    <p className={`mt-1.5 flex items-center gap-1.5 text-sm font-bold ${meta.text}`}>
                      <span className={`h-2 w-2 rounded-full ${meta.dot}`} /> {meta.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm font-bold text-ink-900">Project Portfolio</p>
            <Link to="/app/projects" className="flex items-center gap-1 text-sm font-semibold text-navy-800 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 6).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </>
      )}

      <Modal open={!!healthModal} onClose={() => setHealthModal(null)} title={`${dimLabel[healthModal]} — by project`}>
        <div className="space-y-3">
          {projects.map((p) => {
            const status = p[healthModal];
            const meta = HEALTH_META[status] || HEALTH_META.on_track;
            return (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink-900">{p.name}</p>
                  <p className="text-xs text-ink-400">{p.client}</p>
                </div>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

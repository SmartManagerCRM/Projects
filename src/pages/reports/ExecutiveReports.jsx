import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Wallet,
  TrendingUp,
  ShieldAlert,
  Truck,
  FileQuestion,
  Building2,
  Printer,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Button, Card, Modal, PageHeader } from "../../components/ui.jsx";
import { formatDate, formatMoney, formatPercent } from "../../lib/format.js";
import logoMark from "../../assets/logoMark.js";

const REPORTS = [
  { key: "daily", label: "Daily Site Report", icon: FileText, desc: "Field-level report for a single project and day." },
  { key: "weekly", label: "Weekly Project Report", icon: TrendingUp, desc: "Portfolio-wide status as of this week." },
  { key: "monthly", label: "Monthly Project Report", icon: BarChart3, desc: "Portfolio-wide status for the current month." },
  { key: "cost", label: "Cost Report", icon: Wallet, desc: "Budget, committed, actual and forecast across all projects." },
  { key: "progress", label: "Progress Report", icon: TrendingUp, desc: "Planned vs. actual progress by project." },
  { key: "risk", label: "Risk Report", icon: ShieldAlert, desc: "Top risks across the portfolio, ranked by score." },
  { key: "procurement", label: "Procurement Report", icon: Truck, desc: "Delivery status and delays across all projects." },
  { key: "rfi", label: "RFI Report", icon: FileQuestion, desc: "Open and overdue RFIs across the portfolio." },
  { key: "executive", label: "Executive Portfolio Report", icon: Building2, desc: "The full leadership-level portfolio summary." },
];

export default function ExecutiveReports() {
  const { supabase } = useAuth();
  const { company, projects } = useCompany();
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate(key) {
    if (key === "daily") return navigate("/app/daily-report");
    setOpen(key);
    setLoading(true);
    const projectIds = projects.map((p) => p.id);
    let extra = {};
    if (key === "cost" && projectIds.length) {
      const { data: costs } = await supabase.from("project_costs").select("*").in("project_id", projectIds);
      extra.costs = costs || [];
    }
    if (key === "risk" && projectIds.length) {
      const { data: risks } = await supabase.from("risks").select("*, project:projects(name)").in("project_id", projectIds).order("risk_score", { ascending: false }).limit(15);
      extra.risks = risks || [];
    }
    if (key === "procurement" && projectIds.length) {
      const { data: proc } = await supabase.from("procurement_items").select("*, project:projects(name)").in("project_id", projectIds).order("delay_days", { ascending: false }).limit(20);
      extra.procurement = proc || [];
    }
    if (key === "rfi" && projectIds.length) {
      const { data: rfis } = await supabase.from("rfis").select("*, project:projects(name)").in("project_id", projectIds).neq("status", "closed").order("due_date");
      extra.rfis = rfis || [];
    }
    setData(extra);
    setLoading(false);
  }

  const report = REPORTS.find((r) => r.key === open);

  return (
    <div>
      <PageHeader eyebrow="Executive Reporting" title="Management Reports" subtitle="Generate exportable, leadership-ready reports from live project data." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.key} className="flex flex-col justify-between p-5">
            <div>
              <div className="inline-flex rounded-lg bg-navy-900/5 p-2.5 text-navy-800">
                <r.icon size={18} />
              </div>
              <p className="mt-3 text-sm font-bold text-ink-900">{r.label}</p>
              <p className="mt-1 text-xs text-ink-500">{r.desc}</p>
            </div>
            <button onClick={() => generate(r.key)} className="mt-4 flex items-center gap-1.5 text-xs font-bold text-navy-800 hover:underline">
              Generate Report <ArrowRight size={12} />
            </button>
          </Card>
        ))}
      </div>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={report?.label}
        size="xl"
        footer={
          <Button onClick={() => window.print()}>
            <Printer size={14} /> Export PDF
          </Button>
        }
      >
        {loading ? (
          <p className="py-10 text-center text-sm text-ink-400">Compiling report…</p>
        ) : (
          <div className="print-area">
            <ReportBody type={open} company={company} projects={projects} data={data} />
          </div>
        )}
      </Modal>
    </div>
  );
}

function ReportHeader({ title, subtitle, company }) {
  return (
    <div className="mb-5 flex items-center justify-between border-b-2 border-navy-950 pb-4">
      <div className="flex items-center gap-3">
        <div dangerouslySetInnerHTML={{ __html: logoMark }} className="h-10 w-10" />
        <div>
          <p className="text-base font-extrabold text-navy-950">{title}</p>
          <p className="text-xs text-ink-400">{company?.name} · {subtitle}</p>
        </div>
      </div>
      <p className="text-xs text-ink-400">{formatDate(new Date())}</p>
    </div>
  );
}

function ReportBody({ type, company, projects, data }) {
  const currency = company?.currency || "SAR";

  if (["weekly", "monthly", "executive"].includes(type)) {
    const title = { weekly: "Weekly Project Report", monthly: "Monthly Project Report", executive: "Executive Portfolio Report" }[type];
    const totalValue = projects.reduce((s, p) => s + Number(p.contract_value || 0), 0);
    const avgProgress = projects.length ? projects.reduce((s, p) => s + Number(p.progress || 0), 0) / projects.length : 0;
    return (
      <div className="text-ink-900">
        <ReportHeader title={title} subtitle="Portfolio Summary" company={company} />
        <div className="mb-5 grid grid-cols-3 gap-3">
          <Stat label="Active Projects" value={projects.length} />
          <Stat label="Portfolio Value" value={formatMoney(totalValue, currency, { compact: true })} />
          <Stat label="Avg. Progress" value={formatPercent(avgProgress)} />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase text-ink-400">
              <th className="py-2">Project</th>
              <th className="py-2">Progress</th>
              <th className="py-2">Schedule</th>
              <th className="py-2">Cost</th>
              <th className="py-2">Contract Value</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-ink-100">
                <td className="py-2 font-medium">{p.name}</td>
                <td className="py-2">{formatPercent(p.progress)}</td>
                <td className="py-2 capitalize">{p.schedule_health.replace("_", " ")}</td>
                <td className="py-2 capitalize">{p.cost_health.replace("_", " ")}</td>
                <td className="py-2">{formatMoney(p.contract_value, currency, { compact: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "cost") {
    const costs = data?.costs || [];
    const byProject = Object.fromEntries(costs.map((c) => [c.project_id, c]));
    const totals = costs.reduce(
      (acc, c) => ({
        original: acc.original + Number(c.original_contract || 0),
        committed: acc.committed + Number(c.committed_cost || 0),
        actual: acc.actual + Number(c.actual_cost || 0),
        forecast: acc.forecast + Number(c.forecast_final_cost || 0),
      }),
      { original: 0, committed: 0, actual: 0, forecast: 0 }
    );
    return (
      <div className="text-ink-900">
        <ReportHeader title="Cost Report" subtitle="Portfolio Cost Summary" company={company} />
        <div className="mb-5 grid grid-cols-4 gap-3">
          <Stat label="Original Budget" value={formatMoney(totals.original, currency, { compact: true })} />
          <Stat label="Committed" value={formatMoney(totals.committed, currency, { compact: true })} />
          <Stat label="Actual" value={formatMoney(totals.actual, currency, { compact: true })} />
          <Stat label="Forecast" value={formatMoney(totals.forecast, currency, { compact: true })} tone={totals.forecast > totals.original ? "red" : "green"} />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase text-ink-400">
              <th className="py-2">Project</th>
              <th className="py-2">Budget</th>
              <th className="py-2">Committed</th>
              <th className="py-2">Actual</th>
              <th className="py-2">Forecast</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const c = byProject[p.id];
              return (
                <tr key={p.id} className="border-b border-ink-100">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2">{formatMoney(c?.original_contract, currency, { compact: true })}</td>
                  <td className="py-2">{formatMoney(c?.committed_cost, currency, { compact: true })}</td>
                  <td className="py-2">{formatMoney(c?.actual_cost, currency, { compact: true })}</td>
                  <td className="py-2">{formatMoney(c?.forecast_final_cost, currency, { compact: true })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "progress") {
    return (
      <div className="text-ink-900">
        <ReportHeader title="Progress Report" subtitle="Planned vs. Actual" company={company} />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase text-ink-400">
              <th className="py-2">Project</th>
              <th className="py-2">Planned</th>
              <th className="py-2">Actual</th>
              <th className="py-2">Variance</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const variance = Number(p.progress || 0) - Number(p.planned_progress || 0);
              return (
                <tr key={p.id} className="border-b border-ink-100">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2">{formatPercent(p.planned_progress)}</td>
                  <td className="py-2">{formatPercent(p.progress)}</td>
                  <td className={`py-2 font-semibold ${variance < 0 ? "text-red-600" : "text-emerald-600"}`}>{variance > 0 ? "+" : ""}{variance.toFixed(0)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "risk") {
    return (
      <div className="text-ink-900">
        <ReportHeader title="Risk Report" subtitle="Top Portfolio Risks" company={company} />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase text-ink-400">
              <th className="py-2">Risk</th>
              <th className="py-2">Project</th>
              <th className="py-2">Score</th>
              <th className="py-2">Owner</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.risks || []).map((r) => (
              <tr key={r.id} className="border-b border-ink-100">
                <td className="py-2 font-medium">{r.title}</td>
                <td className="py-2">{r.project?.name}</td>
                <td className="py-2">{r.risk_score}</td>
                <td className="py-2">{r.owner}</td>
                <td className="py-2 capitalize">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "procurement") {
    return (
      <div className="text-ink-900">
        <ReportHeader title="Procurement Report" subtitle="Delivery Status" company={company} />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase text-ink-400">
              <th className="py-2">Item</th>
              <th className="py-2">Project</th>
              <th className="py-2">Supplier</th>
              <th className="py-2">Status</th>
              <th className="py-2">Delay</th>
            </tr>
          </thead>
          <tbody>
            {(data?.procurement || []).map((p) => (
              <tr key={p.id} className="border-b border-ink-100">
                <td className="py-2 font-medium">{p.item}</td>
                <td className="py-2">{p.project?.name}</td>
                <td className="py-2">{p.supplier}</td>
                <td className="py-2 capitalize">{p.status.replace("_", " ")}</td>
                <td className="py-2">{p.delay_days > 0 ? `${p.delay_days}d` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "rfi") {
    return (
      <div className="text-ink-900">
        <ReportHeader title="RFI Report" subtitle="Open &amp; Overdue" company={company} />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase text-ink-400">
              <th className="py-2">RFI</th>
              <th className="py-2">Project</th>
              <th className="py-2">Discipline</th>
              <th className="py-2">Due</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.rfis || []).map((r) => (
              <tr key={r.id} className="border-b border-ink-100">
                <td className="py-2 font-medium">{r.rfi_number} — {r.subject}</td>
                <td className="py-2">{r.project?.name}</td>
                <td className="py-2">{r.discipline}</td>
                <td className="py-2">{formatDate(r.due_date)}</td>
                <td className="py-2 capitalize">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-ink-50 p-3">
      <p className="text-[11px] text-ink-400">{label}</p>
      <p className={`text-base font-bold ${tone === "red" ? "text-red-600" : tone === "green" ? "text-emerald-600" : "text-ink-900"}`}>{value}</p>
    </div>
  );
}

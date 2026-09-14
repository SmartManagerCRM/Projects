import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutGrid,
  Wallet,
  Table2,
  FileQuestion,
  ClipboardCheck,
  ShieldAlert,
  Truck,
  FileText,
  FolderOpen,
  Users,
  Boxes,
  ArrowLeft,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Badge, FullPageSpinner, ProgressBar, Tabs } from "../../components/ui.jsx";
import { HEALTH_META } from "../../lib/constants.js";
import { formatDate, formatMoney, formatPercent } from "../../lib/format.js";

import Overview from "./tabs/Overview.jsx";
import CostControl from "./tabs/CostControl.jsx";
import Boq from "./tabs/Boq.jsx";
import Rfis from "./tabs/Rfis.jsx";
import Approvals from "./tabs/Approvals.jsx";
import Risks from "./tabs/Risks.jsx";
import Procurement from "./tabs/Procurement.jsx";
import DailyReports from "./tabs/DailyReports.jsx";
import Documents from "./tabs/Documents.jsx";
import Team from "./tabs/Team.jsx";
import Bim from "./tabs/Bim.jsx";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "cost", label: "Cost Control", icon: Wallet },
  { key: "boq", label: "BOQ", icon: Table2 },
  { key: "rfis", label: "RFIs", icon: FileQuestion },
  { key: "approvals", label: "Approvals", icon: ClipboardCheck },
  { key: "risks", label: "Risks", icon: ShieldAlert },
  { key: "procurement", label: "Procurement", icon: Truck },
  { key: "reports", label: "Daily Reports", icon: FileText },
  { key: "documents", label: "Documents", icon: FolderOpen },
  { key: "team", label: "Team", icon: Users },
  { key: "bim", label: "3D / BIM", icon: Boxes },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { supabase } = useAuth();
  const { company } = useCompany();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    setProject(data);
    setLoading(false);
  }, [supabase, id]);

  useEffect(() => {
    setLoading(true);
    refetch();
  }, [refetch]);

  if (loading) return <FullPageSpinner label="Loading project…" />;
  if (!project) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-ink-500">Project not found, or you don't have access to it.</p>
        <button onClick={() => navigate("/app/projects")} className="mt-3 text-sm font-semibold text-navy-800 hover:underline">
          Back to Portfolio
        </button>
      </div>
    );
  }

  const meta = HEALTH_META[project.schedule_health] || HEALTH_META.on_track;
  const currency = project.currency || company?.currency || "SAR";

  function setTab(key) {
    setSearchParams({ tab: key });
  }

  return (
    <div>
      <button onClick={() => navigate("/app/projects")} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-ink-700">
        <ArrowLeft size={13} /> Back to Portfolio
      </button>

      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{project.code || "PROJECT"}</p>
              {project.is_real_estate && <Badge tone="blue">Real Estate Development</Badge>}
              <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink-900">{project.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-500">
              <span className="flex items-center gap-1"><User size={12} /> {project.project_manager || "Unassigned"} · Client: {project.client}</span>
              <span className="flex items-center gap-1"><MapPin size={12} /> {project.location}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(project.start_date)} → {formatDate(project.planned_completion_date)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-ink-400">Contract Value</p>
            <p className="text-xl font-bold text-ink-900">{formatMoney(project.contract_value, currency)}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-500">
            <span>Overall Progress</span>
            <span className="text-ink-900">{formatPercent(project.progress)}</span>
          </div>
          <ProgressBar value={project.progress} tone="gold" height="h-2.5" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="px-4 pt-2">
          <Tabs tabs={TABS} active={activeTab} onChange={setTab} />
        </div>
        <div className="p-5 sm:p-6">
          {activeTab === "overview" && <Overview project={project} currency={currency} />}
          {activeTab === "cost" && <CostControl project={project} currency={currency} />}
          {activeTab === "boq" && <Boq project={project} currency={currency} />}
          {activeTab === "rfis" && <Rfis project={project} />}
          {activeTab === "approvals" && <Approvals project={project} />}
          {activeTab === "risks" && <Risks project={project} />}
          {activeTab === "procurement" && <Procurement project={project} />}
          {activeTab === "reports" && <DailyReports project={project} />}
          {activeTab === "documents" && <Documents project={project} />}
          {activeTab === "team" && <Team project={project} />}
          {activeTab === "bim" && <Bim project={project} />}
        </div>
      </div>
    </div>
  );
}

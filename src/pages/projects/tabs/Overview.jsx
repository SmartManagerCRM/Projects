import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Card, ProgressBar, Skeleton } from "../../../components/ui.jsx";
import { HEALTH_META } from "../../../lib/constants.js";
import { formatPercent } from "../../../lib/format.js";

const DIM_LABEL = { schedule_health: "Schedule", cost_health: "Cost", quality_health: "Quality", procurement_health: "Procurement", safety_health: "Safety" };

export default function Overview({ project }) {
  const { supabase } = useAuth();
  const [workPackages, setWorkPackages] = useState(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("work_packages")
      .select("*")
      .eq("project_id", project.id)
      .order("sort_order")
      .then(({ data }) => active && setWorkPackages(data || []));
    return () => {
      active = false;
    };
  }, [supabase, project.id]);

  const variance = Number(project.progress || 0) - Number(project.planned_progress || 0);
  const behind = variance < 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
      <div>
        <p className="text-sm font-bold text-ink-900">Work Packages</p>
        <div className="mt-3 space-y-4">
          {workPackages === null && [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8" />)}
          {workPackages?.map((wp) => (
            <div key={wp.id}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-ink-700">{wp.name}</span>
                <span className="font-semibold text-ink-900">{formatPercent(wp.progress)}</span>
              </div>
              <ProgressBar value={wp.progress} tone={wp.progress >= 70 ? "green" : wp.progress >= 40 ? "gold" : "navy"} />
            </div>
          ))}
        </div>

        <div className="mt-7 grid grid-cols-3 gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4">
          <div>
            <p className="text-xs text-ink-500">Planned Progress</p>
            <p className="mt-1 text-lg font-bold text-ink-900">{formatPercent(project.planned_progress)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Actual Progress</p>
            <p className="mt-1 text-lg font-bold text-ink-900">{formatPercent(project.progress)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Variance</p>
            <p className={`mt-1 text-lg font-bold ${behind ? "text-red-600" : "text-emerald-600"}`}>
              {variance > 0 ? "+" : ""}
              {variance.toFixed(0)}%
            </p>
          </div>
        </div>

        {variance !== 0 && (
          <div className={`mt-4 flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm ${behind ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>
            {behind ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
            <span>
              {behind
                ? `Project is currently ${Math.abs(variance).toFixed(0)}% behind planned progress.`
                : `Project is currently ${variance.toFixed(0)}% ahead of planned progress.`}
            </span>
          </div>
        )}
      </div>

      <Card className="p-5">
        <p className="text-sm font-bold text-ink-900">Project Health</p>
        <div className="mt-4 space-y-2.5">
          {Object.entries(DIM_LABEL).map(([dim, label]) => {
            const meta = HEALTH_META[project[dim]] || HEALTH_META.on_track;
            return (
              <div key={dim} className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 ${meta.bg}`}>
                <span className="text-sm font-medium text-ink-700">{label}</span>
                <span className={`flex items-center gap-1.5 text-xs font-bold ${meta.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

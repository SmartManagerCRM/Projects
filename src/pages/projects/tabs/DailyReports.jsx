import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Printer } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Button, EmptyState, Modal, Skeleton } from "../../../components/ui.jsx";
import { formatDate } from "../../../lib/format.js";
import ReportDocument from "../../reports/ReportDocument.jsx";

export default function DailyReports({ project }) {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    let alive = true;
    supabase
      .from("daily_reports")
      .select("*")
      .eq("project_id", project.id)
      .order("report_date", { ascending: false })
      .then(({ data }) => alive && setRows(data || []));
    return () => {
      alive = false;
    };
  }, [supabase, project.id]);

  if (rows === null) return <Skeleton className="h-72" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink-900">Daily Site Reports</p>
        <Button size="sm" onClick={() => navigate(`/app/daily-report?project=${project.id}`)}>
          <Plus size={13} /> New Daily Report
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No daily reports yet"
          description="Generate an AI-formatted daily site report from field inputs in seconds."
          action={
            <Button onClick={() => navigate(`/app/daily-report?project=${project.id}`)}>
              <Plus size={15} /> Generate Report
            </Button>
          }
        />
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => setActive(r)}
              className="flex w-full items-center justify-between rounded-xl border border-ink-100 bg-white px-4 py-3.5 text-left hover:border-ink-200 hover:shadow-card"
            >
              <div>
                <p className="text-sm font-semibold text-ink-900">{formatDate(r.report_date)}</p>
                <p className="text-xs text-ink-400">{r.weather} · {r.manpower} workers on site</p>
              </div>
              <span className="text-xs font-semibold text-navy-800">View Report →</span>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title="Daily Site Report"
        size="xl"
        footer={
          <Button onClick={() => window.print()}>
            <Printer size={14} /> Export PDF
          </Button>
        }
      >
        {active && (
          <div className="print-area">
            <ReportDocument project={project} report={active} />
          </div>
        )}
      </Modal>
    </div>
  );
}

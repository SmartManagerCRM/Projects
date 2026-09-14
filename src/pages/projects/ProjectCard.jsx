import { Link } from "react-router-dom";
import { MapPin, User, Calendar, Home } from "lucide-react";
import { Badge, Card, ProgressBar } from "../../components/ui.jsx";
import { HEALTH_META } from "../../lib/constants.js";
import { formatDate, formatMoney, formatPercent } from "../../lib/format.js";

const BANNER_GRADIENTS = [
  "from-navy-900 via-navy-800 to-navy-700",
  "from-navy-950 via-[#1c3358] to-[#2a4a78]",
  "from-[#142542] via-navy-800 to-[#26436f]",
];

export default function ProjectCard({ project }) {
  const meta = HEALTH_META[project.schedule_health] || HEALTH_META.on_track;
  const bannerIdx = (project.name?.length || 0) % BANNER_GRADIENTS.length;

  return (
    <Link to={`/app/projects/${project.id}`}>
      <Card className="group h-full overflow-hidden transition hover:shadow-panel">
        <div className={`relative flex h-28 items-end bg-gradient-to-br p-4 ${BANNER_GRADIENTS[bannerIdx]}`}>
          {project.is_real_estate && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold text-white">
              <Home size={10} /> Real Estate
            </span>
          )}
          <p className="line-clamp-2 text-base font-bold leading-tight text-white">{project.name}</p>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <p className="truncate text-xs text-ink-400">{project.client}</p>
            <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-400">
            <MapPin size={11} /> {project.location}
          </p>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-bold text-ink-900">{formatMoney(project.contract_value, project.currency, { compact: true })}</span>
            <span className="text-xs font-semibold text-ink-500">{formatPercent(project.progress)} complete</span>
          </div>
          <div className="mt-2">
            <ProgressBar value={project.progress} tone="gold" />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-400">
            <span className="flex items-center gap-1 truncate">
              <User size={12} /> {project.project_manager || "Unassigned"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {formatDate(project.planned_completion_date)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

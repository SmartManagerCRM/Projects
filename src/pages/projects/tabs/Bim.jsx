import { useState } from "react";
import { Boxes } from "lucide-react";
import { Badge, Card, ComingSoon } from "../../../components/ui.jsx";

const DISCIPLINES = [
  { key: "architecture", label: "Architecture", desc: "Architectural massing model synced from the design consultant's latest IFC issue." },
  { key: "structure", label: "Structure", desc: "Structural frame model — columns, beams and slabs — coordinated against the architectural envelope." },
  { key: "mep", label: "MEP", desc: "Mechanical, electrical and plumbing routing model, checked for clearance against structural elements." },
  { key: "progress", label: "Progress", desc: "4D progress simulation comparing modeled elements against verified site completion." },
  { key: "clash", label: "Clash Detection", desc: "Automated clash detection across disciplines, grouped by severity and responsible party." },
  { key: "documents", label: "Documents", desc: "Linked drawing sheets and model-derived documentation for this discipline." },
];

export default function Bim({ project }) {
  const [tab, setTab] = useState("clash");
  const active = DISCIPLINES.find((d) => d.key === tab);

  return (
    <div>
      <ComingSoon
        icon={Boxes}
        title={`Digital Project Model — ${project.name}`}
        description="SmartManager Projects connects project management with engineering and 3D/BIM workflows. The panel below is an interactive demonstration of the coordination view shipping in the full BIM release — it is not running live clash detection on this project."
        previewStats={[
          { label: "Detected Issues", value: "7" },
          { label: "Structural Clashes", value: "3" },
          { label: "MEP Clashes", value: "2" },
          { label: "Clearance Issues", value: "2" },
        ]}
      />

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-ink-100 p-2">
          {DISCIPLINES.map((d) => (
            <button
              key={d.key}
              onClick={() => setTab(d.key)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${tab === d.key ? "bg-navy-900 text-white" : "text-ink-500 hover:bg-ink-100"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="grid gap-0 md:grid-cols-[1.3fr,1fr]">
          <div className="relative flex min-h-[280px] items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-8">
            <IsoBuilding />
            <Badge tone="gold" className="absolute left-4 top-4">Demonstration Model</Badge>
          </div>
          <div className="p-6">
            <p className="text-sm font-bold text-ink-900">{active.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{active.desc}</p>
            {tab === "clash" && (
              <div className="mt-4 space-y-2">
                {[
                  { label: "Structural vs. MEP — Level 3 Riser Shaft", tone: "red" },
                  { label: "Structural vs. Architecture — Beam/Ceiling Clearance L5", tone: "amber" },
                  { label: "MEP vs. MEP — Ductwork Crossing Level 2", tone: "amber" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-xs">
                    <span className="text-ink-700">{c.label}</span>
                    <Badge tone={c.tone}>{c.tone === "red" ? "High" : "Medium"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function IsoBuilding() {
  return (
    <svg viewBox="0 0 200 160" className="h-40 w-full max-w-xs opacity-90">
      <g stroke="#c9a227" strokeWidth="1.2" fill="none" opacity="0.9">
        <polygon points="100,10 180,50 100,90 20,50" fill="#16294a" />
        <polygon points="20,50 20,110 100,150 100,90" fill="#0e1b30" />
        <polygon points="180,50 180,110 100,150 100,90" fill="#142542" />
        <line x1="60" y1="30" x2="60" y2="130" />
        <line x1="140" y1="30" x2="140" y2="130" />
        <line x1="20" y1="70" x2="100" y2="110" />
        <line x1="180" y1="70" x2="100" y2="110" />
      </g>
    </svg>
  );
}

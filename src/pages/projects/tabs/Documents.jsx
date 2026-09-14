import { FolderOpen, FileText, PenTool, ClipboardList, Receipt, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { ComingSoon } from "../../../components/ui.jsx";

const CATEGORIES = [
  { label: "Contracts", icon: FileText, count: 6 },
  { label: "Drawings", icon: PenTool, count: 34 },
  { label: "Specifications", icon: ClipboardList, count: 18 },
  { label: "Shop Drawings", icon: PenTool, count: 22 },
  { label: "Method Statements", icon: ShieldCheck, count: 11 },
  { label: "Approvals", icon: ClipboardList, count: 9 },
  { label: "Invoices", icon: Receipt, count: 27 },
  { label: "Photos", icon: ImageIcon, count: 142 },
];

export default function Documents({ project }) {
  return (
    <div>
      <ComingSoon
        icon={FolderOpen}
        title={`Document Center — ${project.name}`}
        description="Centralized upload, preview, versioning and approval status for every project document. Category structure and search are shown below as a preview of the full release; live upload and storage connect in the next version."
        previewStats={[
          { label: "Total Documents", value: "269" },
          { label: "Pending Review", value: "8" },
          { label: "Storage Used", value: "4.2 GB" },
          { label: "Last Upload", value: "Today" },
        ]}
      />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((c) => (
          <div key={c.label} className="rounded-xl border border-ink-100 bg-white p-4 hover:shadow-card">
            <c.icon size={18} className="text-navy-800" />
            <p className="mt-2 text-sm font-semibold text-ink-900">{c.label}</p>
            <p className="text-xs text-ink-400">{c.count} files</p>
          </div>
        ))}
      </div>
    </div>
  );
}

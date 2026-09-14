import { useMemo, useState } from "react";
import { Plus, Search, Building2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Button, EmptyState, Field, inputCls, Modal, PageHeader, useToast } from "../../components/ui.jsx";
import { PROJECT_TYPES } from "../../lib/constants.js";
import ProjectCard from "./ProjectCard.jsx";

const DEFAULT_WORK_PACKAGES = [
  { name: "Structure", progress: 0 },
  { name: "Architecture", progress: 0 },
  { name: "MEP", progress: 0 },
  { name: "External Works", progress: 0 },
  { name: "Landscape", progress: 0 },
];

export default function ProjectsList() {
  const { supabase } = useAuth();
  const { company, projects, refreshProjects } = useCompany();
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    project_type: PROJECT_TYPES[0],
    client: "",
    location: "",
    contract_value: "",
    start_date: "",
    planned_completion_date: "",
    project_manager: "",
    is_real_estate: false,
  });

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const filtered = useMemo(() => {
    let list = projects;
    if (filter === "real_estate") list = list.filter((p) => p.is_real_estate);
    if (filter === "at_risk") list = list.filter((p) => [p.schedule_health, p.cost_health, p.procurement_health].includes("at_risk"));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => [p.name, p.client, p.location].filter(Boolean).some((v) => v.toLowerCase().includes(q)));
    }
    return list;
  }, [projects, filter, query]);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: proj, error } = await supabase
        .from("projects")
        .insert({
          company_id: company.id,
          name: form.name,
          project_type: form.project_type,
          client: form.client,
          location: form.location,
          contract_value: Number(form.contract_value || 0),
          currency: company.currency,
          start_date: form.start_date || null,
          planned_completion_date: form.planned_completion_date || null,
          project_manager: form.project_manager,
          is_real_estate: form.is_real_estate,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("project_costs").insert({ project_id: proj.id, original_contract: Number(form.contract_value || 0) });
      await supabase.from("work_packages").insert(DEFAULT_WORK_PACKAGES.map((wp, i) => ({ project_id: proj.id, sort_order: i, ...wp })));
      if (form.is_real_estate) {
        await supabase.from("real_estate_developments").insert({
          project_id: proj.id,
          construction_budget: Number(form.contract_value || 0),
          pipeline_stage: "design",
        });
      }

      await refreshProjects();
      push(`"${form.name}" was added to your portfolio.`, "success");
      setModalOpen(false);
      setForm({ name: "", project_type: PROJECT_TYPES[0], client: "", location: "", contract_value: "", start_date: "", planned_completion_date: "", project_manager: "", is_real_estate: false });
    } catch (err) {
      push(err.message || "Couldn't create the project.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Project Portfolio"
        subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"} across your company`}
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> New Project
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2">
          <Search size={15} className="text-ink-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, client or location…" className="flex-1 text-sm outline-none placeholder:text-ink-300" />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "All" },
            { key: "real_estate", label: "Real Estate" },
            { key: "at_risk", label: "At Risk" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter === f.key ? "bg-navy-900 text-white" : "bg-white text-ink-600 border border-ink-200 hover:bg-ink-50"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No projects match" description="Try a different search or filter, or add a new project to your portfolio." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Project"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.name}>{saving ? "Creating…" : "Create Project"}</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Project Name" required>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project Type">
              <select value={form.project_type} onChange={(e) => update("project_type", e.target.value)} className={inputCls}>
                {PROJECT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Client">
              <input value={form.client} onChange={(e) => update("client", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <input value={form.location} onChange={(e) => update("location", e.target.value)} className={inputCls} />
            </Field>
            <Field label={`Contract Value (${company?.currency})`}>
              <input type="number" min="0" value={form.contract_value} onChange={(e) => update("contract_value", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start Date">
              <input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Planned Completion Date">
              <input type="date" value={form.planned_completion_date} onChange={(e) => update("planned_completion_date", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Project Manager">
            <input value={form.project_manager} onChange={(e) => update("project_manager", e.target.value)} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2.5 text-sm text-ink-600">
            <input type="checkbox" checked={form.is_real_estate} onChange={(e) => update("is_real_estate", e.target.checked)} className="rounded border-ink-300" />
            This is a real-estate development (enables unit sales tracking)
          </label>
        </form>
      </Modal>
    </div>
  );
}

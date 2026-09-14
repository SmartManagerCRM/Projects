import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, Printer, Send, Save, Image as ImageIcon, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Button, Card, Field, inputCls, PageHeader, useToast } from "../../components/ui.jsx";
import ReportDocument from "./ReportDocument.jsx";

function blankForm() {
  return {
    report_date: new Date().toISOString().slice(0, 10),
    weather: "",
    manpower: "",
    equipment: "",
    completed_activities: "",
    quantities: "",
    materials_received: "",
    site_issues: "",
    safety_observations: "",
    delays: "",
    required_actions: "",
    tomorrow_plan: "",
  };
}

export default function DailyReportGenerator() {
  const { supabase, user } = useAuth();
  const { projects } = useCompany();
  const { push } = useToast();
  const [searchParams] = useSearchParams();
  const [projectId, setProjectId] = useState(searchParams.get("project") || "");
  const [form, setForm] = useState(blankForm());
  const [photos, setPhotos] = useState([]);
  const [generated, setGenerated] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId && projects.length) setProjectId(projects[0].id);
  }, [projects, projectId]);

  const project = projects.find((p) => p.id === projectId);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePhotos(e) {
    const files = Array.from(e.target.files || []).slice(0, 6 - photos.length);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPhotos((p) => [...p, reader.result]);
      reader.readAsDataURL(file);
    });
  }

  function handleGenerate(e) {
    e.preventDefault();
    if (!project) return push("Select a project first.", "warning");
    setGenerated({ ...form, photos });
  }

  async function handleSave() {
    if (!generated || !project) return;
    setSaving(true);
    const { error } = await supabase.from("daily_reports").insert({
      project_id: project.id,
      ...generated,
      manpower: Number(generated.manpower || 0),
      created_by: user.id,
    });
    setSaving(false);
    if (error) return push(error.message, "error");
    push("Report saved to the project.", "success");
  }

  function handleSend() {
    push(`Report emailed to ${project?.project_manager || "the Project Manager"} and project stakeholders. (Demo simulation — connect an email provider to send for real.)`, "info", 6000);
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI Daily Site Report"
        title="Generate a Professional Daily Report"
        subtitle="Turn daily site information into a professional project report in seconds."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <Card className="p-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <Field label="Project" required>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputCls}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date">
                <input type="date" value={form.report_date} onChange={(e) => update("report_date", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Weather">
                <input value={form.weather} onChange={(e) => update("weather", e.target.value)} className={inputCls} placeholder="Clear, 34°C" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Manpower">
                <input type="number" value={form.manpower} onChange={(e) => update("manpower", e.target.value)} className={inputCls} placeholder="Number of workers" />
              </Field>
              <Field label="Equipment">
                <input value={form.equipment} onChange={(e) => update("equipment", e.target.value)} className={inputCls} placeholder="Cranes, pumps, excavators…" />
              </Field>
            </div>
            <Field label="Completed Activities">
              <textarea value={form.completed_activities} onChange={(e) => update("completed_activities", e.target.value)} className={inputCls} rows={2} />
            </Field>
            <Field label="Quantities">
              <textarea value={form.quantities} onChange={(e) => update("quantities", e.target.value)} className={inputCls} rows={2} />
            </Field>
            <Field label="Materials Received">
              <textarea value={form.materials_received} onChange={(e) => update("materials_received", e.target.value)} className={inputCls} rows={2} />
            </Field>
            <Field label="Site Issues">
              <textarea value={form.site_issues} onChange={(e) => update("site_issues", e.target.value)} className={inputCls} rows={2} />
            </Field>
            <Field label="Safety Observations">
              <textarea value={form.safety_observations} onChange={(e) => update("safety_observations", e.target.value)} className={inputCls} rows={2} />
            </Field>
            <Field label="Delays">
              <textarea value={form.delays} onChange={(e) => update("delays", e.target.value)} className={inputCls} rows={2} />
            </Field>
            <Field label="Required Actions">
              <textarea value={form.required_actions} onChange={(e) => update("required_actions", e.target.value)} className={inputCls} rows={2} />
            </Field>
            <Field label="Tomorrow's Plan">
              <textarea value={form.tomorrow_plan} onChange={(e) => update("tomorrow_plan", e.target.value)} className={inputCls} rows={2} />
            </Field>

            <Field label="Site Photos">
              <div className="flex flex-wrap gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-ink-200">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink-300 text-ink-400 hover:border-navy-700 hover:text-navy-700">
                    <ImageIcon size={16} />
                    <span className="text-[9px]">Upload</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
                  </label>
                )}
              </div>
            </Field>

            <Button type="submit" variant="gold" className="w-full" size="lg">
              <Sparkles size={16} /> Generate Report
            </Button>
          </form>
        </Card>

        <div>
          {generated ? (
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => window.print()}>
                  <Printer size={13} /> Export PDF
                </Button>
                <Button size="sm" variant="outline" onClick={handleSend}>
                  <Send size={13} /> Send Report
                </Button>
                <Button size="sm" variant="subtle" onClick={handleSave} disabled={saving}>
                  <Save size={13} /> {saving ? "Saving…" : "Save to Project"}
                </Button>
              </div>
              <Card className="print-area overflow-hidden">
                <ReportDocument project={project} report={generated} />
              </Card>
            </div>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center gap-3 border-dashed p-14 text-center">
              <Sparkles className="text-gold-500" size={28} />
              <p className="text-sm font-semibold text-ink-700">Your formatted report will appear here</p>
              <p className="max-w-xs text-xs text-ink-400">Fill in today's site information and click Generate Report to produce a polished, client-ready document.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

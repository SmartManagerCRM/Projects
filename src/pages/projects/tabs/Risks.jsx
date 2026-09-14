import { Fragment, useEffect, useMemo, useState } from "react";
import { ShieldAlert, Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Badge, Button, Card, EmptyState, Field, inputCls, Modal, Skeleton, useToast } from "../../../components/ui.jsx";

const LEVELS = ["low", "medium", "high"];
const LEVEL_LABEL = { low: "Low", medium: "Medium", high: "High" };
const STATUS_TONE = { open: "amber", mitigated: "green", closed: "slate" };

function bucket(score) {
  if (score >= 16) return "critical";
  if (score >= 11) return "high";
  if (score >= 6) return "medium";
  return "low";
}

const BUCKET_TONE = { critical: "red", high: "amber", medium: "blue", low: "slate" };
const CELL_COLOR = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

function blankForm() {
  return { title: "", category: "", probability: "medium", impact: "medium", owner: "", mitigation: "" };
}

export default function Risks({ project }) {
  const { supabase } = useAuth();
  const { push } = useToast();
  const [rows, setRows] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("risks").select("*").eq("project_id", project.id).order("risk_score", { ascending: false });
    setRows(data || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const counts = useMemo(() => {
    const list = rows || [];
    const c = { critical: 0, high: 0, medium: 0, low: 0 };
    list.forEach((r) => c[bucket(r.risk_score)]++);
    return c;
  }, [rows]);

  const matrix = useMemo(() => {
    const list = rows || [];
    const m = {};
    LEVELS.forEach((p) => LEVELS.forEach((i) => (m[`${p}_${i}`] = 0)));
    list.forEach((r) => {
      const key = `${r.probability}_${r.impact}`;
      if (key in m) m[key]++;
    });
    return m;
  }, [rows]);

  const scale = { low: 2, medium: 4, high: 6 };

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    const risk_score = scale[form.probability] * scale[form.impact];
    const { error } = await supabase.from("risks").insert({ project_id: project.id, ...form, risk_score, status: "open" });
    setSaving(false);
    if (error) return push(error.message, "error");
    push("Risk logged.", "success");
    setCreateOpen(false);
    setForm(blankForm());
    load();
  }

  async function updateStatus(id, status) {
    await supabase.from("risks").update({ status }).eq("id", id);
    load();
  }

  if (rows === null) return <Skeleton className="h-96" />;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["critical", "high", "medium", "low"].map((b) => (
          <Card key={b} className="p-4">
            <p className="text-xs font-semibold uppercase text-ink-400">{b}</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{counts[b]}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-5 p-5">
        <p className="text-sm font-bold text-ink-900">Risk Matrix</p>
        <p className="text-xs text-ink-500">Probability (rows) × Impact (columns)</p>
        <div className="mt-4 grid grid-cols-[70px,repeat(3,1fr)] gap-1.5 text-xs">
          <div />
          {LEVELS.map((i) => (
            <div key={i} className="text-center font-semibold text-ink-500">{LEVEL_LABEL[i]}</div>
          ))}
          {[...LEVELS].reverse().map((p) => (
            <Fragment key={p}>
              <div className="flex items-center font-semibold text-ink-500">{LEVEL_LABEL[p]}</div>
              {LEVELS.map((i) => {
                const n = matrix[`${p}_${i}`];
                const b = bucket(scale[p] * scale[i]);
                return (
                  <div key={`${p}-${i}`} className={`flex h-14 items-center justify-center rounded-lg text-lg font-bold ${CELL_COLOR[b]}`}>
                    {n || ""}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </Card>

      <div className="mt-5 flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={13} /> Log Risk
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No risks logged" description="Log project risks to track probability, impact and mitigation." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                {["Risk", "Category", "Probability", "Impact", "Score", "Owner", "Mitigation", "Status"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-ink-50/60">
                  <td className="px-4 py-2.5 font-medium text-ink-800">{r.title}</td>
                  <td className="px-4 py-2.5 text-ink-500">{r.category}</td>
                  <td className="px-4 py-2.5 capitalize text-ink-500">{r.probability}</td>
                  <td className="px-4 py-2.5 capitalize text-ink-500">{r.impact}</td>
                  <td className="px-4 py-2.5"><Badge tone={BUCKET_TONE[bucket(r.risk_score)]}>{r.risk_score}</Badge></td>
                  <td className="px-4 py-2.5 text-ink-500">{r.owner}</td>
                  <td className="max-w-[220px] px-4 py-2.5 text-ink-500">{r.mitigation}</td>
                  <td className="px-4 py-2.5">
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs">
                      <option value="open">Open</option>
                      <option value="mitigated">Mitigated</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Log Risk"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.title}>{saving ? "Logging…" : "Log Risk"}</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Risk" required>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} required />
          </Field>
          <Field label="Category">
            <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls} placeholder="Cost, Schedule, Procurement…" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Probability">
              <select value={form.probability} onChange={(e) => setForm((f) => ({ ...f, probability: e.target.value }))} className={inputCls}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{LEVEL_LABEL[l]}</option>
                ))}
              </select>
            </Field>
            <Field label="Impact">
              <select value={form.impact} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value }))} className={inputCls}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{LEVEL_LABEL[l]}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Owner">
            <input value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Mitigation">
            <textarea value={form.mitigation} onChange={(e) => setForm((f) => ({ ...f, mitigation: e.target.value }))} className={inputCls} rows={3} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}

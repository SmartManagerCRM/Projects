import { useEffect, useMemo, useState } from "react";
import { FileQuestion, Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Badge, Button, EmptyState, Field, inputCls, Modal, Skeleton, StatCard, useToast } from "../../../components/ui.jsx";
import { formatDate, daysBetween } from "../../../lib/format.js";

const PRIORITY_TONE = { high: "red", medium: "amber", low: "slate" };
const STATUS_TONE = { open: "blue", overdue: "red", closed: "green" };

function blankForm() {
  return { rfi_number: "", subject: "", discipline: "", responsible_party: "", due_date: "", priority: "medium", description: "" };
}

export default function Rfis({ project }) {
  const { supabase } = useAuth();
  const { push } = useToast();
  const [rows, setRows] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [active, setActive] = useState(null);
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("rfis").select("*").eq("project_id", project.id).order("created_at", { ascending: false });
    const today = new Date();
    const normalized = (data || []).map((r) => {
      if (r.status === "open" && r.due_date && new Date(r.due_date) < today) return { ...r, status: "overdue" };
      return r;
    });
    setRows(normalized);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const stats = useMemo(() => {
    const list = rows || [];
    return {
      open: list.filter((r) => r.status === "open").length,
      overdue: list.filter((r) => r.status === "overdue").length,
      pending: list.filter((r) => r.status !== "closed").length,
      closed: list.filter((r) => r.status === "closed").length,
    };
  }, [rows]);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("rfis").insert({
      project_id: project.id,
      ...form,
      submitted_date: new Date().toISOString().slice(0, 10),
      status: "open",
    });
    setSaving(false);
    if (error) return push(error.message, "error");
    push("RFI created.", "success");
    setCreateOpen(false);
    setForm(blankForm());
    load();
  }

  async function handleReply() {
    if (!active) return;
    setSaving(true);
    const { error } = await supabase.from("rfis").update({ response, status: "closed" }).eq("id", active.id);
    setSaving(false);
    if (error) return push(error.message, "error");
    push("RFI reply saved and closed.", "success");
    setActive(null);
    setResponse("");
    load();
  }

  async function closeRfi(id) {
    await supabase.from("rfis").update({ status: "closed" }).eq("id", id);
    load();
  }

  if (rows === null) return <Skeleton className="h-96" />;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard tone="white" label="Open RFIs" value={stats.open} />
        <StatCard tone="white" label="Overdue RFIs" value={stats.overdue} />
        <StatCard tone="white" label="Pending Response" value={stats.pending} />
        <StatCard tone="white" label="Closed RFIs" value={stats.closed} />
      </div>

      <div className="mt-5 flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={13} /> Create RFI
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={FileQuestion} title="No RFIs yet" description="Create an RFI to track design or technical clarifications for this project." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                {["RFI No.", "Subject", "Discipline", "Submitted", "Responsible Party", "Due Date", "Priority", "Status", ""].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-ink-50/60">
                  <td className="px-4 py-2.5 font-medium text-ink-700">{r.rfi_number}</td>
                  <td className="px-4 py-2.5 text-ink-800">{r.subject}</td>
                  <td className="px-4 py-2.5 text-ink-500">{r.discipline}</td>
                  <td className="px-4 py-2.5 text-ink-500">{daysBetween(r.submitted_date)} days open</td>
                  <td className="px-4 py-2.5 text-ink-500">{r.responsible_party}</td>
                  <td className="px-4 py-2.5 text-ink-500">{formatDate(r.due_date)}</td>
                  <td className="px-4 py-2.5"><Badge tone={PRIORITY_TONE[r.priority]}>{r.priority}</Badge></td>
                  <td className="px-4 py-2.5"><Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge></td>
                  <td className="px-4 py-2.5 text-right">
                    {r.status !== "closed" ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setActive(r); setResponse(r.response || ""); }} className="text-xs font-semibold text-navy-800 hover:underline">
                          Reply
                        </button>
                        <button onClick={() => closeRfi(r.id)} className="text-xs font-semibold text-ink-400 hover:text-ink-700">
                          Close
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-300">Closed</span>
                    )}
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
        title="Create RFI"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.subject}>{saving ? "Creating…" : "Create RFI"}</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="RFI Number">
              <input value={form.rfi_number} onChange={(e) => setForm((f) => ({ ...f, rfi_number: e.target.value }))} className={inputCls} placeholder="RFI-042" />
            </Field>
            <Field label="Discipline">
              <input value={form.discipline} onChange={(e) => setForm((f) => ({ ...f, discipline: e.target.value }))} className={inputCls} placeholder="Structural, MEP…" />
            </Field>
          </div>
          <Field label="Subject" required>
            <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className={inputCls} required />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Responsible Party">
              <input value={form.responsible_party} onChange={(e) => setForm((f) => ({ ...f, responsible_party: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Due Date">
              <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className={inputCls}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>
        </form>
      </Modal>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={`Reply — ${active?.rfi_number || ""}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>Cancel</Button>
            <Button onClick={handleReply} disabled={saving || !response.trim()}>{saving ? "Saving…" : "Save Reply & Close"}</Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-ink-600">{active?.subject}</p>
        <Field label="Response">
          <textarea value={response} onChange={(e) => setResponse(e.target.value)} className={inputCls} rows={4} placeholder="Write the technical response…" />
        </Field>
      </Modal>
    </div>
  );
}

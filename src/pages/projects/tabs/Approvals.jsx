import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Plus, Check, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Badge, Button, EmptyState, Field, inputCls, Modal, Skeleton, StatCard, useToast } from "../../../components/ui.jsx";
import { formatDate } from "../../../lib/format.js";

const TYPES = ["Material Submittal", "Shop Drawing", "Method Statement", "Payment Certificate", "Variation Order", "Design Revision"];
const STATUS_TONE = { pending: "amber", approved: "green", rejected: "red" };

function blankForm() {
  return { approval_type: TYPES[0], title: "", submitted_by: "" };
}

export default function Approvals({ project }) {
  const { supabase } = useAuth();
  const { push } = useToast();
  const [rows, setRows] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [active, setActive] = useState(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("approvals").select("*").eq("project_id", project.id).order("created_at", { ascending: false });
    setRows(data || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const today = new Date();
  const stats = useMemo(() => {
    const list = rows || [];
    return {
      pending: list.filter((r) => r.status === "pending").length,
      approved: list.filter((r) => r.status === "approved").length,
      rejected: list.filter((r) => r.status === "rejected").length,
      overdue: list.filter((r) => r.status === "pending" && daysOpen(r.submitted_date) > 5).length,
    };
  }, [rows]);

  function daysOpen(date) {
    return Math.round((today.getTime() - new Date(date).getTime()) / 86400000);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("approvals").insert({ project_id: project.id, ...form, submitted_date: new Date().toISOString().slice(0, 10), status: "pending" });
    setSaving(false);
    if (error) return push(error.message, "error");
    push("Approval request submitted.", "success");
    setCreateOpen(false);
    setForm(blankForm());
    load();
  }

  async function decide(status) {
    if (!active) return;
    setSaving(true);
    const { error } = await supabase.from("approvals").update({ status, comments: comment || active.comments }).eq("id", active.id);
    setSaving(false);
    if (error) return push(error.message, "error");
    push(`Approval ${status}.`, status === "approved" ? "success" : "warning");
    setActive(null);
    setComment("");
    load();
  }

  if (rows === null) return <Skeleton className="h-96" />;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard tone="white" label="Pending" value={stats.pending} />
        <StatCard tone="white" label="Approved" value={stats.approved} />
        <StatCard tone="white" label="Rejected" value={stats.rejected} />
        <StatCard tone="white" label="Overdue" value={stats.overdue} />
      </div>

      <div className="mt-5 flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={13} /> New Approval Request
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No approval requests yet" description="Submittals, shop drawings, payment certificates and variation orders will appear here." />
      ) : (
        <div className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => { setActive(r); setComment(r.comments || ""); }}
              className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3.5 text-left hover:border-ink-200 hover:shadow-card"
            >
              <div>
                <p className="text-xs font-medium text-ink-400">{r.approval_type}</p>
                <p className="text-sm font-semibold text-ink-900">{r.title}</p>
                <p className="mt-0.5 text-xs text-ink-400">
                  Submitted by {r.submitted_by || "—"} · {formatDate(r.submitted_date)}
                </p>
              </div>
              <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Approval Request"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.title}>{saving ? "Submitting…" : "Submit"}</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Approval Type">
            <select value={form.approval_type} onChange={(e) => setForm((f) => ({ ...f, approval_type: e.target.value }))} className={inputCls}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Title" required>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} required />
          </Field>
          <Field label="Submitted By">
            <input value={form.submitted_by} onChange={(e) => setForm((f) => ({ ...f, submitted_by: e.target.value }))} className={inputCls} />
          </Field>
        </form>
      </Modal>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.title}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <Badge tone={STATUS_TONE[active?.status]}>{active?.status}</Badge>
            {active?.approval_type} · Submitted {formatDate(active?.submitted_date)}
          </div>
          <Field label="Comments">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className={inputCls} rows={3} placeholder="Add review comments…" />
          </Field>
          {active?.status === "pending" && (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => decide("approved")} disabled={saving}>
                <Check size={14} /> Approve
              </Button>
              <Button className="flex-1" variant="danger" onClick={() => decide("rejected")} disabled={saving}>
                <X size={14} /> Reject
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

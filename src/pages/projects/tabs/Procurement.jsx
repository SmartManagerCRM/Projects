import { useEffect, useMemo, useState } from "react";
import { Truck, Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Badge, Button, EmptyState, Field, inputCls, Modal, Skeleton, StatCard, useToast } from "../../../components/ui.jsx";
import { formatDate } from "../../../lib/format.js";

const STATUS_META = {
  on_schedule: { label: "On Schedule", tone: "green", dot: "🟢" },
  delayed: { label: "Delayed", tone: "red", dot: "🔴" },
  pending_approval: { label: "Pending Approval", tone: "amber", dot: "🟡" },
};

function blankForm() {
  return { item: "", category: "", supplier: "", status: "on_schedule", expected_date: "", delay_days: "" };
}

export default function Procurement({ project }) {
  const { supabase } = useAuth();
  const { push } = useToast();
  const [rows, setRows] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("procurement_items").select("*").eq("project_id", project.id).order("created_at", { ascending: false });
    setRows(data || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const stats = useMemo(() => {
    const list = rows || [];
    return {
      requests: list.length,
      pending: list.filter((r) => r.status === "pending_approval").length,
      delayed: list.filter((r) => r.status === "delayed").length,
      onSchedule: list.filter((r) => r.status === "on_schedule").length,
    };
  }, [rows]);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("procurement_items").insert({
      project_id: project.id,
      ...form,
      delay_days: Number(form.delay_days || 0),
      expected_date: form.expected_date || null,
    });
    setSaving(false);
    if (error) return push(error.message, "error");
    push("Procurement item added.", "success");
    setCreateOpen(false);
    setForm(blankForm());
    load();
  }

  async function updateStatus(id, status) {
    await supabase.from("procurement_items").update({ status }).eq("id", id);
    load();
  }

  if (rows === null) return <Skeleton className="h-96" />;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard tone="white" label="Purchase Requests" value={stats.requests} />
        <StatCard tone="white" label="Pending Deliveries" value={stats.pending} />
        <StatCard tone="white" label="Delayed Deliveries" value={stats.delayed} />
        <StatCard tone="white" label="On Schedule" value={stats.onSchedule} />
      </div>

      <div className="mt-5 rounded-xl border border-ink-100 bg-white p-4">
        <p className="mb-2.5 text-sm font-bold text-ink-900">Procurement Alerts</p>
        <div className="space-y-1.5">
          {(rows || [])
            .filter((r) => r.status !== "on_schedule")
            .slice(0, 5)
            .map((r) => (
              <p key={r.id} className="text-sm text-ink-700">
                {STATUS_META[r.status].dot} {r.item} {r.status === "delayed" ? `delayed by ${r.delay_days} day${r.delay_days === 1 ? "" : "s"}` : "awaiting approval"}
              </p>
            ))}
          {(rows || []).filter((r) => r.status === "on_schedule").slice(0, 2).map((r) => (
            <p key={r.id} className="text-sm text-ink-700">🟢 {r.item} supply on schedule</p>
          ))}
          {rows.length === 0 && <p className="text-sm text-ink-400">No procurement items tracked yet.</p>}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={13} /> Add Item
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Truck} title="No procurement items" description="Track purchase orders, suppliers and delivery status here." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                {["Item", "Category", "Supplier", "Expected Date", "Delay", "Status"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-ink-50/60">
                  <td className="px-4 py-2.5 font-medium text-ink-800">{r.item}</td>
                  <td className="px-4 py-2.5 text-ink-500">{r.category}</td>
                  <td className="px-4 py-2.5 text-ink-500">{r.supplier}</td>
                  <td className="px-4 py-2.5 text-ink-500">{formatDate(r.expected_date)}</td>
                  <td className="px-4 py-2.5 text-ink-500">{r.delay_days > 0 ? `${r.delay_days}d` : "—"}</td>
                  <td className="px-4 py-2.5">
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs">
                      {Object.entries(STATUS_META).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
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
        title="Add Procurement Item"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.item}>{saving ? "Adding…" : "Add Item"}</Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Item" required>
            <input value={form.item} onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))} className={inputCls} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls} placeholder="Materials, Equipment…" />
            </Field>
            <Field label="Supplier">
              <input value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Expected Date">
              <input type="date" value={form.expected_date} onChange={(e) => setForm((f) => ({ ...f, expected_date: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>
          </div>
          {form.status === "delayed" && (
            <Field label="Delay (days)">
              <input type="number" min="0" value={form.delay_days} onChange={(e) => setForm((f) => ({ ...f, delay_days: e.target.value }))} className={inputCls} />
            </Field>
          )}
        </form>
      </Modal>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Download, Plus, Search } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Badge, Button, EmptyState, Field, inputCls, Modal, Skeleton, StatCard, useToast } from "../../../components/ui.jsx";
import { formatMoney, formatNumber, formatPercent } from "../../../lib/format.js";
import { Table2 } from "lucide-react";

const STATUS_TONE = { completed: "green", in_progress: "amber", not_started: "slate" };
const STATUS_LABEL = { completed: "Completed", in_progress: "In Progress", not_started: "Not Started" };

function blankForm() {
  return { item_no: "", description: "", unit: "", quantity: "", unit_rate: "", executed_quantity: "", status: "not_started" };
}

export default function Boq({ project, currency }) {
  const { supabase } = useAuth();
  const { push } = useToast();
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "item_no", dir: "asc" });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("boq_items").select("*").eq("project_id", project.id).order("sort_order");
    setItems(data || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const rows = useMemo(() => {
    if (!items) return [];
    const enriched = items.map((it) => {
      const original = Number(it.quantity || 0) * Number(it.unit_rate || 0);
      const executedValue = Number(it.executed_quantity || 0) * Number(it.unit_rate || 0);
      const remaining = original - executedValue;
      const variance = original ? ((executedValue - original) / original) * 100 : 0;
      return { ...it, original, executedValue, remaining, variance };
    });
    let list = enriched;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => [r.item_no, r.description].filter(Boolean).some((v) => v.toLowerCase().includes(q)));
    }
    list = [...list].sort((a, b) => {
      const av = a[sort.key],
        bv = b[sort.key];
      if (typeof av === "string") return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sort.dir === "asc" ? av - bv : bv - av;
    });
    return list;
  }, [items, query, sort]);

  const totals = useMemo(() => {
    const original = rows.reduce((s, r) => s + r.original, 0);
    const executed = rows.reduce((s, r) => s + r.executedValue, 0);
    return { original, executed, remaining: original - executed };
  }, [rows]);

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("boq_items").insert({
      project_id: project.id,
      item_no: form.item_no,
      description: form.description,
      unit: form.unit,
      quantity: Number(form.quantity || 0),
      unit_rate: Number(form.unit_rate || 0),
      executed_quantity: Number(form.executed_quantity || 0),
      status: form.status,
      sort_order: items?.length || 0,
    });
    setSaving(false);
    if (error) return push(error.message, "error");
    push("BOQ item added.", "success");
    setModalOpen(false);
    setForm(blankForm());
    load();
  }

  function exportCsv() {
    const header = ["Item No.", "Description", "Unit", "Quantity", "Unit Rate", "Original Amount", "Executed Qty", "Executed Value", "Remaining", "Variance %", "Status"];
    const lines = rows.map((r) =>
      [r.item_no, r.description, r.unit, r.quantity, r.unit_rate, r.original.toFixed(2), r.executed_quantity, r.executedValue.toFixed(2), r.remaining.toFixed(2), r.variance.toFixed(1), STATUS_LABEL[r.status] || r.status]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.code || project.name}-BOQ.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (items === null) return <Skeleton className="h-96" />;

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard tone="white" label="Original BOQ Value" value={formatMoney(totals.original, currency, { compact: true })} />
        <StatCard tone="white" label="Executed Value" value={formatMoney(totals.executed, currency, { compact: true })} />
        <StatCard tone="white" label="Remaining Value" value={formatMoney(totals.remaining, currency, { compact: true })} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2">
          <Search size={14} className="text-ink-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search description or item no…" className="flex-1 text-sm outline-none placeholder:text-ink-300" />
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          <Download size={13} /> Export BOQ
        </Button>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={13} /> Add Item
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Table2} title="No BOQ items yet" description="Add items manually to start tracking bill-of-quantities execution." />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink-100">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                {[
                  ["item_no", "Item No."],
                  ["description", "Description"],
                  ["unit", "Unit"],
                  ["quantity", "Quantity"],
                  ["unit_rate", "Unit Rate"],
                  ["original", "Original Amount"],
                  ["executedValue", "Executed Value"],
                  ["remaining", "Remaining"],
                  ["variance", "Variance"],
                  ["status", "Status"],
                ].map(([key, label]) => (
                  <th key={key} className="cursor-pointer whitespace-nowrap px-4 py-2.5 text-left" onClick={() => toggleSort(key)}>
                    <span className="flex items-center gap-1">
                      {label} <ArrowUpDown size={11} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-ink-50/60">
                  <td className="px-4 py-2.5 font-medium text-ink-700">{r.item_no}</td>
                  <td className="px-4 py-2.5 text-ink-800">{r.description}</td>
                  <td className="px-4 py-2.5 text-ink-500">{r.unit}</td>
                  <td className="px-4 py-2.5 text-ink-500">{formatNumber(r.quantity)}</td>
                  <td className="px-4 py-2.5 text-ink-500">{formatMoney(r.unit_rate, currency)}</td>
                  <td className="px-4 py-2.5 font-medium text-ink-900">{formatMoney(r.original, currency)}</td>
                  <td className="px-4 py-2.5 text-ink-700">{formatMoney(r.executedValue, currency)}</td>
                  <td className="px-4 py-2.5 text-ink-500">{formatMoney(r.remaining, currency)}</td>
                  <td className={`px-4 py-2.5 font-medium ${r.variance < 0 ? "text-red-600" : "text-emerald-600"}`}>{formatPercent(r.variance, 1)}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={STATUS_TONE[r.status] || "default"}>{STATUS_LABEL[r.status] || r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add BOQ Item"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !form.description}>{saving ? "Adding…" : "Add Item"}</Button>
          </>
        }
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Item No.">
              <input value={form.item_no} onChange={(e) => setForm((f) => ({ ...f, item_no: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Unit">
              <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className={inputCls} placeholder="m², m³, LS…" />
            </Field>
          </div>
          <Field label="Description" required>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity">
              <input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} className={inputCls} />
            </Field>
            <Field label={`Unit Rate (${currency})`}>
              <input type="number" value={form.unit_rate} onChange={(e) => setForm((f) => ({ ...f, unit_rate: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Executed Quantity">
              <input type="number" value={form.executed_quantity} onChange={(e) => setForm((f) => ({ ...f, executed_quantity: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Button, Card, Field, inputCls, Modal, Skeleton, useToast } from "../../../components/ui.jsx";
import { formatMoney } from "../../../lib/format.js";

export default function CostControl({ project, currency }) {
  const { supabase } = useAuth();
  const { push } = useToast();
  const [costs, setCosts] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [addAlertOpen, setAddAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data: c }, { data: a }] = await Promise.all([
      supabase.from("project_costs").select("*").eq("project_id", project.id).maybeSingle(),
      supabase.from("cost_alerts").select("*").eq("project_id", project.id).order("created_at", { ascending: false }),
    ]);
    setCosts(c);
    setAlerts(a || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  if (costs === null) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const currentContract = Number(costs?.original_contract || 0) + Number(costs?.approved_variations || 0);
  const forecastVariance = Number(costs?.forecast_final_cost || 0) - currentContract;
  const chartData = [
    { name: "Budget", value: currentContract },
    { name: "Committed", value: Number(costs?.committed_cost || 0) },
    { name: "Actual", value: Number(costs?.actual_cost || 0) },
    { name: "Forecast", value: Number(costs?.forecast_final_cost || 0) },
  ];

  function openEdit() {
    setForm({
      original_contract: costs?.original_contract || 0,
      approved_variations: costs?.approved_variations || 0,
      committed_cost: costs?.committed_cost || 0,
      actual_cost: costs?.actual_cost || 0,
      forecast_final_cost: costs?.forecast_final_cost || 0,
    });
    setEditOpen(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v || 0)]));
    let error;
    if (costs?.id) {
      ({ error } = await supabase.from("project_costs").update(payload).eq("id", costs.id));
    } else {
      ({ error } = await supabase.from("project_costs").insert({ project_id: project.id, ...payload }));
    }
    setSaving(false);
    if (error) return push(error.message, "error");
    push("Cost figures updated.", "success");
    setEditOpen(false);
    load();
  }

  async function addAlert(e) {
    e.preventDefault();
    if (!alertMsg.trim()) return;
    const { error } = await supabase.from("cost_alerts").insert({ project_id: project.id, severity: "warning", message: alertMsg.trim() });
    if (error) return push(error.message, "error");
    setAlertMsg("");
    setAddAlertOpen(false);
    load();
  }

  async function removeAlert(id) {
    await supabase.from("cost_alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink-900">Project Cost Control</p>
        <Button size="sm" variant="outline" onClick={openEdit}>
          <Pencil size={13} /> Update Figures
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Metric label="Original Contract" value={formatMoney(costs?.original_contract, currency)} />
        <Metric label="Approved Variations" value={formatMoney(costs?.approved_variations, currency)} />
        <Metric label="Current Contract Value" value={formatMoney(currentContract, currency)} strong />
        <Metric label="Committed Cost" value={formatMoney(costs?.committed_cost, currency)} />
        <Metric label="Actual Cost" value={formatMoney(costs?.actual_cost, currency)} />
        <Metric
          label="Forecast Final Cost"
          value={formatMoney(costs?.forecast_final_cost, currency)}
          strong
          tone={forecastVariance > 0 ? "red" : "green"}
        />
      </div>

      <Card className={`mt-4 flex items-center gap-2.5 p-4 ${forecastVariance > 0 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
        <AlertTriangle size={18} className={forecastVariance > 0 ? "text-red-600" : "text-emerald-600"} />
        <p className={`text-sm font-semibold ${forecastVariance > 0 ? "text-red-700" : "text-emerald-700"}`}>
          Forecast Variance: {forecastVariance > 0 ? "+" : ""}
          {formatMoney(forecastVariance, currency)}
        </p>
      </Card>

      <Card className="mt-5 p-5">
        <p className="text-sm font-bold text-ink-900">Budget vs. Committed vs. Actual vs. Forecast</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#69707f" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatMoney(v, currency, { compact: true })} tick={{ fontSize: 11, fill: "#69707f" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v) => formatMoney(v, currency)} cursor={{ fill: "#f7f8fa" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0e1b30" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-bold text-ink-900">Cost Alerts</p>
        <Button size="sm" variant="ghost" onClick={() => setAddAlertOpen(true)}>
          <Plus size={13} /> Add Alert
        </Button>
      </div>
      <div className="mt-2 space-y-2">
        {alerts.length === 0 && <p className="text-sm text-ink-400">No active cost alerts.</p>}
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`flex items-start justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm ${
              a.severity === "critical" ? "bg-red-50 text-red-700" : a.severity === "warning" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
            }`}
          >
            <span className="flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {a.message}
            </span>
            <button onClick={() => removeAlert(a.id)} className="shrink-0 text-current/50 hover:text-current">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Update Cost Figures"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </>
        }
      >
        {form && (
          <form onSubmit={saveEdit} className="space-y-4">
            {[
              ["original_contract", "Original Contract"],
              ["approved_variations", "Approved Variations"],
              ["committed_cost", "Committed Cost"],
              ["actual_cost", "Actual Cost"],
              ["forecast_final_cost", "Forecast Final Cost"],
            ].map(([key, label]) => (
              <Field key={key} label={`${label} (${currency})`}>
                <input type="number" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className={inputCls} />
              </Field>
            ))}
          </form>
        )}
      </Modal>

      <Modal
        open={addAlertOpen}
        onClose={() => setAddAlertOpen(false)}
        title="Add Cost Alert"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddAlertOpen(false)}>Cancel</Button>
            <Button onClick={addAlert} disabled={!alertMsg.trim()}>Add Alert</Button>
          </>
        }
      >
        <form onSubmit={addAlert}>
          <Field label="Alert Message">
            <textarea value={alertMsg} onChange={(e) => setAlertMsg(e.target.value)} className={inputCls} rows={3} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}

function Metric({ label, value, strong, tone }) {
  const toneCls = tone === "red" ? "text-red-600" : tone === "green" ? "text-emerald-600" : "text-ink-900";
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className={`mt-1.5 font-bold ${strong ? "text-lg" : "text-base"} ${toneCls}`}>{value}</p>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Users, Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Badge, Button, EmptyState, Field, inputCls, Modal, Skeleton, useToast } from "../../../components/ui.jsx";
import { PROJECT_TEAM_ROLES } from "../../../lib/constants.js";
import { formatPercent, initials } from "../../../lib/format.js";

function blankForm() {
  return { full_name: "", role: PROJECT_TEAM_ROLES[0] };
}

export default function Team({ project }) {
  const { supabase } = useAuth();
  const { push } = useToast();
  const [rows, setRows] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("project_members").select("*").eq("project_id", project.id).order("created_at");
    setRows(data || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("project_members").insert({ project_id: project.id, ...form, tasks_count: 0, performance: 0, status: "active" });
    setSaving(false);
    if (error) return push(error.message, "error");
    push("Team member added.", "success");
    setModalOpen(false);
    setForm(blankForm());
    load();
  }

  if (rows === null) return <Skeleton className="h-72" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink-900">Project Team</p>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={13} /> Add Member
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Users} title="No team members assigned" description="Add engineers, contractors and consultants working on this project." />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">{initials(m.full_name)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{m.full_name}</p>
                <p className="truncate text-xs text-ink-400">{m.role}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-ink-400">
                  <span>{m.tasks_count} tasks</span>
                  <span>·</span>
                  <span>{formatPercent(m.performance)} performance</span>
                </div>
              </div>
              <Badge tone={m.status === "active" ? "green" : "slate"}>{m.status}</Badge>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Team Member"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !form.full_name}>{saving ? "Adding…" : "Add Member"}</Button>
          </>
        }
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Field label="Full Name" required>
            <input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className={inputCls} required />
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inputCls}>
              {PROJECT_TEAM_ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
        </form>
      </Modal>
    </div>
  );
}

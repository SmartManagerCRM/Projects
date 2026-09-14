import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Calculator, MapPin } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Card, EmptyState, PageHeader, ProgressBar, Skeleton } from "../../components/ui.jsx";
import { DEV_PIPELINE_STAGES, DEV_PIPELINE_LABEL, UNIT_STATUS } from "../../lib/constants.js";
import { formatDate, formatMoney, formatPercent } from "../../lib/format.js";

export default function RealEstateDashboard() {
  const { supabase } = useAuth();
  const { company, projects } = useCompany();
  const [devs, setDevs] = useState(null);
  const [units, setUnits] = useState({});

  const reProjects = useMemo(() => projects.filter((p) => p.is_real_estate), [projects]);

  useEffect(() => {
    if (reProjects.length === 0) {
      setDevs([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("real_estate_developments")
        .select("*")
        .in("project_id", reProjects.map((p) => p.id));
      setDevs(data || []);
      if (data?.length) {
        const { data: unitRows } = await supabase.from("real_estate_units").select("development_id, status").in("development_id", data.map((d) => d.id));
        const grouped = {};
        (unitRows || []).forEach((u) => {
          grouped[u.development_id] = grouped[u.development_id] || {};
          grouped[u.development_id][u.status] = (grouped[u.development_id][u.status] || 0) + 1;
        });
        setUnits(grouped);
      }
    })();
  }, [supabase, reProjects]);

  const currency = company?.currency || "SAR";

  const portfolioUnits = useMemo(() => {
    const totals = {};
    Object.values(units).forEach((u) => Object.entries(u).forEach(([k, v]) => (totals[k] = (totals[k] || 0) + v)));
    return totals;
  }, [units]);

  return (
    <div>
      <PageHeader
        eyebrow="Real Estate"
        title="Real Estate Development"
        subtitle="Sales pipeline, unit inventory and delivery status across your developments."
        actions={
          <Link to="/app/real-estate/feasibility" className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">
            <Calculator size={15} /> Feasibility Tool
          </Link>
        }
      />

      {devs === null ? (
        <Skeleton className="h-64" />
      ) : reProjects.length === 0 ? (
        <EmptyState icon={Home} title="No real-estate developments yet" description="Mark a project as a real-estate development to unlock the sales pipeline and unit dashboard." />
      ) : (
        <>
          {Object.keys(portfolioUnits).length > 0 && (
            <Card className="mb-6 p-5">
              <p className="text-sm font-bold text-ink-900">Portfolio Unit Status</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {Object.entries(UNIT_STATUS).map(([key, meta]) => (
                  <div key={key} className="rounded-lg bg-ink-50 p-3">
                    <p className="text-xs text-ink-500">{meta.label}</p>
                    <p className="mt-1 text-xl font-bold text-ink-900">{portfolioUnits[key] || 0}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="space-y-6">
            {reProjects.map((p) => {
              const dev = devs.find((d) => d.project_id === p.id);
              const unitCounts = dev ? units[dev.id] || {} : {};
              const totalUnits = dev?.total_units || 0;
              const soldPct = totalUnits ? ((unitCounts.sold || 0) / totalUnits) * 100 : 0;
              return (
                <Card key={p.id} className="overflow-hidden">
                  <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr,1fr]">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{totalUnits} Units</p>
                          <h3 className="text-lg font-bold text-ink-900">{p.name}</h3>
                          <p className="flex items-center gap-1 text-xs text-ink-400"><MapPin size={11} /> {p.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-ink-400">Expected Completion</p>
                          <p className="text-sm font-bold text-ink-900">{formatDate(dev?.expected_completion)}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Metric label="Units Sold" value={unitCounts.sold || 0} />
                        <Metric label="Units Available" value={unitCounts.available || 0} />
                        <Metric label="Sales Value" value={formatMoney(dev?.sales_value, currency, { compact: true })} />
                        <Metric label="Construction Budget" value={formatMoney(dev?.construction_budget, currency, { compact: true })} />
                      </div>

                      <div className="mt-4">
                        <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink-500">
                          <span>Construction Progress</span>
                          <span className="text-ink-900">{formatPercent(p.progress)}</span>
                        </div>
                        <ProgressBar value={p.progress} tone="navy" />
                        <div className="mb-1.5 mt-3 flex justify-between text-xs font-semibold text-ink-500">
                          <span>Units Sold</span>
                          <span className="text-ink-900">{formatPercent(soldPct)}</span>
                        </div>
                        <ProgressBar value={soldPct} tone="gold" />
                      </div>

                      <div className="mt-5">
                        <p className="mb-2 text-xs font-semibold text-ink-500">Development Pipeline</p>
                        <div className="scrollbar-none flex gap-1 overflow-x-auto pb-1">
                          {DEV_PIPELINE_STAGES.map((stage, i) => {
                            const currentIdx = DEV_PIPELINE_STAGES.indexOf(dev?.pipeline_stage);
                            const state = i < currentIdx ? "done" : i === currentIdx ? "current" : "todo";
                            return (
                              <div key={stage} className="flex items-center">
                                <span
                                  className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                    state === "current" ? "bg-gold-500 text-navy-950" : state === "done" ? "bg-navy-900 text-white" : "bg-ink-100 text-ink-400"
                                  }`}
                                >
                                  {DEV_PIPELINE_LABEL[stage]}
                                </span>
                                {i < DEV_PIPELINE_STAGES.length - 1 && <span className="mx-1 h-px w-3 bg-ink-200" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center rounded-xl bg-ink-50 p-4">
                      {totalUnits > 0 ? (
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={Object.entries(UNIT_STATUS).map(([k, m]) => ({ name: m.label, value: unitCounts[k] || 0, color: m.color }))}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                              >
                                {Object.entries(UNIT_STATUS).map(([k, m]) => (
                                  <Cell key={k} fill={m.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-sm text-ink-400">No units configured yet.</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-0.5 text-base font-bold text-ink-900">{value}</p>
    </div>
  );
}

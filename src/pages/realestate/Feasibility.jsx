import { useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Card, Field, inputCls, PageHeader } from "../../components/ui.jsx";
import { formatMoney, formatPercent } from "../../lib/format.js";

const DEFAULTS = {
  land_cost: 8000000,
  construction_cost: 18500000,
  consultant_cost: 900000,
  marketing_cost: 650000,
  financing_cost: 1100000,
  total_area: 14500,
  number_of_units: 84,
  expected_sales_revenue: 31500000,
};

export default function Feasibility() {
  const { company } = useCompany();
  const currency = company?.currency || "SAR";
  const [form, setForm] = useState(DEFAULTS);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const result = useMemo(() => {
    const totalCost =
      Number(form.land_cost || 0) + Number(form.construction_cost || 0) + Number(form.consultant_cost || 0) + Number(form.marketing_cost || 0) + Number(form.financing_cost || 0);
    const revenue = Number(form.expected_sales_revenue || 0);
    const profit = revenue - totalCost;
    const margin = revenue ? (profit / revenue) * 100 : 0;
    const costPerSqm = Number(form.total_area || 0) ? totalCost / Number(form.total_area) : 0;
    const avgUnitPrice = Number(form.number_of_units || 0) ? revenue / Number(form.number_of_units) : 0;
    const roi = totalCost ? (profit / totalCost) * 100 : 0;
    return { totalCost, revenue, profit, margin, costPerSqm, avgUnitPrice, roi };
  }, [form]);

  const FIELDS = [
    ["land_cost", "Land Cost"],
    ["construction_cost", "Construction Cost"],
    ["consultant_cost", "Consultant Cost"],
    ["marketing_cost", "Marketing Cost"],
    ["financing_cost", "Financing Cost"],
    ["expected_sales_revenue", "Expected Sales Revenue"],
  ];

  return (
    <div>
      <PageHeader eyebrow="Real Estate" title="Development Feasibility" subtitle="A quick planning and estimation tool for new development opportunities." />

      <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
        <Info size={15} className="mt-0.5 shrink-0" />
        This is a planning / estimation tool for early-stage feasibility screening — not a substitute for a full financial appraisal.
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <Card className="p-5">
          <p className="mb-4 text-sm font-bold text-ink-900">Inputs</p>
          <div className="space-y-4">
            {FIELDS.map(([key, label]) => (
              <Field key={key} label={`${label} (${currency})`}>
                <input type="number" min="0" value={form[key]} onChange={(e) => update(key, e.target.value)} className={inputCls} />
              </Field>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Number of Units">
                <input type="number" min="0" value={form.number_of_units} onChange={(e) => update("number_of_units", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Total Built-up Area (m²)">
                <input type="number" min="0" value={form.total_area} onChange={(e) => update("total_area", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="bg-navy-950 px-5 py-4 text-white">
            <p className="flex items-center gap-2 text-sm font-bold"><Calculator size={16} className="text-gold-400" /> Feasibility Summary</p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-ink-100">
            <ResultTile label="Total Development Cost" value={formatMoney(result.totalCost, currency, { compact: true })} />
            <ResultTile label="Expected Revenue" value={formatMoney(result.revenue, currency, { compact: true })} />
            <ResultTile label="Gross Profit" value={formatMoney(result.profit, currency, { compact: true })} tone={result.profit >= 0 ? "green" : "red"} />
            <ResultTile label="Estimated Margin" value={formatPercent(result.margin, 1)} tone={result.margin >= 0 ? "green" : "red"} />
            <ResultTile label="Cost per m²" value={formatMoney(result.costPerSqm, currency)} />
            <ResultTile label="Average Unit Price" value={formatMoney(result.avgUnitPrice, currency)} />
            <ResultTile label="ROI" value={formatPercent(result.roi, 1)} tone={result.roi >= 0 ? "green" : "red"} full />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResultTile({ label, value, tone, full }) {
  const toneCls = tone === "red" ? "text-red-600" : tone === "green" ? "text-emerald-600" : "text-ink-900";
  return (
    <div className={`p-5 ${full ? "col-span-2" : ""}`}>
      <p className="text-xs text-ink-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${toneCls}`}>{value}</p>
    </div>
  );
}

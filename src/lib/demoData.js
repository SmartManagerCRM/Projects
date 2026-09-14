// Populates a company's workspace with a realistic, clearly-fictional demo
// dataset spanning contracting, construction and real-estate development —
// so the platform can be walked through end-to-end in a live sales demo.

const UNIT_TYPES = [
  { type: "Studio", area: 48, price: 320000 },
  { type: "1 Bedroom", area: 78, price: 520000 },
  { type: "2 Bedroom", area: 118, price: 760000 },
  { type: "3 Bedroom", area: 165, price: 1050000 },
  { type: "Townhouse", area: 240, price: 1650000 },
];

function unitRows(developmentId, distribution) {
  const rows = [];
  let n = 1;
  for (const [status, count] of Object.entries(distribution)) {
    for (let i = 0; i < count; i++) {
      const u = UNIT_TYPES[n % UNIT_TYPES.length];
      const building = String.fromCharCode(65 + (n % 4));
      rows.push({
        development_id: developmentId,
        unit_number: `${building}-${100 + n}`,
        unit_type: u.type,
        area_sqm: u.area,
        price: u.price + (n % 5) * 15000,
        status,
      });
      n++;
    }
  }
  return rows;
}

const PROJECT_SEEDS = [
  {
    name: "Al Salam Residential Development",
    code: "PRJ-1001",
    project_type: "Residential Development",
    client: "Al Salam Real Estate Co.",
    location: "Jeddah, Saudi Arabia",
    contract_value: 18500000,
    start_date: "2024-02-01",
    planned_completion_date: "2026-06-30",
    project_manager: "Faisal Al-Otaibi",
    progress: 68,
    planned_progress: 71,
    budget_utilization: 80,
    schedule_health: "attention",
    cost_health: "attention",
    quality_health: "on_track",
    procurement_health: "at_risk",
    safety_health: "on_track",
    is_real_estate: false,
    work_packages: [
      { name: "Structure", progress: 88 },
      { name: "Architecture", progress: 62 },
      { name: "MEP", progress: 47 },
      { name: "External Works", progress: 31 },
      { name: "Landscape", progress: 24 },
    ],
    costs: { original_contract: 18500000, approved_variations: 750000, committed_cost: 16100000, actual_cost: 15400000, forecast_final_cost: 19800000 },
    cost_alerts: [
      { severity: "critical", message: "Forecast final cost exceeds approved budget." },
      { severity: "warning", message: "Concrete package cost is 8% above baseline." },
      { severity: "warning", message: "Three subcontractor invoices are pending approval." },
    ],
    boq: [
      { item_no: "1.1", description: "Excavation and earthworks", unit: "m³", quantity: 12500, unit_rate: 38, executed_quantity: 12500, status: "completed" },
      { item_no: "1.2", description: "Reinforced concrete foundations", unit: "m³", quantity: 3200, unit_rate: 620, executed_quantity: 3040, status: "in_progress" },
      { item_no: "2.1", description: "Structural concrete frame", unit: "m³", quantity: 8800, unit_rate: 590, executed_quantity: 7480, status: "in_progress" },
      { item_no: "2.2", description: "Block masonry works", unit: "m²", quantity: 21000, unit_rate: 65, executed_quantity: 12600, status: "in_progress" },
      { item_no: "3.1", description: "External cladding and finishes", unit: "m²", quantity: 9600, unit_rate: 310, executed_quantity: 2100, status: "in_progress" },
      { item_no: "4.1", description: "MEP first-fix installation", unit: "LS", quantity: 1, unit_rate: 4200000, executed_quantity: 0.47, status: "in_progress" },
      { item_no: "5.1", description: "Landscaping and external works", unit: "m²", quantity: 14000, unit_rate: 145, executed_quantity: 3360, status: "in_progress" },
    ],
    rfis: [
      { rfi_number: "RFI-024", subject: "Foundation Detail Clarification", discipline: "Structural", days_open: 8, responsible_party: "Structural Design Consultant", priority: "high", status: "overdue" },
      { rfi_number: "RFI-031", subject: "MEP Riser Shaft Coordination", discipline: "MEP", days_open: 3, responsible_party: "MEP Consultant", priority: "medium", status: "open" },
      { rfi_number: "RFI-033", subject: "Facade Cladding Fixing Detail", discipline: "Architectural", days_open: 1, responsible_party: "Architect", priority: "medium", status: "open" },
      { rfi_number: "RFI-019", subject: "Parking Ramp Gradient Confirmation", discipline: "Civil", days_open: 14, responsible_party: "Civil Consultant", priority: "low", status: "closed", response: "Confirmed at 12% gradient per approved drawing rev C." },
    ],
    approvals: [
      { approval_type: "Material Submittal", title: "Precast Concrete Panels — Supplier Datasheet", status: "pending", submitted_by: "Site Engineer" },
      { approval_type: "Shop Drawing", title: "Level 3 MEP Coordination Drawing", status: "pending", submitted_by: "MEP Contractor" },
      { approval_type: "Payment Certificate", title: "Interim Payment Certificate #9", status: "approved", submitted_by: "Quantity Surveyor" },
      { approval_type: "Variation Order", title: "VO-07 — Additional Landscaping Scope", status: "pending", submitted_by: "Project Manager" },
    ],
    risks: [
      { title: "Material delivery delay", category: "Procurement", probability: "high", impact: "high", risk_score: 16, owner: "Procurement Officer", mitigation: "Alternative supplier identified + expedited procurement in progress.", status: "open" },
      { title: "Concrete cost escalation", category: "Cost", probability: "medium", impact: "high", risk_score: 12, owner: "Quantity Surveyor", mitigation: "Renegotiating supply agreement; evaluating alternate mix design.", status: "open" },
      { title: "Skilled labor shortage — MEP trades", category: "Resource", probability: "medium", impact: "medium", risk_score: 9, owner: "Project Manager", mitigation: "Engaging second MEP subcontractor for peak period.", status: "open" },
      { title: "Utility connection permit delay", category: "Regulatory", probability: "low", impact: "high", risk_score: 8, owner: "Project Director", mitigation: "Early engagement with utility authority; permit expediter engaged.", status: "mitigated" },
    ],
    procurement: [
      { item: "Reinforcement Steel — Grade 60", category: "Materials", supplier: "Gulf Steel Industries", status: "delayed", delay_days: 5 },
      { item: "MEP Chiller Units (3x)", category: "Equipment", supplier: "Climate Systems Arabia", status: "pending_approval", delay_days: 0 },
      { item: "Ready-Mix Cement Supply", category: "Materials", supplier: "Saudi Readymix Co.", status: "on_schedule", delay_days: 0 },
      { item: "Curtain Wall Glazing System", category: "Materials", supplier: "Al Rashid Glass & Aluminium", status: "on_schedule", delay_days: 0 },
    ],
    team: [
      { full_name: "Faisal Al-Otaibi", role: "Project Manager", tasks_count: 24, performance: 92 },
      { full_name: "Noura Al-Harbi", role: "Site Engineer", tasks_count: 31, performance: 88 },
      { full_name: "Khalid Al-Dosari", role: "Quantity Surveyor", tasks_count: 18, performance: 95 },
      { full_name: "Yousef Al-Ghamdi", role: "Structural Engineer", tasks_count: 15, performance: 90 },
    ],
    daily_report: {
      weather: "Clear, 34°C",
      manpower: 142,
      equipment: "2 Tower Cranes, 4 Concrete Pumps, 6 Excavators",
      completed_activities: "Completed formwork for Level 4 slab; continued block masonry on Level 2; MEP first-fix ongoing in Levels 1-2.",
      quantities: "Concrete poured: 180 m³ · Block masonry: 420 m²",
      materials_received: "Reinforcement steel delivery (delayed) — 40 tons received of 65 tons ordered.",
      site_issues: "Partial steel delivery short by 25 tons; alternate supplier being engaged.",
      safety_observations: "Toolbox talk conducted — working at height. No incidents reported.",
      delays: "Reinforcement steel delivery delayed 5 days, affecting Level 5 slab pour schedule.",
      required_actions: "Expedite remaining steel delivery; confirm MEP shop drawing approval for Level 3.",
      tomorrow_plan: "Continue Level 4 slab pour; commence Level 3 block masonry; MEP first-fix Level 3.",
    },
  },
  {
    name: "Al Noor Commercial Center",
    code: "PRJ-1002",
    project_type: "Commercial Development",
    client: "Al Noor Investment Group",
    location: "Riyadh, Saudi Arabia",
    contract_value: 12800000,
    start_date: "2024-08-15",
    planned_completion_date: "2026-11-30",
    project_manager: "Sara Al-Mutairi",
    progress: 42,
    planned_progress: 45,
    budget_utilization: 44,
    schedule_health: "on_track",
    cost_health: "on_track",
    quality_health: "on_track",
    procurement_health: "on_track",
    safety_health: "on_track",
    is_real_estate: false,
    work_packages: [
      { name: "Structure", progress: 71 },
      { name: "Architecture", progress: 38 },
      { name: "MEP", progress: 22 },
      { name: "External Works", progress: 10 },
      { name: "Landscape", progress: 5 },
    ],
    costs: { original_contract: 12800000, approved_variations: 180000, committed_cost: 6200000, actual_cost: 5700000, forecast_final_cost: 12950000 },
    cost_alerts: [{ severity: "info", message: "Cost performance tracking within 1% of baseline." }],
    boq: [
      { item_no: "1.1", description: "Piling and foundations", unit: "m³", quantity: 2600, unit_rate: 710, executed_quantity: 2600, status: "completed" },
      { item_no: "2.1", description: "Structural steel frame", unit: "ton", quantity: 1450, unit_rate: 5800, executed_quantity: 980, status: "in_progress" },
      { item_no: "3.1", description: "Curtain wall facade", unit: "m²", quantity: 7200, unit_rate: 420, executed_quantity: 900, status: "not_started" },
      { item_no: "4.1", description: "MEP rough-in", unit: "LS", quantity: 1, unit_rate: 3100000, executed_quantity: 0.22, status: "in_progress" },
    ],
    rfis: [
      { rfi_number: "RFI-041", subject: "Atrium Skylight Structural Detail", discipline: "Structural", days_open: 2, responsible_party: "Structural Consultant", priority: "medium", status: "open" },
      { rfi_number: "RFI-038", subject: "Retail Unit Shopfront Specification", discipline: "Architectural", days_open: 6, responsible_party: "Architect", priority: "low", status: "open" },
    ],
    approvals: [
      { approval_type: "Method Statement", title: "Structural Steel Erection Method Statement", status: "approved", submitted_by: "Steel Contractor" },
      { approval_type: "Design Revision", title: "Ground Floor Retail Layout Revision", status: "pending", submitted_by: "Architect" },
    ],
    risks: [
      { title: "Steel price volatility", category: "Cost", probability: "medium", impact: "medium", risk_score: 9, owner: "Quantity Surveyor", mitigation: "Price locked via forward supply agreement for 70% of tonnage.", status: "open" },
      { title: "Adjacent site access constraints", category: "Logistics", probability: "low", impact: "medium", risk_score: 6, owner: "Site Supervisor", mitigation: "Coordinated delivery schedule with neighboring site management.", status: "open" },
    ],
    procurement: [
      { item: "Structural Steel Sections", category: "Materials", supplier: "Eastern Province Steel", status: "on_schedule", delay_days: 0 },
      { item: "Curtain Wall Aluminium Extrusions", category: "Materials", supplier: "Al Rashid Glass & Aluminium", status: "on_schedule", delay_days: 0 },
    ],
    team: [
      { full_name: "Sara Al-Mutairi", role: "Project Manager", tasks_count: 19, performance: 91 },
      { full_name: "Omar Al-Zahrani", role: "Site Engineer", tasks_count: 22, performance: 87 },
    ],
    daily_report: {
      weather: "Sunny, 38°C",
      manpower: 96,
      equipment: "1 Tower Crane, 3 Welding Units, 2 Mobile Cranes",
      completed_activities: "Steel erection progressed to Level 6; curtain wall mock-up panel installed for approval.",
      quantities: "Steel erected: 38 tons · Bolted connections completed: 640",
      materials_received: "Steel sections batch 7 of 12 received on schedule.",
      site_issues: "None significant.",
      safety_observations: "Fall protection audit completed — 2 minor non-conformances closed out.",
      delays: "No active delays.",
      required_actions: "Finalize curtain wall mock-up approval to unlock facade procurement.",
      tomorrow_plan: "Continue Level 6-7 steel erection; MEP rough-in Level 2.",
    },
  },
  {
    name: "Premium Villa Development",
    code: "PRJ-1003",
    project_type: "Villa Development",
    client: "Private Family Office",
    location: "Jeddah, Saudi Arabia",
    contract_value: 5400000,
    start_date: "2024-01-10",
    planned_completion_date: "2025-10-31",
    project_manager: "Abdullah Al-Qahtani",
    progress: 81,
    planned_progress: 79,
    budget_utilization: 76,
    schedule_health: "on_track",
    cost_health: "on_track",
    quality_health: "on_track",
    procurement_health: "on_track",
    safety_health: "on_track",
    is_real_estate: false,
    work_packages: [
      { name: "Structure", progress: 100 },
      { name: "Architecture", progress: 92 },
      { name: "MEP", progress: 78 },
      { name: "External Works", progress: 55 },
      { name: "Landscape", progress: 40 },
    ],
    costs: { original_contract: 5400000, approved_variations: 120000, committed_cost: 4300000, actual_cost: 4180000, forecast_final_cost: 5460000 },
    cost_alerts: [{ severity: "info", message: "Project tracking on budget — no material variance detected." }],
    boq: [
      { item_no: "1.1", description: "Foundations and structure", unit: "m³", quantity: 1400, unit_rate: 640, executed_quantity: 1400, status: "completed" },
      { item_no: "2.1", description: "Architectural finishes", unit: "m²", quantity: 3200, unit_rate: 380, executed_quantity: 2944, status: "in_progress" },
      { item_no: "3.1", description: "Joinery and millwork", unit: "LS", quantity: 1, unit_rate: 620000, executed_quantity: 0.7, status: "in_progress" },
      { item_no: "4.1", description: "Swimming pool and landscaping", unit: "LS", quantity: 1, unit_rate: 480000, executed_quantity: 0.4, status: "in_progress" },
    ],
    rfis: [{ rfi_number: "RFI-055", subject: "Master Bathroom Marble Specification", discipline: "Interior", days_open: 1, responsible_party: "Interior Designer", priority: "low", status: "open" }],
    approvals: [{ approval_type: "Material Submittal", title: "Imported Marble Flooring Sample Approval", status: "approved", submitted_by: "Interior Designer" }],
    risks: [{ title: "Imported finishes lead time", category: "Procurement", probability: "low", impact: "medium", risk_score: 6, owner: "Procurement Officer", mitigation: "Orders placed 4 months ahead of installation milestone.", status: "mitigated" }],
    procurement: [{ item: "Imported Marble Flooring", category: "Materials", supplier: "Levantine Stone Trading", status: "on_schedule", delay_days: 0 }],
    team: [{ full_name: "Abdullah Al-Qahtani", role: "Project Manager", tasks_count: 27, performance: 94 }],
    daily_report: {
      weather: "Clear, 33°C",
      manpower: 38,
      equipment: "1 Mobile Crane, Joinery Installation Crew",
      completed_activities: "Marble flooring installation in living areas; pool shell waterproofing completed.",
      quantities: "Flooring installed: 210 m²",
      materials_received: "Joinery batch 3 delivered and inspected.",
      site_issues: "None.",
      safety_observations: "No incidents. Housekeeping audit passed.",
      delays: "No active delays.",
      required_actions: "Confirm landscaping irrigation layout with client.",
      tomorrow_plan: "Continue flooring in bedrooms; begin external wall cladding.",
    },
  },
];

const REAL_ESTATE_SEED = {
  name: "Marina Residences",
  code: "PRJ-1004",
  project_type: "Residential Development",
  client: "SmartManager Projects Demo Company",
  location: "Jeddah Corniche, Saudi Arabia",
  contract_value: 18700000,
  start_date: "2023-09-01",
  planned_completion_date: "2027-03-31",
  project_manager: "Lama Al-Sudairi",
  progress: 43,
  planned_progress: 46,
  budget_utilization: 52,
  schedule_health: "attention",
  cost_health: "on_track",
  quality_health: "on_track",
  procurement_health: "on_track",
  safety_health: "on_track",
  is_real_estate: true,
  work_packages: [
    { name: "Structure", progress: 76 },
    { name: "Architecture", progress: 45 },
    { name: "MEP", progress: 30 },
    { name: "External Works", progress: 18 },
    { name: "Landscape", progress: 12 },
  ],
  costs: { original_contract: 18700000, approved_variations: 0, committed_cost: 9800000, actual_cost: 9100000, forecast_final_cost: 18600000 },
  cost_alerts: [{ severity: "info", message: "Construction spend tracking under budget." }],
  boq: [
    { item_no: "1.1", description: "Piling and substructure", unit: "m³", quantity: 4800, unit_rate: 520, executed_quantity: 4800, status: "completed" },
    { item_no: "2.1", description: "Superstructure — Towers A & B", unit: "m³", quantity: 11200, unit_rate: 580, executed_quantity: 6720, status: "in_progress" },
  ],
  rfis: [{ rfi_number: "RFI-061", subject: "Podium Waterproofing Detail", discipline: "Structural", days_open: 4, responsible_party: "Structural Consultant", priority: "medium", status: "open" }],
  approvals: [{ approval_type: "Shop Drawing", title: "Tower A Podium Waterproofing Shop Drawing", status: "pending", submitted_by: "Waterproofing Contractor" }],
  risks: [{ title: "Sales pace below launch forecast", category: "Commercial", probability: "medium", impact: "medium", risk_score: 9, owner: "Sales Director", mitigation: "Targeted marketing campaign launched for remaining inventory.", status: "open" }],
  procurement: [{ item: "Precast Facade Panels", category: "Materials", supplier: "Gulf Precast Solutions", status: "on_schedule", delay_days: 0 }],
  team: [{ full_name: "Lama Al-Sudairi", role: "Project Manager", tasks_count: 21, performance: 90 }],
  daily_report: {
    weather: "Humid, 31°C",
    manpower: 165,
    equipment: "3 Tower Cranes, 5 Concrete Pumps",
    completed_activities: "Tower A core walls up to Level 9; Tower B podium slab completed.",
    quantities: "Concrete poured: 310 m³",
    materials_received: "Precast facade panel batch 2 received.",
    site_issues: "None significant.",
    safety_observations: "Weekly safety walk completed — no violations.",
    delays: "No active delays.",
    required_actions: "Approve podium waterproofing shop drawing to maintain schedule.",
    tomorrow_plan: "Continue Tower A core walls Level 10; commence Tower B column works.",
  },
  development: {
    total_units: 84,
    sales_value: 31500000,
    construction_budget: 18700000,
    expected_completion: "2027-03-31",
    pipeline_stage: "construction",
    unit_distribution: { sold: 51, reserved: 8, available: 20, under_construction: 3, handed_over: 2 },
  },
};

const DEMO_NOTIFICATIONS = [
  { severity: "error", message: "RFI-024 (Foundation Detail Clarification) is overdue on Al Salam Residential Development." },
  { severity: "warning", message: "Approval pending: Level 3 MEP Coordination Drawing — Al Salam Residential Development." },
  { severity: "error", message: "Project delay detected on Al Salam Residential Development — 4% behind planned progress." },
  { severity: "warning", message: "Budget threshold reached on Al Salam Residential Development — forecast exceeds approved contract." },
  { severity: "success", message: "Daily report generated for Al Noor Commercial Center." },
];

export async function loadDemoData(supabase, company, actorId) {
  const currency = company.currency || "SAR";
  const allSeeds = [...PROJECT_SEEDS, REAL_ESTATE_SEED];

  for (const seed of allSeeds) {
    const { data: proj, error: projErr } = await supabase
      .from("projects")
      .insert({
        company_id: company.id,
        name: seed.name,
        code: seed.code,
        project_type: seed.project_type,
        client: seed.client,
        location: seed.location,
        contract_value: seed.contract_value,
        currency,
        start_date: seed.start_date,
        planned_completion_date: seed.planned_completion_date,
        project_manager: seed.project_manager,
        progress: seed.progress,
        planned_progress: seed.planned_progress,
        budget_utilization: seed.budget_utilization,
        schedule_health: seed.schedule_health,
        cost_health: seed.cost_health,
        quality_health: seed.quality_health,
        procurement_health: seed.procurement_health,
        safety_health: seed.safety_health,
        is_real_estate: seed.is_real_estate,
      })
      .select()
      .single();
    if (projErr) throw projErr;
    const projectId = proj.id;

    await supabase.from("work_packages").insert(seed.work_packages.map((wp, i) => ({ project_id: projectId, sort_order: i, ...wp })));
    await supabase.from("project_costs").insert({ project_id: projectId, ...seed.costs });
    await supabase.from("cost_alerts").insert(seed.cost_alerts.map((a) => ({ project_id: projectId, ...a })));
    await supabase.from("boq_items").insert(seed.boq.map((b, i) => ({ project_id: projectId, sort_order: i, ...b })));

    await supabase.from("rfis").insert(
      seed.rfis.map((r) => {
        const { days_open, ...rest } = r;
        const submitted = new Date();
        submitted.setDate(submitted.getDate() - days_open);
        return {
          project_id: projectId,
          ...rest,
          submitted_date: submitted.toISOString().slice(0, 10),
          due_date: new Date(submitted.getTime() + 5 * 86400000).toISOString().slice(0, 10),
        };
      })
    );

    await supabase.from("approvals").insert(seed.approvals.map((a) => ({ project_id: projectId, ...a })));
    await supabase.from("risks").insert(seed.risks.map((r) => ({ project_id: projectId, ...r })));
    await supabase.from("procurement_items").insert(
      seed.procurement.map((p) => ({
        project_id: projectId,
        ...p,
        expected_date: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      }))
    );
    await supabase.from("project_members").insert(seed.team.map((t) => ({ project_id: projectId, ...t })));
    await supabase.from("daily_reports").insert({
      project_id: projectId,
      report_date: new Date().toISOString().slice(0, 10),
      created_by: actorId,
      photos: [],
      ...seed.daily_report,
    });

    if (seed.development) {
      const { data: dev, error: devErr } = await supabase
        .from("real_estate_developments")
        .insert({
          project_id: projectId,
          total_units: seed.development.total_units,
          sales_value: seed.development.sales_value,
          construction_budget: seed.development.construction_budget,
          expected_completion: seed.development.expected_completion,
          pipeline_stage: seed.development.pipeline_stage,
        })
        .select()
        .single();
      if (devErr) throw devErr;
      await supabase.from("real_estate_units").insert(unitRows(dev.id, seed.development.unit_distribution));
    }
  }

  await supabase.from("notifications").insert(DEMO_NOTIFICATIONS.map((n) => ({ company_id: company.id, user_id: actorId, ...n })));
  await supabase.from("companies").update({ demo_seeded: true }).eq("id", company.id);
}

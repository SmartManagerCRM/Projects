export const COMPANY_TYPES = [
  { value: "contracting", label: "Contracting Company" },
  { value: "developer", label: "Real Estate Developer" },
  { value: "consultancy", label: "Engineering Consultancy" },
  { value: "construction", label: "Construction Company" },
  { value: "pm", label: "Project Management Company" },
  { value: "other", label: "Other" },
];

export const COMPANY_TYPE_LABEL = Object.fromEntries(COMPANY_TYPES.map((t) => [t.value, t.label]));

export const EMPLOYEE_RANGES = ["1-10", "11-50", "51-200", "201-500", "500+"];

export const COUNTRIES = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Egypt",
  "Jordan",
  "United Kingdom",
  "United States",
  "Other",
];

export const CURRENCIES = ["SAR", "USD", "EUR", "GBP", "AED", "QAR", "KWD", "EGP"];

export const MODULES = [
  { key: "projects", label: "Projects" },
  { key: "costs", label: "Costs" },
  { key: "boq", label: "BOQ" },
  { key: "rfis", label: "RFIs" },
  { key: "reports", label: "Reports" },
  { key: "documents", label: "Documents" },
  { key: "risks", label: "Risks" },
  { key: "procurement", label: "Procurement" },
  { key: "contractors", label: "Contractors" },
  { key: "real_estate", label: "Real Estate Developments" },
];

export const PROJECT_TYPES = [
  "Residential Development",
  "Commercial Development",
  "Villa Development",
  "Mixed-Use Development",
  "Infrastructure",
  "Industrial",
  "Renovation / Fit-out",
  "Other",
];

export const MEMBER_ROLES = [
  { value: "company_admin", label: "Company Admin" },
  { value: "project_director", label: "Project Director" },
  { value: "project_manager", label: "Project Manager" },
  { value: "engineer", label: "Engineer" },
  { value: "quantity_surveyor", label: "Quantity Surveyor" },
  { value: "procurement", label: "Procurement" },
  { value: "site_supervisor", label: "Site Supervisor" },
  { value: "viewer", label: "Viewer" },
];

export const MEMBER_ROLE_LABEL = Object.fromEntries(MEMBER_ROLES.map((r) => [r.value, r.label]));

export const ROLE_PERMISSIONS = {
  super_admin: { label: "Super Admin", perms: ["Projects", "Reports", "RFIs", "Risks", "Documents", "Cost Control", "Company Settings", "User Management"] },
  company_admin: { label: "Company Admin", perms: ["Projects", "Reports", "RFIs", "Risks", "Documents", "Cost Control", "Company Settings", "User Management"] },
  project_director: { label: "Project Director", perms: ["Projects", "Reports", "RFIs", "Risks", "Documents", "Cost Control"] },
  project_manager: { label: "Project Manager", perms: ["Projects", "Reports", "RFIs", "Risks", "Documents", "Cost Control"] },
  engineer: { label: "Engineer", perms: ["Projects", "RFIs", "Documents"] },
  quantity_surveyor: { label: "Quantity Surveyor", perms: ["Projects", "Cost Control", "Documents"] },
  procurement: { label: "Procurement", perms: ["Projects", "Documents"] },
  site_supervisor: { label: "Site Supervisor", perms: ["Projects", "Documents"] },
  viewer: { label: "Viewer", perms: ["Projects"] },
};

export const PROJECT_TEAM_ROLES = [
  "Project Director",
  "Project Manager",
  "Site Engineer",
  "Civil Engineer",
  "Structural Engineer",
  "Architect",
  "Quantity Surveyor",
  "Procurement Officer",
  "Site Supervisor",
  "Contractor",
  "Subcontractor",
];

export const HEALTH_META = {
  on_track: { label: "On Track", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  attention: { label: "Attention Required", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  at_risk: { label: "At Risk", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" },
};

export const RISK_LEVEL = {
  low: { label: "Low", color: "#16a34a" },
  medium: { label: "Medium", color: "#d97706" },
  high: { label: "High", color: "#dc2626" },
};

export const DEV_PIPELINE_STAGES = [
  "land_acquisition",
  "feasibility",
  "concept",
  "design",
  "approvals",
  "tender",
  "construction",
  "sales",
  "handover",
];

export const DEV_PIPELINE_LABEL = {
  land_acquisition: "Land Acquisition",
  feasibility: "Feasibility",
  concept: "Concept",
  design: "Design",
  approvals: "Approvals",
  tender: "Tender",
  construction: "Construction",
  sales: "Sales",
  handover: "Handover",
};

export const UNIT_STATUS = {
  available: { label: "Available", color: "#2563eb" },
  reserved: { label: "Reserved", color: "#d97706" },
  sold: { label: "Sold", color: "#16a34a" },
  under_construction: { label: "Under Construction", color: "#64748b" },
  handed_over: { label: "Handed Over", color: "#7c3aed" },
};

export const DEFAULT_AUTOMATIONS = [
  {
    key: "daily_report",
    name: "Daily Report Automation",
    description: "Automatically compile field inputs into a formatted daily project report every evening.",
    trigger_text: "Every day at 6:00 PM site time",
    action_text: "Generate and file the Daily Site Report for each active project",
    recipients: "Project Manager, Project Director",
  },
  {
    key: "delay_alerts",
    name: "Delay Alerts",
    description: "Notify responsible users the moment a scheduled activity becomes overdue.",
    trigger_text: "When an activity passes its planned finish date",
    action_text: "Notify the responsible engineer and flag the activity as delayed",
    recipients: "Site Engineer, Project Manager",
  },
  {
    key: "rfi_escalation",
    name: "RFI Escalation",
    description: "Escalate RFIs that go unanswered so they don't stall design or construction.",
    trigger_text: "When an RFI remains unanswered for 3 days",
    action_text: "Escalate to the Project Manager and mark the RFI overdue",
    recipients: "Project Manager",
  },
  {
    key: "approval_reminders",
    name: "Approval Reminders",
    description: "Send reminders for approvals sitting idle so submittals keep moving.",
    trigger_text: "When an approval is pending for more than 2 days",
    action_text: "Send a reminder to the assigned approver",
    recipients: "Assigned Approver",
  },
  {
    key: "budget_alerts",
    name: "Budget Alerts",
    description: "Notify management as soon as forecast costs threaten the approved budget.",
    trigger_text: "When forecast final cost exceeds the current contract value",
    action_text: "Notify Project Director and Finance",
    recipients: "Project Director, Finance",
  },
  {
    key: "procurement_alerts",
    name: "Procurement Alerts",
    description: "Alert site teams the moment a material delivery is confirmed delayed.",
    trigger_text: "When a delivery is marked delayed",
    action_text: "Notify Procurement Officer and Site Supervisor",
    recipients: "Procurement Officer, Site Supervisor",
  },
  {
    key: "weekly_report",
    name: "Weekly Management Report",
    description: "Automatically compile a portfolio-wide executive report every Sunday.",
    trigger_text: "Every Sunday at 7:00 AM",
    action_text: "Generate the Weekly Executive Portfolio Report",
    recipients: "Executive Management",
  },
];

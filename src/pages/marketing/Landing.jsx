import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  LineChart,
  ShieldAlert,
  FileText,
  Zap,
  Boxes,
  ClipboardCheck,
  Globe,
  Check,
  X,
  Star,
  BarChart3,
  Home as HomeIcon,
} from "lucide-react";
import { useToast } from "../../components/ui.jsx";
import logoMark from "../../assets/logoMark.js";

const WITHOUT = [
  "Multiple disconnected spreadsheets",
  "WhatsApp messages as project records",
  "Scattered documents and revisions",
  "Manual, inconsistent reports",
  "Delayed information reaching management",
  "Limited visibility across projects",
  "Constant manual follow-ups",
  "Difficulty controlling cost in real time",
];

const WITH = [
  "Centralized, structured project data",
  "Automated daily and weekly reports",
  "Real-time project visibility",
  "Live cost control and forecasting",
  "Proactive risk and delay alerts",
  "Full RFI and approval tracking",
  "Organized document management",
  "Executive dashboards for leadership",
];

const FEATURES = [
  { icon: Building2, title: "Built for Construction & Real Estate", text: "Purpose-built terminology and workflows for contractors, developers, engineering consultancies and PM firms — not a generic task board." },
  { icon: Boxes, title: "Manage Every Project in One Place", text: "Schedule, cost, BOQ, RFIs, approvals, risk, procurement, documents and team — one control center per project." },
  { icon: Zap, title: "Automate Repetitive Work", text: "Daily reports, delay alerts, RFI escalation, approval reminders and budget alerts run themselves." },
  { icon: LineChart, title: "Control Cost & Progress", text: "Committed vs. actual vs. forecast, tracked against baseline — variance flagged before it becomes a problem." },
  { icon: BarChart3, title: "Turn Project Data into Decisions", text: "Executive dashboards translate site-level detail into portfolio-level clarity for leadership." },
  { icon: ClipboardCheck, title: "Engineering + PM + Automation", text: "Technical coordination, cost control and business operations work together instead of living in separate tools." },
];

const JOURNEY = [
  "Sign in to the Executive Dashboard",
  "Open a live project and check its health",
  "Review Cost Control and a forecast warning",
  "Check an overdue RFI",
  "Generate an AI Daily Site Report and export it",
  "See Automation Center rules firing",
  "Preview the Digital Project Model (BIM)",
  "Return to the portfolio view",
];

export default function Landing() {
  const { push } = useToast();
  const [lang, setLang] = useState("en");

  function handleLang(code) {
    setLang(code);
    if (code !== "en") {
      push("Full Arabic (RTL) and French localization ship in the next release — this live preview stays in English.", "info", 6000);
    }
  }

  return (
    <div className="min-h-screen bg-white text-ink-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div dangerouslySetInnerHTML={{ __html: logoMark }} className="h-9 w-9" />
            <div className="leading-tight">
              <p className="text-sm font-extrabold text-navy-950">SmartManager</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold-600">Projects</p>
            </div>
          </div>
          <nav className="ml-6 hidden gap-6 text-sm font-medium text-ink-600 md:flex">
            <a href="#platform" className="hover:text-navy-900">Platform</a>
            <a href="#difference" className="hover:text-navy-900">Why SmartManager</a>
            <a href="#journey" className="hover:text-navy-900">See it in Action</a>
            <a href="#demo" className="hover:text-navy-900">Request Demo</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full border border-ink-200 p-0.5 text-xs font-semibold sm:flex">
              {[{ c: "en", l: "EN" }, { c: "ar", l: "العربية" }].map((o) => (
                <button
                  key={o.c}
                  onClick={() => handleLang(o.c)}
                  className={`rounded-full px-2.5 py-1 ${lang === o.c ? "bg-navy-900 text-white" : "text-ink-500 hover:text-navy-900"}`}
                >
                  {o.l}
                </button>
              ))}
            </div>
            <Link to="/login" className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100">
              Login
            </Link>
            <Link to="/signup" className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,39,0.15),transparent_55%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr,0.95fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-400">
              Intelligent Project Management &amp; Business Automation
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Plan Smarter.
              <br /> Manage Better.
              <br /> <span className="text-gold-400">Build with Confidence.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70">
              SmartManager Projects brings project management, construction controls, engineering workflows, real-estate
              development and business automation together in one intelligent platform — built for contractors,
              developers, engineering companies and project teams.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400">
                Start Free <ArrowRight size={16} />
              </Link>
              <a href="#demo" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                Request Demo
              </a>
              <a href="#platform" className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white/70 hover:text-white">
                Explore Platform
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-white/50">
              <span>Trusted workflow for:</span>
              <span className="font-semibold text-white/80">Contractors</span>
              <span className="font-semibold text-white/80">Real Estate Developers</span>
              <span className="font-semibold text-white/80">Engineering Consultancies</span>
              <span className="font-semibold text-white/80">PM Firms</span>
            </div>
          </div>

          {/* Hero visual: mock dashboard card */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-2xl backdrop-blur">
              <div className="rounded-xl bg-white p-5 text-ink-900 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink-400">Executive Dashboard</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">LIVE</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-navy-950 p-3 text-white">
                    <p className="text-[10px] text-white/60">Portfolio Value</p>
                    <p className="mt-1 text-lg font-bold">SAR 42.8M</p>
                  </div>
                  <div className="rounded-lg bg-ink-50 p-3">
                    <p className="text-[10px] text-ink-400">Portfolio Progress</p>
                    <p className="mt-1 text-lg font-bold text-ink-900">67%</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { l: "Al Salam Residential Development", v: 68 },
                    { l: "Al Noor Commercial Center", v: 42 },
                    { l: "Premium Villa Development", v: 81 },
                  ].map((r) => (
                    <div key={r.l}>
                      <div className="mb-1 flex justify-between text-[11px] text-ink-500">
                        <span>{r.l}</span>
                        <span className="font-semibold text-ink-800">{r.v}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-ink-100">
                        <div className="h-1.5 rounded-full bg-gold-500" style={{ width: `${r.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-white/10 bg-navy-900 px-4 py-3 shadow-xl sm:block">
              <p className="text-[10px] text-white/50">Forecast Variance</p>
              <p className="text-sm font-bold text-red-400">⚠ +SAR 550,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* Without / With */}
      <section id="difference" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-600">The Difference</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950">Project Management + Engineering + Automation</h2>
          <p className="mt-3 text-ink-500">Not another generic task tracker. SmartManager Projects understands construction, contracting and development realities.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-ink-100 bg-ink-50 p-7">
            <p className="text-sm font-bold uppercase tracking-wide text-ink-400">Without SmartManager Projects</p>
            <ul className="mt-4 space-y-3">
              {WITHOUT.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-ink-600">
                  <X size={16} className="mt-0.5 shrink-0 text-red-400" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-navy-900 bg-navy-950 p-7 text-white">
            <p className="text-sm font-bold uppercase tracking-wide text-gold-400">With SmartManager Projects</p>
            <ul className="mt-4 space-y-3">
              {WITH.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-white/80">
                  <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="platform" className="bg-ink-50 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Platform</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950">One Platform, Every Control</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
                <div className="mb-4 inline-flex rounded-xl bg-navy-950 p-2.5 text-gold-400">
                  <f.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-navy-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real estate + contracting split */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-card">
            <Building2 className="text-navy-900" size={26} />
            <h3 className="mt-4 text-xl font-bold text-navy-950">Built for Contractors &amp; Engineering Teams</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              BOQ, RFIs, approvals, cost control, procurement, daily site reports and risk — the project controls
              discipline your teams already run, digitized and automated.
            </p>
          </div>
          <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-card">
            <HomeIcon className="text-navy-900" size={26} />
            <h3 className="mt-4 text-xl font-bold text-navy-950">Built for Real Estate Developers</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              A dedicated development pipeline, unit-level sales tracking (available / reserved / sold / handed over)
              and a feasibility calculator to plan the next launch.
            </p>
          </div>
        </div>
      </section>

      {/* Demo journey */}
      <section id="journey" className="bg-navy-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">See What SmartManager Projects Can Do</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">A 5-Minute Guided Tour</h2>
            <p className="mt-3 text-white/60">Sign in with the demo environment and walk the exact journey we'd show a Project Director.</p>
          </div>
          <ol className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2">
            {JOURNEY.map((step, i) => (
              <li key={step} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-950">{i + 1}</span>
                <span className="text-sm text-white/80">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400">
              Start the Tour <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="demo" className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8">
        <Star className="mx-auto text-gold-500" size={28} />
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-950">Ready to Build Smarter?</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-500">
          Every company manages projects differently. SmartManager Projects can be configured around your workflows,
          reporting requirements and business processes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/signup" className="rounded-lg bg-navy-900 px-6 py-3 text-sm font-bold text-white hover:bg-navy-800">
            Request a Custom Demo
          </Link>
          <a href="mailto:hello@smartmanagerprojects.com" className="rounded-lg border border-ink-200 px-6 py-3 text-sm font-bold text-ink-700 hover:bg-ink-50">
            Talk to Our Team
          </a>
        </div>
      </section>

      <footer className="border-t border-ink-100 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 text-center sm:px-8">
          <div className="flex items-center gap-2">
            <div dangerouslySetInnerHTML={{ __html: logoMark }} className="h-7 w-7" />
            <p className="text-sm font-bold text-navy-950">SmartManager Projects</p>
          </div>
          <p className="text-xs text-ink-400">Plan Smarter. Manage Better. Build with Confidence.</p>
          <p className="flex items-center gap-1.5 text-[11px] text-ink-300">
            <Globe size={12} /> English · العربية (coming soon) · Français (coming soon)
          </p>
        </div>
      </footer>
    </div>
  );
}

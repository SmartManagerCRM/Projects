import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Home,
  FileText,
  Zap,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Globe,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCompany } from "../../context/CompanyContext.jsx";
import { Badge, DemoBadge, useToast } from "../ui.jsx";
import { formatDateTime, initials } from "../../lib/format.js";
import logoMark from "../../assets/logoMark.js";

const NAV = [
  { to: "/app", label: "Executive Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/projects", label: "Projects", icon: Building2 },
  { to: "/app/real-estate", label: "Real Estate", icon: Home },
  { to: "/app/daily-report", label: "AI Daily Report", icon: FileText },
  { to: "/app/automation", label: "Automation Center", icon: Zap },
  { to: "/app/reports", label: "Management Reports", icon: BarChart3 },
  { to: "/app/settings", label: "Company Settings", icon: Settings },
];

const LANGS = [
  { code: "en", label: "English", native: "EN" },
  { code: "ar", label: "العربية", native: "AR" },
  { code: "fr", label: "Français", native: "FR" },
];

export default function AppShell() {
  const { user, signOut } = useAuth();
  const { company, role, notifications, unreadCount, markAllRead, markNotificationRead, projects } = useCompany();
  const { push } = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return projects
      .filter((p) => [p.name, p.client, p.location, p.code].filter(Boolean).some((v) => v.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [query, projects]);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  function handleLangSelect(code) {
    setLang(code);
    setLangOpen(false);
    if (code !== "en") {
      push(
        `Full ${code === "ar" ? "Arabic (RTL)" : "French"} localization is part of the upcoming release — this preview stays in English so every screen remains fully functional for your demo.`,
        "info",
        6000
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col bg-navy-950 text-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div dangerouslySetInnerHTML={{ __html: logoMark }} className="h-9 w-9 shrink-0" />
            <div>
              <p className="text-sm font-bold leading-tight">SmartManager</p>
              <p className="text-[11px] font-medium leading-tight text-gold-400">PROJECTS</p>
            </div>
          </div>
          <button className="text-white/60 lg:hidden" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mx-3 mb-3 rounded-xl bg-white/5 p-4">
          <p className="text-xs font-semibold text-white">From Project Complexity to Operational Clarity.</p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-widest text-gold-400">Plan · Control · Automate · Deliver</p>
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-950">
            {initials(user?.user_metadata?.full_name || user?.email || "U")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user?.user_metadata?.full_name || user?.email}</p>
            <p className="truncate text-[11px] text-white/50">{company?.name}</p>
          </div>
          <button onClick={handleSignOut} title="Sign out" className="text-white/40 hover:text-white">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-navy-950/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <button className="text-ink-500 lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-400 hover:border-ink-300 sm:max-w-xs"
          >
            <Search size={15} />
            <span className="hidden sm:inline">Search projects, RFIs, documents…</span>
            <span className="sm:hidden">Search</span>
            <kbd className="ml-auto hidden rounded border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] text-ink-400 sm:inline">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {company && !company.demo_seeded && (
              <span className="hidden text-xs font-medium text-ink-400 md:inline">Empty workspace —</span>
            )}
            <DemoBadge />

            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink-500 hover:bg-ink-100"
              >
                <Globe size={16} />
                {LANGS.find((l) => l.code === lang)?.native}
                <ChevronDown size={13} />
              </button>
              {langOpen && (
                <div className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-ink-100 bg-white py-1.5 shadow-panel">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLangSelect(l.code)}
                      className="flex w-full items-center justify-between px-3.5 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      {l.label}
                      {lang === l.code && <Check size={14} className="text-navy-800" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-100"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-ink-100 bg-white shadow-panel">
                  <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                    <p className="text-sm font-bold text-ink-900">Notifications</p>
                    <button onClick={markAllRead} className="text-xs font-semibold text-navy-800 hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 && <p className="px-4 py-8 text-center text-xs text-ink-400">You're all caught up.</p>}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`flex w-full gap-2.5 border-b border-ink-50 px-4 py-3 text-left last:border-0 hover:bg-ink-50 ${!n.is_read ? "bg-navy-50/40" : ""}`}
                      >
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            { error: "bg-red-500", warning: "bg-amber-500", success: "bg-emerald-500", info: "bg-blue-500" }[n.severity] || "bg-ink-300"
                          }`}
                        />
                        <span className="flex-1">
                          <span className="block text-xs leading-snug text-ink-800">{n.message}</span>
                          <span className="mt-0.5 block text-[10px] text-ink-400">{formatDateTime(n.created_at)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-ink-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                  {initials(user?.user_metadata?.full_name || user?.email || "U")}
                </div>
                <ChevronDown size={14} className="hidden text-ink-400 sm:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-ink-100 bg-white py-1.5 shadow-panel">
                  <div className="border-b border-ink-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink-900">{user?.user_metadata?.full_name}</p>
                    <p className="truncate text-xs text-ink-400">{user?.email}</p>
                    {role && <Badge tone="navy" className="mt-2">{role.replace(/_/g, " ")}</Badge>}
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/app/settings");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <Settings size={15} /> Company Settings
                  </button>
                  <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-panel">
            <div className="flex items-center gap-2.5 border-b border-ink-100 px-4 py-3.5">
              <Search size={17} className="text-ink-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects by name, client or location…"
                className="flex-1 text-sm outline-none placeholder:text-ink-300"
              />
              <kbd className="rounded border border-ink-200 px-1.5 py-0.5 text-[10px] text-ink-400">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto py-1.5">
              {query.trim() && results.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-400">No projects match "{query}".</p>}
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                    navigate(`/app/projects/${p.id}`);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-ink-50"
                >
                  <Building2 size={16} className="text-navy-700" />
                  <span>
                    <span className="block text-sm font-medium text-ink-900">{p.name}</span>
                    <span className="block text-xs text-ink-400">{p.client} · {p.location}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

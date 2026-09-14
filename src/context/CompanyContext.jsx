import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { DEFAULT_AUTOMATIONS } from "../lib/constants.js";

const CompanyContext = createContext(null);

const DEFAULT_WORK_PACKAGES = [
  { name: "Structure", progress: 0 },
  { name: "Architecture", progress: 0 },
  { name: "MEP", progress: 0 },
  { name: "External Works", progress: 0 },
  { name: "Landscape", progress: 0 },
];

export function CompanyProvider({ children }) {
  const { supabase, user } = useAuth();
  const [company, setCompany] = useState(null);
  const [role, setRole] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const refreshCompany = useCallback(async () => {
    if (!user) return;
    const { data: member } = await supabase
      .from("company_members")
      .select("role, company:companies(*)")
      .eq("user_id", user.id)
      .maybeSingle();
    if (member?.company) {
      setCompany(member.company);
      setRole(member.role);
    } else {
      setCompany(null);
      setRole(null);
    }
  }, [supabase, user]);

  const refreshProjects = useCallback(async () => {
    if (!company) {
      setProjects([]);
      return;
    }
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });
    setProjects(data || []);
  }, [supabase, company]);

  const refreshNotifications = useCallback(async () => {
    if (!company || !user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setNotifications(data || []);
  }, [supabase, company, user]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      if (user) {
        await refreshCompany();
      } else {
        setCompany(null);
        setRole(null);
        setProjects([]);
        setNotifications([]);
      }
      if (active) {
        setLoading(false);
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (company) {
      refreshProjects();
      refreshNotifications();
    }
  }, [company, refreshProjects, refreshNotifications]);

  const markNotificationRead = useCallback(
    async (id) => {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    },
    [supabase]
  );

  const markAllRead = useCallback(async () => {
    if (!company) return;
    await supabase.from("notifications").update({ is_read: true }).eq("company_id", company.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, [supabase, company]);

  const pushNotification = useCallback(
    async (message, severity = "info") => {
      if (!company) return;
      const { data } = await supabase
        .from("notifications")
        .insert({ company_id: company.id, user_id: user?.id, severity, message })
        .select()
        .single();
      if (data) setNotifications((prev) => [data, ...prev]);
    },
    [supabase, company, user]
  );

  const bootstrapCompany = useCallback(
    async ({ companyInfo, modules, project }) => {
      // The companies row can't be created with `.select()` here: Postgres
      // RLS checks a RETURNING clause against the SELECT policy, which
      // requires an existing company_members row — and that row doesn't
      // exist yet at this exact instant (it's the very next statement). So
      // we mint the id ourselves, insert without asking for it back, create
      // the membership, and only then fetch the row (now visible).
      const newCompanyId = crypto.randomUUID();
      const { error: companyErr } = await supabase.from("companies").insert({
        id: newCompanyId,
        name: companyInfo.name,
        company_type: companyInfo.company_type,
        country: companyInfo.country,
        city: companyInfo.city,
        logo_url: companyInfo.logo_url || null,
        employees_range: companyInfo.employees_range,
        currency: companyInfo.currency || "SAR",
        modules,
      });
      if (companyErr) throw companyErr;

      const { error: memberErr } = await supabase.from("company_members").insert({
        company_id: newCompanyId,
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email,
        email: user.email,
        role: "company_admin",
        status: "active",
      });
      if (memberErr) throw memberErr;

      const { data: newCompany, error: fetchErr } = await supabase
        .from("companies")
        .select("*")
        .eq("id", newCompanyId)
        .single();
      if (fetchErr) throw fetchErr;

      await supabase.from("automations").insert(
        DEFAULT_AUTOMATIONS.map((a) => ({ company_id: newCompany.id, ...a, enabled: true }))
      );

      let newProject = null;
      if (project?.name) {
        const isRealEstate = companyInfo.company_type === "developer";
        const { data: proj, error: projErr } = await supabase
          .from("projects")
          .insert({
            company_id: newCompany.id,
            name: project.name,
            code: project.code || null,
            project_type: project.project_type,
            client: project.client,
            location: project.location,
            contract_value: Number(project.contract_value || 0),
            currency: companyInfo.currency || "SAR",
            start_date: project.start_date || null,
            planned_completion_date: project.planned_completion_date || null,
            project_manager: project.project_manager,
            is_real_estate: isRealEstate,
          })
          .select()
          .single();
        if (projErr) throw projErr;
        newProject = proj;

        await supabase.from("project_costs").insert({
          project_id: proj.id,
          original_contract: Number(project.contract_value || 0),
        });
        await supabase
          .from("work_packages")
          .insert(DEFAULT_WORK_PACKAGES.map((wp, i) => ({ project_id: proj.id, sort_order: i, ...wp })));

        if (isRealEstate) {
          await supabase.from("real_estate_developments").insert({
            project_id: proj.id,
            total_units: 0,
            sales_value: 0,
            construction_budget: Number(project.contract_value || 0),
            pipeline_stage: "design",
          });
        }
      }

      await supabase.from("notifications").insert({
        company_id: newCompany.id,
        user_id: user.id,
        severity: "success",
        message: `Welcome to SmartManager Projects — your workspace "${newCompany.name}" is ready.`,
      });

      setCompany(newCompany);
      setRole("company_admin");
      return { company: newCompany, project: newProject };
    },
    [supabase, user]
  );

  const value = useMemo(
    () => ({
      company,
      role,
      projects,
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
      loading,
      ready,
      needsOnboarding: ready && !loading && !!user && !company,
      refreshCompany,
      refreshProjects,
      refreshNotifications,
      markNotificationRead,
      markAllRead,
      pushNotification,
      bootstrapCompany,
    }),
    [
      company,
      role,
      projects,
      notifications,
      loading,
      ready,
      user,
      refreshCompany,
      refreshProjects,
      refreshNotifications,
      markNotificationRead,
      markAllRead,
      pushNotification,
      bootstrapCompany,
    ]
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}

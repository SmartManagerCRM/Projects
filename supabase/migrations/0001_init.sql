-- SmartManager Projects — initial schema
-- Multi-tenant project management / construction controls / real-estate development platform.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Core tenancy
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_type text not null default 'other',
  country text,
  city text,
  logo_url text,
  currency text not null default 'SAR',
  employees_range text,
  modules jsonb not null default '[]'::jsonb,
  demo_seeded boolean not null default false,
  phone text,
  email text,
  tax_number text,
  created_at timestamptz not null default now()
);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'viewer',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  code text,
  project_type text,
  client text,
  location text,
  contract_value numeric(14, 2) default 0,
  currency text default 'SAR',
  start_date date,
  planned_completion_date date,
  project_manager text,
  progress numeric(5, 2) default 0,
  planned_progress numeric(5, 2) default 0,
  budget_utilization numeric(5, 2) default 0,
  schedule_health text default 'on_track',
  cost_health text default 'on_track',
  quality_health text default 'on_track',
  procurement_health text default 'on_track',
  safety_health text default 'on_track',
  status text default 'active',
  cover_image_url text,
  is_real_estate boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.work_packages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  progress numeric(5, 2) default 0,
  sort_order int default 0
);

create table public.project_costs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  original_contract numeric(14, 2) default 0,
  approved_variations numeric(14, 2) default 0,
  committed_cost numeric(14, 2) default 0,
  actual_cost numeric(14, 2) default 0,
  forecast_final_cost numeric(14, 2) default 0,
  updated_at timestamptz not null default now()
);

create table public.cost_alerts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  severity text default 'warning',
  message text not null,
  created_at timestamptz not null default now()
);

create table public.boq_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  item_no text,
  description text not null,
  unit text,
  quantity numeric(14, 2) default 0,
  unit_rate numeric(14, 2) default 0,
  executed_quantity numeric(14, 2) default 0,
  status text default 'in_progress',
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table public.rfis (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  rfi_number text,
  subject text not null,
  discipline text,
  description text,
  submitted_date date default current_date,
  responsible_party text,
  due_date date,
  priority text default 'medium',
  status text default 'open',
  response text,
  created_at timestamptz not null default now()
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  approval_type text not null,
  title text not null,
  submitted_by text,
  submitted_date date default current_date,
  status text default 'pending',
  comments text,
  created_at timestamptz not null default now()
);

create table public.risks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  category text,
  probability text default 'medium',
  impact text default 'medium',
  risk_score int default 0,
  owner text,
  mitigation text,
  status text default 'open',
  created_at timestamptz not null default now()
);

create table public.procurement_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  item text not null,
  category text,
  supplier text,
  status text default 'on_schedule',
  expected_date date,
  delay_days int default 0,
  created_at timestamptz not null default now()
);

create table public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  report_date date default current_date,
  weather text,
  manpower int,
  equipment text,
  completed_activities text,
  quantities text,
  materials_received text,
  site_issues text,
  safety_observations text,
  delays text,
  required_actions text,
  tomorrow_plan text,
  photos jsonb default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  role text not null,
  tasks_count int default 0,
  performance numeric(5, 2) default 0,
  status text default 'active',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Automation, notifications, audit
-- ---------------------------------------------------------------------------

create table public.automations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  trigger_text text,
  action_text text,
  recipients text,
  enabled boolean default true,
  created_at timestamptz not null default now(),
  unique (company_id, key)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  severity text default 'info',
  message text not null,
  is_read boolean default false,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null,
  entity text,
  entity_id uuid,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Real estate development
-- ---------------------------------------------------------------------------

create table public.real_estate_developments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  total_units int default 0,
  sales_value numeric(14, 2) default 0,
  construction_budget numeric(14, 2) default 0,
  expected_completion date,
  pipeline_stage text default 'design',
  created_at timestamptz not null default now()
);

create table public.real_estate_units (
  id uuid primary key default gen_random_uuid(),
  development_id uuid not null references public.real_estate_developments(id) on delete cascade,
  unit_number text not null,
  unit_type text,
  area_sqm numeric(10, 2),
  price numeric(14, 2),
  status text default 'available',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions (used by RLS policies)
-- ---------------------------------------------------------------------------

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  );
$$;

create or replace function public.project_company_id(target_project_id uuid)
returns uuid
language sql
security definer
stable
as $$
  select company_id from public.projects where id = target_project_id;
$$;

create or replace function public.development_company_id(target_development_id uuid)
returns uuid
language sql
security definer
stable
as $$
  select p.company_id
  from public.real_estate_developments d
  join public.projects p on p.id = d.project_id
  where d.id = target_development_id;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security — every table is company-scoped (directly or via project)
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
create policy "profiles_self_select" on public.profiles for select using (id = auth.uid());
create policy "profiles_self_insert" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_self_update" on public.profiles for update using (id = auth.uid());

alter table public.companies enable row level security;
create policy "companies_member_select" on public.companies for select using (public.is_company_member(id));
create policy "companies_member_update" on public.companies for update using (public.is_company_member(id));
create policy "companies_authenticated_insert" on public.companies for insert with check (auth.uid() is not null);

alter table public.company_members enable row level security;
create policy "company_members_select" on public.company_members for select using (public.is_company_member(company_id));
create policy "company_members_bootstrap_insert" on public.company_members for insert with check (
  user_id = auth.uid()
  and not exists (select 1 from public.company_members cm2 where cm2.company_id = company_members.company_id)
);
create policy "company_members_admin_insert" on public.company_members for insert with check (public.is_company_member(company_id));
create policy "company_members_update" on public.company_members for update using (public.is_company_member(company_id));
create policy "company_members_delete" on public.company_members for delete using (public.is_company_member(company_id));

alter table public.projects enable row level security;
create policy "projects_select" on public.projects for select using (public.is_company_member(company_id));
create policy "projects_insert" on public.projects for insert with check (public.is_company_member(company_id));
create policy "projects_update" on public.projects for update using (public.is_company_member(company_id));
create policy "projects_delete" on public.projects for delete using (public.is_company_member(company_id));

alter table public.work_packages enable row level security;
create policy "work_packages_all" on public.work_packages for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.project_costs enable row level security;
create policy "project_costs_all" on public.project_costs for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.cost_alerts enable row level security;
create policy "cost_alerts_all" on public.cost_alerts for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.boq_items enable row level security;
create policy "boq_items_all" on public.boq_items for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.rfis enable row level security;
create policy "rfis_all" on public.rfis for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.approvals enable row level security;
create policy "approvals_all" on public.approvals for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.risks enable row level security;
create policy "risks_all" on public.risks for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.procurement_items enable row level security;
create policy "procurement_items_all" on public.procurement_items for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.daily_reports enable row level security;
create policy "daily_reports_all" on public.daily_reports for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.project_members enable row level security;
create policy "project_members_all" on public.project_members for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.real_estate_developments enable row level security;
create policy "real_estate_developments_all" on public.real_estate_developments for all using (public.is_company_member(public.project_company_id(project_id))) with check (public.is_company_member(public.project_company_id(project_id)));

alter table public.real_estate_units enable row level security;
create policy "real_estate_units_all" on public.real_estate_units for all using (public.is_company_member(public.development_company_id(development_id))) with check (public.is_company_member(public.development_company_id(development_id)));

alter table public.automations enable row level security;
create policy "automations_all" on public.automations for all using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));

alter table public.notifications enable row level security;
create policy "notifications_select" on public.notifications for select using (public.is_company_member(company_id));
create policy "notifications_insert" on public.notifications for insert with check (public.is_company_member(company_id));
create policy "notifications_update" on public.notifications for update using (public.is_company_member(company_id));

alter table public.activity_logs enable row level security;
create policy "activity_logs_select" on public.activity_logs for select using (public.is_company_member(company_id));
create policy "activity_logs_insert" on public.activity_logs for insert with check (public.is_company_member(company_id));

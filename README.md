# SmartManager Projects

**Plan Smarter. Manage Better. Build with Confidence.**

Intelligent project management, construction controls and business automation
for contracting companies, construction companies, real-estate developers,
engineering consultancies and project management firms — built as a
sales-ready live demo platform.

## What's in this build

A real, functional multi-tenant web app (not a static mockup) backed by
Supabase (Postgres + Auth), covering:

- **Marketing landing page** with the full "without vs. with" pitch, feature
  grid, guided 5-minute demo journey and custom-demo CTA.
- **Real authentication** — sign up, staff/company sign-in, email
  verification, forgot/reset password, logout. No fake login screens.
- **4-step onboarding wizard** — company profile, modules to manage, first
  project — that provisions a real company workspace.
- **Executive Dashboard** — portfolio KPIs, project health (schedule / cost /
  quality / procurement / safety), portfolio grid.
- **Project Control Center** per project — Overview (work packages, planned
  vs. actual variance), Cost Control (budget/committed/actual/forecast chart
  + alerts), BOQ (search/sort/add/export CSV), RFIs, Approvals, Risks (with a
  probability × impact matrix), Procurement, Daily Reports, Team, plus
  Documents and 3D/BIM as clearly-labeled interactive demonstrations.
- **AI Daily Site Report generator** — turns field inputs into a formatted,
  printable/exportable report; can be saved to the project.
- **Automation Center** — real on/off toggles persisted per company, seeded
  with the 7 automations from the brief (delay alerts, RFI escalation,
  budget alerts, etc.).
- **Management Reports** — Weekly/Monthly/Executive Portfolio, Cost,
  Progress, Risk, Procurement and RFI reports generated from live data and
  exportable to PDF via the browser print dialog.
- **Real Estate Development mode** — development pipeline, unit dashboard
  (available / reserved / sold / under construction / handed over), and a
  standalone Feasibility (planning/estimation) calculator.
- **Company Settings** — profile, logo, currency, modules, users & roles,
  a role/permission reference, and notification preferences.
- **Demo Mode** — "Load Demo Data" seeds a realistic, clearly-fictional
  multi-project portfolio (contracting + a real-estate development) so the
  platform can be demoed end-to-end immediately after signup.

English is fully implemented. The language switcher (EN / العربية / Français)
is present across the app; selecting Arabic or French shows an honest
"coming soon" notice rather than a half-translated UI — full RTL Arabic and
French localization is scoped for the next release.

## Tech stack

- React 18 + Vite + React Router
- Tailwind CSS (navy / gold enterprise design system)
- Supabase (Postgres, Auth, Row Level Security)
- Recharts for charts
- lucide-react for icons
- No backend server beyond Supabase — this is a static SPA that talks to
  Supabase directly from the browser, same deployment model as the sibling
  SmartManager Sales CRM app.

## 1. Supabase project

A Supabase project has already been provisioned for this app
(`smartmanager-projects`, org "SmartManager") with the full schema and Row
Level Security policies applied via the migrations in `supabase/migrations/`:

- `0001_init.sql` — all tables, helper functions and RLS policies.
- `0002_harden_functions.sql` — pins `search_path` on the SECURITY DEFINER
  helper functions used by RLS and tightens their EXECUTE grants.

If you ever need to stand this app up against a **new** Supabase project,
run both migration files in order via the SQL Editor (or `supabase db push`
if you use the CLI), then continue with step 2.

## 2. Configure the app

```bash
cp .env.example .env
```

Fill in your Supabase project's URL and anon/publishable key
(**Project Settings → API**):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

### Try it end-to-end

1. **Sign Up** on the landing page with a real email you can check — Supabase
   requires email confirmation by default, so you'll land on **Verify your
   email** after signing up.
2. Click the confirmation link in your inbox, then **sign in**.
3. Complete the 4-step **onboarding wizard** (company → modules → first
   project) — this creates your real company workspace.
4. On the Executive Dashboard, click **Load Demo Data** to populate a full
   demo portfolio (contracting + real-estate projects, cost control, BOQ,
   RFIs, risks, procurement, a daily report and 84 real-estate units).
5. Walk the 5-minute demo journey described on the landing page: open a
   project → Cost Control → RFIs → AI Daily Report → Automation Center →
   3D/BIM → back to the Executive Dashboard.

> Password reset and email confirmation links redirect back to this app's
> origin. If you deploy this app, add the deployed URL to **Supabase →
> Authentication → URL Configuration** (Site URL + Redirect URLs) or those
> links will bounce back to `localhost`.

## 4. Deploy

Same static-SPA deployment model as the rest of the SmartManager suite:

**Vercel / Netlify**
1. Push this repo to GitHub (already done) and import it.
2. Framework preset: **Vite**. Build command: `npm run build`. Output dir:
   `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment
   variables in the host's project settings.
4. Deploy, then add the deployed URL to Supabase's Auth URL Configuration
   (see note above).

**Hostinger (or any static host)**
1. `npm run build` locally with your real `.env` in place — this produces
   `dist/` (including `dist/.htaccess`, copied from `public/.htaccess`,
   which handles gzip, long-term asset caching and the SPA fallback route).
2. Upload the *contents* of `dist/` to your web root.
3. Point your domain/subdomain at that folder.

## Database structure

`companies`, `company_members`, `projects`, `work_packages`, `project_costs`,
`cost_alerts`, `boq_items`, `rfis`, `approvals`, `risks`,
`procurement_items`, `daily_reports`, `project_members`, `automations`,
`real_estate_developments`, `real_estate_units`, `notifications`,
`activity_logs`, `profiles`.

Every table is company-scoped, directly (`company_id`) or transitively via
`project_id → projects.company_id`. Row Level Security is enabled on every
table; a company can never read or write another company's data — access
requires an active row in `company_members` for the caller's `auth.uid()`.
A handful of `SECURITY DEFINER` helper functions back the RLS policies and
are pinned to a fixed `search_path` and restricted to the `authenticated`
role.

## Notes on scope

This build prioritizes a small number of fully real, working workflows over
shallow coverage of every field in the original brief:

- **Documents** and **3D / BIM** are presented as polished, clearly-labeled
  interactive demonstrations (with realistic preview numbers) rather than a
  live document store or a real BIM/clash-detection engine — exactly as the
  brief allows for a V1.
- **"Send Report"** in the AI Daily Report generator simulates the email
  send with a confirmation toast; wiring a transactional email provider
  (e.g. via a Supabase Edge Function) is a natural next step.
- Role-based **permissions** are enforced at the company/project membership
  level in the database; the granular per-role capability matrix shown in
  Company Settings is currently a reference display rather than a
  DB-enforced ACL — a good next iteration if this becomes a real product.

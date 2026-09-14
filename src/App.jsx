import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useCompany } from "./context/CompanyContext.jsx";
import { FullPageSpinner } from "./components/ui.jsx";
import AppShell from "./components/layout/AppShell.jsx";

import Landing from "./pages/marketing/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import Onboarding from "./pages/onboarding/Onboarding.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import ProjectsList from "./pages/projects/ProjectsList.jsx";
import ProjectDetail from "./pages/projects/ProjectDetail.jsx";
import DailyReportGenerator from "./pages/reports/DailyReportGenerator.jsx";
import AutomationCenter from "./pages/automation/AutomationCenter.jsx";
import ExecutiveReports from "./pages/reports/ExecutiveReports.jsx";
import RealEstateDashboard from "./pages/realestate/RealEstateDashboard.jsx";
import Feasibility from "./pages/realestate/Feasibility.jsx";
import CompanySettings from "./pages/settings/CompanySettings.jsx";
import NotFound from "./pages/NotFound.jsx";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireCompany({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { loading, needsOnboarding, company } = useCompany();
  if (authLoading || loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (needsOnboarding || !company) return <Navigate to="/onboarding" replace />;
  return children;
}

function RedirectIfOnboarded({ children }) {
  const { loading, company } = useCompany();
  if (loading) return <FullPageSpinner />;
  if (company) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <RedirectIfOnboarded>
              <Onboarding />
            </RedirectIfOnboarded>
          </RequireAuth>
        }
      />

      <Route
        path="/app"
        element={
          <RequireCompany>
            <AppShell />
          </RequireCompany>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="real-estate" element={<RealEstateDashboard />} />
        <Route path="real-estate/feasibility" element={<Feasibility />} />
        <Route path="daily-report" element={<DailyReportGenerator />} />
        <Route path="automation" element={<AutomationCenter />} />
        <Route path="reports" element={<ExecutiveReports />} />
        <Route path="settings" element={<CompanySettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

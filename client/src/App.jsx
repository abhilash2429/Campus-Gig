import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";
import { useAuth } from "./hooks/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CollegeAdminDashboard from "./pages/admin-college/CollegeAdminDashboard";
import PendingGigs from "./pages/admin-college/PendingGigs";
import PendingPayouts from "./pages/admin-college/PendingPayouts";
import PendingUsers from "./pages/admin-college/PendingUsers";
import CreateCollege from "./pages/admin-super/CreateCollege";
import CollegeRegistry from "./pages/admin-super/CollegeRegistry";
import SuperAdminDashboard from "./pages/admin-super/SuperAdminDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import ManageApplicants from "./pages/client/ManageApplicants";
import PaymentTrigger from "./pages/client/PaymentTrigger";
import PostGig from "./pages/client/PostGig";
import Portfolio from "./pages/student/Portfolio";
import BrowseGigs from "./pages/student/BrowseGigs";
import MyApplications from "./pages/student/MyApplications";
import StudentDashboard from "./pages/student/StudentDashboard";
import SubmitDelivery from "./pages/student/SubmitDelivery";

// Redirects a logged-in user to their role-specific dashboard
function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="w-5 h-5 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const roleMap = {
    student: "/student",
    faculty: "/client",
    client: "/client",
    college_admin: "/admin/college",
    super_admin: "/admin/super",
  };

  return <Navigate to={roleMap[user.role] || "/"} replace />;
}

function AppFrame() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────── */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Auth-guarded routes ───────────── */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppFrame />}>
            {/* Redirects logged-in user to their dashboard */}
            <Route path="/dashboard" element={<RoleRedirect />} />

            {/* Public portfolio (visible to any logged-in user) */}
            <Route path="/portfolio/:userId" element={<Portfolio />} />

            <Route element={<RoleRoute roles={["student"]} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/gigs" element={<BrowseGigs />} />
              <Route path="/student/applications" element={<MyApplications />} />
              <Route path="/student/deliver/:applicationId" element={<SubmitDelivery />} />
            </Route>

            <Route element={<RoleRoute roles={["client", "faculty"]} />}>
              <Route path="/client" element={<ClientDashboard />} />
              <Route path="/client/post-gig" element={<PostGig />} />
              <Route path="/client/gig/:gigId/applicants" element={<ManageApplicants />} />
              <Route path="/client/gig/:gigId/pay" element={<PaymentTrigger />} />
            </Route>

            <Route element={<RoleRoute roles={["college_admin"]} />}>
              <Route path="/admin/college" element={<CollegeAdminDashboard />} />
              <Route path="/admin/college/users" element={<PendingUsers />} />
              <Route path="/admin/college/gigs" element={<PendingGigs />} />
              <Route path="/admin/college/payouts" element={<PendingPayouts />} />
            </Route>

            <Route element={<RoleRoute roles={["super_admin"]} />}>
              <Route path="/admin/super" element={<SuperAdminDashboard />} />
              <Route path="/admin/super/colleges" element={<CollegeRegistry />} />
              <Route path="/admin/super/colleges/new" element={<CreateCollege />} />
            </Route>
          </Route>
        </Route>

        {/* ── Fallback ─────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

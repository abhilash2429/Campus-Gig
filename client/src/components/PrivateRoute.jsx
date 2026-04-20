import { Navigate, Outlet } from "react-router-dom";
import { AlertTriangle, ArrowLeft, LogOut } from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const approvalCopy = {
  pending: "Your account is waiting on campus review. You can stay signed in, but protected workflows will open once approval lands.",
  rejected: "Your account was rejected during review. If this looks wrong, contact the relevant college administrator.",
};

export default function PrivateRoute({ children }) {
  const { firebaseUser, loading, profileIssue, user, logout } = useAuth();

  if (loading) {
    return <div className="status-panel">Syncing your campus identity...</div>;
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (profileIssue?.type === "missing_profile") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <section className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-auth-panel px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5" />
            <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full bg-primary-500/20" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="uppercase tracking-[0.24em] text-xs text-white/60 font-semibold">Access Check</p>
                <h1 className="text-3xl font-bold mt-2">{profileIssue.title}</h1>
                <p className="text-white/70 mt-3 max-w-2xl">{profileIssue.message}</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              Student and faculty sign-ins only work when the email domain already exists as a
              registered college in Campus GIG. For example, a user from an unregistered college
              should not continue into the app until that college is created by the super admin.
            </div>

            <div className="mt-6 space-y-3 text-slate-600">
              <p>What to do next:</p>
              <p>1. Ask the super admin to add your college domain in the College Registry.</p>
              <p>2. Sign out and register again after the college is onboarded.</p>
              <p>3. If you meant to join as an external client, use the Google client flow instead.</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="btn-primary btn-lg" type="button" onClick={logout}>
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </span>
              </button>
              <button
                className="btn-secondary btn-lg"
                type="button"
                onClick={() => window.history.back()}
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    // Firebase authenticated but no MongoDB profile (backend error or profile not yet created).
    // Show a clear recovery screen instead of bouncing to /register.
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <section className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Profile not found</h1>
          <p className="text-slate-500 text-sm mb-6">
            Your Firebase account exists but no Campus GIG profile was found. This usually means you need to <strong>complete registration</strong> first, or the server is temporarily unavailable.
          </p>
          <div className="flex flex-col gap-3">
            <a href="/register" className="btn-primary w-full justify-center">
              Complete Registration
            </a>
            <button className="btn-secondary w-full" type="button" onClick={logout}>
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (user.approvalStatus !== "approved") {
    return (
      <section className="status-card">
        <p className="eyebrow">Account Review</p>
        <h1>{user.approvalStatus === "pending" ? "Almost there." : "Access is currently limited."}</h1>
        <p>{approvalCopy[user.approvalStatus] || "Your account needs admin attention before it can continue."}</p>
        {user.approvalNote ? <p className="muted">Note: {user.approvalNote}</p> : null}
        <button className="button" type="button" onClick={logout}>
          Sign Out
        </button>
      </section>
    );
  }

  return children || <Outlet />;
}

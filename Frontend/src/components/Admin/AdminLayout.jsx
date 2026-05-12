import React from "react";
import { NavLink, Navigate, useNavigate } from "react-router-dom";
import {
  Activity,
  Briefcase,
  CreditCard,
  Eye,
  FileSearch,
  LayoutDashboard,
  LogOut,
  Shield,
  Settings2,
  Users,
  MessageSquare,
} from "lucide-react";
import "./AdminDashboard.css";

const AUTH_KEYS = [
  "candidate",
  "candidateResults",
  "currentUser",
  "user_role",
  "token",
  "current_hr_user",
  "user",
  "admin_logged_in",
  "admin_user",
];

const primaryNav = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/admin/hrs", label: "HR Management", icon: Briefcase },
  { to: "/admin/manage-tests", label: "Manage Test", icon: Settings2 },
  { to: "/admin/live-monitoring", label: "Live Monitoring", icon: Activity },
  { to: "/admin/candidates", label: "Candidates", icon: Users },
  { to: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/admin/view-jobs", label: "View Jobs", icon: FileSearch },
  { to: "/admin/access-requests", label: "Access Requests", icon: Eye },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
];

export default function AdminLayout({
  title,
  description,
  actions,
  children,
  contentClassName = "",
  hidePageHeader = false,
}) {
  const navigate = useNavigate();
  const role = (localStorage.getItem("user_role") || "").toLowerCase();

  const adminUser = localStorage.getItem("admin_user");
  if (role !== "admin" || !adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
    window.dispatchEvent(new Event("auth-change"));
    navigate("/admin/login");
  };

  return (
    <div className="adm-container">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-top">
          <div className="adm-logo">
            <Shield className="adm-logo-icon" />
            <div className="adm-logo-copy">
              <span>Virtue Admin</span>
              <small>Operations console</small>
            </div>
          </div>
        </div>

        <nav className="adm-side-nav">
          {primaryNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `adm-nav-link${isActive ? " active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <button
            type="button"
            className="adm-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="adm-main">
        {!hidePageHeader ? (
          <div className="adm-page-header adm-header adm-header-shell">
            <div className="adm-header-copy">
              <p className="adm-header-kicker">ADMIN WORKSPACE</p>
              <h1>{title || "Welcome back, Admin!"}</h1>
              <p>
                {description ||
                  "Monitor platform growth, revenue, HR operations, and assessment activity from one control center."}
              </p>
            </div>
            <div className="adm-header-meta">
              <div className="adm-hero-badge">
                <span className="adm-badge-icon">⚡</span>
                <span className="adm-badge-text">Platform Admin</span>
              </div>
              <div className="adm-hero-card">
                <strong>System Admin</strong>
                <span>Full access dashboard</span>
              </div>
            </div>
          </div>
        ) : null}

        <section className={contentClassName}>{children}</section>
      </main>
    </div>
  );
}

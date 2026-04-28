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
  Users
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
  "admin_user"
];

const primaryNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/hrs", label: "HR Management", icon: Briefcase },
  { to: "/admin/manage-tests", label: "Manage Test", icon: Settings2 },
  { to: "/admin/live-monitoring", label: "Live Monitoring", icon: Activity },
  { to: "/admin/candidates", label: "Candidates", icon: Users },
  { to: "/admin/view-jobs", label: "View Jobs", icon: FileSearch },
  { to: "/admin/access-requests", label: "Access Requests", icon: Eye },
  { to: "/admin/payments", label: "Payments", icon: CreditCard }
];

const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem("admin_user") || "null");
  } catch {
    return null;
  }
};

export default function AdminLayout({
  title,
  description,
  actions,
  children,
  contentClassName = "",
  hidePageHeader = false
}) {
  const navigate = useNavigate();
  const role = (localStorage.getItem("user_role") || "").toLowerCase();
  const adminUser = getAdminUser();

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
        <div className="adm-logo">
          <Shield className="adm-logo-icon" />
          <span>Virtue Admin</span>
        </div>

        <nav className="adm-side-nav">
          {primaryNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `adm-nav-link${isActive ? " active" : ""}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <button type="button" className="adm-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="adm-main">
        {!hidePageHeader ? (
          <div className="adm-page-header adm-header adm-header-shell">
            <div className="adm-header-copy">
              <p className="adm-header-kicker">ADMIN PORTAL</p>
              <h1>{title || "Admin Dashboard"}</h1>
              <p>{description || "Manage operations, assessments, and oversight from one workspace."}</p>
            </div>
            {actions ? <div className="adm-header-actions">{actions}</div> : null}
          </div>
        ) : null}

        <section className={contentClassName}>{children}</section>
      </main>
    </div>
  );
}

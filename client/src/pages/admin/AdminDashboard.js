import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPieChart, FiCalendar, FiUsers, FiAward, FiShield, FiMessageSquare, FiMail } from "react-icons/fi";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useAuth } from "../../context/AuthContext";
import { OverviewTab, BookingsTab, UsersTab, ExpertsTab, AdminsTab, FeedbackTab, MessagesTab } from "./tabs";

const TABS = [
  { id: "overview", label: "Overview", icon: FiPieChart, Component: OverviewTab },
  { id: "bookings", label: "Bookings", icon: FiCalendar, Component: BookingsTab },
  { id: "users", label: "Users", icon: FiUsers, Component: UsersTab },
  { id: "experts", label: "Experts", icon: FiAward, Component: ExpertsTab },
  { id: "feedback", label: "Feedback", icon: FiMessageSquare, Component: FeedbackTab },
  { id: "messages", label: "Messages", icon: FiMail, Component: MessagesTab },
  { id: "admins", label: "Admins", icon: FiShield, Component: AdminsTab },
];

export default function AdminDashboard() {
  useDocumentTitle("Admin dashboard");
  const { user, logout } = useAuth();
  const [active, setActive] = useState("overview");
  const { Component } = TABS.find((t) => t.id === active);

  return (
    <div className="dash">
      <div className="dash__top">
        <div className="container">
          <h1>Admin dashboard</h1>
          <div className="row">
            <span className="text-small" style={{ color: "#cfe6e2" }}>{user.fullName}</span>
            <Link to="/">View site</Link>
            <button className="btn btn--light btn--sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>
      <div className="container dash__body">
        <div className="tabs" role="tablist" aria-label="Admin sections">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={active === t.id} className={active === t.id ? "is-active" : ""} onClick={() => setActive(t.id)}>
              <t.icon aria-hidden="true" /> {t.label}
            </button>
          ))}
        </div>
        <Component key={active} />
      </div>
    </div>
  );
}

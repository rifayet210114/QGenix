// ============================================================
// DashboardLayout.jsx — QGenix Dashboard Layout Wrapper
// ------------------------------------------------------------
// This is the shared layout component used by all three role-
// based dashboards (Admin, Teacher, Student). It assembles the
// full dashboard chrome:
//
//   ┌──────────┬──────────────────────────────┐
//   │          │  Navbar (top bar)             │
//   │ Sidebar  ├──────────────────────────────┤
//   │          │  <Outlet /> (page content)   │
//   │          │                              │
//   └──────────┴──────────────────────────────┘
//
// React Router's <Outlet /> renders the matched child route
// (e.g. AdminDashboard, UserManagement) inside the content area,
// so the Sidebar and Navbar persist across page navigations.
//
// On mobile, the sidebar slides in as an overlay; a backdrop
// dim layer is shown behind it so users can tap outside to close.
// ============================================================

import React, { useState } from 'react';
// Outlet renders the child route elements defined in App.jsx
import { Outlet } from 'react-router-dom';
// Sidebar — left-hand navigation panel with role-based links
import Sidebar from '../components/Sidebar';
// Navbar — top bar with title, theme toggle, user info, logout
import Navbar from '../components/Navbar';

/**
 * DashboardLayout Component
 *
 * @param {Array}  links - Navigation link objects for the Sidebar (role-specific).
 * @param {string} role  - Current user role ("Admin" | "Teacher" | "Student").
 * @param {string} title - Page title shown in the Navbar (e.g. "System Controller").
 */
export default function DashboardLayout({ links, role, title }) {
  // State to manage the open/closed status of the sidebar on mobile devices.
  // On desktop the sidebar is always visible via CSS; this state only
  // controls the mobile slide-in/out behavior.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // Root container — uses CSS Grid (or Flex) defined in the dashboard styles
    // to position the sidebar and main content area side by side
    <div className="dashboard-container">

      {/* ==================== MOBILE OVERLAY ==================== */}
      {/* Semi-transparent backdrop shown when the sidebar is open on mobile.
          Clicking the overlay closes the sidebar, providing an intuitive
          "tap outside to dismiss" interaction pattern. */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* ==================== SIDEBAR ==================== */}
      {/* Pass the sidebar open state and its setter so the Sidebar can
          close itself when a link is clicked on mobile */}
      <Sidebar links={links} role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <div className="dashboard-main">
        {/* Top navigation bar — the onMenuClick callback opens the sidebar on mobile */}
        <Navbar title={title} role={role} onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Scrollable content region where child route pages are rendered */}
        <div className="dashboard-content">
          {/* Outlet renders the matched nested route component
              (e.g. <AdminDashboard />, <UserManagement />, etc.) */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
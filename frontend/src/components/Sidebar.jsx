// ============================================================
// Sidebar.jsx — QGenix Sidebar Navigation Component
// ------------------------------------------------------------
// Renders the collapsible sidebar used inside every dashboard
// layout (Admin, Teacher, Student). It displays:
//   1. The QGenix brand logo and name
//   2. A role-based workspace label (e.g. "Admin Workspace")
//   3. A list of navigation links with icons & active-state styling
//
// The sidebar supports a mobile-responsive open/close toggle
// controlled by the parent DashboardLayout component.
// ============================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// BrainCircuit icon used for the QGenix logo mark
import { BrainCircuit } from 'lucide-react';

/**
 * Sidebar Component
 *
 * @param {Array}    links    - Array of nav link objects, each with { path, label, icon }.
 * @param {string}   role     - Current user role ("Admin" | "Teacher" | "Student"),
 *                              displayed in the workspace label.
 * @param {boolean}  isOpen   - Whether the sidebar is currently visible (mobile only).
 * @param {Function} setIsOpen - Setter to toggle sidebar visibility on mobile.
 */
export default function Sidebar({ links, role, isOpen, setIsOpen }) {
  // useLocation gives us the current URL path so we can highlight the active link
  const location = useLocation();

  return (
    // Outer sidebar container — applies glassmorphism styling via "glass-sidebar"
    // and conditionally adds the "open" class for mobile slide-in animation
    <div className={`dashboard-sidebar glass-sidebar ${isOpen ? 'open' : ''}`}>

      {/* ==================== LOGO / BRAND AREA ==================== */}
      {/* Fixed-height header matching the Navbar height (85px) for visual alignment */}
      {/* Clicking the QGenix logo navigates back to the landing page */}
      <Link
        to="/"
        style={{ height: '85px', minHeight: '85px', boxSizing: 'border-box', padding: '0 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s ease' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        title="Go to Home"
      >
        {/* Gradient icon container — purple-to-blue gradient matches the QGenix brand palette */}
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)', flexShrink: 0 }}>
          {/* BrainCircuit icon represents QGenix's AI-powered identity */}
          <BrainCircuit size={20} color="white" />
        </div>
        {/* Brand name — heavy weight and tight letter-spacing for a modern look */}
        <h3 className="sidebar-logo-text" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>QGenix</h3>
      </Link>

      {/* ==================== NAVIGATION LINKS ==================== */}
      {/* 
        [CHANGE: Added className="sidebar-scroll" and overflowY: "auto" style to enable sidebar scrolling]
        This allows the sidebar menu items to scroll on screens with smaller viewport height.
        [Bengali Note]: ছোট স্ক্রিনে সাইডবার মেনু স্ক্রল করার সুবিধা দেওয়ার জন্য 'sidebar-scroll' ক্লাস এবং 'overflowY: auto' স্টাইল যুক্ত করা হয়েছে।
      */}
      <div className="sidebar-scroll" style={{ padding: '20px 0', flex: 1, overflowY: 'auto' }}>

        {/* Workspace label — shows the current role in uppercase (e.g. "ADMIN WORKSPACE") */}
        <div style={{ padding: '0 24px', marginBottom: '12px', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.05em' }}>
          {role} Workspace
        </div>

        {/* Iterate over the links array to render each navigation item */}
        {links.map(link => {
          // Determine if this link matches the current URL for active styling
          const isActive = location.pathname === link.path;
          return (
            /* 
              [CHANGE: Reverted to standard React Link configuration without framer-motion active capsule]
              This keeps the hover and click color rendering identical to the original behavior,
              while the smooth transition time is managed seamlessly in the stylesheet.
              [Bengali Note]: আগের মতো সাধারণ রিয়্যাক্ট রাউটার লিংক স্ট্রাকচারে রিভার্ট করা হয়েছে।
            */
            <Link 
              key={link.path} 
              to={link.path} 
              // On mobile, clicking a link also closes the sidebar for better UX
              onClick={() => setIsOpen && setIsOpen(false)} 
              // Apply the active class for highlighted background/border styling
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 20px',
                // Active links inherit the accent color; inactive use a secondary tone
                color: isActive ? 'inherit' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '400'
              }}
            >
              {/* Icon wrapper — muted color when inactive, accent color when active */}
              <span style={{ display: 'flex', alignItems: 'center', color: isActive ? 'inherit' : 'var(--text-muted)' }}>
                {link.icon}
              </span>
              {/* Link label text */}
              <span style={{ fontSize: '0.9rem' }}>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
// ============================================================
// Navbar.jsx — QGenix Top Navigation Bar Component
// ------------------------------------------------------------
// Renders the horizontal top bar displayed at the top of every
// dashboard view. It contains (left → right):
//   1. Hamburger menu button (visible on mobile only)
//   2. Dynamic page title passed from the layout
//   3. Theme toggle switch (dark ↔ light mode)
//   4. Notification bell icon
//   5. User info pill (avatar + name + role badge) — driven by
//      ProfileContext so profile edits reflect here instantly
//   6. Logout button that redirects to /login
//
// The navbar uses glassmorphism (backdrop-filter blur) to let
// the dashboard background subtly show through, matching the
// overall QGenix design language.
// ============================================================

import React from 'react';
// Bell — notification icon, User — avatar fallback, LogOut — sign-out icon, Menu — hamburger, Search — search bar icon
import { Bell, User, LogOut, Menu, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
// ThemeToggle provides the dark/light mode switcher button
import ThemeToggle from './ThemeToggle';
// ProfileContext — shared profile store updated from Profile page
import { useProfile } from '../contexts/ProfileContext';

/**
 * Navbar Component
 *
 * @param {string}   title       - Page / section title displayed on the left (e.g. "System Controller").
 * @param {string}   role        - Current user role shown in the user info pill (e.g. "Admin").
 * @param {Function} onMenuClick - Callback to open the sidebar on mobile (triggers setIsSidebarOpen(true)).
 */
export default function Navbar({ title, role, onMenuClick }) {
  // Read profile name and avatar from the global ProfileContext
  const { profile } = useProfile();

  // Derive display name: use stored name if available, else fall back gracefully
  const displayName = (profile.firstName || profile.lastName)
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : 'Admin User';

  // Initials for avatar fallback when no photo is set
  const initials = (profile.firstName?.charAt(0) || '') + (profile.lastName?.charAt(0) || '');

  // Common style for circular glass action buttons
  const iconButtonStyle = {
    width: '36px',
    height: '36px',
    padding: '0',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0,0,0,0.2)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s ease',
  };

  return (
    // Main navbar wrapper — uses glassmorphism blur and sits above sidebar overlay (z-index: 30)
    <div className="dashboard-header" style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>

      {/* ==================== LEFT SECTION: Menu + Search / Title ==================== */}
      <div className="flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '450px' }}>
        {/* Hamburger menu button — hidden on desktop via CSS (.mobile-menu-btn),
            visible on small screens to toggle the sidebar open */}
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        
        {role === 'Student' ? (
          /* Search bar for Student Dashboard (Rounded pill input with search icon) */
          <div className="flex items-center" style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search anything..." 
              style={{
                width: '100%',
                padding: '8px 16px 8px 38px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '30px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
              }}
              className="navbar-search-input"
            />
          </div>
        ) : (
          /* Dynamic page title — changes based on the current dashboard section */
          <h2 className="navbar-title" style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>{title}</h2>
        )}
      </div>

      {/* ==================== RIGHT SECTION: Actions & User Info ==================== */}
      <div className="flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Dark / Light mode toggle component (Custom Styled Button) */}
        <div className="navbar-theme-toggle-wrapper">
          <ThemeToggle />
        </div>

        {/* Notification bell — links to the Student notices / notification page */}
        <Link 
          to={role === 'Student' ? '/student/notices' : '#'}
          className="navbar-btn-hover" 
          style={iconButtonStyle}
          title="Notifications"
        >
          <Bell size={18} />
          {/* Small circular notification badge dot */}
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '7px',
            height: '7px',
            background: '#8B5CF6',
            borderRadius: '50%',
            boxShadow: '0 0 8px #8B5CF6'
          }} />
        </Link>

        {/* ---- User Profile Pill Card ---- */}
        {/* Shows avatar photo (if set) or gradient initials, plus the live display name from ProfileContext. */}
        <div className="flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 16px 6px 6px', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 6px rgba(0,0,0,0.1)' }}>
          {/* Avatar: shows uploaded photo or gradient initials circle */}
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Profile"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
              }}
            />
          ) : (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
              flexShrink: 0,
              color: 'white',
              fontSize: initials ? '0.65rem' : '0.9rem',
              fontWeight: 800,
            }}>
              {initials || <User size={14} color="white" />}
            </div>
          )}
          {/* User details — name and role label stacked vertically */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Display name — live from ProfileContext */}
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>{displayName}</div>
            {/* Role badge — displays STUDENT label in purple when user is a student */}
            <div style={{ fontSize: '0.65rem', color: '#8B5CF6', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.1 }}>
              {role === 'Student' ? 'STUDENT' : role}
            </div>
          </div>
        </div>

        {/* Logout button — navigates to /login, effectively ending the session */}
        <Link 
          to="/login" 
          className="navbar-btn-hover" 
          style={iconButtonStyle}
          title="Logout"
        >
          {/* Slight left margin on the icon to optically center it within the circle */}
          <LogOut size={18} style={{ marginLeft: '2px' }} />
        </Link>
      </div>
    </div>
  );
}
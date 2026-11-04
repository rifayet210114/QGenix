// ============================================================
// Navbar.jsx — QGenix Top Navigation Bar Component
// ------------------------------------------------------------
// Renders the horizontal top bar displayed at the top of every
// dashboard view. It contains (left → right):
//   1. Hamburger menu button (visible on mobile only)
//   2. Dynamic page title passed from the layout
//   3. Theme toggle switch (dark ↔ light mode)
//   4. Notification bell icon (shortcut to role notice board + unread badge)
//   5. User info pill (avatar + name + role badge) — driven by
//      ProfileContext so profile edits reflect here instantly
//   6. Logout button that redirects to /login
//
// The navbar uses glassmorphism (backdrop-filter blur) to let
// the dashboard background subtly show through, matching the
// overall QGenix design language.
// ============================================================

import React, { useState, useEffect } from 'react';
// Bell — notification icon, User — avatar fallback, LogOut — sign-out icon, Menu — hamburger, Search — search bar icon, LogIn & Clock for Check-In
import { Bell, User, LogOut, Menu, Search, LogIn, Clock, Video } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// ThemeToggle provides the dark/light mode switcher button
import ThemeToggle from './ThemeToggle';
// ProfileContext — shared profile store updated from Profile page
import { useProfile } from '../contexts/ProfileContext';
// AuthContext — handles session state and role clearance upon logout
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../config';

/**
 * Navbar Component
 *
 * @param {string}   title       - Page / section title displayed on the left (e.g. "System Controller").
 * @param {string}   role        - Current user role shown in the user info pill (e.g. "Admin").
 * @param {Function} onMenuClick - Callback to open the sidebar on mobile (triggers setIsSidebarOpen(true)).
 */
export default function Navbar({ title, role, onMenuClick }) {
  // Read profile name and avatar from the global ProfileContext and AuthContext
  const { profile } = useProfile();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [liveOnlineClass, setLiveOnlineClass] = useState(null);
  const [showLiveToast, setShowLiveToast] = useState(false);

  // Teacher Biometric Check-In & Check-Out state
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [isCheckLoading, setIsCheckLoading] = useState(false);

  // Poll or fetch initial teacher check-in status from DB
  const fetchTeacherCheckInStatus = async () => {
    if (role !== 'Teacher') return;
    try {
      const teacherId = user?.id || user?.institutional_id || user?.email;
      const url = teacherId 
        ? `${API_BASE}/api/auth/teacher-checkin/?teacher_id=${encodeURIComponent(teacherId)}`
        : `${API_BASE}/api/auth/teacher-checkin/`;
      const token = localStorage.getItem('token') || (user && user.token);
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setIsCheckedIn(Boolean(data.is_checked_in));
        setCheckInTime(data.check_in_time || null);
      }
    } catch (e) {
      console.warn('Error fetching teacher check-in status:', e);
    }
  };

  useEffect(() => {
    if (role === 'Teacher') {
      fetchTeacherCheckInStatus();
    }
    // Listen to custom event for across-component synchronization
    const handleSync = () => fetchTeacherCheckInStatus();
    window.addEventListener('qgenix_teacher_checkin_updated', handleSync);
    return () => window.removeEventListener('qgenix_teacher_checkin_updated', handleSync);
  }, [role, user]);

  // Handle Toggle Check-In / Check-Out
  const handleToggleCheckInOut = async () => {
    if (role !== 'Teacher' || isCheckLoading) return;
    setIsCheckLoading(true);
    const teacherId = user?.id || user?.institutional_id || user?.email;
    const actionToPerform = isCheckedIn ? 'check_out' : 'check_in';
    const token = localStorage.getItem('token') || (user && user.token);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/api/auth/teacher-checkin/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          teacher_id: teacherId,
          action: actionToPerform,
          terminal: 'Web Turnstile - Teacher Top Navbar'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setIsCheckedIn(Boolean(data.is_checked_in));
        setCheckInTime(data.check_in_time || null);
        // Broadcast custom event so Teacher Dashboard and Admin Panel immediately sync
        window.dispatchEvent(new CustomEvent('qgenix_teacher_checkin_updated', { detail: data }));
        try {
          const bc = new BroadcastChannel('qgenix_teacher_biometrics');
          bc.postMessage({ type: 'CHECKIN_UPDATED', teacherId, data, timestamp: Date.now() });
          bc.close();
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to toggle check-in/out:', err);
    } finally {
      setIsCheckLoading(false);
    }
  };

  // Shortcut destination based on user role
  const noticeTargetUrl = role === 'Student' 
    ? '/student/notices' 
    : role === 'Teacher' 
      ? '/teacher/notices' 
      : '/admin/notices';

  // Calculate unread notices targeted to this specific user role (Student & Teacher only)
  const checkUnreadNotices = () => {
    // Admin does not need an unread badge on their notice icon
    if (role !== 'Student' && role !== 'Teacher') {
      setUnreadCount(0);
      return;
    }

    try {
      const roleKey = (role || 'student').toLowerCase();
      const raw = localStorage.getItem('qgenix_notices');
      if (!raw) {
        setUnreadCount(0);
        return;
      }
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) {
        setUnreadCount(0);
        return;
      }

      // Filter notices targeted to this user's role
      const targeted = list.filter(n => {
        const aud = (n.audience || '').toLowerCase();
        if (role === 'Student') {
          return !n.audience || aud === 'all students & teachers' || aud === 'students only' || aud === 'all students' || (aud.includes('student') && !aud.includes('teacher'));
        }
        if (role === 'Teacher') {
          return !n.audience || aud === 'all students & teachers' || aud === 'teachers only' || (aud.includes('teacher') && !aud.includes('student'));
        }
        return false;
      });

      const readIds = JSON.parse(localStorage.getItem(`qgenix_read_notices_${roleKey}`) || '[]');
      const unread = targeted.filter(n => !readIds.includes(String(n.id)));
      setUnreadCount(unread.length);
    } catch (e) {
      console.warn('Error checking unread notices:', e);
    }
  };

  // Mark all currently targeted notices as read
  const markAllAsRead = () => {
    try {
      const roleKey = (role || 'student').toLowerCase();
      const raw = localStorage.getItem('qgenix_notices');
      if (!raw) return;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return;

      const targeted = list.filter(n => {
        const aud = (n.audience || '').toLowerCase();
        if (role === 'Student') {
          return !n.audience || aud === 'all students & teachers' || aud === 'students only' || aud === 'all students' || (aud.includes('student') && !aud.includes('teacher'));
        }
        if (role === 'Teacher') {
          return !n.audience || aud === 'all students & teachers' || aud === 'teachers only' || (aud.includes('teacher') && !aud.includes('student'));
        }
        return true;
      });

      const allTargetedIds = targeted.map(n => String(n.id));
      localStorage.setItem(`qgenix_read_notices_${roleKey}`, JSON.stringify(allTargetedIds));
      setUnreadCount(0);
      window.dispatchEvent(new Event('qgenix_read_status_updated'));
    } catch (e) {
      console.warn('Error marking notices read:', e);
    }
  };

  // Check for active online classes matching student cohort
  const checkLiveOnlineClasses = async () => {
    if (role !== 'Student') return;
    try {
      const studentBatch = profile?.batch || user?.batch;
      const studentSemester = profile?.semester || user?.semester;
      const studentSection = profile?.section || user?.section;
      let url = `${API_BASE}/api/auth/online-classes/?status=LIVE`;
      if (studentBatch) url += `&batch=${encodeURIComponent(studentBatch)}`;
      if (studentSemester) url += `&semester=${encodeURIComponent(studentSemester)}`;
      if (studentSection && studentSection !== 'All') url += `&section=${encodeURIComponent(studentSection)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.results || [];
        const live = list.find(s => s.status === 'LIVE' && s.is_active);
        setLiveOnlineClass(live || null);
      }
    } catch (e) {
      // Ignore network errors
    }
  };

  useEffect(() => {
    if (role === 'Student') {
      checkLiveOnlineClasses();
    }

    let channel;
    try {
      channel = new BroadcastChannel('qgenix_online_class_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'CLASS_STARTED') {
          if (role === 'Student') {
            setLiveOnlineClass(event.data.session);
            setShowLiveToast(true);
            checkUnreadNotices();
          }
        } else if (event.data?.type === 'CLASS_ENDED') {
          setLiveOnlineClass(null);
          setShowLiveToast(false);
        }
      };
    } catch (e) {}

    return () => {
      if (channel) channel.close();
    };
  }, [role, user, profile]);

  useEffect(() => {
    checkUnreadNotices();

    // If the user navigates directly into the notice board page, mark as read
    if (location.pathname === noticeTargetUrl) {
      markAllAsRead();
    }

    const handleSync = () => {
      checkUnreadNotices();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('qgenix_notices_updated', handleSync);
    window.addEventListener('qgenix_read_status_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('qgenix_notices_updated', handleSync);
      window.removeEventListener('qgenix_read_status_updated', handleSync);
    };
  }, [location.pathname, role, noticeTargetUrl]);

  // Derive display name: check user session first, then profile context, then fallback
  const displayName = user?.name || (profile.firstName || profile.lastName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : `${role} User`);

  // Initials for avatar fallback when no photo is set
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : ((profile.firstName?.charAt(0) || '') + (profile.lastName?.charAt(0) || ''));

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

        {/* Teacher Real-Time Biometric Check-In & Check-Out Button (Only visible for Teacher role) */}
        {role === 'Teacher' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleToggleCheckInOut}
              disabled={isCheckLoading}
              className="hover-lift"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: '30px',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: isCheckLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: isCheckedIn ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(16, 185, 129, 0.5)',
                background: isCheckedIn 
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.35) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.4) 100%)',
                color: isCheckedIn ? '#FCA5A5' : '#6EE7B7',
                boxShadow: isCheckedIn 
                  ? '0 0 16px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                  : '0 0 16px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
              }}
              title={isCheckedIn ? `Checked In at ${checkInTime || 'Morning'}. Click to Check Out` : "Click to Check In for Campus Duty"}
            >
              <span 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isCheckedIn ? '#EF4444' : '#10B981',
                  boxShadow: isCheckedIn ? '0 0 8px #EF4444' : '0 0 8px #10B981',
                  display: 'inline-block'
                }} 
              />
              {isCheckLoading ? (
                <span>Syncing...</span>
              ) : isCheckedIn ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <LogOut size={14} /> Check OUT
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <LogIn size={14} /> Check IN
                </span>
              )}
            </button>
            
            {isCheckedIn && checkInTime && (
              <span 
                style={{ 
                  fontSize: '0.72rem', 
                  color: 'var(--text-secondary)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                className="hidden sm:inline-flex"
              >
                <Clock size={12} color="#10B981" /> In: {checkInTime}
              </span>
            )}
          </div>
        )}

        {/* Dark / Light mode toggle component (Custom Styled Button) */}
        <div className="navbar-theme-toggle-wrapper">
          <ThemeToggle />
        </div>

        {/* Live Class Indicator Badge for Students */}
        {role === 'Student' && liveOnlineClass && (
          <Link
            to="/student/online-class"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#f87171',
              fontSize: '0.78rem',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.35)',
              whiteSpace: 'nowrap'
            }}
            title={`Live class started: ${liveOnlineClass.course_code} - Click to join`}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            Live Class
          </Link>
        )}

        {/* Notification bell shortcut — links to Student / Teacher / Admin notice board with unread indicator */}
        <Link 
          to={noticeTargetUrl}
          onClick={markAllAsRead}
          className="navbar-btn-hover" 
          style={iconButtonStyle}
          title={(role === 'Student' || role === 'Teacher') && unreadCount > 0 ? `${unreadCount} Unread Notice${unreadCount > 1 ? 's' : ''}` : "Notice Board"}
        >
          <Bell size={18} />
          {/* Dynamic Unread Indicator Badge (Shown only for Students & Teachers when unread notices exist) */}
          {(role === 'Student' || role === 'Teacher') && unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              background: '#EF4444',
              borderRadius: '9px',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.85)',
              border: '2px solid var(--bg-primary, #0B0F19)',
              lineHeight: 1
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* ---- User Profile Pill Card ---- */}
        {/* Shows avatar photo (if set) or gradient initials, plus the live display name */}
        <div className="flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 16px 6px 6px', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 6px rgba(0,0,0,0.1)' }}>
          {/* Avatar: shows uploaded photo or gradient initials circle */}
          {(user?.profile_picture || profile.avatarUrl) ? (
            <img
              src={user?.profile_picture || profile.avatarUrl}
              alt="Profile"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                border: '2px solid #8B5CF6',
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
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

        {/* Logout button — destroys session, clears localStorage, navigates to /login */}
        <button 
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="navbar-btn-hover" 
          style={iconButtonStyle}
          title="Logout / Sign Out"
        >
          {/* Slight left margin on the icon to optically center it within the circle */}
          <LogOut size={18} style={{ marginLeft: '2px' }} />
        </button>
      </div>
    </div>
  );
}
// =========================================================================================
// src/components/RoleRoute.jsx — Role-Based Access Control (RBAC) Route Guards
// -----------------------------------------------------------------------------------------
// Bengali Note:
// এই কম্পোনেন্টটি রোল-ভিত্তিক রাউট সিকিউরিটি নিশ্চিত করে:
// ১. Student রা শুধুমাত্র /student এ যেতে পারবে; /teacher বা /admin এ যেতে পারবে না (403 ব্লক)।
// ২. Teacher রা শুধুমাত্র /teacher এ যেতে পারবে; /student বা /admin এ যেতে পারবে না (403 ব্লক)।
// ৩. Admin রা /admin কনসোলে প্রবেশ করবে।
// ৪. কেউ অবৈধভাবে অন্য পোর্টালে ঢুকতে চাইলে সুন্দর 403 Access Denied স্ক্রিন দেখাবে এবং 
//    তার নিজস্ব পোর্টালে ফিরে যাওয়ার বাটন প্রদান করবে।
// =========================================================================================

import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';

export function RoleRoute({ allowedRoles = [], portalName = 'Restricted Portal', children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Not Authenticated -> Redirect to Login
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const userRole = user?.role?.toUpperCase();

  // 2. Check if user's role is in the allowed roles list
  const isAuthorized = allowedRoles.map(r => r.toUpperCase()).includes(userRole);

  if (!isAuthorized) {
    // Determine proper home dashboard based on active user's actual role
    let userHomePath = '/student';
    let userRoleDisplay = 'Student / Learner';

    if (userRole === 'TEACHER') {
      userHomePath = '/teacher';
      userRoleDisplay = 'Faculty / Teacher';
    } else if (userRole === 'ADMIN') {
      userHomePath = '/admin';
      userRoleDisplay = 'System Administrator';
    }

    return (
      <div style={{
        minHeight: '100vh',
        background: '#090d16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          maxWidth: '560px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '20px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 25px 60px -15px rgba(239, 68, 68, 0.25)',
          backdropFilter: 'blur(16px)'
        }}>
          {/* Animated Security Shield Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: '#ef4444'
          }}>
            <ShieldAlert size={44} />
          </div>

          <span style={{
            display: 'inline-block',
            padding: '4px 14px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: '16px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            HTTP 403 • ACCESS FORBIDDEN
          </span>

          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 10px', color: '#ffffff' }}>
            অননুমোদিত প্রবেশাধিকার / Access Denied
          </h1>

          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 20px' }}>
            You are signed in as <strong style={{ color: '#38bdf8' }}>{userRoleDisplay}</strong>. 
            Access to the <strong>{portalName}</strong> is strictly restricted to {allowedRoles.join(' or ')} accounts.
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#cbd5e1'
          }}>
            <Lock size={15} style={{ color: '#f59e0b' }} />
            <span>Active Account: <strong>{user?.username}</strong> ({user?.email})</span>
          </div>

          {/* Action Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(userHomePath)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              <ArrowLeft size={16} />
              Return to My {userRoleDisplay.split('/')[0].trim()} Portal
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized -> Render portal content
  return children;
}

// Convenient Role Guard Aliases
export function AdminRoute({ children }) {
  return <RoleRoute allowedRoles={['ADMIN']} portalName="Admin Console">{children}</RoleRoute>;
}

export function TeacherRoute({ children }) {
  return <RoleRoute allowedRoles={['TEACHER']} portalName="Teacher Command Center">{children}</RoleRoute>;
}

export function StudentRoute({ children }) {
  return <RoleRoute allowedRoles={['STUDENT']} portalName="Student Learning Portal">{children}</RoleRoute>;
}

export default RoleRoute;

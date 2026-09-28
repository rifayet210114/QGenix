// ============================================================================
// Profile.jsx — QGenix Student Academic Profile & Security Dashboard
// ============================================================================
// Features:
//   1. Profile Overview: Avatar header, Completion progress, Quick stats cards.
//   2. Personal Information Card: Editable fields (DOB, Gender, Nationality, etc.)
//   3. Academic Information: Read-only structured card with program tracking.
//   4. Contact Information Card: Editable fields (Email, Phone, Address, etc.)
//   5. Profile Photo Management: Change/Upload/Remove avatar picture.
//   6. Security Settings: Change password, 2FA toggle, sessions, security logs.
//   7. Documents & ID Card: Upload registry, view certificates, download digital ID.
//   8. Notification Preferences: E-mail and push toggles.
//   9. Privacy Settings: Show email/phone, profile visibility preferences.
//   10. Activity History: Timestamps timeline of recent submissions & events.
//   11. Account Management (Danger Zone): Data export, account deactivation/deletion.
//   12. Achievements & Badges: ACC accolades grid (Top Performer, Perfect Attendance).
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, ShieldAlert, Award, FileText, 
  Bell, Eye, Lock, Clock, Calendar, CheckCircle2, ChevronRight, 
  Download, Upload, Trash2, Camera, LogOut, Check, X, HelpCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import Card from '../../components/Card';
import { useProfile } from '../../contexts/ProfileContext';

// All personal fields start empty — student fills their own info
const initialPersonalData = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  bloodGroup: '',
  nationality: '',
  religion: '',
  motherTongue: '',
};

const initialContactData = {
  email: '',
  phone: '',
  emergencyContact: '',
  address: '',
  city: '',
  country: '',
};

const initialAcademicData = {
  studentId: '',
  department: '',
  program: '',
  batch: '',
  semester: '',
  session: '',
  advisor: '',
  cgpa: '',
  credits: '',
};

const achievements = [
  { id: 1, title: 'Top Performer', desc: 'Maintained CGPA > 3.5 for two consecutive semesters', icon: '🏆', color: '#F59E0B' },
  { id: 2, title: 'Perfect Attendance', desc: '100% attendance rate in CSE-301 Algorithms', icon: '📅', color: '#10B981' },
  { id: 3, title: 'Assignment Master', desc: 'All lab reports and assignments submitted ahead of deadline', icon: '📝', color: '#3B82F6' },
  { id: 4, title: 'Exam Champion', desc: 'Scored 100% in Spring 2026 DBMS Midterm exam', icon: '🎯', color: '#8B5CF6' }
];

const securityLogs = [
  { id: 1, time: '2026-06-21 03:09 AM', browser: 'Chrome 122.0', device: 'Windows Desktop', ip: '192.168.1.45', status: 'Success' },
  { id: 2, time: '2026-06-20 10:12 PM', browser: 'Chrome 122.0', device: 'Windows Desktop', ip: '192.168.1.45', status: 'Success' },
  { id: 3, time: '2026-06-18 08:30 AM', browser: 'Safari Mobile', device: 'iPhone 15 Pro', ip: '103.55.12.110', status: 'Success' }
];

const activeSessions = [
  { id: 1, device: 'Windows 11 Desktop (Current)', location: 'Dhaka, Bangladesh', current: true },
  { id: 2, device: 'iPhone 15 Pro Browser', location: 'Dhaka, Bangladesh', current: false }
];

const activityTimeline = [
  { id: 1, time: 'Today, 03:09 AM', type: 'Logged In', desc: 'Successful login from Chrome on Windows Desktop', category: 'Security' },
  { id: 2, time: 'Yesterday, 02:45 PM', type: 'Submitted Assignment', desc: 'Uploaded "Assignment 2: CI/CD Pipeline Configuration" for CSE-304', category: 'Academic' },
  { id: 3, time: '2026-06-18, 10:30 AM', type: 'Completed Exam', desc: 'Completed "Class Test 2" for Computer Networks (CSE-303)', category: 'Exam' },
  { id: 4, time: '2026-06-15, 05:00 PM', type: 'Downloaded Result', desc: 'Exported Spring Mid Term Grade Sheets', category: 'Document' },
  { id: 5, time: '2026-06-10, 09:15 AM', type: 'Changed Password', desc: 'Security credentials updated successfully', category: 'Security' }
];

const initialDocuments = [
  { id: 1, name: 'Student ID Card (Digital)', type: 'PDF', size: '1.2 MB', date: '2026-01-10' },
  { id: 2, name: 'National ID Card Scan', type: 'PDF', size: '2.4 MB', date: '2026-01-12' },
  { id: 3, name: 'HSC Examination Certificate', type: 'PDF', size: '3.1 MB', date: '2026-01-10' }
];

export default function Profile() {
  // Global profile context — keeps Navbar name+avatar in sync
  const { profile, setProfile } = useProfile();

  // Theme state observer
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Main Tabs State (Academic/Overview, Personal/Contact, Security/Privacy, Documents/History)
  const [activeTab, setActiveTab] = useState('Overview');

  // Form States & Editing Toggles
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalData, setPersonalData] = useState(() => {
    try {
      const saved = localStorage.getItem('qgenix_personalData');
      const data = saved ? JSON.parse(saved) : { ...initialPersonalData };
      if (!data.firstName && profile.firstName) data.firstName = profile.firstName;
      if (!data.lastName && profile.lastName) data.lastName = profile.lastName;
      return data;
    } catch (e) {
      return initialPersonalData;
    }
  });
  const [tempPersonalData, setTempPersonalData] = useState(personalData);

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactData, setContactData] = useState(() => {
    try {
      const saved = localStorage.getItem('qgenix_contactData');
      return saved ? JSON.parse(saved) : initialContactData;
    } catch (e) {
      return initialContactData;
    }
  });
  const [tempContactData, setTempContactData] = useState(contactData);

  // Academic Info (editable)
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [academicData, setAcademicData] = useState(() => {
    try {
      const saved = localStorage.getItem('qgenix_academicData');
      return saved ? JSON.parse(saved) : initialAcademicData;
    } catch (e) {
      return initialAcademicData;
    }
  });
  const [tempAcademicData, setTempAcademicData] = useState(academicData);

  // Profile Photo — also synced to global ProfileContext so Navbar updates immediately
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || null);
  const [toastMessage, setToastMessage] = useState(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);

  // Security & Privacy preferences toggles states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showEmailOnProfile, setShowEmailOnProfile] = useState(true);
  const [showPhoneOnProfile, setShowPhoneOnProfile] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);

  // Notification Preferences
  const [emailExams, setEmailExams] = useState(true);
  const [emailAssignments, setEmailAssignments] = useState(true);
  const [emailResults, setEmailResults] = useState(true);
  const [pushReminders, setPushReminders] = useState(true);
  const [pushExams, setPushExams] = useState(true);
  const [pushAnnouncements, setPushAnnouncements] = useState(false);

  // Documents State
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Danger Zone Modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile progress bar computation based on filled fields
  const completionPercentage = useMemo(() => {
    let fields = [
      personalData.firstName, personalData.lastName, personalData.dob,
      personalData.gender, personalData.bloodGroup, personalData.nationality,
      contactData.email, contactData.phone, contactData.emergencyContact,
      contactData.address, contactData.city, contactData.country,
      academicData.studentId, academicData.department, academicData.program,
      avatarUrl
    ];
    let filled = fields.filter(f => f !== null && f !== '').length;
    return Math.round((filled / fields.length) * 100);
  }, [personalData, contactData, academicData, avatarUrl]);

  // Handlers for Personal Info form
  const handleEditPersonal = () => {
    setTempPersonalData({ ...personalData });
    setIsEditingPersonal(true);
  };
  const handleSavePersonal = (e) => {
    e.preventDefault();
    setPersonalData({ ...tempPersonalData });
    localStorage.setItem('qgenix_personalData', JSON.stringify(tempPersonalData));
    setIsEditingPersonal(false);
    // Push updated name to global context so Navbar reflects immediately
    setProfile(prev => ({
      ...prev,
      firstName: tempPersonalData.firstName,
      lastName: tempPersonalData.lastName,
    }));
    triggerToast('Personal details updated successfully!');
  };
  const handleCancelPersonal = () => {
    setIsEditingPersonal(false);
  };

  // Handlers for Contact Info form
  const handleEditContact = () => {
    setTempContactData({ ...contactData });
    setIsEditingContact(true);
  };
  const handleSaveContact = (e) => {
    e.preventDefault();
    setContactData({ ...tempContactData });
    localStorage.setItem('qgenix_contactData', JSON.stringify(tempContactData));
    setIsEditingContact(false);
    triggerToast('Contact details updated successfully!');
  };
  const handleCancelContact = () => {
    setIsEditingContact(false);
  };

  // Academic Info handlers
  const handleEditAcademic = () => {
    setTempAcademicData({ ...academicData });
    setIsEditingAcademic(true);
  };
  const handleSaveAcademic = (e) => {
    e.preventDefault();
    setAcademicData({ ...tempAcademicData });
    localStorage.setItem('qgenix_academicData', JSON.stringify(tempAcademicData));
    setIsEditingAcademic(false);
    triggerToast('Academic details updated successfully!');
  };
  const handleCancelAcademic = () => {
    setIsEditingAcademic(false);
  };

  // Profile picture upload simulation
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      triggerToast('Uploading profile image...');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatarUrl(base64String);
        setProfile(prev => ({ ...prev, avatarUrl: base64String }));
        triggerToast('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    setProfile(prev => ({ ...prev, avatarUrl: null }));
    triggerToast('Profile photo removed!');
  };

  // Password submission validation
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Confirm password does not match new password.');
      return;
    }
    // Success simulation
    triggerToast('Security password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Documents upload simulation
  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingDoc(true);
      setTimeout(() => {
        const newDoc = {
          id: Date.now(),
          name: file.name,
          type: file.name.split('.').pop().toUpperCase(),
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          date: new Date().toISOString().split('T')[0]
        };
        setDocuments(prev => [...prev, newDoc]);
        setUploadingDoc(false);
        triggerToast(`Uploaded: "${file.name}"`);
      }, 1200);
    }
  };

  const handleDocDelete = (id, name) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    triggerToast(`Removed document: "${name}"`);
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Custom Toggle component to match existing dashboard aesthetics
  const renderToggle = (checked, onChange, label) => {
    return (
      <div 
        onClick={() => onChange(!checked)} 
        className="switch-container"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
      >
        <div className={`switch-track ${checked ? 'switch-track-active' : ''}`}>
          <div className={`switch-thumb ${checked ? 'switch-thumb-active' : ''}`} />
        </div>
        {label && <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{label}</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* =======================================================================
         PAGE LOCAL INLINE CLASSES (CSS TOKENS FOR SWITCH & PROFILE)
         ======================================================================= */}
      <style>{`
        /* Glassmorphism custom profile styling */
        .profile-glass-card {
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(12, 12, 36, 0.4) 0%,
            rgba(6, 6, 20, 0.5) 100%
          ) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 20px !important;
          backdrop-filter: blur(40px) saturate(220%) !important;
          -webkit-backdrop-filter: blur(40px) saturate(220%) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.12),
            inset 0 12px 24px rgba(255, 255, 255, 0.02),
            0 8px 32px -8px   rgba(0, 0, 0, 0.45) !important;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        body.light-mode .profile-glass-card {
          background: rgba(255, 255, 255, 0.35) !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        /* Toggle switches classes */
        .switch-track {
          width: 42px;
          height: 22px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          position: relative;
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }
        body.light-mode .switch-track {
          background: rgba(0, 0, 0, 0.06);
        }
        .switch-thumb {
          width: 16px;
          height: 16px;
          background: #94a3b8;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 3px;
          transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .switch-track-active {
          background: var(--accent-primary) !important;
          border-color: var(--accent-primary) !important;
        }
        .switch-thumb-active {
          left: 21px !important;
          background: white !important;
        }

        /* Decorative orbs */
        .profile-orb-purple {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }
        .profile-orb-blue {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
        }

        /* Tabs configuration */
        .profile-tabs-container {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 2px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .profile-tabs-container::-webkit-scrollbar {
          display: none;
        }
        .profile-tab-btn {
          background: transparent;
          border: none;
          padding: 10px 16px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          transition: color 0.25s ease;
          white-space: nowrap;
        }
        .profile-tab-btn:hover {
          color: var(--text-primary);
        }
        .profile-tab-btn-active {
          color: var(--accent-primary) !important;
        }
        .profile-tab-btn-active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-primary);
          border-radius: 99px;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }

        /* Document cards row styling */
        .doc-item-row {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 16px;
          transition: all 0.25s ease;
        }
        .doc-item-row:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(139, 92, 246, 0.25);
        }
        body.light-mode .doc-item-row {
          background: rgba(0, 0, 0, 0.01);
        }
        body.light-mode .doc-item-row:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        /* Timeline styles */
        .timeline-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 19px;
          width: 2px;
          background: var(--border-color);
        }
        .timeline-item {
          position: relative;
          padding-left: 50px;
          padding-bottom: 24px;
        }
        .timeline-item:last-child {
          padding-bottom: 0;
        }
        .timeline-dot {
          position: absolute;
          left: 10px;
          top: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg-primary);
          border: 2px solid var(--accent-primary);
          display: flex;
          alignItems: center;
          justifyContent: center;
          z-index: 2;
        }

        /* Danger Zone card styling */
        .danger-zone-card {
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
          background: rgba(239, 68, 68, 0.02) !important;
        }
        body.light-mode .danger-zone-card {
          background: rgba(239, 68, 68, 0.01) !important;
        }
      `}</style>

      {/* Decorative Orbs */}
      <div className="profile-orb-purple" style={{ top: '10%', right: '-8%' }} />
      <div className="profile-orb-blue" style={{ bottom: '15%', left: '-8%' }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div className="flex flex-col gap-1 w-full relative z-10" style={{ paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <User className="text-violet-500" size={32} />
            Student Profile Details
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Manage your personal data, monitor academic standings, configure authentication methods, and download documents.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: TAB WRAPPER
         ======================================================================= */}
      <div className="profile-tabs-container relative z-10" style={{ marginTop: '8px' }}>
        {['Overview', 'Personal & Contact', 'Security & Privacy', 'Documents & Activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`profile-tab-btn ${activeTab === tab ? 'profile-tab-btn-active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* =======================================================================
         SECTION 3: ACTIVE TAB CONTENTS
         ======================================================================= */}
      <div className="relative z-10 flex flex-col gap-6 w-full">
        
        {/* -------------------- TAB 1: OVERVIEW & ACADEMICS -------------------- */}
        {activeTab === 'Overview' && (
          <div className="flex flex-col gap-6 w-full">
            
            {/* Profile Overview Header Card */}
            <div className="profile-glass-card" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
              
              {/* Photo component frame */}
              <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.2rem', fontWeight: 800, border: '3px solid var(--accent-primary)' }}>
                    {(personalData.firstName?.charAt(0) || '') + (personalData.lastName?.charAt(0) || '') || <User size={22} color='white' />}
                  </div>
                )}
                
                {/* Micro photo camera upload link trigger (opens Personal tab) */}
                <button
                  onClick={() => setActiveTab('Personal & Contact')}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    background: 'var(--accent-primary)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                  }}
                  title="Manage Avatar"
                >
                  <Camera size={14} />
                </button>
              </div>

              {/* Header Info */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(personalData.firstName || personalData.lastName) ? [personalData.firstName, personalData.lastName].filter(Boolean).join(' ') : 'Your Name'}
                  </h2>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem', borderRadius: '8px' }}>Active Student</span>
                </div>
                
                <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {academicData.studentId ? <>Student ID: <strong>{academicData.studentId}</strong></> : null}{academicData.studentId && academicData.department ? ' • ' : null}{academicData.department ? <>Department of <strong>{academicData.department}</strong></> : null}{!academicData.studentId && !academicData.department ? <span style={{color:'var(--text-muted)'}}>Fill in your academic details below</span> : null}
                </p>

                {/* Profile progress completion slider */}
                <div style={{ marginTop: '16px', maxWidth: '350px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                    <span>Profile Verification Progress</span>
                    <span>{completionPercentage}% Verified</span>
                  </div>
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>

              {/* Status details metadata cabinet */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', minWidth: '240px', background: 'rgba(255,255,255,0.015)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Session</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 650 }}>{academicData.session}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Batch</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 650 }}>{academicData.batch}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Semester</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 650 }}>{academicData.semester}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Program</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 650 }}>{academicData.program}</span>
                </div>
              </div>

            </div>

            {/* Quick Stats Grid Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
              
              <div className="profile-glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cumulative GPA</span>
                <div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{academicData.cgpa} / 4.0</div>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '2px', fontWeight: 600 }}>Consistent Academic standing</span>
                </div>
              </div>

              <div className="profile-glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed Credits</span>
                <div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{academicData.credits}</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-secondary)', display: 'block', marginTop: '2px', fontWeight: 600 }}>Credits registered this term</span>
                </div>
              </div>

              <div className="profile-glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Attendance Standing</span>
                <div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>92.5%</div>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '2px', fontWeight: 600 }}>Safe standing (above 75% limit)</span>
                </div>
              </div>

              <div className="profile-glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Exams Completed</span>
                <div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>18 Exams</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>0 pending proctored evaluations</span>
                </div>
              </div>

              <div className="profile-glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Task Submissions</span>
                <div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>24 Assignments</div>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '2px', fontWeight: 600 }}>100% submission score</span>
                </div>
              </div>

            </div>

            {/* Academic Information Details Card — Fully Editable */}
            <Card
              title="Academic Information"
              action={
                !isEditingAcademic ? (
                  <button
                    onClick={handleEditAcademic}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.25)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    Edit Academic Info
                  </button>
                ) : null
              }
            >
              <form onSubmit={handleSaveAcademic} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {[
                    { label: 'Student / Registrar ID', key: 'studentId', placeholder: 'e.g. UG02-43-21-009' },
                    { label: 'Department', key: 'department', placeholder: 'e.g. Computer Science & Engineering' },
                    { label: 'Degree Program', key: 'program', placeholder: 'e.g. B.Sc. in CSE' },
                    { label: 'Batch', key: 'batch', placeholder: 'e.g. 43rd Batch' },
                    { label: 'Current Semester', key: 'semester', placeholder: 'e.g. 5th Semester' },
                    { label: 'Academic Session', key: 'session', placeholder: 'e.g. Spring 2026' },
                    { label: 'Academic Advisor', key: 'advisor', placeholder: 'e.g. Dr. Sarah Ahmed' },
                    { label: 'CGPA', key: 'cgpa', placeholder: 'e.g. 3.65' },
                    { label: 'Credits Earned / Total', key: 'credits', placeholder: 'e.g. 72 / 140' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</label>
                      <input
                        type="text"
                        value={isEditingAcademic ? tempAcademicData[key] : academicData[key]}
                        onChange={(e) => setTempAcademicData({ ...tempAcademicData, [key]: e.target.value })}
                        disabled={!isEditingAcademic}
                        placeholder={isEditingAcademic ? placeholder : (academicData[key] ? undefined : '—')}
                        className="input-field"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                      />
                    </div>
                  ))}
                </div>
                {isEditingAcademic && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="submit"
                      style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Save Academic Info
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAcademic}
                      style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </Card>

            {/* Achievements & Badges Showcase Section */}
            <Card title="Achievements & Award Badges">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '12px' }}>
                {achievements.map(ach => (
                  <div 
                    key={ach.id}
                    className="doc-item-row"
                    style={{ display: 'flex', gap: '16px', alignItems: 'start' }}
                  >
                    <div style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '14px', width: '56px', height: '56px', flexShrink: 0 }}>
                      {ach.icon}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 800 }}>{ach.title}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        )}

        {/* -------------------- TAB 2: PERSONAL & CONTACT -------------------- */}
        {activeTab === 'Personal & Contact' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Left Column: Personal Info Card & Photo Management */}
            <div className="flex flex-col gap-6">
              
              {/* Photo Management Box */}
              <Card title="Profile Photo Management">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                  
                  {/* Photo circular Avatar component */}
                  <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profile avatar" 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.8rem', fontWeight: 800, border: '3px solid var(--accent-primary)' }}>
                        {(personalData.firstName?.charAt(0) || '') + (personalData.lastName?.charAt(0) || '') || <User size={22} color='white' />}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    
                    <label 
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)'
                      }}
                    >
                      <Upload size={14} />
                      <span>Upload Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>

                    {avatarUrl && (
                      <button
                        onClick={handleRemovePhoto}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          color: '#EF4444',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    )}

                  </div>

                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '240px' }}>
                    Supported formats: JPG, PNG. Maximum file size: 2MB. Recommended dimensions: 300x300 pixels.
                  </p>
                </div>
              </Card>

              {/* Personal Information Form Card */}
              <Card 
                title="Personal Information"
                action={
                  !isEditingPersonal ? (
                    <button
                      onClick={handleEditPersonal}
                      className="btn-resource-action"
                      style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.25)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      Edit Profile
                    </button>
                  ) : null
                }
              >
                <form onSubmit={handleSavePersonal} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>First Name</label>
                      <input 
                        type="text" 
                        value={tempPersonalData.firstName}
                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, firstName: e.target.value })}
                        disabled={!isEditingPersonal}
                        className="input-field"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Last Name</label>
                      <input 
                        type="text" 
                        value={tempPersonalData.lastName}
                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, lastName: e.target.value })}
                        disabled={!isEditingPersonal}
                        className="input-field"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Date of Birth</label>
                    <input 
                      type="date" 
                      value={tempPersonalData.dob}
                      onChange={(e) => setTempPersonalData({ ...tempPersonalData, dob: e.target.value })}
                      disabled={!isEditingPersonal}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Gender</label>
                      <select 
                        value={tempPersonalData.gender}
                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, gender: e.target.value })}
                        disabled={!isEditingPersonal}
                        className="input-field"
                        style={{ height: '38px', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-primary)' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Blood Group</label>
                      <select 
                        value={tempPersonalData.bloodGroup}
                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, bloodGroup: e.target.value })}
                        disabled={!isEditingPersonal}
                        className="input-field"
                        style={{ height: '38px', fontSize: '0.85rem', outline: 'none', background: 'var(--bg-primary)' }}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nationality</label>
                    <input 
                      type="text" 
                      value={tempPersonalData.nationality}
                      onChange={(e) => setTempPersonalData({ ...tempPersonalData, nationality: e.target.value })}
                      disabled={!isEditingPersonal}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Religion</label>
                      <input 
                        type="text" 
                        value={tempPersonalData.religion}
                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, religion: e.target.value })}
                        disabled={!isEditingPersonal}
                        placeholder={isEditingPersonal ? 'e.g. Islam' : ''}
                        className="input-field"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mother Tongue</label>
                      <input 
                        type="text" 
                        value={tempPersonalData.motherTongue}
                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, motherTongue: e.target.value })}
                        disabled={!isEditingPersonal}
                        placeholder={isEditingPersonal ? 'e.g. Bangla' : ''}
                        className="input-field"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {isEditingPersonal && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          color: 'white',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPersonal}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                </form>
              </Card>

            </div>

            {/* Right Column: Contact Info Card */}
            <div>
              <Card 
                title="Contact Information"
                action={
                  !isEditingContact ? (
                    <button
                      onClick={handleEditContact}
                      className="btn-resource-action"
                      style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.25)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      Edit Contact
                    </button>
                  ) : null
                }
              >
                <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="email" 
                        value={tempContactData.email}
                        onChange={(e) => setTempContactData({ ...tempContactData, email: e.target.value })}
                        disabled={!isEditingContact}
                        className="input-field"
                        style={{ height: '38px', paddingLeft: '36px', fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        value={tempContactData.phone}
                        onChange={(e) => setTempContactData({ ...tempContactData, phone: e.target.value })}
                        disabled={!isEditingContact}
                        className="input-field"
                        style={{ height: '38px', paddingLeft: '36px', fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Emergency Contact</label>
                    <input 
                      type="text" 
                      value={tempContactData.emergencyContact}
                      onChange={(e) => setTempContactData({ ...tempContactData, emergencyContact: e.target.value })}
                      disabled={!isEditingContact}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Street Address</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        value={tempContactData.address}
                        onChange={(e) => setTempContactData({ ...tempContactData, address: e.target.value })}
                        disabled={!isEditingContact}
                        className="input-field"
                        style={{ height: '38px', paddingLeft: '36px', fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>City</label>
                      <input 
                        type="text" 
                        value={tempContactData.city}
                        onChange={(e) => setTempContactData({ ...tempContactData, city: e.target.value })}
                        disabled={!isEditingContact}
                        className="input-field"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Country</label>
                      <input 
                        type="text" 
                        value={tempContactData.country}
                        onChange={(e) => setTempContactData({ ...tempContactData, country: e.target.value })}
                        disabled={!isEditingContact}
                        className="input-field"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                  </div>

                  {isEditingContact && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          color: 'white',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelContact}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                </form>
              </Card>
            </div>

          </div>
        )}

        {/* -------------------- TAB 3: SECURITY & PRIVACY -------------------- */}
        {activeTab === 'Security & Privacy' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Left Column: Password update & Privacy preferences */}
            <div className="flex flex-col gap-6">
              
              {/* Change Password Card */}
              <Card title="Change Security Password">
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  
                  {passwordError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 14px', borderRadius: '8px', color: '#EF4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={14} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.82rem',
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'center',
                      marginTop: '4px'
                    }}
                  >
                    <Lock size={14} />
                    <span>Save Password</span>
                  </button>

                </form>
              </Card>

              {/* Privacy Settings Card */}
              <Card title="Privacy Configurations">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Public Profile Visibility</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Allow peers to view your academic cohort ranking</span>
                    </div>
                    {renderToggle(profileVisibility, setProfileVisibility)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Show Email Address</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Display email to class representatives and advisor</span>
                    </div>
                    {renderToggle(showEmailOnProfile, setShowEmailOnProfile)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Show Phone Number</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Display mobile number to instructors for emergency updates</span>
                    </div>
                    {renderToggle(showPhoneOnProfile, setShowPhoneOnProfile)}
                  </div>

                </div>
              </Card>

            </div>

            {/* Right Column: Authentication & Security Logs */}
            <div className="flex flex-col gap-6">
              
              {/* Authentication Settings Card */}
              <Card title="Authentication Settings">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Two-Factor Authentication (2FA)</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Secure login using temporary verification email codes</span>
                    </div>
                    {renderToggle(is2FAEnabled, setIs2FAEnabled)}
                  </div>

                  {/* Active Sessions list */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Active Sessions</span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {activeSessions.map(sess => (
                        <div 
                          key={sess.id} 
                          className="doc-item-row"
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}
                        >
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{sess.device}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{sess.location}</span>
                          </div>
                          {sess.current ? (
                            <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>Current Session</span>
                          ) : (
                            <button 
                              onClick={() => triggerToast(`Terminated session on ${sess.device}`)}
                              style={{ border: 'none', background: 'transparent', fontSize: '0.7rem', color: '#EF4444', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              Terminate
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </Card>

              {/* Security Logs Card */}
              <Card title="Recent Security Logs">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  {securityLogs.map(log => (
                    <div 
                      key={log.id} 
                      className="doc-item-row"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}
                    >
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                          IP: {log.ip} • {log.device}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          <span>{log.browser}</span>
                          <span>•</span>
                          <span>{log.time}</span>
                        </div>
                      </div>
                      
                      <span className="badge badge-success" style={{ fontSize: '0.62rem', fontWeight: 'bold', borderRadius: '6px' }}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

          </div>
        )}

        {/* -------------------- TAB 4: DOCUMENTS & ACTIVITY -------------------- */}
        {activeTab === 'Documents & Activity' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Left Column: Documents Locker & Account Management */}
            <div className="flex flex-col gap-6">
              
              {/* Documents Locker */}
              <Card 
                title="Documents Cabinet"
                action={
                  <label 
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {uploadingDoc ? (
                      <RefreshCw size={12} className="animate-spin text-purple-500" />
                    ) : (
                      <Upload size={12} />
                    )}
                    <span>{uploadingDoc ? 'Uploading...' : 'Upload Doc'}</span>
                    <input 
                      type="file" 
                      onChange={handleDocUpload}
                      disabled={uploadingDoc}
                      style={{ display: 'none' }} 
                    />
                  </label>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  {documents.map(doc => (
                    <div 
                      key={doc.id}
                      className="doc-item-row"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{doc.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{doc.type} • {doc.size} • Uploaded: {doc.date}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {doc.id === 1 ? (
                          <button
                            onClick={() => triggerToast('Downloading digital student ID card representation...')}
                            style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', cursor: 'pointer' }}
                            title="Download Digital ID"
                          >
                            <Download size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => triggerToast(`Previewing file: "${doc.name}"`)}
                            style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            title="Preview File"
                          >
                            <Eye size={14} />
                          </button>
                        )}

                        {doc.id !== 1 && (
                          <button
                            onClick={() => handleDocDelete(doc.id, doc.name)}
                            style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', cursor: 'pointer' }}
                            title="Delete Document"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Notification Preferences */}
              <Card title="Notification Preferences">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Email Notifications</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Exam Updates & Time Adjustments</span>
                        {renderToggle(emailExams, setEmailExams)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assignment Deadlines & Reminders</span>
                        {renderToggle(emailAssignments, setEmailAssignments)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Result Publication Announcements</span>
                        {renderToggle(emailResults, setEmailResults)}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Push Notifications</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Class Attendance Reminders</span>
                        {renderToggle(pushReminders, setPushReminders)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Upcoming Proctoring Exams</span>
                        {renderToggle(pushExams, setPushExams)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System Announcements & Alerts</span>
                        {renderToggle(pushAnnouncements, setPushAnnouncements)}
                      </div>
                    </div>
                  </div>

                </div>
              </Card>

              {/* Account Management Danger Zone Card */}
              <div className="profile-glass-card danger-zone-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#EF4444', fontWeight: 800 }}>Danger Zone</h3>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Critical actions regarding your academic account profile data</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button
                      onClick={() => triggerToast('Compiling and exporting user profile data package...')}
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '0.78rem',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      Export Profile Data
                    </button>
                    <button
                      onClick={() => triggerToast('Generating academic transcript and credits PDF...')}
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '0.78rem',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      Download Academics PDF
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button
                      onClick={() => setShowDeactivateModal(true)}
                      style={{
                        flex: 1,
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '0.78rem',
                        color: '#F59E0B',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      Deactivate Account
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      style={{
                        flex: 1,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '0.78rem',
                        color: '#EF4444',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      Delete Account
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column: Activity History Timeline */}
            <div>
              <Card title="Recent Activity History">
                <div style={{ position: 'relative', marginTop: '16px', paddingLeft: '8px' }}>
                  
                  {/* Vertical Timeline axis */}
                  <div className="timeline-line" />

                  {/* Timeline elements */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {activityTimeline.map(act => (
                      <div key={act.id} className="timeline-item">
                        
                        {/* Dot with Category styling indicator */}
                        <div 
                          className="timeline-dot"
                          style={{
                            borderColor: act.category === 'Security' ? '#8B5CF6' :
                                         act.category === 'Academic' ? '#3B82F6' :
                                         act.category === 'Exam' ? '#F59E0B' : '#10B981'
                          }}
                        >
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-primary)' }} />
                        </div>

                        {/* Timeline text content */}
                        <div style={{ padding: '2px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{act.type}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={10} />
                              {act.time}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {act.desc}
                          </p>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              </Card>
            </div>

          </div>
        )}

      </div>

      {/* =======================================================================
         SECTION 4: MODALS & CONFIRMATION OVERLAYS
         ======================================================================= */}
      {/* 1. Account Deactivation Confirmation Modal */}
      <AnimatePresence>
        {showDeactivateModal && (
          <div className="modal-blur-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="profile-glass-card"
              style={{ padding: '24px', maxWidth: '440px', width: '100%', zIndex: 1000 }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', flexShrink: 0 }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800 }}>Deactivate Account Request</h3>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Deactivating your account will suspend your access to online proctored exams, courses, and notices. Your academic data will remain secure and can be restored by the department registrar.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'end', marginTop: '24px' }}>
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeactivateModal(false);
                    triggerToast('Account deactivation request submitted to registrar.');
                  }}
                  style={{ background: '#F59E0B', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  Deactivate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Account Deletion Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-blur-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="profile-glass-card"
              style={{ padding: '24px', maxWidth: '440px', width: '100%', zIndex: 1000 }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', flexShrink: 0 }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#EF4444', fontWeight: 800 }}>Permanently Delete Account</h3>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    This action is **irreversible**. All your academic records, completed proctored exams, grades, and profile files will be permanently purged from QGenix databases.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'end', marginTop: '24px' }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    triggerToast('Account deletion request submitted. Processing within 7 business days.');
                  }}
                  style={{ background: '#EF4444', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating success toast message alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.88rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(16px)',
              zIndex: 2000
            }}
          >
            <CheckCircle2 size={18} style={{ color: '#10B981' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

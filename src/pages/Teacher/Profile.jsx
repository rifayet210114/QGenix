// ============================================================================
// Profile.jsx — QGenix Teacher Academic Profile & Settings Dashboard
// ============================================================================
// Features:
//   1. Profile Overview: Avatar header, Designation status, Quick metrics.
//   2. Personal Info Card: Editable fields (Designation, Office room, Blood group, etc.)
//   3. Professional Credentials: Read-only department metrics & join dates.
//   4. Contact Info Card: Editable phone, email, alternative contact.
//   5. Live Photo Sync: Base64 local storage upload directly linked to ProfileContext
//      so updates reflect in the Navbar top-right corner instantly.
//   6. Security Settings: Password change panel.
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষকের প্রোফাইল ম্যানেজার। শিক্ষক তার ছবি, নাম ও অনান্য তথ্য
// এখানে আপডেট করতে পারবেন। আপডেট করা নাম ও ছবি সরাসরি নেভবারে সিঙ্ক হয়ে যাবে।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, ShieldAlert, Award, FileText, 
  Bell, Eye, Lock, Clock, Calendar, CheckCircle2, ChevronRight, 
  Download, Upload, Trash2, Camera, LogOut, Check, X, HelpCircle, 
  AlertTriangle, RefreshCw, Briefcase, BookOpen, Key
} from 'lucide-react';
import Card from '../../components/Card';
import { useProfile } from '../../contexts/ProfileContext';

const initialPersonalData = {
  firstName: 'Sarah',
  lastName: 'Ahmed',
  dob: '1988-04-12',
  gender: 'Female',
  bloodGroup: 'A+',
  nationality: 'Bangladeshi',
  designation: 'Associate Professor',
  officeRoom: 'Faculty Block B, Room 408'
};

const initialContactData = {
  email: 'sarah.ahmed@qgenix.edu',
  phone: '+8801712345678',
  alternativeEmail: 'sarah.cse@gmail.com',
  address: 'Road 12, Dhanmondi',
  city: 'Dhaka',
  country: 'Bangladesh'
};

const initialProfessionalData = {
  teacherId: 'TCH02-094',
  department: 'Computer Science & Engineering',
  joiningDate: '2020-09-01',
  specialization: 'Algorithms & Database Systems',
  counselingHours: 'Sunday & Thursday, 03:00 PM - 04:30 PM'
};

export default function TeacherProfile() {
  // Sync page state with global ProfileContext
  const { profile, setProfile } = useProfile();

  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Main Tabs: 'Overview' | 'Personal' | 'Security'
  const [activeTab, setActiveTab] = useState('Overview');

  // Edit toggles & states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalData, setPersonalData] = useState(() => {
    try {
      const saved = localStorage.getItem('qgenix_teacher_personalData');
      const data = saved ? JSON.parse(saved) : { ...initialPersonalData };
      // Sync with global profile context if context has been edited
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
      const saved = localStorage.getItem('qgenix_teacher_contactData');
      return saved ? JSON.parse(saved) : initialContactData;
    } catch (e) {
      return initialContactData;
    }
  });
  const [tempContactData, setTempContactData] = useState(contactData);

  // Profile image URL sync
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || null);
  const [toastMessage, setToastMessage] = useState(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Completion calculation
  const completionPercentage = useMemo(() => {
    const fields = [
      personalData.firstName, personalData.lastName, personalData.designation,
      personalData.officeRoom, personalData.bloodGroup,
      contactData.email, contactData.phone, contactData.address,
      avatarUrl
    ];
    const filled = fields.filter(f => f !== null && f !== '').length;
    return Math.round((filled / fields.length) * 100);
  }, [personalData, contactData, avatarUrl]);

  // Save personal
  const handleSavePersonal = (e) => {
    e.preventDefault();
    setPersonalData({ ...tempPersonalData });
    localStorage.setItem('qgenix_teacher_personalData', JSON.stringify(tempPersonalData));
    setIsEditingPersonal(false);
    
    // Sync to global ProfileContext so Navbar updates instantly
    setProfile(prev => ({
      ...prev,
      firstName: tempPersonalData.firstName,
      lastName: tempPersonalData.lastName
    }));
    triggerToast('Personal details updated successfully!');
  };

  // Save contact
  const handleSaveContact = (e) => {
    e.preventDefault();
    setContactData({ ...tempContactData });
    localStorage.setItem('qgenix_teacher_contactData', JSON.stringify(tempContactData));
    setIsEditingContact(false);
    triggerToast('Contact details updated successfully!');
  };

  // Base64 photo upload
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

  const handlePhotoRemove = () => {
    setAvatarUrl(null);
    setProfile(prev => ({ ...prev, avatarUrl: null }));
    triggerToast('Profile photo removed.');
  };

  // Save password
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerToast('Password changed successfully.');
  };

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* Page Inline CSS */}
      <style>{`
        .glass-card-profile {
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(10, 20, 42, 0.38) 0%,
            rgba(6, 12, 28, 0.48) 100%
          ) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 20px !important;
          backdrop-filter: blur(40px) saturate(220%) !important;
          -webkit-backdrop-filter: blur(40px) saturate(220%) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.14),
            inset 0 12px 24px rgba(255, 255, 255, 0.02),
            0 8px 32px -8px   rgba(0, 0, 0, 0.4) !important;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        body.light-mode .glass-card-profile {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        .tabs-profile-bar {
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
        }
        body.light-mode .tabs-profile-bar {
          background: rgba(0, 0, 0, 0.02);
        }

        .tab-profile-btn {
          padding: 8px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .tab-profile-btn:hover {
          color: var(--text-primary);
        }
        .tab-profile-btn-active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
        }
      `}</style>

      {/* Decorative Orbs */}
      <div style={{ top: '10%', left: '-5%', position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ bottom: '15%', right: '-5%', position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0) 70%)', filter: 'blur(55px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <User className="text-violet-500" size={32} />
            Faculty Profile Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Manage personal records, update profile photo, configure advisory slots, and maintain security logs.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 1: OVERVIEW HERO AVATAR CARD
         ======================================================================= */}
      <div className="glass-card-profile" style={{ padding: '28px', display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'center' }}>
        
        {/* Avatar Circle Upload Trigger */}
        <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Instructor Profile" 
              style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 0 20px rgba(139,92,246,0.15)' }} 
            />
          ) : (
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(139, 92, 246, 0.3)', color: 'white', fontSize: '2.2rem', fontWeight: 800 }}>
              {(personalData.firstName?.charAt(0) || '') + (personalData.lastName?.charAt(0) || '')}
            </div>
          )}
          
          <label style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-primary)', border: '2px solid var(--bg-secondary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'all 0.2s' }} className="hover:scale-105">
            <Camera size={14} />
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Profile Info */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {personalData.firstName} {personalData.lastName}
            </h2>
            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', tracking: '0.05em' }}>
              Instructor
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0 0', fontSize: '0.9rem', fontWeight: 600 }}>
            {personalData.designation} • {initialProfessionalData.department}
          </p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px' }}>
            <span className="flex items-center gap-1"><MapPin size={12} /> {personalData.officeRoom}</span>
            <span className="flex items-center gap-1"><Mail size={12} /> {contactData.email}</span>
          </div>
        </div>

        {/* Profile Progress Completion */}
        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
            <span>Profile Completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #10B981)', borderRadius: '3px' }} />
          </div>
          {avatarUrl && (
            <button 
              onClick={handlePhotoRemove}
              style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.7rem', padding: 0, textAlign: 'left', cursor: 'pointer', fontWeight: 700 }}
            >
              Remove photo
            </button>
          )}
        </div>

      </div>

      {/* =======================================================================
         SECTION 2: TAB SELECTION TABS
         ======================================================================= */}
      <div className="tabs-profile-bar">
        <button
          onClick={() => setActiveTab('Overview')}
          className={`tab-profile-btn ${activeTab === 'Overview' ? 'tab-profile-btn-active' : ''}`}
        >
          Professional Summary
        </button>
        <button
          onClick={() => setActiveTab('Personal')}
          className={`tab-profile-btn ${activeTab === 'Personal' ? 'tab-profile-btn-active' : ''}`}
        >
          Personal & Contacts
        </button>
        <button
          onClick={() => setActiveTab('Security')}
          className={`tab-profile-btn ${activeTab === 'Security' ? 'tab-profile-btn-active' : ''}`}
        >
          Security & Password
        </button>
      </div>

      {/* Toast popup */}
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
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
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
            <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================================
         SECTION 3: ACTIVE TAB PANES
         ======================================================================= */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: PROFESSIONAL OVERVIEW */}
        {activeTab === 'Overview' && (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
          >
            {/* Credentials profile details */}
            <Card title="Professional Credentials" icon={<Briefcase size={16} />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Faculty Teacher ID</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {initialProfessionalData.teacherId}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Designation Rank</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {personalData.designation}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Research Specialization</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-primary)', textAlign: 'right' }}>
                    {initialProfessionalData.specialization}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department Office Venue</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {personalData.officeRoom}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weekly Advisory Slots</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-secondary)', textAlign: 'right' }}>
                    {initialProfessionalData.counselingHours}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Faculty Join Date</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    September 01, 2020
                  </span>
                </div>

              </div>
            </Card>

            {/* Courses Taught Summary Card */}
            <Card title="My Active Teaching Roles" icon={<BookOpen size={16} />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>CSE-301: Data Structures & Algorithms</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px' }}>Batch 21</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Venue: Room 302 • Class strength: 45 Students</span>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>CSE-302: Database Management Systems</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px' }}>Batch 21</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Venue: Room 405 • Class strength: 42 Students</span>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>CSE-303: Computer Networks</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px' }}>Batch 21</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Venue: Room 101 • Class strength: 38 Students</span>
                </div>

              </div>
            </Card>
          </motion.div>
        )}

        {/* TAB 2: PERSONAL & CONTACTS EDIT PANEL */}
        {activeTab === 'Personal' && (
          <motion.div
            key="personal-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
          >
            {/* Personal Details Roster Form */}
            <Card title="Personal Information">
              {isEditingPersonal ? (
                <form onSubmit={handleSavePersonal} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>First Name</label>
                      <input 
                        type="text" 
                        required
                        value={tempPersonalData.firstName}
                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, firstName: e.target.value })}
                        className="input-field"
                        style={{ height: '36px', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Last Name</label>
                      <input 
                        type="text" 
                        required
                        value={tempPersonalData.lastName}
                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, lastName: e.target.value })}
                        className="input-field"
                        style={{ height: '36px', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Designation Title</label>
                    <input 
                      type="text" 
                      required
                      value={tempPersonalData.designation}
                      onChange={(e) => setTempPersonalData({ ...tempPersonalData, designation: e.target.value })}
                      className="input-field"
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Office Room Number</label>
                    <input 
                      type="text" 
                      required
                      value={tempPersonalData.officeRoom}
                      onChange={(e) => setTempPersonalData({ ...tempPersonalData, officeRoom: e.target.value })}
                      className="input-field"
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Blood Group</label>
                      <input 
                        type="text" 
                        value={tempPersonalData.bloodGroup}
                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, bloodGroup: e.target.value })}
                        className="input-field"
                        style={{ height: '36px', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Nationality</label>
                      <input 
                        type="text" 
                        value={tempPersonalData.nationality}
                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, nationality: e.target.value })}
                        className="input-field"
                        style={{ height: '36px', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button type="button" onClick={() => setIsEditingPersonal(false)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '8px' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem', borderRadius: '8px' }}>
                      Save Details
                    </button>
                  </div>

                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full First Name</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{personalData.firstName}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Surname Last Name</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{personalData.lastName}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Designation</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{personalData.designation}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Office Room</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{personalData.officeRoom}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date of Birth</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{personalData.dob}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Blood Group</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{personalData.bloodGroup}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button 
                      onClick={() => {
                        setTempPersonalData({ ...personalData });
                        setIsEditingPersonal(true);
                      }} 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 16px', fontSize: '0.78rem', borderRadius: '8px' }}
                    >
                      Edit Personal Info
                    </button>
                  </div>

                </div>
              )}
            </Card>

            {/* Contact Details Form */}
            <Card title="Contact Information">
              {isEditingContact ? (
                <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Primary Work Email *</label>
                    <input 
                      type="email" 
                      required
                      value={tempContactData.email}
                      onChange={(e) => setTempContactData({ ...tempContactData, email: e.target.value })}
                      className="input-field"
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Phone Number *</label>
                    <input 
                      type="text" 
                      required
                      value={tempContactData.phone}
                      onChange={(e) => setTempContactData({ ...tempContactData, phone: e.target.value })}
                      className="input-field"
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Alternative Personal Email</label>
                    <input 
                      type="email" 
                      value={tempContactData.alternativeEmail}
                      onChange={(e) => setTempContactData({ ...tempContactData, alternativeEmail: e.target.value })}
                      className="input-field"
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Residential Address</label>
                    <input 
                      type="text" 
                      value={tempContactData.address}
                      onChange={(e) => setTempContactData({ ...tempContactData, address: e.target.value })}
                      className="input-field"
                      style={{ height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button type="button" onClick={() => setIsEditingContact(false)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '8px' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem', borderRadius: '8px' }}>
                      Save Contact
                    </button>
                  </div>

                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Primary Email</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{contactData.email}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phone Number</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{contactData.phone}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Personal Email</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{contactData.alternativeEmail}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Address Location</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{contactData.address}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>City & Country</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{contactData.city}, {contactData.country}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button 
                      onClick={() => {
                        setTempContactData({ ...contactData });
                        setIsEditingContact(true);
                      }} 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 16px', fontSize: '0.78rem', borderRadius: '8px' }}
                    >
                      Edit Contact Info
                    </button>
                  </div>

                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* TAB 3: SECURITY SETTINGS */}
        {activeTab === 'Security' && (
          <motion.div
            key="security-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}
          >
            <Card title="Update Account Credentials" icon={<Key size={16} />}>
              <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '12px' }}>
                
                {passwordError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '10px 14px', borderRadius: '10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Current Password *</label>
                  <input 
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>New Password *</label>
                  <input 
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Confirm New Password *</label>
                  <input 
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '6px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', fontSize: '0.82rem', borderRadius: '10px' }}
                  >
                    Change Password
                  </button>
                </div>

              </form>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}

// =========================================================================================
// Settings.jsx — QGenix Institutional & Platform Settings (সিস্টেম ও প্রতিষ্ঠান সেটিংস)
// -----------------------------------------------------------------------------------------
// Bengali Note:
// এই পেজটি পুরো বিশ্ববিদ্যালয়ের প্রাতিষ্ঠানিক তথ্য, পোর্টাল ব্র্যান্ডিং এবং সিস্টেম কনফিগারেশন নিয়ন্ত্রণ করে।
// প্রধান বৈশিষ্ট্যসমূহ:
// ১. University Profile & Branding: বিশ্ববিদ্যালয়ের নাম, শর্ট কোড, পোর্টাল লোগো, হেল্পলাইন ইমেইল।
// ২. Academic Session & Term: রানিং একাডেমিক বর্ষ, সেমিস্টার শুরু ও শেষের তারিখ।
// ৩. Email SMTP & Notification Relay: পাসওয়ার্ড রিসেট ও নোটিফিকেশন পাঠানোর ইমেইল সার্ভার কনফিগারেশন।
// ৪. Maintenance Mode: পরীক্ষার সময় বা সার্ভার আপগ্রেডের সময় সাধারণ স্টুডেন্টদের জন্য মেইনটেন্যান্স মোড টগল।
// সমস্ত কোডে বিস্তারিত বাংলা ও ইংরেজি কমেন্ট রয়েছে এবং সম্পূর্ণ রেসপনসিভ ডিজাইন।
// =========================================================================================

import React, { useState } from 'react';
import Card from '../../components/Card';
import { 
  Building, 
  Mail, 
  Calendar, 
  Shield, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Server,
  Globe,
  Bell
} from 'lucide-react';

export default function Settings() {
  const [toastMessage, setToastMessage] = useState('');
  
  // Institutional Settings State
  const [uniName, setUniName] = useState('QGenix International University');
  const [uniShortCode, setUniShortCode] = useState('QIU');
  const [contactEmail, setContactEmail] = useState('support@qgenix.edu');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [currentTerm, setCurrentTerm] = useState('Spring 2026');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);

  // Toast feedback helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Platform & Institutional Configuration successfully committed!');
  };

  return (
    <div className="flex-col gap-6" style={{ display: 'flex', width: '100%' }}>
      
      {/* ==================== TOAST ALERT ==================== */}
      {toastMessage && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '14px 22px',
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
          }}
        >
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================== BANNER ==================== */}
      <div 
        className="glass-panel" 
        style={{
          padding: '24px',
          borderRadius: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              System Preferences
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>
            Global Institutional & Platform Settings
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Configure university branding, active term dates, notification mail servers, and maintenance mode.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* ==================== CONFIGURATION GRID ==================== */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '20px' 
        }}
      >
        {/* Panel 1: University Identity & Branding */}
        <Card title="University Identity & Profile">
          <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Official University Name
              </label>
              <input 
                type="text" 
                className="input-field" 
                value={uniName}
                onChange={(e) => setUniName(e.target.value)}
                style={{ width: '100%' }} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Short Code
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={uniShortCode}
                  onChange={(e) => setUniShortCode(e.target.value)}
                  style={{ width: '100%' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Institutional Portal Domain
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  defaultValue="portal.qgenix.edu" 
                  style={{ width: '100%' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Support & Helpdesk Email
              </label>
              <input 
                type="email" 
                className="input-field" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={{ width: '100%' }} 
              />
            </div>
          </form>
        </Card>

        {/* Panel 2: Academic Terms & Calendars */}
        <Card title="Active Academic Session & Terms">
          <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Active Academic Year
              </label>
              <select 
                className="input-field" 
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027 (Active)</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Current Running Semester Term
              </label>
              <select 
                className="input-field" 
                value={currentTerm}
                onChange={(e) => setCurrentTerm(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Spring 2026">Spring 2026 Semester</option>
                <option value="Summer 2026">Summer 2026 Semester</option>
                <option value="Fall 2026">Fall 2026 Semester</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Term Start Date
                </label>
                <input type="date" className="input-field" defaultValue="2026-01-10" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Term End Date
                </label>
                <input type="date" className="input-field" defaultValue="2026-05-30" style={{ width: '100%' }} />
              </div>
            </div>
          </form>
        </Card>

        {/* Panel 3: SMTP Mail Relay */}
        <Card title="Email Delivery (SMTP Relay)">
          <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  SMTP Host Address
                </label>
                <input type="text" className="input-field" defaultValue="smtp.sendgrid.net" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Port
                </label>
                <input type="number" className="input-field" defaultValue="587" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Sender Display Name
              </label>
              <input type="text" className="input-field" defaultValue="QGenix Academic Notifications" style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem' }}>Send Automated Email Alerts for New Notices</span>
              <input 
                type="checkbox" 
                checked={emailAlertsEnabled}
                onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
              />
            </div>
          </form>
        </Card>

        {/* Panel 4: Emergency Maintenance Mode */}
        <Card title="System Availability & Maintenance Mode">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            <div 
              style={{
                padding: '16px',
                borderRadius: '10px',
                background: maintenanceMode ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-secondary)',
                border: maintenanceMode ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', color: maintenanceMode ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                  <AlertTriangle size={18} />
                  <span>Maintenance Lockout</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  When enabled, only Super Administrators can log in. Students & Teachers see an upgrade screen.
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={maintenanceMode}
                onChange={(e) => {
                  setMaintenanceMode(e.target.checked);
                  showToast(`Maintenance Mode ${e.target.checked ? 'ACTIVATED' : 'DEACTIVATED'}`);
                }}
                style={{ cursor: 'pointer', transform: 'scale(1.4)' }}
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSave}
                style={{ width: '100%', padding: '10px' }}
              >
                Save All Preferences
              </button>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
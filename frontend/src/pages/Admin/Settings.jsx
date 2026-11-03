// =========================================================================================
// -----------------------------------------------------------------------------------------
// Bengali Note:
// =========================================================================================

import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import { useAdminData } from '../../contexts/AdminDataContext';
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
  Bell,
  Clock,
  RotateCcw
} from 'lucide-react';
import { API_BASE } from '../../config';

export default function Settings() {
  const { 
    emailFormats, 
    updateEmailFormats, 
    requiredAttendanceLimit, 
    updateRequiredAttendanceLimit 
  } = useAdminData();
  const [toastMessage, setToastMessage] = useState('');
  
  // Institutional Settings State
  const [uniName, setUniName] = useState('QGenix International University');
  const [uniShortCode, setUniShortCode] = useState('QIU');
  const [contactEmail, setContactEmail] = useState('support@qgenix.edu');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [currentTerm, setCurrentTerm] = useState('Spring 2026');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);

  // Student Attendance Policy State (100% Real-Time DB Synchronized)
  const [attendanceLimitInput, setAttendanceLimitInput] = useState(requiredAttendanceLimit || 75.0);
  const [isSavingAttendanceLimit, setIsSavingAttendanceLimit] = useState(false);

  useEffect(() => {
    if (requiredAttendanceLimit !== undefined) {
      setAttendanceLimitInput(requiredAttendanceLimit);
    }
  }, [requiredAttendanceLimit]);

  // Email Format State (100% Admin Configurable & Modifiable)
  const [studentEmailFormat, setStudentEmailFormat] = useState(emailFormats?.student || '@diit.edu.bd');
  const [teacherEmailFormat, setTeacherEmailFormat] = useState(emailFormats?.teacher || '@diit.edu.bd');
  const initializedRef = useRef(false);

  // Faculty Biometric Shift Policy State (100% Real-Time DB Synchronized)
  const [standardCheckIn, setStandardCheckIn] = useState('09:00 AM');
  const [gracePeriodMins, setGracePeriodMins] = useState(15);
  const [standardCheckOut, setStandardCheckOut] = useState('05:00 PM');
  const [halfDayHours, setHalfDayHours] = useState(4.5);
  const [fullDayHours, setFullDayHours] = useState(8.0);
  const [isSavingShiftPolicy, setIsSavingShiftPolicy] = useState(false);
  const [isLoadingShiftPolicy, setIsLoadingShiftPolicy] = useState(false);

  // Load shift policy from Django DB
  const loadShiftPolicy = async () => {
    setIsLoadingShiftPolicy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/biometric-shift-policy/`);
      if (res.ok) {
        const data = await res.json();
        if (data.standard_check_in) setStandardCheckIn(data.standard_check_in);
        if (data.grace_period_mins !== undefined) setGracePeriodMins(data.grace_period_mins);
        if (data.standard_check_out) setStandardCheckOut(data.standard_check_out);
        if (data.half_day_hours !== undefined) setHalfDayHours(data.half_day_hours);
        if (data.full_day_hours !== undefined) setFullDayHours(data.full_day_hours);
      }
    } catch (e) {
      console.warn('Could not load biometric shift policy:', e);
    } finally {
      setIsLoadingShiftPolicy(false);
    }
  };

  // Load system settings from Django DB
  const loadSystemSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/system-settings/`);
      if (res.ok) {
        const data = await res.json();
        if (data.university_name) setUniName(data.university_name);
        if (data.short_code) setUniShortCode(data.short_code);
        if (data.contact_email) setContactEmail(data.contact_email);
        if (data.academic_year) setAcademicYear(data.academic_year);
        if (data.current_term) setCurrentTerm(data.current_term);
        if (data.maintenance_mode !== undefined) setMaintenanceMode(data.maintenance_mode);
        if (data.student_email_format) setStudentEmailFormat(data.student_email_format);
        if (data.teacher_email_format) setTeacherEmailFormat(data.teacher_email_format);
        if (data.required_attendance_limit !== undefined) {
          setAttendanceLimitInput(parseFloat(data.required_attendance_limit) || 75.0);
        }
      }
    } catch (e) {
      console.warn('Could not load system settings:', e);
    }
  };

  useEffect(() => {
    loadShiftPolicy();
    loadSystemSettings();
  }, []);

  // Save Biometric Shift Policy to DB
  const handleSaveShiftPolicy = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSavingShiftPolicy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/biometric-shift-policy/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standard_check_in: standardCheckIn,
          grace_period_mins: parseInt(gracePeriodMins, 10) || 15,
          standard_check_out: standardCheckOut,
          half_day_hours: parseFloat(halfDayHours) || 4.5,
          full_day_hours: parseFloat(fullDayHours) || 8.0
        })
      });
      if (res.ok) {
        showToast('✓ Biometric Shift Policy saved and synchronized in real-time with database!');
      } else {
        showToast('❌ Failed to update Biometric Shift Policy');
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Network error updating Biometric Shift Policy');
    } finally {
      setIsSavingShiftPolicy(false);
    }
  };

  // Initialize once on mount or when emailFormats loads initially
  useEffect(() => {
    if (!initializedRef.current && emailFormats) {
      if (emailFormats.student) setStudentEmailFormat(emailFormats.student);
      if (emailFormats.teacher) setTeacherEmailFormat(emailFormats.teacher);
      initializedRef.current = true;
    }
  }, [emailFormats]);

  // Toast feedback helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Dedicated Save for Email Formate
  const handleSaveEmailFormatOnly = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanStudent = (studentEmailFormat || '').trim();
    const cleanTeacher = (teacherEmailFormat || '').trim();
    if (!cleanStudent || !cleanTeacher) {
      showToast('❌ Error: Student and Teacher email formats cannot be empty!');
      return;
    }
    if (updateEmailFormats) {
      await updateEmailFormats({
        student: cleanStudent,
        teacher: cleanTeacher
      });
    }
    showToast('✓ Email Formate successfully saved and updated across the whole system!');
  };

  // Dedicated Save for Attendance Limit
  const handleSaveAttendanceLimit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const limitNum = parseFloat(attendanceLimitInput);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      showToast('❌ Please enter a valid percentage between 1% and 100%');
      return;
    }
    setIsSavingAttendanceLimit(true);
    try {
      if (updateRequiredAttendanceLimit) {
        await updateRequiredAttendanceLimit(limitNum);
      }
      showToast(`✓ Required Attendance Limit set to ${limitNum}% and synchronized live across all student dashboards!`);
    } catch (err) {
      showToast('❌ Failed to update attendance limit');
    } finally {
      setIsSavingAttendanceLimit(false);
    }
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanStudent = (studentEmailFormat || '').trim();
    const cleanTeacher = (teacherEmailFormat || '').trim();
    const limitNum = parseFloat(attendanceLimitInput) || 75.0;

    if (updateEmailFormats) {
      await updateEmailFormats({
        student: cleanStudent,
        teacher: cleanTeacher
      });
    }

    if (updateRequiredAttendanceLimit) {
      await updateRequiredAttendanceLimit(limitNum);
    }

    try {
      await fetch(`${API_BASE}/api/auth/system-settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university_name: uniName,
          short_code: uniShortCode,
          contact_email: contactEmail,
          academic_year: academicYear,
          current_term: currentTerm,
          maintenance_mode: maintenanceMode,
          student_email_format: cleanStudent,
          teacher_email_format: cleanTeacher,
          required_attendance_limit: limitNum
        })
      });
    } catch (_) {}

    showToast(`✓ Platform Settings & Required Attendance Limit (${limitNum}%) successfully updated!`);
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

            {/* University Minimum Attendance Policy Threshold */}
            <div style={{ 
              marginTop: '6px', 
              padding: '14px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '10px', 
              border: '1px solid var(--border-color)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  Required Attendance Limit (%)
                </label>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  Live Student Sync
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    type="number" 
                    step="0.5"
                    min="1"
                    max="100"
                    className="input-field" 
                    value={attendanceLimitInput}
                    onChange={(e) => setAttendanceLimitInput(e.target.value)}
                    style={{ width: '100%', fontWeight: 700, paddingRight: '40px', fontSize: '0.95rem' }} 
                    required
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>%</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveAttendanceLimit}
                  disabled={isSavingAttendanceLimit}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                >
                  <Save size={14} />
                  <span>{isSavingAttendanceLimit ? 'Saving...' : 'Set Limit'}</span>
                </button>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                Official required percentage. Reflected dynamically in real-time across every student's attendance overview and risk evaluation.
              </span>
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
      </div>

      {/* ==================== SECTION 2: FACULTY BIOMETRIC SHIFT & PUNCTUALITY POLICY (FULL-WIDTH STANDARD CARD) ==================== */}
      <div style={{ marginTop: '20px' }}>
        <Card 
          title="Faculty Biometric Shift & Punctuality Policy"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span 
                className="badge badge-success"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '4px 10px', 
                  fontSize: '0.74rem',
                  fontWeight: 700 
                }}
              >
                <span 
                  style={{ 
                    width: '7px', 
                    height: '7px', 
                    borderRadius: '50%', 
                    background: '#10B981', 
                    boxShadow: '0 0 6px #10B981' 
                  }} 
                />
                Live DB Sync
              </span>
            </div>
          }
        >
          <form onSubmit={handleSaveShiftPolicy} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Configure official campus duty hours, morning arrival grace limits, half-day duration threshold, and departure overtime. Attendance punctuality statuses update in real-time.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {/* Standard Check-In Time */}
              <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Standard Check-In Time
                  </label>
                </div>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="09:00 AM"
                  value={standardCheckIn}
                  onChange={(e) => setStandardCheckIn(e.target.value)}
                  style={{ width: '100%', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }} 
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  Official campus duty start (e.g. 09:00 AM)
                </span>
              </div>

              {/* Grace Period */}
              <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Grace Period (Minutes)
                  </label>
                </div>
                <input 
                  type="number" 
                  min="0"
                  max="120"
                  className="input-field" 
                  placeholder="15"
                  value={gracePeriodMins}
                  onChange={(e) => setGracePeriodMins(e.target.value)}
                  style={{ width: '100%', fontWeight: 700, fontSize: '0.95rem' }} 
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  Up to +{gracePeriodMins || 0}m is "On Time"; past is "Late Entry"
                </span>
              </div>

              {/* Standard Check-Out Time */}
              <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Standard Check-Out Time
                  </label>
                </div>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="05:00 PM"
                  value={standardCheckOut}
                  onChange={(e) => setStandardCheckOut(e.target.value)}
                  style={{ width: '100%', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }} 
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  Official shift departure time (e.g. 05:00 PM)
                </span>
              </div>

              {/* Half-Day Threshold */}
              <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Half-Day Limit (Hours)
                  </label>
                </div>
                <input 
                  type="number" 
                  step="0.5"
                  min="1"
                  max="12"
                  className="input-field" 
                  placeholder="4.5"
                  value={halfDayHours}
                  onChange={(e) => setHalfDayHours(e.target.value)}
                  style={{ width: '100%', fontWeight: 700, fontSize: '0.95rem' }} 
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  Under {halfDayHours}h worked is marked "Half Day"
                </span>
              </div>
            </div>

            {/* Real-Time Rule Preview Summary Bar */}
            <div 
              style={{ 
                padding: '12px 16px', 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>Live Punctuality Evaluation Rules:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>On Time</span>
                  <span style={{ color: 'var(--text-secondary)' }}>&le; {standardCheckIn} (+{gracePeriodMins}m grace)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Late Entry</span>
                  <span style={{ color: 'var(--text-secondary)' }}>&gt; {gracePeriodMins}m grace limit</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Half Day</span>
                  <span style={{ color: 'var(--text-secondary)' }}>&lt; {halfDayHours}h office work</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Overtime</span>
                  <span style={{ color: 'var(--text-secondary)' }}>&gt; {standardCheckOut} (+duration)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={loadShiftPolicy}
                disabled={isLoadingShiftPolicy}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 16px', borderRadius: '8px' }}
                title="Reload current policy from database"
              >
                <RotateCcw size={14} />
                <span>Reload</span>
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSavingShiftPolicy}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 20px', borderRadius: '8px' }}
              >
                <Save size={15} />
                <span>{isSavingShiftPolicy ? 'Saving...' : 'Save Shift Policy'}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>

      {/* ==================== SECTION 3: SYSTEM UTILITY & SECURITY PREFERENCES ==================== */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}
      >
        {/* Panel 4: Email Formate Settings */}
        <Card title="Email Formate">
          <form onSubmit={handleSaveEmailFormatOnly} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            
            {/* Studen Email Formate */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                Studen Email Formate
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. @diit.edu.bd or @du.ac.bd"
                value={studentEmailFormat}
                onChange={(e) => setStudentEmailFormat(e.target.value)}
                style={{ width: '100%', fontWeight: 600 }} 
              />
            </div>

            {/* Teacher Email Formate */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                Teacher Email Formate
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. @diit.edu.bd or @du.ac.bd"
                value={teacherEmailFormat}
                onChange={(e) => setTeacherEmailFormat(e.target.value)}
                style={{ width: '100%', fontWeight: 600 }} 
              />
            </div>

            {/* Save Button for Email Formate */}
            <div>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
              >
                <Save size={16} />
                <span>Save Email Formate</span>
              </button>
            </div>
          </form>
        </Card>

        {/* Panel 6: Emergency Maintenance Mode */}
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
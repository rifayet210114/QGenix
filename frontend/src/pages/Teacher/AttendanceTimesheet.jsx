// =========================================================================================
// AttendanceTimesheet.jsx — Teacher Biometric Attendance & Daily Work Timesheet
// -----------------------------------------------------------------------------------------
// Bengali Note:
// =========================================================================================

import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';
import { downloadFacultyAttendancePDF } from '../../utils/facultyAttendancePdf';
import { downloadFacultyTimesheetPDF } from '../../utils/facultyTimesheetPdf';
import { 
  Clock, 
  Calendar, 
  Download, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  FileText, 
  LogIn, 
  LogOut, 
  Briefcase, 
  BookOpen, 
  Layers, 
  X,
  ShieldCheck,
  Award
} from 'lucide-react';

export default function AttendanceTimesheet() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'timesheet'

  // Teacher Profile info
  const teacherId = user?.institutional_id || user?.id || 'FAC-01';
  const teacherName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.name || user?.username || 'Teacher');
  const department = user?.department || 'Computer Science & Engineering';

  // Current month string
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Dropdown available months list (past 6 months)
  const availableMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + (i === 0 ? ' (Current Month)' : '');
      months.push({ val, label });
    }
    return months;
  }, []);

  // ===========================================================================
  // SECTION 1: ATTENDANCE (BIOMETRIC CHECK-IN / CHECK-OUT) STATE & HANDLERS
  // ===========================================================================
  const [attendanceMonth, setAttendanceMonth] = useState(currentMonthStr);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [biometricLogs, setBiometricLogs] = useState([]);
  const [avgCheckIn, setAvgCheckIn] = useState('09:05 AM');
  const [avgCheckOut, setAvgCheckOut] = useState('05:15 PM');
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Filtered biometric logs based on month dropdown
  const displayedBiometricLogs = useMemo(() => {
    if (!biometricLogs) return [];
    if (attendanceMonth === 'all') return biometricLogs;
    return biometricLogs.filter(log => log.date && log.date.startsWith(attendanceMonth));
  }, [biometricLogs, attendanceMonth]);

  // Load teacher biometric attendance logs & status directly from DB
  const loadBiometricStatus = async () => {
    try {
      const idParam = user?.id || user?.institutional_id || user?.email;
      const url = idParam 
        ? `${API_BASE}/api/auth/teacher-checkin/?teacher_id=${encodeURIComponent(idParam)}`
        : `${API_BASE}/api/auth/teacher-checkin/`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setIsCheckedIn(Boolean(data.is_checked_in));
        setCheckInTime(data.check_in_time || null);
        setCheckOutTime(data.check_out_time || null);
        setDuration(data.duration || null);
        if (data.logs && data.logs.length > 0) {
          setBiometricLogs(data.logs);
        }
      }

      // Also fetch faculty averages
      if (idParam) {
        const dossierRes = await fetch(`${API_BASE}/api/auth/faculty-dossier/${encodeURIComponent(idParam)}/`);
        if (dossierRes.ok) {
          const dossier = await dossierRes.json();
          if (dossier.averageCheckIn) setAvgCheckIn(dossier.averageCheckIn);
          if (dossier.averageCheckOut) setAvgCheckOut(dossier.averageCheckOut);
          if (dossier.biometricLogs && dossier.biometricLogs.length > 0) {
            setBiometricLogs(dossier.biometricLogs);
          }
        }
      }
    } catch (e) {
      console.warn('Error loading teacher biometric data:', e);
    }
  };

  // Toggle Check-In / Check-Out
  const handleToggleCheckInOut = async () => {
    if (isCheckLoading) return;
    setIsCheckLoading(true);
    const idParam = user?.id || user?.institutional_id || user?.email;
    const actionToPerform = isCheckedIn ? 'check_out' : 'check_in';
    try {
      const res = await fetch(`${API_BASE}/api/auth/teacher-checkin/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: idParam,
          action: actionToPerform,
          terminal: 'Web Turnstile - Attendance & Timesheet Portal'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setIsCheckedIn(Boolean(data.is_checked_in));
        setCheckInTime(data.check_in_time || null);
        setCheckOutTime(data.check_out_time || null);
        setDuration(data.duration || null);
        triggerToast(data.message || (isCheckedIn ? 'Checked out successfully!' : 'Checked in successfully!'));
        window.dispatchEvent(new CustomEvent('qgenix_teacher_checkin_updated', { detail: data }));
        loadBiometricStatus();
      } else {
        const err = await res.json();
        triggerToast(`❌ ${err.error || 'Check-in request failed'}`);
      }
    } catch (err) {
      triggerToast('❌ Network error while connecting to biometric server');
    } finally {
      setIsCheckLoading(false);
    }
  };

  // ===========================================================================
  // SECTION 2: TIMESHEET STATE & HANDLERS (100% DB-BACKED)
  // ===========================================================================
  const [timesheetMonth, setTimesheetMonth] = useState(currentMonthStr);
  const [timesheetEntries, setTimesheetEntries] = useState([]);
  const [totalTimesheetHours, setTotalTimesheetHours] = useState(0);
  const [isLoadingTimesheet, setIsLoadingTimesheet] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // New Task Form State (Daily Work Description)
  const [taskForm, setTaskForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Load timesheet from backend DB
  const loadTimesheetData = async () => {
    setIsLoadingTimesheet(true);
    try {
      const idParam = user?.id || user?.institutional_id || user?.email;
      let url = `${API_BASE}/api/auth/faculty-timesheet/?month=${timesheetMonth}`;
      if (idParam) {
        url += `&teacher_id=${encodeURIComponent(idParam)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTimesheetEntries(data.entries || []);
        setTotalTimesheetHours(data.total_hours || 0);
      }
    } catch (e) {
      console.error('Failed to load timesheet:', e);
    } finally {
      setIsLoadingTimesheet(false);
    }
  };

  // Submit new timesheet entry to DB
  const handleCreateTimesheetEntry = async (e) => {
    e.preventDefault();
    if (!taskForm.description.trim()) {
      triggerToast('❌ Please write a description of the work performed today');
      return;
    }
    setIsSubmittingTask(true);
    try {
      const idParam = user?.id || user?.institutional_id || user?.email;
      const res = await fetch(`${API_BASE}/api/auth/faculty-timesheet/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: idParam,
          date: taskForm.date,
          description: taskForm.description,
          category: 'Daily Academic Duty',
          status: 'Completed'
        })
      });
      if (res.ok) {
        triggerToast('✅ Daily work description recorded successfully in database!');
        setShowAddModal(false);
        setTaskForm({
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
        loadTimesheetData();
        // Broadcast real-time event across windows, tabs, and admin panel
        window.dispatchEvent(new CustomEvent('qgenix_faculty_timesheet_updated', {
          detail: { teacherId: idParam, action: 'create', timestamp: Date.now() }
        }));
        try {
          const bc = new BroadcastChannel('qgenix_faculty_timesheet');
          bc.postMessage({ type: 'TIMESHEET_UPDATED', teacherId: idParam, action: 'create', timestamp: Date.now() });
          bc.close();
        } catch (e) {}
        try {
          localStorage.setItem('qgenix_timesheet_last_update', Date.now().toString());
        } catch (e) {}
      } else {
        const err = await res.json();
        triggerToast(`❌ ${err.error || 'Failed to save timesheet entry'}`);
      }
    } catch (e) {
      triggerToast('❌ Network error while saving timesheet');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Delete timesheet entry from DB
  const handleDeleteTimesheetEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this timesheet entry?')) return;
    try {
      const idParam = user?.id || user?.institutional_id || user?.email;
      const res = await fetch(`${API_BASE}/api/auth/faculty-timesheet/?id=${entryId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        triggerToast('🗑️ Timesheet entry deleted.');
        loadTimesheetData();
        // Broadcast real-time deletion event
        window.dispatchEvent(new CustomEvent('qgenix_faculty_timesheet_updated', {
          detail: { teacherId: idParam, action: 'delete', entryId, timestamp: Date.now() }
        }));
        try {
          const bc = new BroadcastChannel('qgenix_faculty_timesheet');
          bc.postMessage({ type: 'TIMESHEET_UPDATED', teacherId: idParam, action: 'delete', entryId, timestamp: Date.now() });
          bc.close();
        } catch (e) {}
        try {
          localStorage.setItem('qgenix_timesheet_last_update', Date.now().toString());
        } catch (e) {}
      } else {
        triggerToast('❌ Failed to delete entry.');
      }
    } catch (e) {
      triggerToast('❌ Error deleting timesheet entry.');
    }
  };

  // Initial loads & synchronization
  useEffect(() => {
    loadBiometricStatus();
    loadTimesheetData();
    const handleSync = () => {
      loadBiometricStatus();
      loadTimesheetData();
    };
    window.addEventListener('qgenix_teacher_checkin_updated', handleSync);
    return () => window.removeEventListener('qgenix_teacher_checkin_updated', handleSync);
  }, [user, attendanceMonth, timesheetMonth]);

  // Helper for Category Badges
  const getCategoryBadgeClass = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('lecture') || c.includes('theory')) return 'badge-primary';
    if (c.includes('lab') || c.includes('practical')) return 'badge-info';
    if (c.includes('exam') || c.includes('grading')) return 'badge-warning';
    if (c.includes('counseling')) return 'badge-success';
    if (c.includes('meeting') || c.includes('admin')) return 'badge-urgent';
    return 'badge-secondary';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontWeight: 600,
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================================
         PAGE HEADER WITH LIVE DUTY STATUS & CHECK IN/OUT ACTION
         ======================================================================= */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px 28px', 
          borderRadius: '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(22, 30, 49, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.74rem', textTransform: 'uppercase' }}>
              Faculty HR & Time Tracker
            </span>
            <span 
              className="badge badge-success"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem' }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              Live DB Synced
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            Attendance & Timesheet Manager
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Official daily RFID biometric campus duty logs and academic workload activity records for <strong>{teacherName}</strong>.
          </p>
        </div>

        {/* Quick Check IN / OUT Status Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isCheckedIn ? '#10B981' : '#EF4444',
                  boxShadow: isCheckedIn ? '0 0 8px #10B981' : '0 0 8px #EF4444'
                }} 
              />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isCheckedIn ? '#10B981' : '#EF4444' }}>
                {isCheckedIn ? 'ON CAMPUS DUTY' : 'OFF DUTY'}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isCheckedIn 
                ? (checkInTime ? `Entry: ${checkInTime} (${duration || 'In Progress'})` : 'Checked In') 
                : (checkOutTime && checkOutTime !== '--:--' ? `Last Out: ${checkOutTime}` : 'Not Checked In Today')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleCheckInOut}
            disabled={isCheckLoading}
            className="hover-lift"
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: isCheckedIn ? '1px solid #EF4444' : '1px solid #10B981',
              background: isCheckedIn ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isCheckedIn ? '#FCA5A5' : '#6EE7B7',
              cursor: isCheckLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isCheckedIn ? <LogOut size={14} /> : <LogIn size={14} />}
            <span>{isCheckLoading ? 'Syncing...' : isCheckedIn ? 'Check OUT' : 'Check IN'}</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
         TAB NAVIGATION SWITCHER (ATTENDANCE vs TIMESHEET)
         ======================================================================= */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'attendance' ? '1px solid var(--accent-primary)' : '1px solid transparent',
            background: activeTab === 'attendance' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'attendance' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Clock size={16} />
          <span>1. Daily Biometric Attendance</span>
          <span 
            className="badge" 
            style={{ 
              fontSize: '0.7rem', 
              background: activeTab === 'attendance' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: activeTab === 'attendance' ? '#fff' : 'var(--text-muted)'
            }}
          >
            {displayedBiometricLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timesheet')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'timesheet' ? '1px solid var(--accent-primary)' : '1px solid transparent',
            background: activeTab === 'timesheet' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'timesheet' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Briefcase size={16} />
          <span>2. Daily Work Timesheet</span>
          <span 
            className="badge" 
            style={{ 
              fontSize: '0.7rem', 
              background: activeTab === 'timesheet' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: activeTab === 'timesheet' ? '#fff' : 'var(--text-muted)'
            }}
          >
            {timesheetEntries.length}
          </span>
        </button>
      </div>

      {/* =======================================================================
         TAB 1: BIOMETRIC ATTENDANCE RECORD (100% DB SYNCHRONIZED)
         ======================================================================= */}
      {activeTab === 'attendance' && (
        <Card title="Daily Biometric Check-In & Check-Out Record" className="premium-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Institutional RFID gate turnstile scan logs with exact entry and departure timestamps, synced in real-time.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Month Selector (1st - 30/31st of month) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Month:</span>
                  <select
                    value={attendanceMonth}
                    onChange={(e) => setAttendanceMonth(e.target.value)}
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {availableMonths.map(m => (
                      <option key={m.val} value={m.val}>{m.label}</option>
                    ))}
                    <option value="all">All Available Records</option>
                  </select>
                </div>

                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                  Avg Check-In: {avgCheckIn}
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                  Avg Check-Out: {avgCheckOut}
                </span>

                {/* Download PDF Button */}
                <button
                  type="button"
                  onClick={() => {
                    downloadFacultyAttendancePDF({
                      faculty: {
                        name: teacherName,
                        id: teacherId,
                        email: user?.email,
                        dept: department
                      },
                      logs: displayedBiometricLogs,
                      monthStr: attendanceMonth === 'all' ? currentMonthStr : attendanceMonth,
                      avgCheckIn,
                      avgCheckOut
                    });
                  }}
                  className="btn btn-secondary hover-lift"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: 'rgba(59, 130, 246, 0.15)',
                    borderColor: '#3B82F6',
                    color: '#60A5FA',
                    fontWeight: 700
                  }}
                  title="Download Monthly Biometric Attendance Report as PDF"
                >
                  <Download size={13} />
                  Download PDF
                </button>

                {/* Live Sync Button */}
                <button
                  type="button"
                  onClick={loadBiometricStatus}
                  className="btn btn-secondary hover-lift"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px', cursor: 'pointer' }}
                  title="Refresh logs from Database"
                >
                  <RotateCcw size={13} />
                  Live Sync
                </button>
              </div>
            </div>

            {/* Biometric Attendance Table */}
            <div style={{ overflowX: 'auto', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <th style={{ padding: '12px 14px' }}>Date</th>
                    <th style={{ padding: '12px 14px' }}>Day</th>
                    <th style={{ padding: '12px 14px' }}>Check-In</th>
                    <th style={{ padding: '12px 14px' }}>Check-Out</th>
                    <th style={{ padding: '12px 14px' }}>Duration</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Punctuality</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBiometricLogs && displayedBiometricLogs.length > 0 ? (
                    displayedBiometricLogs.map((log, idx) => (
                      <tr key={log.id || idx} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 600 }}>{log.date}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{log.day || 'Weekday'}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--accent-success)', fontWeight: 700 }}>{log.checkIn}</td>
                        <td style={{ padding: '12px 14px', color: '#3B82F6', fontWeight: 700 }}>{log.checkOut}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>{log.duration}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span className={`badge ${log.badge || 'badge-success'}`} style={{ fontSize: '0.72rem' }}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 14px', color: 'var(--text-muted)' }}>
                        <Clock size={28} style={{ opacity: 0.4, marginBottom: '6px' }} />
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Biometric Scan Logs Recorded for This Month</div>
                        <div style={{ fontSize: '0.76rem', marginTop: '4px' }}>
                          Showing records from 1st to 30/31st of {attendanceMonth === 'all' ? 'All Months' : attendanceMonth}. Click 'Check IN' above to register attendance.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* =======================================================================
         TAB 2: DAILY WORK TIMESHEET (100% DB SYNCHRONIZED)
         ======================================================================= */}
      {activeTab === 'timesheet' && (
        <Card title="Daily Work Timesheet & Activity Logs" className="premium-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Log and monitor regular faculty academic activities, lectures, lab sessions, grading, and administrative duties.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Month Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Month:</span>
                  <select
                    value={timesheetMonth}
                    onChange={(e) => setTimesheetMonth(e.target.value)}
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {availableMonths.map(m => (
                      <option key={m.val} value={m.val}>{m.label}</option>
                    ))}
                    <option value="all">All Available Records</option>
                  </select>
                </div>

                {/* Summary Pills */}
                <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                  Recorded Days: {timesheetEntries.length}
                </span>

                {/* + Log Daily Work Button */}
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary hover-lift"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  <Plus size={14} />
                  Log Daily Work
                </button>

                {/* Download PDF Button */}
                <button
                  type="button"
                  onClick={() => {
                    downloadFacultyTimesheetPDF({
                      faculty: {
                        name: teacherName,
                        id: teacherId,
                        email: user?.email,
                        dept: department
                      },
                      entries: timesheetEntries,
                      monthStr: timesheetMonth === 'all' ? currentMonthStr : timesheetMonth,
                      totalHours: totalTimesheetHours
                    });
                  }}
                  className="btn btn-secondary hover-lift"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: 'rgba(99, 102, 241, 0.15)',
                    borderColor: '#6366F1',
                    color: '#A5B4FC',
                    fontWeight: 700
                  }}
                  title="Download Monthly Timesheet Report as PDF"
                >
                  <Download size={13} />
                  Download PDF
                </button>

                {/* Live Sync Button */}
                <button
                  type="button"
                  onClick={loadTimesheetData}
                  disabled={isLoadingTimesheet}
                  className="btn btn-secondary hover-lift"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px', cursor: 'pointer' }}
                  title="Refresh timesheet from Database"
                >
                  <RotateCcw size={13} />
                  Live Sync
                </button>
              </div>
            </div>

            {/* Timesheet Data Table */}
            <div style={{ overflowX: 'auto', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <th style={{ padding: '12px 14px', width: '130px' }}>Date</th>
                    <th style={{ padding: '12px 14px', width: '120px' }}>Day</th>
                    <th style={{ padding: '12px 14px' }}>Daily Work Description</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', width: '70px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheetEntries && timesheetEntries.length > 0 ? (
                    timesheetEntries.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                        <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 600, verticalAlign: 'top' }}>{item.date}</td>
                        <td style={{ padding: '14px', color: 'var(--text-secondary)', verticalAlign: 'top' }}>{item.day}</td>
                        <td style={{ padding: '14px', verticalAlign: 'top' }}>
                          <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '0.86rem' }}>
                            {item.description || item.task_title}
                          </div>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'center', verticalAlign: 'top' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteTimesheetEntry(item.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '6px'
                            }}
                            title="Delete Timesheet Entry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '36px 14px', color: 'var(--text-muted)' }}>
                        <Briefcase size={28} style={{ opacity: 0.4, marginBottom: '6px' }} />
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Timesheet Records Found for This Month</div>
                        <div style={{ fontSize: '0.76rem', marginTop: '4px' }}>
                          Click the <strong>+ Log Daily Work</strong> button above to record the tasks performed today.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* =======================================================================
         MODAL: LOG DAILY WORK DESCRIPTION
         ======================================================================= */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={18} style={{ color: 'var(--accent-primary)' }} />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Log Daily Work Description</h3>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Record what work and academic tasks you completed during the day.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTimesheetEntry} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Activity Date
                </label>
                <input 
                  type="date"
                  required
                  value={taskForm.date}
                  onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Work Description *
                </label>
                <textarea 
                  rows={6}
                  required
                  placeholder="Describe in detail the tasks, lectures, lab sessions, or academic duties performed today (e.g., Conducted 3rd-year Database Systems lecture, evaluated lab assignments, and scrutinized semester exam papers)..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.88rem', resize: 'vertical', lineHeight: '1.5' }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="btn btn-primary"
                  style={{ padding: '8px 22px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={15} />
                  <span>{isSubmittingTask ? 'Saving to DB...' : 'Save Description'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

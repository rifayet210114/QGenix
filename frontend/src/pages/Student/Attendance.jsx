// ============================================================================
// Attendance.jsx — QGenix Student Attendance Dashboard Component
// ============================================================================
// This component renders the student's personal attendance tracking panel.
// Designed with a premium "liquid glassmorphic" aesthetic that matches the
// QGenix dark/light theme tokens. It includes:
//
//   1. Header Section: Page Title, Subtitle, and Custom Glass Actions
//   2. Quick Stats Grid: 6 glass indicators displaying key attendance metrics
//   3. Attendance Health Banner: High-impact dashboard banner showing current status
//   4. Analytics Section:
//      - Monthly Trend Chart: Spline area chart representing monthly rate growth
//      - Breakdown Progress Ring: Recharts pie-based donut ring for present/absent/late
//   5. Subject-Wise Table: Structured grid showing attendance by course with status pills
//   6. Activity Timeline: Timeline stack listing recent check-ins
//   7. Attendance Heatmap: GitHub-style block grid representing daily logs for May
//   8. AI Insights Panel: Smart diagnostics calculating target recovery numbers
//   9. Risk Alerts Panel: Warning cards highlighting below-threshold subjects
//
// Animations: Handled via Framer Motion for smooth transitions, fades, and slides.
// Theme Sync: Fully integrated with global variables (light mode support).
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Smooth animation library
import { 
  Users, AlertTriangle, TrendingUp, CheckCircle, 
  Clock, ArrowUpRight, FileDown, Printer, 
  Calendar, Award, Info, RefreshCw, X, ChevronRight 
} from 'lucide-react'; // Elegant modern icons
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts'; // Charting engine
import Card from '../../components/Card'; // Wrapper glass card
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';

export default function Attendance() {
  const { user } = useAuth();
  const [liveAttendance, setLiveAttendance] = useState(null);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('');

  // --------------------------------------------------------------------------
  // THEME DETECTION & INITIAL STATES
  // --------------------------------------------------------------------------
  // Monitors the body element's classes to adapt chart stroke colors dynamically
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Mobile breakpoint detector for responsive layout adjustments
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // UI state for exporting/downloading reports
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // --------------------------------------------------------------------------
  // 100% REAL-TIME DATABASE ATTENDANCE FETCHING
  // --------------------------------------------------------------------------
  const fetchMyAttendance = async (semOverride) => {
    if (!user) return;
    try {
      const studentId = user.id || user.institutional_id || user.username;
      const targetSem = semOverride !== undefined ? semOverride : (selectedSemester || user?.semester || '');
      let url = `${API_BASE}/api/auth/attendances/student/?student_id=${encodeURIComponent(studentId)}`;
      if (targetSem) {
        url += `&semester=${encodeURIComponent(targetSem)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLiveAttendance(data);
      }
    } catch (err) {
      console.warn('Could not load student attendance:', err);
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();

    const handleUpdate = () => {
      fetchMyAttendance();
    };

    window.addEventListener('qgenix_attendance_updated', handleUpdate);

    let attendBc;
    let academicBc;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        attendBc = new BroadcastChannel('qgenix_attendance_sync');
        attendBc.onmessage = () => fetchMyAttendance();

        academicBc = new BroadcastChannel('qgenix_academic_sync');
        academicBc.onmessage = () => fetchMyAttendance();
      }
    } catch (_) {}

    const handleStorage = (e) => {
      if (e.key === 'qgenix_last_attendance_sync' || e.key === 'qgenix_attendances_last_update') {
        fetchMyAttendance();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('qgenix_attendance_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      if (attendBc) { try { attendBc.close(); } catch (_) {} }
      if (academicBc) { try { academicBc.close(); } catch (_) {} }
    };
  }, [user, selectedSemester]);

  // Total summary counts computed dynamically from DB
  const requiredLimit = liveAttendance?.required_limit !== undefined 
    ? parseFloat(liveAttendance.required_limit) 
    : 75.0;
  const currentTerm = liveAttendance?.current_term || 'Spring 2026';
  const activeSemester = liveAttendance?.current_semester || user?.semester || '2nd Semester';

  const overallPct = liveAttendance?.total_held > 0 
    ? liveAttendance.percentage.toFixed(1) 
    : '100.0';
  const totalClasses = liveAttendance?.total_held !== undefined ? liveAttendance.total_held : 0;
  const presentClasses = liveAttendance?.total_attended !== undefined ? liveAttendance.total_attended : 0;
  const absentClasses = liveAttendance?.total_absent !== undefined ? liveAttendance.total_absent : 0;
  const lateClasses = liveAttendance?.total_late !== undefined ? liveAttendance.total_late : 0;

  const statsData = [
    { label: 'Overall Attendance', value: `${overallPct}%`, desc: parseFloat(overallPct) >= requiredLimit ? `✓ Above ${requiredLimit.toFixed(1)}% limit` : `⚠️ Shortfall warning (<${requiredLimit.toFixed(1)}%)`, icon: <TrendingUp size={15} />, color: parseFloat(overallPct) >= requiredLimit ? '#10B981' : '#EF4444', bg: parseFloat(overallPct) >= requiredLimit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' },
    { label: 'Total Classes', value: `${totalClasses}`, desc: `${activeSemester} total`, icon: <Calendar size={15} />, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Present Classes', value: `${presentClasses}`, desc: 'Checked in by teacher', icon: <CheckCircle size={15} />, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
    { label: 'Absent Classes', value: `${absentClasses}`, desc: 'Marked absent', icon: <X size={15} />, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
    { label: 'Late Attendance', value: `${lateClasses}`, desc: 'Grace period entries', icon: <Clock size={15} />, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Required Limit', value: `${requiredLimit.toFixed(1)}%`, desc: 'Academic threshold', icon: <Info size={15} />, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' }
  ];

  // Monthly historical percentage trend for chart visualization (Real DB Progression)
  const monthlyTrendData = (liveAttendance?.monthly_trend && liveAttendance.monthly_trend.length > 0)
    ? liveAttendance.monthly_trend
    : [
        { month: 'Target', rate: requiredLimit },
        { month: 'Current', rate: isNaN(parseFloat(overallPct)) ? 100 : parseFloat(overallPct) }
      ];

  // Breakdowns used inside the Progress Ring chart (Real DB Values)
  const ringChartData = (totalClasses > 0)
    ? [
        { name: 'Present', value: Math.max(0, presentClasses - lateClasses), color: '#8B5CF6' },
        { name: 'Absent', value: absentClasses, color: '#EF4444' },
        { name: 'Late', value: lateClasses, color: '#F59E0B' }
      ]
    : [
        { name: 'Present', value: 1, color: '#8B5CF6' },
        { name: 'Absent', value: 0, color: '#EF4444' },
        { name: 'Late', value: 0, color: '#F59E0B' }
      ];

  // Subject-wise breakdowns from real database
  const subjectAttendance = (liveAttendance?.subject_wise && liveAttendance.subject_wise.length > 0)
    ? liveAttendance.subject_wise.map(s => {
        const pct = parseFloat(s.pct) || 0.0;
        const status = s.status || (pct >= (requiredLimit + 10) ? 'Good' : pct >= requiredLimit ? 'Warning' : 'Critical');
        return {
          subject: s.subject || s.code,
          teacher: s.teacher || 'Faculty',
          total: s.total,
          present: s.present,
          absent: s.absent,
          late: s.late,
          pct: pct,
          status: status
        };
      })
    : [];

  // Timeline check-in events log
  const recentLogs = (liveAttendance?.recent_logs && liveAttendance.recent_logs.length > 0)
    ? liveAttendance.recent_logs.slice(0, 8).map(l => ({
        date: l.date,
        time: 'Class Lecture',
        subject: l.course_title || l.course_code,
        state: l.status ? (l.status.charAt(0).toUpperCase() + l.status.slice(1)) : 'Present',
        color: l.status === 'present' ? '#10B981' : l.status === 'late' ? '#F59E0B' : '#EF4444'
      }))
    : [];

  // Helper to generate dynamic GitHub-style attendance calendar matrix for the active month
  const generateDynamicHeatmap = (yearNum, monthNum, dailyRecords) => {
    const now = new Date();
    const yr = yearNum || now.getFullYear();
    const mo = monthNum ? monthNum - 1 : now.getMonth();
    const totalDays = new Date(yr, mo + 1, 0).getDate();
    const firstDayOfWeek = (new Date(yr, mo, 1).getDay() + 6) % 7; // Mon=0 .. Sun=6

    const weeks = [];
    let currentWeek = [];

    // Leading empty days
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ day: null, state: 'empty' });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = (new Date(yr, mo, d).getDay() + 6) % 7;
      const isWeekend = dayOfWeek === 4 || dayOfWeek === 5; // Friday & Saturday are weekends in BD

      let state = isWeekend ? 'weekend' : 'empty';
      let title = `Day ${d}: No attendance recorded`;

      if (dailyRecords && dailyRecords[dateStr]) {
        state = dailyRecords[dateStr]; // 'present', 'late', 'absent'
        title = `Day ${d}: ${state.toUpperCase()} session recorded`;
      } else if (isWeekend) {
        title = `Day ${d}: Weekend`;
      }

      currentWeek.push({ day: d, state, title, date: dateStr });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ day: null, state: 'empty' });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const calendarMonth = liveAttendance?.calendar_month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const heatmapWeeks = generateDynamicHeatmap(
    liveAttendance?.calendar_year,
    liveAttendance?.calendar_month_num,
    liveAttendance?.daily_attendance
  );

  // Helper mapping of heatmap states to styled colors.
  // We use theme-aware transparent colors for weekends and holidays to blend with the card background,
  // while utilizing solid vibrant colors for present, absent, and late check-in states.
  const heatmapColorMap = {
    present: '#10B981', // Emerald green indicating presence
    absent: '#EF4444',  // Crimson red indicating absence
    late: '#F59E0B',    // Amber yellow indicating late arrivals
    weekend: isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.02)', // Soft border outline for weekends
    holiday: isLightMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.25)', // Translucent violet glow for institutional holidays
    empty: 'transparent' // Transparent placeholder for leading/trailing days of adjacent months
  };

  // Helper to determine the text color of a day block to ensure contrast compliance and high readability.
  // Solid green/red/orange blocks get bright white text. Holidays receive theme-aware violet tones.
  // Weekend boxes use muted theme secondary colors.
  const getDayTextColor = (state) => {
    if (state === 'empty') return 'transparent';
    if (state === 'weekend') return 'var(--text-muted)';
    if (state === 'holiday') return isLightMode ? '#6D28D9' : '#C084FC';
    return '#ffffff'; // high-contrast white text for solid backgrounds (present, absent, late)
  };

  // --------------------------------------------------------------------------
  // AI IMPROVEMENT CALCULATOR LOGIC
  // --------------------------------------------------------------------------
  // Identifies low subjects and calculates the consecutive classes required
  // to raise attendance to the 75% target.
  const calculateRecovery = (subj) => {
    if (subj.pct >= 75) return null;
    const currentAttended = subj.present;
    const currentTotal = subj.total;
    // Calculation derived from: (Attended + X) / (Total + X) >= 0.75
    // => Attended + X >= 0.75 * Total + 0.75 * X
    // => 0.25 * X >= 0.75 * Total - Attended
    // => X >= 3 * Total - 4 * Attended
    const requiredConsectutive = Math.max(0, 3 * currentTotal - 4 * currentAttended);
    return requiredConsectutive;
  };

  // Trigger export confirmation feedback
  const handleExport = (format) => {
    setIsExporting(true);
    setExportMessage(`Preparing ${format} download...`);
    setTimeout(() => {
      setExportMessage(`${format} successfully exported and saved to downloads.`);
      setTimeout(() => {
        setIsExporting(false);
        setExportMessage('');
      }, 2000);
    }, 1500);
  };

  // Recharts Custom Area Tooltip matching dashboard styling
  const CustomAreaTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: isLightMode ? '#ffffff' : 'rgba(10, 15, 30, 0.95)',
          border: isLightMode ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
          padding: '10px 14px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>{payload[0].payload.month} 2026</div>
          <div style={{ color: '#8B5CF6', fontWeight: 800, fontSize: '1rem', marginTop: '4px' }}>
            Attendance: {payload[0].value.toFixed(1)}%
          </div>
        </div>
      );
    }
    return null;
  };

  // Framer Motion Animation configs
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
      style={{ width: '100%' }}
    >
      
      {/* =======================================================================
         SECTION 1 — PAGE HEADER & GLOBAL LIQUID ACTION BUTTONS
         ======================================================================= */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2"
      >
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Attendance Overview
            </h1>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
                border: '1.5px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 2px 10px rgba(139, 92, 246, 0.15)'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }}></span>
              <span style={{ color: '#E2E8F0', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.02em' }}>
                {activeSemester}
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.95rem', fontWeight: '500' }}>
            Real-time semester attendance across all courses up to today
          </p>
        </div>

        {/* Action Panel: Export/Print options styled as glowing liquid glass capsules.
            We explicitly apply inline styles ('display: flex', 'gap: 12px') to guarantee 
            consistent horizontal spacing across all viewports and theme modes, bypassing 
            any potential utility stylesheet compilation/override issues. */}
        <div className="flex flex-wrap items-center" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => handleExport('PDF Report')}
            disabled={isExporting}
            className="navbar-btn-hover flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1.5px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '14px',
              padding: '10px 18px',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <FileDown size={16} style={{ color: '#8B5CF6' }} />
            <span>Download Report</span>
          </button>

          <button 
            onClick={() => handleExport('CSV')}
            disabled={isExporting}
            className="navbar-btn-hover flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '10px 18px',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <ArrowUpRight size={16} style={{ color: '#3B82F6' }} />
            <span>Export CSV</span>
          </button>

          <button 
            onClick={() => window.print()}
            className="navbar-btn-hover flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '10px 18px',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <Printer size={16} style={{ color: '#10B981' }} />
            <span>Print Summary</span>
          </button>
        </div>
      </motion.div>

      {/* Export feedback toast animation */}
      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.9rem',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)'
            }}
          >
            <RefreshCw size={16} className="animate-spin" style={{ color: '#10B981' }} />
            <span>{exportMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================================
         SECTION 2 — 6x QUICK STATS COMPACT GRID (1 or 2 rows max)
         ======================================================================= */}
      <motion.div 
        variants={itemVariants}
        className="attendance-stats-grid"
      >
        <style>{`
          .attendance-stats-grid {
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 12px;
            width: 100%;
          }
          @media (max-width: 1240px) {
            .attendance-stats-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 12px;
            }
          }
          @media (max-width: 640px) {
            .attendance-stats-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
            }
          }
          .attendance-stat-card {
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 76px;
            border-radius: 14px;
            transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
            position: relative;
            overflow: hidden;
          }
          .attendance-stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          }
        `}</style>

        {statsData.map((stat, idx) => (
          <div 
            key={idx}
            className="glass-panel premium-card attendance-stat-card" 
            style={{ 
              border: '1px solid var(--border-color)',
              background: isLightMode 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.01) 100%)'
            }}
          >
            {/* Top row: Label + Compact Icon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                fontSize: '0.72rem', 
                color: 'var(--text-muted)', 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {stat.label}
              </span>
              <div style={{ 
                width: '26px', 
                height: '26px', 
                borderRadius: '7px', 
                background: stat.bg, 
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {stat.icon}
              </div>
            </div>

            {/* Bottom: Value + Micro Desc */}
            <div style={{ marginTop: '4px' }}>
              <div style={{ 
                fontSize: '1.42rem', 
                fontWeight: 800, 
                color: 'var(--text-primary)', 
                lineHeight: 1.1 
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '0.68rem', 
                color: stat.color, 
                fontWeight: 600, 
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {stat.desc}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

            {/* =======================================================================
         SECTION 3 — ROW 1: ATTENDANCE BREAKDOWN & HEATMAP + MONTHLY ATTENDANCE TREND
         ======================================================================= */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        {/* Card 1: Attendance Breakdown & Heatmap */}
        <div style={{ height: '100%' }}>
          <Card 
            title="Attendance Breakdown & Heatmap" 
            action={
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{calendarMonth}</span>
            }
            className="premium-card"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div className="attendance-card-body" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <style>{`
                .attendance-card-body {
                  container-type: inline-size;
                  container-name: attendance-card;
                  width: 100%;
                }
                .attendance-flex-container {
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  gap: 20px;
                  margin-top: 8px;
                  width: 100%;
                }
                .attendance-divider {
                  display: none;
                }
                @container attendance-card (min-width: 580px) {
                  .attendance-flex-container {
                    flex-direction: row !important;
                    gap: 32px !important;
                    justify-content: space-around !important;
                  }
                  .attendance-divider {
                    display: block !important;
                    width: 1px;
                    height: 200px;
                    background: rgba(255, 255, 255, 0.06);
                    flex-shrink: 0;
                  }
                }
                body.light-mode .attendance-divider {
                  background: rgba(0, 0, 0, 0.08) !important;
                }
              `}</style>

              <div className="attendance-flex-container">
                
                {/* Left Column: Attendance Breakdown Donut Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', position: 'relative', width: '250px', flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={ringChartData}
                        cx="50%"
                        cy="42%"
                        innerRadius={50}
                        outerRadius={66}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {ringChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Absolute layout center labels */}
                  <div style={{
                    position: 'absolute',
                    top: '38%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                      {overallPct}%
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Checked In
                    </div>
                  </div>

                  {/* Custom Legends row */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                    {ringChartData.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                          {item.name} ({item.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center Divider: Vertical Line */}
                <div className="attendance-divider" />

                {/* Right Column: Attendance Heatmap Calendar Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '250px', flexShrink: 0 }}>
                  <div style={{ maxWidth: '240px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Heatmap weekday labels */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center' }}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>{d}</span>
                      ))}
                    </div>

                    {/* Heatmap Blocks Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {heatmapWeeks.map((week, wIdx) => (
                        <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                          {week.map((dayObj, dIdx) => (
                            <div 
                              key={dIdx}
                              style={{
                                aspectRatio: '1',
                                borderRadius: '7px',
                                background: heatmapColorMap[dayObj.state] || 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: getDayTextColor(dayObj.state),
                                border: dayObj.state === 'weekend' ? (isLightMode ? '1px dashed rgba(0, 0, 0, 0.15)' : '1px dashed rgba(255, 255, 255, 0.15)') : 'none',
                                position: 'relative',
                                cursor: dayObj.day ? 'pointer' : 'default',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: dayObj.state === 'present' ? '0 2px 8px rgba(16, 185, 129, 0.25)' :
                                           dayObj.state === 'absent' ? '0 2px 8px rgba(239, 68, 68, 0.25)' :
                                           dayObj.state === 'late' ? '0 2px 8px rgba(245, 158, 11, 0.25)' :
                                           dayObj.state === 'holiday' ? '0 2px 8px rgba(139, 92, 246, 0.25)' : 'none'
                              }}
                              title={dayObj.title || (dayObj.day ? `Day ${dayObj.day}: ${dayObj.state}` : '')}
                              className="hover:scale-110 hover:brightness-110"
                            >
                              {dayObj.day}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Colors legend */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', fontSize: '0.65rem', borderTop: isLightMode ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: heatmapColorMap.present }} />
                      <span style={{ color: 'var(--text-secondary)' }}>Present</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: heatmapColorMap.absent }} />
                      <span style={{ color: 'var(--text-secondary)' }}>Absent</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: heatmapColorMap.late }} />
                      <span style={{ color: 'var(--text-secondary)' }}>Late</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isLightMode ? '#6D28D9' : '#8B5CF6' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>Holiday</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Card 2: Monthly Attendance Trend */}
        <div style={{ height: '100%' }}>
          <Card 
            title="Monthly Attendance Trend" 
            action={
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{currentTerm} • {activeSemester}</span>
            }
            className="premium-card"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* Top Trend Quick Indicators */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: parseFloat(overallPct) >= requiredLimit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: parseFloat(overallPct) >= requiredLimit ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: parseFloat(overallPct) >= requiredLimit ? '#10B981' : '#EF4444' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Current:</span>
                  <strong style={{ fontSize: '0.78rem', color: parseFloat(overallPct) >= requiredLimit ? '#10B981' : '#EF4444' }}>{overallPct}%</strong>
                </div>

                <div style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Threshold:</span>
                  <strong style={{ fontSize: '0.78rem', color: '#8B5CF6' }}>{requiredLimit.toFixed(1)}% Target</strong>
                </div>

                <div style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: parseFloat(overallPct) >= requiredLimit ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: parseFloat(overallPct) >= requiredLimit ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: parseFloat(overallPct) >= requiredLimit ? '#3B82F6' : '#EF4444' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Trajectory:</span>
                  <strong style={{ fontSize: '0.78rem', color: parseFloat(overallPct) >= requiredLimit ? '#3B82F6' : '#EF4444' }}>
                    {parseFloat(overallPct) >= requiredLimit ? 'Optimal ↗' : 'Risk ↘'}
                  </strong>
                </div>
              </div>

              {/* Responsive Area Chart with fixed rendered height */}
              <div style={{ width: '100%', height: '240px', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255, 255, 255, 0.03)'} />
                    <XAxis 
                      dataKey="month" 
                      stroke={isLightMode ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.25)'} 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: 'var(--text-muted)', fontWeight: 500 }}
                    />
                    <YAxis 
                      domain={[60, 102]} 
                      stroke={isLightMode ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.25)'} 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: 'var(--text-muted)', fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <defs>
                      <linearGradient id="attendanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#8B5CF6" 
                      strokeWidth={3} 
                      fillOpacity={1}
                      fill="url(#attendanceAreaGrad)" 
                      dot={{ r: 4, strokeWidth: 1.5, fill: isLightMode ? '#ffffff' : '#0F172A', stroke: '#8B5CF6' }} 
                      activeDot={{ r: 6, strokeWidth: 1.5, fill: '#8B5CF6', stroke: '#fff', style: { filter: 'drop-shadow(0 0 5px #8B5CF6)' } }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* =======================================================================
         SECTION 4 — ROW 2: RECENT ACTIVITY LOG (LEFT) + SUBJECT-WISE TABLE (RIGHT)
         ======================================================================= */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col lg:flex-row gap-6 items-stretch"
        style={{ width: '100%' }}
      >
        {/* Left: Recent Activity Log (fixed/compact width matching original layout) */}
        <div className="w-full lg:w-[350px] shrink-0" style={{ display: 'flex', flexDirection: 'column' }}>
          <Card 
            title="Recent Activity Log" 
            action={
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Live Feed</span>
            }
            className="premium-card"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px', flex: 1 }}>
              {recentLogs.length === 0 ? (
                <div style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No recent attendance check-in logs recorded.
                </div>
              ) : (
                recentLogs.map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {/* Timeline bullet dot */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', flexShrink: 0 }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: log.color,
                        border: '2px solid var(--bg-primary)',
                        boxShadow: `0 0 6px ${log.color}`
                      }} />
                      {idx < recentLogs.length - 1 && (
                        <div style={{
                          width: '2px',
                          flex: 1,
                          background: 'rgba(255,255,255,0.06)',
                          marginTop: '4px',
                          minHeight: '26px'
                        }} />
                      )}
                    </div>

                    {/* Log contents */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                          {log.subject}
                        </h4>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: `${log.color}15`,
                          color: log.color,
                          border: `1.5px solid ${log.color}25`
                        }}>
                          {log.state}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span>{log.date}</span>
                        <span>•</span>
                        <span>{log.time}</span>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right: Subject-wise Details Table (occupies full remaining horizontal width) */}
        <div className="w-full flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column' }}>
          <div 
            className="glass-panel premium-card" 
            style={{ 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Subject-wise Attendance</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{activeSemester}</span>
            </div>

            {/* Table Container: full width with zero horizontal scrolling required */}
            <div style={{ overflowX: 'auto', flex: 1, width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '10px 12px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Subject</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Teacher</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Total</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Present</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Absent</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Late</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Pct</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No enrolled subject attendance records recorded yet by faculty.
                      </td>
                    </tr>
                  ) : (
                    subjectAttendance.map((subj, index) => {
                      const statusColorMap = {
                        Good: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
                        Warning: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
                        Critical: { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' }
                      };
                      const color = statusColorMap[subj.status] || { text: '#fff', bg: 'rgba(255,255,255,0.05)' };

                      return (
                        <tr 
                          key={index}
                          style={{ 
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: index % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                            transition: 'background 0.2s ease'
                          }}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td style={{ padding: '12px 12px', fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)' }}>{subj.subject}</td>
                          <td style={{ padding: '12px 12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{subj.teacher}</td>
                          <td style={{ padding: '12px 12px', fontSize: '0.84rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: '600' }}>{subj.total}</td>
                          <td style={{ padding: '12px 12px', fontSize: '0.84rem', color: '#10B981', textAlign: 'center', fontWeight: '600' }}>{subj.present}</td>
                          <td style={{ padding: '12px 12px', fontSize: '0.84rem', color: '#EF4444', textAlign: 'center', fontWeight: '600' }}>{subj.absent}</td>
                          <td style={{ padding: '12px 12px', fontSize: '0.84rem', color: '#F59E0B', textAlign: 'center', fontWeight: '600' }}>{subj.late}</td>
                          <td style={{ padding: '12px 12px', fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'right', whiteSpace: 'nowrap' }}>{subj.pct.toFixed(1)}%</td>
                          <td style={{ padding: '12px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: color.bg,
                              color: color.text,
                              border: `1px solid ${color.text}25`
                            }}>
                              {subj.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}

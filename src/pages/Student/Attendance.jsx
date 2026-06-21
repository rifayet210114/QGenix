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
  CalendarCheck, Users, AlertTriangle, TrendingUp, CheckCircle, 
  Clock, ArrowUpRight, FileDown, Printer, BrainCircuit, 
  Sparkles, Calendar, Award, Info, RefreshCw, X, ChevronRight 
} from 'lucide-react'; // Elegant modern icons
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts'; // Charting engine
import Card from '../../components/Card'; // Wrapper glass card

export default function Attendance() {
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
  // DETAILED ACADEMIC MOCK DATA
  // --------------------------------------------------------------------------
  
  // Total summary counts across all classes this semester
  const statsData = [
    { label: 'Overall Attendance', value: '85.0%', desc: '✓ Above 75% limit', icon: <TrendingUp size={18} />, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Total Classes', value: '120', desc: 'Semester sessions', icon: <Calendar size={18} />, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Present Classes', value: '102', desc: 'Checked in on time', icon: <CheckCircle size={18} />, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
    { label: 'Absent Classes', value: '18', desc: 'Medical / Excused', icon: <X size={18} />, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
    { label: 'Late Attendance', value: '5', desc: 'Grace period entries', icon: <Clock size={18} />, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Required Limit', value: '75.0%', desc: 'Academic threshold', icon: <Info size={18} />, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' }
  ];

  // Monthly historical percentage trend for chart visualization
  const monthlyTrendData = [
    { month: 'Jan', rate: 82.5 },
    { month: 'Feb', rate: 84.0 },
    { month: 'Mar', rate: 86.8 },
    { month: 'Apr', rate: 83.2 },
    { month: 'May', rate: 85.0 }
  ];

  // Breakdowns used inside the Progress Ring chart
  const ringChartData = [
    { name: 'Present', value: 102, color: '#8B5CF6' },
    { name: 'Absent', value: 18, color: '#EF4444' },
    { name: 'Late', value: 5, color: '#F59E0B' }
  ];

  // Subject-wise breakdowns (Data Structures, Database, Computer Networks, Software Engineering, Academic Writing)
  const subjectAttendance = [
    { subject: 'Data Structures', teacher: 'Dr. Sarah Ahmed', total: 28, present: 24, absent: 4, late: 1, pct: 85.7, status: 'Good' },
    { subject: 'Database Management', teacher: 'Prof. M. Rahman', total: 24, present: 18, absent: 6, late: 2, pct: 75.0, status: 'Warning' },
    { subject: 'Computer Networks', teacher: 'Dr. Karim Al-Hasan', total: 28, present: 26, absent: 2, late: 1, pct: 92.8, status: 'Good' },
    { subject: 'Software Engineering', teacher: 'Dr. Sarah Ahmed', total: 20, present: 14, absent: 5, late: 1, pct: 70.0, status: 'Critical' },
    { subject: 'Academic Writing', teacher: 'Prof. Lisa Johnson', total: 21, present: 20, absent: 1, late: 0, pct: 95.2, status: 'Good' }
  ];

  // Timeline check-in events log
  const recentLogs = [
    { date: '2026-05-21', time: '02:00 PM', subject: 'Software Engineering', state: 'Present', color: '#10B981' },
    { date: '2026-05-21', time: '09:00 AM', subject: 'Computer Networks', state: 'Late', color: '#F59E0B' },
    { date: '2026-05-20', time: '11:30 AM', subject: 'Database Management', state: 'Absent', color: '#EF4444' },
    { date: '2026-05-20', time: '09:00 AM', subject: 'Data Structures', state: 'Present', color: '#10B981' },
    { date: '2026-05-19', time: '02:00 PM', subject: 'Software Engineering', state: 'Present', color: '#10B981' }
  ];

  // GitHub-style attendance calendar cells for May 2026 (W1 to W5 matrix)
  // States: 'present' | 'absent' | 'late' | 'weekend' | 'holiday'
  const heatmapWeeks = [
    [
      { day: 1, state: 'holiday', title: 'May Day' },
      { day: 2, state: 'weekend' },
      { day: 3, state: 'weekend' },
      { day: 4, state: 'present' },
      { day: 5, state: 'present' },
      { day: 6, state: 'late' },
      { day: 7, state: 'present' }
    ],
    [
      { day: 8, state: 'present' },
      { day: 9, state: 'weekend' },
      { day: 10, state: 'weekend' },
      { day: 11, state: 'absent' },
      { day: 12, state: 'present' },
      { day: 13, state: 'present' },
      { day: 14, state: 'present' }
    ],
    [
      { day: 15, state: 'late' },
      { day: 16, state: 'weekend' },
      { day: 17, state: 'weekend' },
      { day: 18, state: 'present' },
      { day: 19, state: 'present' },
      { day: 20, state: 'absent' },
      { day: 21, state: 'present' }
    ],
    [
      { day: 22, state: 'present' },
      { day: 23, state: 'weekend' },
      { day: 24, state: 'weekend' },
      { day: 25, state: 'present' },
      { day: 26, state: 'holiday', title: 'College Holiday' },
      { day: 27, state: 'present' },
      { day: 28, state: 'present' }
    ],
    [
      { day: 29, state: 'late' },
      { day: 30, state: 'weekend' },
      { day: 31, state: 'weekend' },
      { day: null, state: 'empty' },
      { day: null, state: 'empty' },
      { day: null, state: 'empty' },
      { day: null, state: 'empty' }
    ]
  ];

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
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Attendance Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Track your academic attendance threshold, subject breakdowns, and recovery metrics
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
         SECTION 2 — 6x QUICK STATS GRID CARDS
         ======================================================================= */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {statsData.map((stat, idx) => (
          <div 
            key={idx}
            className="glass-panel premium-card" 
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              transition: 'all 0.45s cubic-bezier(0.25, 1, 0.5, 1)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</span>
              <div style={{ padding: '6px', borderRadius: '10px', background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: stat.color, fontWeight: 600, marginTop: '4px' }}>
                {stat.desc}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* =======================================================================
         SECTION 3 — ATTENDANCE HEALTH BANNER
         ======================================================================= */}
      <motion.div variants={itemVariants}>
        <div 
          className="glass-panel premium-card" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.03) 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.25)', 
            borderRadius: '24px', 
            padding: '24px 32px',
            boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Header Row: Title, Status Badge, Indicator */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
              }}>
                <CalendarCheck size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Attendance Health Standing
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Updated real-time for Spring 2026</span>
              </div>
            </div>

            {/* Glowing standing badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span style={{
                fontSize: '0.82rem',
                fontWeight: '700',
                padding: '6px 14px',
                borderRadius: '30px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                border: '1.5px solid rgba(16, 185, 129, 0.25)'
              }}>
                Good Standing
              </span>
            </div>
          </div>

          {/* Description Text */}
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Excellent work, Rafiul! Your overall attendance is at <strong style={{ color: 'var(--text-primary)' }}>85.0%</strong>, which is <strong>10.0%</strong> above the college's mandatory <strong>75.0%</strong> requirement. You have missed only 18 out of 120 total classes, keeping you fully eligible for all upcoming final semester examinations. Keep maintaining this regularity!
          </p>

          {/* Horizontal Progress Bar representing Overall Attendance */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Overall Progress</span>
              <span style={{ color: '#10B981', fontWeight: '700' }}>85.0% (Goal: 75.0%)</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)', borderRadius: '12px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: '85%', 
                  height: '100%', 
                  background: 'linear-gradient(to right, #10B981, #3B82F6)', 
                  borderRadius: '12px',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
                }} 
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* =======================================================================
         SECTION 4 — BOTTOM MATRIX (CALENDAR HEATMAP & BREAKDOWN, TIMELINE, RISK ALERTS)
         ======================================================================= */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* A. Attendance Breakdown & Heatmap Merged Card */}
        <div className="lg:col-span-2">
          <Card 
            title="Attendance Breakdown & Heatmap" 
            action={
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>May 2026</span>
            }
            className="premium-card"
          >
            <div className="attendance-card-body" style={{ width: '100%' }}>
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
                  gap: 24px;
                  margin-top: 16px;
                  width: 100%;
                }
                .attendance-divider {
                  display: none;
                }
                @container attendance-card (min-width: 620px) {
                  .attendance-flex-container {
                    flex-direction: row !important;
                    gap: 56px !important;
                  }
                  .attendance-divider {
                    display: block !important;
                    width: 1px;
                    height: 180px;
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', position: 'relative', width: '280px', flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={ringChartData}
                        cx="50%"
                        cy="42%"
                        innerRadius={52}
                        outerRadius={68}
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
                    <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                      85.0%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Checked In
                    </div>
                  </div>

                  {/* Custom Legends row */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                    {ringChartData.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px', flexShrink: 0 }}>
                  <div style={{ maxWidth: '260px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Heatmap weekday labels */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
                        <span key={idx} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800' }}>{d}</span>
                      ))}
                    </div>

                    {/* Heatmap Blocks Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {heatmapWeeks.map((week, wIdx) => (
                        <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                          {week.map((dayObj, dIdx) => (
                            <div 
                              key={dIdx}
                              style={{
                                aspectRatio: '1', // Perfect square blocks
                                borderRadius: '8px', // High-end rounded corners matching the dashboard design language
                                background: heatmapColorMap[dayObj.state] || 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.78rem', // Optimal size for numeric readability within square limits
                                fontWeight: '700',
                                color: getDayTextColor(dayObj.state),
                                // Dashed borders only for weekends to show calendar structure cleanly
                                border: dayObj.state === 'weekend' ? (isLightMode ? '1px dashed rgba(0, 0, 0, 0.15)' : '1px dashed rgba(255, 255, 255, 0.15)') : 'none',
                                position: 'relative',
                                cursor: dayObj.day ? 'pointer' : 'default',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth hover lifts
                                // Subtle drop shadows using matching colors to create a soft, glowing, futuristic neon overlay on the dark background
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.65rem', borderTop: isLightMode ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: heatmapColorMap.present }} />
                      <span style={{ color: 'var(--text-secondary)' }}>Present</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: heatmapColorMap.absent }} />
                      <span style={{ color: 'var(--text-secondary)' }}>Absent</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: heatmapColorMap.late }} />
                      <span style={{ color: 'var(--text-secondary)' }}>Late</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLightMode ? '#6D28D9' : '#8B5CF6' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>Holiday</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </Card>
        </div>

      {/* =======================================================================
         SECTION 5 — ANALYTICS BLOCK (MONTHLY CHART & BREAKDOWN PROGRESS RING)
         ======================================================================= */}
      {/* =======================================================================
         SECTION 5 — ANALYTICS BLOCK (MONTHLY CHART)
         ======================================================================= */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Full-width Card: Monthly Attendance Area Chart */}
        <div className="lg:col-span-3">
          <Card 
            title="Monthly Attendance Trend" 
            action={
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Spring Sem 2026</span>
            }
            className="premium-card"
          >
            <div style={{ height: '220px', width: '100%', marginTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
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
                    domain={[60, 100]} 
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
          </Card>
        </div>
      </motion.div>

      {/* =======================================================================
         SECTION 6 — SUBJECT-WISE GLASS TABLE & SMART AI INSIGHTS
         ======================================================================= */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left: Large glass details table */}
        <div className="lg:col-span-2">
          <div className="glass-panel premium-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Subject-wise Attendance</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Courses</span>
            </div>

            {/* Responsive Table Scroll Wrapper */}
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Subject</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Teacher</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Total</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Present</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Absent</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Late</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Pct</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectAttendance.map((subj, index) => {
                    // Status Badge color mapping
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
                        <td style={{ padding: '14px 16px', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>{subj.subject}</td>
                        <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{subj.teacher}</td>
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: '600' }}>{subj.total}</td>
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#10B981', textAlign: 'center', fontWeight: '600' }}>{subj.present}</td>
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#EF4444', textAlign: 'center', fontWeight: '600' }}>{subj.absent}</td>
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#F59E0B', textAlign: 'center', fontWeight: '600' }}>{subj.late}</td>
                        <td style={{ padding: '14px 16px', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'right' }}>{subj.pct.toFixed(1)}%</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
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
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: AI Insights and Calculations */}
        <div>
          <Card title="AI Academic Insights" className="premium-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
              {/* Profile header row */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2))',
                  border: '1.5px solid rgba(139, 92, 246, 0.4)',
                  color: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(139, 92, 246, 0.15)'
                }}>
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>QGenix AI Assistant</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Standing & recovery diagnostics</div>
                </div>
              </div>

              {/* Speech bubble bubble layout */}
              <div style={{
                background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '14px',
                position: 'relative'
              }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Here are your attendance insights:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  
                  {/* Insight 1: Best Attendance */}
                  <div style={{ display: 'flex', items: 'flex-start', gap: '8px' }}>
                    <Sparkles size={14} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Best Attendance: <strong style={{ color: 'var(--text-primary)' }}>Academic Writing (95.2%)</strong>.
                    </span>
                  </div>

                  {/* Insight 2: Weakest Attendance */}
                  <div style={{ display: 'flex', items: 'flex-start', gap: '8px' }}>
                    <AlertTriangle size={14} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Weakest Course: <strong style={{ color: 'var(--text-primary)' }}>Software Engineering (70.0%)</strong> which falls below threshold.
                    </span>
                  </div>

                  {/* Insight 3: Monthly Progress */}
                  <div style={{ display: 'flex', items: 'flex-start', gap: '8px' }}>
                    <TrendingUp size={14} style={{ color: '#8B5CF6', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Monthly Trend: Overall rate increased by <strong style={{ color: '#10B981' }}>+1.8%</strong> compared to April.
                    </span>
                  </div>

                  {/* Insight 4: Dynamic target calculation */}
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px 12px', 
                    borderRadius: '10px', 
                    background: 'rgba(139, 92, 246, 0.06)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    fontSize: '0.75rem',
                    color: '#8B5CF6',
                    fontWeight: 600
                  }}>
                    💡 Action Item: You must attend the next <strong>4 consecutive classes</strong> in Software Engineering to restore it to the 75% target!
                  </div>

                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      

        {/* B. Activity Log & Risk Alerts Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Recent Check-in Logs Timeline */}
          <Card title="Recent Activity Log" className="premium-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
              
              {recentLogs.map((log, idx) => (
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
              ))}

            </div>
          </Card>

          {/* Threshold Risk Alerts */}
          <Card title="Threshold Risk Alerts" className="premium-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
              
              {/* Highlight card for below-limit courses */}
              {subjectAttendance.filter(s => s.pct < 75).map((subj, idx) => {
                const consecutiveNeeded = calculateRecovery(subj);
                return (
                  <div 
                    key={idx}
                    style={{
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
                      border: '1.5px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 4px 20px rgba(239, 68, 68, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{subj.subject}</span>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444'
                      }}>
                        {subj.pct.toFixed(1)}%
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Your attendance in this course is below the mandatory <strong style={{ color: 'var(--text-primary)' }}>75%</strong> requirement. Action is required immediately.
                    </p>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      fontSize: '0.75rem', 
                      color: '#EF4444', 
                      fontWeight: 600,
                      background: 'rgba(239, 68, 68, 0.05)',
                      padding: '8px',
                      borderRadius: '8px',
                      marginTop: '2px'
                    }}>
                      <Info size={12} />
                      <span>Attend next {consecutiveNeeded} classes consecutively.</span>
                    </div>
                  </div>
                );
              })}

              {/* Warning warning indicator card */}
              {subjectAttendance.filter(s => s.pct === 75).map((subj, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1.5px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{subj.subject}</span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#F59E0B'
                    }}>
                      75.0%
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Your attendance is exactly at the borderline of the requirement. Missing any more classes will push you into the risk zone.
                  </p>
                </div>
              ))}

              {/* Overall risk summary */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1.5px dashed rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>
                  1 Course below threshold • 1 Course at borderline
                </span>
              </div>

            </div>
          </Card>
        </div>
      </motion.div>

    </motion.div>
  );
}
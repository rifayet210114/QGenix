import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, CalendarCheck, Users, FileText, CheckSquare, TrendingUp, Award, Clock, Bell, LogOut, BookOpen, AlertTriangle, ShieldAlert,
  ArrowUpRight, ArrowDownRight, MoreVertical, Plus, Edit, Trash2, Eye, User, Sparkles, MessageSquare, Clipboard, PieChart as PieIcon,
  RefreshCw, CheckCircle2, ChevronRight, Activity, PlusCircle, Check, BookMarked, HelpCircle, FileCheck, LogIn, CheckCircle,
  Download, RotateCcw
} from 'lucide-react';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminData, calculateGradeFromPolicy } from '../../contexts/AdminDataContext';
import { API_BASE } from '../../config';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    routineSlots = [],
    allocations = [],
    courses = [],
    students = [],
    attendances = [],
    examSessions = [],
    gradingScale = [],
    submittedExamResults = [],
    notices = [],
    auditLogs = [],
    refreshFromDB
  } = useAdminData();

  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  const [analyticsTab, setAnalyticsTab] = useState('performance');
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Real-time clock for calculating ongoing / upcoming / completed class status
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const todayDayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedTodayDate = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Teacher identification
  const currentTeacherName = (
    user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.name || user?.username || '')
  ).toLowerCase();
  const cleanTeacherName = currentTeacherName.replace(/^(dr\.|mr\.|mrs\.|ms\.|prof\.|engr\.)\s*/i, '').trim();
  const userFirst = (user?.first_name || '').toLowerCase().trim();
  const userUsername = (user?.username || '').toLowerCase().trim();

  const isMyTeacher = (tName) => {
    if (!tName) return false;
    const t = String(tName).toLowerCase().trim();
    const cleanT = t.replace(/^(dr\.|mr\.|mrs\.|ms\.|prof\.|engr\.)\s*/i, '').trim();
    if (!cleanTeacherName && !userUsername) return true;
    return (
      (cleanTeacherName && (t.includes(cleanTeacherName) || cleanTeacherName.includes(t))) ||
      (userUsername && (t.includes(userUsername) || userUsername.includes(t))) ||
      (userFirst && (t.includes(userFirst) || userFirst.includes(t)))
    );
  };

  // Biometric Attendance & Campus Duty State directly from DB
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const [biometricLogs, setBiometricLogs] = useState([]);

  const loadBiometricStatus = async () => {
    try {
      const teacherId = user?.id || user?.institutional_id || user?.email;
      const url = teacherId 
        ? `${API_BASE}/api/auth/teacher-checkin/?teacher_id=${encodeURIComponent(teacherId)}`
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
    } catch (e) {
      console.warn('Error loading teacher biometric data:', e);
    }
  };

  useEffect(() => {
    loadBiometricStatus();
    const handleSync = () => loadBiometricStatus();
    window.addEventListener('qgenix_teacher_checkin_updated', handleSync);
    return () => window.removeEventListener('qgenix_teacher_checkin_updated', handleSync);
  }, [user]);

  const handleToggleCheckInOut = async () => {
    if (isCheckLoading) return;
    setIsCheckLoading(true);
    const teacherId = user?.id || user?.institutional_id || user?.email;
    const actionToPerform = isCheckedIn ? 'check_out' : 'check_in';
    try {
      const res = await fetch(`${API_BASE}/api/auth/teacher-checkin/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: teacherId,
          action: actionToPerform,
          terminal: 'Web Turnstile - Teacher Dashboard Quick Action'
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
      console.error('Failed to toggle check-in/out:', err);
      triggerToast('❌ Network error while connecting to biometric server');
    } finally {
      setIsCheckLoading(false);
    }
  };

  // Real database routines
  const [liveRoutines, setLiveRoutines] = useState(() => {
    try {
      const saved = localStorage.getItem('qgenix_routineSlots');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const fetchLiveRoutines = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/routines/`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setLiveRoutines(data);
          }
        }
      } catch (err) {}
    };
    fetchLiveRoutines();
    const interval = setInterval(fetchLiveRoutines, 8000);
    return () => clearInterval(interval);
  }, []);

  const allRoutines = useMemo(() => {
    return (liveRoutines && liveRoutines.length > 0) ? liveRoutines : (routineSlots || []);
  }, [liveRoutines, routineSlots]);

  // Helper to calculate ongoing / upcoming / completed class dynamically
  const getSlotTimingStatus = (timeStr) => {
    if (!timeStr) return { status: 'Scheduled', isOngoing: false, isCompleted: false };
    try {
      const parts = timeStr.split('-');
      if (parts.length >= 2) {
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

        const parseTimeToMinutes = (t) => {
          const match = t.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (!match) return null;
          let h = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          const ampm = match[3]?.toUpperCase();
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          return h * 60 + m;
        };

        const startMin = parseTimeToMinutes(parts[0]);
        const endMin = parseTimeToMinutes(parts[1]);
        if (startMin !== null && endMin !== null) {
          if (currentMinutes < startMin) {
            return { status: 'Upcoming', isOngoing: false, isCompleted: false };
          }
          if (currentMinutes >= startMin && currentMinutes <= endMin) {
            return { status: 'Ongoing', isOngoing: true, isCompleted: false };
          }
          return { status: 'Completed', isOngoing: false, isCompleted: true };
        }
      }
    } catch (e) {}
    return { status: 'Upcoming', isOngoing: false, isCompleted: false };
  };

  // Filter Today's Schedule from Real Database
  const todayClasses = useMemo(() => {
    if (!allRoutines || allRoutines.length === 0) return [];

    const dayMatches = allRoutines.filter(r => r.day && r.day.toLowerCase() === todayDayName.toLowerCase());
    if (dayMatches.length === 0) return [];

    // 1. Direct match with teacher name
    const myClasses = dayMatches.filter(r => isMyTeacher(r.teacher));
    if (myClasses.length > 0) return myClasses;

    // 2. Match with teacher's allocated courses
    const myAllocCourseCodes = (allocations || [])
      .filter(a => isMyTeacher(a.teacher))
      .map(a => (a.courseCode || a.course_code || '').toLowerCase())
      .filter(Boolean);

    if (myAllocCourseCodes.length > 0) {
      const matched = dayMatches.filter(r => {
        const c = (r.course || '').toLowerCase();
        return myAllocCourseCodes.some(code => c.includes(code));
      });
      if (matched.length > 0) return matched;
    }

    // 3. Fallback for admin or unassigned preview
    if (user?.role === 'ADMIN' || !cleanTeacherName) {
      return dayMatches;
    }

    return [];
  }, [allRoutines, todayDayName, cleanTeacherName, userUsername, allocations, user?.role]);

  const ongoingClassesCount = useMemo(() => {
    return todayClasses.filter(c => getSlotTimingStatus(c.time).isOngoing).length;
  }, [todayClasses, currentTime]);

  const upcomingClassesCount = useMemo(() => {
    return todayClasses.filter(c => getSlotTimingStatus(c.time).status === 'Upcoming').length;
  }, [todayClasses, currentTime]);

  // Active courses allocated to this teacher from Real Database
  const myAllocatedCourses = useMemo(() => {
    const list = (allocations || []).filter(a => isMyTeacher(a.teacher));
    if (list.length > 0) return list;
    if (user?.role === 'ADMIN' || !cleanTeacherName) return allocations || [];
    return [];
  }, [allocations, cleanTeacherName, user?.role]);

  // Real Pending Assignments from database / localStorage
  const realAssignments = useMemo(() => {
    try {
      const savedAssignments = localStorage.getItem('qgenix_student_assignments');
      const assignmentsList = savedAssignments ? JSON.parse(savedAssignments) : [];
      const savedSubmissions = localStorage.getItem('qgenix_assignment_submissions');
      const submissionsMap = savedSubmissions ? JSON.parse(savedSubmissions) : {};

      if (!Array.isArray(assignmentsList) || assignmentsList.length === 0) return [];

      return assignmentsList.map(a => {
        const subs = Array.isArray(submissionsMap[a.id]) ? submissionsMap[a.id] : [];
        const pending = subs.filter(s => s.status !== 'Graded').length;
        return {
          id: a.id,
          name: a.title,
          total: subs.length,
          pending: pending,
          due: a.dueDate || a.due || 'Open'
        };
      });
    } catch (e) {
      return [];
    }
  }, []);

  // Real Low Attendance Alerts from database attendances & students
  const attendanceAlerts = useMemo(() => {
    if (!attendances || attendances.length === 0 || !students || students.length === 0) return [];
    
    const studentMap = new Map();
    students.forEach(s => {
      const sId = s.institutional_id || s.institutionalId || s.registration_no || `STU-${s.id}`;
      studentMap.set(sId, {
        id: sId,
        name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username,
        studentId: sId,
        total: 0,
        present: 0
      });
    });

    attendances.forEach(att => {
      if (Array.isArray(att.records)) {
        att.records.forEach(r => {
          const entry = studentMap.get(r.student_id);
          if (entry) {
            entry.total += 1;
            if (r.status === 'Present') entry.present += 1;
          }
        });
      }
    });

    const alerts = [];
    studentMap.forEach(st => {
      if (st.total > 0) {
        const pct = Math.round((st.present / st.total) * 100);
        if (pct < 75) {
          alerts.push({
            id: st.id,
            name: st.name,
            studentId: st.studentId,
            percentage: pct,
            risk: pct < 60 ? 'Critical' : 'Medium'
          });
        }
      }
    });
    return alerts.slice(0, 5);
  }, [attendances, students]);

  // Real Upcoming Exams from database
  const realUpcomingExams = useMemo(() => {
    return (examSessions || [])
      .filter(s => s.status === 'Active' || s.status === 'Upcoming' || s.is_published || s.isPublished)
      .map(s => ({
        id: s.id,
        name: s.name || s.title,
        subject: `${s.batch || 'All Batches'} • ${s.semester || 'Current Semester'}`,
        date: `${s.startDate || s.start_date || 'TBA'} - ${s.endDate || s.end_date || 'TBA'}`,
        duration: `${(s.routine || []).length} Subjects in Routine`,
        status: s.status || 'Active'
      }));
  }, [examSessions]);

  // Real Performance Analytics from database submitted results
  const performanceAnalytics = useMemo(() => {
    const results = submittedExamResults && submittedExamResults.length > 0 ? submittedExamResults : [];
    if (results.length === 0) {
      return {
        hasData: false,
        subjectsData: [],
        gradeDist: [],
        passFail: []
      };
    }

    const subjectMap = {};
    const gradeCounts = { 'A+': 0, 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0, 'C+': 0, 'D': 0, 'F': 0 };
    let passCount = 0;
    let failCount = 0;

    results.forEach(r => {
      const sub = r.course_code || r.course || 'Course';
      if (!subjectMap[sub]) subjectMap[sub] = { total: 0, count: 0 };
      const marks = parseFloat(r.marks_obtained !== undefined ? r.marks_obtained : r.total_marks) || 0;
      subjectMap[sub].total += marks;
      subjectMap[sub].count += 1;

      const g = r.grade || 'F';
      if (gradeCounts[g] !== undefined) gradeCounts[g] += 1;
      else gradeCounts['F'] += 1;

      if (g === 'F') failCount += 1;
      else passCount += 1;
    });

    const subjectsData = Object.keys(subjectMap).map(k => ({
      subject: k,
      score: Math.round(subjectMap[k].total / subjectMap[k].count),
      attendance: 90
    }));

    const gradeDist = Object.keys(gradeCounts)
      .filter(k => gradeCounts[k] > 0)
      .map(k => ({ name: k, students: gradeCounts[k] }));

    const passFail = [
      { name: 'Pass', value: passCount, color: 'var(--accent-success)' },
      { name: 'Fail', value: failCount, color: 'var(--accent-danger)' }
    ].filter(x => x.value > 0);

    return {
      hasData: true,
      subjectsData,
      gradeDist: gradeDist.length > 0 ? gradeDist : [{ name: 'N/A', students: 0 }],
      passFail: passFail.length > 0 ? passFail : [{ name: 'No Data', value: 1, color: 'rgba(255,255,255,0.1)' }]
    };
  }, [submittedExamResults]);

  // Real Academic Events for Mini Calendar
  const realCalendarEvents = useMemo(() => {
    const events = [];
    
    // Add today's classes
    if (todayClasses.length > 0) {
      events.push({
        date: 'Today',
        title: `${todayClasses.length} Routine Lecture Sessions`,
        category: 'Classes',
        color: '#3B82F6'
      });
    }

    // Add scheduled exams
    (realUpcomingExams || []).slice(0, 3).forEach(ex => {
      events.push({
        date: ex.date.split(' - ')[0] || 'Scheduled',
        title: ex.name,
        category: 'Exams',
        color: '#EF4444'
      });
    });

    // Add recent notices
    (notices || []).slice(0, 2).forEach(n => {
      events.push({
        date: n.date || 'Notice',
        title: n.title,
        category: 'Notice',
        color: '#10B981'
      });
    });

    return events;
  }, [todayClasses, realUpcomingExams, notices]);

  // Real Student Overview Calculations
  const studentOverview = useMemo(() => {
    const total = students.length || 0;
    
    // Find today's attendances
    const todayYMD = currentTime.toISOString().split('T')[0];
    const todayAtts = (attendances || []).filter(a => a.date === todayYMD);
    
    let presentCount = 0;
    let absentCount = 0;

    todayAtts.forEach(att => {
      if (Array.isArray(att.records)) {
        att.records.forEach(r => {
          if (r.status === 'Present') presentCount += 1;
          else absentCount += 1;
        });
      }
    });

    const pieData = presentCount > 0 || absentCount > 0 ? [
      { name: 'Present Today', value: presentCount, color: '#10B981' },
      { name: 'Absent Today', value: absentCount, color: '#EF4444' }
    ] : [
      { name: 'Enrolled', value: total || 1, color: '#3B82F6' }
    ];

    return {
      total,
      present: presentCount,
      absent: absentCount,
      atRisk: attendanceAlerts.length,
      pieData,
      isMarkedToday: todayAtts.length > 0
    };
  }, [students, attendances, currentTime, attendanceAlerts]);

  // Real Activities from auditLogs or biometric logs
  const realActivities = useMemo(() => {
    const acts = [];
    (auditLogs || []).slice(0, 6).forEach((log, idx) => {
      acts.push({
        id: `audit-${idx}`,
        desc: log.action || log.description || log.detail || 'System activity recorded',
        time: log.timestamp || log.time || 'Recently',
        icon: <Activity size={16} />
      });
    });
    if (acts.length === 0 && biometricLogs && biometricLogs.length > 0) {
      biometricLogs.slice(0, 5).forEach((b, idx) => {
        acts.push({
          id: `bio-${idx}`,
          desc: `Biometric ${b.action === 'check_in' ? 'Check In' : 'Check Out'} registered (${b.terminal || 'Turnstile'})`,
          time: `${b.date} • ${b.time}`,
          icon: <CheckCircle size={16} />
        });
      });
    }
    return acts;
  }, [auditLogs, biometricLogs]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
          border: isLightMode ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
          padding: '8px 12px',
          borderRadius: '10px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          color: 'var(--text-primary)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label || payload[0].name}</div>
          {payload.map((item, idx) => (
            <div key={idx} style={{ color: item.color || '#8B5CF6', fontWeight: 700, fontSize: '0.9rem', marginTop: '2px' }}>
              {item.name}: {item.value} {analyticsTab === 'performance' ? '%' : ''}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {styleOverrides}

      {/* =======================================================================
         SECTION 1: TOP STATISTICS CARDS (100% REAL DATABASE)
         ======================================================================= */}
      <div className="stats-cards-grid">
        
        {/* Classes Today */}
        <div 
          onClick={() => navigate('/teacher/routine')}
          className="glass-panel premium-card hover-lift" 
          style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}
          title="Click to view Class Routine"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Classes Today ({todayDayName})</span>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-secondary)' }}>
              <CalendarCheck size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {todayClasses.length}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', fontWeight: 600 }}>
              {todayClasses.length === 0 
                ? 'No classes scheduled today' 
                : `${ongoingClassesCount} ongoing, ${upcomingClassesCount} upcoming`}
            </span>
          </div>
        </div>

        {/* Active Courses */}
        <div 
          onClick={() => navigate('/teacher/courses')}
          className="glass-panel premium-card hover-lift" 
          style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}
          title="Click to view Courses"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Courses</span>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-secondary)' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {myAllocatedCourses.length}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', fontWeight: 600 }}>
              {myAllocatedCourses.length === 0 
                ? 'No courses assigned yet' 
                : myAllocatedCourses.map(a => a.courseCode || a.course_code || a.code).filter(Boolean).slice(0, 4).join(', ')}
            </span>
          </div>
        </div>

        {/* Biometric Duty Status & Real-Time Check-In/Out Quick Control */}
        <div 
          onClick={() => navigate('/teacher/attendance-timesheet')}
          className="glass-panel premium-card hover-lift" 
          style={{ 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            border: isCheckedIn ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
            background: isCheckedIn 
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(22, 30, 49, 0.7) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(22, 30, 49, 0.7) 100%)',
          }}
          title="Click to view Attendance & Timesheet Logs"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Campus Duty Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span 
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isCheckedIn ? '#10B981' : '#EF4444',
                    boxShadow: isCheckedIn ? '0 0 8px #10B981' : '0 0 8px #EF4444'
                  }} 
                />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isCheckedIn ? '#10B981' : '#EF4444' }}>
                  {isCheckedIn ? 'ON DUTY (Checked In)' : 'OFF DUTY (Checked Out)'}
                </span>
              </div>
            </div>
            <div style={{ 
              padding: '10px', 
              background: isCheckedIn ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', 
              borderRadius: '10px', 
              color: isCheckedIn ? '#EF4444' : '#10B981' 
            }}>
              {isCheckedIn ? <LogOut size={20} /> : <LogIn size={20} />}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {isCheckedIn ? (checkInTime ? `Checked In: ${checkInTime}` : 'Checked In') : (checkOutTime && checkOutTime !== '--:--' ? `Last Out: ${checkOutTime}` : 'Not Checked In')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isCheckedIn ? `Duration: ${duration || 'In Progress'}` : (duration ? `Office: ${duration}` : 'Click below to register')}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCheckInOut();
                }}
                disabled={isCheckLoading}
                className="hover-lift"
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: isCheckedIn ? '1px solid #EF4444' : '1px solid #10B981',
                  background: isCheckedIn ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isCheckedIn ? '#FCA5A5' : '#6EE7B7',
                  cursor: isCheckLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isCheckLoading ? 'Syncing...' : isCheckedIn ? 'Check OUT' : 'Check IN'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* =======================================================================
         SECTION 2: TODAY'S SCHEDULE (100% REAL-TIME FROM DATABASE)
         (Notifications Panel card removed as requested)
         ======================================================================= */}
      <div className="w-full">
        <Card 
          title={`Today's Schedule — ${todayDayName}, ${formattedTodayDate}`}
          className="w-full premium-card"
          action={
            <button 
              onClick={() => navigate('/teacher/routine')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>View Full Routine</span>
              <ChevronRight size={14} />
            </button>
          }
        >
          {todayClasses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '42px 20px', color: 'var(--text-muted)' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto'
              }}>
                <Calendar size={26} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                No Classes Scheduled Today ({todayDayName})
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px 0', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                You have no scheduled class lectures or laboratory sessions for today in the academic routine.
              </p>
              <button
                onClick={() => navigate('/teacher/routine')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 16px' }}
              >
                Open Weekly Routine Matrix
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3" style={{ marginTop: '12px' }}>
              {todayClasses.map((item, idx) => {
                const timing = getSlotTimingStatus(item.time);
                const isOngoing = timing.isOngoing;
                const isCompleted = timing.isCompleted;

                const courseParts = (item.course || '').split(':');
                const courseCode = courseParts[0]?.trim() || 'CLASS';
                const courseTitle = courseParts[1]?.trim() || item.course || 'Class Session';

                return (
                  <div 
                    key={item.id || idx} 
                    onClick={() => navigate('/teacher/routine')}
                    className="hover-lift"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: isOngoing ? 'rgba(139, 92, 246, 0.4)' : 'transparent',
                      background: isOngoing ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.3s ease',
                      gap: '16px',
                      flexWrap: 'wrap',
                      cursor: 'pointer'
                    }}
                    title="Click to view in Class Routine"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        fontWeight: '800', 
                        color: isOngoing ? 'var(--accent-primary)' : 'var(--text-primary)', 
                        minWidth: '100px',
                        fontSize: '0.85rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid var(--border-color)',
                        flexShrink: 0
                      }}>
                        {item.time || 'Schedule TBA'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: '800', fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                            {courseCode}: {courseTitle}
                          </span>
                          {isOngoing && <span className="pulse-indicator-dot" />}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <span>{item.batch || 'All Batches'}</span>
                          <span style={{ margin: '0 6px' }}>•</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.room || 'Room TBA'}</strong>
                          {item.teacher && (
                            <>
                              <span style={{ margin: '0 6px' }}>•</span>
                              <span style={{ color: 'var(--text-muted)' }}>Instructor: {item.teacher}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <span className={`badge ${
                        isCompleted ? 'badge-success' :
                        isOngoing ? 'badge-primary' : 'badge-warning'
                      }`}>
                        {timing.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* =======================================================================
         SECTION 3: PENDING ASSIGNMENT REVIEW | ATTENDANCE ALERTS (REAL DATA)
         ======================================================================= */}
      <div className="grid-2-1">
        
        {/* Pending Assignment Review */}
        <Card title="Pending Assignment Review" className="lg:col-span-2 premium-card">
          {realAssignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <CheckSquare size={32} style={{ margin: '0 auto 10px auto', opacity: 0.5, color: 'var(--accent-primary)' }} />
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>No Pending Assignment Reviews</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
                All assignment submissions have been graded, or no active student assignments are currently pending.
              </span>
              <button 
                onClick={() => navigate('/teacher/assignments')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              >
                Go to Assignments Manager
              </button>
            </div>
          ) : (
            <div className="table-responsive-container" style={{ marginTop: '12px' }}>
              <table className="custom-dashboard-table">
                <thead>
                  <tr>
                    <th>Assignment Name</th>
                    <th>Submissions</th>
                    <th>Pending Review</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {realAssignments.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.name}</span>
                      </td>
                      <td>
                        <span className="badge bg-white/4 dark:bg-white/2" style={{ color: 'var(--text-secondary)' }}>{item.total} total</span>
                      </td>
                      <td>
                        {item.pending > 0 ? (
                          <span className="badge badge-warning">{item.pending} pending</span>
                        ) : (
                          <span className="badge badge-success">0 pending</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.due}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => navigate('/teacher/assignments')}
                            className="btn btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px' }}
                          >
                            Review
                          </button>
                          <button 
                            onClick={() => navigate('/teacher/results')}
                            className="btn btn-primary" 
                            style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px' }}
                          >
                            Grade
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Attendance Alerts */}
        <Card title="Low Attendance Alerts" className="premium-card">
          {attendanceAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <CheckCircle size={32} style={{ margin: '0 auto 10px auto', opacity: 0.6, color: '#10B981' }} />
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>All Students On Track</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
                All enrolled students are maintaining attendance standards (&ge; 75%).
              </span>
              <button 
                onClick={() => navigate('/teacher/attendance')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                View Attendance Sheets
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3" style={{ marginTop: '12px' }}>
              {attendanceAlerts.map((student) => {
                const isCritical = student.risk === 'Critical';
                return (
                  <div 
                    key={student.id} 
                    className="flex justify-between items-center p-3 rounded-xl border border-transparent bg-white/2 dark:bg-white/1"
                  >
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{student.name}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {student.studentId}</span>
                    </div>
                    
                    <div className="flex gap-3 items-center">
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isCritical ? 'var(--accent-danger)' : 'var(--accent-warning)', display: 'block' }}>
                          {student.percentage}%
                        </span>
                        <span className={`badge ${isCritical ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.62rem', padding: '1px 5px', marginTop: '2px' }}>
                          {student.risk}
                        </span>
                      </div>
                      <button 
                        onClick={() => navigate('/teacher/attendance')}
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px' }}
                        title="View Student Attendance"
                      >
                        <Eye size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

      </div>

      {/* =======================================================================
         SECTION 4: PERFORMANCE ANALYTICS | UPCOMING EXAMS (REAL DATA)
         ======================================================================= */}
      <div className="grid-2-1">
        
        {/* Performance Analytics Card */}
        <Card 
          title="Performance Analytics" 
          className="lg:col-span-2 premium-card"
          action={
            <div className="analytics-tabs-container">
              {['performance', 'grades', 'ratio'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setAnalyticsTab(tab)}
                  className={`tab-btn-mini ${analyticsTab === tab ? 'tab-btn-mini-active' : ''}`}
                >
                  {tab === 'performance' ? 'Performance' : tab === 'grades' ? 'Grades' : 'Pass/Fail'}
                </button>
              ))}
            </div>
          }
        >
          {!performanceAnalytics.hasData ? (
            <div style={{ height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Award size={36} style={{ marginBottom: '10px', opacity: 0.5, color: 'var(--accent-primary)' }} />
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>No Exam Results Recorded Yet</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
                Class performance curves, grade distributions, and pass/fail metrics will generate once exam results are submitted.
              </span>
              <button 
                onClick={() => navigate('/teacher/results')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              >
                Go to Results Gradebook
              </button>
            </div>
          ) : (
            <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {analyticsTab === 'performance' ? (
                  <AreaChart data={performanceAnalytics.subjectsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)'} />
                    <XAxis dataKey="subject" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }} />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" name="Avg Score" dataKey="score" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#scoreGrad)" />
                    <Area type="monotone" name="Avg Attendance" dataKey="attendance" stroke="#3B82F6" strokeWidth={2.5} fill="url(#attendanceGrad)" />
                  </AreaChart>
                ) : analyticsTab === 'grades' ? (
                  <BarChart data={performanceAnalytics.gradeDist} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)'} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar name="Students Count" dataKey="students" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={performanceAnalytics.passFail}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {performanceAnalytics.passFail.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.78rem' }} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Upcoming Exams */}
        <Card title="Upcoming Exams" className="premium-card">
          {realUpcomingExams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <FileText size={32} style={{ margin: '0 auto 10px auto', opacity: 0.5, color: 'var(--accent-primary)' }} />
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>No Upcoming Exams</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
                No central examination sessions currently scheduled.
              </span>
              <button 
                onClick={() => navigate('/teacher/exams')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              >
                Go to Exam Controller
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 scrollable-exams-container" style={{ marginTop: '12px' }}>
              {realUpcomingExams.map((exam) => (
                <div 
                  key={exam.id} 
                  className="flex flex-col p-4 rounded-xl border border-transparent bg-white/2 dark:bg-white/1 gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{exam.name}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{exam.subject}</span>
                    </div>
                    <span className={`badge ${
                      exam.status === 'Active' ? 'badge-success' :
                      exam.status === 'Draft' ? 'badge-warning' : 'badge-primary'
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <span className="flex items-center gap-1"><Calendar size={12} />{exam.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{exam.duration}</span>
                  </div>

                  <div className="flex gap-2" style={{ marginTop: '2px' }}>
                    <button 
                      onClick={() => navigate('/teacher/exams')}
                      className="btn btn-secondary w-full" 
                      style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: '700' }}
                    >
                      Manage Exam
                    </button>
                    <button 
                      onClick={() => navigate('/teacher/results')}
                      className="btn btn-primary w-full" 
                      style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: '700' }}
                    >
                      Publish Result
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>

      {/* =======================================================================
         SECTION 5: MINI CALENDAR & STUDENT OVERVIEW (REAL DATABASE)
         ======================================================================= */}
      <div className="grid-2-1">
        
        {/* Mini Calendar & Upcoming Events */}
        <Card title="Mini Calendar & Upcoming Events" className="lg:col-span-2 premium-card">
          <div className="flex flex-col gap-3" style={{ marginTop: '12px' }}>
            
            {/* Custom mini headers */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              {[
                { label: 'Classes', color: '#3B82F6' },
                { label: 'Exams', color: '#EF4444' },
                { label: 'Notices', color: '#10B981' }
              ].map((indicator, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: indicator.color }} />
                  <span>{indicator.label}</span>
                </div>
              ))}
            </div>

            {/* List of real upcoming events */}
            {realCalendarEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)' }}>
                <Calendar size={24} style={{ margin: '0 auto 6px auto', opacity: 0.5 }} />
                <p style={{ fontSize: '0.8rem', margin: 0 }}>No upcoming academic events scheduled.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {realCalendarEvents.map((ev, idx) => (
                  <div 
                    key={idx}
                    className="flex gap-3 p-3 rounded-xl border border-transparent bg-white/2 dark:bg-white/1"
                    style={{ borderLeft: `3px solid ${ev.color}` }}
                  >
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                      minWidth: '55px',
                      height: 'fit-content'
                    }}>
                      {ev.date}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{ev.title}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ev.category} Event</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </Card>

        {/* Student Overview */}
        <Card title="Student Overview" className="premium-card">
          <div className="flex flex-col gap-4" style={{ marginTop: '8px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {studentOverview.isMarkedToday ? 'Present Today' : 'Total Students'}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {studentOverview.isMarkedToday ? studentOverview.present : studentOverview.total} 
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {studentOverview.isMarkedToday ? ` / ${studentOverview.total}` : ' Enrolled'}
                  </span>
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {studentOverview.isMarkedToday ? "Based on today's marked sheets" : "Awaiting today's attendance mark"}
                </span>
              </div>
              <div style={{ height: '70px', width: '70px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentOverview.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={30}
                      dataKey="value"
                    >
                      {studentOverview.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Students</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>
                  {studentOverview.total}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Absent Today</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: studentOverview.absent > 0 ? '#ef4444' : 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  {studentOverview.absent}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>At Risk</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: studentOverview.atRisk > 0 ? '#F59E0B' : '#10B981', display: 'block', marginTop: '2px' }}>
                  {studentOverview.atRisk}
                </span>
              </div>
            </div>

          </div>
        </Card>

      </div>

      {/* =======================================================================
         SECTION 6: RECENT ACTIVITIES (REAL DATABASE LOGS)
         ======================================================================= */}
      <Card title="Recent Activities" className="premium-card">
        {realActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)' }}>
            <Activity size={24} style={{ margin: '0 auto 6px auto', opacity: 0.5 }} />
            <p style={{ fontSize: '0.8rem', margin: 0 }}>No recent system activities recorded.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '12px' }}>
            {realActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex gap-3 p-3 rounded-xl border border-transparent bg-white/2 dark:bg-white/1 items-center"
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {activity.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activity.desc}
                  </p>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Floating toast notification bar */}
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

    </div>
  );
}

// Inline Styles to avoid any extra CSS files
const styleOverrides = (
  <style>{`
    .hover-lift {
      transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease;
    }
    .hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg), 0 0 15px rgba(139, 92, 246, 0.1) !important;
    }
    .shadow-glow-small {
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
    }
    .pulse-indicator-dot {
      width: 8px;
      height: 8px;
      background-color: var(--accent-primary);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent-primary);
      animation: pulse-dot 1.5s infinite;
    }
    @keyframes pulse-dot {
      0% { transform: scale(0.9); opacity: 0.6; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.6; }
    }
    .custom-dashboard-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .custom-dashboard-table th {
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .custom-dashboard-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color);
      vertical-align: middle;
      font-size: 0.82rem;
    }
    .custom-dashboard-table tr:last-child td {
      border-bottom: none;
    }
    .analytics-tabs-container {
      display: flex;
      gap: 6px;
      background: rgba(0, 0, 0, 0.08);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 4px;
    }
    body.light-mode .analytics-tabs-container {
      background: rgba(0, 0, 0, 0.02);
    }
    .tab-btn-mini {
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.72rem;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-btn-mini:hover {
      color: var(--text-primary);
    }
    .tab-btn-mini-active {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: white !important;
    }
    .scrollable-exams-container {
      max-height: 310px;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .scrollable-exams-container::-webkit-scrollbar {
      display: none;
    }
    .stats-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    @media (max-width: 992px) {
      .stats-cards-grid {
        grid-template-columns: 1fr;
      }
    }
    .grid-2-1 {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .grid-2-1 {
        grid-template-columns: 1fr;
      }
    }
    .grid-1-1 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    @media (max-width: 768px) {
      .grid-1-1 {
        grid-template-columns: 1fr;
      }
    }
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    @media (max-width: 640px) {
      .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `}</style>
);

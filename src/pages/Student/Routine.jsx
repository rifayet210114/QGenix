// ============================================================================
// Routine.jsx — QGenix Student Routine & Planner Component
// ============================================================================
// Comprehensive student academic planner. Features:
//   1. Routine Overview Dashboard (Summary Cards)
//   2. Weekly Timetable Layout (Sunday - Thursday, Color-coded, Live Highlighting)
//   3. Daily Schedule Planner (Status badges, Ongoing tracking)
//   4. Live Countdown Widget for Next Class (Real-time ticking interval)
//   5. Exam Routine Table (Search, Filter, Pagination, Status pills)
//   6. Interactive Monthly Event Calendar (June 2026, Color-coded indicators)
//   7. Detailed Class Drawer/Modal (Instructor details, credits, course materials download)
//   8. Attendance Tracker Integration (Progress bar, recharts area trend chart)
//   9. Notifications & Reminders Panel
//   10. PDF Downloads & Printing System (Weekly, Exams, Print layouts)
//   11. Smart Routine Assistant (Summaries, free time slots)
//
// Fully responsive on all device configurations (Mobile, Tablet, Desktop)
// with native support for QGenix Light/Dark themes.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, BookOpen, Calendar, Award, CheckCircle, FileText, 
  TrendingUp, Download, Printer, Users, Bell, Mail, FileUp, 
  Check, X, ChevronRight, HelpCircle, ShieldAlert, Sparkles, 
  ChevronLeft, Search, SlidersHorizontal, BookOpenCheck, Bookmark,
  AlertTriangle, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import Card from '../../components/Card';

// ----------------------------------------------------------------------------
// 1. MOCK DATA: STUDENT ROUTINE & EVENTS DATABASE
// ----------------------------------------------------------------------------

const coursesDetail = {
  'CSE-301': {
    name: 'Advanced Data Structures & Algorithms',
    code: 'CSE-301',
    instructor: 'Dr. Sarah Ahmed',
    email: 'sarah.ahmed@qgenix.edu',
    room: 'Room 302',
    credits: 4,
    schedule: 'Sundays & Tuesdays, 09:00 AM - 10:30 AM',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    materials: [
      { title: 'Lecture Notes: Dynamic Programming.pdf', size: '2.4 MB', type: 'pdf' },
      { title: 'Graph Traversal & BFS/DFS Slides.pdf', size: '3.1 MB', type: 'pdf' },
      { title: 'AVL Trees Practice Problems.pdf', size: '1.5 MB', type: 'pdf' }
    ],
    syllabus: [
      'Advanced Trees (Red-Black, AVL, B-Trees)',
      'Graph Algorithms (Shortest Path, Spanning Trees)',
      'Dynamic Programming & Greedy Strategies',
      'Complexity Theory & NP-Completeness Proofs'
    ]
  },
  'CSE-302': {
    name: 'Database Management Systems',
    code: 'CSE-302',
    instructor: 'Prof. M. Rahman',
    email: 'm.rahman@qgenix.edu',
    room: 'Room 405',
    credits: 3,
    schedule: 'Sundays, Tuesdays & Wednesdays, 10:30 AM - 12:00 PM',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    materials: [
      { title: 'Relational Schema Normalization.pdf', size: '1.8 MB', type: 'pdf' },
      { title: 'Indexing & B+ Trees Slides.pdf', size: '3.2 MB', type: 'pdf' },
      { title: 'SQL Joins Cheat Sheet.pdf', size: '820 KB', type: 'pdf' }
    ],
    syllabus: [
      'Relational Algebra & SQL Standards',
      'Database Schema Normalization (BCNF, 3NF)',
      'Transaction Isolation & Locking Protocols',
      'Distributed Databases & NoSQL Models'
    ]
  },
  'CSE-303': {
    name: 'Computer Networks & Protocol Design',
    code: 'CSE-303',
    instructor: 'Dr. Karim Al-Hasan',
    email: 'karim.alhasan@qgenix.edu',
    room: 'Room 101',
    credits: 4,
    schedule: 'Mondays & Wednesdays, 01:30 PM - 03:00 PM',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    materials: [
      { title: 'IP Routing & OSPF Slides.pdf', size: '4.5 MB', type: 'pdf' },
      { title: 'Socket API Quick Reference.pdf', size: '1.1 MB', type: 'pdf' },
      { title: 'TCP Flow Control & Congestion.pdf', size: '2.3 MB', type: 'pdf' }
    ],
    syllabus: [
      'Physical & Data Link Layer Fundamentals',
      'IP Addressing & Subnet Routing Protocols',
      'Transport Protocols (TCP Congestion Control)',
      'Socket Programming Interface (C/Python)'
    ]
  },
  'CSE-304': {
    name: 'Software Engineering & DevOps',
    code: 'CSE-304',
    instructor: 'Dr. Sarah Ahmed',
    email: 'sarah.ahmed@qgenix.edu',
    room: 'Room 204',
    credits: 3,
    schedule: 'Mondays & Wednesdays, 10:30 AM - 12:00 PM',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    materials: [
      { title: 'DevOps & Pipeline Overview.pdf', size: '6.7 MB', type: 'pdf' },
      { title: 'Agile Sprint Planning Template.pdf', size: '820 KB', type: 'pdf' },
      { title: 'Unit Testing & Mocking Guide.pdf', size: '1.4 MB', type: 'pdf' }
    ],
    syllabus: [
      'Agile Methodologies & Requirement Engineering',
      'Unit Testing & Mocking Frameworks',
      'Containerization (Docker Architecture)',
      'CI/CD Orchestration (GitHub Actions)'
    ]
  },
  'CSE-401': {
    name: 'Machine Learning & Neural Networks',
    code: 'CSE-401',
    instructor: 'Prof. Alex Mercer',
    email: 'alex.mercer@qgenix.edu',
    room: 'Room 502',
    credits: 4,
    schedule: 'Sundays & Tuesdays, 01:30 PM - 03:00 PM',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    materials: [
      { title: 'ML Mathematical Foundations.pdf', size: '3.5 MB', type: 'pdf' },
      { title: 'Linear Regression Worksheet.pdf', size: '1.2 MB', type: 'pdf' }
    ],
    syllabus: [
      'Linear Regression & Gradient Descent',
      'Deep Neural Net Backpropagation Math',
      'Convolutional Architectures (CNN)',
      'Transformer Networks & LLM Architectures'
    ]
  }
};

// Weekly Timetable Data Grid
const timetableGrid = {
  slots: [
    { id: 1, name: 'Slot 1', time: '09:00 AM - 10:30 AM' },
    { id: 2, name: 'Slot 2', time: '10:30 AM - 12:00 PM' },
    { id: 3, name: 'Slot 3', time: '01:30 PM - 03:00 PM' },
    { id: 4, name: 'Slot 4', time: '03:00 PM - 04:30 PM' }
  ],
  days: {
    Sunday: [
      { code: 'CSE-301', title: 'Algorithms', type: 'Lecture' },
      { code: 'CSE-302', title: 'DBMS', type: 'Lecture' },
      { code: 'CSE-401', title: 'Machine Learning', type: 'Lecture' },
      { code: null, title: 'Self Study / Library', type: 'Free' }
    ],
    Monday: [
      { code: 'CSE-303', title: 'Networks', type: 'Lecture' },
      { code: 'CSE-304', title: 'DevOps', type: 'Lecture' },
      { code: 'CSE-303', title: 'Networks Lab', type: 'Lab', isOngoing: true }, // Current active highlight
      { code: null, title: 'Project Discussion', type: 'Free' }
    ],
    Tuesday: [
      { code: 'CSE-301', title: 'Algorithms', type: 'Lecture' },
      { code: 'CSE-302', title: 'DBMS', type: 'Lecture' },
      { code: 'CSE-401', title: 'Machine Learning', type: 'Lecture' },
      { code: null, title: 'Self Study / Library', type: 'Free' }
    ],
    Wednesday: [
      { code: 'CSE-303', title: 'Networks', type: 'Lecture' },
      { code: 'CSE-304', title: 'DevOps', type: 'Lecture' },
      { code: 'CSE-302', title: 'DBMS Lab', type: 'Lab' },
      { code: null, title: 'Research Block', type: 'Free' }
    ],
    Thursday: [
      { code: 'CSE-301', title: 'Algorithms Lab', type: 'Lab' },
      { code: 'CSE-303', title: 'Networks Lab', type: 'Lab' },
      { code: null, title: 'Advisor Meet', type: 'Free' },
      { code: null, title: 'Self Study', type: 'Free' }
    ]
  }
};

// Daily schedule class list for "Today" (Simulating a Monday layout)
const dailySchedule = [
  {
    code: 'CSE-303',
    subject: 'Computer Networks & Protocol Design',
    instructor: 'Dr. Karim Al-Hasan',
    room: 'Room 101',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    duration: '1.5 Hours',
    status: 'Completed'
  },
  {
    code: 'CSE-304',
    subject: 'Software Engineering & DevOps',
    instructor: 'Dr. Sarah Ahmed',
    room: 'Room 204',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    duration: '1.5 Hours',
    status: 'Completed'
  },
  {
    code: 'CSE-303',
    subject: 'Computer Networks Lab: Sockets',
    instructor: 'Dr. Karim Al-Hasan',
    room: 'Room 101',
    startTime: '01:30 PM',
    endTime: '03:00 PM',
    duration: '1.5 Hours',
    status: 'Ongoing',
    isCurrent: true
  },
  {
    code: 'CSE-302',
    subject: 'Database Systems: ACID Transactions',
    instructor: 'Prof. M. Rahman',
    room: 'Room 405',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    duration: '1.5 Hours',
    status: 'Upcoming'
  }
];





// Calendar Events mapping for June 2026
const calendarEvents = {
  '2026-06-05': { type: 'class', title: 'Algorithms Lab', color: '#3B82F6' },
  '2026-06-10': { type: 'deadline', title: 'DBMS Project Submission', color: '#F59E0B' },
  '2026-06-15': { type: 'exam', title: 'DevOps Exam Viva', color: '#EF4444' },
  '2026-06-20': { type: 'exam', title: 'Networks Practical Viva', color: '#EF4444' },
  '2026-06-22': { type: 'deadline', title: 'Networks Socket Assignment', color: '#F59E0B' },
  '2026-06-25': { type: 'exam', title: 'Midterm Assessment (CSE-301)', color: '#EF4444' },
  '2026-06-26': { type: 'holiday', title: 'National Holiday (No Class)', color: '#10B981' },
  '2026-06-28': { type: 'exam', title: 'Final Semester Exam (CSE-302)', color: '#EF4444' }
};

// Monthly historical attendance rate for chart
const monthlyAttendanceHistory = [
  { month: 'Jan', rate: 82.5 },
  { month: 'Feb', rate: 84.0 },
  { month: 'Mar', rate: 86.8 },
  { month: 'Apr', rate: 83.2 },
  { month: 'May', rate: 85.0 }
];

// Active notifications for reminders
const initialNotifications = [
  { id: 1, text: 'Class starts in 30 minutes: Network Lab (Room 101).', type: 'warning', time: 'Just now' },
  { id: 2, text: 'Networks Practical Exam is scheduled for today at 02:00 PM.', type: 'danger', time: '10 min ago' },
  { id: 3, text: 'DevOps syllabus and routine files updated.', type: 'success', time: '2 hours ago' },
  { id: 4, text: 'National Holiday declared for Friday, June 26th.', type: 'info', time: '1 day ago' }
];

export default function Routine() {
  // Theme state sync
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Page level states
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'weekly' | 'exams' | 'attendance'
  const [selectedClass, setSelectedClass] = useState(null); // Detailed Class Modal drawer
  const [modalActiveTab, setModalActiveTab] = useState('resources'); // 'resources' | 'syllabus' inside Modal
  
  // Simulated Toast alerts
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Live ticking countdown timer state (2h 14m 35s = 8075 seconds)
  const [countdownSeconds, setCountdownSeconds] = useState(8075);
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 8075));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to the details card when a class is selected
  useEffect(() => {
    if (selectedClass) {
      const timer = setTimeout(() => {
        const element = document.getElementById('class-details-card');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedClass]);

  // Calendar States (June 2026 starts on Monday, 30 days)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-06-20'); // Default to Today
  const calendarCells = useMemo(() => {
    const days = [];
    // June 2026 starts on Monday (index 0). Layout is Mon-Sun
    for (let d = 1; d <= 30; d++) {
      const dateStr = `2026-06-${d < 10 ? '0' + d : d}`;
      const event = calendarEvents[dateStr] || null;
      days.push({ day: d, dateStr, event });
    }
    return days;
  }, []);



  // Notifications state
  const [notifications, setNotifications] = useState(initialNotifications);

  // Helper to format countdown seconds to hh:mm:ss
  const formatCountdown = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Helper trigger Toast feedback
  const triggerToast = (msg, type) => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulated download triggers
  const triggerDownloadRoutine = (name) => {
    setIsDownloading(true);
    setDownloadProgress(15);
    const progressTimer = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(progressTimer);
      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        triggerToast(`Successfully downloaded "${name}" PDF report!`, 'success');
      }, 300);
    }, 1200);
  };

  // Open Detailed class modal
  const openClassDetails = (code) => {
    if (coursesDetail[code]) {
      setSelectedClass(coursesDetail[code]);
      setModalActiveTab('resources');
    } else {
      triggerToast('Detailed syllabus info not available for self study blocks.', 'info');
    }
  };

  // Custom tooltips for rechart area
  const CustomAreaTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-recharts-tooltip">
          <div className="custom-recharts-tooltip-label">{payload[0].payload.month} 2026</div>
          <div style={{ color: '#8B5CF6', fontWeight: 800, fontSize: '0.9rem', marginTop: '4px' }}>
            Attendance: {payload[0].value.toFixed(1)}%
          </div>
        </div>
      );
    }
    return null;
  };

  // Calendar date details card computation
  const activeCalendarEvent = useMemo(() => {
    return calendarEvents[selectedCalendarDate] || null;
  }, [selectedCalendarDate]);

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* =======================================================================
         PAGE LOCAL LIQUID STYLES
         ======================================================================= */}
      <style>{`
        /* Hide scrollbars for Chrome, Safari, Edge, Firefox while keeping functionality */
        .scrollbar-hidden::-webkit-scrollbar {
          display: none !important;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none !important;  /* IE and Edge */
          scrollbar-width: none !important;  /* Firefox */
        }

        /* Timetable grid overrides for modern schedule mapping */
        .timetable-responsive-scroll {
          overflow-x: auto;
        }
        .timetable-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 8px;
          min-width: 800px;
        }
        .timetable-th {
          font-family: var(--font-heading);
          color: var(--text-secondary);
          font-weight: 700;
          padding: 12px;
          text-align: center;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 12px;
        }
        .timetable-td-time {
          width: 150px;
          font-weight: 700;
          text-align: center;
          padding: 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          color: var(--text-primary);
        }
        .timetable-card {
          padding: 14px;
          border-radius: 16px;
          border: 1px solid transparent;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: pointer;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 6px;
        }
        .timetable-card:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .timetable-card-free {
          background: rgba(255, 255, 255, 0.015);
          border: 1px dashed var(--border-color-light);
          color: var(--text-muted);
          cursor: default;
        }
        .timetable-card-free:hover {
          transform: none;
          box-shadow: none;
        }
        .timetable-card-highlight {
          animation: pulseBorder 2s infinite ease-in-out;
          border: 1.5px solid #8B5CF6 !important;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.25) !important;
        }
        @keyframes pulseBorder {
          0%, 100% { border-color: rgba(139, 92, 246, 0.3); box-shadow: 0 0 10px rgba(139, 92, 246, 0.15); }
          50% { border-color: rgba(139, 92, 246, 0.8); box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
        }

        /* Calendar grid definitions */
        .calendar-grid-layout {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        .calendar-cell-square {
          aspect-ratio: 1.1;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.01);
          position: relative;
        }
        .calendar-cell-square:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(139, 92, 246, 0.3);
        }
        .calendar-cell-selected {
          border-color: var(--accent-primary) !important;
          background: rgba(139, 92, 246, 0.08) !important;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.15);
        }

        /* Interactive list styles */
        .interactive-tab-bar {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
        }
        .tab-btn {
          padding: 8px 18px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.88rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .tab-btn-active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
        }
        body.light-mode .interactive-tab-bar {
          background: rgba(0,0,0,0.02);
        }

        /* Download/Print Toast banner overlay */
        .toast-loader-bar {
          height: 3px;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          transition: width 0.2s linear;
        }

        /* Hover micro-interactions for list items and upcoming classes */
        .hover-resource-row {
          background: rgba(255, 255, 255, 0.015) !important;
          border: 1px solid rgba(255, 255, 255, 0.04) !important;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }
        
        .hover-resource-row:hover {
          background: rgba(255, 255, 255, 0.045) !important;
          border-color: rgba(139, 92, 246, 0.35) !important;
          transform: translateY(-2px) scale(1.006) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(139, 92, 246, 0.08) !important;
        }

        body.light-mode .hover-resource-row {
          background: rgba(0, 0, 0, 0.01) !important;
          border: 1px solid rgba(0, 0, 0, 0.03) !important;
        }

        body.light-mode .hover-resource-row:hover {
          background: rgba(0, 0, 0, 0.02) !important;
          border-color: rgba(139, 92, 246, 0.35) !important;
          box-shadow: 0 8px 20px rgba(100, 160, 220, 0.06) !important;
        }

        /* Modal blur overlay and drawer details styles */
        .modal-blur-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(8, 12, 21, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 999;
          padding: 16px;
        }

        .glass-detail-modal {
          background: rgba(13, 20, 38, 0.9) !important;
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8) !important;
          border-radius: 24px !important;
          max-width: 650px !important;
          width: 100% !important;
          padding: 28px !important;
          max-height: 90vh !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
          overflow-y: auto !important;
        }

        body.light-mode .glass-detail-modal {
          background: rgba(255, 255, 255, 0.95) !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15) !important;
        }

        .btn-close-modal {
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: rgba(255, 255, 255, 0.8) !important;
          border-radius: 50% !important;
          width: 36px !important;
          height: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1) !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
          padding: 0 !important;
        }

        .btn-close-modal:hover {
          background: rgba(239, 68, 68, 0.2) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
          color: #ffffff !important;
          transform: rotate(90deg) scale(1.08) !important;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.3) !important;
        }

        body.light-mode .btn-close-modal {
          background: rgba(0, 0, 0, 0.05) !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          color: rgba(0, 0, 0, 0.6) !important;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05) !important;
        }

        body.light-mode .btn-close-modal:hover {
          background: rgba(239, 68, 68, 0.1) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
          color: #ef4444 !important;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.15) !important;
        }
      `}</style>

      {/* Floating accent background glows */}
      <div className="glow-orb-purple" style={{ top: '10%', left: '-10%', position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0) 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />
      <div className="glow-orb-blue" style={{ bottom: '15%', right: '-10%', position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* =======================================================================
         SECTION 1 — PAGE HEADER & GLOBAL EXPORT PANEL
         ======================================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 relative z-10">
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Routine & Academic Planner
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Coordinate classes, manage exam slots, trace attendance rates, and download reports
          </p>
        </div>

        {/* Global actions row (Download Routine) */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => triggerDownloadRoutine('Weekly Routine')}
            className="navbar-btn-hover flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              padding: '10px 18px',
              borderRadius: '14px',
              fontSize: '0.88rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <Download size={16} style={{ color: '#8B5CF6' }} />
            <span>Class Routin PDF</span>
          </button>
        </div>
      </div>

      {/* Floating Download Loader & Toasts */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel"
            style={{
              background: 'rgba(11, 17, 32, 0.85)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
              overflow: 'hidden',
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.15)',
              position: 'relative',
              zIndex: 1000
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={18} className="animate-spin text-purple-500" />
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Compiling schedule database and generating PDF layout...</span>
            </div>
            <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', height: '3px', borderRadius: '2px' }}>
              <div className="toast-loader-bar" style={{ width: `${downloadProgress}%` }} />
            </div>
          </motion.div>
        )}

        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel"
            style={{
              background: toastType === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: toastType === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.9rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
            }}
          >
            {toastType === 'success' ? (
              <CheckCircle size={18} style={{ color: '#10B981' }} />
            ) : (
              <AlertTriangle size={18} style={{ color: '#F59E0B' }} />
            )}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================================
         TAB NAVIGATOR (Dashboard, Weekly, Exams, Attendance/Calendar)
         ======================================================================= */}
      <div className="interactive-tab-bar relative z-10">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`tab-btn ${activeTab === 'dashboard' ? 'tab-btn-active' : ''}`}
        >
          Planner Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('weekly')} 
          className={`tab-btn ${activeTab === 'weekly' ? 'tab-btn-active' : ''}`}
        >
          Weekly Timetable
        </button>
      </div>

      {/* =======================================================================
         TAB VIEW CONTEXT: PLANNER DASHBOARD
         ======================================================================= */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 1. Summary Cards Overview (Routine Overview Dashboard) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Today's Classes</span>
                <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                  <Clock size={18} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>3 Sessions</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Next: CSE-303 (1:30 PM)
                </div>
              </div>
            </div>

            <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Upcoming Classes</span>
                <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                  <CheckCircle size={18} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>12 / 20</div>
                <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: '4px' }}>
                  8 Completed this week
                </div>
              </div>
            </div>

            <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weekly Lectures</span>
                <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                  <BookOpen size={18} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>20 Lectures</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Across 5 Enrolled Courses
                </div>
              </div>
            </div>

            <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Next Examination</span>
                <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                  <FileText size={18} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>June 25</div>
                <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600, marginTop: '4px' }}>
                  CSE-301 Midterm (5 days)
                </div>
              </div>
            </div>

            <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Attendance Status</span>
                <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>85.0%</div>
                <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: '4px' }}>
                  ✓ Above 75% limit
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Live Countdown & Smart Routine Assistant (Countdown Widget / Smart Routine Assistant) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-[1.2fr_1.8fr]">
            
            {/* Live Countdown Widget */}
            <div className="glass-panel premium-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(22, 30, 49, 0.6) 100%)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} style={{ color: '#8B5CF6' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Next Class Live Countdown</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#8B5CF6', fontWeight: 'bold' }}>
                    Database Systems: ACID Transactions
                  </span>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Instructor: Prof. M. Rahman • Room 405
                  </h4>
                </div>

                {/* Animated Clock Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 20px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                    <Clock size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Starts in</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                      {formatCountdown(countdownSeconds)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Routine Assistant */}
            <div className="glass-panel premium-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <BookOpenCheck size={20} style={{ color: '#3B82F6' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Smart Routine Assistant</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="sm:grid-cols-2">
                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Current Class</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>CSE-303 Network Lab</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Ongoing until 03:00 PM (Room 101)</span>
                </div>

                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Next Up</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>CSE-302 Database Systems</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Starts at 03:00 PM (Room 405)</span>
                </div>

                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Free Time Slots</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginTop: '6px' }}>
                    12:00 PM - 01:30 PM
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Lunch & Library study block</span>
                </div>

                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Today's Summary</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginTop: '6px' }}>
                    4 Lectures scheduled
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>2 completed • 1 live • 1 pending</span>
                </div>
              </div>
            </div>

          </div>

          {/* Row 3: Daily Schedule & Notifications (Daily Schedule / Notifications & Reminders) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-[1.8fr_1.2fr]">
            
            {/* Daily Schedule List */}
            <div className="glass-panel premium-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Today's Schedule Planner</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monday, June 20, 2026</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dailySchedule.map((cls, idx) => {
                  const statusColors = {
                    Completed: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
                    Ongoing: { text: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
                    Upcoming: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' }
                  };
                  const status = statusColors[cls.status] || { text: '#fff', bg: 'rgba(255,255,255,0.05)' };

                  return (
                    <div 
                      key={idx}
                      onClick={() => openClassDetails(cls.code)}
                      className={`hover-resource-row ${cls.isCurrent ? 'timetable-card-highlight' : ''}`}
                      style={{
                        padding: '16px',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#8B5CF6', fontWeight: 'bold' }}>{cls.code}</span>
                          <h4 style={{ margin: '2px 0 0 0', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{cls.subject}</h4>
                        </div>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          color: status.text,
                          background: status.bg
                        }}>
                          {cls.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <span>Room: <strong>{cls.room}</strong></span>
                          <span>Duration: {cls.duration}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                          <Clock size={12} />
                          <span>{cls.startTime} - {cls.endTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notifications & Reminders Panel */}
            <div className="glass-panel premium-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Bell size={20} style={{ color: '#F59E0B' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Notifications & Alerts</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((notif) => {
                  const alertStyles = {
                    danger: { bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(22, 30, 49, 0.6) 100%)', border: 'rgba(239, 68, 68, 0.2)', iconColor: '#EF4444', icon: <ShieldAlert size={16} /> },
                    warning: { bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(22, 30, 49, 0.6) 100%)', border: 'rgba(245, 158, 11, 0.2)', iconColor: '#F59E0B', icon: <AlertTriangle size={16} /> },
                    success: { bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(22, 30, 49, 0.6) 100%)', border: 'rgba(16, 185, 129, 0.2)', iconColor: '#10B981', icon: <CheckCircle size={16} /> },
                    info: { bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(22, 30, 49, 0.6) 100%)', border: 'rgba(59, 130, 246, 0.2)', iconColor: '#3B82F6', icon: <Bell size={16} /> }
                  };
                  const alert = alertStyles[notif.type] || alertStyles.info;

                  return (
                    <div 
                      key={notif.id}
                      style={{
                        background: alert.bg,
                        border: `1px solid ${alert.border}`,
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'start'
                      }}
                    >
                      <div style={{ color: alert.iconColor, marginTop: '2px', flexShrink: 0 }}>
                        {alert.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{notif.text}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{notif.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>



        </div>
      )}

      {/* =======================================================================
         TAB VIEW CONTEXT: WEEKLY TIMETABLE
         ======================================================================= */}
      {activeTab === 'weekly' && (
        <div className="glass-panel premium-card" style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Weekly Timetable Grid</h3>
              <p style={{ color: 'var(--text-muted)', margin: '2px 0 0 0', fontSize: '0.8rem' }}>
                Double click on a class block to examine study materials, schedules, and credits details.
              </p>
            </div>
            {/* Legend indicators */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
                <span>Algorithms</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
                <span>DBMS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                <span>Networks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EC4899' }} />
                <span>DevOps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                <span>Machine Learning</span>
              </div>
            </div>
          </div>

          <div className="timetable-responsive-scroll scrollbar-hidden">
            <table className="timetable-table">
              <thead>
                <tr>
                  <th style={{ width: '150px' }} className="timetable-th">Time Slots</th>
                  {Object.keys(timetableGrid.days).map((day, idx) => (
                    <th key={idx} className="timetable-th">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetableGrid.slots.map((slot, sIdx) => (
                  <tr key={sIdx}>
                    {/* Time Slot display */}
                    <td className="timetable-td-time">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.85rem' }}>{slot.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '500' }}>{slot.time}</span>
                      </div>
                    </td>

                    {/* Loop through each day for this slot */}
                    {Object.keys(timetableGrid.days).map((day, dIdx) => {
                      const cls = timetableGrid.days[day][sIdx];
                      const detail = cls && cls.code ? coursesDetail[cls.code] : null;

                      if (!cls || !cls.code) {
                        return (
                          <td key={dIdx}>
                            <div className="timetable-card timetable-card-free">
                              <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>{cls ? cls.title : 'Self Study'}</span>
                              <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>No Class Scheduled</span>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={dIdx}>
                          <div 
                            onClick={() => openClassDetails(cls.code)}
                            className={`timetable-card ${cls.isOngoing ? 'timetable-card-highlight' : ''}`}
                            style={{
                              background: detail ? detail.bgColor : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${detail ? detail.borderColor : 'var(--border-color)'}`,
                              color: 'var(--text-primary)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', width: '100%' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: detail ? detail.color : '#fff' }}>
                                {cls.code}
                              </span>
                              <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', fontWeight: '600' }}>
                                {cls.type}
                              </span>
                            </div>

                            <h4 style={{ margin: '4px 0', fontSize: '0.85rem', fontWeight: '700' }}>
                              {detail ? detail.name : cls.title}
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              <span>{detail ? detail.instructor : ''}</span>
                              <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Room: {detail ? detail.room : ''}</span>
                            </div>

                            {cls.isOngoing && (
                              <span style={{ 
                                fontSize: '0.62rem', 
                                background: '#8B5CF6', 
                                color: '#white', 
                                padding: '1px 6px', 
                                borderRadius: '4px', 
                                alignSelf: 'flex-start',
                                marginTop: '4px',
                                fontWeight: 'bold',
                                boxShadow: '0 0 8px #8B5CF6'
                              }}>
                                ONGOING
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}





      {/* =======================================================================
         CLASS DETAILS MODAL COMPONENT (Class Details Page / Modal)
         ======================================================================= */}
      <AnimatePresence>
        {selectedClass && (
          <div id="class-details-card" className="modal-blur-overlay" onClick={() => setSelectedClass(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel glass-detail-modal"
              style={{
                width: '100%',
                maxWidth: '650px',
                background: 'rgba(11, 17, 32, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                borderRadius: '24px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Header Title row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#8B5CF6', fontWeight: 'bold' }}>
                    {selectedClass.code} — {selectedClass.credits} Credits
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedClass.name}
                  </h3>
                </div>
                <button onClick={() => setSelectedClass(null)} className="btn-close-modal">
                  <X size={18} />
                </button>
              </div>

              {/* Teacher Info Card */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justify: 'center', color: '#8B5CF6', fontWeight: 'bold' }}>
                  {selectedClass.instructor.split(' ').pop().charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedClass.instructor}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <Mail size={12} />
                    <span>{selectedClass.email}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>{selectedClass.room}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Location</span>
                </div>
              </div>

              {/* Sub-tabs navigator */}
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '4px' }}>
                <button 
                  onClick={() => setModalActiveTab('resources')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: 'none',
                    background: modalActiveTab === 'resources' ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                    color: modalActiveTab === 'resources' ? '#c084fc' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Course Materials
                </button>
                <button 
                  onClick={() => setModalActiveTab('syllabus')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: 'none',
                    background: modalActiveTab === 'syllabus' ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                    color: modalActiveTab === 'syllabus' ? '#c084fc' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Syllabus Syllabus
                </button>
              </div>

              {/* Tab Contents */}
              <div style={{ minHeight: '180px', maxHeight: '300px', overflowY: 'auto', overflowX: 'hidden' }} className="scrollbar-hidden">
                {modalActiveTab === 'resources' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedClass.materials.map((mat, idx) => (
                      <div 
                        key={idx}
                        className="hover-resource-row"
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FileText size={18} style={{ color: '#8B5CF6' }} />
                          <div>
                            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>{mat.title}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Size: {mat.size}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => triggerToast(`Simulating download for "${mat.title}"`, 'success')}
                          className="btn-resource-action"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.72rem',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={12} />
                          <span>Get</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedClass.syllabus.map((topic, idx) => (
                      <div 
                        key={idx}
                        style={{
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <Bookmark size={16} style={{ color: '#3B82F6' }} />
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                          {topic}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer row */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setSelectedClass(null)}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: '600'
                  }}
                >
                  Close Details
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

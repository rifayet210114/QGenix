// ============================================================================
// Routine.jsx — QGenix Teacher Routine & Schedule Planner Page
// ============================================================================
// Features:
//   1. Routine Summary Panel: Weekly teaching hours, daily slots, batches.
//   2. Next Session Ticker: Interactive countdown to the next class slot.
//   3. Weekly Routine Matrix: Sunday - Thursday grid. Highlights the teacher's
//      assigned courses (CSE-301, CSE-302, etc.) and mutes other slots.
//   4. Current Session Glow: Highlighting of ongoing classes with a pulse effect.
//   5. Active Filters: Toggle "Show Taught Classes Only" vs "Show All Department Routine".
//   6. Interactive Class Details Modal: Instructor agenda, batch info, room number,
//      attendance status, syllabus tracking, and quick links.
//   7. PDF & Printing integration.
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষকের ক্লাস রুটিন ভিউয়ার। শিক্ষক তার নিজের ক্লাসগুলোর সময়সূচী ও শিডিউল
// রুটিনে হাইলাইটেড অবস্থায় দেখতে পাবেন এবং বিস্তারিত ভিউ ও প্রিন্ট করতে পারবেন।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, BookOpen, Calendar, Award, CheckCircle, FileText, 
  Download, Printer, Users, Bell, ChevronRight, HelpCircle, 
  ShieldAlert, Sparkles, Search, SlidersHorizontal, BookOpenCheck,
  Bookmark, AlertTriangle, RefreshCw, Eye, BookMarked, UserCheck, X
} from 'lucide-react';
import Card from '../../components/Card';

// ----------------------------------------------------------------------------
// 1. MOCK DATA: TEACHER ASSIGNED COURSES & SCHEDULE MATRIX
// ----------------------------------------------------------------------------

const teacherProfile = {
  name: 'Dr. Sarah Ahmed',
  email: 'sarah.ahmed@qgenix.edu',
  role: 'Associate Professor, CSE',
  room: 'Faculty Block B, Room 408'
};

const coursesDetailMap = {
  'CSE-301': {
    name: 'Advanced Data Structures & Algorithms',
    room: 'Room 302',
    batch: 'Batch 21 (5th Sem)',
    credits: 4,
    students: 45,
    syllabusProgress: 75,
    syllabus: [
      'Advanced Trees (Red-Black, AVL, B-Trees) - Completed',
      'Graph Algorithms (Shortest Path, Spanning Trees) - Completed',
      'Dynamic Programming & Greedy Strategies - Ongoing',
      'Complexity Theory & NP-Completeness Proofs - Upcoming'
    ],
    materials: [
      { title: 'Lecture Notes: Dynamic Programming.pdf', size: '2.4 MB' },
      { title: 'Graph Traversal & BFS/DFS Slides.pdf', size: '3.1 MB' }
    ]
  },
  'CSE-302': {
    name: 'Database Management Systems',
    room: 'Room 405',
    batch: 'Batch 21 (5th Sem)',
    credits: 3,
    students: 42,
    syllabusProgress: 60,
    syllabus: [
      'Relational Algebra & SQL Standards - Completed',
      'Database Schema Normalization - Completed',
      'Transaction Isolation & Locking - Ongoing',
      'Distributed Databases & NoSQL Models - Upcoming'
    ],
    materials: [
      { title: 'Relational Schema Normalization.pdf', size: '1.8 MB' },
      { title: 'Indexing & B+ Trees Slides.pdf', size: '3.2 MB' }
    ]
  },
  'CSE-303': {
    name: 'Computer Networks & Protocol Design',
    room: 'Room 101',
    batch: 'Batch 21 (5th Sem)',
    credits: 4,
    students: 38,
    syllabusProgress: 80,
    syllabus: [
      'Physical & Data Link Layers - Completed',
      'IP Addressing & Subnet Routing - Completed',
      'Transport Protocols (TCP Congestion) - Ongoing',
      'Socket Programming Interface - Upcoming'
    ],
    materials: [
      { title: 'IP Routing & OSPF Slides.pdf', size: '4.5 MB' },
      { title: 'Socket API Quick Reference.pdf', size: '1.1 MB' }
    ]
  },
  'CSE-304': {
    name: 'Software Engineering & DevOps',
    room: 'Room 204',
    batch: 'Batch 20 (6th Sem)',
    credits: 3,
    students: 48,
    syllabusProgress: 50,
    syllabus: [
      'Agile Methodologies & Requirements - Completed',
      'Unit Testing & Mocking Frameworks - Completed',
      'Containerization (Docker Architecture) - Ongoing',
      'CI/CD Orchestration (GitHub Actions) - Upcoming'
    ],
    materials: [
      { title: 'DevOps & Pipeline Overview.pdf', size: '6.7 MB' },
      { title: 'Unit Testing Guide.pdf', size: '1.4 MB' }
    ]
  }
};

// Weekly Timetable Data Grid (Sunday - Thursday)
const teacherTimetableGrid = {
  slots: [
    { id: 1, name: 'Slot 1', time: '09:00 AM - 10:30 AM' },
    { id: 2, name: 'Slot 2', time: '10:30 AM - 12:00 PM' },
    { id: 3, name: 'Slot 3', time: '01:30 PM - 03:00 PM' },
    { id: 4, name: 'Slot 4', time: '03:00 PM - 04:30 PM' }
  ],
  days: {
    Sunday: [
      { code: 'CSE-301', title: 'Algorithms', type: 'Lecture', room: 'Room 302', batch: 'Batch 21', isTaughtByMe: true },
      { code: 'CSE-302', title: 'DBMS', type: 'Lecture', room: 'Room 405', batch: 'Batch 21', isTaughtByMe: true },
      { code: 'CSE-401', title: 'Machine Learning', type: 'Lecture', room: 'Room 502', batch: 'Batch 20', isTaughtByMe: false },
      { code: null, title: 'Office / Counseling Hours', type: 'Office', room: 'Office B408', batch: '-', isTaughtByMe: true }
    ],
    Monday: [
      { code: 'CSE-303', title: 'Networks', type: 'Lecture', room: 'Room 101', batch: 'Batch 21', isTaughtByMe: true },
      { code: 'CSE-304', title: 'DevOps', type: 'Lecture', room: 'Room 204', batch: 'Batch 20', isTaughtByMe: true },
      { code: 'CSE-303', title: 'Networks Lab', type: 'Lab', room: 'Lab 2', batch: 'Batch 21', isTaughtByMe: true, isOngoing: true }, // Highlight ongoing class
      { code: null, title: 'Faculty Board Meeting', type: 'Meeting', room: 'Seminar Hall', batch: '-', isTaughtByMe: false }
    ],
    Tuesday: [
      { code: 'CSE-301', title: 'Algorithms', type: 'Lecture', room: 'Room 302', batch: 'Batch 21', isTaughtByMe: true },
      { code: 'CSE-302', title: 'DBMS', type: 'Lecture', room: 'Room 405', batch: 'Batch 21', isTaughtByMe: true },
      { code: 'CSE-401', title: 'Machine Learning', type: 'Lecture', room: 'Room 502', batch: 'Batch 20', isTaughtByMe: false },
      { code: null, title: 'Research & Review block', type: 'Free', room: 'Lab 1', batch: '-', isTaughtByMe: false }
    ],
    Wednesday: [
      { code: 'CSE-303', title: 'Networks', type: 'Lecture', room: 'Room 101', batch: 'Batch 21', isTaughtByMe: true },
      { code: 'CSE-304', title: 'DevOps', type: 'Lecture', room: 'Room 204', batch: 'Batch 20', isTaughtByMe: true },
      { code: 'CSE-302', title: 'DBMS Lab', type: 'Lab', room: 'Lab 1', batch: 'Batch 21', isTaughtByMe: true },
      { code: null, title: 'Department Seminar', type: 'Seminar', room: 'Auditorium', batch: '-', isTaughtByMe: false }
    ],
    Thursday: [
      { code: 'CSE-301', title: 'Algorithms Lab', type: 'Lab', room: 'Lab 3', batch: 'Batch 21', isTaughtByMe: true },
      { code: 'CSE-303', title: 'Networks Lab', type: 'Lab', room: 'Lab 2', batch: 'Batch 21', isTaughtByMe: true },
      { code: null, title: 'Academic Advising', type: 'Office', room: 'Office B408', batch: '-', isTaughtByMe: true },
      { code: null, title: 'Self Planning Block', type: 'Free', room: '-', batch: '-', isTaughtByMe: false }
    ]
  }
};

const dailySchedule = [
  {
    code: 'CSE-303',
    subject: 'Computer Networks & Protocol Design',
    batch: 'Batch 21 (5th Sem)',
    room: 'Room 101',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    duration: '1.5 Hours',
    status: 'Completed',
    isTaughtByMe: true
  },
  {
    code: 'CSE-304',
    subject: 'Software Engineering & DevOps',
    batch: 'Batch 20 (6th Sem)',
    room: 'Room 204',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    duration: '1.5 Hours',
    status: 'Completed',
    isTaughtByMe: true
  },
  {
    code: 'CSE-303',
    subject: 'Computer Networks Lab: Sockets',
    batch: 'Batch 21 (5th Sem)',
    room: 'Lab 2',
    startTime: '01:30 PM',
    endTime: '03:00 PM',
    duration: '1.5 Hours',
    status: 'Ongoing',
    isCurrent: true,
    isTaughtByMe: true
  },
  {
    code: 'CSE-302',
    subject: 'Database Systems: ACID Transactions',
    batch: 'Batch 21 (5th Sem)',
    room: 'Room 405',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    duration: '1.5 Hours',
    status: 'Upcoming',
    isTaughtByMe: true
  }
];

export default function TeacherRoutine() {
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'today'
  const [selectedClass, setSelectedClass] = useState(null);
  const [showTaughtOnly, setShowTaughtOnly] = useState(true);

  // Reminders / alerts state
  const [toastMessage, setToastMessage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Countdown timer for next class: CSE-302 DBMS at 3:00 PM
  const [countdownSeconds, setCountdownSeconds] = useState(8075);
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 8075));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const triggerDownloadPDF = () => {
    setIsDownloading(true);
    setDownloadProgress(15);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        triggerToast('Successfully compiled & downloaded Weekly Routine PDF!');
      }, 300);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  // Open class details modal/drawer
  const openClassDetails = (slotItem) => {
    if (slotItem.code && coursesDetailMap[slotItem.code]) {
      setSelectedClass({
        ...coursesDetailMap[slotItem.code],
        code: slotItem.code,
        type: slotItem.type,
        room: slotItem.room || coursesDetailMap[slotItem.code].room
      });
    } else if (slotItem.type === 'Office') {
      setSelectedClass({
        name: 'Academic Advising & Office Hours',
        code: 'Office',
        type: 'Office Hours',
        room: 'Office B408',
        batch: 'Open to all students',
        credits: 0,
        students: 'Varies',
        syllabusProgress: 100,
        syllabus: [
          'Consultations on dynamic programming algorithms',
          'DBMS Normalization support sessions',
          'Term project review & advisory'
        ],
        materials: []
      });
    } else {
      triggerToast('Detailed syllabus info not configured for this department block.');
    }
  };

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* Page Inline CSS */}
      <style>{`
        .glass-card-routine {
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

        .glass-card-routine:hover {
          transform: translateY(-2px) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 25px -5px     rgba(139, 92, 246, 0.15) !important;
        }

        body.light-mode .glass-card-routine {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .glass-card-routine:hover {
          background: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 12px 40px -10px rgba(100, 160, 220, 0.2) !important;
        }

        .routine-grid-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 8px;
          min-width: 900px;
        }

        .routine-th {
          font-weight: bold;
          font-size: 0.85rem;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }
        body.light-mode .routine-th {
          background: rgba(0, 0, 0, 0.015);
        }

        .time-slot-column {
          width: 150px;
          font-weight: 700;
          text-align: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          color: var(--text-primary);
          font-size: 0.82rem;
        }

        .timetable-cell-card {
          padding: 14px;
          border-radius: 16px;
          border: 1px solid transparent;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: pointer;
          min-height: 90px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
        }
        .timetable-cell-card:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }

        .cell-taught-me {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.12) 100%);
          border: 1px solid rgba(139, 92, 246, 0.35);
          box-shadow: inset 0 0 10px rgba(139, 92, 246, 0.05);
        }

        .cell-other-instructor {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color-light);
          opacity: 0.35;
          cursor: not-allowed;
        }

        .cell-free-block {
          background: transparent;
          border: 1px dashed var(--border-color-light);
          color: var(--text-muted);
          cursor: default;
        }
        .cell-free-block:hover {
          transform: none;
          box-shadow: none;
        }

        .cell-ongoing-highlight {
          animation: pulseBorderRoutine 2s infinite ease-in-out;
          border: 1.5px solid #8B5CF6 !important;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.35) !important;
        }
        @keyframes pulseBorderRoutine {
          0%, 100% { border-color: rgba(139, 92, 246, 0.3); box-shadow: 0 0 10px rgba(139, 92, 246, 0.15); }
          50% { border-color: rgba(139, 92, 246, 0.9); box-shadow: 0 0 25px rgba(139, 92, 246, 0.45); }
        }

        .tabs-routine-bar {
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
        }
        body.light-mode .tabs-routine-bar {
          background: rgba(0, 0, 0, 0.02);
        }

        .tab-routine-btn {
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
        .tab-routine-btn:hover {
          color: var(--text-primary);
        }
        .tab-routine-btn-active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
        }

        .routine-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(3, 7, 18, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .routine-modal-card {
          width: 100%;
          max-width: 600px;
          max-height: 85vh;
          overflow-y: auto;
          background: linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.95) 0%,
            rgba(10, 15, 30, 0.98) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 
                      0 0 40px rgba(139, 92, 246, 0.15);
          padding: 28px;
          position: relative;
        }
        body.light-mode .routine-modal-card {
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* Glowing Accents */}
      <div className="glow-orb-results-1" style={{ top: '10%', left: '-5%', position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div className="glow-orb-results-2" style={{ bottom: '15%', right: '-5%', position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0) 70%)', filter: 'blur(55px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER & EXPORTS
         ======================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <Clock className="text-violet-500" size={32} />
            Academic Class Routine
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Indicate teaching slots, trace upcoming lecture intervals, and retrieve course progress stats.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={triggerDownloadPDF}
            className="navbar-btn-hover flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <Download size={14} style={{ color: '#8B5CF6' }} />
            <span>Routine PDF</span>
          </button>
          
          <button 
            onClick={handlePrint}
            className="navbar-btn-hover flex items-center gap-2"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <Printer size={14} />
            <span>Print Routine</span>
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
            className="glass-card-routine"
            style={{
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
              <div style={{ width: `${downloadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', transition: 'width 0.2s linear' }} />
            </div>
          </motion.div>
        )}

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
            <CheckCircle size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================================
         SECTION 2: SUMMARY COUNTERS & REAL-TIME TIMER
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Next Class Ticker */}
        <div className="glass-card-routine" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Next Teaching Session Countdown</span>
            <div style={{ padding: '6px 12px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', fontSize: '0.72rem', fontWeight: 'bold' }} className="flex items-center gap-1">
              <Sparkles size={12} />
              <span>DBMS: Room 405</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }} className="text-violet-400">
                {formatCountdown(countdownSeconds)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                Starts at 03:00 PM with Batch 21. Topic: ACID Database Transactions
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
              ✓ Ongoing Session Active (CSE-303 Lab)
            </span>
          </div>
        </div>

        {/* Weekly Load */}
        <div className="glass-card-routine" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Weekly Lectures Load</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              15 Hours
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Spread across 4 active courses
            </span>
          </div>
        </div>

        {/* Rooms Assigned */}
        <div className="glass-card-routine" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>My Assigned Labs & Rooms</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)', fontFamily: 'var(--font-heading)' }}>
              5 Spaces
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Primary: Room 302 & Lab 2
            </span>
          </div>
        </div>

      </div>

      {/* =======================================================================
         SECTION 3: NAVIGATION TABS & FILTERS
         ======================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
        
        <div className="tabs-routine-bar">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`tab-routine-btn ${activeTab === 'weekly' ? 'tab-routine-btn-active' : ''}`}
          >
            Weekly Schedule Grid
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`tab-routine-btn ${activeTab === 'today' ? 'tab-routine-btn-active' : ''}`}
          >
            Today's Timeline
          </button>
        </div>

        {/* Filters */}
        {activeTab === 'weekly' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter:</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showTaughtOnly}
                onChange={(e) => setShowTaughtOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
              />
              <span>My Classes Only</span>
            </label>
          </div>
        )}
      </div>

      {/* =======================================================================
         SECTION 4: WEEKLY ROUTINE MATRIX
         ======================================================================= */}
      <AnimatePresence mode="wait">
        
        {activeTab === 'weekly' && (
          <motion.div
            key="weekly-routine-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <Card className="glass-card-routine" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="routine-grid-table">
                  <thead>
                    <tr>
                      <th className="routine-th" style={{ width: '140px', paddingLeft: '20px' }}>Slot Time</th>
                      <th className="routine-th">Sunday</th>
                      <th className="routine-th">Monday</th>
                      <th className="routine-th">Tuesday</th>
                      <th className="routine-th">Wednesday</th>
                      <th className="routine-th" style={{ paddingRight: '20px' }}>Thursday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherTimetableGrid.slots.map((slot, sIdx) => (
                      <tr key={slot.id}>
                        {/* Time Slot column */}
                        <td className="time-slot-column">
                          <div style={{ fontWeight: 'bold' }}>{slot.name}</div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            {slot.time}
                          </span>
                        </td>

                        {/* Days column values */}
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map(day => {
                          const slotItem = teacherTimetableGrid.days[day][sIdx];
                          const isTaught = slotItem.isTaughtByMe;
                          const code = slotItem.code;

                          // Filtering view based on checkbox
                          if (showTaughtOnly && !isTaught && code !== null) {
                            return (
                              <td key={day} style={{ padding: '4px' }}>
                                <div className="timetable-cell-card cell-other-instructor" style={{ opacity: 0.15 }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Other class</div>
                                </div>
                              </td>
                            );
                          }

                          // If slot is free
                          if (code === null && !isTaught) {
                            return (
                              <td key={day} style={{ padding: '4px' }}>
                                <div className="timetable-cell-card cell-free-block">
                                  <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>{slotItem.title}</div>
                                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{slotItem.room}</span>
                                </div>
                              </td>
                            );
                          }

                          // If slot is taught by teacher or custom office hours
                          return (
                            <td key={day} style={{ padding: '4px' }}>
                              <div 
                                onClick={() => openClassDetails(slotItem)}
                                className={`timetable-cell-card ${isTaught ? 'cell-taught-me' : 'cell-other-instructor'} ${slotItem.isOngoing ? 'cell-ongoing-highlight' : ''}`}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isTaught ? '#8B5CF6' : 'var(--text-muted)' }}>
                                    {code || 'OFFICE'}
                                  </span>
                                  {isTaught && (
                                    <span style={{ fontSize: '0.62rem', fontWeight: 900, background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-primary)', padding: '1px 6px', borderRadius: '4px' }}>
                                      {slotItem.type}
                                    </span>
                                  )}
                                </div>

                                <div style={{ margin: '6px 0' }}>
                                  <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {slotItem.title}
                                  </div>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    {slotItem.batch === '-' ? 'Consultation' : slotItem.batch}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                  <span>{slotItem.room}</span>
                                  {slotItem.isOngoing && (
                                    <span style={{ color: '#10B981', animation: 'pulse 1.5s infinite' }} className="flex items-center gap-1">
                                      ● Ongoing
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* =======================================================================
           SECTION 5: TODAY'S TIMELINE VIEW
           ======================================================================= */}
        {activeTab === 'today' && (
          <motion.div
            key="today-timeline-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}
          >
            <Card title="Today's Timetable Flow (Monday Layout)" className="glass-card-routine" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', paddingLeft: '24px', borderLeft: '1px solid var(--border-color)', marginLeft: '12px', marginTop: '16px' }}>
                
                {dailySchedule.map((session, index) => (
                  <div 
                    key={index}
                    style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' }}
                  >
                    {/* Timeline bullet */}
                    <div style={{
                      position: 'absolute',
                      left: '-31px',
                      top: '4px',
                      width: '13px',
                      height: '13px',
                      borderRadius: '50%',
                      background: session.isCurrent ? '#8B5CF6' : (session.status === 'Completed' ? 'var(--accent-success)' : 'var(--border-color)'),
                      border: '3px solid var(--bg-primary)',
                      boxShadow: session.isCurrent ? '0 0 10px rgba(139, 92, 246, 0.6)' : 'none'
                    }} />

                    {/* Class card content */}
                    <div 
                      onClick={() => openClassDetails(session)}
                      className="glass-card-routine hover-resource-row" 
                      style={{ padding: '16px', borderRadius: '14px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                            {session.code}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{session.startTime} - {session.endTime}</span>
                        </div>
                        
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: session.isCurrent ? 'rgba(139, 92, 246, 0.15)' : (session.status === 'Completed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)'),
                          color: session.isCurrent ? 'var(--accent-primary)' : (session.status === 'Completed' ? 'var(--accent-success)' : 'var(--text-secondary)')
                        }}>
                          {session.status}
                        </span>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{session.subject}</h4>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <span>Target: {session.batch}</span>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                          <span>Venue: {session.room}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>

      {/* =======================================================================
         SECTION 6: INTERACTIVE CLASS DETAILS DRAWER/MODAL
         ======================================================================= */}
      <AnimatePresence>
        {selectedClass && (
          <div 
            className="routine-modal-overlay"
            onClick={() => setSelectedClass(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="routine-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
                      <BookOpenCheck size={16} />
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Class Session Profile</span>
                  </div>
                  <h2 style={{ margin: '8px 0 2px 0', color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                    {selectedClass.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: '#8B5CF6' }}>Code: {selectedClass.code}</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                    <span>Room: {selectedClass.room}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedClass(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="hover:bg-red-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Class Details Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Credits</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {selectedClass.credits} Credits
                  </div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Students Enrolled</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {selectedClass.students} Candidates
                  </div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Syllabus Covered</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-success)', marginTop: '2px' }}>
                    {selectedClass.syllabusProgress}%
                  </div>
                </div>
              </div>

              {/* Target Batch Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TARGET COHORT</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{selectedClass.batch}</div>
              </div>

              {/* Syllabus Agenda Outline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Syllabus Course Outline</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedClass.syllabus && selectedClass.syllabus.map((item, index) => (
                    <div 
                      key={index}
                      style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}
                    >
                      <span className="text-violet-400">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Materials */}
              {selectedClass.materials && selectedClass.materials.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }} className="flex items-center gap-1">
                    <BookMarked size={14} className="text-violet-400" />
                    <span>Uploaded Resources / Lecture Material</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedClass.materials.map((file, idx) => (
                      <div 
                        key={idx}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.78rem' }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.title}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{file.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal footer controls */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '0.82rem' }}
                >
                  Close
                </button>
                
                {selectedClass.code !== 'Office' && (
                  <button
                    onClick={() => {
                      setSelectedClass(null);
                      triggerToast(`Loading classroom manager for ${selectedClass.code}...`);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <UserCheck size={14} />
                    <span>Mark Attendance</span>
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

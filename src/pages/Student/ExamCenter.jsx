// ============================================================================
// ExamCenter.jsx — QGenix Student Examination & Routine Hub Component
// ============================================================================
// Designed to represent a comprehensive Student Exam Routine & Scheduling Hub.
// Match visual aesthetic of QGenix Results & Routine modules. Features:
//   1. Summary statistics overview cards (Active Routines, Next Exam, Security, Courses)
//   2. Interactive tabs for "Mid Term", "Internal Final", "Nu Final", "Class Test"
//   3. Dynamic routine data matching active selection
//   4. Secure download button with simulated progression loader bar and toast alert
//   5. Fully responsive data table (Course, Subject, Date, Time, Room, Status)
//   6. Academic rules and proctoring protocols advisory panel
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষার্থীদের পরীক্ষার রুটিন এবং পরীক্ষার নিয়মাবলি প্রদর্শন করে।
// এতে ৪টি ক্যাটাগরি (Mid Term, Internal Final, Nu Final, Class Test) এর জন্য
// রুটিন টেবিল, পিডিএফ ডাউনলোড করার অ্যানিমেশন এবং রেসপন্সিভ লেআউট রয়েছে।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react'; // React library and state/memo hooks
import { motion, AnimatePresence } from 'framer-motion'; // Motion engine for smooth page loading
import { 
  FileText, Calendar, Clock, Download, AlertTriangle, ShieldCheck, 
  CheckCircle, RefreshCw, Info, UserCheck, BookOpen, Users, Bell
} from 'lucide-react'; // Lucide icons library
import Card from '../../components/Card'; // Custom glass card wrapper

// ----------------------------------------------------------------------------
// 1. MOCK DATA: DETAILED EXAM ROUTINES DATABASE
// ----------------------------------------------------------------------------
const examRoutines = {
  'Mid Term': {
    title: 'Mid Term Examination Routine', // Routine Title
    uploadedBy: 'Office of the Controller of Examinations', // Uploaded authority
    uploadDate: '2026-06-10', // Upload Date
    pdfName: 'QGenix_Midterm_Routine_2026.pdf', // PDF Filename
    schedule: [
      { code: 'CSE-301', subject: 'Advanced Data Structures & Algorithms', date: '2026-06-25', time: '09:00 AM', duration: '1.5 Hours', room: 'Room 302', status: 'Upcoming' },
      { code: 'CSE-302', subject: 'Database Management Systems', date: '2026-06-28', time: '11:00 AM', duration: '2.0 Hours', room: 'Room 405', status: 'Upcoming' },
      { code: 'CSE-303', subject: 'Computer Networks & Protocol Design', date: '2026-07-02', time: '09:00 AM', duration: '1.5 Hours', room: 'Room 101', status: 'Upcoming' },
      { code: 'CSE-304', subject: 'Software Engineering & DevOps', date: '2026-07-05', time: '01:30 PM', duration: '1.5 Hours', room: 'Room 204', status: 'Upcoming' }
    ]
  },
  'Internal Final': {
    title: 'Internal Final Lab Assessment Routine',
    uploadedBy: 'Department of CSE Coordinator',
    uploadDate: '2026-06-15',
    pdfName: 'CSE_Internal_Final_Lab_2026.pdf',
    schedule: [
      { code: 'CSE-301', subject: 'Algorithms Lab Assessment', date: '2026-06-26', time: '02:00 PM', duration: '2.0 Hours', room: 'Lab 3', status: 'Upcoming' },
      { code: 'CSE-303', subject: 'Networks Lab Assessment', date: '2026-06-27', time: '10:00 AM', duration: '2.0 Hours', room: 'Lab 1', status: 'Upcoming' },
      { code: 'CSE-302', subject: 'DBMS Lab Assessment', date: '2026-06-29', time: '02:00 PM', duration: '2.0 Hours', room: 'Lab 2', status: 'Upcoming' }
    ]
  },
  'Nu Final': {
    title: 'National University Semester Exam Routine',
    uploadedBy: 'National University Controller Academic',
    uploadDate: '2026-06-20',
    pdfName: 'NU_CSE_3rd_Year_Finals.pdf',
    schedule: [
      { code: 'CSE-301', subject: 'Advanced Data Structures & Algorithms', date: '2026-07-15', time: '10:00 AM', duration: '3.0 Hours', room: 'Main Hall A', status: 'Upcoming' },
      { code: 'CSE-302', subject: 'Database Management Systems', date: '2026-07-18', time: '10:00 AM', duration: '3.0 Hours', room: 'Main Hall A', status: 'Upcoming' },
      { code: 'CSE-303', subject: 'Computer Networks & Protocol Design', date: '2026-07-22', time: '10:00 AM', duration: '3.0 Hours', room: 'Annex Hall B', status: 'Upcoming' },
      { code: 'CSE-304', subject: 'Software Engineering & DevOps', date: '2026-07-25', time: '10:00 AM', duration: '3.0 Hours', room: 'Main Hall A', status: 'Upcoming' }
    ]
  },
  'Class Test': {
    title: 'Monthly Subject Class Test Schedule',
    uploadedBy: 'Dr. Sarah Ahmed & Prof. M. Rahman',
    uploadDate: '2026-06-19',
    pdfName: 'Class_Test_Schedules_June_2026.pdf',
    schedule: [
      { code: 'CSE-301', subject: 'Class Test 3 (DP & Greedy)', date: '2026-06-23', time: '09:00 AM', duration: '45 Minutes', room: 'Room 302', status: 'Upcoming' },
      { code: 'CSE-302', subject: 'Class Test 2 (Normalization)', date: '2026-06-24', time: '10:30 AM', duration: '45 Minutes', room: 'Room 405', status: 'Upcoming' },
      { code: 'CSE-304', subject: 'Class Test 1 (Agile & Docker)', date: '2026-06-30', time: '10:30 AM', duration: '45 Minutes', room: 'Room 204', status: 'Upcoming' }
    ]
  }
};

export default function ExamCenter() {
  // Sync page state light/dark mode
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    // Mutation observer keeps tabs on CSS changes in body layout
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Page active tab state ('Mid Term' | 'Internal Final' | 'Nu Final' | 'Class Test')
  const [activeTab, setActiveTab] = useState('Mid Term');

  // Simulated download triggers
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Active routine details matching selections
  const activeRoutine = useMemo(() => {
    return examRoutines[activeTab] || null;
  }, [activeTab]);

  // Download controller
  const triggerPdfDownload = (pdfName) => {
    if (isDownloading) return; // Guard double click
    setIsDownloading(true);
    setDownloadProgress(10);

    // Dynamic timer mapping progress
    const progressTimer = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    // Resolve compilation and clean loader states
    setTimeout(() => {
      clearInterval(progressTimer);
      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        setToastMessage(`Successfully downloaded "${pdfName}" to your device.`);
        setTimeout(() => setToastMessage(null), 3000); // Remove toast after 3s
      }, 300);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* =======================================================================
         PAGE LOCAL STYLES (MATCHING RESULTS & ROUTINE INTERFACES)
         ======================================================================= */}
      <style>{`
        /* Glassmorphism card layouts */
        .glass-card-exams {
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
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .glass-card-exams:hover {
          transform: translateY(-2px) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 25px -5px     rgba(139, 92, 246, 0.15) !important;
        }

        body.light-mode .glass-card-exams {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .glass-card-exams:hover {
          background: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 12px 40px -10px rgba(100, 160, 220, 0.2) !important;
        }

        /* Glowing background orbs */
        .exams-glow-purple {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .exams-glow-blue {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
        }

        /* Tab bar styles */
        .interactive-tabs-container {
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
          z-index: 10;
        }

        body.light-mode .interactive-tabs-container {
          background: rgba(0, 0, 0, 0.02);
        }

        .tab-item-btn {
          padding: 10px 22px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.88rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .tab-item-btn:hover {
          color: var(--text-primary);
        }

        .tab-item-btn-active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
        }

        /* Routine tables layouts */
        .exams-routine-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .exams-routine-table th {
          font-family: var(--font-heading);
          color: var(--text-secondary);
          font-weight: 700;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .exams-routine-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .table-row-interactive {
          transition: background-color 0.2s ease;
        }

        .table-row-interactive:hover {
          background: rgba(255, 255, 255, 0.015);
        }

        body.light-mode .table-row-interactive:hover {
          background: rgba(0, 0, 0, 0.01);
        }

        /* Hide scrollbars */
        .scrollbar-hidden::-webkit-scrollbar {
          display: none !important;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* Background orbs for premium visual styling */}
      <div className="exams-glow-purple" style={{ top: '10%', left: '-8%' }} />
      <div className="exams-glow-blue" style={{ bottom: '15%', right: '-8%' }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER & HEADING TITLE
         ======================================================================= */}
      <div className="flex justify-between items-center w-full relative z-10" style={{ paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <FileText className="text-violet-500" size={32} />
            Exam Center & Routines
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Check official test routines uploaded dynamically by your course teachers and administration.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: STATISTICS SUMMARY CARDS (GRID)
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', zIndex: 10, position: 'relative' }}>
        
        {/* Card 1: Total Published Routines */}
        <div className="glass-card-exams" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Routines</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <FileText size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>4 Categories</div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              ✓ All updated this week
            </span>
          </div>
        </div>

        {/* Card 2: Next Exam Count */}
        <div className="glass-card-exams" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Next Exam Date</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>June 25, 2026</div>
            <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              CSE-301 Midterm (4 days left)
            </span>
          </div>
        </div>

        {/* Card 3: Proctoring Protocol badge */}
        <div className="glass-card-exams" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Proctoring System</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Active Secure</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              AI Proctor & Face Lock Enabled
            </span>
          </div>
        </div>

        {/* Card 4: Total subjects in current evaluation */}
        <div className="glass-card-exams" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Enrolled Subjects</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>4 Courses</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
              Schedules successfully synced
            </span>
          </div>
        </div>

      </div>

      {/* =======================================================================
         SECTION 3: CLIKABLE NAVIGATION OPTIONS / TAB MENU
         ======================================================================= */}
      {/* Dynamic menu button layout corresponding to the 4 routines */}
      <div className="interactive-tabs-container">
        {Object.keys(examRoutines).map((key) => (
          <button 
            key={key}
            onClick={() => setActiveTab(key)} 
            className={`tab-item-btn ${activeTab === key ? 'tab-item-btn-active' : ''}`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* =======================================================================
         SECTION 4: ACTIVE ROUTINE VIEW LAYOUT & RULES SECTION
         ======================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10, position: 'relative' }}>
        {activeRoutine && (
          <Card title={activeRoutine.title}>
            
            {/* Dynamic Header details inside card with uploaded information & PDF download button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Uploaded By: <strong>{activeRoutine.uploadedBy}</strong>
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Published On: <strong>{activeRoutine.uploadDate}</strong>
                </span>
              </div>

              {/* Secure simulated download option */}
              <button
                onClick={() => triggerPdfDownload(activeRoutine.pdfName)}
                disabled={isDownloading}
                className="navbar-btn-hover flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  padding: '10px 18px',
                  borderRadius: '14px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  opacity: isDownloading ? 0.7 : 1
                }}
              >
                {isDownloading ? (
                  <RefreshCw size={16} className="animate-spin text-purple-500" />
                ) : (
                  <Download size={16} style={{ color: '#8B5CF6' }} />
                )}
                <span>{isDownloading ? 'Downloading...' : 'Download Routine PDF'}</span>
              </button>
            </div>

            {/* Progress bar loader mapping download state */}
            <AnimatePresence>
              {isDownloading && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginBottom: '16px', width: '100%' }}
                >
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${downloadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', transition: 'width 0.2s linear' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Compiling routine layouts... {downloadProgress}%
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Responsive exam details routine table grid */}
            <div style={{ overflowX: 'auto', width: '100%' }} className="scrollbar-hidden">
              <table className="exams-routine-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '8px' }}>Course Code</th>
                    <th>Subject Name</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Exam Room</th>
                    <th style={{ textAlign: 'right', paddingRight: '8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRoutine.schedule.map((slot, index) => (
                    <tr key={index} className="table-row-interactive">
                      <td style={{ fontWeight: '700', paddingLeft: '8px', color: '#8B5CF6' }}>{slot.code}</td>
                      <td style={{ fontWeight: '600' }}>{slot.subject}</td>
                      <td>{slot.date}</td>
                      <td>{slot.time}</td>
                      <td>{slot.duration}</td>
                      <td style={{ fontWeight: '600' }}>{slot.room}</td>
                      <td style={{ textAlign: 'right', paddingRight: '8px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          background: 'rgba(59, 130, 246, 0.12)',
                          color: '#3B82F6',
                          padding: '4px 10px',
                          borderRadius: '10px'
                        }}>
                          {slot.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </Card>
        )}
      </div>

      {/* Floating toast notification alert */}
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
              zIndex: 1000
            }}
          >
            <CheckCircle size={18} style={{ color: '#10B981' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
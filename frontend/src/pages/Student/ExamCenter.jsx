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
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react'; // React library and state/memo hooks
import { motion, AnimatePresence } from 'framer-motion'; // Motion engine for smooth page loading
import { 
  FileText, Calendar, Clock, Download, AlertTriangle, ShieldCheck, 
  CheckCircle, RefreshCw, Info, UserCheck, BookOpen, Users, Bell, Award, Layers
} from 'lucide-react'; // Lucide icons library
import Card from '../../components/Card';
import { useAdminData } from '../../contexts/AdminDataContext'; // Custom glass card wrapper
import { 
  downloadUniversitySubjectiveExamPDF, 
  downloadEntranceModelQuestionPDF 
} from '../../utils/entranceModelQuestionPdf';
import { API_BASE } from '../../config';

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

  // Multi-Set Assigned Exam State
  const [assignedExam, setAssignedExam] = useState(null);
  const [loadingAssignedExam, setLoadingAssignedExam] = useState(true);

  // Fetch student assigned exam on mount
  useEffect(() => {
    fetchAssignedExam();
  }, []);

  const fetchAssignedExam = async () => {
    setLoadingAssignedExam(true);
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      const studentId = localStorage.getItem('institutional_id') || localStorage.getItem('user_id') || localStorage.getItem('user_name') || '';
      const url = `${API_BASE}/api/auth/student-assigned-exam/?student_id=${encodeURIComponent(studentId)}`;
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.has_exam) {
          setAssignedExam(data);
        }
      }
    } catch (err) {
      console.warn('Could not fetch student assigned exam:', err);
    } finally {
      setLoadingAssignedExam(false);
    }
  };

  // Download assigned official exam paper as PDF
  const handleDownloadAssignedExamPDF = () => {
    if (!assignedExam) return;
    if (assignedExam.generation_type === 'mcq') {
      downloadEntranceModelQuestionPDF({
        examTitle: assignedExam.exam_title || 'Entrance Model Examination',
        institution: assignedExam.institution || 'DAFFODIL INSTITUTE OF IT',
        degreeProgram: assignedExam.degree_program || 'B.Sc (Hons) in Computer Science & Engineering',
        semesterExam: assignedExam.semester_exam || 'Midterm Examination',
        courseCode: assignedExam.course_code || '',
        courseTitle: assignedExam.course_title || assignedExam.course || '',
        setName: assignedExam.assigned_set_name || 'SET: A',
        questions: assignedExam.questions || [],
        totalMarks: assignedExam.full_marks || 50,
        timeAllowed: assignedExam.time_allowed || '60 Minutes',
        includeAnswerKey: false
      });
      return;
    }
    downloadUniversitySubjectiveExamPDF({
      institution: assignedExam.institution || 'DAFFODIL INSTITUTE OF IT',
      degreeProgram: assignedExam.degree_program || 'B.Sc (Hons) in Computer Science & Engineering',
      semesterExam: assignedExam.semester_exam || 'Midterm Examination',
      courseCode: assignedExam.course_code || '',
      courseTitle: assignedExam.course_title || assignedExam.course || '',
      timeAllowed: assignedExam.time_allowed || '1 hour 20 minutes',
      fullMarks: assignedExam.full_marks || 40,
      setName: assignedExam.assigned_set_name || 'SET: A',
      instructions: assignedExam.instructions || '[N.B. -- The figures in the right margin indicate full marks. Answer any two questions. All parts of the questions must be answered sequentially.]',
      questionSets: assignedExam.question_sets || [],
      includeModelAnswers: false
    });
  };

  // Page active tab state ('Mid Term' | 'Internal Final' | 'Nu Final' | 'Class Test' | 'Assigned Paper')
  const [activeTab, setActiveTab] = useState('Mid Term');

  // Simulated download triggers
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const { examSessions = [] } = useAdminData() || {};

  // Active routine details matching selections (prioritizes real DB published sessions)
  const activeRoutine = useMemo(() => {
    const matchedSession = (examSessions || []).find(s => {
      const isPub = s.is_published || s.isPublished;
      if (!isPub) return false;
      const type = (s.exam_type || s.type || '').toLowerCase();
      if (activeTab === 'Mid Term' && (type.includes('mid') || type === 'mid term exam')) return true;
      if (activeTab === 'Internal Final' && type.includes('internal')) return true;
      return false;
    });

    if (matchedSession && Array.isArray(matchedSession.routine) && matchedSession.routine.length > 0) {
      return {
        title: matchedSession.name || `${matchedSession.semester || ''} ${matchedSession.exam_type || activeTab} Routine`,
        uploadedBy: 'Office of the Controller of Examinations',
        uploadDate: matchedSession.startDate || matchedSession.start_date || 'Live',
        pdfName: `${(matchedSession.name || activeTab).replace(/\s+/g, '_')}_Routine.pdf`,
        schedule: matchedSession.routine.map(r => ({
          code: r.course_code || r.code,
          subject: r.subject_name || r.subject,
          date: r.date,
          time: r.time_duration || r.time,
          duration: r.duration || '2.0 Hours',
          room: r.room || 'Room 302',
          status: 'Upcoming'
        }))
      };
    }

    return examRoutines[activeTab] || null;
  }, [activeTab, examSessions]);

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
      {/* Dynamic menu button layout corresponding to the 4 routines + Assigned Paper */}
      <div className="interactive-tabs-container" style={{ flexWrap: 'wrap' }}>
        {Object.keys(examRoutines).map((key) => (
          <button 
            key={key}
            onClick={() => setActiveTab(key)} 
            className={`tab-item-btn ${activeTab === key ? 'tab-item-btn-active' : ''}`}
          >
            {key}
          </button>
        ))}

        <button 
          onClick={() => setActiveTab('Assigned Paper')} 
          className={`tab-item-btn ${activeTab === 'Assigned Paper' ? 'tab-item-btn-active' : ''}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ShieldCheck size={16} /> 
          <span>My Assigned Question Paper</span>
          {assignedExam && (
            <span style={{ 
              fontSize: '0.72rem', 
              padding: '2px 8px', 
              borderRadius: '6px', 
              background: activeTab === 'Assigned Paper' ? 'rgba(255,255,255,0.25)' : 'var(--accent-primary)', 
              color: '#ffffff',
              fontWeight: 800 
            }}>
              {assignedExam.assigned_set_name}
            </span>
          )}
        </button>
      </div>

      {/* Glowing Exam Notification Banner when teacher publishes a paper */}
      {assignedExam && activeTab !== 'Assigned Paper' && (
        <div 
          onClick={() => setActiveTab('Assigned Paper')}
          style={{
            cursor: 'pointer',
            padding: '14px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1.5px solid var(--accent-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            zIndex: 10,
            position: 'relative',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Official Question Paper Allocated:</span>
                <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                  {assignedExam.assigned_set_name}
                </span>
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {assignedExam.course_code} • {assignedExam.course_title || assignedExam.course} ({assignedExam.question_sets?.length || 2} Problem Groups) • Allocated by {assignedExam.teacher}
              </div>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '7px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            View My Exam Paper <FileText size={14} />
          </button>
        </div>
      )}

      {/* =======================================================================
         SECTION 4: ACTIVE ROUTINE VIEW OR ASSIGNED QUESTION PAPER
         ======================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10, position: 'relative' }}>
        
        {/* ASSIGNED QUESTION PAPER TAB */}
        {activeTab === 'Assigned Paper' && (
          <Card title="Official University Examination Paper">
            
            {!assignedExam ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                {loadingAssignedExam ? (
                  <>
                    <RefreshCw size={24} className="animate-spin text-purple-500" style={{ margin: '0 auto 12px' }} />
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>Retrieving your allocated question set...</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={32} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>No approved examination papers published for your student ID yet.</p>
                  </>
                )}
              </div>
            ) : (
              <div>
                
                {/* Anti-Cheating Allocation Notice Card */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1.5px solid var(--accent-primary)',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} />
                      Examinee Anti-Cheating Security Notice: Paper Allocated [{assignedExam.assigned_set_name}]
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.45 }}>
                      This question set was specifically assigned to your student identity by Course Faculty. Neighboring examinees have been given different sets with 70% distinct variant problems. Ensure you answer questions from this paper only.
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadAssignedExamPDF}
                    className="btn btn-primary"
                    style={{ fontSize: '0.82rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={15} /> Download Official PDF
                  </button>
                </div>

                {/* AUTHENTIC UNIVERSITY QUESTION PAPER PREVIEW (DESCRIPTIVE OR ENTRANCE MCQ) */}
                {assignedExam.generation_type === 'mcq' ? (
                  /* ======= ENTRANCE MODEL MCQ PREVIEW FOR STUDENT'S ASSIGNED SET ======= */
                  <div 
                    style={{ 
                      background: '#ffffff', 
                      color: '#0f172a',
                      padding: '36px 40px', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      fontFamily: '"Times New Roman", Times, Georgia, serif',
                      marginBottom: '20px',
                      border: '1px solid #cbd5e1',
                      position: 'relative'
                    }}
                  >
                    {/* Top Right Set Badge */}
                    <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '2px', color: '#000000' }}>
                      [{assignedExam.assigned_set_name || 'SET: A'}]
                    </div>

                    {/* Paper Top Title */}
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                      <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                        {assignedExam.institution || 'DAFFODIL INSTITUTE OF IT'}
                      </h1>
                      {assignedExam.degree_program && (
                        <h2 style={{ margin: '0 0 3px 0', fontSize: '1.15rem', fontWeight: 'bold' }}>
                          {assignedExam.degree_program}
                        </h2>
                      )}
                      {assignedExam.semester_exam && (
                        <div style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                          {assignedExam.semester_exam}
                        </div>
                      )}
                    </div>

                    {/* Solid Black Subject Badge */}
                    <div style={{ textAlign: 'center', margin: '14px 0' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        background: '#000000', 
                        color: '#ffffff', 
                        padding: '4px 24px', 
                        fontSize: '1.15rem', 
                        fontWeight: 'bold', 
                        letterSpacing: '1px' 
                      }}>
                        {assignedExam.course_code ? `${assignedExam.course_code}: ${assignedExam.course_title || assignedExam.course}` : (assignedExam.course_title || assignedExam.course)}
                      </span>
                    </div>

                    {/* Metadata Line */}
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#475569', marginBottom: '10px' }}>
                      Time: {assignedExam.time_allowed || '60 Minutes'} • Full Marks: {assignedExam.full_marks || 50}
                    </div>

                    {/* Double Horizontal Rule */}
                    <div style={{ borderTop: '2px solid #000000', borderBottom: '1px solid #000000', height: '3px', margin: '10px 0 20px 0' }}></div>

                    {/* Instructions */}
                    <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
                      Instructions: Read each question carefully. Select the most appropriate option from choices (a, b, c, d). Answer all questions from this designated question set.
                    </div>

                    {/* Questions List */}
                    {(!assignedExam.questions || assignedExam.questions.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                        No questions currently loaded in this set.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {assignedExam.questions.map((q, idx) => (
                          <div 
                            key={q.id || idx} 
                            style={{ 
                              position: 'relative',
                              padding: '8px 0',
                              borderBottom: '1px solid #f1f5f9'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '8px', fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
                              <span>{idx + 1}.</span>
                              <div style={{ flex: 1, fontWeight: '600' }}>{q.question}</div>
                            </div>

                            {/* Options in 2 Columns matching entrance model format */}
                            <div 
                              style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: '6px 24px', 
                                paddingLeft: '22px',
                                fontSize: '0.92rem'
                              }}
                            >
                              {['a', 'b', 'c', 'd'].map(optKey => (
                                <div key={optKey} style={{ display: 'flex', gap: '6px' }}>
                                  <span style={{ fontWeight: 'bold' }}>({optKey})</span>
                                  <span>{q.options ? q.options[optKey] : ''}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                <div 
                  className="diit-exam-paper-container"
                  style={{ 
                    background: '#ffffff', 
                    color: '#000000',
                    padding: '36px 44px', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    marginBottom: '20px',
                    border: '1px solid #cbd5e1',
                    position: 'relative'
                  }}
                >
                  {/* Top Right Set Badge */}
                  <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '2px', color: '#000000' }}>
                    [{assignedExam.assigned_set_name || 'SET: A'}]
                  </div>

                  {/* Institutional Header Centered */}
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                      {assignedExam.institution || 'DAFFODIL INSTITUTE OF IT'}
                    </h1>
                    <h2 style={{ margin: '0 0 3px 0', fontSize: '1.15rem', fontWeight: 'bold' }}>
                      {assignedExam.degree_program || 'B.Sc (Hons) in Computer Science & Engineering'}
                    </h2>
                    <div style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                      {assignedExam.semester_exam || 'Midterm Examination'}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                      {assignedExam.course_code} ({assignedExam.course_title || assignedExam.course})
                    </div>
                    <div style={{ fontSize: '1rem' }}>
                      Time – {assignedExam.time_allowed || '1 hour 20 minutes'}, Full marks – {assignedExam.full_marks || 40}
                    </div>
                  </div>

                  {/* Examination Instructions [N.B.] */}
                  <div style={{ fontStyle: 'italic', fontSize: '0.92rem', marginBottom: '14px', lineHeight: '1.45', color: '#1e293b' }}>
                    {assignedExam.instructions || '[N.B. -- The figures in the right margin indicate full marks. Answer any two questions. All parts of the questions must be answered sequentially.]'}
                  </div>

                  {/* Right Margin Header: Marks */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '8px', paddingRight: '4px' }}>
                    Marks
                  </div>

                  {/* Divider Line */}
                  <div style={{ borderTop: '1px solid #000000', marginBottom: '18px' }}></div>

                  {/* Question Sets List */}
                  {(!assignedExam.question_sets || assignedExam.question_sets.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                      No questions currently loaded in this set.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                      {assignedExam.question_sets.map((qSet, setIdx) => (
                        <div key={qSet.set_number || setIdx} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          
                          {(qSet.sub_questions || []).map((sq, subIdx) => (
                            <div 
                              key={sq.id || subIdx} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start',
                                position: 'relative',
                                padding: '4px 0'
                              }}
                            >
                              {/* Left Margin Prefix: Set Number & Sub-Question Part */}
                              <div style={{ width: '60px', minWidth: '60px', fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', gap: '6px' }}>
                                {subIdx === 0 ? (
                                  <span style={{ minWidth: '18px' }}>{qSet.set_number || (setIdx + 1)}.</span>
                                ) : (
                                  <span style={{ minWidth: '18px', visibility: 'hidden' }}>1.</span>
                                )}
                                <span>({sq.part || String.fromCharCode(97 + subIdx)})</span>
                              </div>

                              {/* Middle Column: Question Stem & Drawn Matrix */}
                              <div style={{ flex: 1, paddingRight: '20px' }}>
                                <div style={{ fontSize: '1.03rem', lineHeight: '1.45', color: '#000000' }}>
                                  {sq.question}
                                </div>

                                {/* DRAWN MATHEMATICAL MATRIX / FIGURE */}
                                {sq.matrix && Array.isArray(sq.matrix) && sq.matrix.length > 0 && (
                                  <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <table style={{ borderCollapse: 'collapse', border: '2px solid #000000', margin: '0 auto' }}>
                                      <tbody>
                                        {sq.matrix.map((row, rIdx) => (
                                          <tr key={rIdx}>
                                            {(Array.isArray(row) ? row : [row]).map((val, cIdx) => (
                                              <td 
                                                key={cIdx} 
                                                style={{ 
                                                  width: '32px', 
                                                  height: '32px', 
                                                  minWidth: '32px', 
                                                  minHeight: '32px',
                                                  border: '1.5px solid #000000',
                                                  textAlign: 'center',
                                                  verticalAlign: 'middle',
                                                  fontWeight: 'bold',
                                                  fontSize: '1.05rem',
                                                  color: '#000000',
                                                  padding: 0
                                                }}
                                              >
                                                {val}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Right Margin Marks Column */}
                              <div style={{ width: '50px', minWidth: '50px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {sq.marks}
                              </div>
                            </div>
                          ))}

                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}

              </div>
            )}

          </Card>
        )}

        {/* REGULAR ROUTINE TABS */}
        {activeTab !== 'Assigned Paper' && activeRoutine && (
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
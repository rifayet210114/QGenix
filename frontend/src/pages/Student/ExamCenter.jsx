// ============================================================================
// ExamCenter.jsx — QGenix Student Examination, Online Test & Routine Hub
// ============================================================================
// Features:
//   1. Summary statistics overview cards (Active Routines, Next Exam, Security, Courses)
//   2. Interactive tabs for "Mid Term", "Internal Final", "Nu Final", "Class Test", "Assigned Paper"
//   3. Dynamic routine data matching active selection with simulated download
//   4. Multi-Set Assigned Exam Paper dynamically allocated to logged-in student
//   5. Interactive Online Exam Taking Workbench with live countdown timer
//   6. Instant Auto-Checking & Detailed Answer Review with Faculty Explanations
//   7. 100% DB-driven sync with StudentExamResult and Results Hub
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Calendar, Clock, Download, AlertTriangle, ShieldCheck, 
  CheckCircle, RefreshCw, Info, UserCheck, BookOpen, Users, Bell, Award, Layers,
  Play, Check, X, Send, Sparkles, ChevronLeft, ChevronRight, HelpCircle,
  ExternalLink, BarChart3, ArrowLeft, BrainCircuit
} from 'lucide-react';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminData } from '../../contexts/AdminDataContext';
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
    title: 'Mid Term Examination Routine',
    uploadedBy: 'Office of the Controller of Examinations',
    uploadDate: '2026-06-10',
    pdfName: 'QGenix_Midterm_Routine_2026.pdf',
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { examSessions = [], refreshFromDB } = useAdminData() || {};

  // Sync page state light/dark mode
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Multi-Set Assigned Exam State
  const [assignedExam, setAssignedExam] = useState(null);
  const [loadingAssignedExam, setLoadingAssignedExam] = useState(true);

  // Active tab state ('Mid Term' | 'Internal Final' | 'Nu Final' | 'Class Test' | 'Assigned Paper')
  const [activeTab, setActiveTab] = useState('Mid Term');

  // Simulated download triggers
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // ==========================================================================
  // ONLINE EXAM WORKBENCH & AUTO-CHECKING STATES
  // ==========================================================================
  const [isTakingExam, setIsTakingExam] = useState(false);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qId]: 'a' | 'b' | 'c' | 'd' }
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeAllowed, setTotalTimeAllowed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [examScorecard, setExamScorecard] = useState(null);
  const [scorecardFilter, setScorecardFilter] = useState('all'); // 'all' | 'correct' | 'wrong'

  // Fetch student assigned exam on mount or when user changes
  useEffect(() => {
    fetchAssignedExam();
  }, [user]);

  const fetchAssignedExam = async (paperId = '') => {
    setLoadingAssignedExam(true);
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      const studentId = user?.institutional_id || user?.username || localStorage.getItem('institutional_id') || localStorage.getItem('user_id') || localStorage.getItem('user_name') || '';
      let url = `${API_BASE}/api/auth/student-assigned-exam/?student_id=${encodeURIComponent(studentId)}`;
      if (paperId) {
        url += `&paper_id=${encodeURIComponent(paperId)}`;
      }
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.has_exam) {
          setAssignedExam(data);
          // Auto switch to Assigned Paper tab if there is an active exam
          if (data.has_submitted && data.submission_result?.breakdown) {
            // Already submitted, can view scorecard
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch student assigned exam:', err);
    } finally {
      setLoadingAssignedExam(false);
    }
  };

  // Parse time allowed string to seconds
  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return 3600; // default 60 mins
    const lower = String(timeStr).toLowerCase();
    let totalMinutes = 0;
    const hourMatch = lower.match(/(\d+)\s*h/);
    if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
    const minMatch = lower.match(/(\d+)\s*m/);
    if (minMatch) totalMinutes += parseInt(minMatch[1], 10);
    if (totalMinutes === 0) {
      const numMatch = lower.match(/(\d+)/);
      totalMinutes = numMatch ? parseInt(numMatch[1], 10) : 60;
    }
    return Math.max(300, totalMinutes * 60); // At least 5 mins
  };

  // Format seconds into MM:SS or HH:MM:SS
  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format time spent string
  const formatTimeSpent = (secs) => {
    const s = Math.max(0, Math.floor(secs));
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Start Online Exam Action
  const handleStartExam = () => {
    if (!assignedExam || !assignedExam.questions || assignedExam.questions.length === 0) {
      alert('No questions loaded for this examination paper.');
      return;
    }
    const totalSecs = parseTimeToSeconds(assignedExam.time_allowed);
    setTotalTimeAllowed(totalSecs);
    setTimeLeft(totalSecs);
    setSelectedAnswers({});
    setCurrentQIdx(0);
    setExamScorecard(null);
    setIsTakingExam(true);
    setActiveTab('Assigned Paper');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (!isTakingExam || examScorecard) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTakingExam, examScorecard, timeLeft]);

  // Handle option select
  const handleSelectOption = (qId, optionKey) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [String(qId)]: optionKey
    }));
  };

  // Auto submit when timer runs out
  const handleAutoSubmit = () => {
    if (isSubmitting || examScorecard) return;
    executeExamSubmission();
  };

  // Confirm manual submit
  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    executeExamSubmission();
  };

  // Execute Submission to Backend API
  const executeExamSubmission = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      const studentId = user?.institutional_id || user?.username || localStorage.getItem('institutional_id') || localStorage.getItem('user_id') || '';
      const timeSpentSecs = totalTimeAllowed - timeLeft;
      
      const payload = {
        paper_id: assignedExam.paper_id,
        paper_db_id: assignedExam.paper_db_id,
        student_uid: studentId,
        student_id: studentId,
        assigned_set_name: assignedExam.assigned_set_name || 'SET: A',
        answers: selectedAnswers,
        time_spent: formatTimeSpent(timeSpentSecs)
      };

      const res = await fetch(`${API_BASE}/api/auth/student-submit-exam/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.breakdown) {
        setExamScorecard(data.breakdown);
        setAssignedExam(prev => ({
          ...prev,
          has_submitted: true,
          submission_result: data.result
        }));
        setIsTakingExam(false);
        if (typeof refreshFromDB === 'function') {
          refreshFromDB();
        }
      }
    } catch (err) {
      alert('Error submitting exam: ' + err.message);
    } finally {
      setIsSubmitting(false);
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

  // Active routine details matching selections
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

  // Download controller for routines
  const triggerPdfDownload = (pdfName) => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(10);

    const progressTimer = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(progressTimer);
      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        setToastMessage(`Successfully downloaded "${pdfName}" to your device.`);
        setTimeout(() => setToastMessage(null), 3000);
      }, 300);
    }, 1000);
  };

  // Current active questions list for exam
  const examQuestions = useMemo(() => {
    if (!assignedExam) return [];
    return assignedExam.questions || [];
  }, [assignedExam]);

  const currentQ = examQuestions[currentQIdx] || null;
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = examQuestions.length;

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* PAGE LOCAL STYLES */}
      <style>{`
        .glass-card-exams {
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(10, 20, 42, 0.45) 0%,
            rgba(6, 12, 28, 0.55) 100%
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
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .glass-card-exams:hover {
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 25px -5px     rgba(139, 92, 246, 0.15) !important;
        }

        body.light-mode .glass-card-exams {
          background: rgba(255, 255, 255, 0.75) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        .interactive-tabs-container {
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
          z-index: 10;
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
          background: rgba(255, 255, 255, 0.02);
        }

        /* Option selection cards for exam taking */
        .option-choice-card {
          padding: 16px 20px;
          border-radius: 14px;
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .option-choice-card:hover {
          border-color: rgba(139, 92, 246, 0.5);
          background: rgba(139, 92, 246, 0.06);
          transform: translateY(-1px);
        }

        .option-choice-card-selected {
          border-color: #10B981 !important;
          background: rgba(16, 185, 129, 0.12) !important;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2) !important;
        }

        body.light-mode .option-choice-card {
          background: #ffffff;
          border-color: #e2e8f0;
        }

        body.light-mode .option-choice-card:hover {
          background: #f8fafc;
          border-color: #8B5CF6;
        }

        body.light-mode .option-choice-card-selected {
          background: #ecfdf5 !important;
          border-color: #10B981 !important;
        }

        /* Quick question navigator pill */
        .q-nav-pill {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .q-nav-pill:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }

        .q-nav-pill-active {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.4) !important;
          color: #ffffff !important;
          background: rgba(139, 92, 246, 0.25) !important;
        }

        .q-nav-pill-answered {
          background: #10B981 !important;
          border-color: #10B981 !important;
          color: #ffffff !important;
        }

        /* Pulse badge for timer */
        @keyframes timerPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        .timer-warning-pulse {
          animation: timerPulse 1.2s infinite ease-in-out;
          color: #EF4444 !important;
          border-color: #EF4444 !important;
          background: rgba(239, 68, 68, 0.15) !important;
        }
      `}</style>

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div className="flex justify-between items-center w-full relative z-10" style={{ paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <FileText className="text-violet-500" size={32} />
            Exam Center & Online Tests
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.98rem', fontWeight: '500' }}>
            Take official assigned course examinations, view auto-checked scorecards, and review academic routines.
          </p>
        </div>

        {/* Quick link to Results Page */}
        <button
          onClick={() => navigate('/student/results')}
          className="btn"
          style={{
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: 'var(--text-primary)',
            padding: '9px 18px',
            borderRadius: '12px',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <BarChart3 size={16} className="text-violet-400" />
          <span>My Results Hub</span>
        </button>
      </div>

      {/* =======================================================================
         MODE A: INTERACTIVE SCORECARD REVIEW MODAL / VIEW
         ======================================================================= */}
      {examScorecard && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-exams"
          style={{ padding: '32px', border: '1.5px solid rgba(16, 185, 129, 0.35)', position: 'relative', zIndex: 30 }}
        >
          {/* Top Banner & Return */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setExamScorecard(null)}
                className="btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem'
                }}
              >
                <ArrowLeft size={16} /> Close Review
              </button>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-2">
                  <Sparkles className="text-emerald-400" size={22} />
                  Automated Evaluation & Answer Key Review
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {assignedExam?.course_code} • {assignedExam?.course_title || assignedExam?.course} [{examScorecard.assigned_set_name || assignedExam?.assigned_set_name}]
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => navigate('/student/results')}
                className="btn btn-primary"
                style={{ fontSize: '0.84rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <BarChart3 size={15} /> View in Results Hub
              </button>
            </div>
          </div>

          {/* Performance Hero Statistics Card */}
          {assignedExam?.submission_result && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '26px'
            }}>
              {/* Score Metric */}
              <div style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Obtained Score</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
                  {assignedExam.submission_result.obtained_marks} <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/ {assignedExam.submission_result.max_marks}</span>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                  {assignedExam.submission_result.percentage}% Total Marks
                </span>
              </div>

              {/* Grade & GPA */}
              <div style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.05))', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Grade & GPA</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#8B5CF6', fontFamily: 'var(--font-heading)', marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span>{assignedExam.submission_result.grade}</span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>GPA: {assignedExam.submission_result.gpa}</span>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#8B5CF6', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                  Verified by University Grading Policy
                </span>
              </div>

              {/* Accuracy Summary */}
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Question Accuracy</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 800 }}>
                    <CheckCircle size={18} /> {examScorecard.correct_count} Correct
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontWeight: 800 }}>
                    <X size={18} /> {examScorecard.wrong_count} Wrong
                  </div>
                  {examScorecard.unattempted_count > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F59E0B', fontWeight: 800 }}>
                      <HelpCircle size={18} /> {examScorecard.unattempted_count} Skipped
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '8px' }}>
                  Completed in {examScorecard.time_spent || 'Standard Time'}
                </span>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setScorecardFilter('all')}
                className="btn"
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: scorecardFilter === 'all' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
                  color: scorecardFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                All Questions ({examScorecard.questions?.length || 0})
              </button>
              <button 
                onClick={() => setScorecardFilter('correct')}
                className="btn"
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: scorecardFilter === 'correct' ? '#10B981' : 'rgba(16, 185, 129, 0.08)',
                  color: scorecardFilter === 'correct' ? '#ffffff' : '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                ✓ Correct Only ({examScorecard.correct_count || 0})
              </button>
              <button 
                onClick={() => setScorecardFilter('wrong')}
                className="btn"
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: scorecardFilter === 'wrong' ? '#EF4444' : 'rgba(239, 68, 68, 0.08)',
                  color: scorecardFilter === 'wrong' ? '#ffffff' : '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                ✕ Wrong Only ({examScorecard.wrong_count || 0})
              </button>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Showing {scorecardFilter === 'all' ? 'all questions' : `${scorecardFilter} answers only`}
            </span>
          </div>

          {/* Question Breakdown List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {(examScorecard.questions || [])
              .filter(q => {
                if (scorecardFilter === 'correct') return q.is_correct;
                if (scorecardFilter === 'wrong') return !q.is_correct;
                return true;
              })
              .map((q, idx) => (
                <div 
                  key={q.id || idx}
                  style={{
                    padding: '22px',
                    borderRadius: '16px',
                    border: `1.5px solid ${q.is_correct ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    background: q.is_correct ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)',
                    position: 'relative'
                  }}
                >
                  {/* Question Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        background: q.is_correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: q.is_correct ? '#10B981' : '#EF4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        {q.is_correct ? <Check size={14} /> : <X size={14} />}
                        {q.is_correct ? 'CORRECT' : (q.student_answer ? 'INCORRECT' : 'UNANSWERED')}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Marks: {q.awarded_marks || 0} / {q.marks || 2}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Item #{idx + 1}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.5 }}>
                    {q.question}
                  </div>

                  {/* Options List with Visual Feedback */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                    {['a', 'b', 'c', 'd'].map(optKey => {
                      const optText = q.options ? q.options[optKey] : '';
                      if (!optText) return null;
                      
                      const isStudentChoice = String(q.student_answer).trim().toLowerCase() === optKey;
                      const isCorrectChoice = String(q.correct_answer).trim().toLowerCase() === optKey;

                      let borderColor = 'rgba(255, 255, 255, 0.08)';
                      let bgColor = 'rgba(255, 255, 255, 0.015)';
                      let tagBadge = null;

                      if (isStudentChoice && isCorrectChoice) {
                        borderColor = '#10B981';
                        bgColor = 'rgba(16, 185, 129, 0.12)';
                        tagBadge = <span style={{ marginLeft: 'auto', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: '#10B981', color: 'white', fontWeight: 800 }}>Your Answer ✓</span>;
                      } else if (isStudentChoice && !isCorrectChoice) {
                        borderColor = '#EF4444';
                        bgColor = 'rgba(239, 68, 68, 0.12)';
                        tagBadge = <span style={{ marginLeft: 'auto', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: '#EF4444', color: 'white', fontWeight: 800 }}>Your Answer ✕</span>;
                      } else if (!isStudentChoice && isCorrectChoice) {
                        borderColor = '#10B981';
                        bgColor = 'rgba(16, 185, 129, 0.08)';
                        tagBadge = <span style={{ marginLeft: 'auto', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.25)', color: '#10B981', fontWeight: 800 }}>Correct Answer ✓</span>;
                      }

                      return (
                        <div 
                          key={optKey}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: `1.5px solid ${borderColor}`,
                            background: bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.9rem'
                          }}
                        >
                          <span style={{ fontWeight: 800, color: isCorrectChoice ? '#10B981' : (isStudentChoice ? '#EF4444' : 'var(--text-secondary)') }}>
                            ({optKey})
                          </span>
                          <span style={{ color: 'var(--text-primary)', flex: 1 }}>{optText}</span>
                          {tagBadge}
                        </div>
                      );
                    })}
                  </div>

                  {/* Faculty Explanation Card */}
                  {q.explanation && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(139, 92, 246, 0.08)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      <BrainCircuit size={18} className="text-violet-400" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Faculty Concept Explanation:
                        </span>
                        <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              ))}
          </div>

        </motion.div>
      )}

      {/* =======================================================================
         MODE B: INTERACTIVE EXAM TAKING WORKBENCH
         ======================================================================= */}
      {isTakingExam && !examScorecard && currentQ && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-exams"
          style={{ padding: '30px', position: 'relative', zIndex: 30, border: '1.5px solid var(--accent-primary)' }}
        >
          {/* Top Bar: Title, Live Countdown Timer, Exit */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '22px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '3px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800 }}>
                  {assignedExam.assigned_set_name || 'SET: A'}
                </span>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  {assignedExam.course_code}: {assignedExam.course_title || assignedExam.course}
                </h2>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {assignedExam.degree_program} • {assignedExam.semester_exam} • Full Marks: {assignedExam.full_marks || 50}
              </div>
            </div>

            {/* Countdown Timer with Pulsing Alert */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div 
                className={timeLeft < 300 ? 'timer-warning-pulse' : ''}
                style={{
                  padding: '8px 18px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  border: '1.5px solid rgba(139, 92, 246, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  fontFamily: 'monospace'
                }}
              >
                <Clock size={20} className={timeLeft < 300 ? 'text-red-400 animate-spin' : 'text-purple-400'} />
                <span>{formatTime(timeLeft)}</span>
              </div>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to exit the exam? Your progress will be discarded.')) {
                    setIsTakingExam(false);
                  }
                }}
                className="btn"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                Cancel Exam
              </button>
            </div>
          </div>

          {/* Progress Header & Question Navigator Chips */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Question {currentQIdx + 1} of {totalQuestions}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 700 }}>
                ✓ {answeredCount} Answered ({totalQuestions - answeredCount} Remaining)
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden', marginBottom: '16px' }}>
              <div 
                style={{ 
                  width: `${(answeredCount / Math.max(1, totalQuestions)) * 100}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #8B5CF6, #10B981)',
                  transition: 'width 0.3s ease'
                }} 
              />
            </div>

            {/* Question Quick-Jump Navigator Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {examQuestions.map((q, idx) => {
                const isAnswered = selectedAnswers[String(q.id || (idx + 1))] !== undefined;
                const isCurrent = idx === currentQIdx;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQIdx(idx)}
                    className={`q-nav-pill ${isAnswered ? 'q-nav-pill-answered' : ''} ${isCurrent ? 'q-nav-pill-active' : ''}`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Card Body */}
          <div style={{
            padding: '28px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            marginBottom: '26px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Question #{currentQIdx + 1}
              </span>
              <span style={{ fontSize: '0.82rem', padding: '3px 10px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', fontWeight: 700 }}>
                Marks: {currentQ.marks || 2}
              </span>
            </div>

            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {currentQ.question}
            </h3>

            {/* Interactive Options Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['a', 'b', 'c', 'd'].map(optKey => {
                const optText = currentQ.options ? currentQ.options[optKey] : '';
                if (!optText) return null;
                const isSelected = selectedAnswers[String(currentQ.id || (currentQIdx + 1))] === optKey;

                return (
                  <div
                    key={optKey}
                    onClick={() => handleSelectOption(currentQ.id || (currentQIdx + 1), optKey)}
                    className={`option-choice-card ${isSelected ? 'option-choice-card-selected' : ''}`}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}>
                      {isSelected ? <Check size={18} /> : optKey.toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.96rem', fontWeight: isSelected ? 700 : 500, color: 'var(--text-primary)' }}>
                      {optText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation & Submit Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setCurrentQIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQIdx === 0}
                className="btn"
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: currentQIdx === 0 ? 0.4 : 1,
                  cursor: currentQIdx === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={18} /> Previous
              </button>

              <button
                onClick={() => setCurrentQIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                disabled={currentQIdx === totalQuestions - 1}
                className="btn"
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: currentQIdx === totalQuestions - 1 ? 0.4 : 1,
                  cursor: currentQIdx === totalQuestions - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>

            {/* Submit Exam Button */}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                padding: '11px 28px',
                borderRadius: '14px',
                fontSize: '0.92rem',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Send size={16} /> Submit Exam & Auto-Check
            </button>
          </div>

          {/* Submit Confirmation Dialog */}
          <AnimatePresence>
            {showSubmitConfirm && (
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    background: '#0e1726',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '20px',
                    padding: '30px',
                    maxWidth: '460px',
                    width: '100%',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <CheckCircle size={32} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                      Finalize & Submit Exam?
                    </h3>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.45 }}>
                      You have answered <strong>{answeredCount}</strong> out of <strong>{totalQuestions}</strong> questions.
                      {totalQuestions - answeredCount > 0 && (
                        <span style={{ color: '#f59e0b', display: 'block', marginTop: '4px' }}>
                          ⚠️ You have {totalQuestions - answeredCount} unattempted questions.
                        </span>
                      )}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => setShowSubmitConfirm(false)}
                      disabled={isSubmitting}
                      className="btn"
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 700
                      }}
                    >
                      Continue Exam
                    </button>
                    <button
                      onClick={handleConfirmSubmit}
                      disabled={isSubmitting}
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" /> Evaluating...
                        </>
                      ) : (
                        'Yes, Submit Now'
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </motion.div>
      )}

      {/* =======================================================================
         MODE C: REGULAR EXAM CENTER HUB & ACTIVE ROUTINE / ASSIGNED TABS
         ======================================================================= */}
      {!isTakingExam && !examScorecard && (
        <>
          {/* Summary Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', zIndex: 10, position: 'relative' }}>
            
            {/* Card 1: Active Routines */}
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
                  ✓ All synced dynamically
                </span>
              </div>
            </div>

            {/* Card 2: Next Exam Date */}
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
                  CSE-301 Midterm
                </span>
              </div>
            </div>

            {/* Card 3: Online Exam Status */}
            <div className="glass-card-exams" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Assigned Paper Status</span>
                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: assignedExam?.has_submitted ? '#10B981' : (assignedExam ? '#8B5CF6' : 'var(--text-primary)'), fontFamily: 'var(--font-heading)' }}>
                  {assignedExam?.has_submitted ? 'Completed' : (assignedExam ? `Ready (${assignedExam.assigned_set_name})` : 'No Paper')}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                  {assignedExam?.has_submitted ? `Score: ${assignedExam.submission_result?.obtained_marks}/${assignedExam.submission_result?.max_marks} (${assignedExam.submission_result?.grade})` : 'Anti-Cheating Multi-Set Active'}
                </span>
              </div>
            </div>

            {/* Card 4: Enrolled Subjects */}
            <div className="glass-card-exams" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Enrolled Subjects</span>
                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                  <BookOpen size={20} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Allocated</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  Curriculum Synced to DB
                </span>
              </div>
            </div>

          </div>

          {/* Tab Navigation Menu */}
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

          {/* Notification Callout when an assigned exam is ready and not taken yet */}
          {assignedExam && activeTab !== 'Assigned Paper' && !assignedExam.has_submitted && (
            <div 
              onClick={() => setActiveTab('Assigned Paper')}
              style={{
                cursor: 'pointer',
                padding: '16px 22px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                border: '1.5px solid var(--accent-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                zIndex: 10,
                position: 'relative',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Official Question Paper Ready:</span>
                    <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                      {assignedExam.assigned_set_name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {assignedExam.course_code} • {assignedExam.course_title || assignedExam.course} ({assignedExam.questions?.length || 0} Questions) • Allocated by {assignedExam.teacher}
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartExam();
                }}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  padding: '9px 20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Play size={16} fill="white" /> Start Online Exam
              </button>
            </div>
          )}

          {/* TAB 1: ASSIGNED QUESTION PAPER TAB */}
          {activeTab === 'Assigned Paper' && (
            <Card title="Official University Examination Paper">
              
              {!assignedExam ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                  {loadingAssignedExam ? (
                    <>
                      <RefreshCw size={28} className="animate-spin text-purple-500" style={{ margin: '0 auto 12px' }} />
                      <p style={{ margin: 0, fontSize: '0.94rem' }}>Retrieving your allocated question set...</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={36} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
                      <p style={{ margin: 0, fontSize: '0.94rem' }}>No approved examination papers published for your student ID yet.</p>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  
                  {/* Anti-Cheating & Exam Actions Banner */}
                  <div style={{
                    padding: '18px 22px',
                    borderRadius: '16px',
                    background: assignedExam.has_submitted 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.05))'
                      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.05))',
                    border: `1.5px solid ${assignedExam.has_submitted ? '#10B981' : 'var(--accent-primary)'}`,
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: assignedExam.has_submitted ? '#10B981' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {assignedExam.has_submitted ? <CheckCircle size={20} /> : <ShieldCheck size={20} />}
                        {assignedExam.has_submitted 
                          ? `Exam Completed & Graded: ${assignedExam.submission_result?.obtained_marks}/${assignedExam.submission_result?.max_marks} (${assignedExam.submission_result?.grade}, GPA: ${assignedExam.submission_result?.gpa})`
                          : `Allocated Question Paper: [${assignedExam.assigned_set_name}]`
                        }
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                        {assignedExam.has_submitted 
                          ? `You completed this examination on ${assignedExam.submission_result?.submitted_at || 'record'}. Your score has been automatically verified and synced to your academic transcript.`
                          : `This set was assigned uniquely to your student identity (${user?.institutional_id || 'Examinee'}) by Course Faculty (${assignedExam.teacher}). Neighboring students have alternate sets.`
                        }
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {assignedExam.has_submitted ? (
                        <>
                          {assignedExam.submission_result?.breakdown && (
                            <button
                              onClick={() => setExamScorecard(assignedExam.submission_result.breakdown)}
                              className="btn btn-primary"
                              style={{
                                background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                                padding: '9px 20px',
                                fontSize: '0.86rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              <Award size={16} /> View Scorecard & Answers
                            </button>
                          )}
                          <button
                            onClick={() => navigate('/student/results')}
                            className="btn"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-color)',
                              padding: '9px 16px',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <BarChart3 size={15} /> Results Hub
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleStartExam}
                          className="btn btn-primary"
                          style={{
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: 800,
                            padding: '10px 24px',
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <Play size={16} fill="white" /> Start Online Exam Now
                        </button>
                      )}

                      <button
                        onClick={handleDownloadAssignedExamPDF}
                        className="btn"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.84rem',
                          padding: '9px 18px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--text-primary)',
                          fontWeight: 700
                        }}
                      >
                        <Download size={15} /> Download PDF
                      </button>
                    </div>
                  </div>

                  {/* AUTHENTIC UNIVERSITY QUESTION PAPER PREVIEW */}
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

                    {/* Questions Preview List */}
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

                            {/* Options in 2 Columns */}
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

                </div>
              )}

            </Card>
          )}

          {/* TAB 2: REGULAR ROUTINES */}
          {activeTab !== 'Assigned Paper' && activeRoutine && (
            <Card title={activeRoutine.title}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Uploaded By: <strong>{activeRoutine.uploadedBy}</strong>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Published On: <strong>{activeRoutine.uploadDate}</strong>
                  </span>
                </div>

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

              {/* Progress bar loader */}
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

              {/* Table */}
              <div style={{ overflowX: 'auto', width: '100%' }}>
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
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10B981'
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

        </>
      )}

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              padding: '14px 22px',
              background: '#0f172a',
              border: '1.5px solid #10B981',
              color: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 99999,
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            <CheckCircle size={20} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

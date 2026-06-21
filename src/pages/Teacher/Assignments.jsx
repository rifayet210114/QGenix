// ============================================================================
// Assignments.jsx — QGenix Teacher Assignments Manager Portal
// ============================================================================
// Features:
//   1. Dashboard Overview cards: Active Tasks, Total Submissions, Ungraded alerts.
//   2. Category tabs: "Active Roster", "Create Assignment", "Submissions Gradebook".
//   3. Forms layout to assign new work, specifying target Batch, Semester, and Course.
//   4. Automated sync: Saves to localStorage key 'qgenix_student_assignments' to
//      allow instant retrieval on the student's personal portal.
//   5. Interactive Gradebook: View student uploads, input scores, and provide feedback.
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষকের অ্যাসাইনমেন্ট ম্যানেজার পোর্টাল। শিক্ষক নতুন অ্যাসাইনমেন্ট তৈরি
// করে তা ব্যাচ, সেমিস্টার এবং কোর্স অনুযায়ী শিক্ষার্থীদের জন্য প্রকাশ করতে পারেন।
// এছাড়া জমা দেওয়া অ্যাসাইনমেন্টের গ্রেডিং ও মন্তব্য করার সুবিধা রাখা হয়েছে।
// ============================================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Calendar, Clock, Download, AlertTriangle, ShieldCheck, 
  CheckCircle, RefreshCw, Info, UserCheck, BookOpen, Users, Bell, 
  Search, SlidersHorizontal, ChevronRight, Send, ArrowLeft, Award, 
  CheckCircle2, PlusCircle, FileUp, Sparkles, Edit3
} from 'lucide-react';
import Card from '../../components/Card';

// ----------------------------------------------------------------------------
// 1. INITIAL MOCK DATA FOR SUBMISSIONS (IF NOT SAVED IN LOCALSTORAGE)
// ----------------------------------------------------------------------------
const initialSubmissions = {
  1: [ // Mapped to Assignment ID 1: Self-Balancing Trees
    { studentId: 'UG02-112', studentName: 'Rafayel Ahmed', batch: 'Batch 21', status: 'Graded', marks: 94, feedback: 'Excellent implementation of Red-Black tree balances! Rotation graphs are highly analytical and readable.', file: 'CSE301_Lab1_Rafiul.zip', time: '2026-06-04 10:15 PM' },
    { studentId: 'UG02-145', studentName: 'Noshin Tasnim', batch: 'Batch 21', status: 'Submitted', marks: null, feedback: '', file: 'CSE301_Lab1_Noshin.zip', time: '2026-06-04 09:30 PM' },
    { studentId: 'UG02-098', studentName: 'Sajjad Karim', batch: 'Batch 21', status: 'Submitted', marks: null, feedback: '', file: 'CSE301_Lab1_Sajjad.zip', time: '2026-06-05 08:00 AM' },
    { studentId: 'UG02-210', studentName: 'Maria Sultana', batch: 'Batch 21', status: 'Pending', marks: null, feedback: null, file: null, time: null },
    { studentId: 'UG02-132', studentName: 'Rafiul Islam', batch: 'Batch 21', status: 'Graded', marks: 98, feedback: 'Flawless AVL & Red-Black trees.', file: 'CSE301_Lab1_RafiulIslam.zip', time: '2026-06-04 08:00 PM' }
  ],
  2: [ // Mapped to Assignment ID 2: Normalization
    { studentId: 'UG02-112', studentName: 'Rafayel Ahmed', batch: 'Batch 21', status: 'Submitted', marks: null, feedback: '', file: 'BCNF_Worksheet_Rafiul.pdf', time: '2026-06-11 02:45 PM' },
    { studentId: 'UG02-145', studentName: 'Noshin Tasnim', batch: 'Batch 21', status: 'Pending', marks: null, feedback: null, file: null, time: null },
    { studentId: 'UG02-098', studentName: 'Sajjad Karim', batch: 'Batch 21', status: 'Submitted', marks: null, feedback: '', file: 'BCNF_Worksheet_Sajjad.pdf', time: '2026-06-11 05:00 PM' }
  ],
  3: [ // Mapped to Assignment ID 3: Sockets
    { studentId: 'UG02-112', studentName: 'Rafayel Ahmed', batch: 'Batch 21', status: 'Pending', marks: null, feedback: null, file: null, time: null },
    { studentId: 'UG02-145', studentName: 'Noshin Tasnim', batch: 'Batch 21', status: 'Pending', marks: null, feedback: null, file: null, time: null }
  ]
};

// Course configurations to map courseCode -> courseName
const courseDetailsMap = {
  'CSE-301': 'Advanced Data Structures & Algorithms',
  'CSE-302': 'Database Management Systems',
  'CSE-303': 'Computer Networks & Protocol Design',
  'CSE-304': 'Software Engineering & DevOps',
  'CSE-312': 'Artificial Intelligence & Neural Nets',
  'CSE-201': 'Object Oriented Programming'
};

export default function TeacherAssignments() {
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Sync state with student assignments database
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('qgenix_student_assignments');
    if (saved) {
      return JSON.parse(saved);
    }
    return []; // fallback if not initialized by student yet
  });

  // Submissions roster state
  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem('qgenix_assignment_submissions');
    return saved ? JSON.parse(saved) : initialSubmissions;
  });

  // Track state changes to local storage
  useEffect(() => {
    localStorage.setItem('qgenix_student_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('qgenix_assignment_submissions', JSON.stringify(submissions));
  }, [submissions]);

  // Tab State: 'list' | 'create' | 'submissions'
  const [activeTab, setActiveTab] = useState('list');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(1);

  // Filters for Roster list
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');

  // Form States for creating a new assignment
  const [formTitle, setFormTitle] = useState('');
  const [formCourse, setFormCourse] = useState('CSE-301');
  const [formSemester, setFormSemester] = useState('5th Semester');
  const [formBatch, setFormBatch] = useState('Batch 21');
  const [formDueDate, setFormDueDate] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formMarks, setFormMarks] = useState(100);
  const [formDescription, setFormDescription] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileSize, setAttachedFileSize] = useState('');

  // Grading states
  const [evalMarks, setEvalMarks] = useState({});
  const [evalFeedback, setEvalFeedback] = useState({});

  // Simulated indicators
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const fileInputRef = useRef(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Trigger real file input click
  const handleFileSelectClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFileName(file.name);
      setAttachedFileSize((file.size / (1024 * 1024)).toFixed(1) + ' MB');
    }
  };

  // Publish Assignment Submit Handler
  const handlePublishAssignment = (e) => {
    e.preventDefault();
    if (!formTitle || !formDueDate || !formDescription) {
      triggerToast('Please fill out all required fields.');
      return;
    }

    setIsPublishing(true);
    setPublishProgress(10);

    // Simulated RAG indexing / upload timer progress
    const interval = setInterval(() => {
      setPublishProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setPublishProgress(100);

      setTimeout(() => {
        const newAssignmentId = Date.now();
        const courseName = courseDetailsMap[formCourse] || 'Advanced Studies';

        // Parse instructions split by newline or comma
        const parsedInstructions = formInstructions
          ? formInstructions.split('\n').filter(line => line.trim() !== '')
          : ['Submit a detailed lab worksheet.', 'Plagiarism checks are enabled.'];

        const resourceList = attachedFileName 
          ? [{ id: Date.now() + 1, title: attachedFileName, size: attachedFileSize, type: 'pdf' }]
          : [];

        // 1. Construct new assignment object
        const newAssignment = {
          id: newAssignmentId,
          title: formTitle,
          courseCode: formCourse,
          courseName: courseName,
          dueDate: formDueDate,
          remainingTime: 'Upcoming task',
          status: 'Pending',
          priority: formPriority,
          description: formDescription,
          instructions: parsedInstructions,
          totalMarks: Number(formMarks),
          obtainedMarks: null,
          feedback: null,
          progressStage: 0,
          resources: resourceList,
          history: [],
          submittedFiles: [],
          batch: formBatch,
          semester: formSemester
        };

        // 2. Append to local assignments state (dynamic sync to student portal)
        setAssignments(prev => [newAssignment, ...prev]);

        // 3. Initialize mock submissions table for this new assignment
        // Map from students in active list
        const newSubmissionsList = [
          { studentId: 'UG02-112', studentName: 'Rafayel Ahmed', batch: formBatch, status: 'Pending', marks: null, feedback: null, file: null, time: null },
          { studentId: 'UG02-145', studentName: 'Noshin Tasnim', batch: formBatch, status: 'Pending', marks: null, feedback: null, file: null, time: null },
          { studentId: 'UG02-098', studentName: 'Sajjad Karim', batch: formBatch, status: 'Pending', marks: null, feedback: null, file: null, time: null }
        ];

        setSubmissions(prev => ({
          ...prev,
          [newAssignmentId]: newSubmissionsList
        }));

        // Reset form variables
        setFormTitle('');
        setFormDueDate('');
        setFormDescription('');
        setFormInstructions('');
        setAttachedFileName('');
        setAttachedFileSize('');

        setIsPublishing(false);
        setActiveTab('list');
        triggerToast(`Successfully assigned "${formTitle}" to ${formBatch}`);
      }, 300);

    }, 1200);
  };

  // Grade evaluation submission handler
  const handleGradeSubmission = (assignmentId, studentId) => {
    const marks = Number(evalMarks[studentId]);
    const feedback = evalFeedback[studentId] || '';

    if (isNaN(marks) || marks === undefined || marks === '') {
      triggerToast('Please provide a valid marks value.');
      return;
    }

    // 1. Update the teacher's submissions list
    setSubmissions(prev => {
      const updatedList = prev[assignmentId].map(sub => {
        if (sub.studentId === studentId) {
          return {
            ...sub,
            status: 'Graded',
            marks: marks,
            feedback: feedback
          };
        }
        return sub;
      });
      return {
        ...prev,
        [assignmentId]: updatedList
      };
    });

    // 2. Update the student's assignments database (so student dashboard updates in real-time)
    setAssignments(prev => prev.map(a => {
      if (a.id === Number(assignmentId)) {
        // If student matches or is the currently logged in student (simulated by updating details)
        return {
          ...a,
          status: 'Graded',
          obtainedMarks: marks,
          feedback: feedback,
          progressStage: 4 // Graded stage
        };
      }
      return a;
    }));

    triggerToast(`Marks saved successfully for candidate ID ${studentId}.`);
  };

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            a.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === 'All' || a.courseCode === courseFilter;
      const matchesBatch = batchFilter === 'All' || a.batch === batchFilter;
      
      return matchesSearch && matchesCourse && matchesBatch;
    });
  }, [assignments, searchQuery, courseFilter, batchFilter]);

  // Statistics summaries
  const statistics = useMemo(() => {
    const total = assignments.length;
    // Calculate total submissions received across all categories
    let totalSubmissions = 0;
    let pendingGrade = 0;

    Object.keys(submissions).forEach(key => {
      const subList = submissions[key] || [];
      totalSubmissions += subList.filter(s => s.status === 'Submitted' || s.status === 'Graded').length;
      pendingGrade += subList.filter(s => s.status === 'Submitted').length;
    });

    return { total, totalSubmissions, pendingGrade };
  }, [assignments, submissions]);

  // Selected assignment for submissions roster
  const activeAssignmentDetail = useMemo(() => {
    return assignments.find(a => a.id === Number(selectedAssignmentId)) || assignments[0] || null;
  }, [assignments, selectedAssignmentId]);

  const activeSubmissionsList = useMemo(() => {
    if (!activeAssignmentDetail) return [];
    return submissions[activeAssignmentDetail.id] || [];
  }, [submissions, activeAssignmentDetail]);

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* =======================================================================
         PAGE LOCAL STYLE RULES (GLASSMORPHIC THEMES)
         ======================================================================= */}
      <style>{`
        .glass-card-assignments {
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

        .glass-card-assignments:hover {
          transform: translateY(-3px) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 25px -5px     rgba(139, 92, 246, 0.15) !important;
        }

        body.light-mode .glass-card-assignments {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .glass-card-assignments:hover {
          background: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 12px 40px -10px rgba(100, 160, 220, 0.2) !important;
        }

        .glow-orb-assign-1 {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb-assign-2 {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
        }

        .tab-menu-bar {
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
        }

        body.light-mode .tab-menu-bar {
          background: rgba(0, 0, 0, 0.02);
        }

        .tab-menu-btn {
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

        .tab-menu-btn:hover {
          color: var(--text-primary);
        }

        .tab-menu-btn-active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
        }

        .sub-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
        }
        .sub-badge-pending { background: rgba(245, 158, 11, 0.12); color: var(--accent-warning); }
        .sub-badge-submitted { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
        .sub-badge-graded { background: rgba(16, 185, 129, 0.12); color: var(--accent-success); }

        .submission-row:hover {
          background: rgba(255, 255, 255, 0.015);
        }
        body.light-mode .submission-row:hover {
          background: rgba(0, 0, 0, 0.015);
        }
      `}</style>

      {/* Decorative Orbs */}
      <div className="glow-orb-assign-1" style={{ top: '10%', left: '-5%' }} />
      <div className="glow-orb-assign-2" style={{ bottom: '15%', right: '-5%' }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <FileText className="text-violet-500" size={32} />
            Assignments Manager
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Assign detailed homework worksheets, trace candidate submissions, and evaluate academic performance gradebooks.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: STATISTICS CARDS (Shown in overview)
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {/* Total Tasks */}
        <div className="glass-card-assignments" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Tasks Assigned</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
              <FileText size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {statistics.total} Homeworks
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Across all courses & semesters
            </span>
          </div>
        </div>

        {/* Submissions Received */}
        <div className="glass-card-assignments" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Submissions Received</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
              <Users size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)', fontFamily: 'var(--font-heading)' }}>
              {statistics.totalSubmissions} Submissions
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Uploaded by target candidates
            </span>
          </div>
        </div>

        {/* Ungraded Submissions */}
        <div className="glass-card-assignments" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Awaiting Evaluation</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: statistics.pendingGrade > 0 ? 'var(--accent-warning)' : 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {statistics.pendingGrade} Ungraded
            </div>
            <span style={{ fontSize: '0.72rem', color: statistics.pendingGrade > 0 ? 'var(--accent-warning)' : 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Needs scoring & feedback reviews
            </span>
          </div>
        </div>
      </div>

      {/* =======================================================================
         SECTION 3: INTERACTIVE NAVIGATION TABS
         ======================================================================= */}
      <div className="tab-menu-bar">
        <button 
          onClick={() => setActiveTab('list')}
          className={`tab-menu-btn ${activeTab === 'list' ? 'tab-menu-btn-active' : ''}`}
        >
          Active Roster
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          className={`tab-menu-btn ${activeTab === 'create' ? 'tab-menu-btn-active' : ''}`}
        >
          Assign New Work
        </button>
        <button 
          onClick={() => {
            setActiveTab('submissions');
            // Select first assignment by default if nothing selected
            if (assignments.length > 0 && !selectedAssignmentId) {
              setSelectedAssignmentId(assignments[0].id);
            }
          }}
          className={`tab-menu-btn ${activeTab === 'submissions' ? 'tab-menu-btn-active' : ''}`}
        >
          Submissions Gradebook
        </button>
      </div>

      {/* =======================================================================
         SECTION 4: ACTIVE TAB VIEWPORTS
         ======================================================================= */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: LIST ACTIVE ROSTER */}
        {activeTab === 'list' && (
          <motion.div
            key="list-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Filter toolbar card */}
            <Card className="glass-card-assignments" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Course select filter */}
                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Filter Subject</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                      <SlidersHorizontal size={14} style={{ color: 'var(--text-secondary)' }} />
                      <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="All" style={{ background: 'var(--bg-primary)' }}>All Subjects</option>
                        {Object.keys(courseDetailsMap).map(code => (
                          <option key={code} value={code} style={{ background: 'var(--bg-primary)' }}>{code}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Batch select filter */}
                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Target Batch</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                      <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                      <select
                        value={batchFilter}
                        onChange={(e) => setBatchFilter(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="All" style={{ background: 'var(--bg-primary)' }}>All Batches</option>
                        <option value="Batch 20" style={{ background: 'var(--bg-primary)' }}>Batch 20</option>
                        <option value="Batch 21" style={{ background: 'var(--bg-primary)' }}>Batch 21</option>
                        <option value="Batch 22" style={{ background: 'var(--bg-primary)' }}>Batch 22</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Search query box */}
                <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: '220px', maxWidth: '400px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Search Assignments</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text"
                      placeholder="Search title or course..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.85rem', height: '38px' }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Assignments list grid */}
            {filteredAssignments.length === 0 ? (
              <div className="glass-card-assignments" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Info size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>No Assignments Found</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  There are no worksheets published matching your filter queries. Use the "Assign New Work" tab to publish.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredAssignments.map((assign) => {
                  // Count submissions for this task
                  const subList = submissions[assign.id] || [];
                  const receivedCount = subList.filter(s => s.status === 'Submitted' || s.status === 'Graded').length;
                  const gradedCount = subList.filter(s => s.status === 'Graded').length;

                  return (
                    <div 
                      key={assign.id}
                      className="glass-card-assignments"
                      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      {/* Course badge & Priority */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                          {assign.courseCode}
                        </span>
                        
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 'bold', 
                          color: assign.priority === 'High' ? 'var(--accent-danger)' : assign.priority === 'Medium' ? 'var(--accent-warning)' : 'var(--accent-success)'
                        }}>
                          {assign.priority} Priority
                        </span>
                      </div>

                      {/* Header details */}
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>{assign.title}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                          Target: <strong>{assign.batch}</strong> • <strong>{assign.semester}</strong>
                        </span>
                      </div>

                      {/* Details row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem', fontWeight: 'bold' }}>Deadline Date</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{assign.dueDate}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem', fontWeight: 'bold' }}>Marks Depth</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{assign.totalMarks} Points</span>
                        </div>
                      </div>

                      {/* Submission status bar counts */}
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Submissions: <strong>{receivedCount} received</strong>
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Graded: <strong>{gradedCount} / {receivedCount}</strong>
                        </span>
                      </div>

                      {/* Grade submission action button */}
                      <button
                        onClick={() => {
                          setSelectedAssignmentId(assign.id);
                          setActiveTab('submissions');
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Award size={14} />
                        <span>Open Evaluation Gradebook</span>
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: CREATE/ASSIGN AN ASSIGNMENT */}
        {activeTab === 'create' && (
          <motion.div
            key="create-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ width: '100%', maxWidth: '750px', margin: '0 auto' }}
          >
            <Card title="Publish New Assignment" className="glass-card-assignments" style={{ padding: '28px' }}>
              
              <form onSubmit={handlePublishAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
                
                {/* Form fields Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  
                  {/* Title input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Assignment Title *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Lab Exercise 2: Graph Depth First Search Traversals"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Course select dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Course Code *</label>
                    <select
                      value={formCourse}
                      onChange={(e) => setFormCourse(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px' }}
                    >
                      {Object.keys(courseDetailsMap).map(code => (
                        <option key={code} value={code}>{code} - {courseDetailsMap[code].substring(0, 18)}...</option>
                      ))}
                    </select>
                  </div>

                  {/* Target Semester */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Target Semester *</label>
                    <select
                      value={formSemester}
                      onChange={(e) => setFormSemester(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px' }}
                    >
                      <option value="4th Semester">4th Semester</option>
                      <option value="5th Semester">5th Semester</option>
                      <option value="6th Semester">6th Semester</option>
                    </select>
                  </div>

                  {/* Target Batch */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Target Batch *</label>
                    <select
                      value={formBatch}
                      onChange={(e) => setFormBatch(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px' }}
                    >
                      <option value="Batch 20">Batch 20</option>
                      <option value="Batch 21">Batch 21</option>
                      <option value="Batch 22">Batch 22</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Due Date / Deadline *</label>
                    <input 
                      type="date"
                      required
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', padding: '0 10px' }}
                    />
                  </div>

                  {/* Priority Select */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Task Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px' }}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>

                  {/* Total Marks */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total Marks Depth</label>
                    <input 
                      type="number"
                      value={formMarks}
                      onChange={(e) => setFormMarks(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                </div>

                {/* Description Textarea */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Assignment Description & Details *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write a clear statement of the assignment problem, expected outcomes, and parameters..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="input-field"
                    style={{ padding: '12px', fontSize: '0.85rem', minHeight: '80px', resize: 'vertical' }}
                  />
                </div>

                {/* Bullet instructions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Additional Submission Instructions (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Code files must be zipped.&#10;Plagiarism checks are enabled.&#10;Provide rotation graphs inside PDF."
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    className="input-field"
                    style={{ padding: '12px', fontSize: '0.85rem', minHeight: '60px', resize: 'vertical' }}
                  />
                </div>

                {/* File picker section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Attach Reference Materials (Option)</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    
                    {/* Hidden input */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      accept=".pdf,.docx,.zip,.yml"
                    />

                    {/* Styled picker */}
                    <div 
                      onClick={handleFileSelectClick}
                      className="input-field"
                      style={{ flex: 1, height: '38px', borderRadius: '10px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', padding: '0 12px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', justifyContent: 'space-between', color: attachedFileName ? 'var(--text-primary)' : 'var(--text-muted)' }}
                    >
                      <span>{attachedFileName || 'Select document file from device...'}</span>
                      <FileUp size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>

                    {attachedFileName && (
                      <button 
                        type="button"
                        onClick={() => { setAttachedFileName(''); setAttachedFileSize(''); }}
                        className="btn btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '0.75rem', borderRadius: '8px', color: 'var(--accent-danger)' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar loader overlay */}
                <AnimatePresence>
                  {isPublishing && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}
                    >
                      <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${publishProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', transition: 'width 0.15s linear' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Syncing document database & generating proctored RAG schemas... {publishProgress}%
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('list')}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px' }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.82rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', opacity: isPublishing ? 0.7 : 1 }}
                  >
                    {isPublishing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <PlusCircle size={14} />
                    )}
                    <span>{isPublishing ? 'Publishing...' : 'Publish Assignment'}</span>
                  </button>
                </div>

              </form>

            </Card>
          </motion.div>
        )}

        {/* TAB 3: SUBMISSIONS GRADEBOOK */}
        {activeTab === 'submissions' && (
          <motion.div
            key="submissions-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Active task select row */}
            <Card className="glass-card-assignments" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Select Assignment:</label>
                  
                  <select
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(Number(e.target.value))}
                    className="input-field"
                    style={{ flex: 1, height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px', borderRadius: '10px' }}
                  >
                    {assignments.map(a => (
                      <option key={a.id} value={a.id}>{a.courseCode} - {a.title.substring(0, 32)}...</option>
                    ))}
                  </select>
                </div>
                
                {activeAssignmentDetail && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                    <span>Target: <strong>{activeAssignmentDetail.batch}</strong></span>
                    <span>Total Marks: <strong>{activeAssignmentDetail.totalMarks}</strong></span>
                  </div>
                )}
              </div>
            </Card>

            {/* Submissions list roster */}
            {!activeAssignmentDetail ? (
              <div className="glass-card-assignments" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--text-muted)', margin: 0 }}>No Active Assignments</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Publish an assignment first to check student submissions list here.
                </p>
              </div>
            ) : (
              <Card title={`Submission Roster — ${activeAssignmentDetail.title}`} className="glass-card-assignments">
                <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                        <th style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Student Candidate</th>
                        <th style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Student ID</th>
                        <th style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Submission Date</th>
                        <th style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Uploaded File</th>
                        <th style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Status</th>
                        <th style={{ padding: '14px 16px', fontWeight: 'bold', color: 'var(--text-secondary)', width: '280px' }}>Evaluation Scoring & Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSubmissionsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No student submissions found for this assignment yet.
                          </td>
                        </tr>
                      ) : (
                        activeSubmissionsList.map((sub, idx) => {
                          const isPending = sub.status === 'Pending';
                          const isSubmitted = sub.status === 'Submitted';
                          const isGraded = sub.status === 'Graded';

                          const statusBadgeClass = isPending ? 'sub-badge-pending' :
                                                   isSubmitted ? 'sub-badge-submitted' :
                                                   'sub-badge-graded';

                          // Initialize state values for input bindings in evaluation box
                          if (evalMarks[sub.studentId] === undefined && isGraded) {
                            evalMarks[sub.studentId] = sub.marks;
                          }
                          if (evalFeedback[sub.studentId] === undefined && isGraded) {
                            evalFeedback[sub.studentId] = sub.feedback;
                          }

                          return (
                            <tr 
                              key={sub.studentId} 
                              className="submission-row"
                              style={{ borderBottom: idx !== activeSubmissionsList.length - 1 ? '1px solid var(--border-color)' : 'none' }}
                            >
                              {/* Student Details */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                    {sub.studentName.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{sub.studentName}</div>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub.batch}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Student ID */}
                              <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 600 }}>
                                {sub.studentId}
                              </td>

                              {/* Submission date */}
                              <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                                {sub.time ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={12} className="text-violet-400" />
                                    <span>{sub.time}</span>
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                                )}
                              </td>

                              {/* Uploaded File name */}
                              <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                {sub.file ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FileText size={14} className="text-violet-400" />
                                    <span style={{ textDecoration: 'underline', cursor: 'pointer' }} title="Download submission file">
                                      {sub.file}
                                    </span>
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>No File</span>
                                )}
                              </td>

                              {/* Status badge */}
                              <td style={{ padding: '12px 16px' }}>
                                <span className={`sub-badge ${statusBadgeClass}`}>{sub.status}</span>
                              </td>

                              {/* Grading evaluation panel */}
                              <td style={{ padding: '12px 16px' }}>
                                {isPending ? (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Awaiting student upload</span>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                      {/* Marks input */}
                                      <input 
                                        type="number"
                                        min="0"
                                        max={activeAssignmentDetail.totalMarks}
                                        placeholder="Marks"
                                        value={evalMarks[sub.studentId] !== undefined ? evalMarks[sub.studentId] : ''}
                                        onChange={(e) => setEvalMarks({ ...evalMarks, [sub.studentId]: e.target.value })}
                                        className="input-field"
                                        style={{ width: '70px', height: '30px', padding: '0 6px', fontSize: '0.78rem', borderRadius: '6px', textAlign: 'center' }}
                                      />
                                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/ {activeAssignmentDetail.totalMarks}</span>
                                      
                                      <button
                                        onClick={() => handleGradeSubmission(activeAssignmentDetail.id, sub.studentId)}
                                        className="btn btn-primary"
                                        style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', height: '30px', display: 'flex', alignItems: 'center', gap: '3px' }}
                                      >
                                        <Edit3 size={11} />
                                        <span>Evaluate</span>
                                      </button>
                                    </div>

                                    {/* Feedback input */}
                                    <input 
                                      type="text"
                                      placeholder="Feedback note..."
                                      value={evalFeedback[sub.studentId] !== undefined ? evalFeedback[sub.studentId] : ''}
                                      onChange={(e) => setEvalFeedback({ ...evalFeedback, [sub.studentId]: e.target.value })}
                                      className="input-field"
                                      style={{ height: '28px', padding: '0 8px', fontSize: '0.75rem', borderRadius: '6px' }}
                                    />
                                    
                                    {isGraded && (
                                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <Check size={10} /> Saved: {sub.marks} pts (Grade released)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>

                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* =======================================================================
         SECTION 5: TOAST ALERTS
         ======================================================================= */}
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

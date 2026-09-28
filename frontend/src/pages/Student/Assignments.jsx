// ============================================================================
// Assignments.jsx — QGenix Student Assignments Management Component
// ============================================================================
// Comprehensive student assignments tracker. Designed with premium liquid
// glassmorphic panels, workflow progress tracks, interactive submission boxes,
// monthly calendar trackers, and real-time query filtering.
// Fully responsive on all device configurations (Mobile, Tablet, Desktop).
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষার্থীদের চলমান, আসন্ন, এবং জমা দেওয়া অ্যাসাইনমেন্টের তালিকা দেখায়।
// ব্যবহারকারী চাইলে অ্যাসাইনমেন্টের বিস্তারিত দেখে ফাইল আপলোড, জমা এবং গ্রেডিং দেখতে পারেন।
// এটি সম্পূর্ণ রেসপন্সিভ এবং লাইট/ডার্ক থিম সাপোর্টেড।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, 
  Upload, Trash2, Eye, BookOpen, ChevronRight, Download, 
  RefreshCw, SlidersHorizontal, Search, Award, Info, 
  Calendar, Check, X, ShieldAlert, Sparkles, Bell
} from 'lucide-react';
import Card from '../../components/Card';

// ----------------------------------------------------------------------------
// 1. MOCK DATA: STUDENT ASSIGNMENTS DATABASE
// ----------------------------------------------------------------------------
const initialAssignments = [
  {
    id: 1,
    title: 'Lab Assignment 1: Self-Balancing Trees',
    courseCode: 'CSE-301',
    courseName: 'Advanced Data Structures & Algorithms',
    dueDate: '2026-06-05',
    remainingTime: 'Submitted 14 days ago',
    status: 'Graded',
    priority: 'High',
    description: 'Implement AVL and Red-Black tree insertion and deletion algorithms. You must write clean, documented code and perform comparison experiments plotting rotation counts.',
    instructions: [
      'Write code in clean Java or C++ files.',
      'Submit a zipped file containing the code, diagrams, and experimental PDF reports.',
      'Plagiarism checks are enabled. Shared or copied solutions will receive a zero mark.'
    ],
    totalMarks: 100,
    obtainedMarks: 94,
    feedback: 'Excellent implementation of Red-Black tree balances! Rotation graphs are highly analytical and readable. Code documentation is up to corporate standards.',
    progressStage: 4, // 0: Not Started, 1: In Progress, 2: Submitted, 3: Reviewed, 4: Graded
    resources: [
      { id: 101, title: 'Experimental Spec Sheet.pdf', size: '1.2 MB', type: 'pdf' },
      { id: 102, title: 'AVL Rotations Demo Code.zip', size: '4.8 MB', type: 'zip' }
    ],
    history: [
      { version: 2, time: '2026-06-04 10:15 PM', count: 2, status: 'Graded', marks: 94 },
      { version: 1, time: '2026-06-02 04:30 PM', count: 1, status: 'Overwritten', marks: null }
    ],
    submittedFiles: [
      { name: 'CSE301_Lab1_Rafiul.zip', size: '5.2 MB', time: '2026-06-04 10:15 PM' }
    ]
  },
  {
    id: 2,
    title: 'Schema Normalization & BCNF Worksheet',
    courseCode: 'CSE-302',
    courseName: 'Database Management Systems',
    dueDate: '2026-06-12',
    remainingTime: 'Submitted 7 days ago',
    status: 'Submitted',
    priority: 'Medium',
    description: 'Decompose relation schemas into 3NF and BCNF. Provide formal proofs utilizing functional dependencies, closure sets, and lossless join dependencies.',
    instructions: [
      'Submission must be in PDF format.',
      'Handwritten, scanned, or typed documents are acceptable as long as formulas are legible.',
      'Show clear step-by-step attributes closures computation.'
    ],
    totalMarks: 50,
    obtainedMarks: null,
    feedback: 'Pending evaluation by Prof. M. Rahman.',
    progressStage: 2, // Submitted
    resources: [
      { id: 201, title: 'Normalization Practice Questions.pdf', size: '940 KB', type: 'pdf' }
    ],
    history: [
      { version: 1, time: '2026-06-11 02:45 PM', count: 1, status: 'Submitted', marks: null }
    ],
    submittedFiles: [
      { name: 'BCNF_Worksheet_Rafiul.pdf', size: '1.8 MB', time: '2026-06-11 02:45 PM' }
    ]
  },
  {
    id: 3,
    title: 'Socket Programming & TCP Server',
    courseCode: 'CSE-303',
    courseName: 'Computer Networks & Protocol Design',
    dueDate: '2026-06-22',
    remainingTime: '2 days remaining',
    status: 'In Progress',
    priority: 'High',
    description: 'Design and implement a multi-threaded TCP chat server using socket APIs. The server must handle concurrent client sessions, transmit chat broadcasts, and support file transfers.',
    instructions: [
      'Use Python socket or C sockets framework.',
      'Submit the complete source folder zipped.',
      'Include a README file explaining compilation steps and port settings.'
    ],
    totalMarks: 100,
    obtainedMarks: null,
    feedback: null,
    progressStage: 1, // In Progress
    resources: [
      { id: 301, title: 'Socket API Quick Starter.pdf', size: '2.1 MB', type: 'pdf' },
      { id: 302, title: 'TCP Connection Handshake Slides.pdf', size: '3.4 MB', type: 'pdf' }
    ],
    history: [],
    submittedFiles: []
  },
  {
    id: 4,
    title: 'CI/CD Pipeline Configurations (YAML)',
    courseCode: 'CSE-304',
    courseName: 'Software Engineering & DevOps',
    dueDate: '2026-06-25',
    remainingTime: '5 days remaining',
    status: 'Pending',
    priority: 'Medium',
    description: 'Construct a GitHub Actions pipeline file doing unit testing, container build validation, Docker Hub registration, and staging server deployments.',
    instructions: [
      'Write configuration inside a standard `.github/workflows/main.yml` schema layout.',
      'Use env variables and mock staging secrets securely.',
      'Verify container health check status in testing stages.'
    ],
    totalMarks: 75,
    obtainedMarks: null,
    feedback: null,
    progressStage: 0, // Not Started
    resources: [
      { id: 401, title: 'Sample Workflow Pipeline Template.yml', size: '420 KB', type: 'code' }
    ],
    history: [],
    submittedFiles: []
  },
  {
    id: 5,
    title: 'Machine Learning Basics & Linear Regressions',
    courseCode: 'CSE-401',
    courseName: 'Machine Learning & Neural Networks',
    dueDate: '2026-06-18',
    remainingTime: '2 days overdue',
    status: 'Pending',
    priority: 'High',
    description: 'Train a linear regression model from scratch. Compute optimal weights using gradient descent and plot losses convergence graphs. Submit a Jupyter notebook code review.',
    instructions: [
      'Submit raw Jupyter Notebook (.ipynb file).',
      'All plots must contain labels, units, and clear legends.',
      'Explain the mathematical choice of learning rates.'
    ],
    totalMarks: 80,
    obtainedMarks: null,
    feedback: null,
    progressStage: 0, // Not Started (But due date passed = Overdue)
    resources: [
      { id: 501, title: 'Housing Prices Training Dataset.csv', size: '1.6 MB', type: 'data' }
    ],
    history: [],
    submittedFiles: []
  }
];

// Mock System notifications for Assignment Events
const initialNotifications = [
  { id: 1001, text: 'Assignment "Socket Programming" is due in 2 days.', type: 'alert', time: 'Today, 09:00 AM' },
  { id: 1002, text: 'Grade released: "Lab Assignment 1" scored 94/100.', type: 'success', time: 'Yesterday, 04:15 PM' },
  { id: 1003, text: 'Assignment "Machine Learning Basics" is OVERDUE!', type: 'danger', time: 'June 18, 11:59 PM' },
  { id: 1004, text: 'Prof. M. Rahman assigned "Schema Normalization Worksheet".', type: 'info', time: 'June 10, 08:30 AM' }
];

export default function Assignments() {
  // Theme sync observer
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Primary page states
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('qgenix_student_assignments');
    return saved ? JSON.parse(saved) : initialAssignments;
  });
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedAssignment, setSelectedAssignment] = useState(assignments[2]); // Default select "Socket Programming"
  
  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deadlineFilter, setDeadlineFilter] = useState('All'); // 'All' | 'Overdue' | 'Soon'

  // Submission Box file interaction states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Resource downloading simulated loaders
  const [downloadingId, setDownloadingId] = useState(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('qgenix_student_assignments', JSON.stringify(assignments));
  }, [assignments]);

  // Sync selected assignment with changes
  const activeAssignment = useMemo(() => {
    return assignments.find(a => a.id === selectedAssignment.id) || selectedAssignment;
  }, [assignments, selectedAssignment]);

  // Statistics calculation
  const statsOverview = useMemo(() => {
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'Pending' || a.status === 'In Progress').length;
    const submitted = assignments.filter(a => a.status === 'Submitted' || a.status === 'Graded' || a.status === 'Reviewed').length;
    
    // Check overdue: Pending or In Progress where due date has passed
    const nowStr = '2026-06-20'; // Reference time
    const overdue = assignments.filter(a => 
      (a.status === 'Pending' || a.status === 'In Progress') && 
      new Date(a.dueDate) < new Date(nowStr)
    ).length;

    // Average grade computed from graded scores
    const graded = assignments.filter(a => a.status === 'Graded');
    const avgScore = graded.length > 0
      ? (graded.reduce((acc, curr) => acc + (curr.obtainedMarks / curr.totalMarks * 100), 0) / graded.length).toFixed(1)
      : '0.0';

    return [
      { label: 'Total Assignments', value: total, desc: 'Assigned this sem', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', icon: <FileText size={18} /> },
      { label: 'Pending Action', value: pending, desc: 'Needs development', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', icon: <Clock size={18} /> },
      { label: 'Submitted Tasks', value: submitted, desc: 'Awaiting reviews', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircle size={18} /> },
      { label: 'Overdue Warnings', value: overdue, desc: 'Missed deadlines', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <AlertTriangle size={18} /> },
      { label: 'Average Score', value: `${avgScore}%`, desc: 'Academic status', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: <TrendingUp size={18} /> }
    ];
  }, [assignments]);

  // Filtered lists logic
  const filteredAssignments = useMemo(() => {
    const nowStr = '2026-06-20';
    return assignments.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCourse = courseFilter === 'All' || a.courseCode === courseFilter;
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      
      let matchDeadline = true;
      if (deadlineFilter === 'Overdue') {
        matchDeadline = (a.status === 'Pending' || a.status === 'In Progress') && new Date(a.dueDate) < new Date(nowStr);
      } else if (deadlineFilter === 'Soon') {
        const diff = new Date(a.dueDate) - new Date(nowStr);
        const days = diff / (1000 * 60 * 60 * 24);
        matchDeadline = days >= 0 && days <= 3;
      }

      return matchSearch && matchCourse && matchStatus && matchDeadline;
    });
  }, [assignments, searchQuery, courseFilter, statusFilter, deadlineFilter]);

  // Upcoming non-submitted assignments list (Sorted by nearest deadlines)
  const upcomingAssignments = useMemo(() => {
    const nowStr = '2026-06-20';
    return assignments
      .filter(a => (a.status === 'Pending' || a.status === 'In Progress') && new Date(a.dueDate) >= new Date(nowStr))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [assignments]);

  // Overdue warnings list
  const overdueAssignments = useMemo(() => {
    const nowStr = '2026-06-20';
    return assignments.filter(a => 
      (a.status === 'Pending' || a.status === 'In Progress') && 
      new Date(a.dueDate) < new Date(nowStr)
    );
  }, [assignments]);

  // Unique course codes list for filters
  const courseList = useMemo(() => {
    return ['All', ...new Set(assignments.map(a => a.courseCode))];
  }, [assignments]);

  // Simulated download triggers
  const handleDownloadResource = (resource) => {
    setDownloadingId(resource.id);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Success: Resource file "${resource.title}" successfully downloaded!`);
    }, 1200);
  };

  // Submission handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type: PDF, DOCX, ZIP
    const ext = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['pdf', 'docx', 'zip'];
    if (!validExtensions.includes(ext)) {
      triggerToast('Only PDF, DOCX, and ZIP files are allowed!', 'danger');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      triggerToast('Maximum file size is 10 MB!', 'danger');
      return;
    }

    setSelectedFile(file);
  };

  // Submit file logic
  const handleUploadSubmit = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        // Update assignment in database
        setAssignments(prev => prev.map(a => {
          if (a.id === activeAssignment.id) {
            const timeStr = '2026-06-20 02:40 PM';
            const newHistoryItem = {
              version: a.history.length + 1,
              time: timeStr,
              count: a.history.length + 1,
              status: 'Submitted',
              marks: null
            };
            const fileItem = {
              name: selectedFile.name,
              size: (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB',
              time: timeStr
            };
            return {
              ...a,
              status: 'Submitted',
              progressStage: 2, // Submitted stage
              remainingTime: 'Submitted just now',
              submittedFiles: [fileItem],
              history: [newHistoryItem, ...a.history]
            };
          }
          return a;
        }));

        // Add success notification
        setNotifications(prev => [
          { id: Date.now(), text: `Submission successful for "${activeAssignment.title}".`, type: 'success', time: 'Just now' },
          ...prev
        ]);

        setIsUploading(false);
        setSelectedFile(null);
        triggerToast('Assignment submitted successfully!', 'success');
      }, 300);
    }, 1500);
  };

  // Toast alert trigger
  const triggerToast = (msg, type) => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --------------------------------------------------------------------------
  // MONTHLY CALENDAR DRAW LOGIC (June 2026)
  // --------------------------------------------------------------------------
  // June 2026 details:
  // Total Days: 30
  // Starts on: Monday (Weekday index 0 if Mon-Sun layout, or 1 if Sun-Sat)
  // We lay out Mon-Sun: Mon (1) ➔ Sun (7). Grid starts on Mon. June 1 is Mon (index 0).
  const calendarCells = useMemo(() => {
    const days = [];
    // 30 days in June 2026
    for (let d = 1; d <= 30; d++) {
      // Check if there is an assignment due on this date (Format: 2026-06-DD)
      const dateStr = `2026-06-${d < 10 ? '0' + d : d}`;
      const dueItems = assignments.filter(a => a.dueDate === dateStr);
      
      let statusColor = null; // 'green' | 'yellow' | 'red'
      if (dueItems.length > 0) {
        // Determine status priority colors
        const hasOverdue = dueItems.some(a => (a.status === 'Pending' || a.status === 'In Progress') && new Date(a.dueDate) < new Date('2026-06-20'));
        const hasUpcoming = dueItems.some(a => (a.status === 'Pending' || a.status === 'In Progress') && new Date(a.dueDate) >= new Date('2026-06-20'));
        
        if (hasOverdue) {
          statusColor = 'red';
        } else if (hasUpcoming) {
          statusColor = 'yellow';
        } else {
          statusColor = 'green'; // All submitted
        }
      }

      days.push({
        day: d,
        dateStr,
        dueAssignments: dueItems,
        color: statusColor
      });
    }
    return days;
  }, [assignments]);

  // Click handler on calendar cell to filter table to that day
  const handleCalendarCellClick = (cell) => {
    if (cell.dueAssignments.length > 0) {
      setSearchQuery(cell.dueAssignments[0].title);
      triggerToast(`Filtered by deadlines on June ${cell.day}`, 'info');
    } else {
      setSearchQuery('');
      setCourseFilter('All');
      setStatusFilter('All');
      setDeadlineFilter('All');
    }
  };

  // Reset all filters shortcut
  const handleResetFilters = () => {
    setSearchQuery('');
    setCourseFilter('All');
    setStatusFilter('All');
    setDeadlineFilter('All');
    triggerToast('Filters reset successfully.', 'success');
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* ----------------------------------------------------------------------
         PAGE LOCAL LIQUID GLASS STYLES
         ---------------------------------------------------------------------- */}
      <style>{`
        /* Progress timeline flow trackers */
        .progress-flow-node {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          z-index: 10;
        }

        .progress-flow-line {
          position: absolute;
          top: 15px;
          left: 50%;
          right: -50%;
          height: 3px;
          background: rgba(255, 255, 255, 0.08);
          z-index: 1;
        }

        body.light-mode .progress-flow-line {
          background: rgba(0, 0, 0, 0.06);
        }

        .progress-flow-line-active {
          background: linear-gradient(90deg, #8B5CF6, #3B82F6) !important;
        }

        /* Responsive stats layout */
        .assignments-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 640px) {
          .assignments-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .assignments-stats-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        /* 3-Column main portal matrix configuration */
        .assignments-portal-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .assignments-portal-grid {
            grid-template-columns: 2fr 1fr;
          }
        }

        /* Custom calendar circular dots overlay shadow styles */
        .calendar-badge-green { box-shadow: 0 0 10px rgba(16, 185, 129, 0.6); }
        .calendar-badge-yellow { box-shadow: 0 0 10px rgba(245, 158, 11, 0.6); }
        .calendar-badge-red { box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); }
      `}</style>

      {/* Floating accent background glows */}
      <div className="glow-orb-purple" style={{ top: '15%', left: '-15%', position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0) 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />
      <div className="glow-orb-blue" style={{ bottom: '25%', right: '-15%', position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* =======================================================================
         SECTION 1 — PAGE HEADER & GLOBAL NOTIFICATION TOAST
         ======================================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Assignments Module
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Submit worksheets, trace evaluations feedback, and follow tasks checklists
          </p>
        </div>

        {/* Shortcut Action Button */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleResetFilters}
            className="navbar-btn-hover btn-glass-cta flex items-center gap-2"
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              fontSize: '0.88rem'
            }}
          >
            <RefreshCw size={16} />
            <span>Reset Layout</span>
          </button>
        </div>
      </div>

      {/* Success / Error Notification Toast banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel"
            style={{
              background: toastType === 'success' 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)',
              border: toastType === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.9rem',
              boxShadow: toastType === 'success' ? '0 8px 30px rgba(16, 185, 129, 0.12)' : '0 8px 30px rgba(239, 68, 68, 0.12)'
            }}
          >
            {toastType === 'success' ? (
              <CheckCircle size={18} style={{ color: '#10B981' }} />
            ) : (
              <AlertTriangle size={18} style={{ color: '#EF4444' }} />
            )}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================================
         SECTION 2 — SUMMARY OVERVIEW CARDS
         ======================================================================= */}
      <div className="assignments-stats-grid">
        {statsOverview.map((stat, idx) => (
          <div 
            key={idx}
            className="glass-panel premium-card" 
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px'
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
      </div>

      {/* =======================================================================
         SECTION 3 — CORE LAYOUT: PORTAL GRID (LEFT: LISTS, RIGHT: DETAILS)
         ======================================================================= */}
      <div className="assignments-portal-grid">
        
        {/* ==================== LEFT PANEL: LISTINGS & TABLES ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Assignments Table Container */}
          <div className="glass-panel premium-card" style={{ padding: '24px' }}>
            
            {/* Header / Query Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Active Assignments</h3>
              
              {/* Search input */}
              <div style={{ display: 'flex', gap: '8px', width: '100%', smWidth: 'auto', maxWidth: '300px', position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field navbar-search-input"
                  style={{ paddingRight: '36px', height: '40px', borderRadius: '10px', fontSize: '0.85rem' }}
                />
                <Search size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Filter controls row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              
              {/* Course filter select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Subject</span>
                <select 
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="input-field"
                  style={{ width: '130px', height: '36px', padding: '0 8px', borderRadius: '8px', fontSize: '0.8rem', background: 'var(--bg-primary)' }}
                >
                  {courseList.map((code, idx) => (
                    <option key={idx} value={code}>{code}</option>
                  ))}
                </select>
              </div>

              {/* Status filter select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Status</span>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                  style={{ width: '130px', height: '36px', padding: '0 8px', borderRadius: '8px', fontSize: '0.8rem', background: 'var(--bg-primary)' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Graded">Graded</option>
                </select>
              </div>

              {/* Deadline filter select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Deadlines</span>
                <select 
                  value={deadlineFilter}
                  onChange={(e) => setDeadlineFilter(e.target.value)}
                  className="input-field"
                  style={{ width: '130px', height: '36px', padding: '0 8px', borderRadius: '8px', fontSize: '0.8rem', background: 'var(--bg-primary)' }}
                >
                  <option value="All">All Dates</option>
                  <option value="Soon">Due in 3 Days</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Table layout */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Assignment Title</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Course</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Due Date</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No assignments match your filter selection criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((a, idx) => {
                      // Status Badge configuration
                      const statusStyles = {
                        Pending: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
                        'In Progress': { text: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
                        Submitted: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
                        Graded: { text: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' }
                      };
                      const stat = statusStyles[a.status] || { text: '#fff', bg: 'rgba(255,255,255,0.05)' };

                      // Priority styling
                      const priorityColors = {
                        High: '#EF4444',
                        Medium: '#F59E0B',
                        Low: '#10B981'
                      };

                      return (
                        <tr 
                          key={a.id} 
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: activeAssignment.id === a.id ? 'rgba(139, 92, 246, 0.05)' : (idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'),
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedAssignment(a)}
                          className="hover-resource-row"
                        >
                          <td style={{ padding: '14px 16px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{a.title}</td>
                          <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{a.courseCode}</td>
                          <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{a.dueDate}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.remainingTime}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              color: stat.text,
                              background: stat.bg,
                              padding: '4px 10px',
                              borderRadius: '12px',
                              whiteSpace: 'nowrap'
                            }}>
                              {a.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedAssignment(a); }}
                              className="btn-glass-cta gap-1.5"
                              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem' }}
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Overdue Warnings Card List (Red themed alert panel) */}
          {overdueAssignments.length > 0 && (
            <div 
              className="glass-panel premium-card animate-fade-in"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(22, 30, 49, 0.6) 100%)',
                border: '1.5px solid rgba(239, 68, 68, 0.25)',
                padding: '24px',
                borderRadius: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <ShieldAlert size={20} style={{ color: '#EF4444' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#EF4444' }}>Overdue Assignment Warning</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {overdueAssignments.map(a => (
                  <div 
                    key={a.id}
                    style={{
                      background: 'rgba(239, 68, 68, 0.04)',
                      border: '1px solid rgba(239, 68, 68, 0.1)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedAssignment(a)}
                    className="hover-resource-row"
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{a.title}</h4>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>Course: {a.courseCode}</span>
                        <span>Due: {a.dueDate}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      Overdue
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Assignments Quick Panel */}
          <div className="glass-panel premium-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Upcoming Deadlines</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="md:grid-cols-2">
              {upcomingAssignments.map(a => {
                const priorityColors = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' };
                return (
                  <div 
                    key={a.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedAssignment(a)}
                    className="hover-resource-row"
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>{a.courseCode}</span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          color: priorityColors[a.priority],
                          background: `${priorityColors[a.priority]}12`,
                          padding: '2px 6px',
                          borderRadius: '6px'
                        }}>{a.priority}</span>
                      </div>
                      <h4 style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700' }}>{a.title}</h4>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        <span>{a.remainingTime}</span>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ==================== RIGHT PANEL: ASSIGNMENT DETAILS & WORKFLOWS ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Assignment Details panel */}
          <div className="glass-panel premium-card" style={{ padding: '24px' }}>
            
            {/* Title Block */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#8B5CF6', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                {activeAssignment.courseCode} — {activeAssignment.courseName}
              </span>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeAssignment.title}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>Due: {activeAssignment.dueDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>Marks: {activeAssignment.totalMarks}</span>
                </div>
              </div>
            </div>

            {/* Workflow Progress Tracker */}
            <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>
                Assignment Workflow Progress
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                
                {/* 5 Stages mapping */}
                {['Not Started', 'In Progress', 'Submitted', 'Reviewed', 'Graded'].map((label, idx) => {
                  const isActive = activeAssignment.progressStage >= idx;
                  return (
                    <div key={idx} className="progress-flow-node">
                      {/* Connection Line */}
                      {idx < 4 && (
                        <div className={`progress-flow-line ${activeAssignment.progressStage > idx ? 'progress-flow-line-active' : ''}`} />
                      )}
                      
                      {/* Circular stage index indicator */}
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: isActive ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : 'var(--bg-primary)',
                        border: isActive ? 'none' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? '#fff' : 'var(--text-muted)',
                        fontSize: '0.72rem',
                        fontWeight: 'bold',
                        boxShadow: isActive ? '0 0 10px rgba(139, 92, 246, 0.4)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>
                        {isActive ? <Check size={14} /> : idx + 1}
                      </div>
                      
                      {/* Stage Label */}
                      <span style={{
                        fontSize: '0.62rem',
                        marginTop: '6px',
                        fontWeight: '700',
                        textAlign: 'center',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                      }}>
                        {label}
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Description & Instructions Tab Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Description</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  {activeAssignment.description}
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Instructions</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {activeAssignment.instructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Grading & Feedback section */}
            {activeAssignment.status === 'Graded' && (
              <div 
                className="glass-panel"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(22, 30, 49, 0.5) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={16} style={{ color: '#8B5CF6' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#8B5CF6' }}>Grade & Evaluation Feedback</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', padding: '3px 8px', borderRadius: '8px' }}>
                    Evaluation Complete
                  </span>
                </div>
                
                {/* Score & percentage rail */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {activeAssignment.obtainedMarks}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{activeAssignment.totalMarks}</span>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Score Percentile</span>
                      <span style={{ color: '#8B5CF6', fontWeight: 'bold' }}>
                        {((activeAssignment.obtainedMarks / activeAssignment.totalMarks) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${(activeAssignment.obtainedMarks / activeAssignment.totalMarks) * 100}%`, 
                          height: '100%', 
                          background: 'linear-gradient(to right, #8B5CF6, #3B82F6)', 
                          borderRadius: '10px' 
                        }} 
                      />
                    </div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', fontStyle: 'italic' }}>
                  " {activeAssignment.feedback} "
                </p>
              </div>
            )}

            {/* Submitted History/Status (Pending Review) */}
            {activeAssignment.status === 'Submitted' && (
              <div 
                className="glass-panel"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(22, 30, 49, 0.5) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle size={16} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10B981' }}>Submission Received</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {activeAssignment.feedback}
                </p>
              </div>
            )}

            {/* Attached Resources Downloader */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>
                Attached Learning Resources
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeAssignment.resources.map(res => (
                  <div 
                    key={res.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '10px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <BookOpen size={16} style={{ color: '#3B82F6' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{res.title}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Format: {res.type.toUpperCase()} • Size: {res.size}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadResource(res)}
                      disabled={downloadingId === res.id}
                      className="btn-glass-cta"
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {downloadingId === res.id ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Download size={12} />
                      )}
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* File Submission Box */}
            {(activeAssignment.status === 'Pending' || activeAssignment.status === 'In Progress' || activeAssignment.status === 'Submitted') && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>
                  {activeAssignment.status === 'Submitted' ? 'Resubmit / Replace Submission' : 'Submit Your Solution'}
                </span>
                
                {/* File Uploader Frame */}
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.01)',
                  padding: '24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative'
                }}>
                  <Upload size={32} style={{ color: '#8B5CF6', opacity: 0.8 }} />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>
                      Drag and drop your file here, or <label style={{ color: '#8B5CF6', textDecoration: 'underline', cursor: 'pointer' }}>browse
                        <input 
                          type="file" 
                          onChange={handleFileChange}
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Supported formats: PDF, DOCX, ZIP (Max 10 MB)
                    </span>
                  </div>
                </div>

                {/* Uploading Progress Spinner */}
                {isUploading && (
                  <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Uploading submission files...</span>
                      <span style={{ color: '#8B5CF6', fontWeight: 'bold' }}>{uploadProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(to right, #8B5CF6, #3B82F6)', transition: 'width 0.2s ease' }} />
                    </div>
                  </div>
                )}

                {/* Selected File Previews */}
                {selectedFile && !isUploading && (
                  <div 
                    className="glass-panel animate-fade-in"
                    style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(139, 92, 246, 0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={16} style={{ color: '#8B5CF6' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedFile.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={handleUploadSubmit}
                        className="btn-glass-cta"
                        style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', background: '#8B5CF6', color: '#fff' }}
                      >
                        Submit
                      </button>
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="btn-close-modal"
                        style={{ width: '28px', height: '28px' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Submitted Files Records Details */}
                {activeAssignment.submittedFiles.length > 0 && !selectedFile && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Active Submission:</span>
                    {activeAssignment.submittedFiles.map((file, idx) => (
                      <div 
                        key={idx}
                        style={{
                          background: 'rgba(16, 185, 129, 0.03)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CheckCircle size={16} style={{ color: '#10B981' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{file.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Submitted: {file.time} • Size: {file.size}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 'bold' }}>Active</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* Submission History timeline */}
            {activeAssignment.history.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '24px' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>
                  Submission Upload History
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeAssignment.history.map((hist, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        borderLeft: hist.status === 'Graded' || hist.status === 'Submitted' ? '3px solid #10B981' : '3px solid var(--border-color)',
                        background: 'rgba(255,255,255,0.01)',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Version {hist.version} ({hist.status})</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Uploaded: {hist.time}</span>
                      </div>
                      
                      {hist.marks && (
                        <span style={{ fontWeight: 'bold', color: '#8B5CF6' }}>Score: {hist.marks}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Calendar monthly view */}
          <div className="glass-panel premium-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: '#8B5CF6' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Deadlines Calendar</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>June 2026</span>
            </div>

            {/* Weekdays layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
                <span key={idx} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{d}</span>
              ))}
            </div>

            {/* Grid days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {calendarCells.map((cell, idx) => {
                const borderColors = { green: '#10B981', yellow: '#F59E0B', red: '#EF4444' };
                
                return (
                  <div 
                    key={idx}
                    onClick={() => handleCalendarCellClick(cell)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      background: cell.color ? `${borderColors[cell.color]}12` : 'rgba(255,255,255,0.01)',
                      border: cell.color ? `1.5px solid ${borderColors[cell.color]}50` : '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="hover-resource-row"
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: cell.color ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {cell.day}
                    </span>
                    
                    {/* Small Status bullet indicator */}
                    {cell.color && (
                      <span 
                        className={`calendar-badge-${cell.color}`}
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: borderColors[cell.color]
                        }} 
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calendar indicators guide map */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Submitted</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Upcoming</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Overdue</span>
              </div>
            </div>

          </div>

          {/* Notifications panel */}
          <div className="glass-panel premium-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} style={{ color: '#8B5CF6' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Due Notifications</h3>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)' }}>Live Alerts</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map(n => {
                const colorMap = {
                  alert: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.2)' },
                  success: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: 'rgba(16, 185, 129, 0.2)' },
                  danger: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.2)' },
                  info: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' }
                };
                const style = colorMap[n.type] || { bg: 'rgba(255,255,255,0.02)', text: 'var(--text-secondary)', border: 'var(--border-color)' };
                
                return (
                  <div 
                    key={n.id}
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{n.text}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

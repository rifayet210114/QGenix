// ============================================================================
// Exams.jsx — QGenix Teacher Examinations & Routines Manager Portal
// ============================================================================
// Features:
//   1. Profile stats overview (Scheduled Exams, Active Batches, Proctor Duty slots).
//   2. Category filters ("All", "Internal Final", "Mid Term", "NU Final").
//   3. Advanced filtration controls (Search, Batch selector, Semester selector).
//   4. List of exams rendered as premium glassmorphic cards with status badges.
//   5. Interactive selection: Selecting an exam reveals the complete detailed routine table.
//   6. Floating action: Download PDF routine with progress loader & notify students alert.
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষকের পরীক্ষার তালিকা এবং রুটিন প্রদর্শন করে। শিক্ষক পরীক্ষা ক্যাটাগরি
// (Internal Final, Mid Term, NU Final) অনুযায়ী ফিল্টার করতে পারবেন। এছাড়া কোনো নির্দিষ্ট
// পরীক্ষায় ক্লিক করলে শিক্ষক সেটির পুরো রুটিন দেখতে পাবেন। এতে পিডিএফ ডাউনলোডার প্রোগ্রেস বার
// এবং শিক্ষার্থীদের সতর্কবার্তা পাঠানোর ফিচার যুক্ত করা হয়েছে।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Calendar, Clock, Download, AlertTriangle, ShieldCheck, 
  CheckCircle, RefreshCw, Info, UserCheck, BookOpen, Users, Bell, 
  Search, SlidersHorizontal, ChevronRight, Send, ArrowLeft, Award, CheckCircle2
} from 'lucide-react';
import Card from '../../components/Card';

// ----------------------------------------------------------------------------
// 1. MOCK DATA: TEACHER'S SCHEDULED EXAMS DATABASE
// ----------------------------------------------------------------------------
const initialExamsList = [
  {
    id: 'EX-001',
    title: '5th Semester Mid Term Theory Examination',
    category: 'Mid Term',
    semester: '5th Semester',
    batch: 'Batch 21',
    dateRange: 'June 25, 2026 - July 05, 2026',
    subjectsCount: 4,
    status: 'Upcoming',
    totalStudents: 120,
    schedule: [
      { code: 'CSE-301', subject: 'Advanced Data Structures & Algorithms', date: '2026-06-25', time: '09:00 AM', duration: '1.5 Hours', room: 'Room 302', invigilator: 'Dr. Sarah Ahmed', status: 'Scheduled' },
      { code: 'CSE-302', subject: 'Database Management Systems', date: '2026-06-28', time: '11:00 AM', duration: '2.0 Hours', room: 'Room 405', invigilator: 'Prof. M. Rahman', status: 'Scheduled' },
      { code: 'CSE-303', subject: 'Computer Networks & Protocol Design', date: '2026-07-02', time: '09:00 AM', duration: '1.5 Hours', room: 'Room 101', invigilator: 'Dr. Sarah Ahmed', status: 'Scheduled' },
      { code: 'CSE-304', subject: 'Software Engineering & DevOps', date: '2026-07-05', time: '01:30 PM', duration: '1.5 Hours', room: 'Room 204', invigilator: 'Lec. N. Yasmin', status: 'Scheduled' }
    ]
  },
  {
    id: 'EX-002',
    title: '6th Semester Internal Final Lab Assessments',
    category: 'Internal Final',
    semester: '6th Semester',
    batch: 'Batch 20',
    dateRange: 'June 26, 2026 - June 29, 2026',
    subjectsCount: 3,
    status: 'Upcoming',
    totalStudents: 95,
    schedule: [
      { code: 'CSE-312', subject: 'Artificial Intelligence Lab', date: '2026-06-26', time: '02:00 PM', duration: '2.0 Hours', room: 'Lab 3', invigilator: 'Dr. Sarah Ahmed', status: 'Scheduled' },
      { code: 'CSE-313', subject: 'Mobile App Development Lab', date: '2026-06-27', time: '10:00 AM', duration: '2.0 Hours', room: 'Lab 1', invigilator: 'Prof. M. Rahman', status: 'Scheduled' },
      { code: 'CSE-314', subject: 'System Administration Lab', date: '2026-06-29', time: '02:00 PM', duration: '2.0 Hours', room: 'Lab 2', invigilator: 'Lec. N. Yasmin', status: 'Scheduled' }
    ]
  },
  {
    id: 'EX-003',
    title: '5th Semester National University Finals',
    category: 'NU Final',
    semester: '5th Semester',
    batch: 'Batch 21',
    dateRange: 'July 15, 2026 - July 25, 2026',
    subjectsCount: 4,
    status: 'Upcoming',
    totalStudents: 120,
    schedule: [
      { code: 'CSE-301', subject: 'Advanced Data Structures & Algorithms', date: '2026-07-15', time: '10:00 AM', duration: '3.0 Hours', room: 'Main Hall A', invigilator: 'External Board', status: 'Scheduled' },
      { code: 'CSE-302', subject: 'Database Management Systems', date: '2026-07-18', time: '10:00 AM', duration: '3.0 Hours', room: 'Main Hall A', invigilator: 'External Board', status: 'Scheduled' },
      { code: 'CSE-303', subject: 'Computer Networks & Protocol Design', date: '2026-07-22', time: '10:00 AM', duration: '3.0 Hours', room: 'Annex Hall B', invigilator: 'External Board', status: 'Scheduled' },
      { code: 'CSE-304', subject: 'Software Engineering & DevOps', date: '2026-07-25', time: '10:00 AM', duration: '3.0 Hours', room: 'Main Hall A', invigilator: 'External Board', status: 'Scheduled' }
    ]
  },
  {
    id: 'EX-004',
    title: '4th Semester Mid Term Examination',
    category: 'Mid Term',
    semester: '4th Semester',
    batch: 'Batch 22',
    dateRange: 'June 24, 2026 - June 28, 2026',
    subjectsCount: 3,
    status: 'Active',
    totalStudents: 140,
    schedule: [
      { code: 'CSE-201', subject: 'Object Oriented Programming', date: '2026-06-24', time: '09:00 AM', duration: '1.5 Hours', room: 'Room 301', invigilator: 'Dr. Sarah Ahmed', status: 'Ongoing' },
      { code: 'CSE-202', subject: 'Discrete Mathematics', date: '2026-06-26', time: '09:00 AM', duration: '1.5 Hours', room: 'Room 302', invigilator: 'Prof. M. Rahman', status: 'Scheduled' },
      { code: 'CSE-203', subject: 'Digital Logic Design', date: '2026-06-28', time: '11:00 AM', duration: '2.0 Hours', room: 'Room 401', invigilator: 'Lec. N. Yasmin', status: 'Scheduled' }
    ]
  },
  {
    id: 'EX-005',
    title: '4th Semester Internal Lab Finals',
    category: 'Internal Final',
    semester: '4th Semester',
    batch: 'Batch 22',
    dateRange: 'June 18, 2026 - June 20, 2026',
    subjectsCount: 2,
    status: 'Completed',
    totalStudents: 140,
    schedule: [
      { code: 'CSE-201', subject: 'OOP Lab Assessment', date: '2026-06-18', time: '02:00 PM', duration: '2.0 Hours', room: 'Lab 1', invigilator: 'Dr. Sarah Ahmed', status: 'Completed' },
      { code: 'CSE-203', subject: 'Digital Lab Assessment', date: '2026-06-20', time: '10:00 AM', duration: '2.0 Hours', room: 'Lab 3', invigilator: 'Lec. N. Yasmin', status: 'Completed' }
    ]
  }
];

export default function TeacherExams() {
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Filter States
  const [activeCategory, setActiveCategory] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection State
  const [selectedExam, setSelectedExam] = useState(null);

  // Simulated Interactions
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter logic
  const filteredExams = useMemo(() => {
    return initialExamsList.filter((exam) => {
      const matchesCategory = activeCategory === 'All' || exam.category === activeCategory;
      const matchesSemester = semesterFilter === 'All' || exam.semester === semesterFilter;
      const matchesBatch = batchFilter === 'All' || exam.batch === batchFilter;
      const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            exam.semester.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            exam.batch.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSemester && matchesBatch && matchesSearch;
    });
  }, [activeCategory, semesterFilter, batchFilter, searchQuery]);

  // Compute total statistics
  const statistics = useMemo(() => {
    const total = filteredExams.length;
    const active = filteredExams.filter(e => e.status === 'Active').length;
    const upcoming = filteredExams.filter(e => e.status === 'Upcoming').length;
    return { total, active, upcoming };
  }, [filteredExams]);

  // PDF Downloader simulation
  const downloadRoutine = (title) => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(5);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 15;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        triggerToast(`Successfully exported PDF routine for "${title}"`);
      }, 200);
    }, 1000);
  };

  // Notify students simulation
  const notifyStudents = (examTitle, batch, semester) => {
    triggerToast(`Sent exam routine notification to ${batch} (${semester}) for "${examTitle}"`);
  };

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* =======================================================================
         PAGE LOCAL STYLES (LIQUID GLASSMORPHISM INTERFACE)
         ======================================================================= */}
      <style>{`
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
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .glass-card-exams:hover {
          transform: translateY(-3px) !important;
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

        .glow-orb-exams-1 {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb-exams-2 {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
        }

        .category-tab-bar {
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
          margin-bottom: 8px;
        }

        body.light-mode .category-tab-bar {
          background: rgba(0, 0, 0, 0.02);
        }

        .category-btn {
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

        .category-btn:hover {
          color: var(--text-primary);
        }

        .category-btn-active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
        }

        .exam-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 9999px;
          text-transform: uppercase;
        }
        .exam-badge-upcoming { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
        .exam-badge-active { background: rgba(16, 185, 129, 0.12); color: var(--accent-success); }
        .exam-badge-completed { background: rgba(148, 163, 184, 0.12); color: var(--text-secondary); }

        .routine-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }

        .routine-table th {
          padding: 14px 16px;
          font-weight: bold;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.01);
        }

        .routine-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .routine-row:hover {
          background: rgba(255, 255, 255, 0.015);
        }
        body.light-mode .routine-row:hover {
          background: rgba(0, 0, 0, 0.01);
        }
      `}</style>

      {/* Decorative Orbs */}
      <div className="glow-orb-exams-1" style={{ top: '15%', left: '-5%' }} />
      <div className="glow-orb-exams-2" style={{ bottom: '15%', right: '-5%' }} />

      {/* =======================================================================
         SECTION 1: BACK TO LIST OR MAIN HEADER
         ======================================================================= */}
      {selectedExam ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '4px' }}>
          <button 
            onClick={() => setSelectedExam(null)}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Exams List</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px' }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
              <FileText className="text-violet-500" size={32} />
              Examinations & Schedules
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
              Monitor ongoing exams, review upcoming routines, and broadcast schedules to semester batches.
            </p>
          </div>
        </div>
      )}

      {/* =======================================================================
         SECTION 2: STATISTICS CARDS (Shown only in list view)
         ======================================================================= */}
      {!selectedExam && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {/* Card 1: Total Exams */}
          <div className="glass-card-exams" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Schedules</span>
              <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
                <FileText size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {statistics.total} Scheduled
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                Across selected filters
              </span>
            </div>
          </div>

          {/* Card 2: Active Exams */}
          <div className="glass-card-exams" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active / Ongoing</span>
              <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
                <Clock size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: statistics.active > 0 ? 'var(--accent-success)' : 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {statistics.active} Exams
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                Currently in progress today
              </span>
            </div>
          </div>

          {/* Card 3: Upcoming Exams */}
          <div className="glass-card-exams" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Upcoming Routines</span>
              <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <Calendar size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {statistics.upcoming} Pending
              </div>
              <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                ✓ Synced with student portals
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
         SECTION 3: MAIN EXAMS MANAGEMENT VIEW OR ROUTINE DETAILS
         ======================================================================= */}
      <AnimatePresence mode="wait">
        {!selectedExam ? (
          /* ================= LIST VIEW & FILTERS ================= */
          <motion.div 
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Filter Toolbar */}
            <Card className="glass-card-exams" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Category selectors */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div className="category-tab-bar">
                    {['All', 'Internal Final', 'Mid Term', 'NU Final'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`category-btn ${activeCategory === cat ? 'category-btn-active' : ''}`}
                      >
                        {cat === 'All' ? 'All Categories' : cat}
                      </button>
                    ))}
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                    Showing {filteredExams.length} Academic Routines
                  </span>
                </div>

                {/* Search & dropdown selectors */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Semester selector */}
                    <div className="flex flex-col gap-1">
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Academic Semester</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                        <SlidersHorizontal size={14} style={{ color: 'var(--text-secondary)' }} />
                        <select
                          value={semesterFilter}
                          onChange={(e) => setSemesterFilter(e.target.value)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="All" style={{ background: 'var(--bg-primary)' }}>All Semesters</option>
                          <option value="4th Semester" style={{ background: 'var(--bg-primary)' }}>4th Semester</option>
                          <option value="5th Semester" style={{ background: 'var(--bg-primary)' }}>5th Semester</option>
                          <option value="6th Semester" style={{ background: 'var(--bg-primary)' }}>6th Semester</option>
                        </select>
                      </div>
                    </div>

                    {/* Batch selector */}
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

                  {/* Search bar */}
                  <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: '220px', maxWidth: '400px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Search Exams</label>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text"
                        placeholder="Search exam name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.85rem', height: '38px' }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </Card>

            {/* List grid of exam cards */}
            {filteredExams.length === 0 ? (
              <div className="glass-card-exams" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Info size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>No Scheduled Exams Found</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  No matches for your active filters. Try resetting search criteria or selecting other categories.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredExams.map((exam) => {
                  const isUpcoming = exam.status === 'Upcoming';
                  const isActive = exam.status === 'Active';
                  const isCompleted = exam.status === 'Completed';
                  
                  const badgeClass = isUpcoming ? 'exam-badge-upcoming' :
                                     isActive ? 'exam-badge-active' : 'exam-badge-completed';

                  return (
                    <div 
                      key={exam.id}
                      className="glass-card-exams"
                      onClick={() => setSelectedExam(exam)}
                      style={{ 
                        padding: '24px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '16px',
                        cursor: 'pointer',
                        borderLeft: isActive ? '4px solid var(--accent-success)' : isUpcoming ? '4px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {/* Top row: Category & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                          {exam.category}
                        </span>
                        <span className={`exam-badge ${badgeClass}`}>{exam.status}</span>
                      </div>

                      {/* Header details */}
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.3' }}>
                          {exam.title}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span>Semester: <strong>{exam.semester.replace(' Semester', '')}</strong></span>
                          <span>•</span>
                          <span>Batch: <strong>{exam.batch}</strong></span>
                        </div>
                      </div>

                      {/* Information Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem', fontWeight: 'bold' }}>Exam Date Range</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{exam.dateRange.split(' - ')[0]}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.68rem', fontWeight: 'bold' }}>Evaluation Depth</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{exam.subjectsCount} Subjects</span>
                        </div>
                      </div>

                      {/* Quick Details Button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Enrolled: <strong>{exam.totalStudents} Candidates</strong>
                        </span>
                        
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>View Routine</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          /* ================= DETAILED ROUTINE VIEW ================= */
          <motion.div 
            key="routine-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Header / Info Card */}
            <Card title={selectedExam.title} className="glass-card-exams">
              
              {/* Detailed Summary Row & Download/Notify Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '18px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      {selectedExam.category}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      Target: <strong>{selectedExam.batch}</strong> • <strong>{selectedExam.semester}</strong>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Total Subjects: <strong>{selectedExam.subjectsCount}</strong> | Expected Attendance: <strong>{selectedExam.totalStudents} Students</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Notify Students button */}
                  <button
                    onClick={() => notifyStudents(selectedExam.title, selectedExam.batch, selectedExam.semester)}
                    className="btn btn-secondary flex items-center gap-2"
                    style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={14} />
                    <span>Notify Students</span>
                  </button>

                  {/* Export PDF Button */}
                  <button
                    onClick={() => downloadRoutine(selectedExam.title)}
                    disabled={isDownloading}
                    className="btn btn-primary"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: isDownloading ? 0.7 : 1
                    }}
                  >
                    {isDownloading ? (
                      <RefreshCw size={14} className="animate-spin text-white" />
                    ) : (
                      <Download size={14} />
                    )}
                    <span>{isDownloading ? 'Exporting...' : 'Export Routine PDF'}</span>
                  </button>
                </div>
              </div>

              {/* simulated download progress bar */}
              <AnimatePresence>
                {isDownloading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: '18px', width: '100%' }}
                  >
                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${downloadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', transition: 'width 0.15s linear' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Compiling routine file... {downloadProgress}%
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Routine Table Grid */}
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="routine-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '8px' }}>Course Code</th>
                      <th>Subject Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Duration</th>
                      <th>Room</th>
                      <th>Invigilator</th>
                      <th style={{ textAlign: 'right', paddingRight: '8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedExam.schedule.map((slot, index) => {
                      const isOngoingSlot = slot.status === 'Ongoing';
                      const isCompletedSlot = slot.status === 'Completed';
                      
                      const slotBadgeBg = isOngoingSlot ? 'rgba(16, 185, 129, 0.12)' :
                                          isCompletedSlot ? 'rgba(148, 163, 184, 0.12)' :
                                          'rgba(59, 130, 246, 0.12)';
                                          
                      const slotBadgeColor = isOngoingSlot ? 'var(--accent-success)' :
                                            isCompletedSlot ? 'var(--text-muted)' :
                                            '#3B82F6';

                      return (
                        <tr key={index} className="routine-row">
                          <td style={{ fontWeight: '700', paddingLeft: '8px', color: '#8B5CF6' }}>{slot.code}</td>
                          <td style={{ fontWeight: '600' }}>{slot.subject}</td>
                          <td>{slot.date}</td>
                          <td>{slot.time}</td>
                          <td>{slot.duration}</td>
                          <td style={{ fontWeight: '600' }}>{slot.room}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{slot.invigilator}</td>
                          <td style={{ textAlign: 'right', paddingRight: '8px' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              background: slotBadgeBg,
                              color: slotBadgeColor,
                              padding: '3px 8px',
                              borderRadius: '8px',
                              textTransform: 'uppercase'
                            }}>
                              {slot.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </Card>

            {/* Academic Rules Advisory Box */}
            <div className="glass-card-exams" style={{ padding: '20px', display: 'flex', gap: '16px', borderLeft: '4px solid var(--accent-primary)' }}>
              <Info size={24} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  Examiner & Invigilation Duties Note
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Invigilators are required to check in 15 minutes before the exam time. Student rosters for active exam halls are synchronized dynamically in the QGenix Proctor app dashboard. For conflicts, contact the Office of the Controller of Examinations.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================================
         SECTION 4: FLOATING TOAST FEEDBACK ALERTS
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

// ============================================================================
// Courses.jsx — QGenix Teacher Courses & Resource Management Portal
// ============================================================================
// Designed to represent a premium course and document manager for teachers.
// Features:
//   1. Header displaying teacher profile info (Dr. Sarah Ahmed).
//   2. High-performance summary statistics overview cards.
//   3. Advanced filtration bar by Academic Semester and Student Batch.
//   4. Course cards showing active modules, student count, and credits.
//   5. Collapsible resource library displaying PDFs/documents uploaded.
//   6. Simulated file uploader with a sleek, animated uploading progress indicator.
//   7. Persistent updates via localStorage matching the Student Resources hub.
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষকের কোর্স এবং ক্লাস রিসোর্স ম্যানেজমেন্ট পোর্টাল। লগইনকৃত শিক্ষক (Dr. Sarah Ahmed)
// তার সংশ্লিষ্ট সেমিস্টার এবং ব্যাচ ফিল্টার করে কোর্সসমূহ দেখতে পারবেন। প্রতিটি কোর্সের জন্য পিডিএফ
// লেকচার নোট বা স্লাইড আপলোড করার জন্য এখানে প্রগতিশীল অ্যানিমেটেড লোডারসহ আপলোড প্যানেল রয়েছে,
// যা সরাসরি লোকাল স্টোরেজ সিঙ্ক করে স্টুডেন্ট পোর্টালে যুক্ত করে দেয়।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calendar, Clock, Award, CheckCircle, Clock3, 
  Search, SlidersHorizontal, ArrowUpDown, Play, Download, 
  Video, FileText, AlertCircle, GraduationCap, X, 
  TrendingUp, ShieldAlert, FolderOpen, UploadCloud, Plus, Trash2, 
  Users, CheckCircle2, ChevronDown, ChevronUp, FileUp
} from 'lucide-react';
import Card from '../../components/Card';

// ----------------------------------------------------------------------------
// 1. MOCK DATA: STUDENT ACADEMIC RESOURCES INITIAL DATABASE
// ----------------------------------------------------------------------------
const initialResourcesDatabase = {
  '5th Semester': [
    {
      courseCode: 'CSE-301',
      courseName: 'Advanced Data Structures & Algorithms',
      instructor: 'Dr. Sarah Ahmed',
      resources: [
        { id: 101, title: 'Lecture Notes: Dynamic Programming & Greedy Strategies', type: 'PDF', size: '2.4 MB', date: '2026-06-10' },
        { id: 102, title: 'Lecture Slides: Graph Algorithms, BFS & DFS Traversals', type: 'Slides', size: '3.1 MB', date: '2026-06-12' },
        { id: 103, title: 'AVL Trees & Red-Black Trees Practice Worksheet', type: 'PDF', size: '1.2 MB', date: '2026-06-15' },
        { id: 104, title: 'Laboratory Manual: Advanced Algorithms in C++', type: 'Lab Manual', size: '4.8 MB', date: '2026-06-08' }
      ]
    },
    {
      courseCode: 'CSE-302',
      courseName: 'Database Management Systems',
      instructor: 'Prof. M. Rahman',
      resources: [
        { id: 201, title: 'Lecture Notes: Relational Schema Normalization (1NF, 2NF, 3NF, BCNF)', type: 'PDF', size: '1.8 MB', date: '2026-06-11' },
        { id: 202, title: 'Lecture Slides: Indexing, B-Trees & B+ Trees Implementations', type: 'Slides', size: '3.2 MB', date: '2026-06-14' },
        { id: 203, title: 'SQL Joins & Subqueries Comprehensive Cheat Sheet', type: 'PDF', size: '820 KB', date: '2026-06-17' },
        { id: 204, title: 'DBMS Laboratory Manual: PostgreSQL & SQL DDL/DML', type: 'Lab Manual', size: '2.9 MB', date: '2026-05-05' }
      ]
    },
    {
      courseCode: 'CSE-303',
      courseName: 'Computer Networks & Protocol Design',
      instructor: 'Dr. Karim Al-Hasan',
      resources: [
        { id: 301, title: 'Lecture Slides: IP Routing Protocols (OSPF, BGP, RIP)', type: 'Slides', size: '4.5 MB', date: '2026-06-10' },
        { id: 302, title: 'Socket API Quick Reference Sheet (C & Python)', type: 'PDF', size: '1.1 MB', date: '2026-06-13' },
        { id: 303, title: 'TCP Flow Control & Congestion Mitigation Protocols', type: 'PDF', size: '2.3 MB', date: '2026-06-16' }
      ]
    },
    {
      courseCode: 'CSE-304',
      courseName: 'Software Engineering & DevOps',
      instructor: 'Dr. Sarah Ahmed',
      resources: [
        { id: 401, title: 'Lecture Slides: DevOps Architecture & CI/CD Pipelines', type: 'Slides', size: '6.7 MB', date: '2026-06-12' },
        { id: 402, title: 'Agile Sprint Planning & Requirement Engineering Template', type: 'PDF', size: '820 KB', date: '2026-06-14' },
        { id: 403, title: 'Unit Testing, Mocking Frameworks & TDD Guide', type: 'PDF', size: '1.4 MB', date: '2026-06-18' }
      ]
    }
  ],
  '6th Semester': [
    {
      courseCode: 'CSE-311',
      courseName: 'Compiler Design',
      instructor: 'Prof. Alex Mercer',
      resources: [
        { id: 501, title: 'Lecture Notes: Lexical Analysis & Finite Automata', type: 'PDF', size: '2.1 MB', date: '2026-05-10' },
        { id: 502, title: 'Syntax Analysis: LL(1) and LR(1) Parsers Slides', type: 'Slides', size: '3.8 MB', date: '2025-05-18' },
        { id: 503, title: 'Compiler Lab: Flex and Bison Tool Reference Manual', type: 'Lab Manual', size: '3.0 MB', date: '2026-05-12' }
      ]
    },
    {
      courseCode: 'CSE-312',
      courseName: 'Artificial Intelligence & Search',
      instructor: 'Dr. Sarah Ahmed',
      resources: [
        { id: 601, title: 'Lecture Notes: Heuristic Search & A* Algorithm', type: 'PDF', size: '1.9 MB', date: '2026-05-12' },
        { id: 602, title: 'Neural Networks Foundations & Backpropagation', type: 'PDF', size: '3.4 MB', date: '2026-05-20' }
      ]
    }
  ],
  '4th Semester': [
    {
      courseCode: 'CSE-201',
      courseName: 'Object Oriented Programming',
      instructor: 'Dr. Karim Al-Hasan',
      resources: [
        { id: 701, title: 'Java OOP Principles: Polymorphism & Inheritance Slides', type: 'Slides', size: '4.2 MB', date: '2025-12-05' },
        { id: 702, title: 'Design Patterns Reference Manual (Gang of Four)', type: 'Reference Book', size: '12.4 MB', date: '2025-12-10' }
      ]
    }
  ]
};

// Course mapping metadata (Student Counts, Batches, Credits) for Sarah Ahmed's courses
const SarahCoursesMeta = {
  'CSE-301': { students: 45, credits: 4, batch: 'Batch 21' },
  'CSE-304': { students: 38, credits: 3, batch: 'Batch 21' },
  'CSE-312': { students: 42, credits: 4, batch: 'Batch 20' }
};

export default function TeacherCourses() {
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Database State synced with LocalStorage
  const [resourcesDb, setResourcesDb] = useState(() => {
    try {
      const saved = localStorage.getItem('qgenix_academic_resources');
      return saved ? JSON.parse(saved) : initialResourcesDatabase;
    } catch (e) {
      return initialResourcesDatabase;
    }
  });

  // Sync back to LocalStorage
  const saveDatabase = (updatedDb) => {
    setResourcesDb(updatedDb);
    localStorage.setItem('qgenix_academic_resources', JSON.stringify(updatedDb));
  };

  // UI Filtering States
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Course expansion panels
  const [expandedCourse, setExpandedCourse] = useState(null);

  // PDF Uploader States
  const [uploadingCourseCode, setUploadingCourseCode] = useState(null); // Track code of course being uploaded to
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('PDF');
  const [mockFileName, setMockFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Global Notification Toast
  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper: map semester to batch
  const getBatchBySemester = (sem) => {
    if (sem === '4th Semester') return 'Batch 22';
    if (sem === '5th Semester') return 'Batch 21';
    if (sem === '6th Semester') return 'Batch 20';
    return 'Batch 21';
  };

  // extract all courses taught by Dr. Sarah Ahmed across the semesters
  const myCoursesList = useMemo(() => {
    const list = [];
    Object.keys(resourcesDb).forEach(sem => {
      resourcesDb[sem].forEach(course => {
        if (course.instructor === 'Dr. Sarah Ahmed') {
          const meta = SarahCoursesMeta[course.courseCode] || { students: 30, credits: 3, batch: getBatchBySemester(sem) };
          list.push({
            ...course,
            semester: sem,
            batch: meta.batch,
            students: meta.students,
            credits: meta.credits
          });
        }
      });
    });
    return list;
  }, [resourcesDb]);

  // Apply filters
  const filteredCourses = useMemo(() => {
    return myCoursesList.filter(course => {
      const matchesSemester = semesterFilter === 'All' || course.semester === semesterFilter;
      const matchesBatch = batchFilter === 'All' || course.batch === batchFilter;
      const matchesSearch = course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            course.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSemester && matchesBatch && matchesSearch;
    });
  }, [myCoursesList, semesterFilter, batchFilter, searchQuery]);

  // Statistics Summary counts
  const statsOverview = useMemo(() => {
    const totalCourses = myCoursesList.length;
    const totalStudents = myCoursesList.reduce((acc, c) => acc + c.students, 0);
    const totalResources = myCoursesList.reduce((acc, c) => acc + c.resources.length, 0);
    return [
      { label: 'My Assigned Courses', value: totalCourses, icon: <BookOpen size={20} />, color: 'var(--accent-primary)', bg: 'rgba(139, 92, 246, 0.1)' },
      { label: 'Total Enrolled Students', value: totalStudents, icon: <Users size={20} />, color: 'var(--accent-secondary)', bg: 'rgba(59, 130, 246, 0.1)' },
      { label: 'Uploaded PDF Resources', value: totalResources, icon: <FolderOpen size={20} />, color: 'var(--accent-success)', bg: 'rgba(16, 185, 129, 0.1)' }
    ];
  }, [myCoursesList]);

  // File Upload handler
  const handleFileUploadSimulated = (e, courseCode, semester) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !mockFileName) {
      triggerToast('Please provide a document title and select a file.');
      return;
    }

    setUploadingCourseCode(courseCode);
    setIsUploading(true);
    setUploadProgress(5);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        // Build new document object
        const fileSizeStr = selectedFile 
          ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
          : `${(Math.random() * 4 + 1.2).toFixed(1)} MB`;

        const newDoc = {
          id: Date.now(),
          title: newDocTitle.trim(),
          type: newDocType,
          size: fileSizeStr,
          date: new Date().toISOString().split('T')[0]
        };

        // Update local database & save to localStorage
        const updatedDb = { ...resourcesDb };
        const semesterCourses = updatedDb[semester] || [];
        const courseIdx = semesterCourses.findIndex(c => c.courseCode === courseCode);
        
        if (courseIdx !== -1) {
          updatedDb[semester][courseIdx].resources = [
            ...updatedDb[semester][courseIdx].resources,
            newDoc
          ];
          saveDatabase(updatedDb);
        }

        // Reset inputs
        setIsUploading(false);
        setUploadingCourseCode(null);
        setNewDocTitle('');
        setMockFileName('');
        setSelectedFile(null);
        triggerToast(`Successfully uploaded "${newDoc.title}" to ${courseCode}!`);
      }, 300);
    }, 1000);
  };

  // Delete Resource handler
  const handleDeleteResource = (courseCode, semester, resourceId, resourceTitle) => {
    const updatedDb = { ...resourcesDb };
    const semesterCourses = updatedDb[semester] || [];
    const courseIdx = semesterCourses.findIndex(c => c.courseCode === courseCode);

    if (courseIdx !== -1) {
      updatedDb[semester][courseIdx].resources = updatedDb[semester][courseIdx].resources.filter(
        res => res.id !== resourceId
      );
      saveDatabase(updatedDb);
      triggerToast(`Removed "${resourceTitle}" from ${courseCode}`);
    }
  };

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* =======================================================================
         PAGE STYLES OVERRIDES (LIQUID GLASSMORPHISM AESTHETICS)
         ======================================================================= */}
      <style>{`
        .glass-card-courses {
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

        .glass-card-courses:hover {
          transform: translateY(-3px) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 25px -5px     rgba(139, 92, 246, 0.15) !important;
        }

        body.light-mode .glass-card-courses {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .glass-card-courses:hover {
          background: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 12px 40px -10px rgba(100, 160, 220, 0.2) !important;
        }

        .glow-orb-purple-t {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb-blue-t {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
        }

        .type-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .type-pdf { background: rgba(239, 68, 68, 0.12); color: #EF4444; }
        .type-slides { background: rgba(139, 92, 246, 0.12); color: #c084fc; }
        .type-manual { background: rgba(16, 185, 129, 0.12); color: #10B981; }
        .type-book { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }

        .resource-row-item {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.015);
          transition: all 0.25s ease;
        }

        .resource-row-item:hover {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(139, 92, 246, 0.2);
        }

        body.light-mode .resource-row-item {
          background: rgba(0, 0, 0, 0.01);
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        body.light-mode .resource-row-item:hover {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(139, 92, 246, 0.2);
        }

        .file-input-wrapper {
          position: relative;
          width: 100%;
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          background: rgba(30, 41, 59, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .file-input-wrapper:hover {
          border-color: var(--accent-primary);
          background: rgba(30, 41, 59, 0.4);
        }
      `}</style>

      {/* Background Orbs */}
      <div className="glow-orb-purple-t" style={{ top: '5%', left: '-5%' }} />
      <div className="glow-orb-blue-t" style={{ bottom: '10%', right: '-5%' }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <BookOpen className="text-violet-500" size={32} />
            My Courses & Resources
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Manage your assigned courses, filter class materials, and upload notes or PDFs directly for student download.
          </p>
        </div>
        
        {/* Profile indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '12px' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--accent-primary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
            SA
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Dr. Sarah Ahmed</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Instructor Profile</div>
          </div>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: STATISTICS CARDS
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {statsOverview.map((stat, i) => (
          <div key={i} className="glass-card-courses" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</span>
              <div style={{ padding: '8px', borderRadius: '12px', background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =======================================================================
         SECTION 3: FILTRATION CONTROLS
         ======================================================================= */}
      <Card className="glass-card-courses" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Semester Filter */}
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

            {/* Batch Filter */}
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Student Batch</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All" style={{ background: 'var(--bg-primary)' }}>All Batches</option>
                  <option value="Batch 20" style={{ background: 'var(--bg-primary)' }}>Batch 20 (6th Sem)</option>
                  <option value="Batch 21" style={{ background: 'var(--bg-primary)' }}>Batch 21 (5th Sem)</option>
                  <option value="Batch 22" style={{ background: 'var(--bg-primary)' }}>Batch 22 (4th Sem)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex flex-col gap-1" style={{ width: '100%', maxWidth: '320px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Search Course</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Search course title or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.85rem', height: '38px' }}
              />
            </div>
          </div>

        </div>
      </Card>

      {/* =======================================================================
         SECTION 4: FILTERED COURSES GRID
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {filteredCourses.length === 0 ? (
          <div className="glass-card-courses" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <AlertCircle size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>No courses found</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              No matches found for your active filters or search terms.
            </p>
          </div>
        ) : (
          filteredCourses.map((course, cIdx) => {
            const isExpanded = expandedCourse === course.courseCode;
            const isUploadingThis = isUploading && uploadingCourseCode === course.courseCode;

            return (
              <div 
                key={course.courseCode} 
                className="glass-card-courses" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  borderLeft: '4px solid var(--accent-primary)' 
                }}
              >
                
                {/* Course Main Details header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {course.courseCode} • {course.semester}
                    </span>
                    <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {course.courseName}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      <span className="flex items-center gap-1"><Users size={14} />{course.students} Students Enrolled</span>
                      <span className="flex items-center gap-1"><Award size={14} />{course.credits} Credits</span>
                      <span className="flex items-center gap-1"><GraduationCap size={14} />{course.batch}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setExpandedCourse(isExpanded ? null : course.courseCode)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>{isExpanded ? 'Hide Resource Panel' : 'Manage Resources'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* EXPANDABLE RESOURCE PANEL */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '4px' }}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Left Side: Uploaded PDF Resources List */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                              Currently Available Files ({course.resources.length})
                            </h4>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                            {course.resources.length === 0 ? (
                              <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                No resources uploaded yet. Use the upload panel to add student materials.
                              </div>
                            ) : (
                              course.resources.map((file) => {
                                const typeClass = file.type === 'PDF' ? 'type-pdf' :
                                                  file.type === 'Slides' ? 'type-slides' :
                                                  file.type === 'Lab Manual' ? 'type-manual' : 'type-book';

                                return (
                                  <div key={file.id} className="resource-row-item flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
                                      <FileText size={18} className="text-violet-500" style={{ flexShrink: 0 }} />
                                      <div style={{ minWidth: 0 }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                          {file.title}
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                                          <span className={`type-badge ${typeClass}`}>{file.type}</span>
                                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Size: {file.size}</span>
                                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Uploaded: {file.date}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <button 
                                      onClick={() => handleDeleteResource(course.courseCode, course.semester, file.id, file.title)}
                                      className="btn btn-secondary"
                                      style={{ padding: '5px 8px', borderRadius: '8px', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                      title="Delete resource"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Right Side: Upload PDF notes & slides panel */}
                        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
                          <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }} className="flex items-center gap-2">
                            <UploadCloud size={16} className="text-violet-400" />
                            Provide Student Notes & PDFs
                          </h4>

                          {isUploadingThis ? (
                            /* Simulated Upload progress display */
                            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '30px 20px', textAlign: 'center' }}>
                              <Clock3 size={32} className="animate-spin text-purple-500" style={{ margin: '0 auto 12px auto' }} />
                              <h5 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Uploading Study Resource...</h5>
                              <p style={{ margin: '0 0 16px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Parsing content details for RAG indexing...
                              </p>
                              
                              <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', transition: 'width 0.15s linear' }} />
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 'bold', display: 'block', marginTop: '6px' }}>
                                {uploadProgress}% Completed
                              </span>
                            </div>
                          ) : (
                            /* Form to upload new resource file */
                            <form onSubmit={(e) => handleFileUploadSimulated(e, course.courseCode, course.semester)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              
                              {/* Title Input */}
                              <div className="flex flex-col gap-1">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Document / Notes Title</label>
                                <input 
                                  type="text" 
                                  required
                                  placeholder="e.g. Lecture Notes on Dijkstra's Algorithm"
                                  value={newDocTitle}
                                  onChange={(e) => setNewDocTitle(e.target.value)}
                                  className="input-field"
                                  style={{ borderRadius: '8px', fontSize: '0.82rem', height: '38px', padding: '0 12px' }}
                                />
                              </div>

                              {/* Row: Type dropdown & simulated file picker */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="flex flex-col gap-1">
                                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Resource Format</label>
                                  <select 
                                    value={newDocType}
                                    onChange={(e) => setNewDocType(e.target.value)}
                                    style={{ 
                                      borderRadius: '8px', 
                                      fontSize: '0.82rem', 
                                      height: '38px', 
                                      padding: '0 12px', 
                                      background: 'var(--bg-secondary)', 
                                      color: 'var(--text-primary)', 
                                      border: '1px solid var(--border-color)', 
                                      outline: 'none',
                                      width: '100%'
                                    }}
                                  >
                                    <option value="PDF" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>PDF Notes</option>
                                    <option value="Slides" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Slides (PPTX)</option>
                                    <option value="Lab Manual" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Lab Manual</option>
                                    <option value="Reference Book" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Reference Book</option>
                                  </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Select Document</label>
                                  <div style={{ position: 'relative' }}>
                                    <input 
                                      type="file" 
                                      id={`file-upload-${course.courseCode}`}
                                      style={{ display: 'none' }}
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          const file = e.target.files[0];
                                          setSelectedFile(file);
                                          setMockFileName(file.name);
                                          if (!newDocTitle.trim()) {
                                            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                                            setNewDocTitle(baseName.replace(/_/g, ' ').replace(/-/g, ' '));
                                          }
                                        }
                                      }}
                                    />
                                    <input 
                                      type="text" 
                                      readOnly
                                      required
                                      placeholder="No file chosen"
                                      value={mockFileName}
                                      className="input-field"
                                      style={{ borderRadius: '8px', fontSize: '0.82rem', height: '38px', paddingRight: '40px', paddingLeft: '12px', cursor: 'pointer' }}
                                      onClick={() => document.getElementById(`file-upload-${course.courseCode}`).click()}
                                    />
                                    <FileUp 
                                      size={16} 
                                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', cursor: 'pointer' }}
                                      onClick={() => document.getElementById(`file-upload-${course.courseCode}`).click()}
                                    />
                                  </div>
                                </div>
                              </div>

                              <button 
                                type="submit" 
                                className="btn btn-primary"
                                style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '4px' }}
                              >
                                <UploadCloud size={16} />
                                <span>Publish Note to Students</span>
                              </button>

                            </form>
                          )}

                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })
        )}
      </div>

      {/* =======================================================================
         SECTION 5: NOTIFICATION TOASTS
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

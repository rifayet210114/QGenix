// ============================================================================
// Resources.jsx — QGenix Student Academic Resources Archive Component
// ============================================================================
// Designed to represent a comprehensive Student Resources Portal. Features:
//   1. Summary statistics overview cards (Total Files, Current Semester, Last Sync)
//   2. Interactive Semester selector tabs (4th Semester, 5th Semester, 6th Semester)
//   3. Search bar and file-type category filters (PDF, Slides, Lab Manual, etc.)
//   4. Course-wise grouped cards displaying resources uploaded by instructors
//   5. Simulated download loaders with animated percentage bars & floating toasts
//
// [Bengali Note]:
// এই ফাইলটি বিশ্ববিদ্যালয়ের একাডেমিক রিসোর্স পোর্টাল। শিক্ষার্থীরা তাদের সংশ্লিষ্ট
// সেমিস্টার এবং কোর্স অনুযায়ী শিক্ষকের আপলোড করা লেকচার নোট, স্লাইড এবং ল্যাব ম্যানুয়াল
// এখান থেকে পিডিএফ আকারে ডাউনলোড করতে পারবে। এতে প্রগতিশীল ডাউনলোড লোডার যুক্ত আছে।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react'; // React API library core hooks
import { motion, AnimatePresence } from 'framer-motion'; // Motion animations for transitions
import { 
  FolderOpen, Search, SlidersHorizontal, Download, FileText, 
  Calendar, Clock, User, CheckCircle, RefreshCw, FileUp, 
  BookOpen, BookOpenCheck, Layers, HelpCircle
} from 'lucide-react'; // Lucide premium vector icons
import Card from '../../components/Card'; // Glass custom card wrapper

// ----------------------------------------------------------------------------
// 1. MOCK DATA: STUDENT ACADEMIC RESOURCES DATABASE
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
        { id: 204, title: 'DBMS Laboratory Manual: PostgreSQL & SQL DDL/DML', type: 'Lab Manual', size: '2.9 MB', date: '2026-06-05' }
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

export default function Resources() {
  // Dynamic Resources Database state
  const [resourcesDb, setResourcesDb] = useState(() => {
    try {
      const saved = localStorage.getItem('qgenix_academic_resources');
      return saved ? JSON.parse(saved) : initialResourcesDatabase;
    } catch (e) {
      return initialResourcesDatabase;
    }
  });

  // Sync page state light/dark theme variables
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Reload resources from localStorage when page mounts to ensure latest updates
  useEffect(() => {
    try {
      const saved = localStorage.getItem('qgenix_academic_resources');
      if (saved) {
        setResourcesDb(JSON.parse(saved));
      } else {
        localStorage.setItem('qgenix_academic_resources', JSON.stringify(initialResourcesDatabase));
      }
    } catch (e) {
      console.error('Error reloading resources:', e);
    }
  }, []);

  // Filter and Search States
  const [activeSemester, setActiveSemester] = useState('5th Semester'); // Selected semester tab
  const [searchQuery, setSearchQuery] = useState(''); // Text search query
  const [fileTypeFilter, setFileTypeFilter] = useState('All'); // File type dropdown selector

  // Simulated download progress states
  const [downloadingId, setDownloadingId] = useState(null); // Tracks resource id active download
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Compute total resources counts for statistics
  const totalResourcesCount = useMemo(() => {
    let count = 0;
    Object.keys(resourcesDb).forEach(sem => {
      resourcesDb[sem].forEach(course => {
        count += course.resources.length;
      });
    });
    return count;
  }, [resourcesDb]);

  // Filter resource groups matching semester, query and type
  const processedCourses = useMemo(() => {
    const courses = resourcesDb[activeSemester] || [];
    
    return courses.map(course => {
      // Filter individual resources inside course
      const filteredResources = course.resources.filter(res => {
        const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              course.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = fileTypeFilter === 'All' || res.type === fileTypeFilter;
        return matchesSearch && matchesType;
      });

      return {
        ...course,
        resources: filteredResources
      };
    }).filter(course => course.resources.length > 0); // Keep only courses with matching resources
  }, [resourcesDb, activeSemester, searchQuery, fileTypeFilter]);

  // Launch simulated downloads
  const triggerDownloadResource = (id, title) => {
    if (downloadingId) return; // Guard double clicks
    setDownloadingId(id);
    setDownloadProgress(10);

    const progressTimer = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(progressTimer);
      setDownloadProgress(100);
      setTimeout(() => {
        setDownloadingId(null);
        setToastMessage(`Downloaded resource: "${title}"`);
        setTimeout(() => setToastMessage(null), 3000);
      }, 300);
    }, 900);
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* =======================================================================
         PAGE LOCAL LIQUID STYLES
         ======================================================================= */}
      <style>{`
        /* Glassmorphism premium card borders and backdrop filters */
        .glass-card-resources {
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

        .glass-card-resources:hover {
          transform: translateY(-3px) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 25px -5px     rgba(139, 92, 246, 0.15) !important;
        }

        body.light-mode .glass-card-resources {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .glass-card-resources:hover {
          background: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 12px 40px -10px rgba(100, 160, 220, 0.2) !important;
        }

        /* Background glow designs */
        .res-glow-purple {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .res-glow-blue {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
        }

        /* Semester Selector Tabs navigation */
        .semester-tabs-bar {
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
        }

        body.light-mode .semester-tabs-bar {
          background: rgba(0, 0, 0, 0.02);
        }

        .sem-btn {
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

        .sem-btn:hover {
          color: var(--text-primary);
        }

        .sem-btn-active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
        }

        /* Type Badges */
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

        /* Resource item layout styling */
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

        /* Hide scrollbars */
        .scrollbar-hidden::-webkit-scrollbar {
          display: none !important;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* Decorative Glow Orbs */}
      <div className="res-glow-purple" style={{ top: '10%', left: '-8%' }} />
      <div className="res-glow-blue" style={{ bottom: '15%', right: '-8%' }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div className="flex justify-between items-center w-full relative z-10" style={{ paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <FolderOpen className="text-violet-500" size={32} />
            Academic Resource Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Access and download lecture slides, reference guides, and manuals uploaded by your department instructors.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: SUMMARY COUNTS STATS CARDS
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', zIndex: 10, position: 'relative' }}>
        
        {/* Stat 1: Total files counter */}
        <div className="glass-card-resources" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Archive Files</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <FolderOpen size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{totalResourcesCount} Resources</div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Across all semesters
            </span>
          </div>
        </div>

        {/* Stat 2: Current semester tracking */}
        <div className="glass-card-resources" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Selected Semester</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <Layers size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{activeSemester}</div>
            <span style={{ fontSize: '0.72rem', color: '#3B82F6', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              {(resourcesDatabase[activeSemester] || []).length} Grouped Subjects
            </span>
          </div>
        </div>

      </div>

      {/* =======================================================================
         SECTION 3: SEMESTER FILTER TABS & SEARCH
         ======================================================================= */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, position: 'relative' }}>
        
        {/* Semester Selection Tab buttons */}
        <div className="semester-tabs-bar">
          {Object.keys(resourcesDb).sort().map(sem => (
            <button
              key={sem}
              onClick={() => setActiveSemester(sem)}
              className={`sem-btn ${activeSemester === sem ? 'sem-btn-active' : ''}`}
            >
              {sem}
            </button>
          ))}
        </div>

        {/* Search & Type dropdown selectors */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', mdWidth: 'auto', maxWidth: '480px' }}>
          
          {/* Text search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search resource files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.85rem', height: '40px' }}
            />
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
            <SlidersHorizontal size={14} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All" style={{ background: 'var(--bg-primary)' }}>All Formats</option>
              <option value="PDF" style={{ background: 'var(--bg-primary)' }}>PDF Documents</option>
              <option value="Slides" style={{ background: 'var(--bg-primary)' }}>Slides / PowerPoints</option>
              <option value="Lab Manual" style={{ background: 'var(--bg-primary)' }}>Lab Manuals</option>
              <option value="Reference Book" style={{ background: 'var(--bg-primary)' }}>Reference Books</option>
            </select>
          </div>

        </div>

      </div>

      {/* =======================================================================
         SECTION 4: GROUPED DEPARTMENT COURSE CARD LIST (RESPONSIVE GRID)
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', zIndex: 10, position: 'relative' }}>
        
        {processedCourses.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center' }} className="glass-card-resources">
            <HelpCircle size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>No resources found</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              There are no documents matching your search queries in this semester.
            </p>
          </div>
        ) : (
          processedCourses.map((course, cIdx) => (
            <Card 
              key={cIdx}
              title={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#8B5CF6', fontWeight: 'bold' }}>{course.courseCode}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'none' }}>{course.courseName}</span>
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                
                {/* Instructor Subtitle info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <User size={14} className="text-violet-400" />
                  <span>Instructor: <strong>{course.instructor}</strong></span>
                </div>

                {/* Resource List inside card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {course.resources.map((file) => {
                    const isSelected = file.id === downloadingId;
                    const typeClass = file.type === 'PDF' ? 'type-pdf' :
                                      file.type === 'Slides' ? 'type-slides' :
                                      file.type === 'Lab Manual' ? 'type-manual' : 'type-book';

                    return (
                      <div 
                        key={file.id} 
                        className="resource-row-item flex flex-col gap-3"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                            <FileText size={16} style={{ color: '#8B5CF6', marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.3, display: 'block' }}>
                                {file.title}
                              </span>
                              
                              {/* Subtitle details */}
                              <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', flexWrap: 'wrap' }}>
                                <span>Size: {file.size}</span>
                                <span>Sync: {file.date}</span>
                              </div>
                            </div>
                          </div>

                          {/* Download Button */}
                          <button
                            onClick={() => triggerDownloadResource(file.id, file.title)}
                            disabled={downloadingId !== null}
                            className="btn-resource-action"
                            style={{
                              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                              border: '1px solid rgba(139, 92, 246, 0.25)',
                              borderRadius: '8px',
                              padding: '5px 10px',
                              fontSize: '0.72rem',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              opacity: downloadingId !== null && !isSelected ? 0.4 : 1
                            }}
                          >
                            {isSelected ? (
                              <RefreshCw size={12} className="animate-spin text-purple-500" />
                            ) : (
                              <Download size={12} />
                            )}
                            <span>Get</span>
                          </button>
                        </div>

                        {/* Progress loader display */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              style={{ width: '100%', marginTop: '2px' }}
                            >
                              <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '3px', borderRadius: '1.5px', overflow: 'hidden' }}>
                                <div style={{ width: `${downloadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', transition: 'width 0.15s linear' }} />
                              </div>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                Downloading file details... {downloadProgress}%
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

              </div>
            </Card>
          ))
        )}

      </div>

      {/* Floating toast notification alert bar */}
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

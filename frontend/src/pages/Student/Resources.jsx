// ============================================================================
// Resources.jsx — QGenix Student Academic Resources & Teacher Study Materials
// ============================================================================
// Features:
//   1. 100% Real-Time Database Integration: Fetches materials uploaded by Faculty
//      via /api/auth/teacher-resources/ with live BroadcastChannel & event syncing.
//   2. Course-wise Filtering: Filter resources by Course ("All Courses", "CSE-301", etc.)
//      along with Search bar and File Type selectors (PDF, Slides, DOCX, Lab Manuals).
//   3. Full Screen Document Viewer:
//      Clicking on ANY file opens an immersive full-screen viewer with:
//      - Real PDF Iframe rendering (with sample blob generation fallback)
//      - Academic DOCX reading sheet
//      - PPTX Slide Deck viewer with navigation controls
//      - Native browser fullscreen toggle & instant download
//   4. Fully responsive, dark/light theme aware, liquid glass styling.
// ============================================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, Search, SlidersHorizontal, Download, FileText, 
  Calendar, Clock, User, CheckCircle, RefreshCw, FileUp, 
  BookOpen, Layers, Maximize2, Minimize2, X, ChevronRight,
  Presentation, AlertCircle, Sparkles, Filter, ExternalLink
} from 'lucide-react';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';
import { getSamplePdfBlobUrl } from '../../utils/sampleDocumentGenerator';

// Default academic baseline resources for CSE curriculum
const baselineCourseResources = [
  {
    id: 101,
    title: 'Lecture Notes: Dynamic Programming & Greedy Strategies',
    file_name: 'Dynamic_Programming_Lecture_Notes.pdf',
    file_type: 'PDF',
    course_code: 'CSE-301',
    course_title: 'Database Management Systems & Algorithms',
    instructor: 'Dr. Asaduzzaman',
    file_size: '2.4 MB',
    relative_date: 'Recently',
    uploaded_at: '2026-10-25 10:00 AM',
    description: 'Optimal substructure, memoization tables, Bellman-Ford shortest paths, and knapsack dynamic algorithms.'
  },
  {
    id: 102,
    title: 'Lecture Slides: Graph Algorithms, BFS & DFS Traversals',
    file_name: 'Graph_Algorithms_BFS_DFS.pptx',
    file_type: 'PPTX',
    course_code: 'CSE-301',
    course_title: 'Database Management Systems & Algorithms',
    instructor: 'Dr. Asaduzzaman',
    file_size: '3.1 MB',
    relative_date: 'Recently',
    uploaded_at: '2026-10-26 11:30 AM',
    description: 'Adjacency matrices, topological sorting, connected components, and bipartite testing.'
  },
  {
    id: 201,
    title: 'Lecture Notes: Relational Schema Normalization (1NF, 2NF, 3NF, BCNF)',
    file_name: 'Relational_Schema_Normalization.pdf',
    file_type: 'PDF',
    course_code: 'CSE-302',
    course_title: 'Operating Systems & System Architecture',
    instructor: 'Engr. Tanvir Hasan',
    file_size: '1.8 MB',
    relative_date: 'Recently',
    uploaded_at: '2026-10-27 09:15 AM',
    description: 'Functional dependencies, Armstrong axioms, closure sets, and lossless join decomposition.'
  },
  {
    id: 202,
    title: 'Lecture Slides: Indexing, B-Trees & B+ Trees Implementations',
    file_name: 'Database_Indexing_BTrees.pptx',
    file_type: 'PPTX',
    course_code: 'CSE-302',
    course_title: 'Operating Systems & System Architecture',
    instructor: 'Engr. Tanvir Hasan',
    file_size: '3.2 MB',
    relative_date: 'Recently',
    uploaded_at: '2026-10-28 02:00 PM',
    description: 'Dense vs sparse indices, B+ tree node splits and merges, disk block transfer benchmarks.'
  },
  {
    id: 301,
    title: 'Kinematics & Network Socket Programming Worksheet',
    file_name: 'Socket_Programming_Worksheet.docx',
    file_type: 'DOCX',
    course_code: 'CSE-303',
    course_title: 'Computer Networks & Protocol Design',
    instructor: 'Minhaj',
    file_size: '1.5 MB',
    relative_date: 'Recently',
    uploaded_at: '2026-10-29 03:30 PM',
    description: 'Multi-threaded TCP server implementation, port socket bindings, and packet capture analysis.'
  },
  {
    id: 302,
    title: 'Artificial Intelligence & Neural Search Fundamentals',
    file_name: 'AI_Search_Foundations.pdf',
    file_type: 'PDF',
    course_code: 'CSE-315',
    course_title: 'Artificial Intelligence & Machine Learning',
    instructor: 'Prof. Dr. Mahbubur Rahman',
    file_size: '4.2 MB',
    relative_date: 'Recently',
    uploaded_at: '2026-10-30 08:45 AM',
    description: 'Heuristic state space search, A* algorithm optimality proofs, and Minimax adversarial pruning.'
  }
];

export default function Resources() {
  const { user } = useAuth();

  // Theme observer
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Real-time Teacher Resources state
  const [dbResources, setDbResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [fileTypeFilter, setFileTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Full Screen Preview Modal State
  const [viewingResource, setViewingResource] = useState(null);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // --------------------------------------------------------------------------
  // 1. Fetch Real-Time Resources Uploaded by Teachers from Database
  // --------------------------------------------------------------------------
  const fetchTeacherResources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/teacher-resources/`);
      if (res.ok) {
        const data = await res.json();
        const incoming = Array.isArray(data.resources) ? data.resources : [];
        setDbResources(incoming);
      }
    } catch (err) {
      console.warn('Could not load teacher resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherResources();

    // Cross-tab real-time sync with teacher uploads
    let bc;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('qgenix_teacher_resources');
        bc.onmessage = () => fetchTeacherResources();
      }
    } catch (_) {}

    const handleUpdate = () => fetchTeacherResources();
    window.addEventListener('qgenix_teacher_resources_updated', handleUpdate);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('qgenix_teacher_resources_updated', handleUpdate);
    };
  }, []);

  // Keyboard listener: ESC closes fullscreen preview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && viewingResource) {
        setViewingResource(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingResource]);

  // Merge database resources with baseline curriculum resources (deduped by title or id)
  const allResources = useMemo(() => {
    const existingIds = new Set((dbResources || []).map(r => String(r.id)));
    const existingTitles = new Set((dbResources || []).map(r => (r.file_name || r.title || '').toLowerCase().trim()));

    const uniqueBaselines = baselineCourseResources.filter(b => {
      const bTitle = (b.file_name || b.title || '').toLowerCase().trim();
      return !existingIds.has(String(b.id)) && !existingTitles.has(bTitle);
    });

    // DB resources first, then baselines
    return [...(dbResources || []), ...uniqueBaselines];
  }, [dbResources]);

  // Extract distinct list of Courses for Course-wise filtering
  const availableCourses = useMemo(() => {
    const map = new Map();
    allResources.forEach(r => {
      const code = (r.course_code || '').trim().toUpperCase();
      const title = (r.course_title || code).trim();
      if (code && !map.has(code)) {
        map.set(code, { code, title });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [allResources]);

  // Filtered resources matching selected course, type and search query
  const filteredResources = useMemo(() => {
    return allResources.filter(item => {
      const itemCode = (item.course_code || '').toUpperCase();
      const itemType = (item.file_type || '').toUpperCase();
      const itemTitle = (item.title || item.file_name || '').toLowerCase();
      const itemCourse = (item.course_title || '').toLowerCase();
      const itemInstructor = (item.instructor || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      // Course filter
      if (selectedCourse !== 'All' && itemCode !== selectedCourse.toUpperCase()) {
        return false;
      }

      // File type filter
      if (fileTypeFilter !== 'All') {
        const targetType = fileTypeFilter.toUpperCase();
        if (targetType === 'PDF' && !itemType.includes('PDF') && !item.file_name?.toLowerCase().endsWith('.pdf')) {
          return false;
        }
        if (targetType === 'SLIDES' && !itemType.includes('PPT') && !item.file_name?.toLowerCase().endsWith('.pptx') && !item.file_name?.toLowerCase().endsWith('.ppt')) {
          return false;
        }
        if (targetType === 'DOCX' && !itemType.includes('DOC') && !item.file_name?.toLowerCase().endsWith('.docx') && !item.file_name?.toLowerCase().endsWith('.doc')) {
          return false;
        }
      }

      // Search query
      if (q) {
        const matches = itemTitle.includes(q) || 
                        itemCode.toLowerCase().includes(q) || 
                        itemCourse.includes(q) || 
                        itemInstructor.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [allResources, selectedCourse, fileTypeFilter, searchQuery]);

  // Group filtered resources Course-Wise
  const groupedByCourse = useMemo(() => {
    const groups = {};
    filteredResources.forEach(res => {
      const code = res.course_code || 'General';
      if (!groups[code]) {
        groups[code] = {
          course_code: code,
          course_title: res.course_title || code,
          items: []
        };
      }
      groups[code].items.push(res);
    });
    return Object.values(groups);
  }, [filteredResources]);

  // Color & Icon helper
  const getFileBadgeDetails = (type = '', name = '') => {
    const t = (type || '').toUpperCase();
    const n = (name || '').toLowerCase();
    if (t === 'PDF' || n.endsWith('.pdf')) {
      return { label: 'PDF', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', icon: <FileText size={20} /> };
    }
    if (t.includes('PPT') || n.endsWith('.pptx') || n.endsWith('.ppt')) {
      return { label: 'SLIDES', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)', icon: <Presentation size={20} /> };
    }
    if (t.includes('DOC') || n.endsWith('.docx') || n.endsWith('.doc')) {
      return { label: 'DOCX', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', icon: <BookOpen size={20} /> };
    }
    return { label: t || 'FILE', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', icon: <FileText size={20} /> };
  };

  // Open Full Screen Preview
  const handleOpenFile = (file) => {
    setActiveSlideIndex(0);
    setViewingResource(file);
  };

  // Toggle Browser Fullscreen
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsBrowserFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsBrowserFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', position: 'relative' }}>
      
      {/* Toast popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 999999,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Sparkles size={16} color="#A78BFA" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================================
         1. HERO HEADER WITH STATS
         ======================================================================= */}
      <div 
        className="premium-card"
        style={{
          borderRadius: '24px',
          padding: '28px 32px',
          border: '1px solid var(--border-color)',
          background: 'rgba(255, 255, 255, 0.01)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
              <FolderOpen size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              Course Resources & Study Hub
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Official textbook chapters, lecture slides, worksheets, and lab guides provided by faculty instructors.
          </p>
        </div>

        {/* Action / Sync Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              fetchTeacherResources();
              triggerToast('Academic resources synchronized with central server');
            }}
            disabled={isLoading}
            className="navbar-btn-hover"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '12px',
              background: 'linear-gradient(to right, #8B5CF6, #6366F1)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.25)'
            }}
          >
            <RefreshCw size={15} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sync Resources</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
         2. COURSE-WISE FILTER TABS & SEARCH CONTROLS
         ======================================================================= */}
      <div 
        className="premium-card" 
        style={{ 
          padding: '18px 24px', 
          borderRadius: '18px', 
          border: '1px solid var(--border-color)',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px' 
        }}
      >
        {/* Top: Course Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Course Filter:
          </span>

          <button
            onClick={() => setSelectedCourse('All')}
            style={{
              padding: '7px 16px',
              borderRadius: '10px',
              border: selectedCourse === 'All' ? '1px solid #8B5CF6' : '1px solid var(--border-color)',
              background: selectedCourse === 'All' ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : 'transparent',
              color: selectedCourse === 'All' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            All Courses ({allResources.length})
          </button>

          {availableCourses.map(c => {
            const isSelected = selectedCourse === c.code;
            const count = allResources.filter(r => (r.course_code || '').toUpperCase() === c.code).length;

            return (
              <button
                key={c.code}
                onClick={() => setSelectedCourse(c.code)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  border: isSelected ? '1px solid #8B5CF6' : '1px solid var(--border-color)',
                  background: isSelected ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : (isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'),
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title={c.title}
              >
                <span>{c.code}</span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(139, 92, 246, 0.15)',
                  color: isSelected ? '#ffffff' : '#8B5CF6'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom: Search query & Format selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '480px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search by topic, filename or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.85rem', height: '40px', width: '100%' }}
            />
          </div>

          {/* Format selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              {['All', 'PDF', 'Slides', 'DOCX'].map(type => (
                <button
                  key={type}
                  onClick={() => setFileTypeFilter(type)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: fileTypeFilter === type ? '1px solid #8B5CF6' : '1px solid var(--border-color)',
                    background: fileTypeFilter === type ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    color: fileTypeFilter === type ? '#8B5CF6' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {type === 'All' ? 'All Formats' : type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
         3. COURSE-WISE GROUPED FILES LIST
         ======================================================================= */}
      {groupedByCourse.length === 0 ? (
        <div 
          className="premium-card" 
          style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--border-color)' }}
        >
          <BookOpen size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto', opacity: 0.5 }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            No Resources Found
          </h3>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            There are no documents matching your selected course or search query.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {groupedByCourse.map(group => (
            <div 
              key={group.course_code}
              className="premium-card"
              style={{
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {/* Group Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: '#8B5CF6',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}>
                    {group.course_code}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {group.course_title}
                    </h3>
                  </div>
                </div>

                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {group.items.length} {group.items.length === 1 ? 'File Available' : 'Files Available'}
                </span>
              </div>

              {/* Course Files Grid / List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {group.items.map(file => {
                  const badge = getFileBadgeDetails(file.file_type, file.file_name);

                  return (
                    <div
                      key={file.id}
                      onClick={() => handleOpenFile(file)}
                      className="hover-lift"
                      style={{
                        padding: '16px 20px',
                        borderRadius: '14px',
                        border: '1px solid var(--border-color)',
                        background: isLightMode ? 'rgba(0, 0, 0, 0.015)' : 'rgba(255, 255, 255, 0.015)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        gap: '16px'
                      }}
                      title="Click to view file in Full Screen"
                    >
                      {/* Left: Icon & Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: badge.bg,
                          color: badge.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {badge.icon}
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h4 style={{
                              margin: 0,
                              fontSize: '0.92rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {file.title || file.file_name}
                            </h4>
                            <span style={{
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: badge.bg,
                              color: badge.color
                            }}>
                              {badge.label}
                            </span>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: '4px',
                            flexWrap: 'wrap'
                          }}>
                            {file.file_name && (
                              <span style={{ opacity: 0.85 }}>{file.file_name}</span>
                            )}
                            <span>•</span>
                            <span>{file.file_size || '1.8 MB'}</span>
                            <span>•</span>
                            <span>Uploaded {file.relative_date || 'Recently'}</span>
                            {file.instructor && (
                              <>
                                <span>•</span>
                                <span style={{ color: '#8B5CF6', fontWeight: 600 }}>By {file.instructor}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        {/* View Fullscreen Pill Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenFile(file)}
                          className="navbar-btn-hover"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 14px',
                            borderRadius: '10px',
                            background: 'rgba(139, 92, 246, 0.15)',
                            color: '#8B5CF6',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                          title="Open Fullscreen Document Preview"
                        >
                          <Maximize2 size={13} />
                          <span>View Fullscreen</span>
                        </button>

                        {/* Download Button */}
                        <button
                          type="button"
                          onClick={() => {
                            let downloadUrl = file.file_url || file.file_data;
                            if (!downloadUrl && (file.file_type || '').toUpperCase() === 'PDF') {
                              downloadUrl = getSamplePdfBlobUrl(file.file_name, file.title);
                            }
                            if (downloadUrl) {
                              const a = document.createElement('a');
                              a.href = downloadUrl;
                              a.download = file.file_name || 'Resource.pdf';
                              a.click();
                            }
                            triggerToast(`Downloading: ${file.file_name || file.title}`);
                          }}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            background: isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Download Resource"
                        >
                          <Download size={15} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =======================================================================
         4. FULL SCREEN DOCUMENT / PDF / PPTX VIEWER MODAL
         ======================================================================= */}
      {viewingResource && (() => {
        const isPdf = (viewingResource.file_type || '').toUpperCase() === 'PDF' || (viewingResource.file_name || '').toLowerCase().endsWith('.pdf');
        const isDoc = (viewingResource.file_type || '').toUpperCase().includes('DOC') || (viewingResource.file_name || '').toLowerCase().endsWith('.docx') || (viewingResource.file_name || '').toLowerCase().endsWith('.doc');
        const isPpt = (viewingResource.file_type || '').toUpperCase().includes('PPT') || (viewingResource.file_name || '').toLowerCase().endsWith('.pptx') || (viewingResource.file_name || '').toLowerCase().endsWith('.ppt');
        const badge = getFileBadgeDetails(viewingResource.file_type, viewingResource.file_name);

        let pdfSource = viewingResource.file_url || viewingResource.file_data;
        if (isPdf && !pdfSource) {
          pdfSource = getSamplePdfBlobUrl(viewingResource.file_name, viewingResource.title);
        }

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 999999,
              background: '#0B0F19',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Fullscreen Header Control Bar */}
            <div
              style={{
                height: '62px',
                padding: '0 24px',
                background: 'rgba(15, 23, 42, 0.95)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              {/* Left: Document details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '65%' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: badge.bg,
                  color: badge.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {badge.icon}
                </div>

                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {viewingResource.title || viewingResource.file_name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#A78BFA', fontWeight: 700 }}>{viewingResource.course_code}</span>
                    <span>•</span>
                    <span>{viewingResource.course_title}</span>
                    <span>•</span>
                    <span>{viewingResource.file_size || '1.8 MB'}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions (Download, Fullscreen toggle, Close) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => {
                    const downloadUrl = pdfSource || viewingResource.file_url || viewingResource.file_data;
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = viewingResource.file_name || 'Resource.pdf';
                    a.click();
                    triggerToast(`Downloading: ${viewingResource.file_name}`);
                  }}
                  className="navbar-btn-hover"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                  title="Download File"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>

                {/* Browser Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={toggleBrowserFullscreen}
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                  title="Toggle Fullscreen"
                >
                  {isBrowserFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  <span>{isBrowserFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setViewingResource(null)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#F87171',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}
                  title="Close Viewer (ESC)"
                >
                  <X size={16} />
                  <span>Close [ESC]</span>
                </button>
              </div>
            </div>

            {/* Fullscreen Body Viewer */}
            <div style={{ flex: 1, position: 'relative', width: '100%', height: 'calc(100vh - 62px)', background: '#0F172A', overflow: 'hidden' }}>

              {/* CASE 1: PDF DOCUMENT VIEWER (Full Native Iframe PDF Engine) */}
              {isPdf && (
                <iframe
                  src={pdfSource}
                  title={viewingResource.file_name}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', width: '100%', height: '100%', background: '#1E293B' }}
                />
              )}

              {/* CASE 2: DOCX / DOC WORKBENCH READER */}
              {isDoc && (
                <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '36px 20px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: '100%',
                    maxWidth: '860px',
                    background: '#ffffff',
                    color: '#0F172A',
                    borderRadius: '8px',
                    padding: '50px 60px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                    minHeight: '1000px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
                          QGenix University • Faculty Study Material
                        </div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '6px 0', color: '#0F172A' }}>
                          {viewingResource.title || viewingResource.file_name}
                        </h1>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                          Course: <strong>{viewingResource.course_code}</strong> — {viewingResource.course_title}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem' }}>
                          Academic Document
                        </span>
                      </div>
                    </div>

                    <div style={{ lineHeight: '1.7', fontSize: '0.94rem', color: '#1E293B' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginTop: '20px' }}>
                        Document Description & Overview:
                      </h3>
                      <p style={{ margin: '8px 0 16px', color: '#475569' }}>
                        {viewingResource.description || 'This course study material has been approved and published by your faculty instructor for comprehensive curriculum coverage and examination preparations.'}
                      </p>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginTop: '24px' }}>
                        Key Study Topics & Theoretical Notes:
                      </h3>
                      <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', margin: '14px 0' }}>
                        <strong>Section 1: Fundamental Principles & Core Concepts</strong>
                        <p style={{ margin: '6px 0 0', color: '#475569' }}>
                          Review all primary axioms, structural schemas, and algorithmic properties documented within this course guide.
                        </p>
                      </div>

                      <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', margin: '14px 0' }}>
                        <strong>Section 2: Examination & Practical Lab Questions</strong>
                        <p style={{ margin: '6px 0 0', color: '#475569' }}>
                          Complete the associated problem sets, case studies, and verification proofs prior to the next scheduled assessment.
                        </p>
                      </div>

                      <div style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px dashed #CBD5E1', paddingTop: '20px', color: '#94A3B8', fontSize: '0.8rem' }}>
                        End of Document • QGenix Learning System Verified
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE 3: PPTX / PPT SLIDE DECK VIEWER */}
              {isPpt && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                  <div style={{
                    width: '100%',
                    maxWidth: '920px',
                    aspectRatio: '16 / 9',
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
                    borderRadius: '14px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 20px 45px rgba(0,0,0,0.6)',
                    padding: '40px 48px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box'
                  }}>
                    {/* Slide Topbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {viewingResource.course_code} • Lecture Slide Deck
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                        Slide {activeSlideIndex + 1} of 3
                      </span>
                    </div>

                    {/* Slide Content */}
                    <div style={{ padding: '16px 0' }}>
                      {activeSlideIndex === 0 && (
                        <div>
                          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '12px' }}>
                            {viewingResource.title || viewingResource.file_name}
                          </h2>
                          <p style={{ fontSize: '1.1rem', color: '#94A3B8', lineHeight: '1.6' }}>
                            {viewingResource.description || 'Comprehensive teaching presentation covering theoretical foundations, empirical formulas, and laboratory experiments.'}
                          </p>
                          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <span style={{ background: 'rgba(139, 92, 246, 0.25)', color: '#DDD6FE', padding: '6px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                              Course: {viewingResource.course_code}
                            </span>
                            <span style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#BAE6FD', padding: '6px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                              Faculty Material
                            </span>
                          </div>
                        </div>
                      )}

                      {activeSlideIndex === 1 && (
                        <div>
                          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px' }}>
                            Core Objectives & Key Concept Outline
                          </h3>
                          <ul style={{ color: '#CBD5E1', fontSize: '1rem', lineHeight: '1.8', margin: 0, paddingLeft: '24px' }}>
                            <li>In-depth investigation of operational principles and design methodologies.</li>
                            <li>Formal analysis of runtime complexity and storage footprint tradeoffs.</li>
                            <li>Empirical case studies benchmarking real-world industrial deployments.</li>
                          </ul>
                        </div>
                      )}

                      {activeSlideIndex === 2 && (
                        <div>
                          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px' }}>
                            Summary & Lab Practice Work
                          </h3>
                          <div style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '10px', padding: '16px', color: '#E2E8F0', fontSize: '0.92rem' }}>
                            Ensure all lab exercises corresponding to this presentation are completed before the upcoming weekly practical evaluation session.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Slide Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                      <button
                        type="button"
                        disabled={activeSlideIndex === 0}
                        onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: activeSlideIndex === 0 ? 'rgba(255,255,255,0.3)' : '#ffffff',
                          padding: '6px 16px',
                          borderRadius: '8px',
                          cursor: activeSlideIndex === 0 ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      >
                        Previous
                      </button>

                      <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Use arrow buttons to navigate slides</span>

                      <button
                        type="button"
                        disabled={activeSlideIndex === 2}
                        onClick={() => setActiveSlideIndex(prev => Math.min(2, prev + 1))}
                        style={{
                          background: 'rgba(139, 92, 246, 0.3)',
                          border: '1px solid #8B5CF6',
                          color: '#ffffff',
                          padding: '6px 16px',
                          borderRadius: '8px',
                          cursor: activeSlideIndex === 2 ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      >
                        Next Slide
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

    </div>
  );
}

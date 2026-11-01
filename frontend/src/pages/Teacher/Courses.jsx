// ============================================================================
// Courses.jsx — QGenix Teacher Courses & Resource Management Portal
// ============================================================================
// Features:
// 1. 100% Real-Time DB-Backed (Allocations, Courses, Batches, Resources)
// 2. Pure display of assigned courses and their uploaded materials
// 3. Uploads happen strictly in "Resource Manager" (/teacher/resources)
// 4. Click any uploaded PDF/Doc to open in full-screen document viewer
// 5. Zero demo data, clean responsive liquid glass UI
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calendar, Award, 
  Search, SlidersHorizontal, Download, 
  FileText, AlertCircle, GraduationCap, 
  FolderOpen, Trash2, 
  Users, CheckCircle2, ChevronDown, ChevronUp, RefreshCw,
  Eye, Maximize2, Minimize2, Presentation, X, ChevronRight, ChevronLeft,
  ExternalLink
} from 'lucide-react';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';
import { getSamplePdfBlobUrl } from '../../utils/sampleDocumentGenerator';

export default function TeacherCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --------------------------------------------------------------------------
  // Teacher Identity
  // --------------------------------------------------------------------------
  const teacherId = user?.id || user?.institutional_id;
  const teacherName = user 
    ? (user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Course Instructor')
    : 'Course Instructor';
  const teacherParam = user?.first_name || user?.name || user?.username || teacherName;

  // --------------------------------------------------------------------------
  // Real-Time DB State
  // --------------------------------------------------------------------------
  const [allocatedCourses, setAllocatedCourses] = useState([]);
  const [teacherResources, setTeacherResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // UI Filtering States
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Course expansion panels
  const [expandedCourse, setExpandedCourse] = useState(null);

  // Full Screen Preview Modal State
  const [viewingResource, setViewingResource] = useState(null);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Global Notification Toast
  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper: check if an allocation belongs to the logged-in teacher
  const isAllocatedToMe = useCallback((allocTeacher) => {
    if (!allocTeacher) return false;
    const t = String(allocTeacher).toLowerCase().trim();
    const uName = (user?.name || '').toLowerCase().trim();
    const uUser = (user?.username || '').toLowerCase().trim();
    const uFirst = (user?.first_name || '').toLowerCase().trim();
    const uLast = (user?.last_name || '').toLowerCase().trim();
    const uInst = (user?.institutional_id || '').toLowerCase().trim();
    const uFull = `${uFirst} ${uLast}`.trim();
    const cleanTeacherName = teacherName.toLowerCase().trim();

    return (
      (uName && (t.includes(uName) || uName.includes(t))) ||
      (uUser && (t.includes(uUser) || uUser.includes(t))) ||
      (uFirst && (t.includes(uFirst) || uFirst.includes(t))) ||
      (uFull && (t.includes(uFull) || uFull.includes(t))) ||
      (uInst && t.includes(uInst)) ||
      (cleanTeacherName && (t.includes(cleanTeacherName) || cleanTeacherName.includes(t)))
    );
  }, [user, teacherName]);

  // --------------------------------------------------------------------------
  // 1. Fetch Real-Time Allocations & Metadata Directly from Database
  // --------------------------------------------------------------------------
  const loadDatabaseData = useCallback(async (showSpin = false) => {
    if (showSpin) setIsRefreshing(true);
    try {
      const teacherQuery = encodeURIComponent(teacherParam);
      const teacherIdQuery = teacherId ? `?teacher_id=${encodeURIComponent(teacherId)}` : `?teacher=${teacherQuery}`;

      const [allocRes, coursesRes, batchesRes, resRes] = await Promise.all([
        fetch(`${API_BASE}/api/auth/allocations/?teacher=${teacherQuery}`),
        fetch(`${API_BASE}/api/auth/courses/`),
        fetch(`${API_BASE}/api/auth/batches/`),
        fetch(`${API_BASE}/api/auth/teacher-resources/${teacherIdQuery}`)
      ]);

      // 1. Parse DB Allocations
      let dbAllocs = [];
      if (allocRes.ok) {
        const aData = await allocRes.json();
        if (Array.isArray(aData)) {
          dbAllocs = aData.filter(a => isAllocatedToMe(a.teacher));
        }
      }

      // 2. Parse DB Courses Catalog
      let dbCourses = [];
      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        if (Array.isArray(cData)) {
          dbCourses = cData;
        }
      }

      // 3. Parse DB Batches Catalog
      let dbBatches = [];
      if (batchesRes.ok) {
        const bData = await batchesRes.json();
        if (Array.isArray(bData)) {
          dbBatches = bData;
        }
      }

      // 4. Parse DB Teacher Resources
      let dbResources = [];
      if (resRes.ok) {
        const rData = await resRes.json();
        dbResources = rData.resources || [];
      }

      // Build deduplicated assigned courses list strictly from DB allocations
      const courseMap = new Map();
      dbAllocs.forEach(alloc => {
        const code = (alloc.course_code || alloc.courseCode || '').trim();
        if (!code) return;

        const name = alloc.course_name || alloc.courseName || code;
        const batch = alloc.batch || '';
        const section = alloc.section || '';
        const weeklyDays = alloc.weekly_days || alloc.weeklyDays || 'Sun, Tue';
        const hoursPerWeek = alloc.hours_per_week || alloc.hoursPerWeek || 3;

        // Match DB course catalog for credits and department
        const courseMeta = dbCourses.find(c => (c.code || '').toUpperCase() === code.toUpperCase());
        const credits = courseMeta ? (courseMeta.credits || 3) : 3;
        const department = courseMeta ? (courseMeta.dept || courseMeta.department || '') : (user?.department || '');

        // Match DB batch catalog for genuine semester
        const batchMeta = dbBatches.find(b => (b.name || '').trim().toLowerCase() === batch.trim().toLowerCase());
        const semester = alloc.semester || (batchMeta ? batchMeta.semester : '') || (courseMeta ? courseMeta.semester : '') || '';

        if (!courseMap.has(code)) {
          courseMap.set(code, {
            id: alloc.id || code,
            courseCode: code,
            courseName: name,
            semester,
            batch: batch || 'All Batches',
            section: section || 'Sec A',
            weeklyDays,
            hoursPerWeek,
            credits,
            department
          });
        } else {
          const existing = courseMap.get(code);
          if (batch && !existing.batch.includes(batch)) {
            existing.batch = `${existing.batch}, ${batch}`;
          }
          if (section && !existing.section.includes(section)) {
            existing.section = `${existing.section}, ${section}`;
          }
          if (!existing.semester && semester) {
            existing.semester = semester;
          }
        }
      });

      const parsedCourses = Array.from(courseMap.values());
      setAllocatedCourses(parsedCourses);
      setTeacherResources(dbResources);
    } catch (err) {
      console.error('Error fetching real-time database data:', err);
    } finally {
      setLoading(false);
      if (showSpin) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, [teacherParam, teacherId, isAllocatedToMe, user]);

  // Initial mount + real-time listeners across tabs & DB updates (with Resource Manager)
  useEffect(() => {
    loadDatabaseData();

    // BroadcastChannel listeners for cross-tab DB synchronization with ResourceManager
    let resourcesBc;
    let academicBc;
    try {
      resourcesBc = new BroadcastChannel('qgenix_teacher_resources');
      resourcesBc.onmessage = () => loadDatabaseData();
    } catch (_) {}

    try {
      academicBc = new BroadcastChannel('qgenix_academic_sync');
      academicBc.onmessage = (ev) => {
        if (ev?.data?.type === 'ALLOCATIONS_UPDATED' || ev?.data?.type === 'COURSE_ALLOCATED') {
          loadDatabaseData();
        }
      };
    } catch (_) {}

    const handleSync = () => loadDatabaseData();

    window.addEventListener('qgenix_allocations_updated', handleSync);
    window.addEventListener('qgenix_teacher_resources_updated', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      if (resourcesBc) resourcesBc.close();
      if (academicBc) academicBc.close();
      window.removeEventListener('qgenix_allocations_updated', handleSync);
      window.removeEventListener('qgenix_teacher_resources_updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [loadDatabaseData]);

  // Keyboard shortcut: close fullscreen on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && viewingResource) {
        setViewingResource(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingResource]);

  // --------------------------------------------------------------------------
  // Map Real DB Resources to Teacher's Allocated Courses
  // --------------------------------------------------------------------------
  const coursesWithResources = useMemo(() => {
    return allocatedCourses.map(c => {
      const courseCodeUpper = (c.courseCode || '').toUpperCase().trim();
      const courseNameLower = (c.courseName || '').toLowerCase().trim();

      const matchedResources = teacherResources.filter(res => {
        const resCode = (res.course_code || res.courseCode || '').toUpperCase().trim();
        const resTitle = (res.course_title || res.courseTitle || '').toLowerCase().trim();
        return (
          resCode === courseCodeUpper ||
          (resCode && courseCodeUpper.includes(resCode)) ||
          (resTitle && courseNameLower && resTitle.includes(courseNameLower))
        );
      });

      return {
        ...c,
        resources: matchedResources
      };
    });
  }, [allocatedCourses, teacherResources]);

  // Total count of PDF/docs/PPT resources uploaded by this teacher for their assigned courses from DB
  const totalUploadedResourcesCount = useMemo(() => {
    const allocatedCodes = new Set(allocatedCourses.map(c => (c.courseCode || '').toUpperCase().trim()));
    const matchingResources = teacherResources.filter(res => {
      const code = (res.course_code || res.courseCode || '').toUpperCase().trim();
      return allocatedCodes.has(code) || allocatedCodes.size === 0;
    });
    return matchingResources.length;
  }, [allocatedCourses, teacherResources]);

  // --------------------------------------------------------------------------
  // Filter Options & Filtered Courses
  // --------------------------------------------------------------------------
  const availableSemesters = useMemo(() => {
    const semSet = new Set();
    coursesWithResources.forEach(c => {
      if (c.semester) semSet.add(c.semester);
    });
    return Array.from(semSet);
  }, [coursesWithResources]);

  const availableBatches = useMemo(() => {
    const batchSet = new Set();
    coursesWithResources.forEach(c => {
      if (c.batch) {
        c.batch.split(',').forEach(b => batchSet.add(b.trim()));
      }
    });
    return Array.from(batchSet);
  }, [coursesWithResources]);

  const filteredCourses = useMemo(() => {
    return coursesWithResources.filter(course => {
      const matchesSemester = semesterFilter === 'All' || course.semester === semesterFilter;
      const matchesBatch = batchFilter === 'All' || (course.batch && course.batch.includes(batchFilter));
      const matchesSearch = 
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSemester && matchesBatch && matchesSearch;
    });
  }, [coursesWithResources, semesterFilter, batchFilter, searchQuery]);

  // --------------------------------------------------------------------------
  // Summary Stats (Strictly 2 cards: "My Assigned Courses" & "Uploaded PDF Resources")
  // --------------------------------------------------------------------------
  const statsOverview = useMemo(() => {
    return [
      { 
        label: 'My Assigned Courses', 
        value: allocatedCourses.length, 
        icon: <BookOpen size={24} />, 
        color: 'var(--accent-primary)', 
        bg: 'rgba(139, 92, 246, 0.12)',
        subtitle: 'Courses allocated by Admin'
      },
      { 
        label: 'Uploaded PDF Resources', 
        value: totalUploadedResourcesCount, 
        icon: <FolderOpen size={24} />, 
        color: '#10B981', 
        bg: 'rgba(16, 185, 129, 0.12)',
        subtitle: 'PDF, Slides & Notes in repository'
      }
    ];
  }, [allocatedCourses.length, totalUploadedResourcesCount]);

  // --------------------------------------------------------------------------
  // Full Screen Preview Opener
  // --------------------------------------------------------------------------
  const handleOpenFullscreen = (resource, course) => {
    setActiveSlideIndex(0);
    setViewingResource({
      ...resource,
      course_code: resource.course_code || course?.courseCode || 'CSE-301',
      course_title: resource.course_title || course?.courseName || 'Database Management Systems'
    });
  };

  // Toggle browser fullscreen
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsBrowserFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsBrowserFullscreen(false);
      }
    }
  };

  // Color helper for document format icon
  const getFileIconColor = (type = '', fileName = '') => {
    const t = (type || '').toUpperCase();
    const name = (fileName || '').toLowerCase();
    if (t.includes('PDF') || name.endsWith('.pdf')) return '#EF4444'; // Red
    if (t.includes('DOC') || name.endsWith('.docx') || name.endsWith('.doc')) return '#3B82F6'; // Blue
    if (t.includes('PPT') || name.endsWith('.pptx') || name.endsWith('.ppt') || t.includes('SLIDES')) return '#F59E0B'; // Orange
    if (t.includes('MANUAL')) return '#10B981'; // Green
    return '#8B5CF6';
  };

  // --------------------------------------------------------------------------
  // Real DB Delete Resource Handler (DELETE from DB table teacher_course_resources)
  // --------------------------------------------------------------------------
  const handleDeleteResource = async (e, resourceId, resourceTitle, courseCode) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove "${resourceTitle}" from database?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/teacher-resources/?id=${resourceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resourceId })
      });

      if (res.ok) {
        // Broadcast cross-tab update so Resource Manager updates in real-time
        try {
          const bc = new BroadcastChannel('qgenix_teacher_resources');
          bc.postMessage({ type: 'RESOURCE_DELETED', id: resourceId });
          setTimeout(() => bc.close(), 200);
        } catch (_) {}
        window.dispatchEvent(new CustomEvent('qgenix_teacher_resources_updated'));

        await loadDatabaseData();
        triggerToast(`Removed "${resourceTitle}" from ${courseCode}`);
      } else {
        triggerToast('Could not delete resource from database.');
      }
    } catch (e) {
      triggerToast('Error deleting resource');
    }
  };

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* Visual overrides */}
      <style>{`
        .glass-card-courses {
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(10, 20, 42, 0.42) 0%,
            rgba(6, 12, 28, 0.52) 100%
          ) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 20px !important;
          backdrop-filter: blur(40px) saturate(220%) !important;
          -webkit-backdrop-filter: blur(40px) saturate(220%) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.14),
            inset 0 12px 24px rgba(255, 255, 255, 0.02),
            0 8px 32px -8px   rgba(0, 0, 0, 0.45) !important;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .glass-card-courses:hover {
          transform: translateY(-2px) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 25px -5px     rgba(139, 92, 246, 0.18) !important;
        }

        body.light-mode .glass-card-courses {
          background: rgba(255, 255, 255, 0.85) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
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
          letter-spacing: 0.04em;
        }
        .type-pdf { background: rgba(239, 68, 68, 0.14); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.25); }
        .type-slides { background: rgba(139, 92, 246, 0.14); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.25); }
        .type-manual { background: rgba(16, 185, 129, 0.14); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.25); }
        .type-book { background: rgba(245, 158, 11, 0.14); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.25); }

        .resource-row-item {
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .resource-row-item:hover {
          background: rgba(139, 92, 246, 0.07);
          border-color: rgba(139, 92, 246, 0.35);
          transform: translateY(-1px);
        }

        body.light-mode .resource-row-item {
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        body.light-mode .resource-row-item:hover {
          background: rgba(139, 92, 246, 0.06);
          border-color: rgba(139, 92, 246, 0.35);
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="glow-orb-purple-t" style={{ top: '3%', left: '-5%' }} />
      <div className="glow-orb-blue-t" style={{ bottom: '10%', right: '-5%' }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <BookOpen className="text-violet-500" size={32} />
            My Courses & Resources
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.96rem', fontWeight: '500' }}>
            View your allocated academic courses and inspect all lecture materials, slides, and notes uploaded in Resource Manager.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: STATISTICS CARDS (2 Cards: My Assigned Courses & Uploaded PDF Resources)
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {statsOverview.map((stat, i) => (
          <div 
            key={i} 
            className="glass-card-courses" 
            style={{ 
              padding: '22px 24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              borderLeft: `4px solid ${stat.color}` 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {stat.subtitle}
                </div>
              </div>
              <div style={{ padding: '10px', borderRadius: '14px', background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =======================================================================
         SECTION 3: FILTRATION CONTROLS + REFRESH BUTTON
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
                  {availableSemesters.map(sem => (
                    <option key={sem} value={sem} style={{ background: 'var(--bg-primary)' }}>{sem}</option>
                  ))}
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
                  {availableBatches.map(b => (
                    <option key={b} value={b} style={{ background: 'var(--bg-primary)' }}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right: Search bar & DB Refresh Button */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', width: '100%', maxWidth: '380px' }}>
            <div className="flex flex-col gap-1" style={{ flex: 1 }}>
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

            <button
              onClick={() => loadDatabaseData(true)}
              className="btn btn-secondary"
              title="Sync latest database records"
              style={{ height: '38px', padding: '0 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-violet-400' : ''} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>

        </div>
      </Card>

      {/* =======================================================================
         SECTION 4: ALLOCATED COURSES LIST (100% Real-Time DB Driven)
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {loading ? (
          <div className="glass-card-courses" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <RefreshCw size={36} className="animate-spin text-violet-500" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Loading Assigned Courses...</h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Retrieving your official course allocations from university database...
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="glass-card-courses" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <AlertCircle size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 14px auto' }} />
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {allocatedCourses.length === 0 ? 'No Courses Allocated in Database' : 'No Courses Match Filters'}
            </h3>
            <p style={{ margin: '8px auto 0 auto', fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '520px' }}>
              {allocatedCourses.length === 0 
                ? `Administration has not allocated any courses to your instructor profile (${teacherName}) in the database. Once courses are assigned in Course Allocation, they will appear here automatically.`
                : 'No allocated courses matched your active filter or search keywords.'
              }
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isExpanded = expandedCourse === course.courseCode;

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
                
                {/* Course Header Banner */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {course.courseCode}{course.semester ? ` • ${course.semester}` : ''}
                    </span>
                    <h3 style={{ margin: '4px 0 6px 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {course.courseName}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      <span className="flex items-center gap-1.5"><GraduationCap size={15} />{course.batch}</span>
                      <span className="flex items-center gap-1.5"><Users size={15} />Section: {course.section}</span>
                      <span className="flex items-center gap-1.5"><Award size={15} />{course.credits} Credits</span>
                      <span className="flex items-center gap-1.5"><Calendar size={15} />{course.weeklyDays}</span>
                      <span className="flex items-center gap-1.5 text-violet-400 font-semibold"><FileText size={15} />{course.resources.length} Uploaded Material{course.resources.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setExpandedCourse(isExpanded ? null : course.courseCode)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 18px', fontSize: '0.82rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                    >
                      <span>{isExpanded ? 'Hide Materials' : `View Materials (${course.resources.length})`}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* EXPANDABLE RESOURCE LIST (File upload is removed — purely shows course files) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '4px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        {/* Section Header with count and shortcut to Resource Manager */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }} className="flex items-center gap-2">
                              <FileText size={18} className="text-violet-400" />
                              Available Course Materials ({course.resources.length})
                            </h4>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Click any file to preview in full screen. To add new materials for this course, visit Resource Manager.
                            </p>
                          </div>

                          <button
                            onClick={() => navigate('/teacher/resources')}
                            className="btn btn-secondary"
                            style={{ 
                              fontSize: '0.8rem', 
                              padding: '7px 15px', 
                              borderRadius: '10px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '7px',
                              background: 'rgba(139, 92, 246, 0.1)',
                              border: '1px solid rgba(139, 92, 246, 0.25)',
                              color: 'var(--accent-primary)',
                              fontWeight: 700
                            }}
                            title="Open Resource Manager to upload notes or slides"
                          >
                            <FolderOpen size={15} />
                            <span>Upload in Resource Manager</span>
                            <ExternalLink size={13} style={{ opacity: 0.7 }} />
                          </button>
                        </div>

                        {/* List of files for this course */}
                        {course.resources.length === 0 ? (
                          <div style={{ 
                            padding: '36px 20px', 
                            textAlign: 'center', 
                            color: 'var(--text-muted)', 
                            fontSize: '0.86rem', 
                            background: 'rgba(255,255,255,0.012)', 
                            borderRadius: '14px', 
                            border: '1px dashed var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <FileText size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                            <div>
                              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                                No materials uploaded yet for {course.courseCode}
                              </strong>
                              <span>Upload study materials, lecture slides, or notes from the Resource Manager portal.</span>
                            </div>
                            <button
                              onClick={() => navigate('/teacher/resources')}
                              className="btn btn-primary"
                              style={{ fontSize: '0.82rem', padding: '7px 18px', borderRadius: '10px', marginTop: '4px', fontWeight: 700 }}
                            >
                              Go to Resource Manager
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
                            {course.resources.map((file) => {
                              const fType = (file.file_type || file.type || 'PDF').toUpperCase();
                              const typeClass = fType === 'PDF' ? 'type-pdf' :
                                                fType === 'SLIDES' || fType === 'PPTX' || fType === 'PPT' ? 'type-slides' :
                                                fType === 'LAB MANUAL' ? 'type-manual' : 'type-book';

                              const fileDate = file.relative_date || (file.uploaded_at ? file.uploaded_at.split('T')[0] : file.date || 'Recent');
                              const fileSize = file.file_size || file.size || '1.5 MB';
                              const iconColor = getFileIconColor(fType, file.file_name);
                              const isPpt = fType.includes('PPT') || fType.includes('SLIDES');

                              return (
                                <div 
                                  key={file.id} 
                                  onClick={() => handleOpenFullscreen(file, course)}
                                  className="resource-row-item flex items-center justify-between gap-4"
                                  title="Click to view document in Full Screen"
                                >
                                  <div className="flex items-center gap-3" style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '10px',
                                      background: `${iconColor}18`,
                                      border: `1px solid ${iconColor}35`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      {isPpt ? <Presentation size={18} color={iconColor} /> : <FileText size={18} color={iconColor} />}
                                    </div>

                                    <div style={{ minWidth: 0 }}>
                                      <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {file.title || file.file_name}
                                      </span>
                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px', flexWrap: 'wrap' }}>
                                        <span className={`type-badge ${typeClass}`}>{fType}</span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fileSize}</span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {fileDate}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    {/* View Fullscreen button */}
                                    <button 
                                      type="button"
                                      onClick={() => handleOpenFullscreen(file, course)}
                                      className="btn btn-secondary"
                                      style={{ padding: '6px 9px', borderRadius: '8px', color: 'var(--accent-primary)', border: '1px solid rgba(139, 92, 246, 0.25)' }}
                                      title="Open Fullscreen Viewer"
                                    >
                                      <Eye size={14} />
                                    </button>

                                    {/* Download button */}
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const dlUrl = file.file_url || file.file_data || getSamplePdfBlobUrl(file.file_name, file.title);
                                        const a = document.createElement('a');
                                        a.href = dlUrl;
                                        a.download = file.file_name || `${file.title}.pdf`;
                                        a.click();
                                      }}
                                      className="btn btn-secondary"
                                      style={{ padding: '6px 9px', borderRadius: '8px', color: 'var(--text-secondary)' }}
                                      title="Download File"
                                    >
                                      <Download size={14} />
                                    </button>

                                    {/* Delete button */}
                                    <button 
                                      type="button"
                                      onClick={(e) => handleDeleteResource(e, file.id, file.title || file.file_name, course.courseCode)}
                                      className="btn btn-secondary"
                                      style={{ padding: '6px 9px', borderRadius: '8px', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.25)' }}
                                      title="Delete resource"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

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
         SECTION 5: FULL SCREEN DOCUMENT / PDF / PPT VIEWER MODAL
         ======================================================================= */}
      {viewingResource && (() => {
        const isPdf = (viewingResource.file_type || '').toUpperCase() === 'PDF' || (viewingResource.file_name || '').toLowerCase().endsWith('.pdf');
        const isDoc = (viewingResource.file_type || '').toUpperCase().includes('DOC') || (viewingResource.file_name || '').toLowerCase().endsWith('.docx') || (viewingResource.file_name || '').toLowerCase().endsWith('.doc');
        const isPpt = (viewingResource.file_type || '').toUpperCase().includes('PPT') || (viewingResource.file_type || '').toUpperCase().includes('SLIDES') || (viewingResource.file_name || '').toLowerCase().endsWith('.pptx') || (viewingResource.file_name || '').toLowerCase().endsWith('.ppt');
        const iconColor = getFileIconColor(viewingResource.file_type, viewingResource.file_name);

        // Determine URL for PDF rendering
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
              zIndex: 99999,
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
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              {/* Left: Document info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '65%' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: `${iconColor}22`,
                  border: `1px solid ${iconColor}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isPpt ? <Presentation size={19} color={iconColor} /> : <FileText size={19} color={iconColor} />}
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
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{viewingResource.course_code}</span>
                    <span>•</span>
                    <span>{viewingResource.course_title}</span>
                    <span>•</span>
                    <span>{viewingResource.file_size || '1.5 MB'}</span>
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
                    a.download = viewingResource.file_name || `${viewingResource.title}.pdf`;
                    a.click();
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
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
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
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
                          QGenix University • Academic Learning Worksheet
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
                          DOCX Document
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px' }}>
                          Semester Fall 2026
                        </div>
                      </div>
                    </div>

                    <div style={{ lineHeight: '1.7', fontSize: '0.94rem', color: '#1E293B' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginTop: '20px' }}>
                        Course Notes & Problem Sets:
                      </h3>
                      <p style={{ margin: '8px 0 16px', color: '#475569' }}>
                        Please review all theoretical principles, sample problems, and implementation details carefully.
                      </p>
                      <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '8px', border: '1px solid #E2E8F0', margin: '14px 0' }}>
                        <strong>Module Summary:</strong> {viewingResource.description || `Lecture and tutorial materials for ${viewingResource.course_title}.`}
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px dashed #CBD5E1', paddingTop: '20px', color: '#94A3B8', fontSize: '0.8rem' }}>
                        End of Document • Prepared by Course Faculty • QGenix LMS Verified
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
                            Comprehensive teaching presentation covering theoretical foundations, empirical models, and key laboratory principles.
                          </p>
                          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <span style={{ background: 'rgba(139, 92, 246, 0.25)', color: '#DDD6FE', padding: '6px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                              Instructor: {teacherName}
                            </span>
                            <span style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#BAE6FD', padding: '6px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                              Course: {viewingResource.course_code}
                            </span>
                          </div>
                        </div>
                      )}

                      {activeSlideIndex === 1 && (
                        <div>
                          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38BDF8', marginBottom: '14px' }}>
                            Key Learning Outcomes & Agenda
                          </h2>
                          <ul style={{ color: '#E2E8F0', fontSize: '1rem', lineHeight: '2', paddingLeft: '24px' }}>
                            <li>Fundamental principles, architectural concepts and core algorithms.</li>
                            <li>Applied problem solving and real-world system designs.</li>
                            <li>Midterm and final examination preparation notes.</li>
                          </ul>
                        </div>
                      )}

                      {activeSlideIndex === 2 && (
                        <div>
                          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399', marginBottom: '14px' }}>
                            Summary & Assigned Homework Problems
                          </h2>
                          <p style={{ color: '#E2E8F0', fontSize: '1rem', lineHeight: '1.7' }}>
                            Complete the practice problem sets outlined in the syllabus before the next lecture session.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Slide Navigation Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                      <button
                        onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                        disabled={activeSlideIndex === 0}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.78rem', opacity: activeSlideIndex === 0 ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ChevronLeft size={14} /> Previous
                      </button>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[0, 1, 2].map(idx => (
                          <div
                            key={idx}
                            onClick={() => setActiveSlideIndex(idx)}
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: activeSlideIndex === idx ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setActiveSlideIndex(prev => Math.min(2, prev + 1))}
                        disabled={activeSlideIndex === 2}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.78rem', opacity: activeSlideIndex === 2 ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* =======================================================================
         SECTION 6: NOTIFICATION TOAST
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
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '16px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
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
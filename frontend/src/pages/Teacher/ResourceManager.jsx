// =========================================================================================
// ResourceManager.jsx — Teacher Study Materials & Document Manager (100% DB-backed)
// -----------------------------------------------------------------------------------------
// Bengali Note:
// =========================================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config';
import { getSamplePdfBlobUrl } from '../../utils/sampleDocumentGenerator';
import {
  UploadCloud,
  FileText,
  Download,
  Trash2,
  X,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Layers,
  Eye,
  ChevronRight,
  Presentation,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export default function ResourceManager() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Teacher Profile identity
  const teacherId = user?.institutional_id || user?.id || 'FAC-01';
  const teacherName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.name || user?.username || 'Teacher');

  // Dynamic Real-Time Course Allocations for Logged-In Teacher (100% DB-driven)
  const [allocatedCourses, setAllocatedCourses] = useState([]);
  const [loadingAllocations, setLoadingAllocations] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('All'); // 'All' | 'PDF' | 'DOCX' | 'PPTX'
  const [toastMessage, setToastMessage] = useState('');

  // Full Screen Preview Modal State
  const [viewingResource, setViewingResource] = useState(null);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Trigger Toast Notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // --------------------------------------------------------------------------
  // 1. Load Real-Time Dynamic Course Allocations for Logged-In Teacher
  // --------------------------------------------------------------------------
  const loadAllocatedCourses = async () => {
    setLoadingAllocations(true);
    try {
      const teacherParam = user?.first_name || user?.name || user?.username || teacherName;
      let url = `${API_BASE}/api/auth/allocations/`;
      if (teacherParam) {
        url += `?teacher=${encodeURIComponent(teacherParam)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        // Deduplicate courses by course_code so teacher sees unique subjects
        const courseMap = new Map();
        if (Array.isArray(data)) {
          data.forEach(alloc => {
            const code = alloc.course_code || alloc.courseCode || '';
            const title = alloc.course_name || alloc.courseName || code;
            const batch = alloc.batch || '';
            const section = alloc.section || '';
            if (code && !courseMap.has(code)) {
              courseMap.set(code, {
                code,
                title,
                batch,
                section,
                label: `${code}: ${title}`
              });
            }
          });
        }
        const parsedCourses = Array.from(courseMap.values());
        setAllocatedCourses(parsedCourses);

        // Auto select first allocated course if current selection is not valid
        setSelectedCourse(prev => {
          if (prev && parsedCourses.some(c => c.code === prev)) {
            return prev;
          }
          return parsedCourses.length > 0 ? parsedCourses[0].code : '';
        });
      } else {
        setAllocatedCourses([]);
        setSelectedCourse('');
      }
    } catch (err) {
      console.warn('Failed to load real-time course allocations:', err);
      setAllocatedCourses([]);
      setSelectedCourse('');
    } finally {
      setLoadingAllocations(false);
    }
  };

  // --------------------------------------------------------------------------
  // 2. Load Uploaded Resources from Database Table (teacher_course_resources)
  // --------------------------------------------------------------------------
  const loadResources = async () => {
    setIsLoading(true);
    try {
      const idParam = user?.id || user?.institutional_id || user?.email;
      let url = `${API_BASE}/api/auth/teacher-resources/`;
      if (idParam) {
        url += `?teacher_id=${encodeURIComponent(idParam)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (e) {
      console.warn('Failed to load teacher resources from database:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load & real-time sync listeners
  useEffect(() => {
    loadAllocatedCourses();
    loadResources();

    // BroadcastChannel listeners for cross-tab real-time updates
    let resourcesBc;
    let academicBc;
    try {
      resourcesBc = new BroadcastChannel('qgenix_teacher_resources');
      resourcesBc.onmessage = () => {
        loadResources();
      };
    } catch (e) { }

    try {
      academicBc = new BroadcastChannel('qgenix_academic_sync');
      academicBc.onmessage = (ev) => {
        if (ev?.data?.type === 'ALLOCATIONS_UPDATED' || ev?.data?.type === 'COURSE_ALLOCATED') {
          loadAllocatedCourses();
        }
      };
    } catch (e) { }

    const handleCustomSync = () => loadResources();
    const handleAllocSync = () => loadAllocatedCourses();

    window.addEventListener('qgenix_teacher_resources_updated', handleCustomSync);
    window.addEventListener('qgenix_allocations_updated', handleAllocSync);
    window.addEventListener('focus', handleAllocSync);

    return () => {
      if (resourcesBc) resourcesBc.close();
      if (academicBc) academicBc.close();
      window.removeEventListener('qgenix_teacher_resources_updated', handleCustomSync);
      window.removeEventListener('qgenix_allocations_updated', handleAllocSync);
      window.removeEventListener('focus', handleAllocSync);
    };
  }, [user]);

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
  // 2. Drag & Drop and File Selection Handlers
  // --------------------------------------------------------------------------
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessUpload(e.target.files[0]);
    }
  };

  // --------------------------------------------------------------------------
  // 3. Upload File Directly to Database Table (teacher_course_resources)
  // --------------------------------------------------------------------------
  const handleProcessUpload = async (file) => {
    if (!file) return;

    // Validate extension
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
    if (!allowed.includes(ext)) {
      triggerToast('❌ Please upload a document in PDF, DOC, DOCX, PPT, or PPTX format.');
      return;
    }

    if (allocatedCourses.length === 0) {
      triggerToast('⚠️ No courses are allocated to your profile yet. Please contact the administrator.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    // Read file as Base64 Data URL so it can be previewed seamlessly in full screen
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setUploadProgress(60);

      try {
        const idParam = user?.id || user?.institutional_id || user?.email;
        const currentCourseObj = allocatedCourses.find(c => c.code === selectedCourse) || allocatedCourses[0];

        if (!currentCourseObj) {
          triggerToast('⚠️ Please select an allocated course before uploading.');
          setIsUploading(false);
          return;
        }

        // Format clean size string
        const sizeKb = file.size / 1024;
        const sizeStr = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`;

        const payload = {
          teacher_id: idParam,
          file_name: file.name,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          course_code: currentCourseObj.code,
          course_title: currentCourseObj.title,
          file_size: sizeStr,
          file_data: dataUrl,
          file_type: ext.toUpperCase(),
          description: `Course material for ${currentCourseObj.title} uploaded by ${teacherName}.`
        };

        const token = localStorage.getItem('access') || localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/api/auth/teacher-resources/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        setUploadProgress(100);

        if (res.ok) {
          triggerToast('✅ Course resource uploaded and saved to database successfully!');
          loadResources();

          // Broadcast real-time update
          window.dispatchEvent(new CustomEvent('qgenix_teacher_resources_updated'));
          try {
            const bc = new BroadcastChannel('qgenix_teacher_resources');
            bc.postMessage({ type: 'RESOURCE_UPLOADED', timestamp: Date.now() });
            bc.close();
          } catch (e) { }
        } else {
          let errMsg = 'Failed to save resource to database';
          try {
            const err = await res.json();
            errMsg = err.error || err.detail || errMsg;
          } catch (_) {
            try {
              const text = await res.text();
              if (text && !text.includes('<!DOCTYPE')) errMsg = text.slice(0, 120);
            } catch (_) {}
          }
          triggerToast(`❌ ${errMsg}`);
        }
      } catch (err) {
        console.error('Upload error:', err);
        triggerToast('❌ Network error while uploading study material');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  // --------------------------------------------------------------------------
  // 4. Delete Resource from Database
  // --------------------------------------------------------------------------
  const handleDeleteResource = async (e, resourceId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resource from database?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/teacher-resources/?id=${resourceId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        triggerToast('🗑️ Resource removed from database.');
        loadResources();
        window.dispatchEvent(new CustomEvent('qgenix_teacher_resources_updated'));
      } else {
        triggerToast('❌ Failed to delete resource.');
      }
    } catch (err) {
      triggerToast('❌ Error deleting resource.');
    }
  };

  // --------------------------------------------------------------------------
  // 5. Open in Full Screen Viewer
  // --------------------------------------------------------------------------
  const handleOpenFullscreen = (resource) => {
    setActiveSlideIndex(0);
    setViewingResource(resource);
  };

  // Toggle browser fullscreen
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsBrowserFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
        setIsBrowserFullscreen(false);
      }
    }
  };

  // Filtered resources for display
  const filteredResources = useMemo(() => {
    return resources.filter(item => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.course_code && item.course_code.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        fileTypeFilter === 'All' ||
        (item.file_type && item.file_type.toUpperCase().includes(fileTypeFilter.toUpperCase())) ||
        item.file_name.toUpperCase().endsWith(fileTypeFilter.toUpperCase());

      return matchesSearch && matchesType;
    });
  }, [resources, searchQuery, fileTypeFilter]);

  // Color helper for document format icon
  const getFileIconColor = (type = '', fileName = '') => {
    const t = (type || '').toUpperCase();
    const name = (fileName || '').toLowerCase();
    if (t.includes('PDF') || name.endsWith('.pdf')) return '#EF4444'; // Red
    if (t.includes('DOC') || name.endsWith('.docx') || name.endsWith('.doc')) return '#3B82F6'; // Blue
    if (t.includes('PPT') || name.endsWith('.pptx') || name.endsWith('.ppt')) return '#F59E0B'; // Orange
    return 'var(--text-muted)';
  };

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontWeight: 600,
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        style={{ display: 'none' }}
      />

      {/* ======= DRAG & DROP UPLOAD AREA ======= */}
      <Card>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            border: dragActive ? '2px dashed #8B5CF6' : '2px dashed var(--border-color)',
            borderRadius: '16px',
            padding: '52px 32px',
            textAlign: 'center',
            background: dragActive ? 'rgba(139, 92, 246, 0.12)' : 'rgba(30, 41, 59, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: dragActive ? '0 0 25px rgba(139, 92, 246, 0.25)' : 'none'
          }}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          {/* Cloud upload icon with vibrant ambient glow */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.05) 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <UploadCloud size={38} color="#A78BFA" />
          </div>

          <h3 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 800 }}>Drag & Drop Study Materials</h3>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '22px', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 22px' }}>
            Upload course textbooks, lecture notes, lab sheets, and slides in <strong>PDF, DOCX, or PPTX</strong> format. Records are securely stored directly in database.
          </p>

          {/* Target Course Tag Selector */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '6px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              marginBottom: '22px'
            }}
          >
            <BookOpen size={15} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={loadingAllocations || allocatedCourses.length === 0}
              style={{
                background: 'transparent',
                color: allocatedCourses.length === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                border: 'none',
                outline: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: allocatedCourses.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {loadingAllocations ? (
                <option value="" style={{ background: '#1e293b' }}>Loading allocated courses...</option>
              ) : allocatedCourses.length === 0 ? (
                <option value="" style={{ background: '#1e293b' }}>No courses allocated to your profile</option>
              ) : (
                allocatedCourses.map(c => (
                  <option key={c.code} value={c.code} style={{ background: '#1e293b' }}>
                    {c.code}: {c.title}
                  </option>
                ))
              )}
            </select>
            {!loadingAllocations && allocatedCourses.length > 0 && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#A78BFA',
                  fontWeight: 700,
                  border: '1px solid rgba(139, 92, 246, 0.25)'
                }}
              >
                {allocatedCourses.length} Allocated
              </span>
            )}
          </div>

          <div>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '0.9rem',
                fontWeight: 700,
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.35)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current && fileInputRef.current.click();
              }}
            >
              Browse Files
            </button>
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div style={{ marginTop: '20px', maxWidth: '360px', margin: '20px auto 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Uploading file to database...</span>
                <strong style={{ color: 'var(--accent-primary)' }}>{uploadProgress}%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ======= UPLOADED RESOURCES LIST ======= */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Uploaded Resources</span>
              <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                {resources.length} Saved in Database
              </span>
            </div>

            {/* Controls Bar: Search & Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Search input */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search books & notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    padding: '6px 10px 6px 30px',
                    fontSize: '0.78rem',
                    width: '180px'
                  }}
                />
              </div>

              {/* Format Filter Badges */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color-light)' }}>
                {['All', 'PDF', 'DOCX', 'PPTX'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFileTypeFilter(type)}
                    style={{
                      border: 'none',
                      background: fileTypeFilter === type ? 'rgba(139, 92, 246, 0.4)' : 'transparent',
                      color: fileTypeFilter === type ? '#ffffff' : 'var(--text-muted)',
                      fontSize: '0.72rem',
                      fontWeight: fileTypeFilter === type ? 700 : 500,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Refresh / Live Sync Button */}
              <button
                type="button"
                onClick={loadResources}
                disabled={isLoading}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '8px' }}
                title="Refresh from Database"
              >
                <RotateCcw size={12} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
                Sync
              </button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3" style={{ marginTop: '16px' }}>
          {filteredResources.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <BookOpen size={36} style={{ opacity: 0.35, marginBottom: '10px' }} />
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>No Study Materials Found</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px', opacity: 0.8 }}>
                Upload textbooks, lecture notes or syllabi using the drop area above.
              </div>
            </div>
          ) : (
            filteredResources.map((file) => {
              const iconColor = getFileIconColor(file.file_type, file.file_name);
              const isPdf = (file.file_type || '').toUpperCase() === 'PDF' || file.file_name.toLowerCase().endsWith('.pdf');
              const isPpt = (file.file_type || '').toUpperCase().includes('PPT') || file.file_name.toLowerCase().endsWith('.pptx') || file.file_name.toLowerCase().endsWith('.ppt');

              return (
                <div
                  key={file.id}
                  className="hover-lift"
                  onClick={() => handleOpenFullscreen(file)}
                  style={{
                    padding: '16px 20px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                  }}
                  title="Click to view full document in Full Screen"
                >

                  {/* Left section: file icon and filename metadata */}
                  <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isPpt ? (
                        <Presentation size={22} color={iconColor} />
                      ) : (
                        <FileText size={22} color={iconColor} />
                      )}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{file.file_name}</span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: `${iconColor}22`,
                          color: iconColor,
                          border: `1px solid ${iconColor}44`
                        }}>
                          {file.file_type || (isPdf ? 'PDF' : 'DOCX')}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>Uploaded {file.relative_date || 'Today'}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{file.course_code || 'PHY-101'}</span>
                        <span>•</span>
                        <span>{file.file_size || '1.8 MB'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right section: Action triggers (AI Ready & Processing status badges REMOVED) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                    {/* View Fullscreen Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenFullscreen(file)}
                      className="btn btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '8px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        borderColor: '#8B5CF6',
                        color: '#C4B5FD',
                        cursor: 'pointer'
                      }}
                      title="Open full document viewer"
                    >
                      <Maximize2 size={13} />
                      <span>View Fullscreen</span>
                    </button>

                    {/* Download Button */}
                    <a
                      href={file.file_url || file.file_data || '#'}
                      download={file.file_name}
                      onClick={(e) => {
                        if (!file.file_url && !file.file_data) {
                          e.preventDefault();
                          const blobUrl = getSamplePdfBlobUrl(file.file_name, file.title);
                          const a = document.createElement('a');
                          a.href = blobUrl;
                          a.download = file.file_name;
                          a.click();
                        }
                      }}
                      style={{
                        padding: '7px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      title="Download file"
                    >
                      <Download size={14} />
                    </a>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteResource(e, file.id)}
                      style={{
                        padding: '7px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete from database"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* =======================================================================
         FULL SCREEN DOCUMENT / PDF / PPT VIEWER MODAL
         ======================================================================= */}
      {viewingResource && (() => {
        const isPdf = (viewingResource.file_type || '').toUpperCase() === 'PDF' || viewingResource.file_name.toLowerCase().endsWith('.pdf');
        const isDoc = (viewingResource.file_type || '').toUpperCase().includes('DOC') || viewingResource.file_name.toLowerCase().endsWith('.docx') || viewingResource.file_name.toLowerCase().endsWith('.doc');
        const isPpt = (viewingResource.file_type || '').toUpperCase().includes('PPT') || viewingResource.file_name.toLowerCase().endsWith('.pptx') || viewingResource.file_name.toLowerCase().endsWith('.ppt');
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
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: `${iconColor}22`,
                  border: `1px solid ${iconColor}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isPpt ? <Presentation size={18} color={iconColor} /> : <FileText size={18} color={iconColor} />}
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
                    {viewingResource.file_name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{viewingResource.course_code || 'PHY-101'}</span>
                    <span>•</span>
                    <span>{viewingResource.course_title || 'Physics I: Mechanics & Thermodynamics'}</span>
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
                    a.download = viewingResource.file_name;
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
                          Course: <strong>{viewingResource.course_code || 'PHY-101'}</strong> — {viewingResource.course_title || 'Physics I: Mechanics & Thermodynamics'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem' }}>
                          DOCX Worksheet
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px' }}>
                          Semester Fall 2026
                        </div>
                      </div>
                    </div>

                    {/* Worksheet Body */}
                    <div style={{ lineHeight: '1.7', fontSize: '0.94rem', color: '#1E293B' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginTop: '20px' }}>
                        Instructions for Students:
                      </h3>
                      <p style={{ margin: '8px 0 16px', color: '#475569' }}>
                        Answer all analytical questions clearly. Show all coordinate vectors, free-body diagrams, and intermediate differential steps.
                        Submissions must be delivered before Friday 11:59 PM.
                      </p>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginTop: '24px' }}>
                        Part I: 2D Kinematics & Projectile Vectors
                      </h3>
                      <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', margin: '14px 0' }}>
                        <strong>Question 1.1:</strong> A projectile is launched from ground level with initial velocity <code>v0 = 35 m/s</code> at an angle <code>theta = 38°</code> relative to the horizontal plane.
                        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                          <li>(a) Calculate the total time of flight before impacting the surface.</li>
                          <li>(b) Determine the maximum altitude reached by the projectile.</li>
                          <li>(c) Find the total horizontal range (R) assuming negligible aerodynamic drag.</li>
                        </ul>
                      </div>

                      <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', margin: '14px 0' }}>
                        <strong>Question 1.2:</strong> A rescue aircraft traveling horizontally at constant altitude <code>h = 490 m</code> with speed <code>v = 120 m/s</code> drops an emergency survival container toward a stranded vessel.
                        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                          <li>(a) At what horizontal distance prior to the target must the pilot release the package?</li>
                          <li>(b) Compute the magnitude and angle of the final velocity vector upon water entry.</li>
                        </ul>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginTop: '24px' }}>
                        Part II: Relative Velocity & Frame Transformations
                      </h3>
                      <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', margin: '14px 0' }}>
                        <strong>Question 2.1:</strong> A boat can navigate at <code>5.0 m/s</code> in still water. A river of width <code>d = 200 m</code> flows uniformly with current speed <code>u = 3.0 m/s</code>.
                        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                          <li>(a) In what direction must the vessel steer to cross directly perpendicular to the bank?</li>
                          <li>(b) Determine the time required for this crossing.</li>
                        </ul>
                      </div>

                      <div style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px dashed #CBD5E1', paddingTop: '20px', color: '#94A3B8', fontSize: '0.8rem' }}>
                        End of Worksheet • Prepared by Course Faculty • QGenix LMS Verified
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
                        {viewingResource.course_code || 'PHY-101'} • Lecture Slide Deck
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
                            Comprehensive teaching presentation covering theoretical foundations, empirical formulas, and laboratory experiments.
                          </p>
                          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <span style={{ background: 'rgba(139, 92, 246, 0.25)', color: '#DDD6FE', padding: '6px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                              Instructor: {teacherName}
                            </span>
                            <span style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#BAE6FD', padding: '6px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                              Department of CSE / Sciences
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
                            <li>Understand fundamental physical conservation laws and vector projections.</li>
                            <li>Formulate kinematic models for real-world mechanical and thermodynamic systems.</li>
                            <li>Analyze laboratory datasets and compute theoretical vs experimental deviations.</li>
                            <li>Solve multi-stage problems for academic midterm and finals examinations.</li>
                          </ul>
                        </div>
                      )}

                      {activeSlideIndex === 2 && (
                        <div>
                          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399', marginBottom: '14px' }}>
                            Summary & Assigned Homework Problems
                          </h2>
                          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '18px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ margin: 0, color: '#F1F5F9', fontSize: '1rem', lineHeight: '1.7' }}>
                              Students are required to review the textbook chapters and complete the attached laboratory worksheet before the upcoming review session.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Slide Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                      <button
                        type="button"
                        disabled={activeSlideIndex === 0}
                        onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                        className="btn btn-secondary"
                        style={{ padding: '6px 16px', fontSize: '0.8rem', cursor: activeSlideIndex === 0 ? 'not-allowed' : 'pointer', opacity: activeSlideIndex === 0 ? 0.4 : 1 }}
                      >
                        Previous Slide
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
                              background: activeSlideIndex === idx ? '#8B5CF6' : 'rgba(255,255,255,0.2)',
                              cursor: 'pointer'
                            }}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={activeSlideIndex === 2}
                        onClick={() => setActiveSlideIndex(prev => Math.min(2, prev + 1))}
                        className="btn btn-primary"
                        style={{ padding: '6px 16px', fontSize: '0.8rem', cursor: activeSlideIndex === 2 ? 'not-allowed' : 'pointer', opacity: activeSlideIndex === 2 ? 0.4 : 1 }}
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
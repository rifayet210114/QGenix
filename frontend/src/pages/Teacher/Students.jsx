// ============================================================================
// Students.jsx — QGenix Teacher Student Directory & Academic Dossier Portal
// ============================================================================
// Matches Admin User Directory (admin/users):
// - 100% Real-Time DB Student Records
// - Multi-criteria academic filtering (Dept, Batch, Section, Status, Search)
// - Clean directory table format with student avatars, IDs, emails, CGPA & status
// - Full Student Academic Dossier & Official Record Modal (Passport photo, 8 Semesters,
//   Course-wise Attendance table, Exam Results SGPA & scorecard, Guardian & Institutional info)
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '../../components/Card';
import { useAdminData } from '../../contexts/AdminDataContext';
import { 
  Users, 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  X, 
  Eye, 
  Printer, 
  Calendar, 
  Award, 
  Phone, 
  FileText, 
  Filter, 
  RotateCcw,
  Lock,
  ZoomIn,
  Clock,
  BookOpen,
  Download,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { getStudentDetailedRecord } from '../../utils/studentAcademicRecords';

export default function TeacherStudents() {
  const { 
    students = [], 
    batches = [], 
    departments = [], 
    attendances = [] 
  } = useAdminData() || {};

  // Search & Filter States (Identical to admin/users)
  const [searchQuery, setSearchQuery] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('ALL');
  const [studentBatchFilter, setStudentBatchFilter] = useState('ALL');
  const [studentSectionFilter, setStudentSectionFilter] = useState('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL');

  // Modal States
  const [viewingStudent, setViewingStudent] = useState(null);
  const [activeSemIndex, setActiveSemIndex] = useState(0);
  const [studentCardTab, setStudentCardTab] = useState('attendance'); // 'attendance' | 'results' | 'profile'
  const [previewingPhoto, setPreviewingPhoto] = useState(null);

  // Keyboard shortcut: close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (previewingPhoto) setPreviewingPhoto(null);
        else if (viewingStudent) setViewingStudent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingStudent, previewingPhoto]);

  // Batch & Section matching helpers (Identical to admin/users)
  const matchesBatch = (itemBatch, filterBatch) => {
    if (!filterBatch || filterBatch === 'ALL') return true;
    if (!itemBatch) return false;
    const bClean = String(itemBatch).toLowerCase().trim();
    const fClean = String(filterBatch).toLowerCase().trim();
    if (bClean === fClean) return true;
    const bDigits = bClean.replace(/\D/g, '');
    const fDigits = fClean.replace(/\D/g, '');
    return (bDigits && fDigits && (bDigits === fDigits || bClean.includes(fClean) || fClean.includes(bClean)));
  };

  const matchesSection = (itemSection, filterSection) => {
    if (!filterSection || filterSection === 'ALL') return true;
    if (!itemSection) return false;
    const sClean = String(itemSection).replace(/^(sec|section)\s*/i, '').toLowerCase().trim();
    const fClean = String(filterSection).replace(/^(sec|section)\s*/i, '').toLowerCase().trim();
    return sClean === fClean || sClean.includes(fClean) || fClean.includes(sClean);
  };

  // Distinct Filter Options
  const availableStudentDepts = useMemo(() => Array.from(new Set([
    ...(departments || []).map(d => d.code || d.name),
    ...(students || []).map(s => s.dept || s.department)
  ].filter(Boolean))).sort(), [departments, students]);

  const availableStudentBatches = useMemo(() => Array.from(new Set([
    ...(batches || []).map(b => b.name),
    ...(students || []).map(s => s.batch)
  ].filter(Boolean))).sort(), [batches, students]);

  const availableStudentSections = useMemo(() => Array.from(new Set([
    'A', 'B', 'C', 'D',
    ...(students || []).map(s => (s.section || '').replace(/^(sec|section)\s*/i, '').trim())
  ].filter(Boolean))).sort(), [students]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return (students || []).filter(s => {
      // 1. Text Search Query (ID, Name, Email, Dept, Batch, Section)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const sId = (s.id || s.regNo || '').toLowerCase();
        const sName = (s.name || '').toLowerCase();
        const sEmail = (s.email || '').toLowerCase();
        const sDept = (s.dept || s.department || '').toLowerCase();
        const sBatch = (s.batch || '').toLowerCase();
        const sSec = (s.section || '').toLowerCase();
        const matchSearch = sId.includes(q) || sName.includes(q) || sEmail.includes(q) || sDept.includes(q) || sBatch.includes(q) || sSec.includes(q);
        if (!matchSearch) return false;
      }

      // 2. Department Filter
      if (studentDeptFilter !== 'ALL') {
        const sDept = (s.dept || s.department || '').toLowerCase().trim();
        const fDept = studentDeptFilter.toLowerCase().trim();
        if (sDept !== fDept) return false;
      }

      // 3. Batch Filter
      if (!matchesBatch(s.batch, studentBatchFilter)) return false;

      // 4. Section Filter
      if (!matchesSection(s.section, studentSectionFilter)) return false;

      // 5. Status Filter
      if (studentStatusFilter !== 'ALL' && s.status !== studentStatusFilter) return false;

      return true;
    });
  }, [students, searchQuery, studentDeptFilter, studentBatchFilter, studentSectionFilter, studentStatusFilter]);

  // Open Student Details Dossier Modal
  const handleOpenStudentDetails = useCallback((student) => {
    const detailedData = getStudentDetailedRecord(student, attendances);
    setViewingStudent(detailedData);
    setActiveSemIndex(detailedData.activeSemesterIndex !== undefined ? detailedData.activeSemesterIndex : 0);
    setStudentCardTab('attendance');
  }, [attendances]);



  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* Styles */}
      <style>{`
        .glass-card-students {
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

        body.light-mode .glass-card-students {
          background: rgba(255, 255, 255, 0.85) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        .student-table-row {
          transition: background 0.15s ease;
        }

        .student-table-row:hover {
          background: rgba(139, 92, 246, 0.06);
        }

        .dossier-photo-overlay {
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .dossier-photo-clickable:hover .dossier-photo-overlay {
          opacity: 1 !important;
        }

        .dossier-photo-clickable:hover {
          transform: scale(1.02);
          box-shadow: 0 16px 35px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.5) !important;
        }
      `}</style>

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <Users className="text-violet-500" size={32} />
            Student Directory & Academic Dossiers
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.96rem', fontWeight: '500' }}>
            Inspect student profiles, full attendance breakdown, semester exam results, and official academic records.
          </p>
        </div>
      </div>



      {/* =======================================================================
         SECTION 3: STUDENT DIRECTORY CARD (Exact layout from admin/users)
         ======================================================================= */}
      <Card title={`Student Directory (${filteredStudents.length} of ${students.length} Enrolled)`}>
        
        {/* Standard Academic Multi-Criteria Filter Bar */}
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '14px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '1px solid var(--border-color-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Filter size={16} color="var(--accent-primary)" />
            <span>Academic Filters:</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Search name, ID, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '32px', fontSize: '0.8rem', height: '34px', width: '100%' }}
              />
            </div>

            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dept:</span>
              <select 
                className="input-field"
                value={studentDeptFilter}
                onChange={e => setStudentDeptFilter(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px', minWidth: '110px' }}
              >
                <option value="ALL">All Depts</option>
                {availableStudentDepts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Batch Cohort Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Batch:</span>
              <select 
                className="input-field"
                value={studentBatchFilter}
                onChange={e => setStudentBatchFilter(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px', minWidth: '140px' }}
              >
                <option value="ALL">All Batches</option>
                {availableStudentBatches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Section:</span>
              <select 
                className="input-field"
                value={studentSectionFilter}
                onChange={e => setStudentSectionFilter(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px', minWidth: '100px' }}
              >
                <option value="ALL">All Secs</option>
                {availableStudentSections.map(sec => (
                  <option key={sec} value={sec}>Sec {sec}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status:</span>
              <select 
                className="input-field"
                value={studentStatusFilter}
                onChange={e => setStudentStatusFilter(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px', minWidth: '100px' }}
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {(studentDeptFilter !== 'ALL' || studentBatchFilter !== 'ALL' || studentSectionFilter !== 'ALL' || studentStatusFilter !== 'ALL' || searchQuery) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setStudentDeptFilter('ALL');
                  setStudentBatchFilter('ALL');
                  setStudentSectionFilter('ALL');
                  setStudentStatusFilter('ALL');
                  setSearchQuery('');
                }}
                style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Clear all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Directory Table (Same columns and formatting as admin/users) */}
        <div style={{ overflowX: 'auto', marginTop: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px' }}>Student ID</th>
                <th style={{ padding: '12px' }}>Full Name & Assigned Email</th>
                <th style={{ padding: '12px' }}>Department</th>
                <th style={{ padding: '12px' }}>Batch</th>
                <th style={{ padding: '12px' }}>Section</th>
                <th style={{ padding: '12px' }}>CGPA</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Academic Record</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No students found matching the selected filters. Try adjusting Department, Batch, or Section filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="student-table-row" style={{ borderBottom: '1px solid var(--border-color-light)', fontSize: '0.9rem' }}>
                    
                    {/* Student ID (Clickable badge to open dossier) */}
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <span 
                        className="badge badge-primary" 
                        style={{ fontFamily: 'monospace', fontSize: '0.82rem', cursor: 'pointer', transition: 'transform 0.15s' }}
                        title="Click to view full student academic card"
                        onClick={() => handleOpenStudentDetails(s)}
                      >
                        {s.id}
                      </span>
                    </td>

                    {/* Student Avatar + Name + Email */}
                    <td style={{ padding: '14px 12px' }}>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleOpenStudentDetails(s)}
                        title="Click to view full student details card (Attendance, Exam Results & Dossier)"
                      >
                        {s.profile_picture ? (
                          <img 
                            src={s.profile_picture} 
                            alt={s.name} 
                            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-primary)', flexShrink: 0, boxShadow: '0 0 8px rgba(139, 92, 246, 0.3)' }} 
                          />
                        ) : (
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                            {s.name?.charAt(0) || 'S'}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '170px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                              {s.name}
                            </span>
                            <span 
                              style={{ 
                                fontSize: '0.68rem', 
                                padding: '2px 7px', 
                                borderRadius: '6px', 
                                background: 'rgba(139, 92, 246, 0.15)', 
                                color: 'var(--accent-primary)', 
                                border: '1px solid rgba(139, 92, 246, 0.28)',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                lineHeight: 1.2,
                                flexShrink: 0
                              }}
                            >
                              View ↗
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={11} style={{ opacity: 0.7 }} /> {s.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td style={{ padding: '14px 12px' }}>
                      <span className="badge badge-secondary">{s.dept || s.department}</span>
                    </td>

                    {/* Batch */}
                    <td style={{ padding: '14px 12px' }}>
                      {s.batch}
                    </td>

                    {/* Section */}
                    <td style={{ padding: '14px 12px' }}>
                      <span className="badge badge-secondary" style={{ fontWeight: 600 }}>
                        Sec {String(s.section || 'A').replace(/^(sec|section)\s*/i, '').trim()}
                      </span>
                    </td>

                    {/* CGPA */}
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {s.cgpa || '3.75'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 12px' }}>
                      <span className={`badge ${s.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {s.status}
                      </span>
                    </td>

                    {/* Actions: View Dossier Button */}
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <button 
                        className="btn btn-secondary" 
                        title="View Full Student Academic Dossier"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', border: '1px solid rgba(139, 92, 246, 0.25)' }}
                        onClick={() => handleOpenStudentDetails(s)}
                      >
                        <Eye size={14} />
                        <span>View Dossier</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </Card>

      {/* =======================================================================
         SECTION 4: STUDENT ACADEMIC DOSSIER & OFFICIAL RECORD MODAL
         (Exact same comprehensive modal as in admin/users)
         ======================================================================= */}
      {viewingStudent && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px'
          }}
          onClick={() => setViewingStudent(null)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '960px',
              maxHeight: '92vh',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, #131B2E 0%, #0B0F19 100%)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(139, 92, 246, 0.18)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header & Quick Actions Bar */}
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(19, 27, 46, 0.95)',
              backdropFilter: 'blur(16px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--accent-primary), #3B82F6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Student Academic Dossier & Official Record
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Institutional Profile • University Portal
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Print Profile Button */}
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => window.print()}
                  title="Print / Save Student Record"
                >
                  <Printer size={14} /> Print Card
                </button>

                {/* Close Button */}
                <button 
                  type="button"
                  onClick={() => setViewingStudent(null)} 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '50%',
                    color: 'var(--text-muted)', 
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Passport Photo Frame & Identity Header */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '24px 20px 18px',
              borderBottom: '1px solid var(--border-color)',
              background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, transparent 70%)'
            }}>
              {/* Passport Photo Frame: Standard 35mm x 45mm ratio (~124px x 155px) */}
              <div 
                style={{
                  position: 'relative',
                  width: '124px',
                  height: '155px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '3px solid var(--accent-primary)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(139, 92, 246, 0.35)',
                  background: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  flexShrink: 0,
                  cursor: viewingStudent.profile_picture ? 'pointer' : 'default',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                className={viewingStudent.profile_picture ? "dossier-photo-clickable" : ""}
                title={viewingStudent.profile_picture ? "Click to view full photo & download" : "No photo available"}
                onClick={() => {
                  if (viewingStudent.profile_picture) {
                    setPreviewingPhoto({
                      url: viewingStudent.profile_picture,
                      name: viewingStudent.name,
                      id: viewingStudent.studentId
                    });
                  }
                }}
              >
                {viewingStudent.profile_picture ? (
                  <>
                    <img 
                      src={viewingStudent.profile_picture} 
                      alt={viewingStudent.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        objectPosition: 'center top'
                      }} 
                    />
                    <div 
                      className="dossier-photo-overlay"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.55)',
                        backdropFilter: 'blur(2px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        color: 'white',
                        pointerEvents: 'none'
                      }}
                    >
                      <ZoomIn size={22} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                      <span style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.3px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                        View / Download
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.25))',
                    color: 'var(--text-muted)',
                    gap: '6px',
                    padding: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                      color: 'white',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {viewingStudent.name?.charAt(0) || 'S'}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      No Photo Assigned
                    </span>
                  </div>
                )}
              </div>

              {/* Student Name */}
              <h2 style={{ 
                margin: '0 0 4px', 
                fontSize: '1.5rem', 
                fontWeight: 800, 
                color: 'var(--text-primary)',
                letterSpacing: '-0.3px',
                textAlign: 'center'
              }}>
                {viewingStudent.name}
              </h2>

              {/* Key Identity Badges */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '4px' }}>
                <span className="badge badge-primary" style={{ fontFamily: 'monospace', fontSize: '0.82rem', padding: '3px 10px' }}>
                  ID: {viewingStudent.studentId}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(139, 92, 246, 0.1)', padding: '3px 10px', borderRadius: '12px' }}>
                  <Lock size={12} /> {viewingStudent.email}
                </span>
                <span className="badge badge-secondary" style={{ fontSize: '0.78rem' }}>
                  {viewingStudent.dept} • {viewingStudent.departmentFullName}
                </span>
                <span className="badge badge-secondary" style={{ fontSize: '0.78rem' }}>
                  {viewingStudent.batch}
                </span>
                <span className={`badge ${viewingStudent.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.78rem' }}>
                  {viewingStudent.status}
                </span>
              </div>
            </div>

            {/* Key Summary Indicators Bar */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
              gap: '12px', 
              padding: '16px 24px',
              background: 'rgba(255, 255, 255, 0.015)',
              borderBottom: '1px solid var(--border-color)'
            }}>
              {/* CGPA */}
              <div style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '10px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current CGPA</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
                  {viewingStudent.cgpa} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 4.00</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '2px' }}>{viewingStudent.standing}</div>
              </div>

              {/* Cumulative Attendance */}
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '10px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cumulative Attendance</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                  {viewingStudent.cumulativeAttendance}%
                </div>
                <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '2px' }}>✓ University Attendance Record</div>
              </div>

              {/* Completed Credits */}
              <div style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '10px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credits Completed</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#3B82F6', marginTop: '2px' }}>
                  {viewingStudent.totalCompletedCredits} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 144 Cr</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Degree Progress</div>
              </div>

              {/* Faculty Advisor */}
              <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '10px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Faculty Advisor</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {viewingStudent.advisor.split('(')[0]}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-warning)', marginTop: '2px' }}>Academic Advisor</div>
              </div>

              {/* Fee & Accounts Clearance */}
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '10px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clearance & Dues</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
                  100% Cleared
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>No Pending Institutional Dues</div>
              </div>
            </div>

            {/* SEMESTER-WISE SELECTOR TABS */}
            <div style={{ 
              padding: '14px 24px 0',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select Semester to Inspect Attendance & Examination Results:
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                  Active Semester: <strong>{viewingStudent.activeSemesterName}</strong>
                </span>
              </div>

              {/* 8 Semesters Horizontal Buttons */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px' }}>
                {viewingStudent.semesters.map((sem, sIdx) => {
                  const isSelected = activeSemIndex === sIdx;
                  return (
                    <button
                      key={sem.name}
                      type="button"
                      onClick={() => setActiveSemIndex(sIdx)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: isSelected ? 'linear-gradient(135deg, var(--accent-primary), #6366F1)' : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? 'white' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 12px rgba(139, 92, 246, 0.4)' : 'none'
                      }}
                    >
                      <span>{sem.name}</span>
                      {sem.isCurrent && (
                        <span style={{ 
                          fontSize: '0.62rem', 
                          padding: '1px 5px', 
                          borderRadius: '10px', 
                          background: isSelected ? '#10B981' : 'rgba(16, 185, 129, 0.2)', 
                          color: isSelected ? 'white' : '#10B981',
                          fontWeight: 700 
                        }}>
                          Current
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE SEMESTER CONTENT AREA */}
            {(() => {
              const currentSem = viewingStudent.semesters[activeSemIndex] || viewingStudent.semesters[0];

              return (
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Sub-Tabs: Attendance vs Exam Results vs Institutional Profile */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setStudentCardTab('attendance')}
                        className={`btn ${studentCardTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Calendar size={14} />
                        <span>Semester Attendance ({currentSem.attendance.percentage}%)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentCardTab('results')}
                        className={`btn ${studentCardTab === 'results' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Award size={14} />
                        <span>All Exam Results (SGPA: {currentSem.sgpa})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentCardTab('profile')}
                        className={`btn ${studentCardTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <FileText size={14} />
                        <span>Guardian & Institutional Dossier</span>
                      </button>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Term: <strong style={{ color: 'var(--text-primary)' }}>{currentSem.term}</strong> • Credits: <strong style={{ color: 'var(--accent-primary)' }}>{currentSem.totalCredits} Cr</strong>
                    </div>
                  </div>

                  {/* ================= TAB 1: SEMESTER ATTENDANCE ================= */}
                  {studentCardTab === 'attendance' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Attendance Overview Card */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                            {currentSem.name} Overall Attendance Compliance
                          </div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                            {currentSem.attendance.percentage}%
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Attended <strong>{currentSem.attendance.totalAttended}</strong> out of <strong>{currentSem.attendance.totalHeld}</strong> classes held (Absent: {currentSem.attendance.totalAbsent})
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${currentSem.attendance.isEligible ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                            {currentSem.attendance.statusText}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Minimum University Threshold: 75.0%
                          </div>
                        </div>
                      </div>

                      {/* Course-Wise Attendance Table */}
                      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                              <th style={{ padding: '10px 14px' }}>Course Code</th>
                              <th style={{ padding: '10px 14px' }}>Course Title</th>
                              <th style={{ padding: '10px 14px' }}>Instructor</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Held</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Attended</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Absent</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Attendance %</th>
                              <th style={{ padding: '10px 14px' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentSem.courses.map((c) => (
                              <tr key={c.code} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                                <td style={{ padding: '12px 14px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                                  {c.code}
                                </td>
                                <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                                  {c.title}
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                                    {c.credits} Credits
                                  </span>
                                </td>
                                <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  {c.instructor}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                  {c.classesHeld}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#10B981' }}>
                                  {c.classesAttended}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', color: '#EF4444' }}>
                                  {c.classesAbsent}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: c.attendancePct >= 85 ? '#10B981' : c.attendancePct >= 75 ? '#F59E0B' : '#EF4444' }}>
                                  {c.attendancePct}%
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                  <span className={`badge ${c.attendancePct >= 85 ? 'badge-success' : c.attendancePct >= 75 ? 'badge-primary' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                                    {c.attendanceStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 2: SEMESTER EXAM RESULTS ================= */}
                  {studentCardTab === 'results' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* SGPA & Exam Performance Ribbon */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.06) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.25)',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                            {currentSem.name} Tabulated Examination Results
                          </div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
                            SGPA: {currentSem.sgpa} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 4.00</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '2px' }}>
                            ✓ Passed All {currentSem.courses.length} Courses • Total Credits Earned: {currentSem.totalCredits} Cr
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-success" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                            Result Status: Published & Verified
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Examination Session: {currentSem.term}
                          </div>
                        </div>
                      </div>

                      {/* Complete Exam Scorecard Table */}
                      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                              <th style={{ padding: '10px 14px' }}>Course Code</th>
                              <th style={{ padding: '10px 14px' }}>Course Title</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Credits</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Midterm (40)</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Quizzes/CA (20)</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Final Exam (40)</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Total (100)</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Grade</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>GPA</th>
                              <th style={{ padding: '10px 14px' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentSem.courses.map((c) => (
                              <tr key={c.code} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                                <td style={{ padding: '12px 14px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                                  {c.code}
                                </td>
                                <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                                  {c.title}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                  {c.credits}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>
                                  {c.midtermMarks}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>
                                  {c.quizMarks}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>
                                  {c.finalMarks}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: 'var(--accent-primary)' }}>
                                  {c.totalMarks}
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                  <span className={`badge ${c.grade.startsWith('A') ? 'badge-success' : 'badge-primary'}`} style={{ fontWeight: 800, minWidth: '32px' }}>
                                    {c.grade}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700 }}>
                                  {c.gpa.toFixed(2)}
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                  <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                                    {c.passStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 3: INSTITUTIONAL & GUARDIAN DOSSIER ================= */}
                  {studentCardTab === 'profile' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                      {/* Personal & Contact Details */}
                      <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '18px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                          <Phone size={16} /> Contact & Emergency Information
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Student Phone:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>{viewingStudent.phone}</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Assigned Institutional Email:</span>
                            <strong style={{ color: 'var(--accent-primary)' }}>{viewingStudent.email}</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Blood Group:</span>
                            <strong style={{ color: '#EF4444' }}>{viewingStudent.bloodGroup}</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Guardian Name:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>{viewingStudent.guardianName}</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Guardian Phone:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>{viewingStudent.guardianPhone}</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Permanent Address:</span>
                            <strong style={{ color: 'var(--text-primary)', textAlign: 'right', maxWidth: '240px' }}>{viewingStudent.address}</strong>
                          </div>
                        </div>
                      </div>

                      {/* University Registration & Financial Clearances */}
                      <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '18px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#10B981', fontWeight: 700, fontSize: '0.9rem' }}>
                          <CheckCircle2 size={16} /> Institutional Registration & Clearances
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Registration Session:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>Spring 2023 - Ongoing</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Degree Program:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>B.Sc. in {viewingStudent.dept}</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Enrollment Category:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>Regular (Undergraduate)</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Library Clearance:</span>
                            <strong style={{ color: '#10B981' }}>✓ Fully Cleared (0 Books Due)</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Laboratory Clearance:</span>
                            <strong style={{ color: '#10B981' }}>✓ No Pending Breakage Charges</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Academic Standing:</span>
                            <strong style={{ color: 'var(--accent-primary)' }}>{viewingStudent.standing} (Good Standing)</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* =======================================================================
         PASSPORT PHOTO PREVIEW MODAL
         ======================================================================= */}
      {previewingPhoto && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20000,
            padding: '20px'
          }}
          onClick={() => setPreviewingPhoto(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '460px',
              width: '100%',
              background: '#0F172A',
              borderRadius: '20px',
              padding: '24px',
              border: '2px solid var(--accent-primary)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>
                  {previewingPhoto.name}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ID: {previewingPhoto.id} • Official Photo
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setPreviewingPhoto(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <img 
              src={previewingPhoto.url} 
              alt={previewingPhoto.name} 
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'contain',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />

            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <a 
                href={previewingPhoto.url} 
                download={`${previewingPhoto.name}_${previewingPhoto.id}.jpg`}
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <Download size={14} /> Download Photo
              </a>
              <button 
                type="button"
                onClick={() => setPreviewingPhoto(null)}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
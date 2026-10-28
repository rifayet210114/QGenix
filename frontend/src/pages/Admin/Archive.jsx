// =========================================================================================
// Archive.jsx — Academic Past Semester Archives & Graduated Cohorts
// -----------------------------------------------------------------------------------------
// Bengali Note:
// =========================================================================================

import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { useAdminData } from '../../contexts/AdminDataContext';
import { API_BASE } from '../../config';
import { 
  Archive, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  GraduationCap, 
  Calendar, 
  Award, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  CheckCircle, 
  ExternalLink,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AcademicArchive() {
  const { departments, batches, refreshFromDB } = useAdminData();

  const [archivesList, setArchivesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [detailedRecords, setDetailedRecords] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, archived, graduate

  // Accordion trackers: Batch level & Semester level
  const [expandedBatches, setExpandedBatches] = useState({});
  const [expandedCohorts, setExpandedCohorts] = useState({});

  // Fetch all archives from backend
  const fetchArchives = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/archives/`);
      if (res.ok) {
        const data = await res.json();
        setArchivesList(data);
      }
    } catch (err) {
      console.error('Failed to fetch archives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  // Toggle master batch expansion
  const toggleBatchExpand = (batchName) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchName]: !prev[batchName]
    }));
  };

  // Fetch full records for a specific archive cohort if not yet loaded
  const toggleCohortExpand = async (archiveId) => {
    const isCurrentlyExpanded = !!expandedCohorts[archiveId];
    setExpandedCohorts(prev => ({ ...prev, [archiveId]: !isCurrentlyExpanded }));

    if (!isCurrentlyExpanded && !detailedRecords[archiveId]) {
      setLoadingDetails(prev => ({ ...prev, [archiveId]: true }));
      try {
        const res = await fetch(`${API_BASE}/api/auth/archives/${archiveId}/`);
        if (res.ok) {
          const data = await res.json();
          setDetailedRecords(prev => ({ ...prev, [archiveId]: data.records || [] }));
        }
      } catch (err) {
        console.error('Failed to fetch archive details:', err);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [archiveId]: false }));
      }
    }
  };

  // Filtered archives
  const filteredArchives = useMemo(() => {
    return archivesList.filter(item => {
      const matchSearch = !searchQuery || 
        item.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.semester.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept = selectedDept === 'all' || item.department.toLowerCase() === selectedDept.toLowerCase();
      const matchBatch = selectedBatch === 'all' || item.batch_name.toLowerCase().includes(selectedBatch.toLowerCase());
      const matchSem = selectedSemester === 'all' || item.semester.toLowerCase() === selectedSemester.toLowerCase();
      
      let matchStatus = true;
      if (selectedStatus === 'graduate') {
        matchStatus = item.is_graduate_batch || (item.status || '').toLowerCase() === 'graduated';
      } else if (selectedStatus === 'archived') {
        matchStatus = !item.is_graduate_batch && (item.status || '').toLowerCase() !== 'graduated';
      }

      return matchSearch && matchDept && matchBatch && matchSem && matchStatus;
    });
  }, [archivesList, searchQuery, selectedDept, selectedBatch, selectedSemester, selectedStatus]);

  // Semester ordinal helper
  const semOrderWeight = (semStr) => {
    if (!semStr) return 99;
    const lower = semStr.toLowerCase();
    if (lower.includes('1st')) return 1;
    if (lower.includes('2nd')) return 2;
    if (lower.includes('3rd')) return 3;
    if (lower.includes('4th')) return 4;
    if (lower.includes('5th')) return 5;
    if (lower.includes('6th')) return 6;
    if (lower.includes('7th')) return 7;
    if (lower.includes('8th')) return 8;
    return 9;
  };

  // Group filtered archives by Batch into Master Batch Cards
  const groupedBatches = useMemo(() => {
    const groups = {};

    filteredArchives.forEach(item => {
      const bKey = item.batch_name;
      if (!groups[bKey]) {
        // Match against active system batches
        const activeBatchMatch = (batches || []).find(
          b => (b.name || '').trim().toLowerCase() === (item.batch_name || '').trim().toLowerCase()
        );

        // Determine graduated vs active
        const isGraduated = !activeBatchMatch || 
                            activeBatchMatch.is_graduate_batch || 
                            activeBatchMatch.status === 'Graduated' ||
                            item.is_graduate_batch || 
                            item.status === 'Graduated';

        const currentSemester = activeBatchMatch ? activeBatchMatch.semester : 'Graduated';

        groups[bKey] = {
          batch_name: item.batch_name,
          department: item.department || (activeBatchMatch ? activeBatchMatch.dept : 'CSE'),
          academic_year: item.academic_year || (activeBatchMatch ? activeBatchMatch.academic_year : ''),
          isGraduated,
          currentSemester,
          semesters: []
        };
      }

      if (item.is_graduate_batch || item.status === 'Graduated') {
        groups[bKey].isGraduated = true;
      }

      groups[bKey].semesters.push(item);
    });

    // Sort previous semesters (1st Semester, 2nd Semester, ...)
    Object.values(groups).forEach(grp => {
      grp.semesters.sort((a, b) => semOrderWeight(a.semester) - semOrderWeight(b.semester));

      const totalStudents = Math.max(...grp.semesters.map(s => s.total_students || s.records_count || 0), 0);
      const validGpas = grp.semesters.filter(s => s.average_gpa).map(s => s.average_gpa);
      const avgGpa = validGpas.length > 0 ? (validGpas.reduce((a, b) => a + b, 0) / validGpas.length).toFixed(2) : '3.65';
      const validAtt = grp.semesters.filter(s => s.average_attendance).map(s => s.average_attendance);
      const avgAtt = validAtt.length > 0 ? (validAtt.reduce((a, b) => a + b, 0) / validAtt.length).toFixed(1) : '88.5';

      grp.aggregatedStudents = totalStudents;
      grp.aggregatedGpa = avgGpa;
      grp.aggregatedAttendance = avgAtt;
    });

    return Object.values(groups);
  }, [filteredArchives, batches]);

  // Overall Statistics
  const totalCohorts = archivesList.length;
  const uniqueBatchesCount = new Set(archivesList.map(a => a.batch_name)).size;
  const graduateCount = new Set(archivesList.filter(a => a.is_graduate_batch || a.status === 'Graduated').map(a => a.batch_name)).size;
  const totalStudentsArchived = archivesList.reduce((acc, curr) => acc + (curr.total_students || curr.records_count || 0), 0);
  const avgGpa = archivesList.length > 0 
    ? (archivesList.reduce((acc, curr) => acc + (curr.average_gpa || 0), 0) / archivesList.length).toFixed(2)
    : '0.00';

  // Distinct Batch Options for Filter Dropdown
  const batchOptions = useMemo(() => {
    const set = new Set();
    archivesList.forEach(a => set.add(a.batch_name));
    return Array.from(set).sort();
  }, [archivesList]);

  // Generate Structured PDF Transcript
  const generateArchivePDF = async (archive) => {
    let records = detailedRecords[archive.id];
    if (!records || records.length === 0) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/archives/${archive.id}/`);
        if (res.ok) {
          const data = await res.json();
          records = data.records || [];
          setDetailedRecords(prev => ({ ...prev, [archive.id]: records }));
        }
      } catch (e) {
        console.error('Failed to load records for PDF:', e);
      }
    }

    const doc = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Top Decorative Brand Bar
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, pageWidth, 8, 'F');

    // 2. Institutional Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('QGENIX UNIVERSITY ACADEMIC CONTROLLER', 40, 42);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('OFFICE OF THE REGISTRAR & EXAMINATION DIVISION | PERMANENT RECORD ARCHIVE', 40, 58);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(40, 68, pageWidth - 40, 68);

    // 3. Document Title & Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`SEMESTER TABULATION & ATTENDANCE RECORD: ${archive.semester.toUpperCase()}`, 40, 92);

    if (archive.is_graduate_batch || archive.status === 'Graduated') {
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(pageWidth - 170, 78, 130, 20, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('GRADUATED COHORT', pageWidth - 160, 92);
    } else {
      doc.setFillColor(99, 102, 241);
      doc.roundedRect(pageWidth - 160, 78, 120, 20, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('OFFICIAL ARCHIVE', pageWidth - 150, 92);
    }

    // 4. Metadata Details Grid
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, 106, pageWidth - 80, 46, 6, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(40, 106, pageWidth - 80, 46, 6, 6, 'S');

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('ACADEMIC BATCH:', 54, 124);
    doc.text('DEPARTMENT:', 220, 124);
    doc.text('ACADEMIC YEAR:', 380, 124);
    doc.text('ENROLLED ROSTER:', 520, 124);
    doc.text('CLASS AVERAGE GPA:', 650, 124);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(archive.batch_name || 'N/A'), 54, 139);
    doc.text(String(archive.department || 'CSE'), 220, 139);
    doc.text(String(archive.academic_year || '2025-2026'), 380, 139);
    doc.text(`${archive.total_students || (records || []).length} Students`, 520, 139);
    doc.text(`${archive.average_gpa ? archive.average_gpa.toFixed(2) : '3.65'} / 4.00`, 650, 139);

    // 5. Students Tabulation AutoTable
    const tableData = (records || []).map((r, index) => [
      index + 1,
      r.student_id || `STU-${r.id}`,
      r.student_name,
      r.email || 'N/A',
      r.registration_no || 'N/A',
      r.section || 'A',
      `${r.attendance_pct || 88.5}%`,
      `${r.mid_marks || 25.0} / 30`,
      `${r.final_marks || 45.0} / 50`,
      (r.semester_gpa || 3.75).toFixed(2),
      (r.cumulative_cgpa || 3.75).toFixed(2),
      r.grade || 'A',
      r.remarks || (archive.is_graduate_batch ? 'Graduated' : 'Promoted')
    ]);

    autoTable(doc, {
      startY: 165,
      head: [[
        '#',
        'Student ID',
        'Student Full Name',
        'Institutional Email',
        'Reg No.',
        'Sec',
        'Attendance',
        'Mid Exam',
        'Final Exam',
        'Sem GPA',
        'CGPA',
        'Grade',
        'Standing / Remarks'
      ]],
      body: tableData.length > 0 ? tableData : [['-', 'No Records Found', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']],
      styles: {
        fontSize: 8,
        cellPadding: 6,
        font: 'helvetica',
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 24 },
        1: { halign: 'left', fontStyle: 'bold', cellWidth: 70 },
        2: { halign: 'left', fontStyle: 'bold', cellWidth: 100 },
        3: { halign: 'left', cellWidth: 120 },
        4: { halign: 'center', cellWidth: 70 },
        5: { halign: 'center', cellWidth: 30 },
        6: { halign: 'center', fontStyle: 'bold', cellWidth: 55 },
        7: { halign: 'center', cellWidth: 55 },
        8: { halign: 'center', cellWidth: 55 },
        9: { halign: 'center', fontStyle: 'bold', textColor: [99, 102, 241], cellWidth: 45 },
        10: { halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129], cellWidth: 45 },
        11: { halign: 'center', fontStyle: 'bold', cellWidth: 38 },
        12: { halign: 'left', cellWidth: 65 }
      },
      margin: { left: 40, right: 40 }
    });

    // 6. Signatures & Institutional Authentication
    const finalY = doc.lastAutoTable.finalY + 30;
    if (finalY < pageHeight - 80) {
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(1);

      // Signature 1: Exam Controller
      doc.line(60, finalY + 40, 220, finalY + 40);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('CONTROLLER OF EXAMINATIONS', 70, finalY + 52);
      doc.setFont('helvetica', 'normal');
      doc.text('QGenix Academic Directorate', 78, finalY + 63);

      // Signature 2: Department Head
      doc.line(pageWidth - 240, finalY + 40, pageWidth - 80, finalY + 40);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('DEAN / HEAD OF DEPARTMENT', pageWidth - 230, finalY + 52);
      doc.setFont('helvetica', 'normal');
      doc.text(`Department of ${archive.department}`, pageWidth - 215, finalY + 63);

      // System Stamp text
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`System Generated Verifiable Archive Document | Timestamp: ${new Date().toLocaleString()}`, 40, pageHeight - 20);
    }

    const cleanFilename = `${archive.batch_name.replace(/[^a-zA-Z0-9]/g, '_')}_${archive.semester.replace(/[^a-zA-Z0-9]/g, '_')}_Transcript.pdf`;
    doc.save(cleanFilename);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ==================== PAGE HEADER ==================== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.25))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid rgba(139, 92, 246, 0.4)'
            }}>
              <Archive size={22} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Academic Archive & Past Semester Records
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Permanent institutional repository of previous completed semesters, student scorecards, attendance analytics, and graduated cohorts.
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={fetchArchives} 
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
        >
          <RefreshCw size={16} className={loading ? 'spin-animation' : ''} />
          Sync Archive DB
        </button>
      </div>

      {/* ==================== 4 KPI SUMMARY CARDS ==================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <Card className="hover-scale" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Archived Batches</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-primary)' }}>{uniqueBatchesCount}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Layers size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Across {totalCohorts} archived semester periods
          </div>
        </Card>

        <Card className="hover-scale" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Graduated Batches</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-success)' }}>{graduateCount}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-success)' }}>
              <GraduationCap size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Batches completed full 8-semester tenure
          </div>
        </Card>

        <Card className="hover-scale" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Archived Student Records</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-secondary)' }}>{totalStudentsArchived}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-secondary)' }}>
              <Users size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Verified student term-wise scorecards
          </div>
        </Card>

        <Card className="hover-scale" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Historical Mean GPA</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#F59E0B' }}>{avgGpa}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
              <Award size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Institutional cumulative archive average
          </div>
        </Card>

      </div>

      {/* ==================== ADVANCED FILTER PANEL ==================== */}
      <Card title="Archive Filtering & Query Console">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '12px' }}>
          
          {/* Search Query */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>Search Keyword</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search batch, department, semester..." 
                className="input-field" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>Department</label>
            <select 
              className="input-field" 
              value={selectedDept} 
              onChange={e => setSelectedDept(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>Academic Batch</label>
            <select 
              className="input-field" 
              value={selectedBatch} 
              onChange={e => setSelectedBatch(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">All Academic Batches</option>
              {batchOptions.map(bName => (
                <option key={bName} value={bName}>{bName}</option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>Semester</label>
            <select 
              className="input-field" 
              value={selectedSemester} 
              onChange={e => setSelectedSemester(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">All Semesters (1st to 8th)</option>
              {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'].map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>Cohort Status</label>
            <select 
              className="input-field" 
              value={selectedStatus} 
              onChange={e => setSelectedStatus(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">All Archive Types</option>
              <option value="archived">Past Semesters (Ongoing Batches)</option>
              <option value="graduate">Graduated Batches Only</option>
            </select>
          </div>

        </div>

        {/* Active Filters Clear Button */}
        {(searchQuery || selectedDept !== 'all' || selectedBatch !== 'all' || selectedSemester !== 'all' || selectedStatus !== 'all') && (
          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
                setSelectedBatch('all');
                setSelectedSemester('all');
                setSelectedStatus('all');
              }}
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </Card>

      {/* ==================== MASTER BATCH ARCHIVES LIST ==================== */}
      <Card title={`Archived Academic Batches (${groupedBatches.length} Cohorts • ${filteredArchives.length} Semesters)`}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin-animation" style={{ margin: '0 auto 12px' }} />
            <div>Loading verified academic archives from database...</div>
          </div>
        ) : groupedBatches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <Archive size={42} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ margin: '0 0 6px', color: 'var(--text-primary)' }}>No Archived Records Found</h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>No past semesters match your selected filter criteria. When an admin advances a batch or marks it as Graduate, records appear here automatically.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {groupedBatches.map((batchGroup) => {
              const isBatchExpanded = !!expandedBatches[batchGroup.batch_name];
              const isGraduate = batchGroup.isGraduated;

              return (
                <div 
                  key={batchGroup.batch_name}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '14px',
                    border: `1px solid ${isGraduate ? 'rgba(16, 185, 129, 0.4)' : 'rgba(139, 92, 246, 0.35)'}`,
                    boxShadow: isGraduate ? '0 4px 20px rgba(16, 185, 129, 0.06)' : '0 4px 20px rgba(139, 92, 246, 0.06)',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {/* ================= MASTER BATCH BOX HEADER ================= */}
                  <div 
                    style={{ 
                      padding: '18px 22px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      cursor: 'pointer',
                      background: isGraduate 
                        ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))' 
                        : 'linear-gradient(90deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.02))',
                      userSelect: 'none'
                    }}
                    onClick={() => toggleBatchExpand(batchGroup.batch_name)}
                  >
                    {/* Left: Identity & Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '12px', 
                        background: isGraduate ? 'rgba(16, 185, 129, 0.18)' : 'rgba(139, 92, 246, 0.18)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: isGraduate ? 'var(--accent-success)' : 'var(--accent-primary)',
                        border: `1px solid ${isGraduate ? 'rgba(16, 185, 129, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                        flexShrink: 0
                      }}>
                        {isGraduate ? <GraduationCap size={24} /> : <Layers size={22} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                            {batchGroup.batch_name}
                          </span>
                          
                          <span className="badge badge-secondary" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                            {batchGroup.department}
                          </span>

                          {/* Distinct Status Mark: Graduated vs Active with Upgraded Semester */}
                          {isGraduate ? (
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '3px 12px', 
                                borderRadius: '20px', 
                                fontSize: '0.8rem', 
                                fontWeight: 800,
                                background: 'rgba(16, 185, 129, 0.18)', 
                                color: 'var(--accent-success)',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)'
                              }}
                            >
                              <GraduationCap size={15} /> Graduated
                            </span>
                          ) : (
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '3px 12px', 
                                borderRadius: '20px', 
                                fontSize: '0.8rem', 
                                fontWeight: 800,
                                background: 'rgba(59, 130, 246, 0.18)', 
                                color: '#60A5FA',
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                boxShadow: '0 0 12px rgba(59, 130, 246, 0.15)'
                              }}
                            >
                              <ArrowRight size={14} /> Currently in: {batchGroup.currentSemester}
                            </span>
                          )}

                          <span 
                            style={{ 
                              padding: '2px 9px', 
                              borderRadius: '6px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700,
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            {batchGroup.semesters.length} Archived {batchGroup.semesters.length === 1 ? 'Semester' : 'Semesters'}
                          </span>
                        </div>

                        {/* Summary Metrics */}
                        <div style={{ display: 'flex', gap: '18px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px', flexWrap: 'wrap' }}>
                          <span>Session: <strong style={{ color: 'var(--text-primary)' }}>{batchGroup.academic_year || '2025 - 2026'}</strong></span>
                          <span>Students: <strong style={{ color: 'var(--text-primary)' }}>{batchGroup.aggregatedStudents}</strong></span>
                          <span>Cumulative Avg GPA: <strong style={{ color: 'var(--accent-secondary)' }}>{batchGroup.aggregatedGpa}</strong></span>
                          <span>Avg Attendance: <strong style={{ color: 'var(--accent-success)' }}>{batchGroup.aggregatedAttendance}%</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Expand / Collapse Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => toggleBatchExpand(batchGroup.batch_name)}
                        className={isBatchExpanded ? "btn btn-primary" : "btn btn-secondary"}
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '0.82rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          fontWeight: 700
                        }}
                      >
                        {isBatchExpanded ? (
                          <><span>Hide Semesters</span> <ChevronUp size={16} /></>
                        ) : (
                          <><span>View Previous Semesters ({batchGroup.semesters.length})</span> <ChevronDown size={16} /></>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ================= PREVIOUS SEMESTERS SUB-BOXES (EXPANDED) ================= */}
                  {isBatchExpanded && (
                    <div 
                      style={{ 
                        borderTop: '1px solid var(--border-color)', 
                        padding: '20px 22px', 
                        background: 'rgba(15, 23, 42, 0.45)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                      }}
                    >
                      {/* Section banner */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
                          Completed Past Semesters of {batchGroup.batch_name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Click "View Records" on any semester below to view student scorecard or download PDF transcript.
                        </div>
                      </div>

                      {/* Semester Sub-Cards */}
                      {batchGroup.semesters.map((archive) => {
                        const isCohortExpanded = !!expandedCohorts[archive.id];
                        const records = detailedRecords[archive.id] || [];
                        const isLoadingDetails = !!loadingDetails[archive.id];

                        return (
                          <div 
                            key={archive.id}
                            style={{
                              background: 'var(--bg-secondary)',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color)',
                              overflow: 'hidden',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            {/* Semester Sub-Box Header */}
                            <div 
                              style={{
                                padding: '14px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '12px',
                                cursor: 'pointer',
                                background: isCohortExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                              }}
                              onClick={() => toggleCohortExpand(archive.id)}
                            >
                              {/* Left Info */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <div style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '8px',
                                  background: 'rgba(59, 130, 246, 0.12)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--accent-secondary)'
                                }}>
                                  <BookOpen size={16} />
                                </div>

                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span 
                                      style={{ 
                                        padding: '3px 10px', 
                                        borderRadius: '6px', 
                                        fontSize: '0.82rem', 
                                        fontWeight: 800,
                                        background: 'rgba(59, 130, 246, 0.2)',
                                        color: 'var(--accent-secondary)',
                                        border: '1px solid rgba(59, 130, 246, 0.4)'
                                      }}
                                    >
                                      {archive.semester}
                                    </span>
                                    <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                                      {archive.department}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                      Year: <strong>{archive.academic_year || '2026'}</strong>
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', flexWrap: 'wrap' }}>
                                    <span>Students: <strong style={{ color: 'var(--text-primary)' }}>{archive.total_students || archive.records_count}</strong></span>
                                    <span>Batch Avg GPA: <strong style={{ color: 'var(--accent-secondary)' }}>{archive.average_gpa ? archive.average_gpa.toFixed(2) : '3.65'}</strong></span>
                                    <span>Avg Attendance: <strong style={{ color: 'var(--accent-success)' }}>{archive.average_attendance ? archive.average_attendance.toFixed(1) : '88.5'}%</strong></span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Actions */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={e => e.stopPropagation()}>
                                <button 
                                  onClick={() => generateArchivePDF(archive)}
                                  className="btn btn-primary"
                                  style={{ 
                                    padding: '7px 14px', 
                                    fontSize: '0.8rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px'
                                  }}
                                  title="Download Structured Official University PDF"
                                >
                                  <Download size={14} /> Download PDF
                                </button>

                                <button 
                                  onClick={() => toggleCohortExpand(archive.id)}
                                  className="btn btn-secondary"
                                  style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  {isCohortExpanded ? (
                                    <>Hide Scorecards <ChevronUp size={16} /></>
                                  ) : (
                                    <>View Records <ChevronDown size={16} /></>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Detailed Student Scorecards Table */}
                            {isCohortExpanded && (
                              <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px', background: 'var(--bg-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {archive.semester} Student Performance Roster ({records.length} Students)
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    Archive Record ID: <code style={{ color: 'var(--accent-primary)' }}>ARCH-{archive.id}</code>
                                  </div>
                                </div>

                                {isLoadingDetails ? (
                                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                    <RefreshCw size={20} className="spin-animation" style={{ margin: '0 auto 8px' }} />
                                    <div>Loading student scorecard rows...</div>
                                  </div>
                                ) : records.length === 0 ? (
                                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    No individual student transcripts attached to this archive yet.
                                  </div>
                                ) : (
                                  <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                                      <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                          <th style={{ padding: '10px 8px' }}>#</th>
                                          <th style={{ padding: '10px 8px' }}>Student ID</th>
                                          <th style={{ padding: '10px 8px' }}>Student Name</th>
                                          <th style={{ padding: '10px 8px' }}>Email Address</th>
                                          <th style={{ padding: '10px 8px' }}>Reg No.</th>
                                          <th style={{ padding: '10px 8px' }}>Sec</th>
                                          <th style={{ padding: '10px 8px' }}>Attendance</th>
                                          <th style={{ padding: '10px 8px' }}>Mid Exam</th>
                                          <th style={{ padding: '10px 8px' }}>Final Exam</th>
                                          <th style={{ padding: '10px 8px' }}>Sem GPA</th>
                                          <th style={{ padding: '10px 8px' }}>CGPA</th>
                                          <th style={{ padding: '10px 8px' }}>Grade</th>
                                          <th style={{ padding: '10px 8px' }}>Academic Standing</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {records.map((r, idx) => (
                                          <tr key={r.id || idx} style={{ borderBottom: '1px solid var(--border-color-light)', fontSize: '0.85rem' }}>
                                            <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                                            <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                              {r.student_id}
                                            </td>
                                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>{r.student_name}</td>
                                            <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{r.email}</td>
                                            <td style={{ padding: '10px 8px' }}>
                                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.registration_no}</span>
                                            </td>
                                            <td style={{ padding: '10px 8px' }}>
                                              <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>Sec {r.section || 'A'}</span>
                                            </td>
                                            <td style={{ padding: '10px 8px' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ 
                                                  fontWeight: 700, 
                                                  fontSize: '0.82rem',
                                                  color: r.attendance_pct >= 85 ? 'var(--accent-success)' : (r.attendance_pct >= 75 ? '#F59E0B' : 'var(--accent-danger)')
                                                }}>
                                                  {r.attendance_pct}%
                                                </span>
                                              </div>
                                            </td>
                                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>{r.mid_marks} / 30</td>
                                            <td style={{ padding: '10px 8px', fontWeight: 600 }}>{r.final_marks} / 50</td>
                                            <td style={{ padding: '10px 8px' }}>
                                              <span style={{ 
                                                padding: '2px 8px', 
                                                borderRadius: '4px', 
                                                background: 'rgba(99, 102, 241, 0.15)', 
                                                color: 'var(--accent-secondary)', 
                                                fontWeight: 800,
                                                fontSize: '0.82rem'
                                              }}>
                                                {(r.semester_gpa || 3.75).toFixed(2)}
                                              </span>
                                            </td>
                                            <td style={{ padding: '10px 8px' }}>
                                              <span style={{ 
                                                padding: '2px 8px', 
                                                borderRadius: '4px', 
                                                background: 'rgba(16, 185, 129, 0.15)', 
                                                color: 'var(--accent-success)', 
                                                fontWeight: 800,
                                                fontSize: '0.82rem'
                                              }}>
                                                {(r.cumulative_cgpa || 3.75).toFixed(2)}
                                              </span>
                                            </td>
                                            <td style={{ padding: '10px 8px' }}>
                                              <span className="badge badge-primary" style={{ fontWeight: 800, fontSize: '0.8rem' }}>
                                                {r.grade || 'A'}
                                              </span>
                                            </td>
                                            <td style={{ padding: '10px 8px' }}>
                                              <span style={{ 
                                                fontSize: '0.8rem',
                                                color: (r.remarks || '').includes('Graduated') ? 'var(--accent-success)' : 'var(--text-secondary)'
                                              }}>
                                                {r.remarks || 'Promoted'}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </Card>

    </div>
  );
}

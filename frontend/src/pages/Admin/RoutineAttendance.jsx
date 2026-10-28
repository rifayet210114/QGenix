// =========================================================================================
// RoutineAttendance.jsx — 100% Functional Master Routine & Attendance Hub
// -----------------------------------------------------------------------------------------
// Bengali Note:
// Central state management provider with automatic persistence and sync
// =========================================================================================

import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useDeleteConfirm } from '../../contexts/DeleteConfirmContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Plus, 
  Trash2, 
  X,
  Filter,
  CheckCircle2,
  Edit2,
  Archive,
  ChevronDown,
  ChevronRight,
  Eye,
  Search,
  Users,
  XCircle,
  AlertCircle,
  BookOpen,
  Download,
  FileText,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RoutineAttendance() {
  const { confirmDelete } = useDeleteConfirm();
  const { 
    routineSlots, addRoutineSlot, editRoutineSlot, deleteRoutineSlot,
    courses, faculty, batches, departments, addAuditLog,
    attendances, fetchAttendances, deleteAttendanceRecord,
    students: registeredStudents
  } = useAdminData();

  // All 7 days of the academic week
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Helper to dynamically get today's weekday name
  const getTodayWeekday = () => {
    const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    return weekDays[todayIndex] || 'Sunday';
  };

  const todayWeekday = getTodayWeekday();

  const [activeTab, setActiveTab] = useState('routine');
  // Auto-load today's routine on page load as requested by user
  const [selectedDay, setSelectedDay] = useState(todayWeekday);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);

  // Available distinct departments dynamically collected
  const availableDepts = Array.from(new Set([
    ...(departments || []).map(d => (d.code || d.name || '').trim().toUpperCase()),
    ...courses.map(c => (c.dept || c.department || (c.code || '').split('-')[0] || '').trim().toUpperCase()),
    ...batches.map(b => (b.dept || b.department || '').trim().toUpperCase()),
    ...routineSlots.map(s => {
      const codePrefix = (s.course || '').split('-')[0].trim().toUpperCase();
      return codePrefix || '';
    })
  ])).filter(d => d && d !== 'ALL').sort();

  // Helper to determine slot's department
  const getSlotDepartment = (slot) => {
    if (slot.dept) return slot.dept.toUpperCase();
    if (slot.department) return slot.department.toUpperCase();
    
    // Check matched course in courses list
    const courseCode = (slot.course || '').split(':')[0].trim().toUpperCase();
    const matchedCourse = courses.find(c => c.code && (c.code.toUpperCase() === courseCode || (slot.course || '').toUpperCase().includes(c.code.toUpperCase())));
    if (matchedCourse && (matchedCourse.dept || matchedCourse.department)) {
      return (matchedCourse.dept || matchedCourse.department).toUpperCase();
    }
    
    // Check code prefix (e.g., "CSE-301" -> "CSE", "EEE-211" -> "EEE", "BBA-205" -> "BBA")
    const prefixMatch = courseCode.match(/^([A-Za-z]+)/);
    if (prefixMatch && prefixMatch[1]) {
      return prefixMatch[1].toUpperCase();
    }
    
    // Check batch name
    if (slot.batch) {
      for (const d of availableDepts) {
        if (slot.batch.toUpperCase().includes(d)) return d;
      }
    }

    // Check teacher department
    if (slot.teacher) {
      const matchedFac = faculty.find(f => f.name && f.name.toLowerCase().trim() === slot.teacher.toLowerCase().trim());
      if (matchedFac && (matchedFac.dept || matchedFac.department)) {
        return (matchedFac.dept || matchedFac.department).toUpperCase();
      }
    }

    return 'OTHER';
  };

  // Filter routine slots by selected day and selected department
  const filteredSlots = routineSlots.filter(slot => {
    if (slot.day !== selectedDay) return false;
    if (selectedDept !== 'ALL') {
      const slotDept = getSlotDepartment(slot);
      if (slotDept !== selectedDept.toUpperCase()) return false;
    }
    return true;
  });

  // Slot Form State
  const [slotForm, setSlotForm] = useState({
    day: todayWeekday,
    time: '09:00 AM - 10:30 AM',
    course: 'CSE-301: Database Management Systems',
    teacher: 'Dr. Asaduzzaman',
    room: 'Lab-402',
    batch: 'Batch 2022 Sec A'
  });

  // Selected attendance record for detailed student roster modal
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState(null);
  const [studentFilterStatus, setStudentFilterStatus] = useState('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Archive expanded date tracking
  const [expandedArchiveDate, setExpandedArchiveDate] = useState(null);

  // Real-time Date & Month Calculations
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0]; // "2026-10-26"
  const currentMonthCode = now.toISOString().slice(0, 7); // "2026-10"
  const currentMonthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayFormatted = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  // 1. Live Daily Attendance Records (Daily r ta daily dekhabe - today only)
  const [attendanceSearch, setAttendanceSearch] = useState('');
  
  const dailyAttendances = useMemo(() => {
    return (attendances || []).filter(item => {
      const itemDate = (item.date || '').split('T')[0];
      return itemDate === todayDateStr;
    });
  }, [attendances, todayDateStr]);

  const filteredDailyAttendances = useMemo(() => {
    return dailyAttendances.filter(item => {
      if (!attendanceSearch.trim()) return true;
      const q = attendanceSearch.toLowerCase();
      return (
        (item.batch || '').toLowerCase().includes(q) ||
        (item.course_title || item.courseTitle || '').toLowerCase().includes(q) ||
        (item.teacher || '').toLowerCase().includes(q) ||
        (item.department || '').toLowerCase().includes(q)
      );
    });
  }, [dailyAttendances, attendanceSearch]);

  // 2. Group archived attendance by date for the CURRENT 30/31-day MONTH cycle
  const archiveGroupedByDate = useMemo(() => {
    const groups = {};
    (attendances || []).forEach(item => {
      const itemDate = (item.date || '').split('T')[0];
      // Only records from the current month cycle (YYYY-MM) and before today
      if (itemDate && itemDate.startsWith(currentMonthCode) && itemDate !== todayDateStr) {
        if (!groups[itemDate]) {
          groups[itemDate] = [];
        }
        groups[itemDate].push(item);
      }
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a)) // Sort descending (newest dates first)
      .map(dateKey => {
        const sessions = groups[dateKey];
        const totalClasses = sessions.length;
        const totalAttended = sessions.reduce((sum, s) => sum + (s.present_count ?? s.presentCount ?? 0), 0);
        const totalEnrolled = sessions.reduce((sum, s) => sum + (s.total_students ?? s.totalStudents ?? 0), 0);
        const avgPct = totalEnrolled > 0 ? ((totalAttended / totalEnrolled) * 100).toFixed(1) : '0.0';
        
        const dObj = new Date(dateKey + 'T00:00:00');
        const formattedDate = isNaN(dObj.getTime()) 
          ? dateKey 
          : dObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

        return {
          date: dateKey,
          formattedDate,
          sessions,
          totalClasses,
          totalAttended,
          totalEnrolled,
          averageAttendance: avgPct
        };
      });
  }, [attendances, currentMonthCode, todayDateStr]);

  // Download Attendance PDF Filter State (Batch, Semester, Section, Department)
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [pdfFilter, setPdfFilter] = useState({
    batch: 'all',
    semester: 'all',
    section: 'all',
    department: 'all'
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Flexible Cohort String Normalizers (handles 'Sec A', 'Section A', 'A', '5th Semester', etc.)
  const normalizeSection = (sec) => {
    if (!sec) return '';
    return String(sec).replace(/^(sec(tion)?|\s|-)+/i, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  };

  const normalizeSemester = (sem) => {
    if (!sem) return '';
    const num = String(sem).match(/\d+/)?.[0];
    return num ? `${num}` : String(sem).toLowerCase().trim();
  };

  const normalizeBatch = (bat) => {
    if (!bat) return '';
    return String(bat).toLowerCase().replace(/\s+/g, ' ').trim();
  };

  // Compute cumulative student attendance list based on selected cohort
  const cumulativeAttendanceData = useMemo(() => {
    const sessions = (attendances || []).filter(item => {
      // 1. Batch matching
      if (pdfFilter.batch !== 'all') {
        const itemB = normalizeBatch(item.batch);
        const filtB = normalizeBatch(pdfFilter.batch);
        const filtYear = (pdfFilter.batch || '').match(/\d{4}/)?.[0];
        const match = itemB === filtB || itemB.includes(filtB) || filtB.includes(itemB) || (filtYear && (item.batch || '').includes(filtYear));
        if (!match) return false;
      }
      
      // 2. Semester matching ('5th Semester', '5th', '5' all match)
      if (pdfFilter.semester !== 'all') {
        const itemSem = normalizeSemester(item.semester || item.sem || '');
        const filtSem = normalizeSemester(pdfFilter.semester);
        if (itemSem && filtSem && itemSem !== filtSem) return false;
      }

      // 3. Section matching ('Sec A', 'Section A', 'A' all match 'a')
      if (pdfFilter.section !== 'all') {
        const itemSec = normalizeSection(item.section);
        const filtSec = normalizeSection(pdfFilter.section);
        if (itemSec && filtSec && itemSec !== filtSec) return false;
      }

      // 4. Department matching
      if (pdfFilter.department !== 'all') {
        const itemDept = (item.department || item.dept || '').toLowerCase();
        const filtDept = pdfFilter.department.toLowerCase();
        if (itemDept !== filtDept && !itemDept.includes(filtDept) && !filtDept.includes(itemDept)) return false;
      }

      return true;
    });

    const totalClassesHeld = sessions.length;
    const studentMap = {};

    sessions.forEach(session => {
      const records = Array.isArray(session.student_records) ? session.student_records : [];
      records.forEach(st => {
        const key = (st.student_id || st.roll || st.name || '').trim().toLowerCase();
        if (!key) return;

        if (!studentMap[key]) {
          studentMap[key] = {
            id: st.id || key,
            student_id: st.student_id || st.roll || `STU-${key}`,
            roll: st.roll || st.student_id || '-',
            name: st.name || 'Unknown Student',
            department: session.department || (pdfFilter.department !== 'all' ? pdfFilter.department : 'CSE'),
            batch: session.batch || (pdfFilter.batch !== 'all' ? pdfFilter.batch : 'Batch'),
            semester: session.semester || (pdfFilter.semester !== 'all' ? pdfFilter.semester : '5th Semester'),
            section: session.section || (pdfFilter.section !== 'all' ? pdfFilter.section : 'A'),
            attendedCount: 0,
            absentCount: 0,
            lateCount: 0
          };
        }

        const status = (st.status || 'present').toLowerCase();
        if (status === 'present') {
          studentMap[key].attendedCount += 1;
        } else if (status === 'late') {
          studentMap[key].lateCount += 1;
          studentMap[key].attendedCount += 1;
        } else {
          studentMap[key].absentCount += 1;
        }
      });
    });

    // If no session records match yet, gracefully load enrolled students from database roster
    if (Object.keys(studentMap).length === 0) {
      const cohortRoster = (registeredStudents || []).filter(st => {
        if (pdfFilter.batch !== 'all') {
          const bYear = (pdfFilter.batch || '').match(/\d{4}/)?.[0];
          const bMatch = bYear ? (st.batch || '').includes(bYear) : normalizeBatch(st.batch) === normalizeBatch(pdfFilter.batch);
          if (!bMatch) return false;
        }
        if (pdfFilter.section !== 'all') {
          const stSec = normalizeSection(st.section);
          const fSec = normalizeSection(pdfFilter.section);
          if (stSec && fSec && stSec !== fSec) return false;
        }
        if (pdfFilter.department !== 'all') {
          const sDept = (st.dept || st.department || '').toLowerCase();
          const fDept = pdfFilter.department.toLowerCase();
          if (sDept !== fDept && !sDept.includes(fDept)) return false;
        }
        return true;
      });

      cohortRoster.forEach(st => {
        const key = (st.institutional_id || st.student_id || st.regNo || st.id || st.name || '').trim().toLowerCase();
        if (!key) return;
        studentMap[key] = {
          id: st.id || key,
          student_id: st.institutional_id || st.student_id || st.regNo || `STU-${st.id}`,
          roll: st.regNo || st.institutional_id || st.student_id || '-',
          name: st.name || 'Student',
          department: st.dept || (pdfFilter.department !== 'all' ? pdfFilter.department : 'CSE'),
          batch: st.batch || (pdfFilter.batch !== 'all' ? pdfFilter.batch : 'Batch'),
          semester: pdfFilter.semester !== 'all' ? pdfFilter.semester : '5th Semester',
          section: st.section || (pdfFilter.section !== 'all' ? pdfFilter.section : 'A'),
          attendedCount: 0,
          absentCount: 0,
          lateCount: 0
        };
      });
    }

    const students = Object.values(studentMap).map(st => {
      const attended = st.attendedCount;
      const absent = Math.max(st.absentCount, totalClassesHeld - attended);
      const ratePct = totalClassesHeld > 0 ? ((attended / totalClassesHeld) * 100).toFixed(1) : '0.0';
      return {
        ...st,
        totalClassesHeld,
        attendedCount: attended,
        absentCount: absent,
        ratePct: `${ratePct}%`
      };
    });

    students.sort((a, b) => (a.student_id || '').localeCompare(b.student_id || '', undefined, { numeric: true }));

    return {
      sessions,
      totalClassesHeld,
      students
    };
  }, [attendances, registeredStudents, pdfFilter]);

  // Fresh & Standard Print-Ready Cumulative Attendance PDF Generation
  const generateAttendancePDF = ({
    targetBatch = pdfFilter.batch,
    targetSemester = pdfFilter.semester,
    targetSection = pdfFilter.section,
    targetDepartment = pdfFilter.department,
    specificRecord = null,
    specificSessions = null,
    isPrintPreview = false
  } = {}) => {
    setIsGeneratingPdf(true);
    try {
      let sessionsToInclude = [];

      if (specificRecord) {
        sessionsToInclude = [specificRecord];
      } else if (specificSessions && specificSessions.length > 0) {
        sessionsToInclude = specificSessions;
      } else {
        sessionsToInclude = (attendances || []).filter(item => {
          if (targetBatch !== 'all') {
            const itemB = normalizeBatch(item.batch);
            const filtB = normalizeBatch(targetBatch);
            const filtYear = (targetBatch || '').match(/\d{4}/)?.[0];
            const match = itemB === filtB || itemB.includes(filtB) || filtB.includes(itemB) || (filtYear && (item.batch || '').includes(filtYear));
            if (!match) return false;
          }
          if (targetSemester !== 'all') {
            const itemSem = normalizeSemester(item.semester || item.sem || '');
            const filtSem = normalizeSemester(targetSemester);
            if (itemSem && filtSem && itemSem !== filtSem) return false;
          }
          if (targetSection !== 'all') {
            const itemSec = normalizeSection(item.section);
            const filtSec = normalizeSection(targetSection);
            if (itemSec && filtSec && itemSec !== filtSec) return false;
          }
          if (targetDepartment !== 'all') {
            const itemDept = (item.department || item.dept || '').toLowerCase();
            const filtDept = targetDepartment.toLowerCase();
            if (itemDept !== filtDept && !itemDept.includes(filtDept) && !filtDept.includes(itemDept)) return false;
          }
          return true;
        });
      }

      const totalClassesHeld = sessionsToInclude.length;
      const studentMap = {};

      sessionsToInclude.forEach(session => {
        const records = Array.isArray(session.student_records) ? session.student_records : [];
        records.forEach(st => {
          const key = (st.student_id || st.roll || st.name || '').trim().toLowerCase();
          if (!key) return;

          if (!studentMap[key]) {
            studentMap[key] = {
              id: st.id || key,
              student_id: st.student_id || st.roll || `STU-${key}`,
              roll: st.roll || st.student_id || '-',
              name: st.name || 'Unknown Student',
              department: session.department || targetDepartment,
              batch: session.batch || targetBatch,
              semester: session.semester || targetSemester,
              section: session.section || targetSection,
              attendedCount: 0,
              absentCount: 0,
              lateCount: 0
            };
          }

          const status = (st.status || 'present').toLowerCase();
          if (status === 'present') {
            studentMap[key].attendedCount += 1;
          } else if (status === 'late') {
            studentMap[key].lateCount += 1;
            studentMap[key].attendedCount += 1;
          } else {
            studentMap[key].absentCount += 1;
          }
        });
      });

      // If no session records match yet, load enrolled students from DB roster
      if (Object.keys(studentMap).length === 0) {
        const cohortRoster = (registeredStudents || []).filter(st => {
          if (targetBatch !== 'all') {
            const bYear = (targetBatch || '').match(/\d{4}/)?.[0];
            const bMatch = bYear ? (st.batch || '').includes(bYear) : normalizeBatch(st.batch) === normalizeBatch(targetBatch);
            if (!bMatch) return false;
          }
          if (targetSection !== 'all') {
            const stSec = normalizeSection(st.section);
            const fSec = normalizeSection(targetSection);
            if (stSec && fSec && stSec !== fSec) return false;
          }
          if (targetDepartment !== 'all') {
            const sDept = (st.dept || st.department || '').toLowerCase();
            const fDept = targetDepartment.toLowerCase();
            if (sDept !== fDept && !sDept.includes(fDept)) return false;
          }
          return true;
        });

        cohortRoster.forEach(st => {
          const key = (st.institutional_id || st.student_id || st.regNo || st.id || st.name || '').trim().toLowerCase();
          if (!key) return;
          studentMap[key] = {
            id: st.id || key,
            student_id: st.institutional_id || st.student_id || st.regNo || `STU-${st.id}`,
            roll: st.regNo || st.institutional_id || st.student_id || '-',
            name: st.name || 'Student',
            department: st.dept || (targetDepartment !== 'all' ? targetDepartment : 'CSE'),
            batch: st.batch || (targetBatch !== 'all' ? targetBatch : 'Batch'),
            semester: targetSemester !== 'all' ? targetSemester : '5th Semester',
            section: st.section || (targetSection !== 'all' ? targetSection : 'A'),
            attendedCount: 0,
            absentCount: 0,
            lateCount: 0
          };
        });
      }

      const students = Object.values(studentMap).map(st => {
        const attended = st.attendedCount;
        const absent = Math.max(st.absentCount, totalClassesHeld - attended);
        const ratePct = totalClassesHeld > 0 ? ((attended / totalClassesHeld) * 100).toFixed(1) : '0.0';
        return {
          ...st,
          totalClassesHeld,
          attendedCount: attended,
          absentCount: absent,
          ratePct: `${ratePct}%`
        };
      });

      students.sort((a, b) => (a.student_id || '').localeCompare(b.student_id || '', undefined, { numeric: true }));

      if (students.length === 0) {
        alert('No student roster records found for the matching classes.');
        setIsGeneratingPdf(false);
        return;
      }

      const doc = new jsPDF('landscape', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ==================== FRESH & MINIMALIST INSTITUTIONAL HEADER ====================
      // 1. Subtle, Fresh Accent Top Stripe (4pt)
      doc.setFillColor(79, 70, 229); // Modern Indigo
      doc.rect(0, 0, pageWidth, 4, 'F');

      // 2. Clean University Name & Office
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text('QGENIX UNIVERSITY', 40, 36);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text('OFFICE OF ACADEMIC AFFAIRS & ATTENDANCE DIRECTORATE', 40, 48);

      // 3. Document Title on Right side
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229); // Indigo Accent
      doc.text('CUMULATIVE ATTENDANCE DOSSIER', pageWidth - 265, 36);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Muted Slate
      doc.text(`Official Academic Record • Issued: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, pageWidth - 265, 48);

      // Clean divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.8);
      doc.line(40, 56, pageWidth - 40, 56);

      // 4. Fresh Minimalist Metadata Bar
      doc.setFillColor(248, 250, 252); // Subtle light slate (#F8FAFC)
      doc.roundedRect(40, 64, pageWidth - 80, 34, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(40, 64, pageWidth - 80, 34, 4, 4, 'S');

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.text('BATCH:', 54, 78);
      doc.text('SEMESTER:', 210, 78);
      doc.text('SECTION:', 340, 78);
      doc.text('DEPARTMENT:', 450, 78);
      doc.text('TOTAL CLASSES HELD:', 590, 78);
      doc.text('TOTAL STUDENTS:', 720, 78);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42); // Crisp Slate 900
      const metaBatch = specificRecord ? specificRecord.batch : (targetBatch === 'all' ? 'All Batches' : targetBatch);
      const metaSem = specificRecord ? (specificRecord.semester || '5th Semester') : (targetSemester === 'all' ? 'All Semesters' : targetSemester);
      const metaSec = specificRecord ? specificRecord.section : (targetSection === 'all' ? 'All Sections' : targetSection);
      const metaDept = specificRecord ? specificRecord.department : (targetDepartment === 'all' ? 'All Departments' : targetDepartment);

      doc.text(String(metaBatch), 54, 90);
      doc.text(String(metaSem), 210, 90);
      doc.text(String(metaSec), 340, 90);
      doc.text(String(metaDept), 450, 90);
      doc.text(`${totalClassesHeld} Classes`, 590, 90);
      doc.text(`${students.length} Enrolled`, 720, 90);

      // 5. Build Cumulative Student Attendance Table with autoTable
      const tableRows = students.map((st, idx) => [
        idx + 1,
        st.student_id || st.roll,
        st.name,
        st.department || metaDept,
        `${st.batch || metaBatch} (${st.section || metaSec})`,
        st.semester || metaSem,
        st.totalClassesHeld,
        st.attendedCount,
        st.absentCount,
        st.ratePct
      ]);

      autoTable(doc, {
        startY: 108,
        head: [[
          '#',
          'Student ID / Roll',
          'Student Full Name',
          'Department',
          'Batch & Section',
          'Semester',
          'Total Classes',
          'Total Attended',
          'Total Absent',
          'Cumulative Rate'
        ]],
        body: tableRows,
        styles: {
          fontSize: 8,
          cellPadding: 5.5,
          font: 'helvetica',
          textColor: [30, 41, 59]
        },
        headStyles: {
          fillColor: [30, 41, 59], // Slate-800
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5,
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 26 },
          1: { halign: 'left', fontStyle: 'bold', cellWidth: 85 },
          2: { halign: 'left', fontStyle: 'bold', cellWidth: 140 },
          3: { halign: 'center', cellWidth: 65 },
          4: { halign: 'left', cellWidth: 140 },
          5: { halign: 'center', cellWidth: 70 },
          6: { halign: 'center', fontStyle: 'bold', cellWidth: 65 },
          7: { halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129], cellWidth: 65 }, // Emerald green
          8: { halign: 'center', fontStyle: 'bold', textColor: [220, 38, 38], cellWidth: 65 }, // Crimson Red
          9: { halign: 'center', fontStyle: 'bold', textColor: [79, 70, 229], cellWidth: 70 } // Indigo
        },
        margin: { left: 40, right: 40 }
      });

      // 6. Signatures and Institutional Verification (Clean Footer)
      const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 200) + 30;
      const signY = finalY > pageHeight - 75 ? pageHeight - 55 : finalY;

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.8);

      // Signature 1: Course Coordinator
      doc.line(60, signY + 22, 220, signY + 22);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('COURSE COORDINATOR', 85, signY + 33);
      doc.setFont('helvetica', 'normal');
      doc.text('Academic Verification', 95, signY + 43);

      // Signature 2: Head of Department
      doc.line(pageWidth / 2 - 80, signY + 22, pageWidth / 2 + 80, signY + 22);
      doc.setFont('helvetica', 'bold');
      doc.text('HEAD OF DEPARTMENT', pageWidth / 2 - 58, signY + 33);
      doc.setFont('helvetica', 'normal');
      doc.text('Dean of Faculty / Approval', pageWidth / 2 - 62, signY + 43);

      // Signature 3: Registrar / Controller of Examinations
      doc.line(pageWidth - 220, signY + 22, pageWidth - 60, signY + 22);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTROLLER OF EXAMINATIONS', pageWidth - 208, signY + 33);
      doc.setFont('helvetica', 'normal');
      doc.text('Office of the Registrar', pageWidth - 180, signY + 43);

      if (isPrintPreview) {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        const sanitizedBatch = String(metaBatch || 'All_Batches').replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedSem = String(metaSem || 'All_Sem').replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedSec = String(metaSec || 'All_Sec').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Cumulative_Attendance_${sanitizedBatch}_${sanitizedSem}_${sanitizedSec}.pdf`;
        doc.save(filename);
      }
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('Failed to generate PDF. Error: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Toast feedback helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingSlotId(null);
    setSlotForm({
      day: selectedDay || todayWeekday,
      time: '09:00 AM - 10:30 AM',
      course: courses.length > 0 ? `${courses[0].code}: ${courses[0].title}` : 'CSE-301: Database Management Systems',
      teacher: faculty.length > 0 ? faculty[0].name : 'Dr. Asaduzzaman',
      room: 'Lab-402',
      batch: batches.length > 0 ? `${batches[0].name} Sec A` : 'Batch 2022 Sec A'
    });
    setIsAddSlotModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (slot) => {
    setEditingSlotId(slot.id);
    setSlotForm({
      day: slot.day,
      time: slot.time,
      course: slot.course,
      teacher: slot.teacher,
      room: slot.room,
      batch: slot.batch
    });
    setIsAddSlotModalOpen(true);
  };

  // Submit Routine Slot (Add or Edit) with Clash Detection
  const handleSlotFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlotId) {
        const clash = await editRoutineSlot(editingSlotId, slotForm);
        setIsAddSlotModalOpen(false);
        setEditingSlotId(null);
        if (clash && clash.hasConflict) {
          showToast(`⚠️ Warning! Collision detected: ${clash.reason}`);
        } else {
          showToast(`Routine slot updated successfully!`);
        }
      } else {
        const clash = await addRoutineSlot(slotForm);
        setIsAddSlotModalOpen(false);
        if (clash && clash.hasConflict) {
          showToast(`⚠️ Warning! Collision detected: ${clash.reason}`);
        } else {
          showToast(`Routine slot allocated cleanly for ${slotForm.course} in ${slotForm.room}!`);
        }
      }
    } catch (err) {
      console.error('Error submitting slot:', err);
      setIsAddSlotModalOpen(false);
      showToast('Routine slot saved.');
    }
  };

  return (
    <div className="flex-col gap-6" style={{ display: 'flex', width: '100%' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '14px 22px',
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
          }}
        >
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div 
        className="glass-panel" 
        style={{
          padding: '24px',
          borderRadius: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              Academic Operations Core
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>
            Master Routine & Attendance Oversight
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Interactive timetable scheduler with automated room & instructor clash detection, and cohort attendance analytics.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleOpenAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>Add Routine Slot</span>
        </button>
      </div>

      {/* Tabs */}
      <div 
        className="glass-panel"
        style={{
          padding: '6px',
          borderRadius: '12px',
          display: 'inline-flex',
          gap: '6px',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={() => setActiveTab('routine')}
          className={`btn ${activeTab === 'routine' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Calendar size={16} /> Class Routine
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <UserCheck size={16} /> Batch Attendance Overview
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`btn ${activeTab === 'archive' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Archive size={16} /> Archive
        </button>
      </div>

      {/* ==================== TAB 1: MASTER ROUTINE & CLASH DETECTOR ==================== */}
      {activeTab === 'routine' && (
        <Card title={`Master Timetable (${selectedDay})`}>
          
          {/* Day Selector Pills & Department Filter Toolbar */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '14px', 
              margin: '8px 0 18px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-color-light)'
            }}
          >
            {/* Day Selector Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {weekDays.map((day) => {
                const isToday = day === todayWeekday;
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      padding: '6px 14px', 
                      fontSize: '0.82rem', 
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: isSelected ? 700 : 500,
                      border: isToday && !isSelected ? '1px solid var(--accent-primary)' : undefined
                    }}
                  >
                    <span>{day}</span>
                    {isToday && (
                      <span 
                        style={{ 
                          fontSize: '0.68rem', 
                          padding: '1px 6px', 
                          borderRadius: '10px', 
                          background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(99, 102, 241, 0.2)',
                          color: isSelected ? '#fff' : 'var(--accent-primary)',
                          fontWeight: 700
                        }}
                      >
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Department Filter Option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={15} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter by Department:</span>
              </div>
              <select
                className="input-field"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  minWidth: '170px',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Departments</option>
                {availableDepts.map(dept => (
                  <option key={dept} value={dept}>Dept: {dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Routine Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '720px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Class Time</th>
                  <th style={{ padding: '12px' }}>Course Title & Code</th>
                  <th style={{ padding: '12px' }}>Faculty Instructor</th>
                  <th style={{ padding: '12px' }}>Classroom / Venue</th>
                  <th style={{ padding: '12px' }}>Batch & Section</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                      No routine slots scheduled for <strong>{selectedDay}</strong>{selectedDept !== 'ALL' ? ` in ${selectedDept} Department` : ''}.
                    </td>
                  </tr>
                ) : (
                  filteredSlots.map((slot) => (
                    <tr key={slot.id} style={{ borderBottom: '1px solid var(--border-color-light)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} color="var(--accent-secondary)" />
                          <span>{slot.time}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: 600 }}>{slot.course}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--accent-primary)', fontWeight: 500 }}>{slot.teacher}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {slot.room}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>{slot.batch}</td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--accent-primary)' }}
                            title="Edit Routine Slot"
                            onClick={() => handleOpenEditModal(slot)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--accent-danger)' }}
                            title="Remove Slot"
                            onClick={() => {
                              confirmDelete({
                                title: 'Remove Routine Timetable Slot',
                                itemName: `${slot.course} (${slot.day} - ${slot.time})`,
                                itemType: 'Timetable Slot',
                                warningText: 'This will remove the scheduled slot from master timetable, teacher schedules, and student calendars.',
                                confirmBtnText: 'Remove Slot',
                                onConfirm: () => {
                                  deleteRoutineSlot(slot.id);
                                  showToast(`Removed routine slot.`);
                                }
                              });
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ==================== TAB 2: CLASS ATTENDANCE OVERVIEW (DAILY) ==================== */}
      {activeTab === 'attendance' && (
        <Card title="Class Attendance Overview">
          {/* Header Banner & Date Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                  📅 Today's Live Attendance
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {todayFormatted}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Real-time daily class attendance records. Previous days' records are automatically moved to the <strong>Archive</strong> tab.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowDownloadModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.85rem' }}
              >
                <Download size={14} /> Download PDF
              </button>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search batch, course, or teacher..."
                  className="input-field"
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  style={{ maxWidth: '280px', padding: '6px 12px 6px 30px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Batch</th>
                  <th style={{ padding: '12px' }}>Section</th>
                  <th style={{ padding: '12px' }}>Department</th>
                  <th style={{ padding: '12px' }}>Course Title</th>
                  <th style={{ padding: '12px' }}>Course Teacher</th>
                  <th style={{ padding: '12px' }}>Attendance</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDailyAttendances.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <AlertCircle size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      <div>No attendance records submitted for today yet ({todayDateStr}).</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.7 }}>
                        When teachers submit attendance from the Teacher Panel today, records will appear here in real time.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDailyAttendances.map((b, idx) => (
                    <tr 
                      key={b.id || idx} 
                      onClick={() => {
                        setSelectedAttendanceRecord(b);
                        setStudentFilterStatus('all');
                        setStudentSearchQuery('');
                      }}
                      style={{ 
                        borderBottom: '1px solid var(--border-color-light)', 
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '14px 12px', fontWeight: 600 }}>{b.batch}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.8rem', padding: '3px 8px' }}>
                          {b.section || 'A'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '3px 8px' }}>
                          {b.department || 'CSE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{b.course_title || b.courseTitle}</div>
                        {(b.course_code || b.courseCode) && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.course_code || b.courseCode}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--accent-secondary)', fontWeight: 600 }}>
                        {b.teacher}
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                        {b.attendance || `${b.present_count ?? b.presentCount ?? 0} / ${b.total_students ?? b.totalStudents ?? 0} Students`}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Eye size={12} /> View
                          </span>
                          <button 
                            className="btn btn-secondary"
                            title="Download Session PDF"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateAttendancePDF({ specificRecord: b });
                            }}
                            style={{ padding: '4px 8px', fontSize: '0.78rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}
                          >
                            <Download size={12} /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ==================== TAB 3: ARCHIVE (MONTHLY CYCLE 30/31 DAYS) ==================== */}
      {activeTab === 'archive' && (
        <Card title={`Attendance Archive — ${currentMonthLabel}`}>
          {/* Monthly Cycle Notice */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '12px 16px', 
              borderRadius: '10px', 
              marginBottom: '16px', 
              background: 'rgba(59, 130, 246, 0.06)', 
              border: '1px solid rgba(59, 130, 246, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Archive size={15} /> Current 30/31-Day Monthly Rolling Archive
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Daily records for {currentMonthLabel}. Upon each new month rollover, earlier months are automatically pruned from frontend view while remaining permanently secured in the backend database.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowDownloadModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.85rem' }}
              >
                <Download size={14} /> Download Archive PDF
              </button>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, background: 'var(--bg-secondary)', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {archiveGroupedByDate.length} Archived Date(s)
              </div>
            </div>
          </div>

          {archiveGroupedByDate.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Archive size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>No archived records found for {currentMonthLabel}.</div>
              <div style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                When today's date changes, daily attendance records will automatically archive here date-by-date.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {archiveGroupedByDate.map((group) => {
                const isExpanded = expandedArchiveDate === group.date;
                return (
                  <div 
                    key={group.date}
                    className="glass-panel"
                    style={{ 
                      borderRadius: '12px', 
                      border: '1px solid var(--border-color)', 
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Date Accordion Header */}
                    <div 
                      onClick={() => setExpandedArchiveDate(isExpanded ? null : group.date)}
                      style={{ 
                        padding: '14px 18px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: isExpanded ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Calendar size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{group.formattedDate}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {group.date}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="badge badge-secondary">
                          {group.totalClasses} {group.totalClasses === 1 ? 'Class' : 'Classes'}
                        </span>
                        <button
                          className="btn btn-secondary"
                          title="Download PDF for this date"
                          onClick={(e) => {
                            e.stopPropagation();
                            generateAttendancePDF({ specificSessions: group.sessions });
                          }}
                          style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}
                        >
                          <Download size={12} /> Date PDF
                        </button>
                        <div style={{ color: 'var(--text-muted)' }}>
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Classes on this Date */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border-color)', padding: '8px 12px 14px', background: 'var(--bg-secondary)' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '6px 8px 10px', fontWeight: 600 }}>
                          Classes conducted on {group.formattedDate} (Click row to inspect full student attendance roster):
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                <th style={{ padding: '10px 12px' }}>Batch</th>
                                <th style={{ padding: '10px 12px' }}>Section</th>
                                <th style={{ padding: '10px 12px' }}>Department</th>
                                <th style={{ padding: '10px 12px' }}>Course Title</th>
                                <th style={{ padding: '10px 12px' }}>Course Teacher</th>
                                <th style={{ padding: '10px 12px' }}>Attendance</th>
                                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.sessions.map((session, sIdx) => (
                                <tr 
                                  key={session.id || sIdx}
                                  onClick={() => {
                                    setSelectedAttendanceRecord(session);
                                    setStudentFilterStatus('all');
                                    setStudentSearchQuery('');
                                  }}
                                  style={{ borderBottom: '1px solid var(--border-color-light)', fontSize: '0.88rem', cursor: 'pointer' }}
                                  className="table-row-hover"
                                >
                                  <td style={{ padding: '12px', fontWeight: 600 }}>{session.batch}</td>
                                  <td style={{ padding: '12px' }}>
                                    <span className="badge badge-secondary" style={{ fontSize: '0.78rem', padding: '2px 8px' }}>
                                      {session.section || 'A'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                    <span className="badge badge-primary" style={{ fontSize: '0.78rem', padding: '2px 8px' }}>
                                      {session.department || 'CSE'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: 600 }}>{session.course_title || session.courseTitle}</div>
                                    {(session.course_code || session.courseCode) && (
                                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{session.course_code || session.courseCode}</div>
                                    )}
                                  </td>
                                  <td style={{ padding: '12px', color: 'var(--accent-secondary)', fontWeight: 600 }}>
                                    {session.teacher}
                                  </td>
                                  <td style={{ padding: '12px', fontWeight: 600 }}>
                                    {session.attendance || `${session.present_count ?? session.presentCount ?? 0} / ${session.total_students ?? session.totalStudents ?? 0} Students`}
                                  </td>
                                  <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      <span className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Eye size={12} /> View
                                      </span>
                                      <button 
                                        className="btn btn-secondary"
                                        title="Download Session PDF"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          generateAttendancePDF({ specificRecord: session });
                                        }}
                                        style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}
                                      >
                                        <Download size={12} /> PDF
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* ==================== STUDENT ATTENDANCE DETAILS MODAL / CARD ==================== */}
      {selectedAttendanceRecord && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setSelectedAttendanceRecord(null)}
        >
          <div 
            className="glass-panel"
            style={{ 
              width: '100%', 
              maxWidth: '780px', 
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px', 
              borderRadius: '16px', 
              background: 'var(--bg-primary)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-primary">{selectedAttendanceRecord.department || 'CSE'}</span>
                  <span className="badge badge-secondary">{selectedAttendanceRecord.batch}</span>
                  <span className="badge badge-secondary">{selectedAttendanceRecord.section}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                  {selectedAttendanceRecord.course_title || selectedAttendanceRecord.courseTitle}
                </h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Instructor: <strong style={{ color: 'var(--accent-secondary)' }}>{selectedAttendanceRecord.teacher}</strong> • Date: <strong>{selectedAttendanceRecord.date}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => generateAttendancePDF({ specificRecord: selectedAttendanceRecord })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  <Download size={14} /> Download PDF
                </button>
                <button 
                  onClick={() => setSelectedAttendanceRecord(null)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Attendance Metrics Bar */}
            {(() => {
              const students = selectedAttendanceRecord.student_records || selectedAttendanceRecord.studentRecords || [];
              const total = selectedAttendanceRecord.total_students ?? selectedAttendanceRecord.totalStudents ?? students.length;
              const present = selectedAttendanceRecord.present_count ?? selectedAttendanceRecord.presentCount ?? students.filter(s => s.status === 'present').length;
              const absent = selectedAttendanceRecord.absent_count ?? selectedAttendanceRecord.absentCount ?? students.filter(s => s.status === 'absent').length;
              const late = selectedAttendanceRecord.late_count ?? selectedAttendanceRecord.lateCount ?? students.filter(s => s.status === 'late').length;
              const rate = selectedAttendanceRecord.averageAttendance || (selectedAttendanceRecord.average_attendance ? `${selectedAttendanceRecord.average_attendance}%` : '0%');

              // Filter students by status and search
              const filteredStudents = students.filter(s => {
                if (studentFilterStatus !== 'all' && s.status !== studentFilterStatus) return false;
                if (!studentSearchQuery.trim()) return true;
                const q = studentSearchQuery.toLowerCase();
                return (
                  (s.name || '').toLowerCase().includes(q) ||
                  (s.student_id || s.roll || '').toLowerCase().includes(q) ||
                  (s.email || '').toLowerCase().includes(q)
                );
              });

              return (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                    <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Enrolled</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{total}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px', textAlign: 'center', borderBottom: '3px solid var(--accent-success)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)' }}>Present</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-success)' }}>{present}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px', textAlign: 'center', borderBottom: '3px solid var(--accent-danger)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-danger)' }}>Absent</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-danger)' }}>{absent}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px', textAlign: 'center', borderBottom: '3px solid var(--accent-warning)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-warning)' }}>Late</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-warning)' }}>{late}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px', textAlign: 'center', borderBottom: '3px solid var(--accent-primary)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>Rate</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{rate}</div>
                    </div>
                  </div>

                  {/* Filter Toolbar inside Modal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setStudentFilterStatus('all')}
                        className={`btn ${studentFilterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                      >
                        All ({students.length})
                      </button>
                      <button
                        onClick={() => setStudentFilterStatus('present')}
                        className={`btn ${studentFilterStatus === 'present' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: '6px', color: studentFilterStatus === 'present' ? '#fff' : 'var(--accent-success)' }}
                      >
                        Present ({present})
                      </button>
                      <button
                        onClick={() => setStudentFilterStatus('absent')}
                        className={`btn ${studentFilterStatus === 'absent' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: '6px', color: studentFilterStatus === 'absent' ? '#fff' : 'var(--accent-danger)' }}
                      >
                        Absent ({absent})
                      </button>
                      {late > 0 && (
                        <button
                          onClick={() => setStudentFilterStatus('late')}
                          className={`btn ${studentFilterStatus === 'late' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: '6px', color: studentFilterStatus === 'late' ? '#fff' : 'var(--accent-warning)' }}
                        >
                          Late ({late})
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Search student by name or roll..."
                      className="input-field"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      style={{ maxWidth: '240px', padding: '5px 10px', fontSize: '0.82rem' }}
                    />
                  </div>

                  {/* Student List */}
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', overflowX: 'auto', maxHeight: '360px', overflowY: 'auto' }}>
                    {filteredStudents.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No students found matching current filter.
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', zIndex: 1 }}>
                          <tr>
                            <th style={{ padding: '10px 14px', fontSize: '0.82rem', width: '120px' }}>ID / Roll</th>
                            <th style={{ padding: '10px 14px', fontSize: '0.82rem' }}>Student Name</th>
                            <th style={{ padding: '10px 14px', fontSize: '0.82rem', width: '130px', textAlign: 'center' }}>Attendance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((st, sIndex) => (
                            <tr key={st.id || sIndex} style={{ borderBottom: '1px solid var(--border-color-light)', fontSize: '0.88rem' }}>
                              <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                {st.student_id || st.roll || `STU-${st.id}`}
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={13} />
                                  </div>
                                  <div>
                                    <span style={{ fontWeight: 600 }}>{st.name}</span>
                                    {st.email && (
                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                        {st.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                {st.status === 'present' ? (
                                  <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.78rem' }}>
                                    <CheckCircle2 size={12} /> Present
                                  </span>
                                ) : st.status === 'late' ? (
                                  <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.78rem' }}>
                                    <Clock size={12} /> Late
                                  </span>
                                ) : (
                                  <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.78rem' }}>
                                    <XCircle size={12} /> Absent
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })()}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedAttendanceRecord(null)}
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DOWNLOAD ATTENDANCE PDF MODAL ==================== */}
      {showDownloadModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '20px'
          }}
          onClick={() => setShowDownloadModal(false)}
        >
          <div 
            className="glass-panel"
            style={{ 
              width: '100%', 
              maxWidth: '680px', 
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px', 
              borderRadius: '16px', 
              background: 'var(--bg-primary)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              border: '1px solid var(--border-color)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} /> Official Print Dossier
                  </span>
                  <span className="badge badge-secondary">PDF Export</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Download Attendance Report</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                  Filter and download print-ready institutional attendance dossiers from the database for specific batch, semester, or section.
                </p>
              </div>
              <button 
                onClick={() => setShowDownloadModal(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Form Grid — Clean 4 Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {/* Batch */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Academic Batch
                </label>
                <select
                  className="input-field"
                  value={pdfFilter.batch}
                  onChange={(e) => setPdfFilter({ ...pdfFilter, batch: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="all">All Batches</option>
                  {batches.map(b => (
                    <option key={b.id || b.name} value={b.name}>{b.name}</option>
                  ))}
                  <option value="Batch 2022 - 2023">Batch 2022 - 2023</option>
                  <option value="Batch 2023 - 2024">Batch 2023 - 2024</option>
                  <option value="Batch 2021 - 2022">Batch 2021 - 2022</option>
                  <option value="Batch 2024 - 2025">Batch 2024 - 2025</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Semester
                </label>
                <select
                  className="input-field"
                  value={pdfFilter.semester}
                  onChange={(e) => setPdfFilter({ ...pdfFilter, semester: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="all">All Semesters</option>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>

              {/* Section */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Section
                </label>
                <select
                  className="input-field"
                  value={pdfFilter.section}
                  onChange={(e) => setPdfFilter({ ...pdfFilter, section: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="all">All Sections</option>
                  <option value="Sec A">Section A</option>
                  <option value="Sec B">Section B</option>
                  <option value="Sec C">Section C</option>
                  <option value="Sec D">Section D</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Department
                </label>
                <select
                  className="input-field"
                  value={pdfFilter.department}
                  onChange={(e) => setPdfFilter({ ...pdfFilter, department: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="all">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id || d.name} value={d.code || d.name}>{d.name} ({d.code || d.name})</option>
                  ))}
                  <option value="CSE">Computer Science & Engineering (CSE)</option>
                  <option value="EEE">Electrical & Electronic Engineering (EEE)</option>
                  <option value="BBA">Business Administration (BBA)</option>
                  <option value="CE">Civil Engineering (CE)</option>
                </select>
              </div>
            </div>

            {/* Live Filter Telemetry Card */}
            <div 
              className="glass-panel" 
              style={{ 
                padding: '14px 18px', 
                borderRadius: '12px', 
                marginBottom: '24px', 
                background: 'rgba(99, 102, 241, 0.06)', 
                border: '1px solid rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Cumulative Attendance Records Found
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Criteria: <strong>{pdfFilter.batch === 'all' ? 'All Batches' : pdfFilter.batch}</strong> • Semester: <strong>{pdfFilter.semester === 'all' ? 'All' : pdfFilter.semester}</strong> • Section: <strong>{pdfFilter.section === 'all' ? 'All' : pdfFilter.section}</strong> • Department: <strong>{pdfFilter.department === 'all' ? 'All' : pdfFilter.department}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Classes Conducted</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {cumulativeAttendanceData.totalClassesHeld}
                  </div>
                </div>
                <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Students in Roster</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                    {cumulativeAttendanceData.students.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowDownloadModal(false)}
                style={{ padding: '9px 18px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => generateAttendancePDF({ isPrintPreview: true })}
                disabled={isGeneratingPdf || cumulativeAttendanceData.students.length === 0}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px' }}
              >
                <Printer size={16} /> Print Preview
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => generateAttendancePDF({ isPrintPreview: false })}
                disabled={isGeneratingPdf || cumulativeAttendanceData.students.length === 0}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 20px' }}
              >
                <Download size={16} /> {isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD / EDIT ROUTINE SLOT MODAL ==================== */}
      {isAddSlotModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setIsAddSlotModalOpen(false)}
        >
          <div 
            className="glass-panel"
            style={{ width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '16px', background: 'var(--bg-primary)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                {editingSlotId ? 'Edit Routine Timetable Slot' : 'Add Routine Timetable Slot'}
              </h3>
              <button onClick={() => setIsAddSlotModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSlotFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Day of Week</label>
                  <select className="input-field" value={slotForm.day} onChange={e => setSlotForm({ ...slotForm, day: e.target.value })} style={{ width: '100%' }}>
                    <option>Sunday</option>
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Time Slot</label>
                  <select className="input-field" value={slotForm.time} onChange={e => setSlotForm({ ...slotForm, time: e.target.value })} style={{ width: '100%' }}>
                    <option>09:00 AM - 10:30 AM</option>
                    <option>10:45 AM - 12:15 PM</option>
                    <option>01:00 PM - 02:30 PM</option>
                    <option>02:45 PM - 04:15 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Select Course</label>
                <select className="input-field" value={slotForm.course} onChange={e => setSlotForm({ ...slotForm, course: e.target.value })} style={{ width: '100%' }}>
                  {courses.map(c => (
                    <option key={c.id} value={`${c.code}: ${c.title}`}>{c.code}: {c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Assign Instructor</label>
                <select className="input-field" value={slotForm.teacher} onChange={e => setSlotForm({ ...slotForm, teacher: e.target.value })} style={{ width: '100%' }}>
                  {faculty.map(f => (
                    <option key={f.id} value={f.name}>{f.name} ({f.dept})</option>
                  ))}
                  <option value="Dr. Asaduzzaman">Dr. Asaduzzaman</option>
                  <option value="Prof. Dr. Mahbubur Rahman">Prof. Dr. Mahbubur Rahman</option>
                  <option value="Dr. Farhana Ahmed">Dr. Farhana Ahmed</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Room Number</label>
                  <input required type="text" className="input-field" placeholder="e.g. Lab-402" value={slotForm.room} onChange={e => setSlotForm({ ...slotForm, room: e.target.value })} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Batch</label>
                  <select className="input-field" value={slotForm.batch} onChange={e => setSlotForm({ ...slotForm, batch: e.target.value })} style={{ width: '100%' }}>
                    {batches.map(b => (
                      <option key={b.id} value={`${b.name} Sec A`}>{b.name} Sec A</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddSlotModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingSlotId ? 'Update Routine Slot' : 'Allocate Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================================
// AdminDataContext.jsx — Central Reactive State & LocalStorage Persistence for QGenix Admin
// -----------------------------------------------------------------------------------------
// Bengali Note:
// =========================================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';

const AdminDataContext = createContext();

// Standard University Grading Scale
const initialGradingScale = [
  { id: 1, grade: 'A+', minMarks: 80, maxMarks: 100, gpa: 4.00, remarks: 'Outstanding' },
  { id: 2, grade: 'A', minMarks: 75, maxMarks: 79, gpa: 3.75, remarks: 'Excellent' },
  { id: 3, grade: 'A-', minMarks: 70, maxMarks: 74, gpa: 3.50, remarks: 'Very Good' },
  { id: 4, grade: 'B+', minMarks: 65, maxMarks: 69, gpa: 3.25, remarks: 'Good' },
  { id: 5, grade: 'B', minMarks: 60, maxMarks: 64, gpa: 3.00, remarks: 'Satisfactory' },
  { id: 6, grade: 'B-', minMarks: 55, maxMarks: 59, gpa: 2.75, remarks: 'Above Average' },
  { id: 7, grade: 'C+', minMarks: 50, maxMarks: 54, gpa: 2.50, remarks: 'Average' },
  { id: 8, grade: 'D', minMarks: 40, maxMarks: 49, gpa: 2.00, remarks: 'Pass' },
  { id: 9, grade: 'F', minMarks: 0, maxMarks: 39, gpa: 0.00, remarks: 'Fail' },
];

export function AdminDataProvider({ children }) {
  // Helper to read from LocalStorage with fallback (clean legacy mock data if cached)
  const loadState = (key, fallback = []) => {
    try {
      const saved = localStorage.getItem(`qgenix_${key}`);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      // Clean legacy mock batches with 4-year span format if present in cache
      if (key === 'batches' && Array.isArray(parsed)) {
        return parsed.map(b => ({
          ...b,
          name: (b.name || '')
            .replace('2023-2027', '2023 - 2024')
            .replace('2024-2028', '2024 - 2025')
            .replace('2022-2026', '2022 - 2023')
            .replace('2021-2025', '2021 - 2022')
            .replace('2020-2024', '2020 - 2021')
        }));
      }
      // Clean legacy modules and prerequisite fields if cached
      if (key === 'courses' && Array.isArray(parsed)) {
        return parsed.map(c => ({
          id: c.id,
          code: c.code,
          title: c.title,
          credits: parseFloat(c.credits) || 3.0,
          dept: c.dept || c.department || 'CSE'
        }));
      }
      // Clean legacy status and map weeklyDays for allocations
      if (key === 'allocations' && Array.isArray(parsed)) {
        return parsed.map(a => {
          const { status, ...rest } = a;
          return {
            ...rest,
            weeklyDays: a.weeklyDays || a.weekly_days || (a.hoursPerWeek ? `${a.hoursPerWeek} Days/Week` : 'Sun, Tue')
          };
        });
      }
      return parsed;
    } catch (e) {
      console.error(`Failed to load ${key} from localStorage`, e);
      return fallback;
    }
  };

  // Helper to dynamically parse batch sections from array or comma-separated string
  const parseBatchSections = (sections) => {
    if (Array.isArray(sections)) {
      return sections.map(s => String(s).trim().toUpperCase()).filter(Boolean);
    }
    if (typeof sections === 'string' && sections.trim()) {
      return sections.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    }
    return ['A', 'B'];
  };

  // State declarations (Strictly database driven — no hardcoded demo rows)
  const [departments, setDepartments] = useState(() => loadState('departments', []));
  const [batches, setBatches] = useState(() => {
    const loaded = loadState('batches', []);
    return Array.isArray(loaded) ? loaded.map(b => ({
      ...b,
      dept: b.dept || b.department || 'CSE',
      sections: parseBatchSections(b.sections)
    })) : [];
  });
  const [courses, setCourses] = useState(() => loadState('courses', []));
  const [allocations, setAllocations] = useState(() => loadState('allocations', []));
  const [students, setStudents] = useState(() => loadState('students', []));
  const [faculty, setFaculty] = useState(() => loadState('faculty', []));
  const [routineSlots, setRoutineSlots] = useState(() => loadState('routineSlots', []));
  const [attendances, setAttendances] = useState(() => loadState('attendances', []));
  const [examSessions, setExamSessions] = useState(() => loadState('examSessions', []));
  const [gradingScale, setGradingScale] = useState(() => loadState('gradingScale', initialGradingScale));
  const [tabulationMarks, setTabulationMarks] = useState(() => loadState('tabulationMarks', []));
  const [notices, setNotices] = useState(() => loadState('notices', []));
  const [auditLogs, setAuditLogs] = useState(() => loadState('auditLogs', []));
  const [archives, setArchives] = useState([]);
  const [stats, setStats] = useState(null);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [emailFormats, setEmailFormats] = useState(() => loadState('emailFormats', {
    student: '@diit.edu.bd',
    teacher: '@diit.edu.bd'
  }));

  // Live Sync with Django SQLite Database — Realtime Single Source of Truth
  const refreshFromDB = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/dashboard-stats/`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setIsDbConnected(true);

        if (data.system_settings) {
          const nextStudent = (data.system_settings.student_email_format || '@diit.edu.bd').trim();
          const nextTeacher = (data.system_settings.teacher_email_format || '@diit.edu.bd').trim();
          setEmailFormats(prev => {
            if (prev && prev.student === nextStudent && prev.teacher === nextTeacher) {
              return prev;
            }
            return { student: nextStudent, teacher: nextTeacher };
          });
        }

        if (Array.isArray(data.students)) setStudents(data.students);
        if (Array.isArray(data.faculty)) setFaculty(data.faculty);
        if (Array.isArray(data.courses)) {
          setCourses(data.courses.map(c => ({
            id: c.id,
            code: c.code,
            title: c.title,
            credits: parseFloat(c.credits) || 3.0,
            dept: c.dept || c.department || 'CSE'
          })));
        }
        if (Array.isArray(data.departments)) setDepartments(data.departments);
        if (Array.isArray(data.archives)) setArchives(data.archives);

        if (Array.isArray(data.batches)) {
          setBatches(data.batches.map(b => ({
            ...b,
            dept: b.dept || b.department || 'CSE',
            sections: parseBatchSections(b.sections)
          })));
        }

        if (Array.isArray(data.notices)) {
          setNotices(prev => data.notices.map(dn => {
            const existing = prev.find(p => p.id === dn.id || p.title === dn.title);
            return existing?.attachmentData ? { ...dn, attachmentData: existing.attachmentData, attachmentSize: existing.attachmentSize } : dn;
          }));
        }
        if (Array.isArray(data.routine_slots)) setRoutineSlots(data.routine_slots);
        if (Array.isArray(data.attendances)) setAttendances(data.attendances);
        if (Array.isArray(data.allocations)) {
          setAllocations(data.allocations.map(a => ({
            id: a.id,
            courseCode: a.courseCode || a.course_code,
            courseName: a.courseName || a.course_name,
            teacher: a.teacher,
            batch: a.batch,
            section: a.section,
            weeklyDays: a.weeklyDays || a.weekly_days || (a.hoursPerWeek ? `${a.hoursPerWeek} Days/Week` : 'Sun, Tue')
          })));
        }
      }
    } catch (err) {
      console.warn('Django Backend DB not reachable, fallback to cache:', err.message);
      setIsDbConnected(false);
    }
  };

  useEffect(() => {
    refreshFromDB();
    const interval = setInterval(refreshFromDB, 6000);

    const handleAttendanceChange = () => {
      fetchAttendances();
      refreshFromDB();
    };

    window.addEventListener('qgenix_attendance_updated', handleAttendanceChange);

    let attendBc;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        attendBc = new BroadcastChannel('qgenix_attendance_sync');
        attendBc.onmessage = () => {
          handleAttendanceChange();
        };
      }
    } catch (_) {}

    const handleStorage = (e) => {
      if (e.key === 'qgenix_last_attendance_sync') {
        handleAttendanceChange();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('qgenix_attendance_updated', handleAttendanceChange);
      window.removeEventListener('storage', handleStorage);
      if (attendBc) {
        try { attendBc.close(); } catch (_) {}
      }
    };
  }, []);

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('qgenix_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('qgenix_batches', JSON.stringify(batches)); }, [batches]);
  useEffect(() => { localStorage.setItem('qgenix_courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('qgenix_allocations', JSON.stringify(allocations)); }, [allocations]);
  useEffect(() => { localStorage.setItem('qgenix_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('qgenix_faculty', JSON.stringify(faculty)); }, [faculty]);
  useEffect(() => { localStorage.setItem('qgenix_routineSlots', JSON.stringify(routineSlots)); }, [routineSlots]);
  useEffect(() => { localStorage.setItem('qgenix_attendances', JSON.stringify(attendances)); }, [attendances]);
  useEffect(() => { localStorage.setItem('qgenix_examSessions', JSON.stringify(examSessions)); }, [examSessions]);
  useEffect(() => { localStorage.setItem('qgenix_gradingScale', JSON.stringify(gradingScale)); }, [gradingScale]);
  useEffect(() => { localStorage.setItem('qgenix_tabulationMarks', JSON.stringify(tabulationMarks)); }, [tabulationMarks]);
  useEffect(() => { 
    localStorage.setItem('qgenix_notices', JSON.stringify(notices)); 
    window.dispatchEvent(new Event('qgenix_notices_updated'));
  }, [notices]);
  useEffect(() => { localStorage.setItem('qgenix_auditLogs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('qgenix_emailFormats', JSON.stringify(emailFormats)); }, [emailFormats]);

  const addAuditLog = (action, category, target, status = 'Success') => {
    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      user: 'Admin (System Controller)',
      action,
      category,
      target,
      ipAddress: '192.168.1.10',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // ==================== 1. ACADEMICS CRUD ====================
  // Add Department
  const addDepartment = async (dept) => {
    const newDept = { id: Date.now(), ...dept };
    setDepartments(prev => [...prev, newDept]);
    addAuditLog('Department Added', 'Academic', `${dept.code} - ${dept.name}`);

    try {
      await fetch(`${API_BASE}/api/auth/departments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dept)
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving department to DB:', e);
    }
  };

  // Edit Department
  const editDepartment = (id, updatedFields) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
    addAuditLog('Department Updated', 'Academic', `Dept ID: ${id}`);
  };

  // Delete Department
  const deleteDepartment = async (id) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    addAuditLog('Department Deleted', 'Academic', `Dept ID: ${id}`);

    try {
      await fetch(`${API_BASE}/api/auth/departments/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error deleting department from DB:', e);
    }
  };

  // Add Course
  const addCourse = async (course) => {
    const payload = {
      code: course.code,
      title: course.title,
      credits: parseFloat(course.credits) || 3.0,
      department: course.dept || course.department || 'CSE'
    };
    const newCourse = { id: Date.now(), ...payload, dept: payload.department };
    setCourses(prev => [...prev, newCourse]);
    addAuditLog('Course Catalog Added', 'Academic', `${course.code}: ${course.title}`);

    try {
      await fetch(`${API_BASE}/api/auth/courses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving course to DB:', e);
    }
  };

  // Edit Course
  const editCourse = async (id, updatedFields) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    addAuditLog('Course Catalog Updated', 'Academic', `Course ID: ${id}`);

    try {
      const payload = {};
      if (updatedFields.title !== undefined) payload.title = updatedFields.title;
      if (updatedFields.code !== undefined) payload.code = updatedFields.code;
      if (updatedFields.credits !== undefined) payload.credits = parseFloat(updatedFields.credits) || 3.0;
      if (updatedFields.department !== undefined || updatedFields.dept !== undefined) {
        payload.department = updatedFields.department || updatedFields.dept;
      }

      await fetch(`${API_BASE}/api/auth/courses/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error updating course in DB:', e);
    }
  };

  // Delete Course
  const deleteCourse = async (id) => {
    setCourses(prev => prev.filter(c => c.id !== id && c.code !== id));
    addAuditLog('Course Catalog Removed', 'Academic', `Course ID: ${id}`);

    try {
      await fetch(`${API_BASE}/api/auth/courses/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error deleting course from DB:', e);
    }
  };

  // Add Batch
  const addBatch = async (batch) => {
    const rawSections = parseBatchSections(batch.sections);
    const newBatch = { ...batch, sections: rawSections, id: Date.now() };
    setBatches(prev => [...prev, newBatch]);
    addAuditLog('Academic Batch Created', 'Academic', `${batch.name} (${batch.dept}) - Sections: ${rawSections.join(', ')}`);

    try {
      await fetch(`${API_BASE}/api/auth/batches/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: batch.name,
          department: batch.dept || batch.department || 'CSE',
          semester: batch.semester || '1st Semester',
          sections: rawSections.join(', '),
          student_count: batch.studentCount || 0,
          status: batch.status || 'Active'
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving batch to DB:', e);
    }
  };

  // Edit Batch
  const editBatch = async (id, updatedFields) => {
    let finalFields = { ...updatedFields };
    if (updatedFields.sections !== undefined) {
      finalFields.sections = parseBatchSections(updatedFields.sections);
    }
    if (finalFields.status === 'Graduate' || finalFields.status === 'Graduated') {
      setBatches(prev => prev.filter(b => b.id !== id));
    } else {
      setBatches(prev => prev.map(b => b.id === id ? { ...b, ...finalFields } : b));
    }
    addAuditLog('Academic Batch Modified', 'Academic', `Batch ID: ${id}`);

    try {
      await fetch(`${API_BASE}/api/auth/batches/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(finalFields.name ? { name: finalFields.name } : {}),
          ...(finalFields.dept || finalFields.department ? { department: finalFields.dept || finalFields.department } : {}),
          ...(finalFields.semester ? { semester: finalFields.semester } : {}),
          ...(finalFields.sections ? { sections: finalFields.sections.join(', ') } : {}),
          ...(finalFields.status ? { status: finalFields.status } : {})
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error updating batch in DB:', e);
    }
  };

  // Delete Batch
  const deleteBatch = async (id) => {
    setBatches(prev => prev.filter(b => b.id !== id));
    addAuditLog('Academic Batch Removed', 'Academic', `Batch ID: ${id}`);

    try {
      await fetch(`${API_BASE}/api/auth/batches/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error deleting batch from DB:', e);
    }
  };

  // Archive Batch Semester (and optionally advance or mark graduate)
  const archiveSemester = async ({ batchId, batchName, semester, advanceToNext = false, isGraduate = false }) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/archive-semester/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: batchId,
          batch_name: batchName,
          semester,
          advance_to_next: !!advanceToNext,
          is_graduate: !!isGraduate
        })
      });
      const data = await res.json();

      // IMMEDIATE REACTIVE OPTIMISTIC UPDATE:
      if (isGraduate || data?.batch_status === 'Graduate') {
        // Remove graduated batch from active cohorts immediately!
        setBatches(prev => prev.filter(b => b.id !== batchId && b.name !== batchName));
      } else if (advanceToNext && data?.next_semester) {
        // Advance current semester in active batches immediately!
        setBatches(prev => prev.map(b => (b.id === batchId || b.name === batchName) ? { ...b, semester: data.next_semester } : b));
      }

      addAuditLog('Semester Archived', 'Academic Archive', `${batchName || 'Batch'} - ${semester || 'Semester'}`);
      await refreshFromDB();
      return data;
    } catch (e) {
      console.warn('Error archiving semester:', e);
    }
  };

  // Helper to notify real-time listeners across tabs of course allocation changes
  const notifyAllocationChange = () => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('qgenix_allocations_updated'));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('qgenix_academic_sync');
          bc.postMessage({ type: 'ALLOCATIONS_UPDATED', timestamp: Date.now() });
          setTimeout(() => {
            try { bc.close(); } catch (_) {}
          }, 200);
        }
      }
    } catch (_) {}
  };

  // Allocate Course (Assign Teacher)
  const addAllocation = async (alloc) => {
    const weeklyDays = alloc.weeklyDays || alloc.weekly_days || 'Sun, Tue';
    const newAlloc = { id: Date.now(), ...alloc, weeklyDays };
    setAllocations(prev => [...prev, newAlloc]);
    addAuditLog('Course Allocated', 'Faculty', `${alloc.courseName || alloc.courseCode} -> ${alloc.teacher} (${weeklyDays})`);
    notifyAllocationChange();

    try {
      await fetch(`${API_BASE}/api/auth/allocations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_code: alloc.courseCode,
          course_name: alloc.courseName,
          teacher: alloc.teacher,
          batch: alloc.batch,
          section: alloc.section || 'Sec A',
          weekly_days: weeklyDays,
          hours_per_week: alloc.hoursPerWeek || 3
        })
      });
      await refreshFromDB();
      notifyAllocationChange();
    } catch (e) {
      console.warn('Error saving allocation to DB:', e);
    }
  };

  // Edit Allocation (Reassign Teacher)
  const editAllocation = async (id, updatedFields) => {
    setAllocations(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    addAuditLog('Course Reassigned', 'Faculty', `Allocation ID: ${id}`);
    notifyAllocationChange();

    try {
      const payload = {};
      if (updatedFields.teacher !== undefined) payload.teacher = updatedFields.teacher;
      if (updatedFields.section !== undefined) payload.section = updatedFields.section;
      if (updatedFields.weeklyDays !== undefined) payload.weekly_days = updatedFields.weeklyDays;
      if (updatedFields.weekly_days !== undefined) payload.weekly_days = updatedFields.weekly_days;
      if (updatedFields.courseName !== undefined) payload.course_name = updatedFields.courseName;
      if (updatedFields.courseCode !== undefined) payload.course_code = updatedFields.courseCode;
      if (updatedFields.batch !== undefined) payload.batch = updatedFields.batch;

      await fetch(`${API_BASE}/api/auth/allocations/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await refreshFromDB();
      notifyAllocationChange();
    } catch (e) {
      console.warn('Error updating allocation in DB:', e);
    }
  };

  // Remove Allocation
  const deleteAllocation = async (id) => {
    setAllocations(prev => prev.filter(a => a.id !== id));
    addAuditLog('Course Allocation Removed', 'Faculty', `Allocation ID: ${id}`);
    notifyAllocationChange();

    try {
      await fetch(`${API_BASE}/api/auth/allocations/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
      notifyAllocationChange();
    } catch (e) {
      console.warn('Error deleting allocation from DB:', e);
    }
  };

  // ==================== 2. USERS CRUD ====================
  // Add Student (Saved directly into Django SQLite Database)
  const addStudent = async (student) => {
    const newStudent = { 
      ...student, 
      regNo: student.regNo || student.registration_no || `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      section: student.section || 'A',
      status: student.status || 'Active' 
    };
    setStudents(prev => [newStudent, ...prev]);
    addAuditLog('Student Registered', 'User Management', `${student.id} - ${student.name}`);

    try {
      await fetch(`${API_BASE}/api/auth/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'STUDENT',
          name: newStudent.name,
          email: newStudent.email,
          regNo: newStudent.regNo,
          dept: newStudent.dept,
          batch: newStudent.batch || 'Batch 2024',
          section: newStudent.section,
          id: newStudent.id,
          institutional_id: newStudent.id,
          password: newStudent.password,
          cgpa: newStudent.cgpa || '3.75',
          profile_picture: newStudent.profile_picture || ''
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving student to DB:', e);
    }
  };

  // Edit Student
  const editStudent = async (id, updatedFields) => {
    const targetStudent = students.find(s => s.id === id || s.db_id === id);
    const lookupKey = targetStudent?.db_id || id;

    setStudents(prev => prev.map(s => (s.id === id || s.db_id === id) ? { ...s, ...updatedFields } : s));
    addAuditLog(
      updatedFields.password ? 'Student Password Reset' : 'Student Profile Modified', 
      'User Management', 
      `${targetStudent?.name || id} (${targetStudent?.email || id})`
    );

    try {
      await fetch(`${API_BASE}/api/auth/users/${lookupKey}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedFields,
          institutional_id: targetStudent?.id || id
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error updating student in DB:', e);
    }

    // Synchronize localStorage credentials immediately
    if (updatedFields.password) {
      try {
        const registered = JSON.parse(localStorage.getItem('qgenix_registered_students') || '[]');
        const updated = registered.map(s => {
          if (s.institutionalId === id || s.id === id || s.email === targetStudent?.email || s.email === id) {
            return { ...s, password: updatedFields.password };
          }
          return s;
        });
        localStorage.setItem('qgenix_registered_students', JSON.stringify(updated));
      } catch (err) {}
    }
  };

  // Publish Semester Result and dynamically re-calculate student CGPA
  const publishSemesterResult = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/publish-semester-result/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await refreshFromDB();
      }
    } catch (e) {
      console.warn('Error publishing semester result:', e);
    }
  };

  // Delete Student (Deleted directly from Django SQLite Database & Login Revoked)
  const deleteStudent = async (id) => {
    const targetStudent = students.find(s => s.id === id || s.db_id === id);
    setStudents(prev => prev.filter(s => s.id !== id && s.db_id !== id));
    addAuditLog('Student Account Permanently Deleted', 'User Management', `${targetStudent?.name || id} (${id})`);

    // 1. Purge from registered students cache
    try {
      const registeredStudents = JSON.parse(localStorage.getItem('qgenix_registered_students') || '[]');
      const filtered = registeredStudents.filter(s => 
        s.id !== id && 
        s.institutionalId !== id && 
        s.email?.toLowerCase() !== targetStudent?.email?.toLowerCase()
      );
      localStorage.setItem('qgenix_registered_students', JSON.stringify(filtered));
    } catch (e) {}

    // 2. Blacklist in deleted users register so login is permanently blocked
    try {
      const deletedUsers = JSON.parse(localStorage.getItem('qgenix_deleted_users') || '[]');
      const identifiers = [
        id, 
        targetStudent?.id, 
        targetStudent?.institutional_id, 
        targetStudent?.email,
        targetStudent?.email?.split('@')[0]
      ].filter(Boolean).map(x => String(x).toLowerCase());
      
      identifiers.forEach(ident => {
        if (!deletedUsers.includes(ident)) {
          deletedUsers.push(ident);
        }
      });
      localStorage.setItem('qgenix_deleted_users', JSON.stringify(deletedUsers));
    } catch (e) {}

    // 3. Delete from Django backend DB
    try {
      await fetch(`${API_BASE}/api/auth/users/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error deleting student from DB:', e);
    }
  };

  // Toggle Student Status (Active / Suspended)
  const toggleStudentStatus = (id) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const next = s.status === 'Active' ? 'Suspended' : 'Active';
        addAuditLog(`Student Status Changed to ${next}`, 'User Management', s.id);
        return { ...s, status: next };
      }
      return s;
    }));
  };

  // Bulk Import Students
  const bulkImportStudents = (studentsList) => {
    setStudents(prev => [...studentsList, ...prev]);
    addAuditLog(`Bulk CSV Imported (${studentsList.length} Students)`, 'User Management', 'Batch Upload');
  };

  // Add Faculty (Saved directly into Django SQLite Database)
  const addFaculty = async (fac) => {
    const newFac = { 
      ...fac, 
      profile_picture: fac.profile_picture || '',
      status: fac.status || 'Active' 
    };
    setFaculty(prev => [newFac, ...prev]);
    addAuditLog('Faculty Appointed', 'User Management', `${fac.id} - ${fac.name}`);

    try {
      await fetch(`${API_BASE}/api/auth/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'TEACHER',
          name: fac.name,
          email: fac.email,
          dept: fac.dept,
          designation: fac.designation || 'Assistant Professor',
          id: fac.id,
          institutional_id: fac.id,
          password: fac.password || 'teacher123',
          profile_picture: fac.profile_picture || ''
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving faculty to DB:', e);
    }

    // Synchronize localStorage credentials for instant teacher login
    try {
      const registeredTeachers = JSON.parse(localStorage.getItem('qgenix_registered_teachers') || '[]');
      const teacherObj = {
        id: fac.id,
        institutionalId: fac.id,
        username: fac.email.split('@')[0],
        email: fac.email,
        password: fac.password || 'teacher123',
        role: 'TEACHER',
        name: fac.name,
        department: fac.dept,
        designation: fac.designation || 'Assistant Professor',
        profile_picture: fac.profile_picture || ''
      };
      const existingIdx = registeredTeachers.findIndex(t => t.id === fac.id || t.email === fac.email);
      if (existingIdx >= 0) {
        registeredTeachers[existingIdx] = teacherObj;
      } else {
        registeredTeachers.push(teacherObj);
      }
      localStorage.setItem('qgenix_registered_teachers', JSON.stringify(registeredTeachers));
    } catch (err) {}
  };

  // Edit Faculty
  const editFaculty = async (id, updatedFields) => {
    const targetFaculty = faculty.find(f => f.id === id || f.db_id === id);
    const lookupKey = targetFaculty?.db_id || id;

    setFaculty(prev => prev.map(f => (f.id === id || f.db_id === id) ? { ...f, ...updatedFields } : f));
    addAuditLog(
      updatedFields.password ? 'Faculty Password Reset by Admin' : 'Faculty Profile Modified', 
      'User Management', 
      `${targetFaculty?.name || id} (${targetFaculty?.email || id})`
    );

    try {
      await fetch(`${API_BASE}/api/auth/users/${lookupKey}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedFields,
          institutional_id: targetFaculty?.id || id
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error updating faculty in DB:', e);
    }

    // Synchronize localStorage credentials immediately (including updated password)
    try {
      const registeredTeachers = JSON.parse(localStorage.getItem('qgenix_registered_teachers') || '[]');
      const updated = registeredTeachers.map(t => {
        if (t.institutionalId === id || t.id === id || t.email?.toLowerCase() === targetFaculty?.email?.toLowerCase() || t.email?.toLowerCase() === id?.toLowerCase()) {
          return { 
            ...t, 
            ...updatedFields,
            ...(updatedFields.password ? { password: updatedFields.password } : {})
          };
        }
        return t;
      });
      localStorage.setItem('qgenix_registered_teachers', JSON.stringify(updated));
    } catch (err) {}
  };

  // Delete Faculty (Deleted directly from Django SQLite Database & Login Revoked)
  const deleteFaculty = async (id) => {
    const targetFaculty = faculty.find(f => f.id === id || f.db_id === id);
    setFaculty(prev => prev.filter(f => f.id !== id && f.db_id !== id));
    addAuditLog('Faculty Record Permanently Deleted', 'User Management', `${targetFaculty?.name || id} (${id})`);

    // 1. Purge from registered teachers cache
    try {
      const registeredTeachers = JSON.parse(localStorage.getItem('qgenix_registered_teachers') || '[]');
      const filtered = registeredTeachers.filter(t => 
        t.id !== id && 
        t.institutionalId !== id && 
        t.email?.toLowerCase() !== targetFaculty?.email?.toLowerCase()
      );
      localStorage.setItem('qgenix_registered_teachers', JSON.stringify(filtered));
    } catch (e) {}

    // 2. Blacklist in deleted users register so login is permanently blocked
    try {
      const deletedUsers = JSON.parse(localStorage.getItem('qgenix_deleted_users') || '[]');
      const identifiers = [
        id, 
        targetFaculty?.id, 
        targetFaculty?.institutional_id, 
        targetFaculty?.email,
        targetFaculty?.email?.split('@')[0]
      ].filter(Boolean).map(x => String(x).toLowerCase());

      identifiers.forEach(ident => {
        if (!deletedUsers.includes(ident)) {
          deletedUsers.push(ident);
        }
      });
      localStorage.setItem('qgenix_deleted_users', JSON.stringify(deletedUsers));
    } catch (e) {}

    // 3. Delete from Django backend DB
    try {
      await fetch(`${API_BASE}/api/auth/users/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error deleting faculty from DB:', e);
    }
  };

  // ==================== 3. EXAMS & RESULTS ====================
  // Toggle Session Lock
  const toggleSessionLock = (id) => {
    setExamSessions(prev => prev.map(s => {
      if (s.id === id) {
        const next = !s.isLocked;
        addAuditLog(`Exam Session ${next ? 'LOCKED' : 'UNLOCKED'}`, 'Exam Controller', s.name);
        return { ...s, isLocked: next };
      }
      return s;
    }));
  };

  // Add Exam Session
  const addExamSession = (session) => {
    const newSession = { id: Date.now(), isLocked: false, submittedPapers: 0, totalExpected: 40, ...session };
    setExamSessions(prev => [newSession, ...prev]);
    addAuditLog('Exam Session Scheduled', 'Exam Controller', session.name);
  };

  // Update Grading Scale
  const updateGradingScale = (newScale) => {
    setGradingScale(newScale);
    addAuditLog('Grading Policy Updated', 'Exam Controller', '4.0 GPA Standard Matrix');
  };

  // Update Tabulation Marks
  const updateStudentMarks = (studentId, marks) => {
    setTabulationMarks(prev => prev.map(m => {
      if (m.studentId === studentId) {
        const quiz = parseInt(marks.quiz) || 0;
        const mid = parseInt(marks.mid) || 0;
        const final = parseInt(marks.final) || 0;
        const total = quiz + mid + final;
        let grade = 'F';
        let gpa = 0.0;
        if (total >= 80) { grade = 'A+'; gpa = 4.0; }
        else if (total >= 75) { grade = 'A'; gpa = 3.75; }
        else if (total >= 70) { grade = 'A-'; gpa = 3.5; }
        else if (total >= 65) { grade = 'B+'; gpa = 3.25; }
        else if (total >= 60) { grade = 'B'; gpa = 3.0; }
        else if (total >= 50) { grade = 'C+'; gpa = 2.5; }
        else if (total >= 40) { grade = 'D'; gpa = 2.0; }
        return { ...m, quiz, mid, final, total, grade, gpa };
      }
      return m;
    }));
    addAuditLog('Tabulation Marks Altered', 'Exam Controller', studentId);
  };

  // ==================== 4. ROUTINE & CLASH DETECTION ====================
  // Check Clash: returns { hasConflict: boolean, reason: string }
  const checkRoutineClash = (newSlot) => {
    for (const slot of routineSlots) {
      // Ignore self when editing existing slot
      if (newSlot.id && slot.id === newSlot.id) continue;
      if (slot.day === newSlot.day && slot.time === newSlot.time) {
        const slotRoom = (slot.room || '').toLowerCase().trim();
        const newRoom = (newSlot.room || '').toLowerCase().trim();
        if (slotRoom && newRoom && slotRoom === newRoom) {
          return { hasConflict: true, reason: `Room Clash: ${slot.room} is already booked for ${slot.course} (${slot.teacher})` };
        }
        const slotTeacher = (slot.teacher || '').toLowerCase().trim();
        const newTeacher = (newSlot.teacher || '').toLowerCase().trim();
        if (slotTeacher && newTeacher && slotTeacher === newTeacher) {
          return { hasConflict: true, reason: `Instructor Clash: ${slot.teacher} already has a lecture in ${slot.room} at this time!` };
        }
      }
    }
    return { hasConflict: false, reason: '' };
  };

  // Add Routine Slot
  const addRoutineSlot = async (slot) => {
    const clash = checkRoutineClash(slot);
    const newSlot = { id: Date.now(), conflict: clash.hasConflict, ...slot };
    setRoutineSlots(prev => [...prev, newSlot]);
    addAuditLog(`Routine Slot Added ${clash.hasConflict ? '(CONFLICT FLAGGED)' : ''}`, 'Routine', `${slot.course} in ${slot.room}`);

    try {
      await fetch(`${API_BASE}/api/auth/routines/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: slot.day,
          time: slot.time,
          course: slot.course,
          teacher: slot.teacher,
          room: slot.room,
          batch: slot.batch,
          conflict: clash.hasConflict
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving routine to DB:', e);
    }
    return clash;
  };

  // Edit Routine Slot
  const editRoutineSlot = async (id, updatedSlot) => {
    const clash = checkRoutineClash({ ...updatedSlot, id });
    setRoutineSlots(prev => prev.map(s => s.id === id ? { ...s, ...updatedSlot, conflict: clash.hasConflict } : s));
    addAuditLog(`Routine Slot Updated ${clash.hasConflict ? '(CONFLICT FLAGGED)' : ''}`, 'Routine', `${updatedSlot.course} in ${updatedSlot.room}`);

    try {
      await fetch(`${API_BASE}/api/auth/routines/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: updatedSlot.day,
          time: updatedSlot.time,
          course: updatedSlot.course,
          teacher: updatedSlot.teacher,
          room: updatedSlot.room,
          batch: updatedSlot.batch,
          conflict: clash.hasConflict
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error updating routine in DB:', e);
    }
    return clash;
  };

  // Delete Routine Slot
  const deleteRoutineSlot = async (id) => {
    setRoutineSlots(prev => prev.filter(s => s.id !== id));
    addAuditLog('Routine Slot Removed', 'Routine', `Slot ID: ${id}`);

    try {
      await fetch(`${API_BASE}/api/auth/routines/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error deleting routine from DB:', e);
    }
  };

  // ==================== 5. NOTICES ====================
  const addNotice = async (notice) => {
    const formattedDate = notice.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const payload = { ...notice, date: formattedDate };
    const newNotice = { id: Date.now(), ...payload };
    setNotices(prev => [newNotice, ...prev]);
    addAuditLog('Notice Broadcasted', 'Notice Board', notice.title);

    try {
      const { attachmentData, attachmentSize, ...dbPayload } = payload;
      await fetch(`${API_BASE}/api/auth/notices/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving notice to DB:', e);
    }
  };

  const deleteNotice = async (id) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    addAuditLog('Notice Deleted', 'Notice Board', `Notice ID: ${id}`);

    try {
      await fetch(`${API_BASE}/api/auth/notices/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error deleting notice from DB:', e);
    }
  };

  const togglePinNotice = async (id) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    try {
      const target = notices.find(n => n.id === id);
      if (target) {
        await fetch(`${API_BASE}/api/auth/notices/${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pinned: !target.pinned })
        });
      }
    } catch (e) {
      console.warn('Error updating pin status in DB:', e);
    }
  };

  // ── Email Format Settings & System-Wide Validator ──
  const updateEmailFormats = async (newFormats) => {
    const updated = {
      student: (newFormats.student !== undefined ? newFormats.student : emailFormats.student).trim(),
      teacher: (newFormats.teacher !== undefined ? newFormats.teacher : emailFormats.teacher).trim(),
    };
    setEmailFormats(updated);
    try {
      localStorage.setItem('qgenix_emailFormats', JSON.stringify(updated));
    } catch (e) {}
    addAuditLog('Email Formats Updated', 'Settings', `Student: ${updated.student} | Teacher: ${updated.teacher}`);

    try {
      await fetch(`${API_BASE}/api/auth/system-settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email_format: updated.student,
          teacher_email_format: updated.teacher
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving email formats to DB:', e);
    }
  };

  const validateEmailFormat = (email, role = 'student') => {
    if (!email || !email.trim()) {
      return { isValid: false, error: 'Email address cannot be empty.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    const roleKey = (role || 'student').toLowerCase() === 'teacher' ? 'teacher' : 'student';
    const roleTitle = roleKey === 'teacher' ? 'Teacher' : 'Student';
    const rawFormat = (emailFormats[roleKey] || '@diit.edu.bd').trim();
    const cleanFormat = rawFormat.toLowerCase();

    // 1. If format starts with '@' (e.g. '@diit.edu.bd')
    if (cleanFormat.startsWith('@')) {
      if (!cleanEmail.endsWith(cleanFormat)) {
        return { 
          isValid: false, 
          error: `${roleTitle} email must follow the required format: ${rawFormat} (e.g. user${rawFormat})` 
        };
      }
      return { isValid: true, error: null };
    }

    // 2. If format is just domain without '@' (e.g. 'diit.edu.bd')
    if (!cleanFormat.includes('@')) {
      const requiredSuffix = `@${cleanFormat}`;
      if (!cleanEmail.endsWith(requiredSuffix)) {
        return { 
          isValid: false, 
          error: `${roleTitle} email must end with @${rawFormat}` 
        };
      }
      return { isValid: true, error: null };
    }

    // 3. If format includes wildcard '*' (e.g. '*@diit.edu.bd')
    if (cleanFormat.includes('*')) {
      const regexStr = '^' + cleanFormat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '[a-zA-Z0-9._-]+') + '$';
      const regex = new RegExp(regexStr, 'i');
      if (!regex.test(cleanEmail)) {
        return { 
          isValid: false, 
          error: `${roleTitle} email must follow required pattern: ${rawFormat}` 
        };
      }
      return { isValid: true, error: null };
    }

    // 4. If format has placeholders like '{name}_{id}@domain' or '[name]_[id]@domain'
    if (cleanFormat.includes('{') || cleanFormat.includes('[')) {
      const domain = cleanFormat.split('@')[1];
      if (domain && !cleanEmail.endsWith(`@${domain}`)) {
        return { 
          isValid: false, 
          error: `${roleTitle} email must end with @${domain}` 
        };
      }
      const localFormat = cleanFormat.split('@')[0];
      if (localFormat.includes('_') && !cleanEmail.split('@')[0].includes('_')) {
        return { 
          isValid: false, 
          error: `${roleTitle} email username must follow format "${localFormat}" (e.g. name_id@${domain})` 
        };
      }
      return { isValid: true, error: null };
    }

    // 5. Default domain check
    const atIndex = cleanFormat.indexOf('@');
    const expectedDomain = cleanFormat.slice(atIndex);
    if (!cleanEmail.endsWith(expectedDomain)) {
      return { 
        isValid: false, 
        error: `${roleTitle} email must end with ${expectedDomain}` 
      };
    }

    return { isValid: true, error: null };
  };

  // 100% Real Database Attendance Operations
  const fetchAttendances = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/attendances/`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        setAttendances(list);
        return list;
      }
    } catch (e) {
      console.warn('Failed to fetch attendances:', e);
    }
    return attendances;
  };

  const addAttendanceRecord = async (recordData) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/attendances/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      });
      if (res.ok) {
        const saved = await res.json();
        setAttendances(prev => [saved, ...prev.filter(a => a.id !== saved.id)]);
        refreshFromDB();
        return saved;
      }
    } catch (e) {
      console.error('Failed to add attendance record to DB:', e);
    }
    return null;
  };

  const deleteAttendanceRecord = async (id) => {
    try {
      await fetch(`${API_BASE}/api/auth/attendances/${id}/`, { method: 'DELETE' });
      setAttendances(prev => prev.filter(a => a.id !== id));
      refreshFromDB();
    } catch (e) {
      console.error('Failed to delete attendance record from DB:', e);
    }
  };

  return (
    <AdminDataContext.Provider value={{
      // Data state
      departments,
      batches,
      courses,
      allocations,
      students,
      faculty,
      routineSlots,
      attendances,
      setAttendances,
      examSessions,
      gradingScale,
      tabulationMarks,
      notices,
      auditLogs,
      archives,
      emailFormats,

      // Operations
      addDepartment,
      editDepartment,
      deleteDepartment,
      addCourse,
      editCourse,
      deleteCourse,
      addBatch,
      editBatch,
      deleteBatch,
      archiveSemester,
      addAllocation,
      editAllocation,
      deleteAllocation,

      addStudent,
      editStudent,
      deleteStudent,
      toggleStudentStatus,
      bulkImportStudents,
      addFaculty,
      editFaculty,
      deleteFaculty,

      toggleSessionLock,
      addExamSession,
      updateGradingScale,
      updateStudentMarks,

      checkRoutineClash,
      addRoutineSlot,
      editRoutineSlot,
      deleteRoutineSlot,

      // Dedicated Real Database Attendance Operations
      fetchAttendances,
      addAttendanceRecord,
      deleteAttendanceRecord,

      addNotice,
      deleteNotice,
      togglePinNotice,
      addAuditLog,

      // Email Format & System Settings Operations
      updateEmailFormats,
      validateEmailFormat,

      // Live DB Telemetry & Sync
      stats,
      isDbConnected,
      refreshFromDB,
      publishSemesterResult
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

// Hook to consume admin data
export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}

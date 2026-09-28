// =========================================================================================
// AdminDataContext.jsx — Central Reactive State & LocalStorage Persistence for QGenix Admin
// -----------------------------------------------------------------------------------------
// Bengali Note:
// এই কনটেক্সট প্রোভাইডারে অ্যাডমিন কনসোলের সকল ডাটা (শিক্ষার্থী, শিক্ষক, ডিপার্টমেন্ট, কোর্স,
// কোর্স অ্যালোকেশন, পরীক্ষার সেশন, রুটিন, নোটিশ, অডিট লগ ইত্যাদি) কেন্দ্রীভূত এবং 
// লোকাল স্টোরেজে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে। ফলে কোনো কিছু যোগ, সম্পাদনা (Edit) বা মুছে ফেলা 
// (Delete) হলে তা তৎক্ষণাৎ কার্যকর হয় এবং পেজ রিফ্রেশ করলেও ডাটা নষ্ট হয় না।
// =========================================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminDataContext = createContext();

// Default Initial Data (যদি লোকাল স্টোরেজে আগে থেকে ডাটা না থাকে)
const initialDepartments = [
  { id: 1, code: 'CSE', name: 'Computer Science & Engineering', hod: 'Prof. Dr. Mahbubur Rahman', facultyCount: 38, studentCount: 1650, established: '2012' },
  { id: 2, code: 'EEE', name: 'Electrical & Electronic Engineering', hod: 'Dr. Farhana Ahmed', facultyCount: 26, studentCount: 980, established: '2014' },
  { id: 3, code: 'BBA', name: 'Business Administration', hod: 'Prof. Tariqul Islam', facultyCount: 22, studentCount: 850, established: '2015' },
  { id: 4, code: 'CE', name: 'Civil Engineering', hod: 'Dr. Nazmul Huda', facultyCount: 18, studentCount: 520, established: '2018' },
  { id: 5, code: 'ENG', name: 'English & Modern Languages', hod: 'Dr. Shaila Parveen', facultyCount: 14, studentCount: 250, established: '2019' },
];

const initialBatches = [
  { id: 1, name: 'Batch 2022-2026', dept: 'CSE', semester: '6th Semester', sections: ['A', 'B', 'C'], studentCount: 210, status: 'Active' },
  { id: 2, name: 'Batch 2023-2027', dept: 'CSE', semester: '4th Semester', sections: ['A', 'B'], studentCount: 180, status: 'Active' },
  { id: 3, name: 'Batch 2021-2025', dept: 'EEE', semester: '8th Semester', sections: ['A'], studentCount: 95, status: 'Graduating' },
  { id: 4, name: 'Batch 2024-2028', dept: 'BBA', semester: '2nd Semester', sections: ['A', 'B', 'C'], studentCount: 220, status: 'Active' },
  { id: 5, name: 'Batch 2023-2027', dept: 'CE', semester: '4th Semester', sections: ['A'], studentCount: 80, status: 'Active' },
];

const initialCourses = [
  { id: 1, code: 'CSE-301', title: 'Database Management Systems', credits: 3.0, dept: 'CSE', modules: 5, prerequisite: 'CSE-201' },
  { id: 2, code: 'CSE-302', title: 'Operating Systems & System Programming', credits: 3.0, dept: 'CSE', modules: 6, prerequisite: 'CSE-205' },
  { id: 3, code: 'CSE-315', title: 'Artificial Intelligence & Machine Learning', credits: 4.0, dept: 'CSE', modules: 8, prerequisite: 'CSE-301' },
  { id: 4, code: 'EEE-211', title: 'Signals and Linear Systems', credits: 3.0, dept: 'EEE', modules: 4, prerequisite: 'EEE-101' },
  { id: 5, code: 'BBA-205', title: 'Financial Accounting & Reporting', credits: 3.0, dept: 'BBA', modules: 5, prerequisite: 'None' },
];

const initialAllocations = [
  { id: 1, courseCode: 'CSE-301', courseName: 'Database Management Systems', teacher: 'Dr. Asaduzzaman', batch: 'Batch 2022-2026', section: 'Sec A & B', hoursPerWeek: 4, status: 'Confirmed' },
  { id: 2, courseCode: 'CSE-315', courseName: 'Artificial Intelligence & Machine Learning', teacher: 'Prof. Dr. Mahbubur Rahman', batch: 'Batch 2022-2026', section: 'Sec A', hoursPerWeek: 4, status: 'Confirmed' },
  { id: 3, courseCode: 'CSE-302', courseName: 'Operating Systems', teacher: 'Engr. Tanvir Hasan', batch: 'Batch 2023-2027', section: 'Sec B', hoursPerWeek: 3, status: 'Pending Review' },
  { id: 4, courseCode: 'EEE-211', courseName: 'Signals and Linear Systems', teacher: 'Dr. Farhana Ahmed', batch: 'Batch 2021-2025', section: 'Sec A', hoursPerWeek: 4, status: 'Confirmed' },
];

const initialStudents = [
  { id: 'STU-2022-001', name: 'Tanvir Hossain', email: 'tanvir.001@student.edu', regNo: 'REG-2022-0001', dept: 'CSE', batch: 'Batch 2022', section: 'A', cgpa: '3.82', status: 'Active' },
  { id: 'STU-2022-045', name: 'Nusrat Jahan', email: 'nusrat.045@student.edu', regNo: 'REG-2022-0045', dept: 'CSE', batch: 'Batch 2022', section: 'B', cgpa: '3.91', status: 'Active' },
  { id: 'STU-2023-102', name: 'Arif Mahmud', email: 'arif.102@student.edu', regNo: 'REG-2023-0102', dept: 'EEE', batch: 'Batch 2023', section: 'A', cgpa: '3.45', status: 'Active' },
  { id: 'STU-2022-089', name: 'Sumaiya Akter', email: 'sumaiya.089@student.edu', regNo: 'REG-2022-0089', dept: 'BBA', batch: 'Batch 2022', section: 'B', cgpa: '3.68', status: 'Active' },
  { id: 'STU-2021-014', name: 'Kamrul Hassan', email: 'kamrul.014@student.edu', regNo: 'REG-2021-0014', dept: 'CE', batch: 'Batch 2021', section: 'A', cgpa: '2.85', status: 'Suspended' },
];

const initialFaculty = [
  { id: 'FAC-101', name: 'Prof. Dr. Mahbubur Rahman', email: 'mahbub@qgenix.edu', designation: 'Professor & Head', dept: 'CSE', courseLoad: 3, status: 'Active' },
  { id: 'FAC-104', name: 'Dr. Farhana Ahmed', email: 'farhana@qgenix.edu', designation: 'Associate Professor', dept: 'EEE', courseLoad: 4, status: 'Active' },
  { id: 'FAC-112', name: 'Engr. Tanvir Hasan', email: 'tanvir.h@qgenix.edu', designation: 'Assistant Professor', dept: 'CSE', courseLoad: 4, status: 'Active' },
  { id: 'FAC-120', name: 'Dr. Asaduzzaman', email: 'asad@qgenix.edu', designation: 'Senior Lecturer', dept: 'CSE', courseLoad: 3, status: 'Active' },
  { id: 'FAC-135', name: 'Prof. Tariqul Islam', email: 'tariqul@qgenix.edu', designation: 'Professor & Dean', dept: 'BBA', courseLoad: 2, status: 'Active' },
];

const initialRoutineSlots = [
  { id: 1, day: 'Sunday', time: '09:00 AM - 10:30 AM', course: 'CSE-301: Database Systems', teacher: 'Dr. Asaduzzaman', room: 'Lab-402', batch: 'Batch 2022 Sec A', conflict: false },
  { id: 2, day: 'Sunday', time: '10:45 AM - 12:15 PM', course: 'CSE-315: Artificial Intelligence', teacher: 'Prof. Dr. Mahbubur Rahman', room: 'Room-501', batch: 'Batch 2022 Sec A', conflict: false },
  { id: 3, day: 'Sunday', time: '01:00 PM - 02:30 PM', course: 'EEE-211: Signals & Systems', teacher: 'Dr. Farhana Ahmed', room: 'Room-302', batch: 'Batch 2023 Sec B', conflict: false },
  { id: 4, day: 'Sunday', time: '02:45 PM - 04:15 PM', course: 'BBA-205: Financial Accounting', teacher: 'Prof. Tariqul Islam', room: 'Room-204', batch: 'Batch 2024 Sec A', conflict: false },
  { id: 5, day: 'Monday', time: '09:00 AM - 10:30 AM', course: 'CSE-302: Operating Systems', teacher: 'Engr. Tanvir Hasan', room: 'Lab-401', batch: 'Batch 2022 Sec B', conflict: false },
  { id: 6, day: 'Monday', time: '10:45 AM - 12:15 PM', course: 'CSE-301: Database Systems', teacher: 'Dr. Asaduzzaman', room: 'Lab-401', batch: 'Batch 2023 Sec A', conflict: true },
];

const initialExamSessions = [
  { id: 1, name: 'Spring 2026 Midterm Examination', type: 'Midterm', startDate: '2026-04-10', endDate: '2026-04-22', isLocked: false, submittedPapers: 42, totalExpected: 42 },
  { id: 2, name: 'Spring 2026 Continuous Assessment Quiz II', type: 'Quiz', startDate: '2026-03-28', endDate: '2026-04-02', isLocked: true, submittedPapers: 86, totalExpected: 86 },
  { id: 3, name: 'Fall 2025 Semester Final Examination', type: 'Final', startDate: '2025-12-15', endDate: '2026-01-05', isLocked: true, submittedPapers: 110, totalExpected: 110 },
];

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

const initialTabulationMarks = [
  { studentId: 'STU-2022-001', studentName: 'Tanvir Hossain', quiz: 19, mid: 28, final: 46, total: 93, grade: 'A+', gpa: 4.00 },
  { studentId: 'STU-2022-045', studentName: 'Nusrat Jahan', quiz: 18, mid: 26, final: 44, total: 88, grade: 'A+', gpa: 4.00 },
  { studentId: 'STU-2022-089', studentName: 'Sumaiya Akter', quiz: 15, mid: 22, final: 39, total: 76, grade: 'A', gpa: 3.75 },
  { studentId: 'STU-2023-102', studentName: 'Arif Mahmud', quiz: 14, mid: 20, final: 36, total: 70, grade: 'A-', gpa: 3.50 },
];

const initialNotices = [
  {
    id: 1,
    title: 'Spring 2026 Midterm Examination Schedule Revised',
    category: 'Exam',
    audience: 'All Students & Teachers',
    priority: 'Urgent',
    pinned: true,
    author: 'Office of the Exam Controller',
    date: 'Sep 24, 2026',
    content: 'Due to national holiday announcements, all midterm exams originally scheduled for April 12 have been shifted to April 24. Updated admit cards are accessible in student portals.',
    attachment: 'Revised_Midterm_Routine_2026.pdf'
  },
  {
    id: 2,
    title: 'Faculty Senate Meeting: AI Assessment Curriculum Review',
    category: 'Academic',
    audience: 'Teachers Only',
    priority: 'High',
    pinned: true,
    author: 'Academic Council',
    date: 'Sep 22, 2026',
    content: 'All departmental HoDs and course instructors are requested to attend the senate review regarding QGenix AI question moderation quotas on Thursday at 3:00 PM.',
    attachment: null
  },
];

const initialAuditLogs = [
  { id: 'LOG-7721', user: 'System Initializer', action: 'Console Bootstrapped', category: 'System', target: 'Core State Initialized', ipAddress: '127.0.0.1', timestamp: '2026-09-24 10:00 AM', status: 'Success' }
];

export function AdminDataProvider({ children }) {
  // Helper to read from LocalStorage with fallback
  const loadState = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`qgenix_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.error(`Failed to load ${key} from localStorage`, e);
      return fallback;
    }
  };

  // State declarations
  const [departments, setDepartments] = useState(() => loadState('departments', initialDepartments));
  const [batches, setBatches] = useState(() => {
    const loaded = loadState('batches', initialBatches);
    return Array.isArray(loaded) ? loaded.map(b => ({
      ...b,
      dept: b.dept || b.department || 'CSE',
      sections: Array.isArray(b.sections) ? b.sections : (typeof b.sections === 'string' && b.sections.trim() ? b.sections.split(',').map(s => s.trim()) : ['A', 'B'])
    })) : initialBatches;
  });
  const [courses, setCourses] = useState(() => loadState('courses', initialCourses));
  const [allocations, setAllocations] = useState(() => loadState('allocations', initialAllocations));
  const [students, setStudents] = useState(() => loadState('students', initialStudents));
  const [faculty, setFaculty] = useState(() => loadState('faculty', initialFaculty));
  const [routineSlots, setRoutineSlots] = useState(() => loadState('routineSlots', initialRoutineSlots));
  const [examSessions, setExamSessions] = useState(() => loadState('examSessions', initialExamSessions));
  const [gradingScale, setGradingScale] = useState(() => loadState('gradingScale', initialGradingScale));
  const [tabulationMarks, setTabulationMarks] = useState(() => loadState('tabulationMarks', initialTabulationMarks));
  const [notices, setNotices] = useState(() => loadState('notices', initialNotices));
  const [auditLogs, setAuditLogs] = useState(() => loadState('auditLogs', initialAuditLogs));
  const [stats, setStats] = useState(null);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Live Sync with Django SQLite Database
  const refreshFromDB = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/dashboard-stats/');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setIsDbConnected(true);
        if (Array.isArray(data.students)) setStudents(data.students);
        if (Array.isArray(data.faculty)) setFaculty(data.faculty);
        if (Array.isArray(data.courses) && data.courses.length > 0) setCourses(data.courses);
        if (Array.isArray(data.departments) && data.departments.length > 0) setDepartments(data.departments);
        if (Array.isArray(data.batches) && data.batches.length > 0) {
          setBatches(data.batches.map(b => ({
            ...b,
            dept: b.dept || b.department || 'CSE',
            sections: Array.isArray(b.sections) ? b.sections : (typeof b.sections === 'string' && b.sections.trim() ? b.sections.split(',').map(s => s.trim()) : ['A', 'B'])
          })));
        }
        if (Array.isArray(data.exam_sessions_list) && data.exam_sessions_list.length > 0) setExamSessions(data.exam_sessions_list);
        if (Array.isArray(data.notices) && data.notices.length > 0) setNotices(data.notices);
        if (Array.isArray(data.audit_logs) && data.audit_logs.length > 0) setAuditLogs(data.audit_logs);
      }
    } catch (err) {
      console.warn('Django Backend DB not reachable, fallback to cache:', err.message);
      setIsDbConnected(false);
    }
  };

  useEffect(() => {
    refreshFromDB();
    const interval = setInterval(refreshFromDB, 6000);
    return () => clearInterval(interval);
  }, []);

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('qgenix_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('qgenix_batches', JSON.stringify(batches)); }, [batches]);
  useEffect(() => { localStorage.setItem('qgenix_courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('qgenix_allocations', JSON.stringify(allocations)); }, [allocations]);
  useEffect(() => { localStorage.setItem('qgenix_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('qgenix_faculty', JSON.stringify(faculty)); }, [faculty]);
  useEffect(() => { localStorage.setItem('qgenix_routineSlots', JSON.stringify(routineSlots)); }, [routineSlots]);
  useEffect(() => { localStorage.setItem('qgenix_examSessions', JSON.stringify(examSessions)); }, [examSessions]);
  useEffect(() => { localStorage.setItem('qgenix_gradingScale', JSON.stringify(gradingScale)); }, [gradingScale]);
  useEffect(() => { localStorage.setItem('qgenix_tabulationMarks', JSON.stringify(tabulationMarks)); }, [tabulationMarks]);
  useEffect(() => { localStorage.setItem('qgenix_notices', JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem('qgenix_auditLogs', JSON.stringify(auditLogs)); }, [auditLogs]);

  // Log action automatically (অটোমেটেড অডিট ট্রেইল তৈরি)
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
      await fetch('http://localhost:8000/api/auth/departments/', {
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
      await fetch(`http://localhost:8000/api/auth/departments/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error deleting department from DB:', e);
    }
  };

  // Add Course
  const addCourse = async (course) => {
    const newCourse = { id: Date.now(), ...course };
    setCourses(prev => [...prev, newCourse]);
    addAuditLog('Course Catalog Added', 'Academic', `${course.code}: ${course.title}`);

    try {
      await fetch('http://localhost:8000/api/auth/courses/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving course to DB:', e);
    }
  };

  // Edit Course
  const editCourse = (id, updatedFields) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    addAuditLog('Course Catalog Updated', 'Academic', `Course ID: ${id}`);
  };

  // Delete Course
  const deleteCourse = async (id) => {
    setCourses(prev => prev.filter(c => c.id !== id && c.code !== id));
    addAuditLog('Course Catalog Removed', 'Academic', `Course ID: ${id}`);

    try {
      await fetch(`http://localhost:8000/api/auth/courses/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error deleting course from DB:', e);
    }
  };

  // Add Batch
  const addBatch = (batch) => {
    const newBatch = { id: Date.now(), ...batch };
    setBatches(prev => [...prev, newBatch]);
    addAuditLog('Academic Batch Created', 'Academic', `${batch.name} (${batch.dept})`);
  };

  // Edit Batch
  const editBatch = (id, updatedFields) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    addAuditLog('Academic Batch Modified', 'Academic', `Batch ID: ${id}`);
  };

  // Allocate Course (Assign Teacher)
  const addAllocation = (alloc) => {
    const newAlloc = { id: Date.now(), ...alloc };
    setAllocations(prev => [...prev, newAlloc]);
    addAuditLog('Course Allocated', 'Faculty', `${alloc.courseName} -> ${alloc.teacher}`);
  };

  // Edit Allocation (Reassign Teacher)
  const editAllocation = (id, updatedFields) => {
    setAllocations(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    addAuditLog('Course Reassigned', 'Faculty', `Allocation ID: ${id}`);
  };

  // Remove Allocation
  const deleteAllocation = (id) => {
    setAllocations(prev => prev.filter(a => a.id !== id));
    addAuditLog('Course Allocation Removed', 'Faculty', `Allocation ID: ${id}`);
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
      await fetch('http://localhost:8000/api/auth/users/', {
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
          cgpa: newStudent.cgpa || '3.75'
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving student to DB:', e);
    }
  };

  // Edit Student
  const editStudent = async (id, updatedFields) => {
    setStudents(prev => prev.map(s => (s.id === id || s.db_id === id) ? { ...s, ...updatedFields } : s));
    addAuditLog('Student Profile Modified', 'User Management', `${id}`);

    try {
      await fetch(`http://localhost:8000/api/auth/users/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error updating student in DB:', e);
    }
  };

  // Publish Semester Result and dynamically re-calculate student CGPA
  const publishSemesterResult = async (payload) => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/publish-semester-result/', {
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

  // Delete Student (Deleted directly from Django SQLite Database)
  const deleteStudent = async (id) => {
    setStudents(prev => prev.filter(s => s.id !== id && s.db_id !== id));
    addAuditLog('Student Account Removed', 'User Management', `${id}`);

    try {
      await fetch(`http://localhost:8000/api/auth/users/${id}/`, {
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
    const newFac = { ...fac, status: fac.status || 'Active' };
    setFaculty(prev => [newFac, ...prev]);
    addAuditLog('Faculty Appointed', 'User Management', `${fac.id} - ${fac.name}`);

    try {
      await fetch('http://localhost:8000/api/auth/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'TEACHER',
          name: fac.name,
          email: fac.email,
          dept: fac.dept,
          designation: fac.designation || 'Assistant Professor',
          id: fac.id
        })
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error saving faculty to DB:', e);
    }
  };

  // Edit Faculty
  const editFaculty = (id, updatedFields) => {
    setFaculty(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));
    addAuditLog('Faculty Profile Modified', 'User Management', `${id}`);
  };

  // Delete Faculty (Deleted directly from Django SQLite Database)
  const deleteFaculty = async (id) => {
    setFaculty(prev => prev.filter(f => f.id !== id && f.db_id !== id));
    addAuditLog('Faculty Record Deleted', 'User Management', `${id}`);

    try {
      await fetch(`http://localhost:8000/api/auth/users/${id}/`, {
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
      if (slot.day === newSlot.day && slot.time === newSlot.time) {
        if (slot.room.toLowerCase().trim() === newSlot.room.toLowerCase().trim()) {
          return { hasConflict: true, reason: `Room Clash: ${slot.room} is already booked for ${slot.course} (${slot.teacher})` };
        }
        if (slot.teacher.toLowerCase().trim() === newSlot.teacher.toLowerCase().trim()) {
          return { hasConflict: true, reason: `Instructor Clash: ${slot.teacher} already has a lecture in ${slot.room} at this time!` };
        }
      }
    }
    return { hasConflict: false, reason: '' };
  };

  // Add Routine Slot
  const addRoutineSlot = (slot) => {
    const clash = checkRoutineClash(slot);
    const newSlot = { id: Date.now(), conflict: clash.hasConflict, ...slot };
    setRoutineSlots(prev => [...prev, newSlot]);
    addAuditLog(`Routine Slot Added ${clash.hasConflict ? '(CONFLICT FLAGGED)' : ''}`, 'Routine', `${slot.course} in ${slot.room}`);
    return clash;
  };

  // Delete Routine Slot
  const deleteRoutineSlot = (id) => {
    setRoutineSlots(prev => prev.filter(s => s.id !== id));
    addAuditLog('Routine Slot Removed', 'Routine', `Slot ID: ${id}`);
  };

  // ==================== 5. NOTICES ====================
  const addNotice = async (notice) => {
    const newNotice = { id: Date.now(), date: 'Just now', ...notice };
    setNotices(prev => [newNotice, ...prev]);
    addAuditLog('Notice Broadcasted', 'Notice Board', notice.title);

    try {
      await fetch('http://localhost:8000/api/auth/notices/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notice)
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
      await fetch(`http://localhost:8000/api/auth/notices/${id}/`, {
        method: 'DELETE'
      });
      await refreshFromDB();
    } catch (e) {
      console.warn('Error deleting notice from DB:', e);
    }
  };

  const togglePinNotice = (id) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
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
      examSessions,
      gradingScale,
      tabulationMarks,
      notices,
      auditLogs,

      // Operations
      addDepartment,
      editDepartment,
      deleteDepartment,
      addCourse,
      editCourse,
      deleteCourse,
      addBatch,
      editBatch,
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
      deleteRoutineSlot,

      addNotice,
      deleteNotice,
      togglePinNotice,
      addAuditLog,

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

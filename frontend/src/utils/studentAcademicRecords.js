// =========================================================================================
// studentAcademicRecords.js — High-Fidelity Academic Dossier Generator for QGenix
// -----------------------------------------------------------------------------------------
// Provides complete semester-wise attendance records, exam results (Midterm, Final, Quizzes),
// course performance, GPA calculations, and personal/institutional profile data for any student.
// =========================================================================================

const DEPARTMENT_COURSES = {
  CSE: [
    // 1st Sem
    [
      { code: 'CSE-101', title: 'Introduction to Computer Systems', credits: 3.0, instructor: 'Dr. Asaduzzaman Chowdhury' },
      { code: 'ENG-101', title: 'English Language & Professional Communication', credits: 3.0, instructor: 'Dr. Shaila Parveen' },
      { code: 'MATH-101', title: 'Differential & Integral Calculus', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'PHY-101', title: 'Engineering Physics & Electromagnetism', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'PHY-102', title: 'Physics Laboratory', credits: 1.5, instructor: 'Dr. Farhana Ahmed' },
    ],
    // 2nd Sem
    [
      { code: 'CSE-105', title: 'Structured Programming Language (C)', credits: 3.0, instructor: 'Engr. Tanvir Hasan' },
      { code: 'CSE-106', title: 'Structured Programming Laboratory', credits: 1.5, instructor: 'Engr. Tanvir Hasan' },
      { code: 'MATH-103', title: 'Linear Algebra & Coordinate Geometry', credits: 3.0, instructor: 'Dr. Nazmul Huda' },
      { code: 'CHEM-101', title: 'General Chemistry & Material Science', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'HUM-101', title: 'Sociology & Professional Ethics', credits: 2.0, instructor: 'Dr. Shaila Parveen' },
    ],
    // 3rd Sem
    [
      { code: 'CSE-201', title: 'Data Structures & Algorithms I', credits: 3.0, instructor: 'Prof. Dr. Mahbubur Rahman' },
      { code: 'CSE-202', title: 'Data Structures Laboratory', credits: 1.5, instructor: 'Prof. Dr. Mahbubur Rahman' },
      { code: 'CSE-203', title: 'Discrete Mathematics & Graph Theory', credits: 3.0, instructor: 'Dr. Asaduzzaman Chowdhury' },
      { code: 'EEE-201', title: 'Basic Electrical & Electronic Circuits', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-202', title: 'Electrical Circuits Laboratory', credits: 1.5, instructor: 'Dr. Farhana Ahmed' },
    ],
    // 4th Sem
    [
      { code: 'CSE-205', title: 'Object Oriented Programming (Java/C++)', credits: 3.0, instructor: 'Engr. Tanvir Hasan' },
      { code: 'CSE-206', title: 'Object Oriented Programming Laboratory', credits: 1.5, instructor: 'Engr. Tanvir Hasan' },
      { code: 'CSE-207', title: 'Digital Logic Design & Finite Automata', credits: 3.0, instructor: 'Dr. Asaduzzaman Chowdhury' },
      { code: 'CSE-208', title: 'Digital Logic Design Laboratory', credits: 1.5, instructor: 'Dr. Asaduzzaman Chowdhury' },
      { code: 'MATH-205', title: 'Numerical Analysis & Statistics', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
    ],
    // 5th Sem
    [
      { code: 'CSE-301', title: 'Database Management Systems (DBMS)', credits: 3.0, instructor: 'Prof. Dr. Mahbubur Rahman' },
      { code: 'CSE-302', title: 'Database Systems Laboratory', credits: 1.5, instructor: 'Prof. Dr. Mahbubur Rahman' },
      { code: 'CSE-303', title: 'Theory of Computation & Formal Languages', credits: 3.0, instructor: 'Dr. Asaduzzaman Chowdhury' },
      { code: 'CSE-304', title: 'Software Engineering & System Analysis', credits: 3.0, instructor: 'Engr. Tanvir Hasan' },
      { code: 'CSE-305', title: 'Microprocessors & Embedded Systems', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
    ],
    // 6th Sem
    [
      { code: 'CSE-307', title: 'Design & Analysis of Algorithms', credits: 3.0, instructor: 'Prof. Dr. Mahbubur Rahman' },
      { code: 'CSE-308', title: 'Algorithms Design Laboratory', credits: 1.5, instructor: 'Prof. Dr. Mahbubur Rahman' },
      { code: 'CSE-309', title: 'Operating Systems & System Programming', credits: 3.0, instructor: 'Engr. Tanvir Hasan' },
      { code: 'CSE-310', title: 'Operating Systems Laboratory', credits: 1.5, instructor: 'Engr. Tanvir Hasan' },
      { code: 'CSE-315', title: 'Artificial Intelligence & Neural Networks', credits: 3.0, instructor: 'Prof. Dr. Mahbubur Rahman' },
    ],
    // 7th Sem
    [
      { code: 'CSE-401', title: 'Computer Networks & Internet Protocols', credits: 3.0, instructor: 'Engr. Tanvir Hasan' },
      { code: 'CSE-402', title: 'Computer Networks Laboratory', credits: 1.5, instructor: 'Engr. Tanvir Hasan' },
      { code: 'CSE-403', title: 'Machine Learning & Predictive Modeling', credits: 3.0, instructor: 'Prof. Dr. Mahbubur Rahman' },
      { code: 'CSE-404', title: 'Web Engineering & Cloud Architecture', credits: 3.0, instructor: 'Dr. Asaduzzaman Chowdhury' },
      { code: 'CSE-400A', title: 'Senior Capstone Project / Thesis Phase I', credits: 2.0, instructor: 'Prof. Dr. Mahbubur Rahman' },
    ],
    // 8th Sem
    [
      { code: 'CSE-400B', title: 'Senior Capstone Project / Thesis Defense', credits: 4.0, instructor: 'Prof. Dr. Mahbubur Rahman' },
      { code: 'CSE-405', title: 'Cyber Security, Cryptography & Privacy', credits: 3.0, instructor: 'Dr. Asaduzzaman Chowdhury' },
      { code: 'CSE-407', title: 'Distributed Systems & Blockchain', credits: 3.0, instructor: 'Engr. Tanvir Hasan' },
      { code: 'MGT-401', title: 'Technology Entrepreneurship & Management', credits: 2.0, instructor: 'Prof. Tariqul Islam' },
    ]
  ],
  EEE: [
    [
      { code: 'EEE-101', title: 'Electrical Circuits I', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'MATH-101', title: 'Calculus & Analytical Geometry', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'PHY-101', title: 'Physics I', credits: 3.0, instructor: 'Dr. Nazmul Huda' },
      { code: 'ENG-101', title: 'English Composition', credits: 3.0, instructor: 'Dr. Shaila Parveen' },
    ],
    [
      { code: 'EEE-103', title: 'Electrical Circuits II', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-104', title: 'Circuits II Laboratory', credits: 1.5, instructor: 'Dr. Farhana Ahmed' },
      { code: 'MATH-103', title: 'Ordinary Differential Equations', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'CHEM-101', title: 'Chemistry', credits: 3.0, instructor: 'Dr. Nazmul Huda' },
    ],
    [
      { code: 'EEE-201', title: 'Electronics I', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-202', title: 'Electronics I Laboratory', credits: 1.5, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-203', title: 'Signals and Linear Systems', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'MATH-201', title: 'Complex Variables & Laplace Transform', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
    ],
    [
      { code: 'EEE-205', title: 'Electronics II', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-207', title: 'Electrical Machines I', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-208', title: 'Electrical Machines Laboratory', credits: 1.5, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-211', title: 'Electromagnetic Fields and Waves', credits: 3.0, instructor: 'Dr. Nazmul Huda' },
    ],
    [
      { code: 'EEE-301', title: 'Power Systems I', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-303', title: 'Digital Electronics & Microprocessors', credits: 3.0, instructor: 'Engr. Tanvir Hasan' },
      { code: 'EEE-305', title: 'Control Systems Engineering', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
    ],
    [
      { code: 'EEE-307', title: 'Power Systems II', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-309', title: 'Telecommunication Engineering', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-311', title: 'Power Electronics', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
    ],
    [
      { code: 'EEE-401', title: 'VLSI Design & Fabrication', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-403', title: 'Renewable Energy Systems', credits: 3.0, instructor: 'Dr. Nazmul Huda' },
      { code: 'EEE-400A', title: 'Capstone Project Phase I', credits: 2.0, instructor: 'Dr. Farhana Ahmed' },
    ],
    [
      { code: 'EEE-400B', title: 'Capstone Project Final Defense', credits: 4.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-405', title: 'High Voltage Engineering', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
      { code: 'EEE-407', title: 'Biomedical Instrumentation', credits: 3.0, instructor: 'Dr. Farhana Ahmed' },
    ]
  ],
  BBA: [
    [
      { code: 'BBA-101', title: 'Principles of Management', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-102', title: 'Financial Accounting I', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'ENG-101', title: 'Business Communication', credits: 3.0, instructor: 'Dr. Shaila Parveen' },
      { code: 'MATH-101', title: 'Business Mathematics', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
    ],
    [
      { code: 'BBA-105', title: 'Microeconomics', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-106', title: 'Financial Accounting II', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-107', title: 'Principles of Marketing', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'STAT-101', title: 'Business Statistics', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
    ],
    [
      { code: 'BBA-201', title: 'Macroeconomics', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-202', title: 'Principles of Finance', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-203', title: 'Organizational Behavior', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-204', title: 'Business Law & Ethics', credits: 3.0, instructor: 'Dr. Shaila Parveen' },
    ],
    [
      { code: 'BBA-205', title: 'Financial Accounting & Reporting', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-206', title: 'Managerial Accounting', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-207', title: 'Operations Management', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-208', title: 'Marketing Management', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
    ],
    [
      { code: 'BBA-301', title: 'Corporate Finance', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-302', title: 'International Business', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-303', title: 'Management Information Systems', credits: 3.0, instructor: 'Engr. Tanvir Hasan' },
    ],
    [
      { code: 'BBA-305', title: 'Financial Markets & Institutions', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-306', title: 'Strategic Management', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-307', title: 'Supply Chain Management', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
    ],
    [
      { code: 'BBA-401', title: 'Business Ethics & CSR', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-402', title: 'Investment Analysis & Portfolio Management', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-400A', title: 'Research Methodology & Project', credits: 2.0, instructor: 'Prof. Tariqul Islam' },
    ],
    [
      { code: 'BBA-400B', title: 'Internship & Defense', credits: 4.0, instructor: 'Prof. Tariqul Islam' },
      { code: 'BBA-405', title: 'Global Trade & Export Finance', credits: 3.0, instructor: 'Prof. Tariqul Islam' },
    ]
  ]
};

// Simple pseudo-random hash generator for deterministic realistic scores
function getHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Convert 0-100 score to Grade & Grade Point
function scoreToGrade(score) {
  if (score >= 80) return { grade: 'A+', gpa: 4.00, remarks: 'Outstanding' };
  if (score >= 75) return { grade: 'A', gpa: 3.75, remarks: 'Excellent' };
  if (score >= 70) return { grade: 'A-', gpa: 3.50, remarks: 'Very Good' };
  if (score >= 65) return { grade: 'B+', gpa: 3.25, remarks: 'Good' };
  if (score >= 60) return { grade: 'B', gpa: 3.00, remarks: 'Satisfactory' };
  if (score >= 55) return { grade: 'B-', gpa: 2.75, remarks: 'Above Average' };
  if (score >= 50) return { grade: 'C+', gpa: 2.50, remarks: 'Average' };
  if (score >= 40) return { grade: 'D', gpa: 2.00, remarks: 'Pass' };
  return { grade: 'F', gpa: 0.00, remarks: 'Fail' };
}

export function getStudentDetailedRecord(student) {
  if (!student) return null;

  const idStr = String(student.id || '210108');
  const hashSeed = getHash(idStr + (student.name || 'Student'));
  const baseCgpa = parseFloat(student.cgpa) || 3.75;
  const deptKey = (student.dept || 'CSE').toUpperCase();
  const departmentCatalog = DEPARTMENT_COURSES[deptKey] || DEPARTMENT_COURSES['CSE'];
  const batchStr = student.batch || 'Batch 2021';

  // Determine current active semester
  let activeSemesterIndex = 5; // 6th Semester default
  if (batchStr.includes('2024') || batchStr.includes('2025')) activeSemesterIndex = 1; // 2nd Sem
  else if (batchStr.includes('2023')) activeSemesterIndex = 3; // 4th Sem
  else if (batchStr.includes('2022')) activeSemesterIndex = 5; // 6th Sem
  else if (batchStr.includes('2021') || batchStr.includes('2020')) activeSemesterIndex = 7; // 8th Sem

  const semesterNames = [
    '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
    '5th Semester', '6th Semester', '7th Semester', '8th Semester'
  ];

  const terms = [
    'Spring 2023', 'Fall 2023', 'Spring 2024', 'Fall 2024',
    'Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026'
  ];

  const advisors = {
    CSE: 'Prof. Dr. Mahbubur Rahman (Head of CSE)',
    EEE: 'Dr. Farhana Ahmed (Associate Professor, EEE)',
    BBA: 'Prof. Tariqul Islam (Dean of Business Studies)',
    CE: 'Dr. Nazmul Huda (Head of Civil Engineering)'
  };

  const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'O-', 'A-'];
  const bloodGroup = bloodGroups[hashSeed % bloodGroups.length];
  const phone = `+880 17${String(hashSeed % 8999999 + 1000000).padStart(7, '0')}`;
  const guardianPhone = `+880 18${String((hashSeed * 3) % 8999999 + 1000000).padStart(7, '0')}`;
  const guardianName = `Md. ${((student.name || '').split(' ').slice(-1)[0]) || 'Hasan'} Chowdhury`;

  // Build 8 Semesters
  const semesters = semesterNames.map((semName, semIdx) => {
    const rawCourseList = departmentCatalog[semIdx] || departmentCatalog[0];
    const isCompleted = semIdx <= activeSemesterIndex;
    const isCurrent = semIdx === activeSemesterIndex;

    // Course records for this semester
    let semTotalPoints = 0;
    let semTotalCredits = 0;
    let semTotalHeld = 0;
    let semTotalAttended = 0;

    const coursesWithDetails = rawCourseList.map((c, cIdx) => {
      // Deterministic variations based on student's base CGPA
      const courseHash = getHash(idStr + semName + c.code);
      const scoreVariance = (courseHash % 15) - 7; // -7 to +7
      
      // Calculate realistic score out of 100 based on CGPA target
      // CGPA 4.0 ~ 85-95, 3.75 ~ 80-88, 3.5 ~ 74-82, 3.0 ~ 62-72
      let targetScore = Math.round(55 + (baseCgpa / 4.0) * 35 + scoreVariance);
      if (targetScore > 98) targetScore = 98;
      if (targetScore < 50) targetScore = 52;

      // Split into Midterm (40), CA/Quiz (20), Final (40)
      const mid = Math.round((targetScore / 100) * 40 + ((courseHash % 5) - 2));
      const quiz = Math.round((targetScore / 100) * 20 + ((courseHash % 3) - 1));
      const finalExam = Math.max(0, targetScore - mid - quiz);
      const computedTotal = mid + quiz + finalExam;
      const gradeInfo = scoreToGrade(computedTotal);

      // Attendance for this course: between 80% and 97%
      const classesHeld = 28 + (courseHash % 6); // 28 - 33
      const attRate = 0.82 + ((courseHash % 16) / 100); // 82% to 97%
      const classesAttended = Math.min(classesHeld, Math.max(Math.round(classesHeld * attRate), 22));
      const classesAbsent = classesHeld - classesAttended;
      const attendancePct = parseFloat(((classesAttended / classesHeld) * 100).toFixed(1));

      semTotalHeld += classesHeld;
      semTotalAttended += classesAttended;
      semTotalCredits += c.credits;
      semTotalPoints += gradeInfo.gpa * c.credits;

      return {
        code: c.code,
        title: c.title,
        credits: c.credits,
        instructor: c.instructor,
        // Attendance
        classesHeld,
        classesAttended,
        classesAbsent,
        attendancePct,
        attendanceStatus: attendancePct >= 85 ? 'Excellent' : attendancePct >= 75 ? 'Regular' : 'Shortfall Warning',
        // Exams Breakdown
        midtermMarks: Math.min(40, Math.max(18, mid)),
        quizMarks: Math.min(20, Math.max(10, quiz)),
        finalMarks: Math.min(40, Math.max(18, finalExam)),
        totalMarks: computedTotal,
        grade: gradeInfo.grade,
        gpa: gradeInfo.gpa,
        remarks: gradeInfo.remarks,
        passStatus: computedTotal >= 40 ? 'Passed' : 'Referred'
      };
    });

    const semSgpa = semTotalCredits > 0 ? parseFloat((semTotalPoints / semTotalCredits).toFixed(2)) : baseCgpa;
    const overallAttPct = semTotalHeld > 0 ? parseFloat(((semTotalAttended / semTotalHeld) * 100).toFixed(1)) : 88.5;

    return {
      index: semIdx + 1,
      name: semName,
      term: terms[semIdx] || `Semester ${semIdx + 1}`,
      isCompleted,
      isCurrent,
      totalCredits: semTotalCredits,
      sgpa: isCompleted ? semSgpa : 'Enrolled',
      // Semester Attendance summary
      attendance: {
        totalHeld: semTotalHeld,
        totalAttended: semTotalAttended,
        totalAbsent: semTotalHeld - semTotalAttended,
        percentage: overallAttPct,
        isEligible: overallAttPct >= 75.0,
        statusText: overallAttPct >= 75.0 
          ? 'Eligible for Exams (Admit Card Cleared)' 
          : 'Attendance Shortfall Alert (<75%)'
      },
      courses: coursesWithDetails
    };
  });

  // Calculate cumulative stats up to active semester
  const completedSemesters = semesters.filter(s => s.isCompleted);
  const totalCompletedCredits = completedSemesters.reduce((acc, s) => acc + s.totalCredits, 0);
  const totalClassesAttended = completedSemesters.reduce((acc, s) => acc + s.attendance.totalAttended, 0);
  const totalClassesHeld = completedSemesters.reduce((acc, s) => acc + s.attendance.totalHeld, 0);
  const cumulativeAttendance = totalClassesHeld > 0 
    ? parseFloat(((totalClassesAttended / totalClassesHeld) * 100).toFixed(1))
    : 89.4;

  return {
    studentId: student.id,
    name: student.name,
    email: student.email,
    profile_picture: student.profile_picture || '',
    dept: deptKey,
    departmentFullName: deptKey === 'CSE' ? 'Computer Science & Engineering' 
      : deptKey === 'EEE' ? 'Electrical & Electronic Engineering'
      : deptKey === 'BBA' ? 'Bachelor of Business Administration'
      : 'Civil Engineering',
    batch: batchStr,
    cgpa: baseCgpa.toFixed(2),
    status: student.status || 'Active',
    // Academic Credentials
    registrationNo: `DIIT-REG-${batchStr.replace(/\D/g, '').slice(-4) || '2021'}-${student.id.replace(/\D/g, '').slice(-4) || '101'}`,
    advisor: advisors[deptKey] || advisors['CSE'],
    standing: baseCgpa >= 3.75 ? "First Class with Distinction (Honors)" : baseCgpa >= 3.0 ? "Good Academic Standing" : "Satisfactory",
    totalCompletedCredits,
    cumulativeAttendance,
    activeSemesterIndex,
    activeSemesterName: semesterNames[activeSemesterIndex],
    // Institutional Statuses
    feesStatus: '100% Cleared (Accounts Verified)',
    libraryDues: '0 BDT (No Pending Books)',
    hallClearance: 'Not Applicable / Day Scholar',
    admitCardStatus: cumulativeAttendance >= 75 ? 'Admit Card Generated & Valid' : 'Conditional Clearance',
    // Personal & Guardian
    bloodGroup,
    phone,
    guardianName,
    guardianPhone,
    address: 'Sector 4, Road 12, Uttara Model Town, Dhaka - 1230',
    semesters
  };
}

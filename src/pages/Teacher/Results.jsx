// ============================================================================
// Results.jsx — QGenix Teacher Results & Grade Sheets Manager
// ============================================================================
// Features:
//   1. Performance Stats: Class Pass Rate, Grade sheets count, Average CGPA.
//   2. Filtering Roster: Search, Semester filter, Batch filter, Subject filter.
//   3. Student Results Grid: Scrollable table displaying candidates scores and grades.
//   4. Batch Results Publisher: Form layout allowing the teacher to select a course,
//      batch, and semester, and enter obtained marks for each student in a roster
//      list, saving results dynamically to localStorage.
//   5. Live Sync: Saved records are synced under 'qgenix_student_results' for students.
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষকের রেজাল্ট ম্যানেজার পোর্টাল। শিক্ষক ব্যাচ এবং সেমিস্টার ফিল্টার করে
// শিক্ষার্থীদের ফলাফল দেখতে এবং নতুন রেজাল্ট ইনপুট দিয়ে তা প্রকাশ করতে পারবেন। প্রকাশিত
// ফলাফল শিক্ষার্থীরা তাদের নিজ প্রোফাইল থেকে দেখতে পাবে।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, BookOpen, Calendar, Clock, Download, FileText, 
  Search, SlidersHorizontal, ArrowUpDown, Users, Check, X, 
  ShieldAlert, Trophy, Percent, Activity, Eye, ArrowRight, 
  Sparkles, PlusCircle, CheckCircle2, RefreshCw, Send, Edit3
} from 'lucide-react';
import Card from '../../components/Card';

// ----------------------------------------------------------------------------
// 1. MOCK DATA: STUDENT LIST FOR ROSTER INPUT
// ----------------------------------------------------------------------------
const mockStudentsList = [
  { id: 'UG02-112', name: 'Rafayel Ahmed', semester: '5th Semester', batch: 'Batch 21' },
  { id: 'UG02-145', name: 'Noshin Tasnim', semester: '5th Semester', batch: 'Batch 21' },
  { id: 'UG02-098', name: 'Sajjad Karim', semester: '5th Semester', batch: 'Batch 21' },
  { id: 'UG02-210', name: 'Maria Sultana', semester: '5th Semester', batch: 'Batch 21' },
  { id: 'UG02-005', name: 'Sadia Rahman', semester: '6th Semester', batch: 'Batch 20' },
  { id: 'UG02-119', name: 'Mahmudul Hasan', semester: '6th Semester', batch: 'Batch 20' },
  { id: 'UG02-132', name: 'Rafiul Islam', semester: '5th Semester', batch: 'Batch 21' },
  { id: 'UG02-167', name: 'Alice Johnson', semester: '4th Semester', batch: 'Batch 22' },
  { id: 'UG02-188', name: 'Bob Smith', semester: '4th Semester', batch: 'Batch 22' },
  { id: 'UG02-192', name: 'Charlie Brown', semester: '4th Semester', batch: 'Batch 22' }
];

const courseDetailsMap = {
  'CSE-301': 'Advanced Data Structures & Algorithms',
  'CSE-302': 'Database Management Systems',
  'CSE-303': 'Computer Networks & Protocol Design',
  'CSE-304': 'Software Engineering & DevOps',
  'CSE-312': 'Artificial Intelligence & Neural Nets',
  'CSE-201': 'Object Oriented Programming'
};

// Initial student results for table view (if localStorage is empty)
const initialGlobalResults = [
  { id: 101, studentId: 'UG02-112', studentName: 'Rafayel Ahmed', examName: 'Midterm Assessment', code: 'CSE-301', score: '45/50', percentage: 90, grade: 'A+', date: '2026-03-15', semester: '5th Semester', batch: 'Batch 21' },
  { id: 102, studentId: 'UG02-145', studentName: 'Noshin Tasnim', examName: 'Midterm Assessment', code: 'CSE-301', score: '42/50', percentage: 84, grade: 'A', date: '2026-03-15', semester: '5th Semester', batch: 'Batch 21' },
  { id: 103, studentId: 'UG02-098', studentName: 'Sajjad Karim', examName: 'Midterm Assessment', code: 'CSE-301', score: '38/50', percentage: 76, grade: 'B', date: '2026-03-15', semester: '5th Semester', batch: 'Batch 21' },
  { id: 104, studentId: 'UG02-112', studentName: 'Rafayel Ahmed', examName: 'Final Semester Exam', code: 'CSE-302', score: '82/100', percentage: 82, grade: 'A', date: '2026-05-18', semester: '5th Semester', batch: 'Batch 21' },
  { id: 105, studentId: 'UG02-145', studentName: 'Noshin Tasnim', examName: 'Final Semester Exam', code: 'CSE-302', score: '88/100', percentage: 88, grade: 'A+', date: '2026-05-18', semester: '5th Semester', batch: 'Batch 21' },
  { id: 106, studentId: 'UG02-005', studentName: 'Sadia Rahman', examName: 'Midterm Assessment', code: 'CSE-312', score: '48/50', percentage: 96, grade: 'A+', date: '2026-03-18', semester: '6th Semester', batch: 'Batch 20' },
  { id: 107, studentId: 'UG02-119', studentName: 'Mahmudul Hasan', examName: 'Midterm Assessment', code: 'CSE-312', score: '46/50', percentage: 92, grade: 'A+', date: '2026-03-18', semester: '6th Semester', batch: 'Batch 20' }
];

export default function TeacherResults() {
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Sync state with dynamic localStorage
  const [globalResults, setGlobalResults] = useState(() => {
    const saved = localStorage.getItem('qgenix_teacher_results');
    return saved ? JSON.parse(saved) : initialGlobalResults;
  });

  useEffect(() => {
    localStorage.setItem('qgenix_teacher_results', JSON.stringify(globalResults));
  }, [globalResults]);

  // Tab State: 'roster' | 'publish'
  const [activeTab, setActiveTab] = useState('roster');

  // Selected student for subject wise details modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Group by course code for selected student details
  const studentResultsGrouped = useMemo(() => {
    if (!selectedStudent) return {};
    const studentRecords = globalResults.filter(r => r.studentId === selectedStudent.id);
    
    const groups = {};
    studentRecords.forEach(rec => {
      if (!groups[rec.code]) {
        groups[rec.code] = [];
      }
      groups[rec.code].push(rec);
    });
    return groups;
  }, [selectedStudent, globalResults]);

  // GPA calculation helper
  const getGpaFromPercentage = (pct) => {
    if (pct >= 90) return 4.0;
    if (pct >= 80) return 3.75;
    if (pct >= 70) return 3.00;
    if (pct >= 60) return 2.50;
    if (pct >= 50) return 2.00;
    return 0.0;
  };

  // Student stats calculator
  const studentStats = useMemo(() => {
    if (!selectedStudent) return { avgPct: 0, gpa: '0.00', totalExams: 0 };
    const studentRecords = globalResults.filter(r => r.studentId === selectedStudent.id);
    if (studentRecords.length === 0) return { avgPct: 0, gpa: '0.00', totalExams: 0 };
    
    const totalPct = studentRecords.reduce((acc, curr) => acc + curr.percentage, 0);
    const avgPct = Math.round(totalPct / studentRecords.length);
    
    const totalGpa = studentRecords.reduce((acc, curr) => acc + getGpaFromPercentage(curr.percentage), 0);
    const avgGpa = (totalGpa / studentRecords.length).toFixed(2);
    
    return {
      avgPct,
      gpa: avgGpa,
      totalExams: studentRecords.length
    };
  }, [selectedStudent, globalResults]);

  // Filters for Results Database list
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');

  // Form publisher variables
  const [pubExamName, setPubExamName] = useState('');
  const [pubCourse, setPubCourse] = useState('CSE-301');
  const [pubDate, setPubDate] = useState('');
  const [pubMaxMarks, setPubMaxMarks] = useState(100);
  const [pubSemester, setPubSemester] = useState('5th Semester');
  const [pubBatch, setPubBatch] = useState('Batch 21');
  const [studentMarksInputs, setStudentMarksInputs] = useState({});

  // Simulated indicators
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper: map percentage score to letter grade
  const calculateGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  // Load target student roster matching published filters
  const publishingRoster = useMemo(() => {
    return mockStudentsList.filter(s => s.semester === pubSemester && s.batch === pubBatch);
  }, [pubSemester, pubBatch]);

  // Publish dynamic results roster submit
  const handlePublishResults = (e) => {
    e.preventDefault();
    if (!pubExamName || !pubDate) {
      triggerToast('Please fill out the Exam Name and Date fields.');
      return;
    }

    setIsPublishing(true);
    setPublishProgress(10);

    const interval = setInterval(() => {
      setPublishProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 30;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setPublishProgress(100);

      setTimeout(() => {
        const newResultsToPublish = [];
        const studentExamList = [];

        publishingRoster.forEach(student => {
          const obtainedMarks = Number(studentMarksInputs[student.id]) || 0;
          const pct = Math.round((obtainedMarks / pubMaxMarks) * 100);
          const letterGrade = calculateGrade(pct);

          const resultItem = {
            id: Date.now() + Math.random(),
            studentId: student.id,
            studentName: student.name,
            examName: pubExamName,
            code: pubCourse,
            score: `${obtainedMarks}/${pubMaxMarks}`,
            percentage: pct,
            grade: letterGrade,
            date: pubDate,
            semester: pubSemester,
            batch: pubBatch
          };

          newResultsToPublish.push(resultItem);

          // We also construct an object matching the student results page schema
          const studentResultObject = {
            id: Date.now() + Math.random(),
            name: pubExamName,
            subject: courseDetailsMap[pubCourse] || 'Advanced Studies',
            code: pubCourse,
            date: pubDate,
            score: `${obtainedMarks}/${pubMaxMarks}`,
            percentage: pct,
            grade: letterGrade,
            status: pct >= 50 ? 'Pass' : 'Fail',
            duration: '1h 30m',
            attempt: 1,
            analysis: {
              totalQuestions: 50,
              correct: Math.round(obtainedMarks / pubMaxMarks * 50),
              wrong: Math.round((pubMaxMarks - obtainedMarks) / pubMaxMarks * 50),
              unanswered: 0,
              timeTaken: '1h 10m',
              rank: 'N/A'
            },
            proctoring: {
              faceDetection: 'Optimal (100% Match)',
              tabSwitches: 0,
              multiPerson: 0,
              voiceEvents: 0,
              suspicionScore: 5,
              riskLevel: 'Low Risk'
            },
            insights: {
              strong: 'Overall concepts',
              weak: 'Revision needed',
              suggestions: 'Review standard textbook references and class slides.',
              prediction: 'Good standing projected'
            },
            questions: []
          };
          studentExamList.push(studentResultObject);
        });

        // 1. Update Teacher's results roster state
        setGlobalResults(prev => [...newResultsToPublish, ...prev]);

        // 2. Sync to student's dynamic results page under key 'qgenix_student_results'
        const existingStudentResultsRaw = localStorage.getItem('qgenix_student_results');
        let existingStudentResults = [];
        if (existingStudentResultsRaw) {
          existingStudentResults = JSON.parse(existingStudentResultsRaw);
        }

        // Push newly published results list to the front of student array
        localStorage.setItem('qgenix_student_results', JSON.stringify([...studentExamList, ...existingStudentResults]));

        // Reset inputs
        setPubExamName('');
        setPubDate('');
        setStudentMarksInputs({});

        setIsPublishing(false);
        setActiveTab('roster');
        triggerToast(`Released grade sheets for ${pubExamName} (${pubCourse})`);
      }, 300);

    }, 1200);
  };

  // Filter roster results list
  const filteredResults = useMemo(() => {
    return globalResults.filter(r => {
      const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.examName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSemester = semesterFilter === 'All' || r.semester === semesterFilter;
      const matchesBatch = batchFilter === 'All' || r.batch === batchFilter;
      const matchesCourse = courseFilter === 'All' || r.code === courseFilter;

      return matchesSearch && matchesSemester && matchesBatch && matchesCourse;
    });
  }, [globalResults, searchQuery, semesterFilter, batchFilter, courseFilter]);

  // Statistics calculation
  const statistics = useMemo(() => {
    const total = filteredResults.length;
    const passes = filteredResults.filter(r => r.grade !== 'F').length;
    const passRate = total > 0 ? ((passes / total) * 100).toFixed(1) : '100';

    // Compute average percentage marks
    const totalPct = filteredResults.reduce((acc, curr) => acc + curr.percentage, 0);
    const averagePct = total > 0 ? (totalPct / total).toFixed(1) : '0';

    return { total, passRate, averagePct };
  }, [filteredResults]);

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* =======================================================================
         PAGE LOCAL INLINE STYLES (MATCHING PREMIUM RESULTS)
         ======================================================================= */}
      <style>{`
        .glass-card-results {
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

        .glass-card-results:hover {
          transform: translateY(-3px) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 25px -5px     rgba(139, 92, 246, 0.15) !important;
        }

        body.light-mode .glass-card-results {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .glass-card-results:hover {
          background: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 12px 40px -10px rgba(100, 160, 220, 0.2) !important;
        }

        .glow-orb-results-1 {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb-results-2 {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
        }

        .tabs-results-bar {
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
        }
        body.light-mode .tabs-results-bar {
          background: rgba(0, 0, 0, 0.02);
        }

        .tab-results-btn {
          padding: 8px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .tab-results-btn:hover {
          color: var(--text-primary);
        }
        .tab-results-btn-active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
        }

        .results-grade-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }
        .results-grade-table th {
          padding: 14px 16px;
          font-weight: bold;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
          background: rgba(255,255,255,0.01);
        }
        .results-grade-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }
        .grade-row:hover {
          background: rgba(255, 255, 255, 0.015);
        }
        body.light-mode .grade-row:hover {
          background: rgba(0, 0, 0, 0.01);
        }

        .clickable-student-name {
          cursor: pointer;
          color: var(--text-primary);
          transition: all 0.2s ease;
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .clickable-student-name:hover {
          color: var(--accent-primary) !important;
          text-decoration: underline;
        }
        body.light-mode .clickable-student-name:hover {
          color: var(--accent-secondary) !important;
        }

        .student-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(3, 7, 18, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .student-modal-card {
          width: 100%;
          max-width: 750px;
          max-height: 85vh;
          overflow-y: auto;
          background: linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.95) 0%,
            rgba(10, 15, 30, 0.98) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 
                      0 0 40px rgba(139, 92, 246, 0.15);
          padding: 28px;
          position: relative;
        }

        body.light-mode .student-modal-card {
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .subject-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .subject-card:hover {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(139, 92, 246, 0.25);
        }

        body.light-mode .subject-card {
          background: rgba(0, 0, 0, 0.015);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        body.light-mode .subject-card:hover {
          background: rgba(0, 0, 0, 0.025);
          border-color: rgba(139, 92, 246, 0.25);
        }
      `}</style>

      {/* Glowing Accents */}
      <div className="glow-orb-results-1" style={{ top: '10%', left: '-5%' }} />
      <div className="glow-orb-results-2" style={{ bottom: '15%', right: '-5%' }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <Award className="text-violet-500" size={32} />
            Gradebook & Exam Results
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Filter candidates results sheets, edit academic records, and publish dynamic marks arrays.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: STATISTICS CARDS
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Total Records */}
        <div className="glass-card-results" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Grade Sheets Released</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
              <FileText size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {statistics.total} Records
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Across selected filter states
            </span>
          </div>
        </div>

        {/* Average Class Marks */}
        <div className="glass-card-results" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Average Score</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <Percent size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {statistics.averagePct}% Average
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              ✓ High-performing cohort
            </span>
          </div>
        </div>

        {/* Pass rate percentage */}
        <div className="glass-card-results" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cohort Pass Rate</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
              <Trophy size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)', fontFamily: 'var(--font-heading)' }}>
              {statistics.passRate}% Passing
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Minimum grade equivalent: D
            </span>
          </div>
        </div>

      </div>

      {/* =======================================================================
         SECTION 3: NAVIGATION TABS
         ======================================================================= */}
      <div className="tabs-results-bar">
        <button
          onClick={() => setActiveTab('roster')}
          className={`tab-results-btn ${activeTab === 'roster' ? 'tab-results-btn-active' : ''}`}
        >
          Roster Gradebook
        </button>
        <button
          onClick={() => setActiveTab('publish')}
          className={`tab-results-btn ${activeTab === 'publish' ? 'tab-results-btn-active' : ''}`}
        >
          Publish New Exam Results
        </button>
      </div>

      {/* =======================================================================
         SECTION 4: ACTIVE TAB VIEWS
         ======================================================================= */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: ROSTER GRADEBOOK VIEW */}
        {activeTab === 'roster' && (
          <motion.div
            key="roster-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Filter toolbar card */}
            <Card className="glass-card-results" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                
                {/* Select filters */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  
                  {/* Semester selector */}
                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Semester</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                      <SlidersHorizontal size={14} style={{ color: 'var(--text-secondary)' }} />
                      <select
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="All" style={{ background: 'var(--bg-primary)' }}>All Semesters</option>
                        <option value="4th Semester" style={{ background: 'var(--bg-primary)' }}>4th Semester</option>
                        <option value="5th Semester" style={{ background: 'var(--bg-primary)' }}>5th Semester</option>
                        <option value="6th Semester" style={{ background: 'var(--bg-primary)' }}>6th Semester</option>
                      </select>
                    </div>
                  </div>

                  {/* Batch selector */}
                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Target Batch</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                      <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                      <select
                        value={batchFilter}
                        onChange={(e) => setBatchFilter(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="All" style={{ background: 'var(--bg-primary)' }}>All Batches</option>
                        <option value="Batch 20" style={{ background: 'var(--bg-primary)' }}>Batch 20</option>
                        <option value="Batch 21" style={{ background: 'var(--bg-primary)' }}>Batch 21</option>
                        <option value="Batch 22" style={{ background: 'var(--bg-primary)' }}>Batch 22</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject filter selector */}
                  <div className="flex flex-col gap-1">
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Subject</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                      <BookOpen size={14} style={{ color: 'var(--text-secondary)' }} />
                      <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="All" style={{ background: 'var(--bg-primary)' }}>All Courses</option>
                        {Object.keys(courseDetailsMap).map(code => (
                          <option key={code} value={code} style={{ background: 'var(--bg-primary)' }}>{code}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>

                {/* Search bar */}
                <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: '220px', maxWidth: '350px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Search Grades</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text"
                      placeholder="Search name, ID, or assessment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.85rem', height: '38px' }}
                    />
                  </div>
                </div>

              </div>
            </Card>

            {/* Results table card */}
            <Card className="glass-card-results" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="results-grade-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '20px' }}>Student Name</th>
                      <th>ID</th>
                      <th>Batch & Sem</th>
                      <th>Course</th>
                      <th>Assessment Term</th>
                      <th>Raw Score</th>
                      <th>Percentage</th>
                      <th style={{ textAlign: 'right', paddingRight: '20px' }}>Letter Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No academic records found matching selected filter query values.
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((r, idx) => (
                        <tr 
                          key={r.id} 
                          className="grade-row"
                          style={{ borderBottom: idx !== filteredResults.length - 1 ? '1px solid var(--border-color)' : 'none' }}
                        >
                          {/* Student name */}
                          <td 
                            onClick={() => setSelectedStudent({ id: r.studentId, name: r.studentName, batch: r.batch, semester: r.semester })}
                            style={{ padding: '14px 20px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            <div className="clickable-student-name">
                              <span>{r.studentName}</span>
                              <Eye size={12} style={{ opacity: 0.6 }} />
                            </div>
                          </td>

                          {/* Student ID */}
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.studentId}</td>

                          {/* Batch & semester */}
                          <td>
                            <div style={{ fontWeight: '500' }}>{r.batch}</div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.semester}</span>
                          </td>

                          {/* Course Code */}
                          <td style={{ fontWeight: '700', color: '#8B5CF6' }}>{r.code}</td>

                          {/* Exam name */}
                          <td style={{ fontWeight: '500' }}>{r.examName}</td>

                          {/* Score */}
                          <td style={{ fontWeight: '700' }}>{r.score}</td>

                          {/* Percentage progress bar */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 'bold', width: '36px' }}>{r.percentage}%</span>
                              <div style={{ width: '60px', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ 
                                  width: `${r.percentage}%`, 
                                  height: '100%', 
                                  background: r.grade === 'F' ? 'var(--accent-danger)' : 'linear-gradient(90deg, #8B5CF6, #10B981)',
                                  borderRadius: '3px'
                                }} />
                              </div>
                            </div>
                          </td>

                          {/* Grade letter */}
                          <td style={{ textAlign: 'right', paddingRight: '20px', fontWeight: 'bold', color: r.grade === 'F' ? 'var(--accent-danger)' : 'var(--accent-secondary)' }}>
                            {r.grade}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* TAB 2: PUBLISH NEW EXAM RESULTS */}
        {activeTab === 'publish' && (
          <motion.div
            key="publish-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
          >
            <Card title="Publish Exam Grade Sheets" className="glass-card-results" style={{ padding: '28px' }}>
              
              <form onSubmit={handlePublishResults} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '12px' }}>
                
                {/* Form fields grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  
                  {/* Exam Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Exam Name / Assessment Term *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Class Test 3: Relational Algebra & Calculus"
                      value={pubExamName}
                      onChange={(e) => setPubExamName(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Course Code dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Subject Code *</label>
                    <select
                      value={pubCourse}
                      onChange={(e) => setPubCourse(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px' }}
                    >
                      {Object.keys(courseDetailsMap).map(code => (
                        <option key={code} value={code}>{code} - {courseDetailsMap[code].substring(0, 18)}...</option>
                      ))}
                    </select>
                  </div>

                  {/* Date of exam */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Exam Date *</label>
                    <input 
                      type="date"
                      required
                      value={pubDate}
                      onChange={(e) => setPubDate(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', padding: '0 10px' }}
                    />
                  </div>

                  {/* Max Marks */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Maximum Obtainable Marks *</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      value={pubMaxMarks}
                      onChange={(e) => setPubMaxMarks(Number(e.target.value))}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Target Semester */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Target Semester *</label>
                    <select
                      value={pubSemester}
                      onChange={(e) => setPubSemester(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px' }}
                    >
                      <option value="4th Semester">4th Semester</option>
                      <option value="5th Semester">5th Semester</option>
                      <option value="6th Semester">6th Semester</option>
                    </select>
                  </div>

                  {/* Target Batch */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Target Batch *</label>
                    <select
                      value={pubBatch}
                      onChange={(e) => setPubBatch(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px' }}
                    >
                      <option value="Batch 20">Batch 20</option>
                      <option value="Batch 21">Batch 21</option>
                      <option value="Batch 22">Batch 22</option>
                    </select>
                  </div>

                </div>

                {/* Dynamic Student Marks Input Roster */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }} className="flex items-center gap-2">
                    <Edit3 size={16} className="text-violet-400" />
                    Enter Obtained Marks Roster List
                  </h4>

                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)', padding: '10px 16px', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                      <div style={{ flex: 2 }}>Student Name</div>
                      <div style={{ flex: 1 }}>Student ID</div>
                      <div style={{ flex: 1, textAlign: 'right' }}>Obtained Score (Out of {pubMaxMarks})</div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '280px', overflowY: 'auto' }}>
                      {publishingRoster.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No mock students found enrolled in the selected Batch and Semester.
                        </div>
                      ) : (
                        publishingRoster.map((student) => (
                          <div 
                            key={student.id} 
                            style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                          >
                            <div style={{ flex: 2, fontWeight: 'bold' }}>{student.name}</div>
                            <div style={{ flex: 1, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{student.id}</div>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                              <input 
                                type="number"
                                min="0"
                                max={pubMaxMarks}
                                placeholder="Marks"
                                value={studentMarksInputs[student.id] || ''}
                                onChange={(e) => setStudentMarksInputs({ ...studentMarksInputs, [student.id]: e.target.value })}
                                className="input-field"
                                style={{ width: '80px', height: '30px', padding: '0 6px', fontSize: '0.8rem', borderRadius: '6px', textAlign: 'center' }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar loader overlay */}
                <AnimatePresence>
                  {isPublishing && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}
                    >
                      <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${publishProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', transition: 'width 0.15s linear' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Validating letter grades and pushing scorecards to student profiles... {publishProgress}%
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('roster')}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px' }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isPublishing || publishingRoster.length === 0}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.82rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', opacity: (isPublishing || publishingRoster.length === 0) ? 0.7 : 1 }}
                  >
                    {isPublishing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>{isPublishing ? 'Publishing...' : 'Release & Publish Results'}</span>
                  </button>
                </div>

              </form>

            </Card>
          </motion.div>
        )}

      </AnimatePresence>

      {/* =======================================================================
         SECTION 5: NOTIFICATION TOASTS
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
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
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
              zIndex: 2000
            }}
          >
            <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================================
         SECTION 6: STUDENT DETAILS MODAL (SUBJECT-WISE DETAILS)
         ======================================================================= */}
      <AnimatePresence>
        {selectedStudent && (
          <div 
            className="student-modal-overlay"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="student-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '6px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
                      <Users size={16} />
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Student Academic Card</span>
                  </div>
                  <h2 style={{ margin: '8px 0 2px 0', color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                    {selectedStudent.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>ID: {selectedStudent.id}</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                    <span>{selectedStudent.batch}</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                    <span>{selectedStudent.semester}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedStudent(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="hover:bg-red-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Statistics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                
                <div style={{ padding: '12px 16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Exams</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {studentStats.totalExams}
                  </div>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Average Score</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
                    {studentStats.avgPct}%
                  </div>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CGPA Projection</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-success)', marginTop: '4px' }}>
                    {studentStats.gpa} / 4.00
                  </div>
                </div>

              </div>

              {/* Subject Wise List */}
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} className="text-violet-400" />
                  Subject-Wise Performance Details
                </h3>

                {Object.keys(studentResultsGrouped).length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No results recorded for this student yet.
                  </div>
                ) : (
                  Object.keys(studentResultsGrouped).map(courseCode => {
                    const records = studentResultsGrouped[courseCode];
                    const courseName = courseDetailsMap[courseCode] || 'Advanced Studies';
                    
                    // Subject average
                    const subAvgPct = Math.round(records.reduce((acc, curr) => acc + curr.percentage, 0) / records.length);
                    
                    return (
                      <div key={courseCode} className="subject-card">
                        
                        {/* Subject Title Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 8px', borderRadius: '6px', marginRight: '8px' }}>
                              {courseCode}
                            </span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {courseName}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Subject Average:</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>{subAvgPct}%</span>
                          </div>
                        </div>

                        {/* Roster of exams under this subject */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {records.map(rec => (
                            <div 
                              key={rec.id}
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                background: 'rgba(255, 255, 255, 0.01)', 
                                border: '1px solid rgba(255,255,255,0.03)', 
                                borderRadius: '10px',
                                padding: '10px 14px',
                                fontSize: '0.8rem'
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.examName}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Exam Date: {rec.date}</span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                
                                {/* Percentage Bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${rec.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #10B981)' }} />
                                  </div>
                                  <span style={{ fontWeight: '500', fontSize: '0.72rem' }}>{rec.percentage}%</span>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rec.score}</div>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: rec.grade === 'F' ? 'var(--accent-danger)' : 'var(--accent-secondary)' }}>
                                    Grade: {rec.grade}
                                  </span>
                                </div>

                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* Close Footer button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
                >
                  Close Card
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

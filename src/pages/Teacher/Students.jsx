// ============================================================================
// Students.jsx — QGenix Teacher Student Roster & Activity Panel
// ============================================================================
// Designed to represent a premium student roster and activity manager for teachers.
// Features:
//   1. Profile stats overview cards (Total Enrolled, Active Now, At-Risk Alerts).
//   2. Real-time active status indicators (pulsing Online, Away, Offline badges).
//   3. Advanced filter controls (Search, Batch selector, Semester selector).
//   4. Layout toggles (visual Grid Cards vs detailed Roster Table).
//   5. Color-coded progress meters showing attendance rates and alerts.
//   6. Integrated quick-communication feedback loops (floating toast panels).
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষকের স্টুডেন্ট রোস্টার এবং অ্যাক্টিভিটি প্যানেল। শিক্ষক তার ব্যাচ এবং সেমিস্টার
// অনুযায়ী স্টুডেন্টদের তালিকা দেখতে পারবেন। এখানে অনলাইন/অ্যাক্টিভ স্টুডেন্টদের জন্য সবুজ পালসিং
// ইন্ডিকেটর দেওয়া হয়েছে। এছাড়াও গ্রিড ভিউ এবং টেবিল ভিউ টগল করার সুবিধা এবং অ্যাটেনডেন্সের
// ওপর ভিত্তি করে এট-রিস্ক স্টুডেন্ট চিহ্নিত করার ব্যবস্থা রাখা হয়েছে।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, SlidersHorizontal, LayoutGrid, List, 
  Mail, Phone, BookOpen, Clock, AlertTriangle, CheckCircle, 
  ShieldAlert, Send, Eye, RefreshCw, CheckCircle2, ChevronRight,
  TrendingUp, Award, Calendar, HelpCircle, X
} from 'lucide-react';
import Card from '../../components/Card';

// ----------------------------------------------------------------------------
// 1. MOCK DATA: STUDENT ROSTER DATABASE
// ----------------------------------------------------------------------------
const initialStudentsData = [
  {
    id: 'UG02-112',
    name: 'Rafayel Ahmed',
    email: 'rafayel@qgenix.edu',
    semester: '5th Semester',
    batch: 'Batch 21',
    attendance: 68.5,
    grade: 'B',
    status: 'active', // active, away, offline
    courses: ['CSE-301', 'CSE-304'],
    risk: 'Critical',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    attendanceDetails: { present: 19, absent: 7, late: 2, total: 28 },
    results: [
      { term: 'Midterm Exam', score: '72/100', weight: '30%', grade: 'B-' },
      { term: 'Quiz 1: Data Structures', score: '13/20', weight: '10%', grade: 'C+' },
      { term: 'Quiz 2: Graph Algorithms', score: '15/20', weight: '10%', grade: 'B' },
      { term: 'Assignment 1: Algorithms Practice', score: '38/50', weight: '15%', grade: 'B' },
      { term: 'Assignment 2: CI/CD Pipeline Lab', score: '42/50', weight: '15%', grade: 'B+' },
      { term: 'Class Performance Evaluation', score: '82%', weight: '10%', grade: 'B' }
    ]
  },
  {
    id: 'UG02-145',
    name: 'Noshin Tasnim',
    email: 'noshin.t@qgenix.edu',
    semester: '5th Semester',
    batch: 'Batch 21',
    attendance: 72.0,
    grade: 'A',
    status: 'active',
    courses: ['CSE-301', 'CSE-304'],
    risk: 'Medium',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    attendanceDetails: { present: 20, absent: 6, late: 2, total: 28 },
    results: [
      { term: 'Midterm Exam', score: '88/100', weight: '30%', grade: 'A' },
      { term: 'Quiz 1: Data Structures', score: '18/20', weight: '10%', grade: 'A' },
      { term: 'Quiz 2: Graph Algorithms', score: '17/20', weight: '10%', grade: 'A-' },
      { term: 'Assignment 1: Algorithms Practice', score: '45/50', weight: '15%', grade: 'A' },
      { term: 'Assignment 2: CI/CD Pipeline Lab', score: '44/50', weight: '15%', grade: 'A' },
      { term: 'Class Performance Evaluation', score: '92%', weight: '10%', grade: 'A+' }
    ]
  },
  {
    id: 'UG02-098',
    name: 'Sajjad Karim',
    email: 'sajjad.k@qgenix.edu',
    semester: '5th Semester',
    batch: 'Batch 21',
    attendance: 74.2,
    grade: 'B+',
    status: 'away',
    courses: ['CSE-301', 'CSE-304'],
    risk: 'Medium',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    attendanceDetails: { present: 21, absent: 5, late: 2, total: 28 },
    results: [
      { term: 'Midterm Exam', score: '80/100', weight: '30%', grade: 'B' },
      { term: 'Quiz 1: Data Structures', score: '16/20', weight: '10%', grade: 'B' },
      { term: 'Quiz 2: Graph Algorithms', score: '15/20', weight: '10%', grade: 'B' },
      { term: 'Assignment 1: Algorithms Practice', score: '40/50', weight: '15%', grade: 'B' },
      { term: 'Assignment 2: CI/CD Pipeline Lab', score: '41/50', weight: '15%', grade: 'B+' },
      { term: 'Class Performance Evaluation', score: '85%', weight: '10%', grade: 'B+' }
    ]
  },
  {
    id: 'UG02-210',
    name: 'Maria Sultana',
    email: 'maria.s@qgenix.edu',
    semester: '5th Semester',
    batch: 'Batch 21',
    attendance: 62.0,
    grade: 'C',
    status: 'active',
    courses: ['CSE-301'],
    risk: 'Critical',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    attendanceDetails: { present: 17, absent: 9, late: 2, total: 28 },
    results: [
      { term: 'Midterm Exam', score: '62/100', weight: '30%', grade: 'C' },
      { term: 'Quiz 1: Data Structures', score: '12/20', weight: '10%', grade: 'C-' },
      { term: 'Quiz 2: Graph Algorithms', score: '14/20', weight: '10%', grade: 'C' },
      { term: 'Assignment 1: Algorithms Practice', score: '35/50', weight: '15%', grade: 'C+' },
      { term: 'Assignment 2: CI/CD Pipeline Lab', score: '32/50', weight: '15%', grade: 'C' },
      { term: 'Class Performance Evaluation', score: '70%', weight: '10%', grade: 'C' }
    ]
  },
  {
    id: 'UG02-005',
    name: 'Sadia Rahman',
    email: 'sadia.r@qgenix.edu',
    semester: '6th Semester',
    batch: 'Batch 20',
    attendance: 92.5,
    grade: 'A+',
    status: 'active',
    courses: ['CSE-312'],
    risk: 'Low',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    attendanceDetails: { present: 26, absent: 1, late: 1, total: 28 },
    results: [
      { term: 'Midterm Exam', score: '96/100', weight: '30%', grade: 'A+' },
      { term: 'Quiz 1: Artificial Intelligence', score: '19/20', weight: '10%', grade: 'A+' },
      { term: 'Quiz 2: Heuristic Search', score: '20/20', weight: '10%', grade: 'A+' },
      { term: 'Assignment 1: A* Implementation', score: '48/50', weight: '15%', grade: 'A+' },
      { term: 'Assignment 2: Neural Net Foundations', score: '49/50', weight: '15%', grade: 'A+' },
      { term: 'Class Performance Evaluation', score: '98%', weight: '10%', grade: 'A+' }
    ]
  },
  {
    id: 'UG02-119',
    name: 'Mahmudul Hasan',
    email: 'mahmudul@qgenix.edu',
    semester: '6th Semester',
    batch: 'Batch 20',
    attendance: 95.0,
    grade: 'A+',
    status: 'offline',
    courses: ['CSE-312'],
    risk: 'Low',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
    attendanceDetails: { present: 27, absent: 1, late: 0, total: 28 },
    results: [
      { term: 'Midterm Exam', score: '95/100', weight: '30%', grade: 'A+' },
      { term: 'Quiz 1: Artificial Intelligence', score: '18/20', weight: '10%', grade: 'A' },
      { term: 'Quiz 2: Heuristic Search', score: '19/20', weight: '10%', grade: 'A+' },
      { term: 'Assignment 1: A* Implementation', score: '47/50', weight: '15%', grade: 'A' },
      { term: 'Assignment 2: Neural Net Foundations', score: '48/50', weight: '15%', grade: 'A+' },
      { term: 'Class Performance Evaluation', score: '96%', weight: '10%', grade: 'A+' }
    ]
  },
  {
    id: 'UG02-132',
    name: 'Rafiul Islam',
    email: 'rafiul@qgenix.edu',
    semester: '5th Semester',
    batch: 'Batch 21',
    attendance: 88.0,
    grade: 'A',
    status: 'active',
    courses: ['CSE-301', 'CSE-304'],
    risk: 'Low',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    attendanceDetails: { present: 25, absent: 2, late: 1, total: 28 },
    results: [
      { term: 'Midterm Exam', score: '91/100', weight: '30%', grade: 'A' },
      { term: 'Quiz 1: Data Structures', score: '17/20', weight: '10%', grade: 'A-' },
      { term: 'Quiz 2: Graph Algorithms', score: '18/20', weight: '10%', grade: 'A' },
      { term: 'Assignment 1: Algorithms Practice', score: '46/50', weight: '15%', grade: 'A' },
      { term: 'Assignment 2: CI/CD Pipeline Lab', score: '45/50', weight: '15%', grade: 'A' },
      { term: 'Class Performance Evaluation', score: '94%', weight: '10%', grade: 'A+' }
    ]
  },
  {
    id: 'UG02-167',
    name: 'Alice Johnson',
    email: 'alice.j@qgenix.edu',
    semester: '4th Semester',
    batch: 'Batch 22',
    attendance: 96.0,
    grade: 'A+',
    status: 'active',
    courses: ['CSE-201'],
    risk: 'Low',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    attendanceDetails: { present: 27, absent: 1, late: 0, total: 28 },
    results: [
      { term: 'Midterm Exam', score: '97/100', weight: '30%', grade: 'A+' },
      { term: 'Quiz 1: Object Oriented Prog', score: '20/20', weight: '10%', grade: 'A+' },
      { term: 'Quiz 2: Java Principles', score: '19/20', weight: '10%', grade: 'A+' },
      { term: 'Assignment 1: Polymorphism Slides', score: '49/50', weight: '15%', grade: 'A+' },
      { term: 'Assignment 2: Design Patterns', score: '50/50', weight: '15%', grade: 'A+' },
      { term: 'Class Performance Evaluation', score: '98%', weight: '10%', grade: 'A+' }
    ]
  },
  {
    id: 'UG02-188',
    name: 'Bob Smith',
    email: 'bob.s@qgenix.edu',
    semester: '4th Semester',
    batch: 'Batch 22',
    attendance: 78.0,
    grade: 'B',
    status: 'offline',
    courses: ['CSE-201'],
    risk: 'Low',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
    attendanceDetails: { present: 22, absent: 5, late: 1, total: 28 },
    results: [
      { term: 'Midterm Exam', score: '82/100', weight: '30%', grade: 'B' },
      { term: 'Quiz 1: Object Oriented Prog', score: '15/20', weight: '10%', grade: 'B' },
      { term: 'Quiz 2: Java Principles', score: '14/20', weight: '10%', grade: 'B-' },
      { term: 'Assignment 1: Polymorphism Slides', score: '38/50', weight: '15%', grade: 'B' },
      { term: 'Assignment 2: Design Patterns', score: '42/50', weight: '15%', grade: 'B+' },
      { term: 'Class Performance Evaluation', score: '80%', weight: '10%', grade: 'B' }
    ]
  },
  {
    id: 'UG02-192',
    name: 'Charlie Brown',
    email: 'charlie.b@qgenix.edu',
    semester: '4th Semester',
    batch: 'Batch 22',
    attendance: 82.0,
    grade: 'A',
    status: 'away',
    courses: ['CSE-201'],
    risk: 'Low',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    attendanceDetails: { present: 23, absent: 4, late: 1, total: 28 },
    results: [
      { term: 'Midterm Exam', score: '90/100', weight: '30%', grade: 'A-' },
      { term: 'Quiz 1: Object Oriented Prog', score: '17/20', weight: '10%', grade: 'A-' },
      { term: 'Quiz 2: Java Principles', score: '18/20', weight: '10%', grade: 'A' },
      { term: 'Assignment 1: Polymorphism Slides', score: '43/50', weight: '15%', grade: 'A-' },
      { term: 'Assignment 2: Design Patterns', score: '45/50', weight: '15%', grade: 'A' },
      { term: 'Class Performance Evaluation', score: '88%', weight: '10%', grade: 'A' }
    ]
  }
];

export default function TeacherStudents() {
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // UI States
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter students based on UI selections
  const filteredStudents = useMemo(() => {
    return initialStudentsData.filter(student => {
      const matchesSemester = semesterFilter === 'All' || student.semester === semesterFilter;
      const matchesBatch = batchFilter === 'All' || student.batch === batchFilter;
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            student.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSemester && matchesBatch && matchesSearch;
    });
  }, [semesterFilter, batchFilter, searchQuery]);

  // Compute analytics
  const statistics = useMemo(() => {
    const total = filteredStudents.length;
    const active = filteredStudents.filter(s => s.status === 'active').length;
    const atRisk = filteredStudents.filter(s => s.attendance < 75.0).length;
    return { total, active, atRisk };
  }, [filteredStudents]);

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* =======================================================================
         PAGE STYLES OVERRIDES (LIQUID GLASSMORPHISM AESTHETICS)
         ======================================================================= */}
      <style>{`
        .glass-card-students {
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

        .glass-card-students:hover {
          transform: translateY(-3px) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 25px -5px     rgba(139, 92, 246, 0.15) !important;
        }

        body.light-mode .glass-card-students {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .glass-card-students:hover {
          background: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 12px 40px -10px rgba(100, 160, 220, 0.2) !important;
        }

        .glow-orb-students-1 {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb-students-2 {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
        }

        /* Pulsing Dot Animations for active/online status */
        .pulse-active {
          position: relative;
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--accent-success);
          box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
        }
        .status-active { background: rgba(16, 185, 129, 0.12); color: var(--accent-success); }
        .status-away { background: rgba(245, 158, 11, 0.12); color: var(--accent-warning); }
        .status-offline { background: rgba(148, 163, 184, 0.12); color: var(--text-secondary); }

        .attendance-track {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        body.light-mode .attendance-track {
          background: rgba(0, 0, 0, 0.05);
        }

        .avatar-frame {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .view-btn {
          padding: 8px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn-active {
          background: var(--accent-primary) !important;
          color: white !important;
          border-color: transparent !important;
        }
      `}</style>

      {/* Decorative Orbs */}
      <div className="glow-orb-students-1" style={{ top: '10%', left: '-8%' }} />
      <div className="glow-orb-students-2" style={{ bottom: '15%', right: '-8%' }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <Users className="text-violet-500" size={32} />
            Student Enrollment Roster
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Monitor enrolled students across your academic courses, check their active status, and track performance records.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: ANALYTICS OVERVIEW
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Total Students */}
        <div className="glass-card-students" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Students Enrolled</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
              <Users size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {statistics.total} Students
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Across selected filters
            </span>
          </div>
        </div>

        {/* Active Now */}
        <div className="glass-card-students" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active / Online Now</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-2">
              <span className="pulse-active" style={{ width: '12px', height: '12px' }} />
              {statistics.active} Active
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Currently exploring platforms
            </span>
          </div>
        </div>

        {/* At Risk */}
        <div className="glass-card-students" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>At-Risk Students</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: statistics.atRisk > 0 ? 'var(--accent-danger)' : 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {statistics.atRisk} Alerts
            </div>
            <span style={{ fontSize: '0.72rem', color: statistics.atRisk > 0 ? 'var(--accent-danger)' : 'var(--text-secondary)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Attendance below 75% threshold
            </span>
          </div>
        </div>

      </div>

      {/* =======================================================================
         SECTION 3: FILTRATION & VIEWS TOOLBAR
         ======================================================================= */}
      <Card className="glass-card-students" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Filters */}
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
                  <option value="4th Semester" style={{ background: 'var(--bg-primary)' }}>4th Semester</option>
                  <option value="5th Semester" style={{ background: 'var(--bg-primary)' }}>5th Semester</option>
                  <option value="6th Semester" style={{ background: 'var(--bg-primary)' }}>6th Semester</option>
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
                  <option value="Batch 20" style={{ background: 'var(--bg-primary)' }}>Batch 20</option>
                  <option value="Batch 21" style={{ background: 'var(--bg-primary)' }}>Batch 21</option>
                  <option value="Batch 22" style={{ background: 'var(--bg-primary)' }}>Batch 22</option>
                </select>
              </div>
            </div>

          </div>

          {/* Search bar & View Toggles */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', width: '100%', mdWidth: 'auto', maxWidth: '520px' }}>
            
            {/* Search */}
            <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Search Student</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  placeholder="Search name, email, or Student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.85rem', height: '38px' }}
                />
              </div>
            </div>

            {/* View Toggles */}
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`view-btn ${viewMode === 'grid' ? 'view-btn-active' : ''}`}
                title="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`view-btn ${viewMode === 'table' ? 'view-btn-active' : ''}`}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>

          </div>

        </div>
      </Card>

      {/* =======================================================================
         SECTION 4: STUDENTS DISPLAYS (GRID VS TABLE)
         ======================================================================= */}
      <div>
        {filteredStudents.length === 0 ? (
          <div className="glass-card-students" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <HelpCircle size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>No students found</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              No matches found for your active search or filter combinations.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* ================= GRID CARD VIEW ================= */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredStudents.map((student) => {
              const nameInitials = student.name.split(' ').map(n => n[0]).join('');
              const isAtRisk = student.attendance < 75.0;
              const statusClass = student.status === 'active' ? 'status-active' :
                                  student.status === 'away' ? 'status-away' : 'status-offline';
              const statusText = student.status === 'active' ? 'Active Now' :
                                 student.status === 'away' ? 'Away' : 'Offline';

              return (
                <div 
                  key={student.id} 
                  className="glass-card-students"
                  onClick={() => setSelectedStudent(student)}
                  style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '16px',
                    cursor: 'pointer',
                    borderLeft: isAtRisk ? '4px solid var(--accent-danger)' : '1px solid rgba(255,255,255,0.1)' 
                  }}
                >
                  
                  {/* Top card segment: Avatar & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar-frame" style={{ overflow: 'visible' }}>
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="avatar-img" />
                        ) : (
                          nameInitials
                        )}
                        {/* Status dot on top of avatar */}
                        <span style={{ 
                          position: 'absolute', 
                          bottom: '-2px', 
                          right: '-2px', 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          background: student.status === 'active' ? 'var(--accent-success)' : student.status === 'away' ? 'var(--accent-warning)' : '#94A3B8',
                          border: '2px solid var(--bg-primary)'
                        }} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{student.name}</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {student.id}</span>
                      </div>
                    </div>

                    <span className={`status-badge ${statusClass}`}>{statusText}</span>
                  </div>

                  {/* Contact Info & Academic stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Mail size={12} className="text-violet-400" />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{student.email}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <span>Batch: <strong>{student.batch}</strong></span>
                      <span>Semester: <strong>{student.semester.replace(' Semester', '')}</strong></span>
                      <span>Grade: <strong style={{ color: 'var(--accent-secondary)' }}>{student.grade}</strong></span>
                    </div>
                  </div>

                  {/* Enrolled Courses */}
                  <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 0' }}>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '6px' }}>Enrolled Courses</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {student.courses.map(course => (
                        <span key={course} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Performance progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Class Attendance</span>
                      <strong style={{ color: isAtRisk ? 'var(--accent-danger)' : 'var(--accent-success)' }}>{student.attendance}%</strong>
                    </div>
                    <div className="attendance-track">
                      <div style={{ 
                        width: `${student.attendance}%`, 
                        height: '100%', 
                        background: isAtRisk ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 'linear-gradient(90deg, #8B5CF6, #10B981)',
                        borderRadius: '3px'
                      }} />
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerToast(`Initiated direct email to ${student.name} (${student.email})`);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}
                  >
                    <Send size={12} />
                    <span>Contact Student</span>
                  </button>

                </div>
              );
            })}
          </div>
        ) : (
          /* ================= TABLE LIST VIEW ================= */
          <Card className="glass-card-students" style={{ padding: '0px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', fontSize: '0.85rem' }}>
                
                <thead style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                  <tr>
                    <th style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Student Name</th>
                    <th style={{ padding: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Student ID</th>
                    <th style={{ padding: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Batch & Semester</th>
                    <th style={{ padding: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Enrolled Courses</th>
                    <th style={{ padding: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Attendance Rate</th>
                    <th style={{ padding: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Current Grade</th>
                    <th style={{ padding: '16px 20px', fontWeight: 'bold', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const nameInitials = student.name.split(' ').map(n => n[0]).join('');
                    const isAtRisk = student.attendance < 75.0;
                    const statusClass = student.status === 'active' ? 'status-active' :
                                        student.status === 'away' ? 'status-away' : 'status-offline';
                    const statusText = student.status === 'active' ? 'Active' :
                                       student.status === 'away' ? 'Away' : 'Offline';

                    return (
                      <tr 
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        style={{ 
                          borderBottom: idx !== filteredStudents.length - 1 ? '1px solid var(--border-color)' : 'none',
                          background: isAtRisk ? 'rgba(239, 68, 68, 0.01)' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        
                        {/* Name & Avatar with Active Pulse */}
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="avatar-frame" style={{ width: '36px', height: '36px', fontSize: '0.85rem', overflow: 'visible' }}>
                              {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="avatar-img" />
                              ) : (
                                nameInitials
                              )}
                              <span style={{ 
                                position: 'absolute', 
                                bottom: '-1px', 
                                right: '-1px', 
                                width: '10px', 
                                height: '10px', 
                                borderRadius: '50%', 
                                background: student.status === 'active' ? 'var(--accent-success)' : student.status === 'away' ? 'var(--accent-warning)' : '#94A3B8',
                                border: '1.5px solid var(--bg-primary)'
                              }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{student.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 600 }}>
                          {student.id}
                        </td>

                        {/* Batch & Semester */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{student.batch}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.semester}</div>
                        </td>

                        {/* Enrolled Courses */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {student.courses.map(course => (
                              <span key={course} style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600 }}>
                                {course}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Attendance percentage rate */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: isAtRisk ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                              {student.attendance}%
                            </strong>
                            {isAtRisk && <span className="badge badge-danger" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>At Risk</span>}
                          </div>
                        </td>

                        {/* Current Grade */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                            {student.grade}
                          </span>
                        </td>

                        {/* Action details */}
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerToast(`Initiated email compose to ${student.name}`);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}
                          >
                            <Send size={11} />
                            <span>Contact</span>
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </Card>
        )}
      </div>

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
         SECTION 6: STUDENT DETAILS MODAL
         ======================================================================= */}
      <AnimatePresence>
        {selectedStudent && (
          <div 
            className="modal-blur-overlay" 
            onClick={() => setSelectedStudent(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(8, 12, 21, 0.7)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1500,
              padding: '16px'
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-detail-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(13, 20, 38, 0.9)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 30px 70px rgba(0, 0, 0, 0.8)',
                borderRadius: '24px',
                padding: '28px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="avatar-frame" style={{ width: '56px', height: '56px', fontSize: '1.2rem', overflow: 'visible' }}>
                    {selectedStudent.avatar ? (
                      <img src={selectedStudent.avatar} alt={selectedStudent.name} className="avatar-img" />
                    ) : (
                      selectedStudent.name.split(' ').map(n => n[0]).join('')
                    )}
                    <span style={{ 
                      position: 'absolute', 
                      bottom: '0px', 
                      right: '0px', 
                      width: '14px', 
                      height: '14px', 
                      borderRadius: '50%', 
                      background: selectedStudent.status === 'active' ? 'var(--accent-success)' : selectedStudent.status === 'away' ? 'var(--accent-warning)' : '#94A3B8',
                      border: '2px solid var(--bg-primary)'
                    }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedStudent.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student ID: <strong style={{ color: 'var(--text-primary)' }}>{selectedStudent.id}</strong></span>
                  </div>
                </div>
                
                <button 
                  className="btn-close-modal"
                  onClick={() => setSelectedStudent(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Personal Information Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Email Address</span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} />{selectedStudent.email}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Academic Profile</span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{selectedStudent.batch} • {selectedStudent.semester}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Current Standing</span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>Grade {selectedStudent.grade}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Active Status</span>
                    <span style={{ fontSize: '0.88rem', color: selectedStudent.status === 'active' ? 'var(--accent-success)' : selectedStudent.status === 'away' ? 'var(--accent-warning)' : 'var(--text-secondary)', fontWeight: 'bold' }}>
                      {selectedStudent.status === 'active' ? 'Active Now' : selectedStudent.status === 'away' ? 'Away' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 'bold', color: 'var(--text-primary)' }} className="flex items-center gap-2">
                    <Clock size={16} className="text-violet-400" />
                    Attendance Breakdown
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ padding: '12px 8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block' }}>Total Classes</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>
                        {selectedStudent.attendanceDetails.total}
                      </span>
                    </div>
                    <div style={{ padding: '12px 8px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-success)', display: 'block' }}>Present</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-success)', display: 'block', marginTop: '2px' }}>
                        {selectedStudent.attendanceDetails.present}
                      </span>
                    </div>
                    <div style={{ padding: '12px 8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-danger)', display: 'block' }}>Absent</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-danger)', display: 'block', marginTop: '2px' }}>
                        {selectedStudent.attendanceDetails.absent}
                      </span>
                    </div>
                    <div style={{ padding: '12px 8px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-warning)', display: 'block' }}>Late</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-warning)', display: 'block', marginTop: '2px' }}>
                        {selectedStudent.attendanceDetails.late}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Attendance Rate</span>
                      <strong style={{ color: selectedStudent.attendance < 75.0 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                        {selectedStudent.attendance}%
                      </strong>
                    </div>
                    <div className="attendance-track" style={{ height: '8px' }}>
                      <div style={{ 
                        width: `${selectedStudent.attendance}%`, 
                        height: '100%', 
                        background: selectedStudent.attendance < 75.0 ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 'linear-gradient(90deg, #8B5CF6, #10B981)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Academic Results & Exam Scores */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 'bold', color: 'var(--text-primary)' }} className="flex items-center gap-2">
                    <Award size={16} className="text-violet-400" />
                    Academic Results & Exam Performance
                  </h4>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)', padding: '10px 14px', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                      <div style={{ flex: 2 }}>Assessment Name</div>
                      <div style={{ flex: 1, textAlign: 'center' }}>Score</div>
                      <div style={{ flex: 1, textAlign: 'center' }}>Weight</div>
                      <div style={{ flex: 1, textAlign: 'right' }}>Grade</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '180px', overflowY: 'auto' }}>
                      {selectedStudent.results.map((res, i) => (
                        <div key={i} style={{ display: 'flex', padding: '10px 14px', fontSize: '0.8rem', borderBottom: i !== selectedStudent.results.length - 1 ? '1px solid var(--border-color)' : 'none', color: 'var(--text-primary)' }}>
                          <div style={{ flex: 2, fontWeight: '500' }}>{res.term}</div>
                          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'monospace' }}>{res.score}</div>
                          <div style={{ flex: 1, textAlign: 'center', color: 'var(--text-muted)' }}>{res.weight}</div>
                          <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>{res.grade}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedStudent(null)}
                  style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px' }}
                >
                  Close Details
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    triggerToast(`Academic report sent to ${selectedStudent.name}`);
                    setSelectedStudent(null);
                  }}
                  style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Mail size={14} />
                  <span>Send Report Alert</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

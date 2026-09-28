// ============================================================================
// MyCourses.jsx — QGenix Student Courses Dashboard Component
// ============================================================================
// Student enrollment visual tracker. Designed with premium liquid glassmorphic
// cards, interactive stats, real-time search, filters, course status badges,
// glowing progress rails, and a detailed syllabus details modal drawer.
// Fully responsive on all device configurations (Mobile, Tablet, Desktop).
//
// [Bengali Note]:
// এই ফাইলটি স্টুডেন্টদের চলমান, সমাপ্ত এবং আসন্ন কোর্সের তালিকা দেখায়।
// এটি সম্পূর্ণ রেসপন্সিভ এবং লিকুইড গ্লাসমরফিজম ডিজাইন গাইডলাইন মেনে তৈরি।
// ব্যবহারকারী চাইলে সার্চ এবং ফিল্টারিং এর মাধ্যমে তার কোর্সগুলো সহজে খুঁজে পেতে পারেন।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calendar, Clock, Award, CheckCircle, Clock3, 
  Search, SlidersHorizontal, ArrowUpDown, Play, Download, 
  Video, FileText, AlertCircle, GraduationCap, X, 
  TrendingUp, ShieldAlert, FolderOpen
} from 'lucide-react';
import Card from '../../components/Card';

// ----------------------------------------------------------------------------
// 1. MOCK DATA: STUDENT ENROLLED COURSES DATABASE
// ----------------------------------------------------------------------------
const initialCourses = [
  {
    id: 1,
    name: 'Advanced Data Structures & Algorithms',
    code: 'CSE-301',
    instructor: 'Dr. Sarah Ahmed',
    description: 'Master advanced tree structures, graph algorithms, dynamic programming, and complexity analysis techniques for high-performance computing.',
    duration: '16 Weeks',
    credits: 4,
    startDate: '2026-01-10',
    endDate: '2026-05-20',
    status: 'Completed',
    completedLessons: 25,
    totalLessons: 25,
    assignmentsLeft: 0,
    quizCount: 5,
    attendance: 95,
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
    borderGlow: 'rgba(139, 92, 246, 0.4)',
    modules: [
      { name: '1. Advanced Trees (Red-Black, AVL, B-Trees)', status: 'Completed' },
      { name: '2. Graph Algorithms (Shortest Path, Spanning Trees)', status: 'Completed' },
      { name: '3. Dynamic Programming & Greedy Strategies', status: 'Completed' },
      { name: '4. Complexity Theory & NP-Completeness Proofs', status: 'Completed' }
    ],
    resources: [
      { type: 'pdf', title: 'Lecture Notes: Dynamic Programming.pdf', size: '2.4 MB' },
      { type: 'slides', title: 'Graph Traversal & BFS/DFS Slides.pptx', size: '5.1 MB' },
      { type: 'recorded', title: 'Module 4: NP-Complete Proofs Session', duration: '1h 15m' }
    ],
    performance: { quizScore: 92, assignmentScore: 94, attendance: 95, lastActivity: '2 days ago' },
    certification: true
  },
  {
    id: 2,
    name: 'Database Management Systems',
    code: 'CSE-302',
    instructor: 'Prof. M. Rahman',
    description: 'Relational data models, SQL queries, schema normalization, ACID transaction management, indexing strategies, and modern NoSQL architectures.',
    duration: '14 Weeks',
    credits: 3,
    startDate: '2026-02-01',
    endDate: '2026-06-15',
    status: 'Ongoing',
    completedLessons: 18,
    totalLessons: 24,
    assignmentsLeft: 2,
    quizCount: 4,
    attendance: 88,
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
    borderGlow: 'rgba(59, 130, 246, 0.4)',
    modules: [
      { name: '1. Relational Algebra & SQL Standards', status: 'Completed' },
      { name: '2. Database Schema Normalization (BCNF, 3NF)', status: 'Completed' },
      { name: '3. Transaction Isolation & Locking Protocols', status: 'In Progress' },
      { name: '4. Distributed Databases & NoSQL Models', status: 'Locked' }
    ],
    resources: [
      { type: 'pdf', title: 'Relational Normalization Guide.pdf', size: '1.8 MB' },
      { type: 'slides', title: 'Indexing & B+ Trees Slides.pdf', size: '3.2 MB' },
      { type: 'recorded', title: 'Practical SQL Joins Lab Session', duration: '55m' }
    ],
    performance: { quizScore: 85, assignmentScore: 80, attendance: 88, lastActivity: 'Today, 02:30 PM' },
    certification: false
  },
  {
    id: 3,
    name: 'Computer Networks & Protocol Design',
    code: 'CSE-303',
    instructor: 'Dr. Karim Al-Hasan',
    description: 'Explore TCP/IP architecture, socket programming, flow control, routing algorithms (OSPF, BGP), and advanced network security configurations.',
    duration: '16 Weeks',
    credits: 4,
    startDate: '2026-02-15',
    endDate: '2026-06-30',
    status: 'Ongoing',
    completedLessons: 12,
    totalLessons: 28,
    assignmentsLeft: 1,
    quizCount: 3,
    attendance: 92,
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)',
    borderGlow: 'rgba(16, 185, 129, 0.4)',
    modules: [
      { name: '1. Physical & Data Link Layer Fundamentals', status: 'Completed' },
      { name: '2. IP Addressing & Subnet Routing Protocols', status: 'In Progress' },
      { name: '3. Transport Protocols (TCP congestion control)', status: 'Locked' },
      { name: '4. Socket Programming Interface (C/Python)', status: 'Locked' }
    ],
    resources: [
      { type: 'slides', title: 'IP Routing & OSPF Slides.pdf', size: '4.5 MB' },
      { type: 'pdf', title: 'Socket API Quick Reference.pdf', size: '1.1 MB' }
    ],
    performance: { quizScore: 88, assignmentScore: 90, attendance: 92, lastActivity: 'Yesterday, 11:15 AM' },
    certification: false
  },
  {
    id: 4,
    name: 'Software Engineering & DevOps',
    code: 'CSE-304',
    instructor: 'Dr. Sarah Ahmed',
    description: 'Agile methodologies, testing frameworks, CI/CD pipelines, containerization with Docker, Kubernetes orchestration, and clean code practices.',
    duration: '12 Weeks',
    credits: 3,
    startDate: '2026-03-01',
    endDate: '2026-07-10',
    status: 'Ongoing',
    completedLessons: 8,
    totalLessons: 20,
    assignmentsLeft: 3,
    quizCount: 2,
    attendance: 70,
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(244, 63, 94, 0.25) 100%)',
    borderGlow: 'rgba(236, 72, 153, 0.4)',
    modules: [
      { name: '1. Agile Methodologies & Requirement Engineering', status: 'Completed' },
      { name: '2. Unit Testing & Mocking Frameworks', status: 'In Progress' },
      { name: '3. Containerization (Docker Architecture)', status: 'Locked' },
      { name: '4. CI/CD Orchestration (GitHub Actions)', status: 'Locked' }
    ],
    resources: [
      { type: 'slides', title: 'DevOps & Pipeline Overview.pptx', size: '6.7 MB' },
      { type: 'pdf', title: 'Agile Sprint Planning Template.pdf', size: '820 KB' }
    ],
    performance: { quizScore: 72, assignmentScore: 75, attendance: 70, lastActivity: '3 days ago' },
    certification: false
  },
  {
    id: 5,
    name: 'Machine Learning & Neural Networks',
    code: 'CSE-401',
    instructor: 'Prof. Alex Mercer',
    description: 'Introduction to supervised/unsupervised learning, cost function minimization, backpropagation networks, computer vision, and NLP model training.',
    duration: '16 Weeks',
    credits: 4,
    startDate: '2026-06-01',
    endDate: '2026-10-20',
    status: 'Ongoing',
    completedLessons: 6,
    totalLessons: 30,
    assignmentsLeft: 2,
    quizCount: 3,
    attendance: 90,
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.25) 100%)',
    borderGlow: 'rgba(245, 158, 11, 0.4)',
    modules: [
      { name: '1. Linear Regression & Gradient Descent', status: 'Completed' },
      { name: '2. Deep Neural Net Backpropagation Math', status: 'In Progress' },
      { name: '3. Convolutional Architectures (CNN)', status: 'Locked' },
      { name: '4. Transformer Networks & LLM Architectures', status: 'Locked' }
    ],
    resources: [
      { type: 'pdf', title: 'ML Mathematical Foundations.pdf', size: '3.5 MB' }
    ],
    performance: { quizScore: 82, assignmentScore: 85, attendance: 90, lastActivity: 'Yesterday' },
    certification: false
  },
  {
    id: 6,
    name: 'Cryptography & Cyber Security',
    code: 'CSE-402',
    instructor: 'Dr. Evelyn Stark',
    description: 'Symmetric & asymmetric key encryption, RSA algorithms, cryptographic hashing, SSL/TLS handshake protocols, and digital signature authentication schemes.',
    duration: '14 Weeks',
    credits: 3,
    startDate: '2026-09-01',
    endDate: '2026-12-20',
    status: 'Completed',
    completedLessons: 25,
    totalLessons: 25,
    assignmentsLeft: 0,
    quizCount: 4,
    attendance: 94,
    gradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.25) 0%, rgba(100, 116, 139, 0.25) 100%)',
    borderGlow: 'rgba(148, 163, 184, 0.4)',
    modules: [
      { name: '1. Classical Ciphers & Public Key RSA', status: 'Completed' },
      { name: '2. Cryptographic Hash Functions & MACs', status: 'Completed' },
      { name: '3. Protocol Security & Vulnerabilities', status: 'Completed' },
      { name: '4. Security Operations & Threat Assessment', status: 'Completed' }
    ],
    resources: [
      { type: 'pdf', title: 'Intro to Cryptography.pdf', size: '2.8 MB' }
    ],
    performance: { quizScore: 88, assignmentScore: 90, attendance: 94, lastActivity: 'Completed' },
    certification: true
  }
];

// Mock schedule indicators (used in top header stats cards computation)
const scheduleData = [
  { id: 1, course: 'Database Management Systems', status: 'Live Soon' }
];

// Mock tasks count (used in top header stats cards computation)
const pendingAssignments = [
  { id: 1, priority: 'High' },
  { id: 2, priority: 'Medium' },
  { id: 3, priority: 'Low' }
];

// Mock Download Archives to build a beautiful resources library section
const resourceData = [
  { id: 1, title: 'All Lectures Pack (ZIP)', code: 'CSE-301', size: '14.5 MB', type: 'zip', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  { id: 2, title: 'Indexing Lecture Video', code: 'CSE-302', size: '1h 45m', type: 'video', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  { id: 3, title: 'Algorithms Cheat Sheet (PDF)', code: 'CSE-301', size: '2.1 MB', type: 'pdf', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  { id: 4, title: 'Schema Design Guide (PDF)', code: 'CSE-302', size: '1.6 MB', type: 'pdf', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' }
];

// Course card status background/border color variables mapper
const statusColors = {
  Ongoing: { text: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.25)' },
  Completed: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)' },
  Upcoming: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)' },
  Locked: { text: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.25)' }
};

export default function MyCourses() {
  // Theme state listener to dynamically adapt components to dark/light changes
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Latest Joined');

  // Role simulation state (Default to URL path matched role)
  // [Bengali Note]: ইউজার রোল সিমুলেশন স্টেট (ডিফল্টভাবে URL পাথের ওপর ভিত্তি করে সেট হয়)
  const [currentRole, setCurrentRole] = useState(() => {
    const path = window.location.pathname;
    if (path.includes('/teacher')) return 'Teacher';
    if (path.includes('/admin')) return 'Admin';
    return 'Student';
  });

  // Course database state initialized from initialCourses or localStorage
  // [Bengali Note]: কোর্স লিস্ট স্টেট যা লোকাল স্টোরেজ থেকে লোড বা সেভ হয়
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('qgenix_student_courses');
    return saved ? JSON.parse(saved) : initialCourses;
  });

  // Sync courses with localStorage
  useEffect(() => {
    localStorage.setItem('qgenix_student_courses', JSON.stringify(courses));
  }, [courses]);

  // Handler to update course status (Teacher / Admin only)
  // [Bengali Note]: কোর্স স্ট্যাটাস (Ongoing / Completed) পরিবর্তন করার হ্যান্ডলার
  const handleStatusChange = (courseId, newStatus) => {
    setCourses(prevCourses => 
      prevCourses.map(course => {
        if (course.id === courseId) {
          // Adjust completed lessons depending on status
          let completed = course.completedLessons;
          if (newStatus === 'Completed') {
            completed = course.totalLessons;
          } else if (newStatus === 'Ongoing' && course.completedLessons === course.totalLessons) {
            completed = Math.max(0, course.totalLessons - 2);
          }
          return {
            ...course,
            status: newStatus,
            completedLessons: completed
          };
        }
        return course;
      })
    );
  };

  // Modal active course selection state
  const [selectedCourse, setSelectedCourse] = useState(null);

  // State to track if we should highlight resources in the course details modal
  // [Bengali Note]: এই স্টেটটি ট্র্যাক করে যে কোর্স ডিটেইলস মোডালে রিলেটেড ক্লাস রিসোর্স হাইলাইট করা হবে কি না।
  const [shouldHighlightResources, setShouldHighlightResources] = useState(false);

  // Smoothly scroll to the resources section if launched via the "Resources" button
  // [Bengali Note]: "Resources" বাটনে ক্লিক করে মোডাল ওপেন করলে স্ক্রল করে সরাসরি রিসোর্স সেকশনে নিয়ে যায়।
  useEffect(() => {
    if (selectedCourse && shouldHighlightResources) {
      const timer = setTimeout(() => {
        const element = document.getElementById('modal-resources-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150); // slight delay to ensure the modal DOM animation finishes
      return () => clearTimeout(timer);
    }
  }, [selectedCourse, shouldHighlightResources]);

  // Reset resources highlight state when selectedCourse becomes null
  // [Bengali Note]: মোডাল বন্ধ হয়ে গেলে রিসোর্স হাইলাইট স্টেট অটো রিসেট হয়ে যায়।
  useEffect(() => {
    if (!selectedCourse) {
      setShouldHighlightResources(false);
    }
  }, [selectedCourse]);

  // Calculations for top stats cards overview
  const statsOverview = useMemo(() => {
    const total = courses.length;
    const ongoing = courses.filter(c => c.status === 'Ongoing').length;
    const completed = courses.filter(c => c.status === 'Completed').length;
    const pendingAss = pendingAssignments.length;
    const liveClasses = scheduleData.filter(s => s.status === 'Live Soon').length;
    
    return [
      { label: 'Total Enrolled', value: total, desc: 'Active Programs', trend: '+1 Elective', trendType: 'good', icon: <BookOpen size={20} />, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
      { label: 'Ongoing Courses', value: ongoing, desc: 'Currently studying', trend: 'In progress', trendType: 'neutral', icon: <Clock3 size={20} />, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
      { label: 'Completed Courses', value: completed, desc: 'Certificates earned', trend: '100% GPA Valid', trendType: 'good', icon: <CheckCircle size={20} />, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
      { label: 'Pending Tasks', value: pendingAss, desc: 'Needs submission', trend: '3 Due This Week', trendType: 'warning', icon: <AlertCircle size={20} />, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
      { label: 'Live Sessions', value: liveClasses, desc: 'Scheduled today', trend: 'Live Now', trendType: 'pulse', icon: <Video size={20} />, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' }
    ];
  }, []);

  // Filter & Sort core logic
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search query match (Case-insensitive search on Name, Code, and Instructor)
    if (searchQuery.trim() !== '') {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status category filter
    if (statusFilter !== 'All') {
      result = result.filter(c => c.status === statusFilter);
    }

    // Sorting algorithm (Alphabetical, Highest Progress, Near Deadlines)
    if (sortOption === 'Alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'Progress') {
      result.sort((a, b) => {
        const pctA = (a.completedLessons / a.totalLessons) * 100;
        const pctB = (b.completedLessons / b.totalLessons) * 100;
        return pctB - pctA;
      });
    } else if (sortOption === 'Latest Joined') {
      result.sort((a, b) => a.id - b.id);
    } else if (sortOption === 'Deadline Near') {
      result.sort((a, b) => {
        if (a.status === 'Ongoing' && b.status !== 'Ongoing') return -1;
        if (a.status !== 'Ongoing' && b.status === 'Ongoing') return 1;
        return a.assignmentsLeft - b.assignmentsLeft;
      });
    }

    return result;
  }, [courses, searchQuery, statusFilter, sortOption]);

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* ----------------------------------------------------------------------
         CUSTOM LIQUID GLASSMORPHIC LAYOUT & ANIMATION CSS STYLES
         ---------------------------------------------------------------------- */}
      <style>{`
        /* Core Liquid Glassmorphism styling rules — matched with Attendance menu's premium-card gradient style */
        .glass-card-liquid {
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
          will-change: transform;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.14),
            inset 0 12px 24px rgba(255, 255, 255, 0.02),
            inset 0 -1px 0    rgba(255, 255, 255, 0.04),
            0 8px 32px -8px   rgba(0, 0, 0, 0.4) !important;
          overflow: hidden;
          transition:
            transform    0.45s cubic-bezier(0.25, 1, 0.5, 1),
            box-shadow   0.45s cubic-bezier(0.25, 1, 0.5, 1),
            border-color 0.3s ease !important;
        }

        /* Hover micro-interactions matching the premium-card transitions */
        .glass-card-liquid:hover {
          transform: translateY(-4px) scale(1.008) !important;
          border-color: rgba(99, 170, 255, 0.35) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            inset 0 16px 32px rgba(255, 255, 255, 0.04),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 30px -5px     rgba(40, 110, 240, 0.2) !important;
        }

        /* Light mode glassy overrides */
        body.light-mode .glass-card-liquid {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid transparent !important;
          backdrop-filter: blur(32px) saturate(220%) !important;
          -webkit-backdrop-filter: blur(32px) saturate(220%) !important;
          box-shadow:
            inset 0 1.5px 0 rgba(255, 255, 255, 0.85),
            inset 0 12px 24px rgba(255, 255, 255, 0.15),
            0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .glass-card-liquid:hover {
          background: rgba(255, 255, 255, 0.42) !important;
          border-color: transparent !important;
          transform: translateY(-4px) scale(1.008) !important;
          box-shadow:
            inset 0 1.5px 0 rgba(255, 255, 255, 0.95),
            inset 0 16px 32px rgba(255, 255, 255, 0.22),
            0 16px 40px -12px rgba(100, 160, 220, 0.28),
            0 0 25px -8px rgba(150, 200, 250, 0.22) !important;
        }

        /* Light-mode border mask for the clean glassy edge border */
        .glass-card-liquid::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: transparent;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 2;
          transition: opacity 0.4s ease, background 0.4s ease;
          opacity: 0;
        }

        body.light-mode .glass-card-liquid::before {
          opacity: 0.85;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.85) 0%,
            rgba(255, 255, 255, 0.45) 100%
          );
        }

        body.light-mode .glass-card-liquid:hover::before {
          opacity: 1;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.45) 0%,
            rgba(99, 102, 241, 0.4) 50%,
            rgba(59, 130, 246, 0.45) 100%
          );
        }

        /* Stats Cards grid responsiveness */
        .mycourses-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 640px) {
          .mycourses-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .mycourses-stats-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        /* Single column full width main content layout (since sticky sidebar was removed) */
        .mycourses-main-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Courses grid configuration (3 columns on desktop, 2 on tablet, 1 on mobile) */
        .course-cards-responsive-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .course-cards-responsive-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1100px) {
          .course-cards-responsive-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Resources library list grid - 4 columns on desktop, 2 on tablet, 1 on mobile */
        .resources-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .resources-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .resources-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Floating orbs for background glow accents */
        .glow-orb-purple {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb-blue {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
        }

        /* Glowing dots on progress tracks */
        .liquid-progress-tip {
          box-shadow: 0 0 10px #3B82F6, 0 0 20px #8B5CF6;
        }

        /* Modal blur overlay and drawer details styles */
        .modal-blur-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(8, 12, 21, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 999;
          padding: 16px;
        }

        .glass-detail-modal {
          background: rgba(13, 20, 38, 0.85);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8);
          border-radius: 24px !important;
          max-width: 672px !important;
          width: 100% !important;
          padding: 28px !important;
          max-height: 90vh !important;
          gap: 20px !important;
        }

        body.light-mode .glass-detail-modal {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        /* 
          [CHANGE: Added Premium Close Button Style]
          This styles the top right modal close button (X) to properly contrast with the dark background
          and features a smooth rotation transition, transparent red hover background, and subtle glow.
          [Bengali Note]: মোডালের ক্লোজ বাটনের জন্য ব্যাকগ্রাউন্ডের সাথে সামঞ্জস্যপূর্ণ প্রিমিয়াম গ্লাস স্টাইল ও রোটেশন অ্যানিমেশন।
        */
        .btn-close-modal {
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: rgba(255, 255, 255, 0.8) !important;
          border-radius: 50% !important;
          width: 36px !important;
          height: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1) !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
        }

        .btn-close-modal:hover {
          background: rgba(239, 68, 68, 0.2) !important; /* Soft semi-transparent red on hover */
          border-color: rgba(239, 68, 68, 0.4) !important;
          color: #ffffff !important;
          transform: rotate(90deg) scale(1.08) !important; /* Rotates the X icon on hover */
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.3) !important;
        }

        .btn-close-modal:active {
          transform: rotate(90deg) scale(0.95) !important;
        }

        /* 
          [CHANGE: Close Button Light Mode Overrides]
          Adjusts the colors of the modal close button for light mode.
          [Bengali Note]: লাইট মোডে ক্লোজ বাটনের মানানসই রঙের ওভাররাইড।
        */
        body.light-mode .btn-close-modal {
          background: rgba(0, 0, 0, 0.05) !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          color: rgba(0, 0, 0, 0.6) !important;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05) !important;
        }

        body.light-mode .btn-close-modal:hover {
          background: rgba(239, 68, 68, 0.1) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
          color: #ef4444 !important;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.15) !important;
        }

        /* Hide generic scrollbars in syllabus drawers */
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* 
          [CHANGE: Centralized Button Styles]
          The .btn-glass-cta styles have been moved to src/index.css for global consistency and cleaner rendering.
          [Bengali Note]: বাটন স্টাইলগুলোকে বৈশ্বিক ধারাবাহিকতা এবং ক্লিনার রেন্ডারিং এর জন্য src/index.css ফাইলে নিয়ে যাওয়া হয়েছে।
        */

        /* Resources CTA Button hover animations */
        /* [Bengali Note]: "Resources" বাটনের আকর্ষণীয় হোভার ইফেক্ট ও শ্যাডো গ্লো */
        .btn-resources-cta {
          border-radius: 9999px !important;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }
        .btn-resources-cta:hover {
          transform: translateY(-2.5px) scale(1.03) !important;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.45), 0 0 15px rgba(139, 92, 246, 0.35) !important;
          filter: brightness(1.18);
        }
        .btn-resources-cta:active {
          transform: translateY(0) scale(0.97) !important;
        }

        /* Resources section highlight animation inside details modal */
        /* [Bengali Note]: মোডাল ওপেন হলে রিসোর্স সেকশন হাইলাইট করার জন্য প্রিমিয়াম সলিড গ্লোয়িং অ্যানিমেশন */
        .resources-highlighted {
          border: 1px solid rgba(139, 92, 246, 0.35) !important;
          background: linear-gradient(
            135deg,
            rgba(10, 20, 42, 0.45) 0%,
            rgba(6, 12, 28, 0.55) 100%
          ) !important;
          box-shadow: 
            inset 0 1.5px 0 rgba(255, 255, 255, 0.05),
            0 8px 32px -8px rgba(0, 0, 0, 0.5),
            0 0 30px rgba(139, 92, 246, 0.18) !important;
          transform: scale(1.01);
          animation: pulseGlow 3s infinite ease-in-out;
          transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }

        body.light-mode .resources-highlighted {
          border: 1px solid rgba(139, 92, 246, 0.45) !important;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(240, 244, 248, 0.5) 100%
          ) !important;
          box-shadow: 
            inset 0 1.5px 0 rgba(255, 255, 255, 0.8),
            0 8px 25px rgba(100, 160, 220, 0.1) !important;
        }

        @keyframes pulseGlow {
          0%, 100% { 
            box-shadow: 
              inset 0 1.5px 0 rgba(255, 255, 255, 0.05),
              0 8px 32px -8px rgba(0, 0, 0, 0.5),
              0 0 20px rgba(139, 92, 246, 0.12);
            border-color: rgba(139, 92, 246, 0.3);
          }
          50% { 
            box-shadow: 
              inset 0 1.5px 0 rgba(255, 255, 255, 0.08),
              0 12px 40px -8px rgba(0, 0, 0, 0.6),
              0 0 35px rgba(139, 92, 246, 0.3);
            border-color: rgba(139, 92, 246, 0.7);
          }
        }

        /* Hover micro-interactions for modal resource list items */
        /* [Bengali Note]: মোডাল ক্লাস রিসোর্স রো-গুলোর আকর্ষণীয় হোভার ইফেক্ট */
        .hover-resource-row {
          background: rgba(255, 255, 255, 0.015) !important;
          border: 1px solid rgba(255, 255, 255, 0.04) !important;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }
        
        .hover-resource-row:hover {
          background: rgba(255, 255, 255, 0.045) !important;
          border-color: rgba(139, 92, 246, 0.3) !important;
          transform: translateY(-2px) scale(1.006) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(139, 92, 246, 0.08) !important;
        }

        body.light-mode .hover-resource-row {
          background: rgba(0, 0, 0, 0.01) !important;
          border: 1px solid rgba(0, 0, 0, 0.03) !important;
        }

        body.light-mode .hover-resource-row:hover {
          background: rgba(0, 0, 0, 0.02) !important;
          border-color: rgba(139, 92, 246, 0.35) !important;
          box-shadow: 0 8px 20px rgba(100, 160, 220, 0.06) !important;
        }

        /* Modal Resource action buttons download/play styles */
        .btn-resource-action {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }

        .btn-resource-action:hover {
          background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%) !important;
          border-color: transparent !important;
          color: #fff !important;
          transform: scale(1.08) !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35) !important;
        }
        
        .btn-resource-action:hover svg {
          color: #fff !important;
          fill: #fff !important;
        }
      `}</style>

      {/* Decorative Orbs for Glowing Liquid Backgrounds */}
      <div className="glow-orb-purple" style={{ top: '10%', left: '-10%' }} />
      <div className="glow-orb-blue" style={{ bottom: '20%', right: '-10%' }} />

      {/* =======================================================================
         PAGE HEADER SECTION
         ======================================================================= */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1 relative z-10"
      >
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <GraduationCap className="text-violet-500" size={36} />
            My Courses
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            View academic progression, access study resources, and monitor core evaluation performance
          </p>
        </div>

        {/* Simulator mode selection box */}
        {/* [Bengali Note]: ড্যাশবোর্ড রোল সিমুলেটর (Student, Teacher, Admin মোড পরিবর্তনের জন্য) */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '9999px', 
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backdropFilter: 'blur(10px)',
          justifyContent: 'center',
          maxWidth: 'fit-content'
        }} className="self-start sm:self-center">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, padding: '0 8px' }}>
            Role View:
          </span>
          {['Student', 'Teacher', 'Admin'].map((r) => (
            <button
              key={r}
              onClick={() => setCurrentRole(r)}
              style={{
                background: currentRole === r ? 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)' : 'transparent',
                border: 'none',
                color: currentRole === r ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* =======================================================================
         1️⃣ TOP STATS OVERVIEW SECTION
         ======================================================================= */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mycourses-stats-grid relative z-10"
      >
        {statsOverview.map((stat, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5, scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="glass-card-liquid" 
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
            }}
          >
            {/* Stat card header: Label + Icon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</span>
              <div style={{ padding: '8px', borderRadius: '12px', background: stat.bg, color: stat.color, boxShadow: `0 8px 16px ${stat.color}15` }}>
                {stat.icon}
              </div>
            </div>

            {/* Stat card body: Value + Trend indicator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {stat.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Trend pill based on visual status */}
                {stat.trendType === 'good' && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp size={10} />
                    {stat.trend}
                  </span>
                )}
                {stat.trendType === 'neutral' && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Clock size={10} />
                    {stat.trend}
                  </span>
                )}
                {stat.trendType === 'warning' && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertCircle size={10} />
                    {stat.trend}
                  </span>
                )}
                {stat.trendType === 'pulse' && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping absolute left-1" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-0.5" />
                    <span className="pl-1.5">{stat.trend}</span>
                  </span>
                )}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {stat.desc}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* =======================================================================
         MAIN WORKSPACE CONTENT PANELS
         ======================================================================= */}
      <div className="mycourses-main-layout relative z-10">
        
        {/* ===================================================================
           2️⃣ SEARCH + FILTER BAR PANEL
           =================================================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="glass-card-liquid"
          style={{ padding: '16px 20px' }}
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            
            {/* Futuristic Glass Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search by course name, code, or professor..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full"
                style={{ 
                  paddingLeft: '44px', 
                  fontSize: '0.88rem', 
                  borderRadius: '14px', 
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Filtering Controls */}
            <div className="flex gap-3 flex-wrap items-center">
              
              {/* Filter Dropdown */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                <SlidersHorizontal size={14} style={{ color: 'var(--text-secondary)' }} />
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="All" style={{ background: 'var(--bg-primary)' }}>All Statuses</option>
                  <option value="Ongoing" style={{ background: 'var(--bg-primary)' }}>Ongoing</option>
                  <option value="Completed" style={{ background: 'var(--bg-primary)' }}>Completed</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                <ArrowUpDown size={14} style={{ color: 'var(--text-secondary)' }} />
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="Latest Joined" style={{ background: 'var(--bg-primary)' }}>Latest Joined</option>
                  <option value="Alphabetical" style={{ background: 'var(--bg-primary)' }}>Alphabetical</option>
                  <option value="Progress" style={{ background: 'var(--bg-primary)' }}>Highest Progress</option>
                  <option value="Deadline Near" style={{ background: 'var(--bg-primary)' }}>Deadlines Near</option>
                </select>
              </div>

            </div>
          </div>
        </motion.div>

        {/* ===================================================================
           3️⃣ COURSE GRID LIST (LIQUID GLASS TILES - UP TO 3 COLUMNS WIDE)
           =================================================================== */}
        <div className="course-cards-responsive-grid">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course) => {
              const completionPct = course.totalLessons > 0 
                ? Math.round((course.completedLessons / course.totalLessons) * 100)
                : 0;

              const statusColor = statusColors[course.status] || { text: '#fff', bg: 'rgba(0,0,0,0.1)', border: 'transparent' };

              return (
                <motion.div
                  layout
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card-liquid"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* A. Course Header Row */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', paddingRight: '85px' }}>
                    {/* Gradient icon box */}
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '16px', 
                      background: course.gradient, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: `0 8px 16px ${course.borderGlow}20`,
                      flexShrink: 0
                    }}>
                      <GraduationCap size={24} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>
                          {course.code}
                        </span>
                      </div>
                      
                      <h4 className="truncate text-base font-extrabold text-white mt-1 leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {course.name}
                      </h4>
                      
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', fontWeight: 500 }}>
                        Prof: {course.instructor}
                      </span>
                    </div>
                  </div>

                  {/* Absolute Status Badge/Editor at top-right */}
                  {/* [Bengali Note]: কার্ডের ডানপাশের উপরে সুনির্দিষ্ট স্থানে স্ট্যাটাস ড্রপডাউন বা স্ট্যাটিক ব্যাজ */}
                  <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
                    {currentRole === 'Teacher' || currentRole === 'Admin' ? (
                      <select
                        value={course.status}
                        onChange={(e) => handleStatusChange(course.id, e.target.value)}
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          padding: '4px 20px 4px 10px',
                          borderRadius: '10px',
                          background: statusColor.bg,
                          color: statusColor.text,
                          border: `1px solid ${statusColor.border}`,
                          boxShadow: `0 4px 10px ${statusColor.text}10`,
                          cursor: 'pointer',
                          outline: 'none',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(statusColor.text)}' stroke-width='3'><path d='M6 9l6 6 6-6'/></svg>")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 8px center',
                        }}
                      >
                        <option value="Ongoing" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Ongoing</option>
                        <option value="Completed" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Completed</option>
                      </select>
                    ) : (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        background: statusColor.bg,
                        color: statusColor.text,
                        border: `1px solid ${statusColor.border}`,
                        boxShadow: `0 4px 10px ${statusColor.text}10`
                      }}>
                        {course.status}
                      </span>
                    )}
                  </div>

                  {/* B. Description & Duration Info */}
                  <div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, height: '40px', overflow: 'hidden' }}>
                      {course.description}
                    </p>
                    {/* Inline schedule dates block */}
                    <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400 font-semibold">
                      <Calendar size={12} className="text-cyan-400" />
                      <span>Term: {course.startDate} — {course.endDate}</span>
                    </div>
                  </div>

                  {/* C. Progress Slider Indicator */}
                  <div style={{ background: 'rgba(255,255,255,0.015)', padding: '12px 14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justify: 'space-between', items: 'center', fontSize: '0.76rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Lessons Track</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{completionPct}%</span>
                    </div>
                    {/* Liquid gradient track background */}
                    <div style={{ width: '100%', height: '6px', background: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ 
                          height: '100%', 
                          background: course.gradient, 
                          borderRadius: '10px',
                          position: 'relative'
                        }} 
                      >
                        {/* Liquid pulse highlight on progress edge */}
                        {completionPct > 0 && completionPct < 100 && (
                          <span className="absolute right-0 top-0 bottom-0 w-2 rounded-r-md bg-white opacity-80 liquid-progress-tip" />
                        )}
                      </motion.div>
                    </div>
                    <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
                      <span>Completed Modules</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{course.completedLessons} / {course.totalLessons} Units</span>
                    </div>
                  </div>

                  {/* D. Mini Stats row */}
                  <div style={{ display: 'flex', justify: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="font-semibold">Assignments</span>
                      <span style={{ color: course.assignmentsLeft > 0 ? '#EF4444' : 'var(--text-primary)', fontWeight: 800 }}>
                        {course.assignmentsLeft > 0 ? `${course.assignmentsLeft} Pending` : 'No Pending'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', items: 'center' }}>
                      <span className="font-semibold">Quizzes</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{course.quizCount} Scheduled</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', items: 'flex-end' }}>
                      <span className="font-semibold">Attendance</span>
                      <span style={{ color: course.attendance < 75 ? '#EF4444' : '#10B981', fontWeight: 800 }}>
                        {course.attendance}% Attended
                      </span>
                    </div>
                  </div>

                  {/* E. CTA Action Buttons */}
                  <div style={{ display: 'flex', marginTop: '4px', justifyContent: 'space-between' }} className="relative z-10">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShouldHighlightResources(false);
                      }}
                      className="btn-glass-cta flex-1 flex items-center justify-center gap-2 p-2.5 text-xs font-bold"
                      style={{ color: 'var(--text-primary)', padding:6, }}
                    >
                      <FileText size={18} className="text-violet-400" />
                      <span>Course Outline</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShouldHighlightResources(true);
                      }}
                      className="btn-resources-cta flex-1.2 flex items-center justify-center gap-2 p-2.5 text-xs font-bold rounded-full active:scale-95 transition-all"
                      style={{
                        background: course.gradient,
                        border: `1px solid ${course.borderGlow}`,
                        color: '#fff',
                        boxShadow: `0 4px 15px ${course.borderGlow}20`,
                        borderRadius: '9999px',
                        padding: 6
                      }}
                    >
                      <FolderOpen size={13} />
                      <span>Resources</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ===================================================================
           4️⃣ ACADEMIC RESOURCE LIBRARY / DOWNLOAD ARCHIVES
           =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card title="Academic Resources & Archives" className="premium-card">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '-8px', marginBottom: '16px' }}>
              Access recent lecture notes, cheat sheets, schemas, and high-definition recorded class videos.
            </p>
            
            <div className="resources-grid">
              {resourceData.map((res) => (
                <div 
                  key={res.id} 
                  style={{ 
                    padding: '14px', 
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }} 
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0, flex: 1 }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '10px', 
                      background: res.bg, 
                      color: res.color, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0 
                    }}>
                      {res.type === 'video' ? <Video size={16} /> : <FileText size={16} />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }} className="truncate" title={res.title}>
                        {res.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {res.code} • {res.size}
                      </span>
                    </div>
                  </div>
                  
                  {res.type === 'video' ? (
                    <button 
                      onClick={() => alert(`Launching recorded video player for ${res.title}...`)} 
                      className="btn-glass-cta" 
                      style={{ padding: '8px', cursor: 'pointer', borderRadius: '10px' }}
                    >
                      <Play size={10} style={{ color: 'var(--text-secondary)' }} fill="var(--text-secondary)" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => alert(`Downloading archive package: ${res.title}...`)} 
                      className="btn-glass-cta" 
                      style={{ padding: '8px', cursor: 'pointer', borderRadius: '10px' }}
                    >
                      <Download size={12} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

      </div>

      {/* =======================================================================
         5️⃣ COURSE DETAILS MODAL / SYLLABUS DRAWER
         ======================================================================= */}
      <AnimatePresence>
        {selectedCourse && (
          <div 
            className="modal-blur-overlay"
          >
            {/* Modal Card Box */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="glass-detail-modal flex flex-col overflow-y-auto scrollbar-hidden"
            >
              
              {/* Modal Header */}
              {/* 
                [CHANGE: Adjusted alignment and gap]
                Added inline style gap to container to ensure a proper visual distance between the icon and text.
                [Bengali Note]: আইকন এবং টেক্সটের মাঝে সঠিক দূরত্ব বজায় রাখার জন্য gap এবং alignment ঠিক করা হয়েছে।
              */}
              <div className="flex justify-between" style={{ alignItems: 'flex-start', gap: '16px' }}>
                <div className="flex" style={{ gap: '14px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '14px', 
                    background: selectedCourse.gradient, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      {selectedCourse.code} • {selectedCourse.credits} Credits
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                      {selectedCourse.name}
                    </h3>
                  </div>
                </div>

                {/* 
                  [CHANGE: Close Button Style Update]
                  Changed className from "btn-glass-cta..." to "btn-close-modal" to apply the high-contrast
                  glassmorphic visual styling with hover animations.
                  [Bengali Note]: ক্লোজ বাটন স্টাইলিং আপডেট করা হয়েছে যাতে ব্যাকগ্রাউন্ডের সাথে বাটনটি সহজে বোঝা যায়।
                */}
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="btn-close-modal"
                  title="Close Modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body Contents */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Description and metadata */}
                <div style={{ 
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '18px',
                  padding: '16px'
                }}>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {selectedCourse.description}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Instructor Desk:</span>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>{selectedCourse.instructor}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Semester Term:</span>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>{selectedCourse.duration} ({selectedCourse.startDate} to {selectedCourse.endDate})</strong>
                    </div>
                  </div>
                </div>



                {/* Study materials checklist */}
                {/* [Bengali Note]: এই সেকশনটিতে কোর্সের ডাউনলোডের জন্য প্রয়োজনীয় সব রিসোর্স ও ফাইল থাকে */}
                <div 
                  id="modal-resources-section"
                  className={shouldHighlightResources ? 'resources-highlighted' : ''}
                  style={{
                    padding: '24px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    background: 'rgba(255, 255, 255, 0.01)',
                    transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
                  }}
                >
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    Available Class Resources
                  </h4>
                  
                  {selectedCourse.resources && selectedCourse.resources.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedCourse.resources.map((res, index) => {
                        // Dynamically resolve icon, label, and colors based on resource type
                        const isVideo = res.type === 'recorded' || res.type === 'video';
                        const isSlides = res.type === 'slides';
                        
                        let iconBg = 'rgba(239, 68, 68, 0.1)';
                        let iconColor = '#EF4444';
                        let typeText = 'PDF Document';
                        let sizeText = res.size || 'Unknown size';
                        
                        if (isSlides) {
                          iconBg = 'rgba(245, 158, 11, 0.1)';
                          iconColor = '#F59E0B';
                          typeText = 'Lecture Slides';
                        } else if (isVideo) {
                          iconBg = 'rgba(139, 92, 246, 0.1)';
                          iconColor = '#8B5CF6';
                          typeText = 'Class Recording';
                          sizeText = res.duration || 'Recorded Session';
                        }

                        return (
                          <div 
                            key={index}
                            className="hover-resource-row"
                            style={{
                              padding: '14px 18px',
                              borderRadius: '16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '16px',
                              transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0, flex: 1 }}>
                              {/* File icon with colorful backdrop */}
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '12px', 
                                background: iconBg, 
                                color: iconColor, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                flexShrink: 0 
                              }}>
                                {isVideo ? <Video size={18} /> : <FileText size={18} />}
                              </div>
                              
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: 650, color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }} className="truncate" title={res.title}>
                                  {res.title}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                  {typeText} • {sizeText}
                                </span>
                              </div>
                            </div>
                            
                            {/* Download or Play Action Button */}
                            {isVideo ? (
                              <button 
                                onClick={() => alert(`Launching recorded video player for ${res.title}...`)} 
                                className="btn-resource-action"
                                style={{
                                  padding: '10px',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  color: 'var(--text-secondary)',
                                  transition: 'all 0.3s'
                                }}
                                title="Play Session"
                              >
                                <Play size={12} fill="var(--text-secondary)" style={{ color: 'var(--text-secondary)' }} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => alert(`Downloading resource file: ${res.title}...`)} 
                                className="btn-resource-action"
                                style={{
                                  padding: '10px',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  color: 'var(--text-secondary)',
                                  transition: 'all 0.3s'
                                }}
                                title="Download File"
                              >
                                <Download size={13} style={{ color: 'var(--text-secondary)' }} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '20px', 
                      borderRadius: '16px', 
                      background: 'rgba(239, 68, 68, 0.05)', 
                      border: '1px dashed rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.84rem'
                    }}>
                      <AlertCircle size={18} className="text-rose-400" />
                      <span>No downloadable resource documents available for this course module yet.</span>
                    </div>
                  )}
                </div>


              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ============================================================================
// Results.jsx — QGenix Student Results Dashboard Component
// ============================================================================
// Designed to represent a comprehensive Student Results Hub. Contains:
//   1. Summary statistics overview cards (Exams, Average, Highest, Rank, Pass %)
//   2. Interactive results table with search, filter, and pagination
//   3. Detailed analysis panel mapping correct/wrong answers and time metrics
//   4. Interactive charts visualization (Radar for subjects, Area for progress)
//   5. Chromatic timeline tracking chronological exam occurrences
//   6. Collapsible answer sheet reviewer with question-by-question explanations
//   7. Leaderboard mapping class and department ranks with top cohort names
//   8. PDF/Marksheet downloads
//   9. Comprehensive proctoring reports with Suspicion Score and Risk badges
//   10. AI performance insights predicting future academic milestones
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষার্থীদের পরীক্ষার ফলাফল প্রদর্শন এবং বিশ্লেষণ করার জন্য তৈরি।
// এটি সম্পূর্ণ রেসপন্সিভ এবং ইন্টারঅ্যাক্টিভ চার্ট ও মক ডেটা সমৃদ্ধ।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react'; // React API library core hooks
import { motion, AnimatePresence } from 'framer-motion'; // Animation engine for smooth UI transitions
import { 
  Award, BookOpen, Calendar, Clock, Download, FileText, 
  Search, SlidersHorizontal, ArrowUpDown, ChevronDown, ChevronUp, 
  Users, Check, X, ShieldAlert, BrainCircuit, Trophy, 
  Percent, Activity, Eye, Play, ArrowRight, Sparkles
} from 'lucide-react'; // Premium UI icons library
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend
} from 'recharts'; // Chart library imports
import Card from '../../components/Card'; // QGenix custom glass card wrapper

// ----------------------------------------------------------------------------
// 1. MOCK DATA: STUDENT COMPREHENSIVE EXAMS & RESULTS DATA
// ----------------------------------------------------------------------------
const examsData = [
  {
    id: 1, // Unique identifier
    name: 'Midterm Assessment', // Exam name
    subject: 'Advanced Data Structures & Algorithms', // Academic subject
    code: 'CSE-301', // Course identifier
    date: '2026-03-15', // Exam date
    score: '45/50', // Raw score
    percentage: 90, // Percentage score
    grade: 'A+', // Academic letter grade
    status: 'Pass', // Pass status
    duration: '1h 30m', // Total exam duration
    attempt: 1, // Number of attempts
    analysis: {
      totalQuestions: 50, // Questions count
      correct: 45, // Correct questions count
      wrong: 4, // Wrong questions count
      unanswered: 1, // Unanswered questions count
      timeTaken: '1h 12m', // Duration spent
      rank: '4th', // Class rank in this exam
    },
    proctoring: {
      faceDetection: 'Optimal (100% Match)', // Face track status
      tabSwitches: 0, // Tab focus switch events count
      multiPerson: 0, // Other faces detected events
      voiceEvents: 0, // Sound events flagged
      suspicionScore: 5, // AI suspicion level
      riskLevel: 'Low Risk', // Computed risk class
    },
    insights: {
      strong: 'Graph Algorithms, Dynamic Programming', // Stongest areas
      weak: 'NP-Completeness proofs', // Weakest areas
      suggestions: 'Review NP-completeness reduction techniques; take the mock exam in QGenix Study Room.', // AI recommendations
      prediction: 'A+ (92-95%) likely in finals', // Future prediction
    },
    questions: [
      {
        q: 'Which data structure is best suited for implementing Dijkstra\'s Shortest Path algorithm efficiently?',
        options: ['A) Simple Array', 'B) Binary Heap (Min-Priority Queue)', 'C) Linked List', 'D) Hash Map'],
        submitted: 'B) Binary Heap (Min-Priority Queue)',
        correct: 'B) Binary Heap (Min-Priority Queue)',
        isCorrect: true,
        explanation: 'Dijkstra\'s algorithm requires repeatedly extracting the minimum distance vertex. A Min-Priority Queue implemented using a Binary Heap provides O(log V) extraction and update operations, leading to an overall complexity of O((V + E) log V).',
        classStats: '92% of the class answered correctly'
      },
      {
        q: 'What is the time complexity of searching an element in a balanced Red-Black Tree with N nodes?',
        options: ['A) O(1)', 'B) O(N)', 'C) O(log N)', 'D) O(N log N)'],
        submitted: 'C) O(log N)',
        correct: 'C) O(log N)',
        isCorrect: true,
        explanation: 'A Red-Black Tree is a self-balancing binary search tree. The maximum height is 2 * log(N + 1), ensuring that search, insertion, and deletion operations take logarithmic time O(log N).',
        classStats: '85% of the class answered correctly'
      },
      {
        q: 'In dynamic programming, what does the term "optimal substructure" mean?',
        options: [
          'A) The problem can be solved by breaking it into completely independent subproblems.',
          'B) An optimal solution to the problem contains optimal solutions to its subproblems.',
          'C) The solution can only be found in linear time.',
          'D) The state space must be discrete.'
        ],
        submitted: 'B) An optimal solution to the problem contains optimal solutions to its subproblems.',
        correct: 'B) An optimal solution to the problem contains optimal solutions to its subproblems.',
        isCorrect: true,
        explanation: 'Optimal substructure is a key property of DP. It means that the overall optimal solution can be constructed from the optimal solutions of its subproblems.',
        classStats: '78% of the class answered correctly'
      }
    ]
  },
  {
    id: 2,
    name: 'Final Semester Exam',
    subject: 'Database Management Systems',
    code: 'CSE-302',
    date: '2026-05-18',
    score: '82/100',
    percentage: 82,
    grade: 'A',
    status: 'Pass',
    duration: '2h 00m',
    attempt: 1,
    analysis: {
      totalQuestions: 100,
      correct: 82,
      wrong: 15,
      unanswered: 3,
      timeTaken: '1h 50m',
      rank: '12th',
    },
    proctoring: {
      faceDetection: 'Warnings Flagged (Temporary Absence)',
      tabSwitches: 3,
      multiPerson: 0,
      voiceEvents: 1,
      suspicionScore: 42,
      riskLevel: 'Medium Risk',
    },
    insights: {
      strong: 'SQL Queries, Relational Algebra',
      weak: 'BCNF & 4NF Normalization logic',
      suggestions: 'Review normal forms decomposition axioms; practice schema normalization quizzes.',
      prediction: 'A (80-84%) likely in final evaluation',
    },
    questions: [
      {
        q: 'A relation R is in 3NF but not in BCNF if:',
        options: [
          'A) It contains multi-valued dependencies.',
          'B) Every non-trivial functional dependency X -> Y has X as a superkey.',
          'C) A non-prime attribute is transitively dependent on a key.',
          'D) There is a functional dependency X -> A where A is a prime attribute, but X is not a superkey.'
        ],
        submitted: 'C) A non-prime attribute is transitively dependent on a key.',
        correct: 'D) There is a functional dependency X -> A where A is a prime attribute, but X is not a superkey.',
        isCorrect: false,
        explanation: 'BCNF is stricter than 3NF. In BCNF, for every functional dependency X -> A, X must be a superkey. 3NF allows X not to be a superkey if A is a prime attribute. Thus, R is in 3NF but not BCNF if X -> A exists where A is prime but X is not a superkey.',
        classStats: '45% of the class answered correctly'
      },
      {
        q: 'Which database indexing mechanism is most efficient for range queries?',
        options: ['A) Hash Indexing', 'B) B+ Tree Indexing', 'C) Linear Hashing', 'D) Bitmap Indexing'],
        submitted: 'B) B+ Tree Indexing',
        correct: 'B) B+ Tree Indexing',
        isCorrect: true,
        explanation: 'B+ Trees store data pointers in leaf nodes which are linked sequentially. This allows range queries to traverse the linked list of leaf nodes directly after finding the range start, which is highly efficient compared to Hash Indexing.',
        classStats: '88% of the class answered correctly'
      }
    ]
  },
  {
    id: 3,
    name: 'Class Test 2',
    subject: 'Computer Networks & Protocol Design',
    code: 'CSE-303',
    date: '2026-04-10',
    score: '18/20',
    percentage: 90,
    grade: 'A+',
    status: 'Pass',
    duration: '45m',
    attempt: 1,
    analysis: {
      totalQuestions: 20,
      correct: 18,
      wrong: 2,
      unanswered: 0,
      timeTaken: '38m',
      rank: '5th',
    },
    proctoring: {
      faceDetection: 'Optimal (99.5% Match)',
      tabSwitches: 1,
      multiPerson: 0,
      voiceEvents: 0,
      suspicionScore: 8,
      riskLevel: 'Low Risk',
    },
    insights: {
      strong: 'IP Subnetting, TCP Flow Control',
      weak: 'BGP Routing Protocol convergence',
      suggestions: 'Read about inter-domain routing protocols and path vector mechanics.',
      prediction: 'A+ (90-95%) performance projected',
    },
    questions: [
      {
        q: 'Which protocol is used to map an IP address to a physical MAC address in a local area network?',
        options: ['A) DHCP', 'B) DNS', 'C) ARP', 'D) ICMP'],
        submitted: 'C) ARP',
        correct: 'C) ARP',
        isCorrect: true,
        explanation: 'Address Resolution Protocol (ARP) dynamically maps network layer IP addresses to data link layer MAC addresses on a local physical segment.',
        classStats: '94% of the class answered correctly'
      }
    ]
  },
  {
    id: 4,
    name: 'Practical Assessment',
    subject: 'Software Engineering & DevOps',
    code: 'CSE-304',
    date: '2026-06-05',
    score: '22/30',
    percentage: 73,
    grade: 'B-',
    status: 'Pass',
    duration: '1h 00m',
    attempt: 1,
    analysis: {
      totalQuestions: 30,
      correct: 22,
      wrong: 8,
      unanswered: 0,
      timeTaken: '58m',
      rank: '34th',
    },
    proctoring: {
      faceDetection: 'Critical Flag (Multiple Face Switches / Absence)',
      tabSwitches: 9,
      multiPerson: 1,
      voiceEvents: 5,
      suspicionScore: 78,
      riskLevel: 'High Risk',
    },
    insights: {
      strong: 'Agile concepts, Unit testing',
      weak: 'CI/CD pipeline scripts & Docker configurations',
      suggestions: 'Practice writing GitHub Action workflows; review Docker networking and container mapping.',
      prediction: 'B (70-75%) performance projected unless CI/CD concepts are revised',
    },
    questions: [
      {
        q: 'Which Docker command is used to run a container in the background (detached mode)?',
        options: ['A) docker run -d', 'B) docker run -bg', 'C) docker run -detached', 'D) docker run -daemon'],
        submitted: 'A) docker run -d',
        correct: 'A) docker run -d',
        isCorrect: true,
        explanation: 'The `-d` option flags Docker to run the container in detached mode, returning the container ID and letting it run asynchronously in the background.',
        classStats: '80% of the class answered correctly'
      },
      {
        q: 'In Git, how do you download changes from a remote repository and immediately merge them into your active branch?',
        options: ['A) git fetch', 'B) git pull', 'C) git merge', 'D) git checkout'],
        submitted: 'A) git fetch',
        correct: 'B) git pull',
        isCorrect: false,
        explanation: '`git fetch` only downloads changes without merging. `git pull` performs a `git fetch` immediately followed by a `git merge` to integrate remote changes into the current working branch.',
        classStats: '68% of the class answered correctly'
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// 2. PERFORMANCE TREND & ANALYTICS DATASETS
// ----------------------------------------------------------------------------
const subjectPerformanceData = [
  { subject: 'Algorithms', student: 90, classAvg: 78 }, // Radar chart item
  { subject: 'DBMS', student: 82, classAvg: 74 },
  { subject: 'Networks', student: 90, classAvg: 80 },
  { subject: 'DevOps', student: 73, classAvg: 75 },
  { subject: 'Cryptography', student: 94, classAvg: 82 },
];

const monthlyProgressData = [
  { month: 'Jan', average: 80, highest: 95 }, // Area chart item
  { month: 'Feb', average: 83, highest: 92 },
  { month: 'Mar', average: 87, highest: 98 },
  { month: 'Apr', average: 85, highest: 94 },
  { month: 'May', average: 89, highest: 97 },
  { month: 'Jun', average: 91, highest: 98 },
];

// Leaderboard Top Performers Mock List
const leaderboardData = [
  { rank: 1, name: 'Anika Rahman', score: '95.4%', avatar: '👩‍💻', self: false },
  { rank: 2, name: 'Sajid Islam', score: '93.8%', avatar: '👨‍💻', self: false },
  { rank: 3, name: 'Tasnim Ahmed', score: '92.1%', avatar: '👩‍💻', self: false },
  { rank: 12, name: 'Rafiul Chowdhury (You)', score: '84.5%', avatar: '🎓', self: true }, // Current student marker
];

export default function Results() {
  // Theme state observer to handle light/dark switches elegantly
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    // Connect MutationObserver to watch classes on index canvas
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect(); // Disconnect listener on unmount
  }, []);

  // Table Interaction states (Filtering, Sorting, Searching, Pagination)
  const [searchQuery, setSearchQuery] = useState(''); // Text search query
  const [subjectFilter, setSubjectFilter] = useState('All'); // Subject select box filter
  const [sortOption, setSortOption] = useState('Newest'); // Order sorting option
  const [currentPage, setCurrentPage] = useState(1); // Active pagination page
  const itemsPerPage = 3; // Max table rows shown per screen page

  // Primary dynamic results state synced to localStorage
  const [exams, setExams] = useState(() => {
    const saved = localStorage.getItem('qgenix_student_results');
    return saved ? JSON.parse(saved) : examsData;
  });

  useEffect(() => {
    localStorage.setItem('qgenix_student_results', JSON.stringify(exams));
  }, [exams]);

  // Active details modal or focal exam tracking state
  const [selectedExam, setSelectedExam] = useState(() => {
    const saved = localStorage.getItem('qgenix_student_results');
    const initial = saved ? JSON.parse(saved) : examsData;
    return initial[0] || null;
  });

  // Collapsible accordion tracker state for Review section (array of open indexes)
  const [openReviewIndices, setOpenReviewIndices] = useState([0]); // Tracks index of expanded questions list

  // Download simulation loading state states
  const [downloadingType, setDownloadingType] = useState(null); // Keeps track of active download indicator

  // Sync details selection with updates
  const handleSelectExam = (exam) => {
    setSelectedExam(exam); // Set focal exam
    setOpenReviewIndices([0]); // Auto expand first question details for selected exam
  };

  // Toggle single item inside Review Section collapsible list
  const toggleReviewItem = (index) => {
    if (openReviewIndices.includes(index)) {
      setOpenReviewIndices(openReviewIndices.filter(i => i !== index)); // Remove to collapse
    } else {
      setOpenReviewIndices([...openReviewIndices, index]); // Append to expand
    }
  };

  // Search, Filter, Sort Computed Logic
  const processedExams = useMemo(() => {
    let result = [...exams]; // Shallow copy dynamic exam state records

    // A. Filter matching search query text
    if (searchQuery.trim() !== '') {
      result = result.filter(exam => 
        exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // B. Filter matching selected subject categories
    if (subjectFilter !== 'All') {
      result = result.filter(exam => exam.code === subjectFilter);
    }

    // C. Reorder arrays matching sorting criteria
    if (sortOption === 'Newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === 'Oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === 'Highest Score') {
      result.sort((a, b) => b.percentage - a.percentage);
    } else if (sortOption === 'Lowest Score') {
      result.sort((a, b) => a.percentage - b.percentage);
    }

    return result; // Return final ordered list
  }, [exams, searchQuery, subjectFilter, sortOption]);

  // Paginated elements calculation
  const totalPages = Math.max(1, Math.ceil(processedExams.length / itemsPerPage));
  const paginatedExams = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedExams.slice(startIndex, startIndex + itemsPerPage); // Return range slice
  }, [processedExams, currentPage]);

  // Handle page resets when filters change
  useEffect(() => {
    setCurrentPage(1); // Go back to page 1
  }, [searchQuery, subjectFilter, sortOption]);

  // Simulated download action launcher
  const launchDownload = (type) => {
    setDownloadingType(type); // Toggle loading spinner
    setTimeout(() => {
      setDownloadingType(null); // Turn off indicator
      alert(`Success: Simulated download completed for Rafiul's ${type}!`); // Show success message
    }, 1500); // 1.5s delay
  };

  return (
    // Top container wrapper applying standard flex direction gap spacing
    <div className="flex-col gap-6" style={{ display: 'flex', width: '100%', position: 'relative' }}>
      
      {/* ----------------------------------------------------------------------
         CUSTOM LIQUID GLASSMORPHIC STYLING OVERRIDES FOR RESULTS PAGE
         ---------------------------------------------------------------------- */}
      <style>{`
        /* Glass card liquid wrapper base with backdrop-blur transitions */
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

        /* Hover animations for micro-interactions */
        .glass-card-liquid:hover {
          transform: translateY(-4px) scale(1.008) !important;
          border-color: rgba(99, 170, 255, 0.35) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            inset 0 16px 32px rgba(255, 255, 255, 0.04),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 30px -5px     rgba(40, 110, 240, 0.2) !important;
        }

        /* Light mode glass panel overrides */
        body.light-mode .glass-card-liquid {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid transparent !important;
          backdrop-filter: blur(32px) saturate(220%) !important;
          box-shadow:
            inset 0 1.5px 0 rgba(255, 255, 255, 0.85),
            inset 0 12px 24px rgba(255, 255, 255, 0.15),
            0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .glass-card-liquid:hover {
          background: rgba(255, 255, 255, 0.42) !important;
          border-color: transparent !important;
          box-shadow:
            inset 0 1.5px 0 rgba(255, 255, 255, 0.95),
            inset 0 16px 32px rgba(255, 255, 255, 0.22),
            0 16px 40px -12px rgba(100, 160, 220, 0.28),
            0 0 25px -8px rgba(150, 200, 250, 0.22) !important;
        }

        /* Decorative glowing light orb accents */
        .results-glow-orb-purple {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(50px);
          pointer-events: none;
          z-index: 0;
        }

        .results-glow-orb-blue {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(50px);
          pointer-events: none;
          z-index: 0;
        }

        /* Table standard styling rules for proper spacing and layout */
        .results-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .results-table th {
          font-family: var(--font-heading);
          color: var(--text-secondary);
          font-weight: 700;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .results-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
          transition: background 0.2s ease;
        }

        /* Hover highlight indicator for selected or interactive rows */
        /* [CHANGE: Added transparent border-left by default to prevent vertical layout calculation jumps during active selection] */
        /* [Bengali Note]: সিলেক্ট করার সময় টেবিল রো যাতে এদিক-ওদিক সরে না যায় বা স্ক্রিন জাম্প না করে, সেজন্য ডিফল্টভাবে ট্রান্সপারেন্ট বর্ডার রাখা হয়েছে। */
        .results-table-row {
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent !important;
        }

        .results-table-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        body.light-mode .results-table-row:hover {
          background: rgba(0, 0, 0, 0.015);
        }

        /* [CHANGE: Only update the border-left-color on selection to keep layout stable] */
        /* [Bengali Note]: সিলেকশনে শুধু বর্ডার কালার পরিবর্তন করা হবে। */
        .results-table-row-selected {
          background: rgba(139, 92, 246, 0.08) !important;
          border-left-color: var(--accent-primary) !important;
        }

        body.light-mode .results-table-row-selected {
          background: rgba(139, 92, 246, 0.06) !important;
        }

        /* Timeline vertical rail components */
        .timeline-rail {
          position: relative;
          padding-left: 28px;
          border-left: 2px solid var(--border-color);
        }

        /* Collapsible card header for Review section */
        .review-accordion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .review-accordion-header:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }

        body.light-mode .review-accordion-header {
          background: rgba(0, 0, 0, 0.01);
          border-color: rgba(0, 0, 0, 0.03);
        }

        body.light-mode .review-accordion-header:hover {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(0, 0, 0, 0.05);
        }

        /* 
          [CHANGE: Centralized Button Styles]
          The .btn-glass-cta styles have been moved to src/index.css for global consistency and cleaner rendering.
          [Bengali Note]: বাটন স্টাইলগুলোকে বৈশ্বিক ধারাবাহিকতা এবং ক্লিনার রেন্ডারিং এর জন্য src/index.css ফাইলে নিয়ে যাওয়া হয়েছে।
        */

        /* Premium scrollbar configurations */
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Decorative Background Orbs */}
      <div className="results-glow-orb-purple" style={{ top: '15%', left: '-8%' }} />
      <div className="results-glow-orb-blue" style={{ bottom: '25%', right: '-8%' }} />

      {/* =======================================================================
         PAGE TITLE HEADER SECTION
         ======================================================================= */}
      {/* Renders main module title header with quick metadata */}
      <div className="flex justify-between items-center w-full relative z-10" style={{ paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <Trophy className="text-violet-500" size={36} />
            My Examination Results
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Track academic evaluation scores, review submitted answer scripts, and monitor proctoring records.
          </p>
        </div>
      </div>

      {/* =======================================================================
         1️⃣ STATISTICS OVERVIEW CARDS GRID
         ======================================================================= */}
      {/* 5 columns layout grid summarizing overall stats metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '20px', position: 'relative', zIndex: 10 }}>
        
        {/* Stat 1: Total Exams Attended */}
        <div className="glass-card-liquid" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Exams</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>4 / 4</div>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              100% Completion Rate
            </span>
          </div>
        </div>

        {/* Stat 2: Average Score */}
        <div className="glass-card-liquid" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Average Score</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <Percent size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>83.8%</div>
            <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              A Grade Equivalent
            </span>
          </div>
        </div>

        {/* Stat 3: Highest Score */}
        <div className="glass-card-liquid" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Highest Score</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <Trophy size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>94%</div>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              CSE-402 Cryptography
            </span>
          </div>
        </div>

        {/* Stat 4: Overall Rank */}
        <div className="glass-card-liquid" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Overall Rank</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              <Users size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>12th / 120</div>
            <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              Top 10% of Department
            </span>
          </div>
        </div>

        {/* Stat 5: Pass Percentage */}
        <div className="glass-card-liquid" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pass Status</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <Activity size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>100%</div>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              No Pending Retakes
            </span>
          </div>
        </div>

      </div>

      {/* =======================================================================
         MAIN PAGE SPLIT LAYOUT (TABLE & SELECTIONS vs DETAILS SIDEBAR)
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', position: 'relative', zIndex: 10 }} className="lg:grid-cols-[1.5fr_1fr]">
        
        {/* Left Hand Container Column (Table, Charts, Leaderboard) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* ===================================================================
             2️⃣ EXAMS RESULTS TABLE PANEL
             =================================================================== */}
          <Card title="Exam Marks & Grades Database">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              
              {/* Table Search & Filter Controls Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                
                {/* Search Bar Input */}
                <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search exams, subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Dropdown select filters */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  
                  {/* Subject Filter */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                    <SlidersHorizontal size={14} style={{ color: 'var(--text-secondary)' }} />
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="All" style={{ background: 'var(--bg-primary)' }}>All Subjects</option>
                      <option value="CSE-301" style={{ background: 'var(--bg-primary)' }}>Algorithms (CSE-301)</option>
                      <option value="CSE-302" style={{ background: 'var(--bg-primary)' }}>DBMS (CSE-302)</option>
                      <option value="CSE-303" style={{ background: 'var(--bg-primary)' }}>Networks (CSE-303)</option>
                      <option value="CSE-304" style={{ background: 'var(--bg-primary)' }}>DevOps (CSE-304)</option>
                    </select>
                  </div>

                  {/* Sorting Order */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all">
                    <ArrowUpDown size={14} style={{ color: 'var(--text-secondary)' }} />
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="Newest" style={{ background: 'var(--bg-primary)' }}>Newest First</option>
                      <option value="Oldest" style={{ background: 'var(--bg-primary)' }}>Oldest First</option>
                      <option value="Highest Score" style={{ background: 'var(--bg-primary)' }}>Highest Marks</option>
                      <option value="Lowest Score" style={{ background: 'var(--bg-primary)' }}>Lowest Marks</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Responsive Table Container wrapper */}
              <div style={{ overflowX: 'auto', width: '100%' }} className="scrollbar-hidden">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Exam Name</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Raw Score</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExams.length > 0 ? (
                      paginatedExams.map((exam) => {
                        const isSelected = selectedExam && selectedExam.id === exam.id; // Check if selected
                        return (
                          <tr 
                            key={exam.id}
                            className={`results-table-row ${isSelected ? 'results-table-row-selected' : ''}`}
                            onClick={() => handleSelectExam(exam)} // Focus on row click
                          >
                            <td style={{ fontWeight: '700' }}>{exam.name}</td>
                            <td>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{exam.code}</span>
                              <span style={{ fontSize: '0.82rem' }}>{exam.subject}</span>
                            </td>
                            <td>{exam.date}</td>
                            <td style={{ fontWeight: '700' }}>{exam.score}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: '700' }}>{exam.percentage}%</span>
                                {/* Linear progress bar segment inside cell */}
                                <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: `${exam.percentage}%`, height: '100%', background: 'linear-gradient(to right, #8B5CF6, #3B82F6)', borderRadius: '4px' }} />
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                background: exam.grade.startsWith('A') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                                color: exam.grade.startsWith('A') ? '#10B981' : '#3B82F6',
                                fontWeight: '800',
                                fontSize: '0.78rem'
                              }}>
                                {exam.grade}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                background: exam.status === 'Pass' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                color: exam.status === 'Pass' ? '#10B981' : '#ef4444',
                                fontWeight: '800',
                                fontSize: '0.75rem'
                              }}>
                                {exam.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); // Avoid triggering double click
                                  handleSelectExam(exam); // Focus exam
                                }}
                                /* [CHANGE: Added gap: '6px' in style to ensure space between eye icon and Details text is rendered even without Tailwind configurations] */
                                /* [Bengali Note]: আইকন এবং লেখার মাঝখানে ডাবল স্পেসিং এর জন্য gap: '6px' যুক্ত করা হয়েছে। */
                                className="btn-glass-cta flex items-center gap-1.5"
                                style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'inline-flex', borderRadius: '10px', gap: '6px' }}
                              >
                                <Eye size={12} className="text-violet-400" />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textRendering: 'optimizeSpeed', textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          No matching exam scores found in results database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination row controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Showing Page {currentPage} of {totalPages}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="btn-glass-cta"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '10px', opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="btn-glass-cta"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '10px', opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>
          </Card>

          {/* ===================================================================
             4️⃣ PERFORMANCE ANALYTICS (VISUAL INTERACTIVE CHARTS)
             =================================================================== */}
          {/* Dual column layouts grid containing RADAR proficiency chart and AREA progression chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Chart 1: Subject Proficiency Radar Chart */}
            <Card title="Subject-wise Competency (Student vs Cohort)">
              <div style={{ height: '300px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectPerformanceData}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 8 }} />
                    {/* Student Average proficiency dataset */}
                    <Radar 
                      name="Your Marks" 
                      dataKey="student" 
                      stroke="var(--accent-primary)" 
                      fill="var(--accent-primary)" 
                      fillOpacity={0.4} 
                    />
                    {/* Class/Cohort Average proficiency dataset */}
                    <Radar 
                      name="Class Avg" 
                      dataKey="classAvg" 
                      stroke="var(--accent-secondary)" 
                      fill="var(--accent-secondary)" 
                      fillOpacity={0.15} 
                    />
                    <Tooltip 
                      contentStyle={{
                        background: isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 2: Cumulative Progress Area Chart */}
            <Card title="Monthly Performance progression">
              <div style={{ height: '300px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyProgressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[50, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{
                        background: isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px'
                      }}
                    />
                    <defs>
                      <linearGradient id="gpaTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="average" 
                      stroke="#8B5CF6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#gpaTrendGrad)" 
                      name="Your Avg" 
                    />
                    <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '10px' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>

          {/* ===================================================================
             7️⃣ RANK & LEADERBOARD PANEL
             =================================================================== */}
          <Card title="Academic Cohort Leaderboard">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              
              {/* Leaderboard metadata metrics */}
              {/* [CHANGE: Swapped grid to flex with justify-content space-between to align metrics to opposite edges of the card] */}
              {/* [Bengali Note]: ক্লাস র‍্যাংক এবং ডিপার্টমেন্ট র‍্যাংক মেট্রিকে দুই পাশে ছড়িয়ে দিতে গ্রিড পরিবর্তন করে জাস্টিফাই স্পেস-বিটুইন করা হয়েছে। */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Class Rank</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>12th / 120 Students</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Department Rank</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>15th / 360 Students</span>
                </div>
              </div>

              {/* Table list rows mapping leaderboard */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {leaderboardData.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: item.self ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: item.self ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                      boxShadow: item.self ? '0 0 15px rgba(139, 92, 246, 0.1)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: item.rank === 1 ? 'gold' : item.rank === 2 ? 'silver' : item.rank === 3 ? '#CD7F32' : 'rgba(255,255,255,0.05)',
                        color: item.rank <= 3 ? '#000' : 'var(--text-secondary)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '0.78rem',
                        fontWeight: '800'
                      }}>
                        {item.rank}
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>{item.avatar}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: item.self ? '800' : '600', color: 'var(--text-primary)' }}>
                        {item.name}
                      </span>
                    </div>
                    
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: item.self ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </Card>

        </div>

        {/* Right Hand Container Column (Active details tracking pane) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 
            [CHANGE: Removed Detailed Performance Details Card per user request]
            [Bengali Note]: ব্যবহারকারীর অনুরোধে 'Detailed Performance Details' কার্ডটি এই অংশ থেকে সরিয়ে ফেলা হয়েছে।
          */}

          {/* 
            [CHANGE: Removed AI Remote Proctoring Audit Card per user request]
            [Bengali Note]: ব্যবহারকারীর অনুরোধে 'AI Remote Proctoring Audit' কার্ডটি এই অংশ থেকে সরিয়ে ফেলা হয়েছে।
          */}

          {/* 
            [CHANGE: Removed QGenix AI Performance Insights Card per user request]
            [Bengali Note]: ব্যবহারকারীর অনুরোধে 'QGenix AI Performance Insights' কার্ডটি এই অংশ থেকে সরিয়ে ফেলা হয়েছে।
          */}

          {/* ===================================================================
             8️⃣ DOWNLOAD SECTION PANEL
             =================================================================== */}
          <Card title="Academics Documents & Downloads">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              
              {/* Doc 1: Result PDF */}
              <button
                disabled={downloadingType !== null}
                onClick={() => launchDownload('Result PDF')}
                className="btn-glass-cta flex items-center justify-between w-full"
                style={{ padding: '12px 16px', borderRadius: '12px' }}
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-rose-400" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>Official Exam Result Report (PDF)</span>
                </div>
                {downloadingType === 'Result PDF' ? (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Downloading...</span>
                ) : (
                  <Download size={14} style={{ color: 'var(--text-secondary)' }} />
                )}
              </button>

              {/* Doc 2: Marksheet */}
              <button
                disabled={downloadingType !== null}
                onClick={() => launchDownload('Marksheet')}
                className="btn-glass-cta flex items-center justify-between w-full"
                style={{ padding: '12px 16px', borderRadius: '12px' }}
              >
                <div className="flex items-center gap-3">
                  <Award size={16} className="text-cyan-400" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>Grade Marksheet Transcript</span>
                </div>
                {downloadingType === 'Marksheet' ? (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Downloading...</span>
                ) : (
                  <Download size={14} style={{ color: 'var(--text-secondary)' }} />
                )}
              </button>

              {/* Doc 3: Academic Transcript */}
              <button
                disabled={downloadingType !== null}
                onClick={() => launchDownload('Transcript')}
                className="btn-glass-cta flex items-center justify-between w-full"
                style={{ padding: '12px 16px', borderRadius: '12px' }}
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={16} className="text-emerald-400" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>Cumulative Academic Transcript (ZIP)</span>
                </div>
                {downloadingType === 'Transcript' ? (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Downloading...</span>
                ) : (
                  <Download size={14} style={{ color: 'var(--text-secondary)' }} />
                )}
              </button>

            </div>
          </Card>

        </div>

      </div>

      {/* 
        [CHANGE: Removed Answer Script Review Card per user request]
        [Bengali Note]: ব্যবহারকারীর অনুরোধে 'Answer Script Review' কার্ডটি এই অংশ থেকে সরিয়ে ফেলা হয়েছে।
      */}

      {/* =======================================================================
         5️⃣ EXAMS HISTORY TIMELINE PANEL
         ======================================================================= */}
      {/* Chronicles past examinations using vertical rail indicator nodes */}
      <Card title="Past Examinations History Timeline">
        <div style={{ marginTop: '8px' }}>
          <div className="timeline-rail">
            {examsData.map((ex, idx) => {
              const isActive = selectedExam && selectedExam.id === ex.id; // Check if row is selected
              return (
                <div 
                  key={ex.id}
                  style={{
                    position: 'relative',
                    marginBottom: idx === examsData.length - 1 ? 0 : '24px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectExam(ex)} // Update focals
                >
                  {/* Glowing absolute node pin */}
                  <div style={{
                    position: 'absolute',
                    left: '-34px',
                    top: '4px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isActive ? '#8B5CF6' : 'rgba(255,255,255,0.2)',
                    boxShadow: isActive ? '0 0 10px #8B5CF6, 0 0 20px #8B5CF6' : 'none',
                    border: '2px solid var(--bg-primary)',
                    zIndex: 2,
                    transition: 'all 0.3s'
                  }} />

                  {/* Timeline block box */}
                  <div style={{
                    padding: '14px 18px',
                    background: isActive ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)',
                    border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid var(--border-color)',
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    transition: 'all 0.3s'
                  }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                          {ex.code} • Attempt #{ex.attempt}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>|</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{ex.date}</span>
                      </div>
                      <h4 style={{ margin: '4px 0 0 0', fontSize: '0.94rem', fontWeight: 800, color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        {ex.name} — {ex.subject}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {/* Duration stamp */}
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }} className="flex items-center gap-1">
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        {ex.duration} Spent
                      </span>
                      
                      {/* Score stamp */}
                      <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {ex.score} ({ex.percentage}%)
                      </span>

                      {/* Attempt Status badge */}
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#10B981'
                      }}>
                        Completed
                      </span>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </Card>

    </div>
  );
}

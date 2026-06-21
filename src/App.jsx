// ============================================================
// App.jsx — QGenix Application Root & Routing Configuration
// ------------------------------------------------------------
// This is the top-level component of the QGenix platform.
// It defines the entire client-side routing tree using React
// Router v6, organized into four sections:
//
//   1. Public routes  — Landing page & Login (no auth required)
//   2. Admin routes   — System administration dashboard
//   3. Teacher routes — Teaching tools & analytics dashboard
//   4. Student routes — Learning, exams & performance dashboard
//
// Each role-based dashboard uses a nested <Route> structure:
//   • The parent route renders <DashboardLayout /> which provides
//     the persistent sidebar + navbar chrome.
//   • Child routes render inside the <Outlet /> of that layout,
//     so navigation within a dashboard doesn't remount the shell.
//
// Role-specific sidebar link arrays (adminLinks, teacherLinks,
// studentLinks) are defined here and passed down to the layout.
// ============================================================

import React from 'react';
import { ProfileProvider } from './contexts/ProfileContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Lucide icons used in the sidebar navigation link definitions
import { 
  LayoutDashboard, Users, Settings, BookOpen, FileText, 
  CheckSquare, Calendar, TrendingUp, CalendarCheck, 
  Award, Clock, Bell, MessageSquare, FolderOpen, BrainCircuit, User, LogOut
} from 'lucide-react';

// ==================== LAYOUT ====================
// Shared dashboard layout (sidebar + navbar + outlet)
import DashboardLayout from './layouts/DashboardLayout';

// ==================== PUBLIC PAGES ====================
// Pages accessible without authentication
import Landing from './pages/Landing';         // Marketing / hero landing page
import Login from './pages/Auth/Login';        // Authentication / login form
import GetStarted from './pages/GetStarted';  // Pricing & free-trial page

// ==================== ADMIN PAGES ====================
// Pages for system administrators
import AdminDashboard from './pages/Admin/Dashboard';       // Admin overview with system stats
import UserManagement from './pages/Admin/UserManagement';  // CRUD for users (teachers, students)
import AdminSettings from './pages/Admin/Settings';         // Platform-wide configuration

// ==================== TEACHER PAGES ====================
// Pages for teachers / instructors
import TeacherDashboard from './pages/Teacher/Dashboard';        // Teacher overview & quick stats
import ResourceManager from './pages/Teacher/ResourceManager';   // Upload & manage teaching materials
import TeacherAttendance from './pages/Teacher/Attendance';      // Mark & review student attendance
import AIExamGenerator from './pages/Teacher/AIExamGenerator';   // AI-powered question & exam builder
import EvaluationCenter from './pages/Teacher/EvaluationCenter'; // Grade submissions & provide feedback
import TeacherAnalytics from './pages/Teacher/Analytics';        // Class performance insights & charts
import TeacherCourses from './pages/Teacher/Courses';            // Teacher assigned courses & notes management
import TeacherStudents from './pages/Teacher/Students';          // Teacher student roster and status panel
import TeacherExams from './pages/Teacher/Exams';                // Teacher examinations and routines manager portal
import TeacherAssignments from './pages/Teacher/Assignments';    // Teacher assignments manager portal component
import TeacherResults from './pages/Teacher/Results';            // Teacher results and grade sheets manager component
import TeacherRoutine from './pages/Teacher/Routine';            // Teacher routine and planner component
import TeacherNotices from './pages/Teacher/Notices';            // Teacher notices manager component
import TeacherProfile from './pages/Teacher/Profile';            // Teacher profile component

// ==================== STUDENT PAGES ====================
// Pages for students / learners
import StudentDashboard from './pages/Student/Dashboard';   // Student overview with upcoming tasks
import ExamCenter from './pages/Student/ExamCenter';        // Take exams & view results
import StudentAnalytics from './pages/Student/Analytics';   // Personal performance tracking
import StudyRoom from './pages/Student/StudyRoom';          // AI-assisted study environment
import Attendance from './pages/Student/Attendance';        // View personal attendance records
import MyCourses from './pages/Student/MyCourses';          // Student enrolled courses & details page
import Results from './pages/Student/Results';              // Student comprehensive exam results hub
// English: Imported new Assignments page component.
// Bengali: নতুন অ্যাসাইনমেন্টস পেজ কম্পোনেন্ট ইম্পোর্ট করা হয়েছে।
import Assignments from './pages/Student/Assignments';      // Student assignment management center
import Routine from './pages/Student/Routine';              // Student academic routine & planner page
import Notices from './pages/Student/Notices';              // Student notice board component
import Resources from './pages/Student/Resources';            // Student academic resources component
import AIAssistant from './pages/Student/AIAssistant';        // Student AI-driven performance advisor component
import Profile from './pages/Student/Profile';                // Student Profile component



// ============================================================
// SIDEBAR NAVIGATION LINK DEFINITIONS
// ------------------------------------------------------------
// Each array defines the links shown in the sidebar for a
// specific role. Every link object contains:
//   • path  — URL route to navigate to
//   • label — Display text in the sidebar
//   • icon  — Lucide React icon component (20px)
// ============================================================

// Admin sidebar links — system-level management tools
const adminLinks = [
  { path: '/admin', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { path: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
  { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
];

// Teacher sidebar links — instructional & evaluation tools
const teacherLinks = [
  { path: '/teacher', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/teacher/resources', label: 'Resource Manager', icon: <BookOpen size={20} /> },
  { path: '/teacher/attendance', label: 'Attendance', icon: <CalendarCheck size={20} /> },
  { path: '/teacher/generator', label: 'Questions Generator', icon: <FileText size={20} /> },
  { path: '/teacher/courses', label: 'Courses', icon: <BookOpen size={20} /> },
  { path: '/teacher/students', label: 'Students', icon: <Users size={20} /> },
  { path: '/teacher/exams', label: 'Exams', icon: <FileText size={20} /> },
  { path: '/teacher/assignments', label: 'Assignments', icon: <CheckSquare size={20} /> },
  { path: '/teacher/results', label: 'Result', icon: <Award size={20} /> },
  { path: '/teacher/routine', label: 'Routine', icon: <Clock size={20} /> },
  { path: '/teacher/notices', label: 'Notice', icon: <Bell size={20} /> },
  { path: '/teacher/reports', label: 'Report', icon: <TrendingUp size={20} /> },
  { path: '/teacher/profile', label: 'Profile', icon: <User size={20} /> },
  { path: '/login', label: 'Logout', icon: <LogOut size={20} /> },
];

// Student sidebar links — learning, exams, notifications, resources & routine tools
// English: Removed "Calendar" and "Messages" options from the student links sidebar array as requested.
// Bengali: ব্যবহারকারীর অনুরোধ অনুযায়ী স্টুডেন্ট সাইডবার লিংক অ্যারে থেকে "Calendar" এবং "Messages" অপশন দুটি মুছে ফেলা হয়েছে।
const studentLinks = [
  { path: '/student', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/student/attendance', label: 'Attendance', icon: <CalendarCheck size={20} /> },
  { path: '/student/courses', label: 'My Courses', icon: <BookOpen size={20} /> },
  { path: '/student/results', label: 'Results', icon: <Award size={20} /> },
  { path: '/student/assignments', label: 'Assignments', icon: <CheckSquare size={20} /> },
  { path: '/student/routine', label: 'Routine', icon: <Clock size={20} /> },
  { path: '/student/exams', label: 'Exams', icon: <FileText size={20} /> },
  { path: '/student/notices', label: 'Notices', icon: <Bell size={20} /> },
  { path: '/student/resources', label: 'Resources', icon: <FolderOpen size={20} /> },
  { path: '/student/ai-assistant', label: 'AI Assistant', icon: <BrainCircuit size={20} /> },
  { path: '/student/profile', label: 'Profile', icon: <User size={20} /> },
  { path: '/login', label: 'Logout', icon: <LogOut size={20} /> },
];

// ============================================================
// COMING SOON PLACEHOLDER COMPONENT
// ------------------------------------------------------------
// Simple, beautifully styled glass panel for dashboard sub-modules
// that are currently being integrated.
// ============================================================
function ComingSoon({ title }) {
  return (
    <div className="glass-panel premium-card" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.95rem', lineHeight: '1.5' }}>
        The {title} dashboard view is currently under construction and will be fully integrated shortly. Thank you for your patience!
      </p>
    </div>
  );
}

// ============================================================
// APP COMPONENT — MAIN ROUTING TREE
// ============================================================
function App() {
  return (
    // BrowserRouter (aliased as Router) enables client-side routing
    // using the HTML5 History API for clean URLs (no hash fragments)
    <Router>
      <ProfileProvider>
        <Routes>

          {/* ==================== PUBLIC ROUTES ==================== */}
          {/* These routes are accessible to all visitors without login */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/get-started" element={<GetStarted />} />

          {/* ==================== ADMIN ROUTES ==================== */}
          {/* Parent route renders the DashboardLayout with admin-specific
              links, role label, and navbar title "System Controller".
              Child routes render inside the layout's <Outlet />. */}
          <Route path="/admin" element={<DashboardLayout links={adminLinks} role="Admin" title="System Controller" />}>
            {/* index route — matches /admin exactly → Admin overview dashboard */}
            <Route index element={<AdminDashboard />} />
            {/* /admin/users → User management CRUD interface */}
            <Route path="users" element={<UserManagement />} />
            {/* /admin/settings → Platform configuration page */}
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* ==================== TEACHER ROUTES ==================== */}
          {/* Parent route renders the DashboardLayout with teacher-specific
              links, role label, and navbar title "Command Center". */}
          <Route path="/teacher" element={<DashboardLayout links={teacherLinks} role="Teacher" title="Command Center" />}>
            {/* index route — matches /teacher exactly → Teacher dashboard */}
            <Route index element={<TeacherDashboard />} />
            {/* /teacher/resources → Upload & manage teaching materials */}
            <Route path="resources" element={<ResourceManager />} />
            {/* /teacher/generator → AI-powered exam/question generator */}
            <Route path="generator" element={<AIExamGenerator />} />
            {/* /teacher/evaluation → Grade & review student submissions */}
            <Route path="evaluation" element={<EvaluationCenter />} />
            {/* /teacher/analytics → Class performance analytics & charts */}
            <Route path="analytics" element={<TeacherAnalytics />} />
            {/* /teacher/attendance → Mark & review attendance records */}
            <Route path="attendance" element={<TeacherAttendance />} />
            
            {/* Newly requested teacher sub-routes */}
            <Route path="courses" element={<TeacherCourses />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="exams" element={<TeacherExams />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="results" element={<TeacherResults />} />
            <Route path="routine" element={<TeacherRoutine />} />
            <Route path="notices" element={<TeacherNotices />} />
            <Route path="reports" element={<ComingSoon title="Report" />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>

          {/* ==================== STUDENT ROUTES ==================== */}
          {/* Parent route renders the DashboardLayout with student-specific
              links, role label, and navbar title "Learning & Analytics Hub". */}
          <Route path="/student" element={<DashboardLayout links={studentLinks} role="Student" title="Learning & Analytics Hub" />}>
            {/* index route — matches /student exactly → Student dashboard */}
            <Route index element={<StudentDashboard />} />
            {/* /student/exams → Take exams & view past results */}
            <Route path="exams" element={<ExamCenter />} />
            {/* /student/analytics → Personal performance tracking */}
            <Route path="analytics" element={<StudentAnalytics />} />
            {/* /student/study-room → AI-assisted study environment */}
            <Route path="study-room" element={<StudyRoom />} />
            {/* /student/attendance → View personal attendance log */}
            <Route path="attendance" element={<Attendance />} />
            
            {/* Newly requested sidebar sub-routes, mapping to appropriate components or ComingSoon placeholders */}
            <Route path="courses" element={<MyCourses />} />
            <Route path="results" element={<Results />} />
            {/* 
              [CHANGE: Routed path "assignments" to render the new Assignments component]
              [Bengali Note]: রাউটার পাথে নতুন অ্যাসাইনমেন্টস পেজ ইন্টিগ্রেট করা হলো।
            */}
            <Route path="assignments" element={<Assignments />} />
            <Route path="routine" element={<Routine />} />
            <Route path="notices" element={<Notices />} />
            <Route path="calendar" element={<Attendance />} />
            <Route path="messages" element={<ComingSoon title="Messages" />} />
            <Route path="resources" element={<Resources />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<ComingSoon title="Account Settings" />} />
          </Route>

          {/* ==================== FALLBACK / CATCH-ALL ==================== */}
          {/* Any unmatched URL redirects to the landing page.
              "replace" prevents the bad URL from staying in browser history. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProfileProvider>
    </Router>
  );
}

export default App;

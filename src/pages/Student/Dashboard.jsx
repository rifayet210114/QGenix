// ============================================================================
// Dashboard.jsx — QGenix Student Dashboard
// ============================================================================
// Renders the main student overview screen with a premium, futuristic SaaS
// interface. Includes:
//   1. Dynamic Welcome Hero Section (CGPA, Term, Department details)
//   2. Six Quick Stats Grid Cards
//   3. Center Content Grid:
//      - Attendance circular progress + breakdown
//      - Performance trend (Line chart for GPA growth)
//      - Recent notices & announcements
//      - Today's schedule card
//      - Upcoming assignment deadlines with priority badges
//      - Active course enrollment progress bars
//   4. Interactive simulated QGenix AI Assistant module
// ============================================================================

import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { 
  Award, BookOpen, Calendar, Clock, FileText, CheckSquare, 
  Bell, BrainCircuit, Sparkles, ArrowRight, CheckCircle2, 
  User, Check, CornerDownRight, MessageSquare 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';

export default function StudentDashboard() {
  // Theme state detection to adapt chart styles dynamically
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // --------------------------------------------------------------------------
  // INTERACTIVE MOCK DATA & STATES
  // --------------------------------------------------------------------------

  // AI Assistant Chat Simulator state
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState(
    "Hello! I am your QGenix AI Advisor. Click one of the suggested prompts below or type a query about your academics."
  );
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Suggested prompts and predefined replies with icons matching the layout in the image
  const suggestedPrompts = [
    { 
      label: 'My Attendance', 
      query: 'attendance', 
      icon: <Calendar size={14} style={{ color: '#8B5CF6' }} /> 
    },
    { 
      label: 'My CGPA Trend', 
      query: 'cgpa', 
      icon: <Award size={14} style={{ color: '#3B82F6' }} /> 
    },
    { 
      label: 'Upcoming Exams', 
      query: 'exams', 
      icon: <FileText size={14} style={{ color: '#06B6D4' }} /> 
    },
    { 
      label: 'Weak Subjects', 
      query: 'weakness', 
      icon: <BrainCircuit size={14} style={{ color: '#F59E0B' }} /> 
    },
    { 
      label: 'Study Tips', 
      query: 'tips', 
      icon: <Sparkles size={14} style={{ color: '#10B981' }} /> 
    }
  ];

  // AI query handler with mock academic answers and a custom tips case
  const handleAiQuery = (query) => {
    setIsAiLoading(true);
    setAiResponse('');
    
    setTimeout(() => {
      setIsAiLoading(false);
      switch(query.toLowerCase()) {
        case 'attendance':
          setAiResponse("Your current attendance rate is 85.0% (102 classes attended out of 120 total). You are well above the 75% academic threshold required to sit for semester finals. Excellent attendance consistency!");
          break;
        case 'cgpa':
          setAiResponse("Your CGPA has consistently trended upwards: 1st Sem: 3.75 ➔ 2nd Sem: 3.80 ➔ 3rd Sem: 3.82 ➔ 4th Sem (Current): 3.85. Your strongest scores are in Database Management and Computer Networks.");
          break;
        case 'exams':
          setAiResponse("You have 1 upcoming midterm assessment: Advanced Physics Midterm scheduled for Friday, June 12th at 10:00 AM in Room 302. Syllabus coverage is Thermodynamics (Chapters 3 & 4).");
          break;
        case 'weakness':
          setAiResponse("Based on your assignments, your average score in Software Engineering is 72%, which is slightly lower than your other courses. I recommend scheduling a 15-minute review or practicing the mock quizzes in the QGenix study room.");
          break;
        case 'tips':
          setAiResponse("Here are some key Study Tips: 1. Use active recall to test yourself on database normal forms. 2. Space out your coding practice for Data Structures (e.g., implement 1 tree traversal daily). 3. Draw out packet flows for Computer Networks layers. You've got this!");
          break;
        default:
          setAiResponse(`Regarding "${query}": I have logged your request. Our system data suggests your academic tracking is currently optimal with a cumulative GPA of 3.72.`);
      }
    }, 800);
  };

  // Performance Trend Line Chart Data
  const gpaTrendData = [
    { semester: 'Sem 1', gpa: 3.55 },
    { semester: 'Sem 2', gpa: 3.62 },
    { semester: 'Sem 3', gpa: 3.68 },
    { semester: 'Sem 4', gpa: 3.72 },
  ];

  // Attendance Donut Chart Data
  const attendancePieData = [
    { name: 'Present', value: 85, color: '#8B5CF6' },
    { name: 'Absent', value: 15, color: 'rgba(255, 255, 255, 0.05)' }
  ];

  // Custom tooltips for line charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
          border: isLightMode ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
          padding: '8px 12px',
          borderRadius: '10px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>{payload[0].payload.semester}</div>
          <div style={{ color: '#8B5CF6', fontWeight: 700, fontSize: '0.9rem', marginTop: '2px' }}>
            GPA: {payload[0].value.toFixed(2)}
          </div>
        </div>
      );
    }
    return null;
  };

  // --------------------------------------------------------------------------
  // COMPONENT RENDERING
  // --------------------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ==================== 1. HERO SECTION ==================== */}
      <div 
        className="premium-card" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.01)', 
          borderRadius: '24px', 
          padding: '32px', 
          position: 'relative', 
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '32px',
          flexWrap: 'wrap'
        }}
      >
        {/* Animated ambient backdrop orb */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0) 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        {/* Left Column: Greeting & Action */}
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 2 }}>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Welcome back, Rafiul! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem', fontWeight: '500', maxWidth: '400px', lineHeight: 1.4 }}>
            Keep learning, keep growing. You're doing great!
          </p>
          <button 
            style={{
              width: 'fit-content',
              background: 'linear-gradient(to right, #8B5CF6, #6366F1)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.2s ease',
              marginTop: '8px'
            }}
            className="navbar-btn-hover"
            onClick={() => window.location.hash = '#/student/profile'}
          >
            View My Profile
          </button>
        </div>

        {/* Right Column: Three Custom Sub-Cards */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          zIndex: 2,
          flex: '1 1 auto',
          width: '100%',
          maxWidth: 'fit-content'
        }}>
          {/* Subcard 1: Department & Semester */}
          <div className="glass-panel" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '18px',
            padding: '16px 24px',
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            gap: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            alignItems: 'center'
          }}>
            {/* Department */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                Department
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Computer Science</span>
              </div>
            </div>
            
            {/* Semester */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                Semester
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>6th Semester</span>
              </div>
            </div>
          </div>

          {/* Subcard 2: Session */}
          <div className="glass-panel" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '18px',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            minWidth: '130px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6' }} />
              Session
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>2023-24</span>
            </div>
          </div>

          {/* Subcard 3: CGPA */}
          <div className="glass-panel" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '18px',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            minWidth: '180px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
              CGPA
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>3.72 / 4.00</span>
              <svg width="50" height="20" viewBox="0 0 50 20" fill="none" style={{ overflow: 'visible', flexShrink: 0 }}>
                <path 
                  d="M2 15 C 10 15, 12 12, 18 10 C 24 8, 30 14, 36 6 C 42 -2, 45 4, 48 1" 
                  stroke="#8B5CF6" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))' }}
                />
                <path 
                  d="M2 15 C 10 15, 12 12, 18 10 C 24 8, 30 14, 36 6 C 42 -2, 45 4, 48 1 L 48 20 L 2 20 Z" 
                  fill="url(#sparkGrad)" 
                  opacity="0.1" 
                />
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== 2. QUICK STATS CARDS ==================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Attendance */}
        <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Attendance Rate</span>
            <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}><Calendar size={18} /></div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>85%</div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: '4px' }}>✓ Above requirement</div>
          </div>
        </div>

        {/* Card 2: CGPA */}
        <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Current CGPA</span>
            <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}><Award size={18} /></div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>3.72</div>
            <div style={{ fontSize: '0.75rem', color: '#8B5CF6', fontWeight: 600, marginTop: '4px' }}>Top 8% of Department</div>
          </div>
        </div>

        {/* Card 3: Courses */}
        <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>My Courses</span>
            <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}><BookOpen size={18} /></div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>5 Courses</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>15 Credits total</div>
          </div>
        </div>

        {/* Card 4: Assignments */}
        <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assignments</span>
            <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}><CheckSquare size={18} /></div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>3 Pending</div>
            <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600, marginTop: '4px' }}>Next due in 2 days</div>
          </div>
        </div>

        {/* Card 5: Exams */}
        <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Upcoming Exams</span>
            <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}><FileText size={18} /></div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>1 Exam</div>
            <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600, marginTop: '4px' }}>Friday (Thermodynamics)</div>
          </div>
        </div>

        {/* Card 6: Notices */}
        <div className="glass-panel premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Notice Board</span>
            <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}><Bell size={18} /></div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>4 Notices</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>2 unread updates</div>
          </div>
        </div>
      </div>

       {/* ==================== 3. ROW 1: ATTENDANCE, PERFORMANCE, SCHEDULE ==================== */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        style={{ marginBottom: '24px' }}
      >
        {/* A. Attendance Overview */}
        {/* We use a custom SVG semi-circular progress bar and display metrics at the bottom */}
        {/* Added "premium-card" class to convert this section into a liquid glassmorphic card */}
        <Card 
          title="Attendance Overview" 
          className="premium-card"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', background: isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)', border: isLightMode ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}>
              <span>This Month</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1L5 5L9 1" />
              </svg>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
            {/* SVG Semi-Circular Gauge */}
            <div style={{ width: '100%', maxWidth: '200px', height: '110px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100%" height="110" viewBox="0 0 140 80" style={{ overflow: 'visible' }}>
                <defs>
                  {/* Clean gradient matching the image visualization */}
                  <linearGradient id="attendanceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                {/* Background Track */}
                <path
                  d="M 15,70 A 55,55 0 0,1 125,70"
                  fill="none"
                  stroke={isLightMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.04)'}
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Foreground Progress */}
                <path
                  d="M 15,70 A 55,55 0 0,1 125,70"
                  fill="none"
                  stroke="url(#attendanceGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="172.78"
                  strokeDashoffset={172.78 - (172.78 * 85) / 100}
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
                {/* Large Center Text */}
                <text x="70" y="52" textAnchor="middle" style={{ fill: 'var(--text-primary)', fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                  85%
                </text>
                <text x="70" y="68" textAnchor="middle" style={{ fill: 'var(--text-muted)', fontSize: '7px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Overall Attendance
                </text>
              </svg>
            </div>

            {/* Bottom count columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', width: '100%', textAlign: 'center', marginTop: '4px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>Present</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>102</div>
              </div>
              <div style={{ position: 'relative' }}>
                {/* Small red dot above absent count */}
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
                }} />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>Absent</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>18</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>Total</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>120</div>
              </div>
            </div>
          </div>
        </Card>

        {/* B. Performance Trend */}
        {/* We use an AreaChart with a custom fill gradient to show GPA progression */}
        {/* Added "premium-card" class to convert this section into a liquid glassmorphic card */}
        <Card 
          title="Performance Trend" 
          className="premium-card"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', background: isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)', border: isLightMode ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}>
              <span>Last 6 Months</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1L5 5L9 1" />
              </svg>
            </div>
          }
        >
          <div style={{ height: '175px', width: '100%', marginTop: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gpaTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLightMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.03)'} />
                <XAxis 
                  dataKey="semester" 
                  stroke={isLightMode ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.25)'} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: isLightMode ? 'var(--text-secondary)' : 'rgba(255, 255, 255, 0.6)' }}
                />
                <YAxis 
                  domain={[3.0, 4.0]} 
                  stroke={isLightMode ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.25)'} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: isLightMode ? 'var(--text-secondary)' : 'rgba(255, 255, 255, 0.6)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  {/* Curve gradient matching the purple/blue aesthetic in the screenshot */}
                  <linearGradient id="performanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="gpa" 
                  stroke="#8B5CF6" 
                  strokeWidth={3} 
                  fillOpacity={1}
                  fill="url(#performanceAreaGrad)" 
                  dot={{ r: 4, strokeWidth: 1.5, fill: isLightMode ? '#ffffff' : '#0B1120', stroke: '#8B5CF6' }} 
                  activeDot={{ r: 6, strokeWidth: 1.5, fill: '#8B5CF6', stroke: '#fff', style: { filter: 'drop-shadow(0 0 5px #8B5CF6)' } }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* C. Today's Schedule */}
        {/* We display schedule events as stylized timeline rows with left accents */}
        {/* Added "premium-card" class to convert this section into a liquid glassmorphic card */}
        <Card title="Today's Schedule" className="premium-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
            
            {/* Class 1 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '78px', 
                background: isLightMode ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.01)', 
                borderRadius: '10px', 
                padding: '6px 0', 
                borderLeft: '4px solid #3B82F6', 
                borderTop: isLightMode ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)',
                borderRight: isLightMode ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)',
                borderBottom: isLightMode ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)',
                flexShrink: 0 
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '700' }}>09:00 AM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Data Structures</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>Room 302</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block' }}>Room 302</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>Dr. Sarah Ahmed</span>
                </div>
              </div>
            </div>

            {/* Class 2 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '78px', 
                background: isLightMode ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.01)', 
                borderRadius: '10px', 
                padding: '6px 0', 
                borderLeft: '4px solid #8B5CF6', 
                borderTop: isLightMode ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)',
                borderRight: isLightMode ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)',
                borderBottom: isLightMode ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)',
                flexShrink: 0 
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '700' }}>11:00 AM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Database Systems</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>Room 405</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block' }}>Room 405</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>Prof. M. Rahman</span>
                </div>
              </div>
            </div>

            {/* Class 3 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '78px', 
                background: isLightMode ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.01)', 
                borderRadius: '10px', 
                padding: '6px 0', 
                borderLeft: '4px solid #06B6D4', 
                borderTop: isLightMode ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)',
                borderRight: isLightMode ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)',
                borderBottom: isLightMode ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)',
                flexShrink: 0 
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '700' }}>02:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Computer Networks</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>Room 101</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block' }}>Room 101</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>Dr. Karim Al-Hasan</span>
                </div>
              </div>
            </div>

            {/* View Full Routine Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <button 
                style={{
                  background: 'linear-gradient(to right, #8B5CF6, #6366F1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                className="navbar-btn-hover"
                onClick={() => window.location.hash = '#/student/routine'}
              >
                View Full Routine
              </button>
            </div>

          </div>
        </Card>
      </div>

      {/* ==================== 4. ROW 2: ANNOUNCEMENTS, DEADLINES, COURSES ==================== */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        style={{ marginBottom: '24px' }}
      >
        {/* A. Recent Announcements */}
        {/* Styled list of notices with colored circular icon indicators */}
        {/* Added "premium-card" class to convert this section into a liquid glassmorphic card */}
        <Card title="Recent Announcements" className="premium-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
            
            {/* Notice 1 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.3' }}>
                    Midterm Exam Routine Published
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>2h ago</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0, lineHeight: '1.4' }}>
                  Check your exam schedule for this semester.
                </p>
              </div>
            </div>

            {/* Notice 2 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(148, 163, 184, 0.1)',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.3' }}>
                    Holiday Notice
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>5h ago</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0, lineHeight: '1.4' }}>
                  College will remain closed on 26 May 2025.
                </p>
              </div>
            </div>

            {/* Notice 3 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.3' }}>
                    New Assignment Posted
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>1d ago</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0, lineHeight: '1.4' }}>
                  Check the DBMS assignment in your dashboard.
                </p>
              </div>
            </div>

            {/* View All Notices Link */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <a 
                href="#/student/notices" 
                style={{ fontSize: '0.82rem', fontWeight: '600', color: '#8B5CF6', textDecoration: 'none' }}
                className="navbar-btn-hover"
              >
                View All Notices
              </a>
            </div>

          </div>
        </Card>

        {/* B. Upcoming Deadlines */}
        {/* List of assignments styled with custom priority pill badges */}
        {/* Added "premium-card" class to convert this section into a liquid glassmorphic card */}
        <Card title="Upcoming Deadlines" className="premium-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
            
            {/* Assignment 1 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Data Structures Assignment 3</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Due in 2 Days</span>
              </div>
              <div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444'
                }}>
                  High
                </span>
              </div>
            </div>

            {/* Assignment 2 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Database Management Lab Report 2</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Due in 4 Days</span>
              </div>
              <div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#F59E0B'
                }}>
                  Medium
                </span>
              </div>
            </div>

            {/* Assignment 3 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Computer Networks Quiz 2</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Due in 6 Days</span>
              </div>
              <div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10B981'
                }}>
                  Low
                </span>
              </div>
            </div>

            {/* View All Assignments Link */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <a 
                href="#/student/assignments" 
                style={{ fontSize: '0.82rem', fontWeight: '600', color: '#8B5CF6', textDecoration: 'none' }}
                className="navbar-btn-hover"
              >
                View All Assignments
              </a>
            </div>

          </div>
        </Card>

        {/* C. My Courses */}
        {/* Lists current courses with progress bars showing completion status */}
        {/* Added "premium-card" class to convert this section into a liquid glassmorphic card */}
        <Card title="My Courses" className="premium-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
            
            {/* Course 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Data Structures</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>75%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: 'linear-gradient(to right, #8B5CF6, #3B82F6)', borderRadius: '10px' }} />
              </div>
            </div>

            {/* Course 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Database Management</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>60%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'linear-gradient(to right, #8B5CF6, #3B82F6)', borderRadius: '10px' }} />
              </div>
            </div>

            {/* Course 3 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Computer Networks</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>85%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'linear-gradient(to right, #8B5CF6, #3B82F6)', borderRadius: '10px' }} />
              </div>
            </div>

            {/* Course 4 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Software Engineering</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>45%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: '45%', height: '100%', background: 'linear-gradient(to right, #8B5CF6, #3B82F6)', borderRadius: '10px' }} />
              </div>
            </div>

            {/* View All Courses Link */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <a 
                href="#/student/courses" 
                style={{ fontSize: '0.82rem', fontWeight: '600', color: '#8B5CF6', textDecoration: 'none' }}
                className="navbar-btn-hover"
              >
                View All Courses
              </a>
            </div>

          </div>
        </Card>
      </div>

      {/* ==================== 5. AI ASSISTANT SECTION ==================== */}
      {/* Redesigned to support horizontal layout with custom avatar and action bubbles */}
      <div 
        className="glass-panel premium-card" 
        style={{ 
          borderRadius: '24px', 
          padding: '24px',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(139, 92, 246, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Custom avatar container with gradient fill and shadow */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2))',
            border: '1.5px solid rgba(139, 92, 246, 0.4)',
            color: '#8B5CF6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.15)'
          }}>
            <BrainCircuit size={28} />
          </div>

          {/* AI assistant branding headers */}
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500' }}>
              Hi Rafiul! I am your AI academic assistant.
            </div>
            <div style={{ color: '#8B5CF6', fontSize: '1.25rem', fontWeight: '800', marginTop: '2px', fontFamily: 'var(--font-heading)' }}>
              How can I help you today?
            </div>
          </div>
        </div>

        {/* Simulated assistant response output bubble */}
        {aiResponse && (
          <div style={{ 
            background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255, 255, 255, 0.01)', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            borderRadius: '16px', 
            padding: '16px 20px', 
            minHeight: '60px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            position: 'relative'
          }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', padding: '6px', borderRadius: '8px', marginTop: '2px', flexShrink: 0 }}>
              <Sparkles size={14} />
            </div>
            <div style={{ flex: 1 }}>
              {isAiLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '24px' }}>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>Advisor is thinking...</span>
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#8B5CF6',
                    animation: 'pulse 1s infinite alternate'
                  }} />
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {aiResponse}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Interactive query suggestions pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt.label}
              onClick={() => handleAiQuery(prompt.query)}
              style={{
                background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255, 255, 255, 0.02)',
                border: isLightMode ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '30px',
                padding: '8px 16px',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              className="navbar-btn-hover"
            >
              {prompt.icon}
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>

        {/* AI text entry box with arrow submit button */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (aiInput.trim()) {
              handleAiQuery(aiInput);
              setAiInput('');
            }
          }}
          style={{ display: 'flex', gap: '10px', position: 'relative', marginTop: '4px' }}
        >
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask anything..."
            style={{
              flex: 1,
              padding: '12px 18px',
              background: isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
              border: isLightMode ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
            }}
            className="navbar-search-input"
          />
          <button
            type="submit"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.35)',
              transition: 'all 0.3s ease',
              flexShrink: 0
            }}
            className="navbar-btn-hover"
          >
            <ArrowRight size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}
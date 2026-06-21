// ============================================================================
// AIAssistant.jsx — QGenix Student AI Academic Assistant & Diagnostic Center
// ============================================================================
// Features:
//   1. Summary Header: High-level metrics tracking standing, strengths, and goals.
//   2. AI Performance Monitor Chart (Recharts):
//      - Assessment-by-assessment progression over time.
//      - Subject competency comparison comparing Student average to Cohort average.
//   3. Strengths vs. Weaknesses matrix with details.
//   4. AI Topic-wise Remediation & Recommendation engine:
//      - Suggests materials, watch guidelines, and practice drills for weak topics.
//   5. Interactive AI Diagnostic Trigger:
//      - Simulates deep assessment scanning with progressive loader texts.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react'; // React API library core hooks
import { motion, AnimatePresence } from 'framer-motion'; // Motion animations for transitions
import { 
  BrainCircuit, TrendingUp, Award, AlertCircle, CheckCircle, 
  HelpCircle, ArrowRight, RefreshCw, BarChart2, BookOpen, 
  Clock, Play, BookOpenCheck, ChevronRight, FileText
} from 'lucide-react'; // Lucide premium vector icons
import { useNavigate } from 'react-router-dom'; // Navigation controls
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, Legend, Cell 
} from 'recharts'; // Recharts visualization components
import Card from '../../components/Card'; // Glass custom card wrapper

// ----------------------------------------------------------------------------
// 1. MOCK ASSESSMENT & DIAGNOSTIC DATA
// ----------------------------------------------------------------------------
const gradeProgressionData = [
  { assessment: 'Class Test 1', score: 76, classAvg: 72 },
  { assessment: 'Assignment 1', score: 84, classAvg: 75 },
  { assessment: 'Mid Term', score: 81, classAvg: 74 },
  { assessment: 'Class Test 2', score: 79, classAvg: 73 },
  { assessment: 'Assignment 2', score: 92, classAvg: 78 },
  { assessment: 'Internal Final', score: 88, classAvg: 76 }
];

const courseCompetencyData = [
  { courseCode: 'CSE-301', courseName: 'Advanced Algo', studentScore: 89, classAvg: 76, status: 'Strong' },
  { courseCode: 'CSE-304', courseName: 'DevOps & SE', studentScore: 92, classAvg: 78, status: 'Strong' },
  { courseCode: 'CSE-302', courseName: 'Database Systems', studentScore: 68, classAvg: 73, status: 'Weak' },
  { courseCode: 'CSE-303', courseName: 'Computer Networks', studentScore: 71, classAvg: 74, status: 'Weak' }
];

const weakTopicsData = [
  {
    courseCode: 'CSE-302',
    courseName: 'Database Management Systems',
    instructor: 'Prof. M. Rahman',
    topics: [
      {
        id: 'db-1',
        title: 'Relational Normalization (BCNF & 4NF)',
        problem: 'Difficulty maintaining functional dependency maps and identifying dependency-preserving decompositions.',
        recommendation: 'Review DBMS Normalization Cheat Sheet and complete Practice Normalization Worksheet.',
        difficulty: 'High',
        timeNeeded: '1.5 hrs',
        resourceLink: '/student/resources'
      },
      {
        id: 'db-2',
        title: 'Index Structures (B+ Tree Split Strategies)',
        problem: 'Struggling to calculate leaf node key ranges and parent node modifications during element inserts.',
        recommendation: 'Watch "B+ Tree Indexing Explained" slides in CSE-302 section.',
        difficulty: 'Medium',
        timeNeeded: '45 mins',
        resourceLink: '/student/resources'
      }
    ]
  },
  {
    courseCode: 'CSE-303',
    courseName: 'Computer Networks & Protocol Design',
    instructor: 'Dr. Karim Al-Hasan',
    topics: [
      {
        id: 'net-1',
        title: 'TCP Congestion Control (Tahoe vs. Reno)',
        problem: 'Confusing slow-start phase transitions with fast-recovery thresholds upon triple-duplicate ACKs.',
        recommendation: 'Study IP Routing Protocols Slides (Slides 14-28) in the CSE-303 resources cabinet.',
        difficulty: 'High',
        timeNeeded: '2.0 hrs',
        resourceLink: '/student/resources'
      }
    ]
  }
];

export default function AIAssistant() {
  const navigate = useNavigate();

  // Theme observer integration
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Diagnostic states
  const [toastMessage, setToastMessage] = useState(null);
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  // Toggle suggestion expander
  const toggleTopicDetails = (id) => {
    setExpandedTopicId(prev => prev === id ? null : id);
  };

  // Custom Tooltip renderer for Recharts to guarantee legible text and a premium design
  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(10, 16, 32, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 2000
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{label}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {payload.map((item, index) => {
              const dotColor = item.color || item.payload.fill || 'var(--accent-primary)';
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}:</span>
                  <strong style={{ color: 'var(--text-primary)', marginLeft: 'auto' }}>{item.value}%</strong>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* =======================================================================
         PAGE LOCAL CUSTOM GLASSMORPHIC STYLES
         ======================================================================= */}
      <style>{`
        .ai-glass-card {
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(12, 12, 36, 0.42) 0%,
            rgba(6, 6, 20, 0.52) 100%
          ) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 20px !important;
          backdrop-filter: blur(40px) saturate(220%) !important;
          -webkit-backdrop-filter: blur(40px) saturate(220%) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.12),
            inset 0 12px 24px rgba(255, 255, 255, 0.02),
            0 8px 32px -8px   rgba(0, 0, 0, 0.45) !important;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .ai-glass-card:hover {
          transform: translateY(-2px) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.18),
            0 16px 40px -12px rgba(0, 0, 0, 0.6),
            0 0 25px -5px     rgba(139, 92, 246, 0.12) !important;
        }

        body.light-mode .ai-glass-card {
          background: rgba(255, 255, 255, 0.35) !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .ai-glass-card:hover {
          background: rgba(255, 255, 255, 0.45) !important;
          box-shadow: 0 12px 40px -10px rgba(100, 160, 220, 0.22) !important;
        }

        /* Diagnostic Glow Bubbles */
        .ai-orb-purple {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(65px);
          pointer-events: none;
          z-index: 0;
        }

        .ai-orb-blue {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        /* Diagnostic Loader overlay styling */
        .diagnostic-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(8, 8, 22, 0.88);
          border-radius: 20px;
          backdrop-filter: blur(15px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          z-index: 100;
        }

        body.light-mode .diagnostic-overlay {
          background: rgba(255, 255, 255, 0.9);
        }

        /* Recommendations expander list */
        .recommendation-item {
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.015);
          overflow: hidden;
          transition: all 0.25s ease;
        }

        .recommendation-item:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(139, 92, 246, 0.2);
        }

        body.light-mode .recommendation-item {
          background: rgba(0, 0, 0, 0.01);
        }

        body.light-mode .recommendation-item:hover {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(139, 92, 246, 0.25);
        }

        .strength-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .weakness-badge {
          background: rgba(245, 158, 11, 0.1);
          color: #F59E0B;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }
      `}</style>

      {/* Decorative Glow Orbs */}
      <div className="ai-orb-purple" style={{ top: '5%', right: '-8%' }} />
      <div className="ai-orb-blue" style={{ bottom: '10%', left: '-8%' }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div className="flex flex-col gap-1 w-full relative z-10" style={{ paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <BrainCircuit className="text-violet-500 animate-pulse" size={32} />
            QGenix AI Assistant
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: '500' }}>
            Integrated diagnostic analytics mapping your exam grades to course proficiency metrics and customized study guides.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: CORE STATS SUMMARY CARDS
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', zIndex: 10, position: 'relative' }}>
        
        {/* Stat 1: Standing */}
        <div className="ai-glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Overall Standing</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Grade: B+ (3.14)</div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Up 4.2% since Mid Term assessments
            </span>
          </div>
        </div>

        {/* Stat 2: Identified strengths */}
        <div className="ai-glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Identified Strengths</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <Award size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>2 Core Subjects</div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Scored above 88% class thresholds
            </span>
          </div>
        </div>

        {/* Stat 3: Focus Areas */}
        <div className="ai-glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Core Focus Areas</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>3 Weak Micro-Topics</div>
            <span style={{ fontSize: '0.72rem', color: '#F59E0B', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Remediation recommended
            </span>
          </div>
        </div>

      </div>

      {/* =======================================================================
         SECTION 3: ANALYTICS VISUALIZATIONS (PROGRESSION & COMPARISON CHARTS)
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', zIndex: 10, position: 'relative' }}>
        
        {/* Progression Line Area Chart */}
        <Card title="Assessment Grade Progression Trend">
          <div style={{ height: '280px', marginTop: '16px', position: 'relative' }}>
            


            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gradeProgressionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="assessment" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  content={renderCustomTooltip}
                  cursor={{ stroke: 'rgba(139, 92, 246, 0.25)', strokeWidth: 1 }}
                />
                <defs>
                  <linearGradient id="scoreTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="classAvgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8B5CF6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#scoreTrendGrad)" 
                  name="Your Score" 
                />
                <Area 
                  type="monotone" 
                  dataKey="classAvg" 
                  stroke="#3B82F6" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#classAvgGrad)" 
                  name="Class Average" 
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Competency Comparison Bar Chart */}
        <Card title="Subject Proficiency Metrics">
          <div style={{ height: '280px', marginTop: '16px', position: 'relative' }}>
            


            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseCompetencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="courseName" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  content={renderCustomTooltip}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.05)', radius: [8, 8, 0, 0] }}
                />
                <Bar 
                  dataKey="studentScore" 
                  name="Your Average" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                >
                  {courseCompetencyData.map((entry, index) => {
                    const color = entry.status === 'Strong' ? '#10B981' : '#F59E0B';
                    return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8} />;
                  })}
                </Bar>
                <Bar 
                  dataKey="classAvg" 
                  name="Class Average" 
                  fill="var(--text-secondary)" 
                  fillOpacity={0.25} 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* =======================================================================
         SECTION 4: COGNITIVE ANALYSIS STRENGTHS VS WEAKNESSES
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', zIndex: 10, position: 'relative' }}>
        
        {/* Strength Card */}
        <div className="ai-glass-card" style={{ padding: '24px', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 800 }}>Core Strengths</h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Courses where competency standards are exceeded</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Advanced Algorithms (CSE-301)</strong>
                <span className="strength-badge text-xs px-2 py-0.5 rounded-full" style={{ fontSize: '0.68rem', fontWeight: 700 }}>89% Score</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Excellent analytical parsing of dynamic programming states, recursive backtracking structures, and shortest-path graph calculations.
              </p>
            </div>

            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Software Engineering (CSE-304)</strong>
                <span className="strength-badge text-xs px-2 py-0.5 rounded-full" style={{ fontSize: '0.68rem', fontWeight: 700 }}>92% Score</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                High proficiency in Scrum layouts, Agile iteration mapping, testing suites, CI/CD pipeline triggers, and software modeling principles.
              </p>
            </div>

          </div>
        </div>

        {/* Weakness Card */}
        <div className="ai-glass-card" style={{ padding: '24px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 800 }}>Areas for Growth</h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Courses where scores fall below class average</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Database Systems (CSE-302)</strong>
                <span className="weakness-badge text-xs px-2 py-0.5 rounded-full" style={{ fontSize: '0.68rem', fontWeight: 700 }}>68% Score</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Underperforming in Relational database normalization models (BCNF) and disk-access tree index modification logic during updates.
              </p>
            </div>

            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Computer Networks (CSE-303)</strong>
                <span className="weakness-badge text-xs px-2 py-0.5 rounded-full" style={{ fontSize: '0.68rem', fontWeight: 700 }}>71% Score</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Struggling to compute protocol window metrics, packet header offsets, routing algorithm convergence steps, and congestion thresholds.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* =======================================================================
         SECTION 5: TOPIC-WISE REMEDIATION & SUGGESTIONS HUB
         ======================================================================= */}
      <Card title="Topic-wise Study Recommendations & Remediation">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 20px 0' }}>
          Select a course block below to view precise micro-topics requiring attention, and access recommendations uploaded by instructors.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {weakTopicsData.map((course, cIdx) => (
            <div key={cIdx} className="recommendation-course-block">
              
              {/* Course Title Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                  {course.courseCode}
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {course.courseName}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  Instructor: {course.instructor}
                </span>
              </div>

              {/* Topics Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {course.topics.map((topic) => {
                  const isExpanded = expandedTopicId === topic.id;
                  return (
                    <div 
                      key={topic.id}
                      className="recommendation-item"
                    >
                      {/* Interactive Trigger Row */}
                      <button
                        onClick={() => toggleTopicDetails(topic.id)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          padding: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <BookOpenCheck size={16} className="text-amber-500" />
                          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {topic.title}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: topic.difficulty === 'High' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: topic.difficulty === 'High' ? '#EF4444' : '#F59E0B', fontWeight: 'bold' }}>
                            Priority: {topic.difficulty}
                          </span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
                          </motion.div>
                        </div>
                      </button>

                      {/* Expandable suggestions details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '0 14px 14px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px', paddingTop: '12px' }}>
                              
                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Diagnosed Vulnerability</span>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                  {topic.problem}
                                </p>
                              </div>

                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>AI Remediation Directive</span>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                  {topic.recommendation}
                                </p>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  <Clock size={12} />
                                  <span>Suggested study allocation: <strong>{topic.timeNeeded}</strong></span>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                  
                                  {/* Link to resources page */}
                                  <button
                                    onClick={() => navigate(topic.resourceLink)}
                                    style={{
                                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                      border: '1px solid rgba(139, 92, 246, 0.25)',
                                      borderRadius: '8px',
                                      padding: '6px 12px',
                                      fontSize: '0.75rem',
                                      color: 'var(--text-primary)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    <FileText size={12} style={{ color: '#8B5CF6' }} />
                                    <span>Get Study Material</span>
                                  </button>

                                  {/* Practice quiz mock */}
                                  <button
                                    onClick={() => {
                                      setToastMessage(`Initiated quick review diagnostic for: "${topic.title}"`);
                                      setTimeout(() => setToastMessage(null), 3000);
                                    }}
                                    style={{
                                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                                      border: '1px solid rgba(16, 185, 129, 0.25)',
                                      borderRadius: '8px',
                                      padding: '6px 12px',
                                      fontSize: '0.75rem',
                                      color: 'var(--text-primary)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    <Play size={12} className="text-emerald-500" />
                                    <span>Practice Drills</span>
                                  </button>

                                </div>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      </Card>

      {/* Floating toast notification alerts */}
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
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
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
              zIndex: 1000
            }}
          >
            <CheckCircle size={18} style={{ color: '#10B981' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

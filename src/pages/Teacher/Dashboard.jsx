import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, CalendarCheck, Users, FileText, CheckSquare, TrendingUp, Award, Clock, Bell, LogOut, BookOpen, AlertTriangle, ShieldAlert,
  ArrowUpRight, ArrowDownRight, MoreVertical, Plus, Edit, Trash2, Eye, User, Sparkles, MessageSquare, Clipboard, PieChart as PieIcon,
  RefreshCw, CheckCircle2, ChevronRight, Activity, PlusCircle, Check, BookMarked, HelpCircle, FileCheck
} from 'lucide-react';
import Card from '../../components/Card';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// ============================================================================
// MOCK DATA FOR TEACHER DASHBOARD
// ============================================================================

const scheduleData = [
  { id: 1, time: '09:00 AM', subject: 'Data Structures', class: 'Grade 11-A', room: 'Room 302', type: 'Lecture', status: 'Completed' },
  { id: 2, time: '11:30 AM', subject: 'Database Systems', class: 'Grade 12-B', room: 'Lab 2', type: 'Lecture', status: 'Ongoing' }, // Current class
  { id: 3, time: '02:00 PM', subject: 'Computer Networks', class: 'Grade 11-A', room: 'Room 101', type: 'Lab Quiz', status: 'Upcoming' },
  { id: 4, time: '04:00 PM', subject: 'Software Engineering', class: 'Grade 12-A', room: 'Room 204', type: 'Presentation', status: 'Upcoming' }
];

const notificationsData = [
  { id: 1, type: 'Assignment', title: 'Assignment Submission', desc: 'Rafiul Islam submitted Assignment 3: CI/CD Pipeline', time: '10m ago', unread: true },
  { id: 2, type: 'Result', title: 'Result Published', desc: 'Midterm exam results compiled & published for Grade 11-A', time: '1h ago', unread: true },
  { id: 3, type: 'Exam', title: 'Exam Scheduled', desc: 'Questions generated for Database Systems Quiz 3', time: '3h ago', unread: false },
  { id: 4, type: 'Request', title: 'Student Request', desc: 'Sadia Rahman requested 1-on-1 advisor consultation', time: '5h ago', unread: false },
  { id: 5, type: 'Message', title: 'New Message', desc: 'Dr. Sarah Ahmed sent you a direct message regarding syllabus', time: '1d ago', unread: false }
];

const pendingReviewsData = [
  { id: 1, name: 'Assignment 3: CI/CD Pipeline', total: 45, pending: 12, due: 'June 25, 2026' },
  { id: 2, name: 'Lab Report 2: Graph MST', total: 38, pending: 8, due: 'June 22, 2026' },
  { id: 3, name: 'Midterm Quiz 1: ER Diagrams', total: 40, pending: 0, due: 'June 18, 2026' }
];

const attendanceAlertsData = [
  { id: 1, name: 'Rafayel Ahmed', studentId: 'UG02-112', percentage: 68.5, risk: 'Critical' },
  { id: 2, name: 'Noshin Tasnim', studentId: 'UG02-145', percentage: 72.0, risk: 'Medium' },
  { id: 3, name: 'Sajjad Karim', studentId: 'UG02-098', percentage: 74.2, risk: 'Medium' },
  { id: 4, name: 'Maria Sultana', studentId: 'UG02-210', percentage: 62.0, risk: 'Critical' }
];

const performanceSubjectsData = [
  { subject: 'Data Structures', score: 82, attendance: 92 },
  { subject: 'Database Systems', score: 78, attendance: 88 },
  { subject: 'Computer Networks', score: 85, attendance: 94 },
  { subject: 'Software Eng', score: 75, attendance: 91 }
];

const gradeDistributionData = [
  { name: 'A', students: 45 },
  { name: 'B', students: 58 },
  { name: 'C', students: 32 },
  { name: 'D', students: 14 },
  { name: 'F', students: 5 }
];

const passFailData = [
  { name: 'Pass', value: 144, color: 'var(--accent-success)' },
  { name: 'Fail', value: 10, color: 'var(--accent-danger)' }
];

const upcomingExamsData = [
  { id: 1, name: 'Final Theory Exam', subject: 'Data Structures', date: 'June 28, 2026', duration: '2 Hours', status: 'Pending' },
  { id: 2, name: 'Lab Quiz 3', subject: 'Computer Networks', date: 'July 02, 2026', duration: '1 Hour', status: 'Draft' },
  { id: 3, name: 'Term Project Presentation', subject: 'Software Engineering', date: 'July 05, 2026', duration: '3 Hours', status: 'Scheduled' }
];

const aiInsightsData = [
  { id: 1, title: 'Poor Performance Alert', desc: '3 students scored below 50% in Database Systems Quiz 2. Recommendations generated.', risk: 'High' },
  { id: 2, title: 'Attendance Warning', desc: 'Average attendance in CSE-301 Section A dropped by 5% this week. Review suggested.', risk: 'Medium' },
  { id: 3, title: 'Suspicious Exam Activity', desc: '2 fullscreen lock violations flagged during Computer Networks quiz yesterday.', risk: 'High' },
  { id: 4, title: 'Attention Required', desc: 'Advisor consult requests: 2 students awaiting confirmation for slot selection.', risk: 'Low' }
];

const studentOverviewPieData = [
  { name: 'Present Today', value: 138, color: '#10B981' },
  { name: 'Absent Students', value: 16, color: 'rgba(255, 255, 255, 0.05)' }
];

const recentActivitiesData = [
  { id: 1, icon: <CheckSquare size={16} />, desc: 'Mahmudul Hasan submitted Assignment 3: CI/CD Pipeline', time: '5 mins ago' },
  { id: 2, icon: <FileCheck size={16} />, desc: '38 students completed Data Structures Practical Quiz', time: '1 hour ago' },
  { id: 3, icon: <Calendar size={16} />, desc: 'Attendance marked for Database Systems Section B', time: '2 hours ago' },
  { id: 4, icon: <BookMarked size={16} />, desc: 'Dr. Sarah Ahmed uploaded "Graph MST lecture notes.pdf"', time: '3 hours ago' },
  { id: 5, icon: <Users size={16} />, desc: '5 students enrolled in CSE-304 Software Engineering', time: '1 day ago' }
];

const calendarEventsData = [
  { date: 'June 22', title: 'Lab Report 2 Deadline', category: 'Assignment', color: '#F59E0B' }, // Yellow
  { date: 'June 25', title: 'Midterm Exams Start', category: 'Exam', color: '#EF4444' }, // Red
  { date: 'June 26', title: 'National Holiday (University Closed)', category: 'Holiday', color: '#10B981' }, // Green
  { date: 'June 28', title: 'Data Structures Final Theory', category: 'Exam', color: '#EF4444' }, // Red
  { date: 'Mon/Wed/Fri', title: 'Data Structures Lectures', category: 'Class', color: '#3B82F6' } // Blue
];

export default function TeacherDashboard() {
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  const [analyticsTab, setAnalyticsTab] = useState('performance');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
          border: isLightMode ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
          padding: '8px 12px',
          borderRadius: '10px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          color: 'var(--text-primary)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label || payload[0].name}</div>
          {payload.map((item, idx) => (
            <div key={idx} style={{ color: item.color || '#8B5CF6', fontWeight: 700, fontSize: '0.9rem', marginTop: '2px' }}>
              {item.name}: {item.value} {analyticsTab === 'performance' ? '%' : ''}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {styleOverrides}

      {/* =======================================================================
         SECTION 1: TOP STATISTICS CARDS
         ======================================================================= */}
      <div className="stats-cards-grid">
        
        {/* Classes Today */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Classes Today</span>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-secondary)' }}>
              <CalendarCheck size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>4</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', fontWeight: 600 }}>1 ongoing, 3 upcoming</span>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Upcoming Exams</span>
            <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
              <FileText size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>3</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', fontWeight: 600 }}>Within next 7 days</span>
          </div>
        </div>

        {/* Low Attendance Alerts */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Low Attendance Alerts</span>
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', color: 'var(--accent-danger)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>4</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-danger)', display: 'block', marginTop: '2px', fontWeight: 600 }}>Attendance below 75% limit</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Students</span>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: 'var(--accent-success)' }}>
              <Users size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>154</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', fontWeight: 600 }}>Across 4 active sections</span>
          </div>
        </div>

        {/* Active Courses */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Courses</span>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-secondary)' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>4</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', fontWeight: 600 }}>CSE-301, 302, 303, 304</span>
          </div>
        </div>

        {/* Pending Assignment Reviews */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Reviews</span>
            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', color: 'var(--accent-warning)' }}>
              <CheckSquare size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>20</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-warning)', display: 'block', marginTop: '2px', fontWeight: 600 }}>2 tasks awaiting grading</span>
          </div>
        </div>

        {/* Running Exams */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Running Exams</span>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: 'var(--accent-success)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>1</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-success)', display: 'block', marginTop: '2px', fontWeight: 600 }}>CSE-302 Exam currently active</span>
          </div>
        </div>

        {/* Average Attendance Rate */}
        <div className="glass-panel premium-card hover-lift" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Avg Attendance</span>
            <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>91.2%</div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '2px', fontWeight: 600 }}>Consistent student presence</span>
          </div>
        </div>

      </div>

      {/* =======================================================================
         SECTION 2: TODAY'S SCHEDULE | NOTIFICATIONS
         ======================================================================= */}
      <div className="grid-2-1">
        
        {/* Today's Schedule */}
        <Card title="Today's Schedule" className="lg:col-span-2 premium-card">
          <div className="flex flex-col gap-4" style={{ marginTop: '12px' }}>
            {scheduleData.map((item) => {
              const isOngoing = item.status === 'Ongoing';
              const isCompleted = item.status === 'Completed';
              return (
                <div 
                  key={item.id} 
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: isOngoing ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                    background: isOngoing ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.3s ease',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      fontWeight: '800', 
                      color: isOngoing ? 'var(--accent-primary)' : 'var(--text-primary)', 
                      width: '78px',
                      fontSize: '0.88rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0
                    }}>
                      {item.time}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>{item.subject}</span>
                        {isOngoing && <span className="pulse-indicator-dot" />}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {item.class} • <strong style={{ color: 'var(--text-secondary)' }}>{item.room}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <span className={`badge ${
                      isCompleted ? 'badge-success' :
                      isOngoing ? 'badge-primary' : 'badge-warning'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Notifications Panel */}
        <Card title="Notifications Panel" className="premium-card">
          <div className="flex flex-col gap-4" style={{ marginTop: '12px' }}>
            {notificationsData.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-3 items-start p-3 rounded-xl border border-transparent bg-white/2 dark:bg-white/1"
                style={{ position: 'relative' }}
              >
                {item.unread && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '6px',
                    height: '6px',
                    background: 'var(--accent-primary)',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px var(--accent-primary)'
                  }} />
                )}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.85rem'
                }}>
                  {item.type === 'Assignment' ? <CheckSquare size={16} /> :
                   item.type === 'Result' ? <Award size={16} /> :
                   item.type === 'Exam' ? <FileText size={16} /> :
                   item.type === 'Request' ? <User size={16} /> : <MessageSquare size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)' }}>{item.title}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.time}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0, lineHeight: 1.3 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* =======================================================================
         SECTION 3: PENDING ASSIGNMENT REVIEW | ATTENDANCE ALERTS
         ======================================================================= */}
      <div className="grid-2-1">
        
        {/* Pending Assignment Review */}
        <Card title="Pending Assignment Review" className="lg:col-span-2 premium-card">
          <div className="table-responsive-container" style={{ marginTop: '12px' }}>
            <table className="custom-dashboard-table">
              <thead>
                <tr>
                  <th>Assignment Name</th>
                  <th>Submissions</th>
                  <th>Pending Review</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingReviewsData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.name}</span>
                    </td>
                    <td>
                      <span className="badge bg-white/4 dark:bg-white/2" style={{ color: 'var(--text-secondary)' }}>{item.total} total</span>
                    </td>
                    <td>
                      {item.pending > 0 ? (
                        <span className="badge badge-warning">{item.pending} pending</span>
                      ) : (
                        <span className="badge badge-success">0 pending</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.due}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => triggerToast(`Reviewing submissions for ${item.name}`)}
                          className="btn btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px' }}
                        >
                          Review
                        </button>
                        <button 
                          onClick={() => triggerToast(`Grading ${item.name}`)}
                          className="btn btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px' }}
                        >
                          Grade
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Attendance Alerts */}
        <Card title="Low Attendance Alerts" className="premium-card">
          <div className="flex flex-col gap-3" style={{ marginTop: '12px' }}>
            {attendanceAlertsData.map((student) => {
              const isCritical = student.risk === 'Critical';
              return (
                <div 
                  key={student.id} 
                  className="flex justify-between items-center p-3 rounded-xl border border-transparent bg-white/2 dark:bg-white/1"
                >
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{student.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {student.studentId}</span>
                  </div>
                  
                  <div className="flex gap-3 items-center">
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isCritical ? 'var(--accent-danger)' : 'var(--accent-warning)', display: 'block' }}>
                        {student.percentage}%
                      </span>
                      <span className={`badge ${isCritical ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.62rem', padding: '1px 5px', marginTop: '2px' }}>
                        {student.risk}
                      </span>
                    </div>
                    <button 
                      onClick={() => triggerToast(`Viewing details for student ${student.name}`)}
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px' }}
                      title="View Details"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* =======================================================================
         SECTION 4: PERFORMANCE ANALYTICS | UPCOMING EXAMS
         ======================================================================= */}
      <div className="grid-2-1">
        
        {/* Performance Analytics Card */}
        <Card 
          title="Performance Analytics" 
          className="lg:col-span-2 premium-card"
          action={
            <div className="analytics-tabs-container">
              {['performance', 'grades', 'ratio'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setAnalyticsTab(tab)}
                  className={`tab-btn-mini ${analyticsTab === tab ? 'tab-btn-mini-active' : ''}`}
                >
                  {tab === 'performance' ? 'Performance' : tab === 'grades' ? 'Grades' : 'Pass/Fail'}
                </button>
              ))}
            </div>
          }
        >
          <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {analyticsTab === 'performance' ? (
                <AreaChart data={performanceSubjectsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)'} />
                  <XAxis dataKey="subject" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }} />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" name="Avg Score" dataKey="score" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#scoreGrad)" />
                  <Area type="monotone" name="Avg Attendance" dataKey="attendance" stroke="#3B82F6" strokeWidth={2.5} fill="url(#attendanceGrad)" />
                </AreaChart>
              ) : analyticsTab === 'grades' ? (
                <BarChart data={gradeDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)'} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar name="Students Count" dataKey="students" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.78rem' }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Upcoming Exams */}
        <Card title="Upcoming Exams" className="premium-card">
          <div className="flex flex-col gap-3 scrollable-exams-container" style={{ marginTop: '12px' }}>
            {upcomingExamsData.map((exam) => (
              <div 
                key={exam.id} 
                className="flex flex-col p-4 rounded-xl border border-transparent bg-white/2 dark:bg-white/1 gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{exam.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{exam.subject}</span>
                  </div>
                  <span className={`badge ${
                    exam.status === 'Scheduled' ? 'badge-success' :
                    exam.status === 'Draft' ? 'badge-warning' : 'badge-primary'
                  }`}>
                    {exam.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <span className="flex items-center gap-1"><Calendar size={12} />{exam.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{exam.duration}</span>
                </div>

                <div className="flex gap-2" style={{ marginTop: '2px' }}>
                  <button 
                    onClick={() => triggerToast(`Managing ${exam.name}`)}
                    className="btn btn-secondary w-full" 
                    style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: '700' }}
                  >
                    Manage Exam
                  </button>
                  <button 
                    onClick={() => triggerToast(`Publishing results for ${exam.name}`)}
                    className="btn btn-primary w-full" 
                    style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: '700' }}
                  >
                    Publish Result
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* =======================================================================
         SECTION 5: MINI CALENDAR & STUDENT OVERVIEW
         ======================================================================= */}
      <div className="grid-2-1">
        
        {/* Mini Calendar & Upcoming Events */}
        <Card title="Mini Calendar & Upcoming Events" className="lg:col-span-2 premium-card">
          <div className="flex flex-col gap-3" style={{ marginTop: '12px' }}>
            
            {/* Custom mini headers */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              {[
                { label: 'Classes', color: '#3B82F6' },
                { label: 'Exams', color: '#EF4444' },
                { label: 'Holidays', color: '#10B981' },
                { label: 'Assignments', color: '#F59E0B' }
              ].map((indicator, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: indicator.color }} />
                  <span>{indicator.label}</span>
                </div>
              ))}
            </div>

            {/* List of upcoming events */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {calendarEventsData.map((ev, idx) => (
                <div 
                  key={idx}
                  className="flex gap-3 p-3 rounded-xl border border-transparent bg-white/2 dark:bg-white/1"
                  style={{ borderLeft: `3px solid ${ev.color}` }}
                >
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    minWidth: '55px',
                    height: 'fit-content'
                  }}>
                    {ev.date}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{ev.title}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ev.category} Event</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </Card>

        {/* Student Overview */}
        <Card title="Student Overview" className="premium-card">
          <div className="flex flex-col gap-4" style={{ marginTop: '8px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Present Today</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>138 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 154</span></span>
              </div>
              <div style={{ height: '70px', width: '70px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentOverviewPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={30}
                      dataKey="value"
                    >
                      {studentOverviewPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Students</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>154</span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Absent</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ef4444', display: 'block', marginTop: '2px' }}>16</span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>At Risk</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F59E0B', display: 'block', marginTop: '2px' }}>6</span>
              </div>
            </div>

          </div>
        </Card>

      </div>

      {/* =======================================================================
         SECTION 7: RECENT ACTIVITIES
         ======================================================================= */}
      <Card title="Recent Activities" className="premium-card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '12px' }}>
          {recentActivitiesData.map((activity) => (
            <div 
              key={activity.id} 
              className="flex gap-3 p-3 rounded-xl border border-transparent bg-white/2 dark:bg-white/1 items-center"
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {activity.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activity.desc}
                </p>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Floating toast notification bar */}
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

    </div>
  );
}

// Inline Styles to avoid any extra CSS files
const styleOverrides = (
  <style>{`
    .hover-lift {
      transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease;
    }
    .hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg), 0 0 15px rgba(139, 92, 246, 0.1) !important;
    }
    .shadow-glow-small {
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
    }
    .pulse-indicator-dot {
      width: 8px;
      height: 8px;
      background-color: var(--accent-primary);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent-primary);
      animation: pulse-dot 1.5s infinite;
    }
    @keyframes pulse-dot {
      0% { transform: scale(0.9); opacity: 0.6; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.6; }
    }
    .custom-dashboard-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .custom-dashboard-table th {
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .custom-dashboard-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color);
      vertical-align: middle;
      font-size: 0.82rem;
    }
    .custom-dashboard-table tr:last-child td {
      border-bottom: none;
    }
    .analytics-tabs-container {
      display: flex;
      gap: 6px;
      background: rgba(0, 0, 0, 0.08);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 4px;
    }
    body.light-mode .analytics-tabs-container {
      background: rgba(0, 0, 0, 0.02);
    }
    .tab-btn-mini {
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.72rem;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-btn-mini:hover {
      color: var(--text-primary);
    }
    .tab-btn-mini-active {
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: white !important;
    }
    .scrollable-exams-container {
      max-height: 310px;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .scrollable-exams-container::-webkit-scrollbar {
      display: none;
    }
    .stats-cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    @media (max-width: 1200px) {
      .stats-cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 576px) {
      .stats-cards-grid {
        grid-template-columns: 1fr;
      }
    }
    .grid-2-1 {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .grid-2-1 {
        grid-template-columns: 1fr;
      }
    }
    .grid-1-1 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    @media (max-width: 768px) {
      .grid-1-1 {
        grid-template-columns: 1fr;
      }
    }
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    @media (max-width: 640px) {
      .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `}</style>
);
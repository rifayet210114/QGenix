const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');

const files = {
  'components/Navbar.jsx': `import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ title, role }) {
  return (
    <div className="dashboard-header">
      <h2 style={{ margin: 0 }}>{title}</h2>
      <div className="flex items-center gap-4">
        <button className="btn btn-secondary" style={{ padding: '8px' }}><Bell size={18} /></button>
        <div className="flex items-center gap-2">
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Admin User</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role}</div>
          </div>
        </div>
        <Link to="/login" className="btn btn-secondary" style={{ padding: '8px' }}><LogOut size={18} /></Link>
      </div>
    </div>
  );
}`,
  'components/Sidebar.jsx': `import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, BookOpen, FileText, CheckSquare, Calendar, TrendingUp } from 'lucide-react';

export default function Sidebar({ links, role }) {
  const location = useLocation();
  return (
    <div className="dashboard-sidebar">
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>AI</span>
        </div>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>EduNexus</h3>
      </div>
      <div style={{ padding: '16px 0', flex: 1 }}>
        <div style={{ padding: '0 24px', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>
          {role} Menu
        </div>
        {links.map(link => {
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px',
              background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderRight: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
              fontWeight: isActive ? '600' : '400'
            }}>
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}`,
  'components/Card.jsx': `import React from 'react';

export default function Card({ children, className = '', title, action }) {
  return (
    <div className={\`glass-panel \${className}\`} style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
      {(title || action) && (
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          {title && <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}`,
  'layouts/DashboardLayout.jsx': `import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout({ links, role, title }) {
  return (
    <div className="dashboard-container">
      <Sidebar links={links} role={role} />
      <div className="dashboard-main">
        <Navbar title={title} role={role} />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}`,
  'pages/Landing.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BarChart3, Clock } from 'lucide-react';
import Card from '../components/Card';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <BrainCircuit color="var(--accent-primary)" size={32} />
          <h2 style={{ margin: 0 }}>EduNexus AI</h2>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/login" className="btn btn-primary">Get Started</Link>
        </div>
      </header>
      
      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <div className="badge badge-primary" style={{ marginBottom: '24px', padding: '6px 12px' }}>Platform v2.0 Live</div>
        <h1 style={{ fontSize: '4rem', marginBottom: '24px', maxWidth: '800px', lineHeight: 1.1 }}>
          Next-Gen <span className="text-gradient">AI Examination</span> & Analytics Platform
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '40px' }}>
          Automate assessments, generate questions from your materials instantly, and track micro-topic performance with AI precision.
        </p>
        <div className="flex gap-6">
          <Link to="/login" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>Start Free Trial</Link>
          <a href="#features" className="btn btn-secondary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>Explore Features</a>
        </div>
        
        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ marginTop: '100px', width: '100%', maxWidth: '1200px', textAlign: 'left' }}>
          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <BrainCircuit color="var(--accent-primary)" size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>AI Question Generation</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Upload any PDF or DOCX file and instantly generate comprehensive exams with diverse question types using our advanced AI.</p>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <BarChart3 color="var(--accent-secondary)" size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Smart Result Analytics</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Move beyond generic grades. Track student performance at the micro-topic level with detailed radar charts and insights.</p>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Clock color="var(--accent-success)" size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Study Monitoring</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Track attendance automatically and monitor how long students engage with uploaded study materials to optimize learning.</p>
          </Card>
        </div>
      </main>
    </div>
  );
}`,
  'pages/Auth/Login.jsx': `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import Card from '../../components/Card';

export default function Login() {
  const [role, setRole] = useState('student');
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'admin') navigate('/admin');
    if (role === 'teacher') navigate('/teacher');
    if (role === 'student') navigate('/student');
  };
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <Card style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', marginBottom: '16px' }}>
            <BrainCircuit color="var(--accent-primary)" size={32} />
          </div>
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue to EduNexus</p>
        </div>
        
        {/* Role Tabs */}
        <div className="flex" style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
          {['student', 'teacher', 'admin'].map(r => (
            <button 
              key={r}
              onClick={() => setRole(r)}
              style={{
                flex: 1, padding: '8px', background: role === r ? 'var(--bg-primary)' : 'transparent',
                border: 'none', borderRadius: '4px', color: role === r ? 'white' : 'var(--text-secondary)',
                fontWeight: role === r ? '600' : '400', cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all 0.2s', boxShadow: role === r ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {r}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input type="email" className="input-field" placeholder="Enter your email" required defaultValue="demo@edunexus.ai" />
          </div>
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
              <a href="#" style={{ fontSize: '0.8rem' }}>Forgot password?</a>
            </div>
            <input type="password" className="input-field" placeholder="••••••••" required defaultValue="password" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px', marginTop: '8px' }}>
            Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>
      </Card>
    </div>
  );
}`,
  'pages/Admin/Dashboard.jsx': `import React from 'react';
import Card from '../../components/Card';
import { Users, GraduationCap, FileText, Server } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', exams: 40 }, { name: 'Feb', exams: 30 }, { name: 'Mar', exams: 45 },
  { name: 'Apr', exams: 50 }, { name: 'May', exams: 65 }, { name: 'Jun', exams: 55 }
];

export default function AdminDashboard() {
  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}><Users size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Students</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>4,250</div></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--accent-success)' }}><GraduationCap size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Teachers</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>128</div></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-secondary)' }}><FileText size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Exams Conducted</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1,842</div></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: 'var(--accent-warning)' }}><Server size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI Server Health</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>99.9%</div></div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ flex: 1 }}>
        <Card title="Exams Conducted (YTD)" className="md:col-span-2">
          <div style={{ height: '300px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="exams" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="System Alerts">
          <div className="flex-col gap-4" style={{ display: 'flex', marginTop: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ padding: '12px', borderLeft: '3px solid var(--accent-warning)', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                <div style={{ fontWeight: '500' }}>High Server Load</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Generator API experiencing 85% load.</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}`,
  'pages/Admin/UserManagement.jsx': `import React from 'react';
import Card from '../../components/Card';
import { Upload, Plus, Search } from 'lucide-react';

export default function UserManagement() {
  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      <div className="flex justify-between items-center">
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input type="text" className="input-field" placeholder="Search users..." style={{ paddingLeft: '40px' }} />
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary"><Upload size={16} style={{ marginRight: '8px' }} /> Bulk CSV Upload</button>
          <button className="btn btn-primary"><Plus size={16} style={{ marginRight: '8px' }} /> Add User</button>
        </div>
      </div>
      
      <Card title="User Directory">
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Alice Johnson', role: 'Teacher', email: 'alice@edunexus.ai', status: 'Active' },
                { name: 'Bob Smith', role: 'Student', email: 'bob@student.edu', status: 'Active' },
                { name: 'Charlie Brown', role: 'Student', email: 'charlie@student.edu', status: 'Inactive' }
              ].map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  <td style={{ padding: '16px 12px' }}>{u.name}</td>
                  <td style={{ padding: '16px 12px' }}><span className={\`badge \${u.role === 'Teacher' ? 'badge-primary' : 'badge-secondary'}\`}>{u.role}</span></td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '16px 12px' }}><span className={\`badge \${u.status === 'Active' ? 'badge-success' : 'badge-danger'}\`}>{u.status}</span></td>
                  <td style={{ padding: '16px 12px' }}>
                    <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}`,
  'pages/Admin/Settings.jsx': `import React from 'react';
import Card from '../../components/Card';

export default function Settings() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Academic Configuration">
        <form className="flex-col gap-4" style={{ display: 'flex', marginTop: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Active Academic Year</label>
            <select className="input-field" defaultValue="2026">
              <option value="2025">2025-2026</option>
              <option value="2026">2026-2027</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Grading Scale Template</label>
            <select className="input-field" defaultValue="standard">
              <option value="standard">Standard (A+, A, B, C, F)</option>
              <option value="percentage">Percentage (0-100)</option>
              <option value="gpa">GPA (0.0 - 4.0)</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: 'fit-content' }}>Save Configuration</button>
        </form>
      </Card>
      
      <Card title="AI Generator Settings">
        <form className="flex-col gap-4" style={{ display: 'flex', marginTop: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Default Model Selection</label>
            <select className="input-field" defaultValue="gpt4">
              <option value="gpt4">EduModel Ultra (High Accuracy)</option>
              <option value="gpt3">EduModel Fast (High Speed)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Plagiarism Strictness</label>
            <input type="range" style={{ width: '100%' }} />
            <div className="flex justify-between" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Lenient</span><span>Strict</span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: 'fit-content' }}>Update System</button>
        </form>
      </Card>
    </div>
  );
}`,
  'pages/Teacher/Dashboard.jsx': `import React from 'react';
import Card from '../../components/Card';
import { Calendar, Users, AlertCircle, FileText } from 'lucide-react';

export default function TeacherDashboard() {
  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}><Calendar size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Classes Today</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>4</div></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--accent-success)' }}><FileText size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upcoming Exams</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>2</div></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--accent-danger)' }}><AlertCircle size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Low Attendance Alerts</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>5</div></div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ flex: 1 }}>
        <Card title="Today's Schedule">
          <div className="flex-col gap-4" style={{ display: 'flex', marginTop: '16px' }}>
            {[
              { time: '09:00 AM', subject: 'Physics 101', class: 'Grade 11-A', type: 'Lecture' },
              { time: '11:30 AM', subject: 'Advanced Mathematics', class: 'Grade 12-B', type: 'Digital Exam' },
              { time: '02:00 PM', subject: 'Physics Lab', class: 'Grade 11-A', type: 'Practical' }
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center" style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div className="flex gap-4 items-center">
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-primary)', width: '80px' }}>{s.time}</div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{s.subject}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.class}</div>
                  </div>
                </div>
                <span className="badge badge-primary">{s.type}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="Action Items">
          <div className="flex-col gap-4" style={{ display: 'flex', marginTop: '16px' }}>
            <div style={{ padding: '16px', borderLeft: '3px solid var(--accent-danger)', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
              <div className="flex justify-between">
                <div style={{ fontWeight: '500' }}>Mark Attendance for Grade 12-B</div>
                <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>Do Now</button>
              </div>
            </div>
            <div style={{ padding: '16px', borderLeft: '3px solid var(--accent-warning)', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
              <div className="flex justify-between">
                <div style={{ fontWeight: '500' }}>Review AI Generated Physics Exam</div>
                <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>Review</button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}`,
  'pages/Teacher/ResourceManager.jsx': `import React from 'react';
import Card from '../../components/Card';
import { UploadCloud, FileText, CheckCircle, Clock } from 'lucide-react';

export default function ResourceManager() {
  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      <Card>
        <div style={{ 
          border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '60px', 
          textAlign: 'center', background: 'rgba(30, 41, 59, 0.4)', cursor: 'pointer' 
        }}>
          <UploadCloud size={48} color="var(--accent-primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Drag & Drop Study Materials</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Upload PDFs, DOCX, or PPTX to train the AI on your specific curriculum.</p>
          <button className="btn btn-primary">Browse Files</button>
        </div>
      </Card>
      
      <Card title="Uploaded Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: '16px' }}>
          {[
            { name: 'Chapter_4_Thermodynamics.pdf', status: 'Ready', date: 'Today' },
            { name: 'Kinematics_Worksheet_A.docx', status: 'Processing', date: 'Today' },
            { name: 'Physics_101_Syllabus.pdf', status: 'Ready', date: 'Yesterday' }
          ].map((file, i) => (
            <div key={i} className="flex items-center justify-between" style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-4">
                <FileText color="var(--text-muted)" />
                <div>
                  <div style={{ fontWeight: '500' }}>{file.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uploaded {file.date}</div>
                </div>
              </div>
              <div>
                {file.status === 'Ready' 
                  ? <div className="flex items-center gap-1" style={{ color: 'var(--accent-success)', fontSize: '0.85rem' }}><CheckCircle size={14} /> AI Ready</div>
                  : <div className="flex items-center gap-1" style={{ color: 'var(--accent-warning)', fontSize: '0.85rem' }}><Clock size={14} /> Processing</div>
                }
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}`,
  'pages/Teacher/AIExamGenerator.jsx': `import React, { useState } from 'react';
import Card from '../../components/Card';
import { BrainCircuit, Settings, Eye, Download, CheckCircle2 } from 'lucide-react';

export default function AIExamGenerator() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      {/* Progress Wizard */}
      <div className="flex justify-between" style={{ padding: '0 40px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '60px', right: '60px', height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
        {['Select Resource', 'Set Parameters', 'Review Output', 'Publish'].map((label, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step > i ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
              border: step > i ? 'none' : '2px solid var(--border-color)',
              fontWeight: 'bold', color: step > i ? 'white' : 'var(--text-muted)'
            }}>
              {step > i + 1 ? <CheckCircle2 size={18} /> : i + 1}
            </div>
            <div style={{ fontSize: '0.8rem', color: step >= i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step >= i + 1 ? '600' : '400' }}>{label}</div>
          </div>
        ))}
      </div>

      <Card>
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '24px' }}>Step 1: Select Source Material</h3>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Choose a previously uploaded file for the AI to base questions on:</label>
              <select className="input-field">
                <option>Chapter_4_Thermodynamics.pdf (AI Ready)</option>
                <option>Physics_101_Syllabus.pdf (AI Ready)</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Next Step <Settings size={16} style={{ marginLeft: '8px' }} /></button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '24px' }}>Step 2: Set Exam Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Total Marks</label>
                <input type="number" className="input-field" defaultValue="50" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Difficulty Level</label>
                <select className="input-field" defaultValue="mid">
                  <option value="easy">Easy</option>
                  <option value="mid">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label style={{ display: 'block', marginBottom: '8px' }}>Question Types (Select multiple)</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Multiple Choice</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Short Answer</label>
                  <label className="flex items-center gap-2"><input type="checkbox" /> Essay / Long Form</label>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Generate Exam <BrainCircuit size={16} style={{ marginLeft: '8px' }} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: '24px' }}>Step 3: Review & Edit AI Output</h3>
            <div className="flex-col gap-4" style={{ display: 'flex', marginBottom: '24px' }}>
              {[
                { q: "What is the First Law of Thermodynamics?", type: "Short Answer", marks: 5, tag: "Page 4, Para 2" },
                { q: "Calculate the work done by an ideal gas during isothermal expansion.", type: "Short Answer", marks: 5, tag: "Page 12, Eq 3.4" },
                { q: "Which of the following is a state function? A) Work B) Heat C) Internal Energy D) Power", type: "Multiple Choice", marks: 2, tag: "Page 6" }
              ].map((item, i) => (
                <div key={i} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div className="flex justify-between items-start" style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: '500', fontSize: '1.05rem' }}>Q{i+1}. {item.q}</div>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</button>
                    </div>
                  </div>
                  <div className="flex gap-4" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span className="badge badge-secondary">{item.type}</span>
                    <span>Marks: {item.marks}</span>
                    <span>Source: {item.tag}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>Approve Exam <Eye size={16} style={{ marginLeft: '8px' }} /></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ display: 'inline-flex', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--accent-success)', marginBottom: '24px' }}>
              <CheckCircle2 size={48} />
            </div>
            <h2 style={{ marginBottom: '16px' }}>Exam Ready for Deployment!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Your AI-generated exam on Thermodynamics has been saved and is ready to be distributed to your students.
            </p>
            <div className="flex justify-center gap-4">
              <button className="btn btn-secondary"><Download size={18} style={{ marginRight: '8px' }} /> Export as PDF</button>
              <button className="btn btn-primary" onClick={() => alert('Published!')}>Publish Digitally</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}`,
  'pages/Teacher/EvaluationCenter.jsx': `import React from 'react';
import Card from '../../components/Card';

export default function EvaluationCenter() {
  return (
    <Card title="Evaluation Center">
      <p style={{ color: 'var(--text-secondary)' }}>Manage scheduled digital exams and view submissions.</p>
    </Card>
  );
}`,
  'pages/Teacher/Analytics.jsx': `import React from 'react';
import Card from '../../components/Card';

export default function TeacherAnalytics() {
  return (
    <Card title="Class Analytics">
      <p style={{ color: 'var(--text-secondary)' }}>Class-wide performance heatmap to identify weak topics.</p>
    </Card>
  );
}`,
  'pages/Student/Dashboard.jsx': `import React from 'react';
import Card from '../../components/Card';
import { Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <h2 style={{ margin: 0, color: 'white', position: 'relative', zIndex: 1 }}>Welcome back, Student!</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', position: 'relative', zIndex: 1 }}>You have 1 upcoming exam this week. Keep up the good work!</p>
        <div style={{ position: 'absolute', right: '-20px', top: '-40px', opacity: 0.2 }}>
          <BookOpen size={200} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Next Exam" className="md:col-span-2">
          <div className="flex items-center justify-between" style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '8px' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '4px' }}>Advanced Physics Midterm</div>
              <div style={{ color: 'var(--text-muted)' }}>Chapter 3 & 4 (Thermodynamics)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-warning)', lineHeight: 1 }}>48:12:05</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HOURS : MINS : SECS</div>
            </div>
          </div>
        </Card>
        <Card title="Attendance Rate">
          <div style={{ height: '150px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{value: 85}, {value: 15}]} innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill="var(--accent-success)" />
                  <Cell fill="var(--bg-secondary)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>85%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Present</div>
            </div>
          </div>
        </Card>
      </div>
      
      <Card title="AI Recommendations">
        <div className="flex items-start gap-4" style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-warning)' }}>
          <AlertTriangle color="var(--accent-warning)" style={{ marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>You scored low in Thermodynamics and missed 2 classes.</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Please review "Chapter 4 PDF" in the Study Room before your upcoming exam. The AI has highlighted key sections you struggle with.</p>
            <button className="btn btn-secondary" style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.85rem' }}>Go to Study Room</button>
          </div>
        </div>
      </Card>
    </div>
  );
}`,
  'pages/Student/ExamCenter.jsx': `import React from 'react';
import Card from '../../components/Card';

export default function ExamCenter() {
  return (
    <Card title="Active Exams">
      <p style={{ color: 'var(--text-secondary)' }}>Secure, full-screen UI for taking active digital exams.</p>
    </Card>
  );
}`,
  'pages/Student/Analytics.jsx': `import React from 'react';
import Card from '../../components/Card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const data = [
  { subject: 'Kinematics', A: 90, fullMark: 100 },
  { subject: 'Thermodynamics', A: 45, fullMark: 100 },
  { subject: 'Electromagnetism', A: 75, fullMark: 100 },
  { subject: 'Optics', A: 60, fullMark: 100 },
  { subject: 'Quantum Mech', A: 85, fullMark: 100 },
  { subject: 'Fluid Mech', A: 55, fullMark: 100 },
];

export default function StudentAnalytics() {
  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      <Card title="Micro-Topic Performance">
        <div style={{ height: '400px', marginTop: '24px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Student" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}`,
  'pages/Student/StudyRoom.jsx': `import React from 'react';
import Card from '../../components/Card';

export default function StudyRoom() {
  return (
    <Card title="Study Room">
      <p style={{ color: 'var(--text-secondary)' }}>View and read teacher-uploaded PDFs. (Backend tracks read time).</p>
    </Card>
  );
}`,
  'pages/Student/Attendance.jsx': `import React from 'react';
import Card from '../../components/Card';

export default function Attendance() {
  return (
    <Card title="Attendance Log">
      <p style={{ color: 'var(--text-secondary)' }}>Calendar view highlighting Present/Absent days.</p>
    </Card>
  );
}`,
  'App.jsx': `import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, BookOpen, FileText, CheckSquare, Calendar, TrendingUp } from 'lucide-react';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import AdminSettings from './pages/Admin/Settings';

// Teacher Pages
import TeacherDashboard from './pages/Teacher/Dashboard';
import ResourceManager from './pages/Teacher/ResourceManager';
import AIExamGenerator from './pages/Teacher/AIExamGenerator';
import EvaluationCenter from './pages/Teacher/EvaluationCenter';
import TeacherAnalytics from './pages/Teacher/Analytics';

// Student Pages
import StudentDashboard from './pages/Student/Dashboard';
import ExamCenter from './pages/Student/ExamCenter';
import StudentAnalytics from './pages/Student/Analytics';
import StudyRoom from './pages/Student/StudyRoom';
import Attendance from './pages/Student/Attendance';

const adminLinks = [
  { path: '/admin', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { path: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
  { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
];

const teacherLinks = [
  { path: '/teacher', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/teacher/resources', label: 'Resource Manager', icon: <BookOpen size={20} /> },
  { path: '/teacher/generator', label: 'AI Generator', icon: <FileText size={20} /> },
  { path: '/teacher/evaluation', label: 'Evaluation Center', icon: <CheckSquare size={20} /> },
  { path: '/teacher/analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
];

const studentLinks = [
  { path: '/student', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/student/exams', label: 'Exam Center', icon: <FileText size={20} /> },
  { path: '/student/analytics', label: 'My Performance', icon: <TrendingUp size={20} /> },
  { path: '/student/study-room', label: 'Study Room', icon: <BookOpen size={20} /> },
  { path: '/student/attendance', label: 'Attendance Log', icon: <Calendar size={20} /> },
];

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout links={adminLinks} role="Admin" title="System Controller" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        {/* Teacher Routes */}
        <Route path="/teacher" element={<DashboardLayout links={teacherLinks} role="Teacher" title="Command Center" />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="resources" element={<ResourceManager />} />
          <Route path="generator" element={<AIExamGenerator />} />
          <Route path="evaluation" element={<EvaluationCenter />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
        </Route>
        
        {/* Student Routes */}
        <Route path="/student" element={<DashboardLayout links={studentLinks} role="Student" title="Learning & Analytics Hub" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="exams" element={<ExamCenter />} />
          <Route path="analytics" element={<StudentAnalytics />} />
          <Route path="study-room" element={<StudyRoom />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(baseDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
});
console.log('Scaffolding complete!');

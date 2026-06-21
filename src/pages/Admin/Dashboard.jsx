import React from 'react';
import Card from '../../components/Card';
// Lucide icons representing dashboard metrics
import { Users, GraduationCap, FileText, Server } from 'lucide-react';
// Recharts components used to draw monthly exam metrics
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Mock dataset showing exam statistics over the last six months.
 * Used for populating the YTD Exams chart on the admin view.
 */
const data = [
  { name: 'Jan', exams: 40 }, { name: 'Feb', exams: 30 }, { name: 'Mar', exams: 45 },
  { name: 'Apr', exams: 50 }, { name: 'May', exams: 65 }, { name: 'Jun', exams: 55 }
];

/**
 * AdminDashboard Component
 * 
 * Renders the main dashboard for QGenix system administrators.
 * It contains:
 * 1. A top grid displaying overall statistics (Students, Teachers, Exams, Server Health).
 * 2. An analytics section showing a Year-To-Date (YTD) bar chart of exams.
 * 3. A list of active system alerts and notifications.
 */
export default function AdminDashboard() {
  return (
    <div className="flex-col gap-6" style={{ display: 'flex' }}>
      {/* ======= METRIC CARDS SECTION ======= */}
      {/* A grid of four responsive Cards showing key numbers and system status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Students Counter Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}><Users size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Students</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>4,250</div></div>
          </div>
        </Card>
        {/* Active Teachers Counter Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--accent-success)' }}><GraduationCap size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Teachers</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>128</div></div>
          </div>
        </Card>
        {/* Total Exams Conducted Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-secondary)' }}><FileText size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Exams Conducted</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1,842</div></div>
          </div>
        </Card>
        {/* AI Generator Server Health Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: 'var(--accent-warning)' }}><Server size={24} /></div>
            <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI Server Health</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>99.9%</div></div>
          </div>
        </Card>
      </div>
      
      {/* ======= ANALYTICS AND ALERTS SECTION ======= */}
      {/* Holds visual statistics and system logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ flex: 1 }}>
        {/* Year-To-Date (YTD) Exams Bar Chart Card */}
        <Card title="Exams Conducted (YTD)" className="md:col-span-2">
          <div style={{ height: '300px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                {/* Styled tooltip container matching the theme style */}
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="exams" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        {/* Real-time System Alerts Logs Card */}
        <Card title="System Alerts">
          <div className="flex-col gap-4" style={{ display: 'flex', marginTop: '16px' }}>
            {/* Maps over current active alerts to inform the admin of issues */}
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
}
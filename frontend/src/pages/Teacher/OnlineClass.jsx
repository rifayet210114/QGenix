import React, { useState, useEffect } from 'react';
import { 
  Video, Users, Plus, CheckCircle2, Clock, Calendar, 
  ExternalLink, Sparkles, BookOpen, Layers, Radio, AlertCircle,
  Copy, Check, PhoneOff, RefreshCw, Eye
} from 'lucide-react';
import { API_BASE } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import JitsiClassroom from '../../components/JitsiClassroom';

export default function TeacherOnlineClass() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const teacherName = profile?.fullName || user?.first_name 
    ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() 
    : user?.username || 'Teacher';

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Available options loaded from database
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    course_code: '',
    course_title: '',
    batch: 'Batch 2023 - 2024',
    semester: '5th Semester',
    section: 'A',
    title: ''
  });

  const semestersList = [
    '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
    '5th Semester', '6th Semester', '7th Semester', '8th Semester'
  ];

  const sectionsList = ['All', 'A', 'B', 'C'];

  // Fetch courses and batches from database
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/courses/`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE}/api/auth/batches/`).then(r => r.json()).catch(() => [])
        ]);

        const loadedCourses = Array.isArray(cRes) ? cRes : cRes?.results || [];
        const loadedBatches = Array.isArray(bRes) ? bRes : bRes?.results || [];

        setCourses(loadedCourses);
        setBatches(loadedBatches);

        if (loadedCourses.length > 0) {
          setFormData(prev => ({
            ...prev,
            course_code: loadedCourses[0].code || loadedCourses[0].course_code || 'CSE-301',
            course_title: loadedCourses[0].title || loadedCourses[0].course_title || 'Database Systems'
          }));
        }
        if (loadedBatches.length > 0) {
          setFormData(prev => ({
            ...prev,
            batch: loadedBatches[0].name || loadedBatches[0].batch_name || 'Batch 2023 - 2024'
          }));
        }
      } catch (err) {
        console.warn('Error fetching options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch online class sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/online-classes/`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.results || [];
      setSessions(list);

      // Check if there is an active session
      const live = list.find(s => s.status === 'LIVE' && s.is_active);
      if (live && !activeSession) {
        // Don't auto-open unless user clicks, but keep track
      }
    } catch (err) {
      console.warn('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCourseChange = (e) => {
    const selectedCode = e.target.value;
    const selectedCourse = courses.find(c => (c.code || c.course_code) === selectedCode);
    setFormData(prev => ({
      ...prev,
      course_code: selectedCode,
      course_title: selectedCourse ? (selectedCourse.title || selectedCourse.course_title) : prev.course_title
    }));
  };

  const handleLaunchSession = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a class topic / title');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        course_code: formData.course_code || 'CSE-301',
        course_title: formData.course_title || 'Live Lecture Session',
        teacher: teacherName,
        batch: formData.batch,
        semester: formData.semester,
        section: formData.section,
        scheduled_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'LIVE',
        is_active: true
      };

      const res = await fetch(`${API_BASE}/api/auth/online-classes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const newSession = await res.json();

      // Broadcast event so any active student tabs immediately receive notification toast
      try {
        const channel = new BroadcastChannel('qgenix_online_class_sync');
        channel.postMessage({
          type: 'CLASS_STARTED',
          session: newSession,
          timestamp: Date.now()
        });
        localStorage.setItem('qgenix_latest_online_class', JSON.stringify(newSession));
        window.dispatchEvent(new Event('qgenix_notices_updated'));
      } catch (broadcastErr) {
        console.warn('Broadcast sync error:', broadcastErr);
      }

      setShowModal(false);
      setFormData(prev => ({ ...prev, title: '' }));
      await fetchSessions();
      setActiveSession(newSession);
    } catch (err) {
      console.error('Failed to launch online class:', err);
      alert('Failed to launch session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to conclude and end this live class session?')) return;
    try {
      await fetch(`${API_BASE}/api/auth/online-classes/${sessionId}/end/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (activeSession && activeSession.id === sessionId) {
        setActiveSession(null);
      }
      await fetchSessions();
      
      // Notify students that class ended
      try {
        const channel = new BroadcastChannel('qgenix_online_class_sync');
        channel.postMessage({ type: 'CLASS_ENDED', sessionId });
      } catch (e) {}
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };

  const copyRoomLink = (session) => {
    const link = session.meeting_link || `https://meet.ffmuc.net/${session.room_id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(session.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Stats calculation
  const liveCount = sessions.filter(s => s.status === 'LIVE' && s.is_active).length;
  const totalConducted = sessions.filter(s => s.status === 'COMPLETED').length;
  const totalAttendees = sessions.reduce((acc, s) => acc + (s.joined_students?.length || 0), 0);

  return (
    <div style={{ padding: '24px 32px', minHeight: '100%', color: '#f3f4f6' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <Video size={24} />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0, color: '#ffffff' }}>
              Online Live Classroom
            </h1>
          </div>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.95rem', maxWidth: '680px' }}>
            Generate real-time video lectures for your specific batch, semester, and section. Automatic high-priority notifications are dispatched to enrolled students immediately.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => fetchSessions()}
            className="navbar-btn-hover"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#d1d5db',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px -4px rgba(139, 92, 246, 0.5)'
            }}
          >
            <Plus size={18} /> Start New Online Class
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '600' }}>Active Live Sessions</span>
            <span style={{ padding: '4px 8px', borderRadius: '20px', background: liveCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(156, 163, 175, 0.1)', color: liveCount > 0 ? '#f87171' : '#9ca3af', fontSize: '0.75rem', fontWeight: '700' }}>
              {liveCount > 0 ? '● LIVE' : 'IDLE'}
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: liveCount > 0 ? '#f87171' : '#ffffff' }}>{liveCount}</div>
        </div>

        <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '600' }}>Completed Classes</span>
            <CheckCircle2 size={18} style={{ color: '#34d399' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>{totalConducted}</div>
        </div>

        <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '600' }}>Student Attendances</span>
            <Users size={18} style={{ color: '#60a5fa' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>{totalAttendees}</div>
        </div>

        <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '600' }}>Hosting Instructor</span>
            <Sparkles size={18} style={{ color: '#c084fc' }} />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {teacherName}
          </div>
        </div>
      </div>

      {/* Embedded Live Classroom Section (When a class is active / selected) */}
      {activeSession && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Active Interactive Studio — {activeSession.course_code}: {activeSession.title}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => copyRoomLink(activeSession)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#d1d5db',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {copiedId === activeSession.id ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
                {copiedId === activeSession.id ? 'Link Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={() => handleEndSession(activeSession.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <PhoneOff size={16} /> Conclude Session
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '20px' }}>
            <JitsiClassroom
              roomName={activeSession.room_id}
              subject={`${activeSession.course_code} - ${activeSession.title}`}
              userDisplayName={teacherName}
              userEmail={user?.email || 'teacher@qgenix.edu'}
              isTeacher={true}
              height="620px"
              onLeave={() => setActiveSession(null)}
            />

            {/* Side Panel: Audience & Attendance Roster */}
            <div
              style={{
                borderRadius: '16px',
                background: 'rgba(17, 24, 39, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                height: '620px',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#c084fc" />
                Target & Attendance
              </h3>

              {/* Target info card */}
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Target Audience</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e5e7eb' }}>
                  {activeSession.batch}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  {activeSession.semester} • Section {activeSession.section}
                </div>
              </div>

              {/* Attendance list */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600' }}>Joined Students</span>
                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: '700' }}>
                  {activeSession.joined_students?.length || 0} Present
                </span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeSession.joined_students && activeSession.joined_students.length > 0 ? (
                  activeSession.joined_students.map((stu, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f3f4f6' }}>{stu.name || 'Student'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>ID: {stu.id || 'N/A'}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '500' }}>
                        {stu.joined_at || 'Just now'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                    Waiting for students to join from their student portal...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions History & Directory */}
      <div
        style={{
          borderRadius: '16px',
          background: 'rgba(17, 24, 39, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#ffffff' }}>Class Sessions Log</h3>
            <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '0.85rem' }}>
              Real-time records of all live and previous online lectures conducted via QGenix
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading session records...</div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Video size={40} style={{ color: '#4b5563', marginBottom: '12px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>No Online Classes Created Yet</div>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 18px auto' }}>
              Start an interactive online class session for your students. You can choose specific batches, semesters, and sections.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#8b5cf6',
                border: 'none',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Start First Class
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', color: '#9ca3af', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '14px 20px' }}>Course & Topic</th>
                  <th style={{ padding: '14px 20px' }}>Target Audience</th>
                  <th style={{ padding: '14px 20px' }}>Teacher</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Attendees</th>
                  <th style={{ padding: '14px 20px' }}>Date / Time</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => {
                  const isLive = sess.status === 'LIVE' && sess.is_active;
                  return (
                    <tr
                      key={sess.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: isLive ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#ffffff' }}>{sess.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#c084fc', marginTop: '2px' }}>
                          {sess.course_code}: {sess.course_title}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '600', color: '#e5e7eb' }}>{sess.batch}</div>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                          {sess.semester} • Sec {sess.section}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', color: '#d1d5db' }}>
                        {sess.teacher}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        {isLive ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                              color: '#f87171',
                              fontSize: '0.78rem',
                              fontWeight: '700'
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                            LIVE NOW
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: 'rgba(156, 163, 175, 0.15)',
                              color: '#9ca3af',
                              fontSize: '0.78rem',
                              fontWeight: '600'
                            }}
                          >
                            COMPLETED
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontWeight: '600', color: '#d1d5db' }}>
                          {sess.joined_students?.length || 0} students
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', color: '#9ca3af', fontSize: '0.82rem' }}>
                        {sess.created_at ? new Date(sess.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Today'}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {isLive ? (
                            <>
                              <button
                                onClick={() => setActiveSession(sess)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  background: '#8b5cf6',
                                  border: 'none',
                                  color: '#fff',
                                  fontSize: '0.82rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Enter Room
                              </button>
                              <button
                                onClick={() => handleEndSession(sess.id)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                  color: '#f87171',
                                  fontSize: '0.82rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                End
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => copyRoomLink(sess)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#9ca3af',
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                              }}
                            >
                              Copy Link
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Start New Online Class */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              borderRadius: '20px',
              background: 'linear-gradient(145deg, #182234, #0f172a)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.2)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc' }}>
                  <Radio size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
                    Launch Online Class
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    Enrolled students in the target cohort will be notified automatically
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleLaunchSession} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Course Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>
                    Course
                  </label>
                  <select
                    value={formData.course_code}
                    onChange={handleCourseChange}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    {courses.length > 0 ? (
                      courses.map(c => (
                        <option key={c.id || c.code} value={c.code || c.course_code} style={{ background: '#1e293b', color: '#fff' }}>
                          {c.code || c.course_code} - {c.title || c.course_title}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="CSE-301" style={{ background: '#1e293b', color: '#fff' }}>CSE-301 - Data Structures & Algorithms II</option>
                        <option value="CSE-303" style={{ background: '#1e293b', color: '#fff' }}>CSE-303 - Operating Systems</option>
                        <option value="CSE-305" style={{ background: '#1e293b', color: '#fff' }}>CSE-305 - Database Management Systems</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Batch Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>
                    Target Batch
                  </label>
                  <select
                    value={formData.batch}
                    onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    {batches.length > 0 ? (
                      batches.map(b => (
                        <option key={b.id || b.name} value={b.name || b.batch_name} style={{ background: '#1e293b', color: '#fff' }}>
                          {b.name || b.batch_name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Batch 2023 - 2024" style={{ background: '#1e293b', color: '#fff' }}>Batch 2023 - 2024</option>
                        <option value="Batch 2022 - 2023" style={{ background: '#1e293b', color: '#fff' }}>Batch 2022 - 2023</option>
                        <option value="Batch 2021 - 2022" style={{ background: '#1e293b', color: '#fff' }}>Batch 2021 - 2022</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Semester & Section Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>
                      Target Semester
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    >
                      {semestersList.map(s => (
                        <option key={s} value={s} style={{ background: '#1e293b', color: '#fff' }}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>
                      Section
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    >
                      {sectionsList.map(sec => (
                        <option key={sec} value={sec} style={{ background: '#1e293b', color: '#fff' }}>
                          Section {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Class Topic / Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#d1d5db', marginBottom: '6px' }}>
                    Lecture Topic / Class Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 6: CPU Scheduling & Deadlock Resolution"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Instant Alert info banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#93c5fd',
                    fontSize: '0.82rem',
                    lineHeight: '1.4'
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>
                    When you click launch, students matching <strong>{formData.batch}</strong>, <strong>{formData.semester}</strong>, and <strong>Section {formData.section}</strong> will receive an instant notification in their portal.
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#d1d5db',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.92rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(139, 92, 246, 0.5)'
                  }}
                >
                  {submitting ? 'Broadcasting & Launching...' : '🚀 Launch Class & Notify Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

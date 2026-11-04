import React, { useState, useEffect } from 'react';
import { 
  Video, Users, Radio, CheckCircle2, Clock, Calendar, 
  Sparkles, BookOpen, AlertCircle, RefreshCw, ArrowRight,
  ShieldCheck, PhoneOff, Check, Globe, ExternalLink
} from 'lucide-react';
import { API_BASE } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import JitsiClassroom from '../../components/JitsiClassroom';

export default function StudentOnlineClass() {
  const { user } = useAuth();
  const { profile } = useProfile();

  // Student details derived from user and profile
  const studentName = profile?.fullName || (user?.first_name 
    ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() 
    : user?.username || 'Student');

  const studentId = profile?.studentId || user?.institutional_id || user?.username || 'STU-902';
  const studentBatch = profile?.batch || user?.batch || 'Batch 2023 - 2024';
  const studentSemester = profile?.semester || user?.semester || '5th Semester';
  const studentSection = profile?.section || user?.section || 'A';
  const studentDept = profile?.department || user?.department || 'CSE';

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [joinedSession, setJoinedSession] = useState(null);
  const [joining, setJoining] = useState(false);
  const [checkedInGMeet, setCheckedInGMeet] = useState(false);

  // Fetch online classes targeted to this student
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const cleanBatch = (studentBatch || '').replace(/batch/i, '').replace(/-/g, ' ').trim().toLowerCase();
      
      const res = await fetch(`${API_BASE}/api/auth/online-classes/`);
      const data = await res.json();
      const allSessions = Array.isArray(data) ? data : data?.results || [];

      // Filter classes matching student's batch
      const filtered = allSessions.filter(s => {
        if (!cleanBatch) return true;
        const sBatch = (s.batch || '').toLowerCase();
        return sBatch.includes(cleanBatch) || cleanBatch.includes(sBatch.replace(/batch/i, '').trim());
      });

      const displayList = filtered.length > 0 ? filtered : allSessions;
      setSessions(displayList);

      const live = displayList.find(s => s.status === 'LIVE' && s.is_active);
      setActiveSession(live || null);
    } catch (err) {
      console.warn('Error fetching student online classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();

    const channel = new BroadcastChannel('qgenix_online_class_sync');
    channel.onmessage = (event) => {
      if (event.data?.type === 'CLASS_STARTED') {
        fetchClasses();
      } else if (event.data?.type === 'CLASS_ENDED') {
        if (joinedSession && joinedSession.id === event.data.sessionId) {
          setJoinedSession(null);
        }
        setCheckedInGMeet(false);
        fetchClasses();
      }
    };

    const interval = setInterval(fetchClasses, 15000);

    return () => {
      channel.close();
      clearInterval(interval);
    };
  }, [studentBatch, studentSemester, studentSection, joinedSession]);

  const handleJoinClass = async (session) => {
    try {
      setJoining(true);
      // Register attendance in database
      await fetch(`${API_BASE}/api/auth/online-classes/${session.id}/join/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          student_name: studentName
        })
      }).catch(e => console.warn('Join logging error:', e));

      const isGMeet = (session.meeting_link || '').includes('meet.google.com') || (session.meeting_link || '').includes('zoom.us');
      if (isGMeet && session.meeting_link) {
        window.open(session.meeting_link, '_blank');
        setCheckedInGMeet(true);
      } else {
        setJoinedSession(session);
      }
    } catch (err) {
      console.error('Error joining session:', err);
    } finally {
      setJoining(false);
      fetchClasses();
    }
  };

  const handleLeaveClass = () => {
    setJoinedSession(null);
    setCheckedInGMeet(false);
    fetchClasses();
  };

  const isGoogleMeet = (link) => (link || '').includes('meet.google.com');

  return (
    <div style={{ padding: '24px 32px', minHeight: '100%', color: '#f3f4f6' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
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
            Join interactive lectures conducted live by your course instructors with full HD audio, video, screen share, and group chat.
          </p>
        </div>

        <button
          onClick={fetchClasses}
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
          <RefreshCw size={16} /> Check for Live Class
        </button>
      </div>

      {/* Student Enrollment Status Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderRadius: '14px',
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
          <div style={{ fontSize: '0.9rem', color: '#d1d5db' }}>
            Enrolled Academic Cohort: <strong style={{ color: '#ffffff' }}>{studentBatch}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
          <span style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)', fontWeight: '600' }}>
            {studentSemester}
          </span>
          <span style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: '600' }}>
            Section {studentSection}
          </span>
          <span style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', color: '#d1d5db', fontWeight: '600' }}>
            {studentDept}
          </span>
        </div>
      </div>

      {/* In-App Interactive Classroom (When student joins Built-in room) */}
      {joinedSession ? (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Connected to {joinedSession.course_code}: {joinedSession.title}
              </h2>
            </div>
            <button
              onClick={handleLeaveClass}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#ef4444',
                border: 'none',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <PhoneOff size={16} /> Leave Classroom
            </button>
          </div>

          <JitsiClassroom
            roomName={joinedSession.room_id}
            meetingLink={joinedSession.meeting_link}
            subject={`${joinedSession.course_code}: ${joinedSession.title}`}
            userDisplayName={studentName}
            userEmail={user?.email || `${studentId.toLowerCase()}@qgenix.edu`}
            isTeacher={false}
            height="680px"
            onLeave={handleLeaveClass}
          />
        </div>
      ) : activeSession ? (
        /* Spotlight Card: Live Class Available Right Now */
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.35), rgba(15, 23, 42, 0.95))',
            border: '2px solid rgba(168, 85, 247, 0.5)',
            boxShadow: '0 20px 45px -10px rgba(168, 85, 247, 0.35), 0 0 30px rgba(139, 92, 246, 0.2)',
            padding: '32px',
            marginBottom: '32px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    fontWeight: '800'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                  LIVE CLASS IN PROGRESS
                </div>

                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: isGoogleMeet(activeSession.meeting_link) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                    color: isGoogleMeet(activeSession.meeting_link) ? '#93c5fd' : '#c084fc',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}
                >
                  {isGoogleMeet(activeSession.meeting_link) ? 'Google Meet Live Session' : 'Interactive Classroom'}
                </span>

                <span style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: '600' }}>
                  Target: {activeSession.batch} • {activeSession.semester}
                </span>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0', lineHeight: '1.25' }}>
                {activeSession.title}
              </h2>

              <div style={{ fontSize: '1.05rem', color: '#c084fc', fontWeight: '600', marginBottom: '16px' }}>
                {activeSession.course_code}: {activeSession.course_title}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', color: '#d1d5db', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} color="#9ca3af" />
                  <span>Instructor: <strong style={{ color: '#ffffff' }}>{activeSession.teacher}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="#9ca3af" />
                  <span>Started: {activeSession.scheduled_time || 'Just now'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={16} color="#34d399" />
                  <span>{activeSession.joined_students?.length || 0} Students attended</span>
                </div>
              </div>

              {checkedInGMeet && (
                <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.85rem', fontWeight: '700' }}>
                  <Check size={16} /> Attendance Recorded: You are checked in as Present!
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
              <button
                onClick={() => handleJoinClass(activeSession)}
                disabled={joining}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 36px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  cursor: joining ? 'wait' : 'pointer',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
                  transition: 'transform 0.2s',
                  transform: 'scale(1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Video size={22} />
                {joining ? 'Connecting...' : isGoogleMeet(activeSession.meeting_link) ? 'Join Google Meet Class' : 'Join Live Class Now'}
                <ArrowRight size={20} />
              </button>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '10px', textAlign: 'center', width: '100%' }}>
                One-click direct entry • Attendance auto-recorded
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No active class right now placeholder */
        <div
          style={{
            padding: '48px 24px',
            borderRadius: '16px',
            background: 'rgba(17, 24, 39, 0.5)',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            textAlign: 'center',
            marginBottom: '32px'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Video size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', margin: '0 0 8px 0' }}>
            No Live Online Class Active Right Now
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 16px auto', lineHeight: '1.5' }}>
            When your course instructor starts an online lecture for <strong>{studentBatch} ({studentSemester})</strong>, an instant notification banner will pop up here.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '6px 14px', borderRadius: '20px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
            Listening for instructor broadcasts in real time
          </div>
        </div>
      )}

      {/* Online Classes History Table */}
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
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#ffffff' }}>Online Class History</h3>
            <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '0.85rem' }}>
              Previous online lecture sessions held for {studentBatch} • {studentSemester}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading session records...</div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
            No online lecture sessions recorded for your cohort yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', color: '#9ca3af', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '14px 20px' }}>Course & Topic</th>
                  <th style={{ padding: '14px 20px' }}>Platform</th>
                  <th style={{ padding: '14px 20px' }}>Instructor</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Date / Time</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Your Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => {
                  const isLive = sess.status === 'LIVE' && sess.is_active;
                  const attended = sess.joined_students?.some(s => s.id === studentId);
                  const isGMeet = isGoogleMeet(sess.meeting_link);

                  return (
                    <tr
                      key={sess.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: isLive ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '700', color: '#ffffff' }}>{sess.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#c084fc', marginTop: '2px' }}>
                          {sess.course_code}: {sess.course_title}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '0.8rem', color: isGMeet ? '#60a5fa' : '#c084fc', fontWeight: '600' }}>
                          {isGMeet ? 'Google Meet' : 'Built-in Studio'}
                        </span>
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
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: 'rgba(156, 163, 175, 0.15)',
                              color: '#9ca3af',
                              fontSize: '0.78rem',
                              fontWeight: '600'
                            }}
                          >
                            CONCLUDED
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', color: '#9ca3af', fontSize: '0.82rem' }}>
                        {sess.created_at ? new Date(sess.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Today'}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {isLive ? (
                          <button
                            onClick={() => handleJoinClass(sess)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              background: '#10b981',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Join Now
                          </button>
                        ) : attended ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.82rem', fontWeight: '600' }}>
                            <Check size={14} /> Attended
                          </span>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                            Missed / Ended
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

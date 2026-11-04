import React, { useEffect, useState } from 'react';
import { Maximize2, Minimize2, PhoneOff, ExternalLink, Video } from 'lucide-react';

/**
 * JitsiClassroom Component
 * High-performance embedded WebRTC SFU interactive video classroom for QGenix
 * Runs 100% in-app with camera, microphone, screen sharing, chat, whiteboard & no login requirements
 */
export default function JitsiClassroom({
  roomName,
  subject,
  userDisplayName = 'Participant',
  userEmail = '',
  isTeacher = false,
  onLeave,
  height = '720px'
}) {
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Timer for class duration
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanRoom = (roomName || 'QGenix-Classroom')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 50);

  // MiroTalk SFU cluster:
  // screen=0 -> NEVER prompt for screen share on entry!
  // audio=0  -> start muted to avoid microphone feedback howl
  // video=1  -> camera enabled
  // notify=0 -> disable chime sound on join
  const embedUrl = `https://sfu.mirotalk.com/join?room=${cleanRoom}&name=${encodeURIComponent(userDisplayName)}&audio=0&video=1&screen=0&notify=0`;

  const toggleFullscreen = () => {
    const elem = document.getElementById('qgenix-classroom-wrapper');
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      id="qgenix-classroom-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.98))',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(139, 92, 246, 0.15)',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : height,
        zIndex: isFullscreen ? 99999 : 10
      }}
    >
      {/* Top Bar Navigation / Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#f87171'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 8px #ef4444'
              }}
            />
            LIVE CLASSROOM
          </div>

          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#f3f4f6' }}>
              {subject || 'Interactive Lecture Session'}
            </h4>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Connected as: <strong style={{ color: '#c084fc' }}>{userDisplayName}</strong> {isTeacher ? '(Host / Instructor)' : '(Student)'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '4px 12px',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '600',
              color: '#d1d5db',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            Duration: {formatDuration(sessionDuration)}
          </div>

          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new window / multi-monitor"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#d1d5db',
              textDecoration: 'none'
            }}
          >
            <ExternalLink size={17} />
          </a>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#d1d5db',
              cursor: 'pointer'
            }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            onClick={onLeave}
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
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <PhoneOff size={16} />
            {isTeacher ? 'End / Leave' : 'Leave Class'}
          </button>
        </div>
      </div>

      {/* Main Container where WebRTC Classroom iframe is mounted */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', background: '#0b0f19' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              background: '#0b0f19',
              zIndex: 20
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid rgba(139, 92, 246, 0.2)',
                borderTopColor: '#a855f7',
                animation: 'spin 1s linear infinite'
              }}
            />
            <div style={{ color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>
              Connecting to secure interactive video classroom...
            </div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={subject || 'QGenix Interactive Live Classroom'}
          allow="camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write; web-share; autoplay; picture-in-picture; screen-wake-lock"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}

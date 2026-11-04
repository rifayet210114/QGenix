import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, PhoneOff, Users, Video, Mic, Share2, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * JitsiClassroom Component
 * Embedded interactive video conference classroom for QGenix
 * Runs directly in-app using Jitsi Meet External API without external redirects
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
  const containerRef = useRef(null);
  const jitsiApiRef = useRef(null);
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

  useEffect(() => {
    let isMounted = true;

    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI);
          return;
        }

        const existingScript = document.getElementById('jitsi-external-api');
        if (existingScript) {
          existingScript.onload = () => resolve(window.JitsiMeetExternalAPI);
          existingScript.onerror = reject;
          return;
        }

        const script = document.createElement('script');
        script.id = 'jitsi-external-api';
        script.src = 'https://meet.ffmuc.net/external_api.js';
        script.async = true;
        script.onload = () => resolve(window.JitsiMeetExternalAPI);
        script.onerror = () => reject(new Error('Failed to load Jitsi API script'));
        document.body.appendChild(script);
      });
    };

    loadJitsiScript()
      .then((JitsiMeetExternalAPI) => {
        if (!isMounted || !containerRef.current) return;

        // Clean up previous instance if any
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
        }

        const cleanRoom = (roomName || 'QGenix-Classroom')
          .replace(/[^a-zA-Z0-9-_]/g, '')
          .slice(0, 50);

        const options = {
          roomName: cleanRoom,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false,
            disableThirdPartyRequests: true,
            toolbarButtons: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'raisehand',
              'videoquality',
              'filmstrip',
              'tileview',
              'select-background'
            ]
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Classmate',
            TOOLBAR_ALWAYS_VISIBLE: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false
          },
          userInfo: {
            displayName: userDisplayName,
            email: userEmail || 'user@qgenix.edu'
          }
        };

        const api = new JitsiMeetExternalAPI('meet.ffmuc.net', options);
        jitsiApiRef.current = api;
        setLoading(false);

        api.addEventListener('videoConferenceLeft', () => {
          if (onLeave) onLeave();
        });

        api.addEventListener('readyToClose', () => {
          if (onLeave) onLeave();
        });
      })
      .catch((err) => {
        console.error('Jitsi initialization failed:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {
          // Ignore disposal errors
        }
      }
    };
  }, [roomName, userDisplayName, userEmail]);

  const toggleFullscreen = () => {
    const elem = document.getElementById('qgenix-classroom-wrapper');
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleManualLeave = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand('hangup');
      } catch (e) {
        // Fallback
      }
    }
    if (onLeave) onLeave();
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
                boxShadow: '0 0 8px #ef4444',
                animation: 'pulse 1.5s infinite'
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
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            onClick={handleManualLeave}
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

      {/* Main Container where Jitsi iframe is mounted */}
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
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
              }
            `}</style>
          </div>
        )}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}


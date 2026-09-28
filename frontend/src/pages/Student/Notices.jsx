// ============================================================================
// Notices.jsx — QGenix Student Notice Board Component
// ============================================================================
// Designed to represent a comprehensive Student Notice Board. Contains:
//   1. Summary stats cards (Total Notices, Urgent Alerts, Event Announcements)
//   2. Category filtering tabs (All, Urgent, Academic, Administrative, Events)
//   3. Search bar filtering notice headers & subject bodies
//   4. Split-pane layout: Left scrollable notice list, Right detailed notice view
//   5. Responsive layout: Switches to detailed slide-in card view on mobile
//   6. Simulated attachment download progress animations and confirmation alerts
//
// [Bengali Note]:
// এই ফাইলটি বিশ্ববিদ্যালয়ের নোটিশ বোর্ড মডিউল। শিক্ষক ও অ্যাডমিনের সকল নোটিশ
// এখানে ক্যাটাগরি ও সার্চ ফিল্টার সহ দেখা যাবে। বামে নোটিশ লিস্ট এবং ডানে
// নোটিশ ডিটেইলস থাকবে। মোবাইলের জন্য সিঙ্গেল ভিউ সুইচিং ইন্টিগ্রেট করা হয়েছে।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react'; // React API library core hooks
import { motion, AnimatePresence } from 'framer-motion'; // Motion animations for transitions
import { 
  Bell, Search, SlidersHorizontal, ChevronRight, Download, FileText, 
  Calendar, Clock, User, Mail, ChevronLeft, AlertTriangle, Info
} from 'lucide-react'; // Lucide premium vector icons
import Card from '../../components/Card'; // Glass custom card wrapper

// ----------------------------------------------------------------------------
// 1. MOCK DATA: STUDENT NOTICES DATABASE
// ----------------------------------------------------------------------------
const noticesData = [
  {
    id: 1,
    title: 'Midterm Examination Guidelines & Secure Proctoring Instructions',
    content: 'Dear Students, please be informed that the upcoming Midterm Examinations will start on June 25, 2026. All exams will be conducted under secure online proctoring. You must verify your face recognition setup and webcam equipment before the exam session begins. The Vite fullscreen lock will be enabled, and tab switching will be flagged automatically.',
    category: 'Urgent',
    sender: 'Office of the Controller of Examinations',
    senderRole: 'Administration',
    senderEmail: 'controller@qgenix.edu',
    date: '2026-06-20',
    time: '09:30 AM',
    attachments: [
      { name: 'Midterm_Proctoring_Rules.pdf', size: '1.4 MB' }
    ]
  },
  {
    id: 2,
    title: 'Advanced Data Structures Assignment 3 Released',
    content: 'Hello everyone, Assignment 3 (Graph Algorithms & MST) has been posted. The deadline for submission is July 10, 2026, at 11:59 PM. Please review the BFS/DFS and Kruskal\'s algorithm slides in the course materials. Late submissions will result in a 10% penalty per day.',
    category: 'Academic',
    sender: 'Dr. Sarah Ahmed',
    senderRole: 'Course Instructor',
    senderEmail: 'sarah.ahmed@qgenix.edu',
    date: '2026-06-19',
    time: '02:15 PM',
    attachments: [
      { name: 'CSE301_Assignment_3_Spec.pdf', size: '840 KB' }
    ]
  },
  {
    id: 3,
    title: 'QGenix Annual Tech Fest & Hackathon 2026 Registration Open',
    content: 'We are excited to announce that registration for the QGenix Annual Hackathon is now live! The hackathon will take place from July 12-14 in the Main Hall. Categories include Web App Development, AI/ML Innovations, and Cyber Security. Team sizes can range from 2 to 4 members. Register before July 5 to secure your spot.',
    category: 'Events',
    sender: 'Club Coordinator',
    senderRole: 'Student Affairs',
    senderEmail: 'techfest@qgenix.edu',
    date: '2026-06-18',
    time: '11:00 AM',
    attachments: [
      { name: 'TechFest_Rules_and_Prizes.pdf', size: '2.5 MB' }
    ]
  },
  {
    id: 4,
    title: 'Notice Regarding National Holiday (Friday, June 26)',
    content: 'All academic activities, labs, and office services will remain closed on Friday, June 26, 2026, on the occasion of the National Holiday. Ongoing exams scheduled for that day are moved to the fallback slot on Saturday, June 27. Please check your routine tab for the updated schedules.',
    category: 'Administrative',
    sender: 'Registrar Office',
    senderRole: 'Administration',
    senderEmail: 'registrar@qgenix.edu',
    date: '2026-06-15',
    time: '08:00 AM',
    attachments: []
  }
];

export default function Notices() {
  // Sync page state light/dark theme variables
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    // Watch for class token updates on body tag
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Sync state with dynamic localStorage
  const [notices, setNotices] = useState(() => {
    const saved = localStorage.getItem('qgenix_notices');
    return saved ? JSON.parse(saved) : noticesData;
  });

  useEffect(() => {
    localStorage.setItem('qgenix_notices', JSON.stringify(notices));
  }, [notices]);

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState(''); // Text search input
  const [activeCategory, setActiveCategory] = useState('All'); // Category tab selector

  // Active Notice selection focal state
  const [selectedNoticeId, setSelectedNoticeId] = useState(() => {
    const saved = localStorage.getItem('qgenix_notices');
    const list = saved ? JSON.parse(saved) : noticesData;
    return list[0]?.id || 1;
  });

  // Mobile dual-view routing state (show list vs details pane on small viewports)
  const [mobileDetailActive, setMobileDetailActive] = useState(false);

  // Auto-scroll to the notice details card when selection changes
  useEffect(() => {
    if (selectedNoticeId) {
      const timer = setTimeout(() => {
        const element = document.getElementById('notice-details-card');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedNoticeId]);

  // Simulated download progress loader states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter notice records computed list
  const filteredNotices = useMemo(() => {
    return notices.filter(notice => {
      // Show notices that either target the student's cohort or are targeted to All
      const matchesBatch = !notice.targetBatch || notice.targetBatch === 'All' || notice.targetBatch === 'Batch 21';
      const matchesSemester = !notice.targetSemester || notice.targetSemester === 'All' || notice.targetSemester === '5th Semester';
      
      if (!matchesBatch || !matchesSemester) return false;

      const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            notice.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            notice.sender.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || notice.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [notices, searchQuery, activeCategory]);

  // Selected Notice record metadata
  const selectedNotice = useMemo(() => {
    return notices.find(n => n.id === selectedNoticeId) || notices[0];
  }, [notices, selectedNoticeId]);

  // Click row triggers
  const handleSelectNotice = (id) => {
    setSelectedNoticeId(id);
    setMobileDetailActive(true); // Open details pane for mobile viewport
  };

  // Launch simulated attachments download
  const triggerAttachmentDownload = (fileName) => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(15);

    const progressTimer = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(progressTimer);
      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        setToastMessage(`Downloaded file: "${fileName}" successfully.`);
        setTimeout(() => setToastMessage(null), 3000);
      }, 300);
    }, 900);
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      
      {/* =======================================================================
         PAGE LOCAL CUSTOM STYLING RULES
         ======================================================================= */}
      <style>{`
        /* Glassmorphic card styling matching existing system */
        .glass-card-notices {
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(10, 20, 42, 0.38) 0%,
            rgba(6, 12, 28, 0.48) 100%
          ) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 20px !important;
          backdrop-filter: blur(40px) saturate(220%) !important;
          -webkit-backdrop-filter: blur(40px) saturate(220%) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.14),
            inset 0 12px 24px rgba(255, 255, 255, 0.02),
            0 8px 32px -8px   rgba(0, 0, 0, 0.4) !important;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        body.light-mode .glass-card-notices {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        /* Decorative color orbs */
        .notices-glow-purple {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .notices-glow-blue {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0) 70%);
          filter: blur(55px);
          pointer-events: none;
          z-index: 0;
        }

        /* Notice rows styling */
        .notice-list-item {
          padding: 16px;
          border-radius: 16px;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.015);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .notice-list-item:hover {
          background: rgba(255, 255, 255, 0.045);
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246, 0.25);
        }

        .notice-list-item-selected {
          background: rgba(139, 92, 246, 0.08) !important;
          border-color: rgba(139, 92, 246, 0.4) !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1);
        }

        body.light-mode .notice-list-item {
          background: rgba(0, 0, 0, 0.01);
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        body.light-mode .notice-list-item:hover {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(139, 92, 246, 0.3);
        }

        body.light-mode .notice-list-item-selected {
          background: rgba(139, 92, 246, 0.05) !important;
        }

        /* Filter tab items */
        .notices-filter-bar {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
          overflow-x: auto;
        }

        body.light-mode .notices-filter-bar {
          background: rgba(0, 0, 0, 0.02);
        }

        .filter-btn {
          padding: 8px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .filter-btn:hover {
          color: var(--text-primary);
        }

        .filter-btn-active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }

        /* Category colors */
        .badge-urgent { background: rgba(239, 68, 68, 0.12); color: #EF4444; }
        .badge-academic { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
        .badge-events { background: rgba(16, 185, 129, 0.12); color: #10B981; }
        .badge-admin { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }

        /* Custom scrollbars */
        .notices-scroll-pane {
          max-height: 600px;
          overflow-y: auto;
          scrollbar-width: thin;
          padding-right: 4px;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none !important;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* Decorative Glow Orbs */}
      <div className="notices-glow-purple" style={{ top: '10%', left: '-8%' }} />
      <div className="notices-glow-blue" style={{ bottom: '15%', right: '-8%' }} />

      {/* =======================================================================
         SECTION 1: MAIN PAGE HEADER
         ======================================================================= */}
      <div className="flex justify-between items-center w-full relative z-10" style={{ paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <Bell className="text-violet-500 animate-bounce-slow" size={32} />
            University Notice Board
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Stay informed with official circulars and academic alerts sent directly from teachers and administrators.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: SUMMARY COUNT STATS CARDS
         ======================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', zIndex: 10, position: 'relative' }}>
        
        {/* Stat 1: Total notice counts */}
        <div className="glass-card-notices" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Announcements</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <Bell size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>4 Active</div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              All up to date
            </span>
          </div>
        </div>

        {/* Stat 2: Urgent notice alerts */}
        <div className="glass-card-notices" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Urgent Alerts</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>1 Critical</div>
            <span style={{ fontSize: '0.72rem', color: '#EF4444', display: 'block', marginTop: '4px', fontWeight: 600 }}>
              Midterm exam proctoring
            </span>
          </div>
        </div>

        {/* Stat 3: Last notice date */}
        <div className="glass-card-notices" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Last Updated</span>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Today, 09:30 AM</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
              By Controller Office
            </span>
          </div>
        </div>

      </div>

      {/* =======================================================================
         SECTION 3: FILTERS & SEARCH ROW CONTROLS
         ======================================================================= */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, position: 'relative' }}>
        
        {/* Category Selection Tabs */}
        <div className="notices-filter-bar">
          {['All', 'Urgent', 'Academic', 'Administrative', 'Events'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`filter-btn ${activeCategory === cat ? 'filter-btn-active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Text Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.85rem', height: '40px' }}
          />
        </div>

      </div>

      {/* =======================================================================
         SECTION 4: DUAL-PANE LIST & DETAIL LAYOUT (RESPONSIVE)
         ======================================================================= */}
      {/* 
         On Desktop: Left scrollable notice headers panel (1.2fr) | Right detailed viewport (1.8fr)
         On Mobile: Renders either the notice list or the selected notice detail pane depending on mobileDetailActive state
      */}
      <div className="w-full relative z-10">
        
        {/* Responsive layout containers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-[1.2fr_1.8fr]">
          
          {/* A. NOTICE LIST COLUMN PANEL */}
          <div 
            className={`flex flex-col gap-4 ${mobileDetailActive ? 'hidden lg:flex' : 'flex'}`}
          >
            <Card title="Circulars & Notice Index">
              <div className="notices-scroll-pane scrollbar-hidden flex flex-col gap-3" style={{ marginTop: '8px' }}>
                {filteredNotices.length === 0 ? (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No announcements matching your search filters.
                  </div>
                ) : (
                  filteredNotices.map((notice) => {
                    const isSelected = notice.id === selectedNoticeId;
                    const badgeClass = notice.category === 'Urgent' ? 'badge-urgent' :
                                       notice.category === 'Academic' ? 'badge-academic' :
                                       notice.category === 'Events' ? 'badge-events' : 'badge-admin';

                    return (
                      <div
                        key={notice.id}
                        onClick={() => handleSelectNotice(notice.id)}
                        className={`notice-list-item ${isSelected ? 'notice-list-item-selected' : ''}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            textTransform: 'uppercase'
                          }} className={badgeClass}>
                            {notice.category}
                          </span>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                            <Clock size={12} />
                            <span>{notice.date}</span>
                          </div>
                        </div>

                        <div>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                            {notice.title}
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>
                            {notice.content}
                          </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>From: <strong>{notice.sender}</strong></span>
                          <ChevronRight size={14} className="text-violet-500" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* B. NOTICE DETAILS COLUMN PANEL */}
          <div 
            id="notice-details-card"
            className={`flex flex-col gap-4 ${!mobileDetailActive ? 'hidden lg:flex' : 'flex'}`}
          >
            {selectedNotice && (
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setMobileDetailActive(false)}
                      className="lg:hidden flex items-center justify-center p-2 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span>Notice Details</span>
                  </div>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
                  
                  {/* Detailed Title Section */}
                  <div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      display: 'inline-block',
                      marginBottom: '8px'
                    }} className={
                      selectedNotice.category === 'Urgent' ? 'badge-urgent' :
                      selectedNotice.category === 'Academic' ? 'badge-academic' :
                      selectedNotice.category === 'Events' ? 'badge-events' : 'badge-admin'
                    }>
                      {selectedNotice.category} Notice
                    </span>
                    
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                      {selectedNotice.title}
                    </h3>
                  </div>

                  {/* Sender & Timing Metadata card */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '16px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', fontWeight: 'bold' }}>
                      <User size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedNotice.sender}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{selectedNotice.senderRole}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }} className="sm:text-right">
                      <span style={{ fontWeight: '700' }} className="flex items-center gap-1 sm:justify-end">
                        <Calendar size={12} />
                        {selectedNotice.date}
                      </span>
                      <span className="flex items-center gap-1 sm:justify-end">
                        <Clock size={12} />
                        {selectedNotice.time}
                      </span>
                    </div>
                  </div>

                  {/* Main Notice Body Content */}
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {selectedNotice.content}
                    </p>
                  </div>

                  {/* Attachments Section */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', tracking: '0.05em' }}>
                      Official Attachments
                    </h4>

                    {selectedNotice.attachments.length === 0 ? (
                      <div style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={16} />
                        <span>No downloadable attachment files with this announcement.</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {selectedNotice.attachments.map((file, idx) => (
                          <div 
                            key={idx}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '12px',
                              background: 'rgba(255,255,255,0.015)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <FileText size={18} style={{ color: '#8B5CF6' }} />
                              <div>
                                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>{file.name}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Size: {file.size}</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => triggerAttachmentDownload(file.name)}
                              disabled={isDownloading}
                              className="btn-resource-action"
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
                                gap: '6px',
                                fontWeight: '700'
                              }}
                            >
                              <Download size={12} />
                              <span>Get</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Simulated loader bar for download */}
                  <AnimatePresence>
                    {isDownloading && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ width: '100%' }}
                      >
                        <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${downloadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', transition: 'width 0.15s linear' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                          Fetching files... {downloadProgress}%
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </Card>
            )}
          </div>

        </div>

      </div>

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

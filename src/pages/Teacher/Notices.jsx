// ============================================================================
// Notices.jsx — QGenix Teacher Notice Board & Broadcast Panel
// ============================================================================
// Features:
//   1. Notice Feed: Split-pane layout (List on left, detail panel on right)
//   2. Notice Publisher: Form allowing teachers to specify Title, Content,
//      Category, Target Batch, Target Semester, and Attachments.
//   3. Delete Notice: Allows course instructors to delete notices they posted.
//   4. Roster Sync: Shares notice list with student board via 'qgenix_notices'.
//
// [Bengali Note]:
// এই ফাইলটি শিক্ষকের নোটিশ বোর্ড। শিক্ষক এখানে বিদ্যমান নোটিশগুলো দেখার পাশাপাশি
// নির্দিষ্ট ব্যাচ ও সেমিস্টার ফিল্টার করে নতুন নোটিশ প্রকাশ ও মুছে ফেলতে পারবেন।
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Search, SlidersHorizontal, ChevronRight, Download, FileText, 
  Calendar, Clock, User, Mail, ChevronLeft, AlertTriangle, Info,
  PlusCircle, Trash2, Send, CheckCircle2, RefreshCw
} from 'lucide-react';
import Card from '../../components/Card';

// ----------------------------------------------------------------------------
// 1. INITIAL MOCK DATA (Matches Student notice database)
// ----------------------------------------------------------------------------
const initialNoticesData = [
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
    targetBatch: 'All',
    targetSemester: 'All',
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
    targetBatch: 'Batch 21',
    targetSemester: '5th Semester',
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
    targetBatch: 'All',
    targetSemester: 'All',
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
    targetBatch: 'All',
    targetSemester: 'All',
    attachments: []
  }
];

export default function TeacherNotices() {
  const [isLightMode, setIsLightMode] = useState(document.body.classList.contains('light-mode'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Sync state with dynamic localStorage
  const [notices, setNotices] = useState(() => {
    const saved = localStorage.getItem('qgenix_notices');
    return saved ? JSON.parse(saved) : initialNoticesData;
  });

  useEffect(() => {
    localStorage.setItem('qgenix_notices', JSON.stringify(notices));
  }, [notices]);

  // Tab State: 'feed' | 'publish'
  const [activeTab, setActiveTab] = useState('feed');

  // Search & Categories filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Active notice focus
  const [selectedNoticeId, setSelectedNoticeId] = useState(() => {
    return notices[0]?.id || 1;
  });

  // Mobile split view state
  const [mobileDetailActive, setMobileDetailActive] = useState(false);

  // Form states
  const [pubTitle, setPubTitle] = useState('');
  const [pubCategory, setPubCategory] = useState('Academic');
  const [pubBatch, setPubBatch] = useState('All');
  const [pubSemester, setPubSemester] = useState('All');
  const [pubContent, setPubContent] = useState('');
  const [pubAttachmentName, setPubAttachmentName] = useState('');

  // UI Loaders
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter notice records computed list
  const filteredNotices = useMemo(() => {
    return notices.filter(notice => {
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

  // Publish dynamic notices submit
  const handlePublishNotice = (e) => {
    e.preventDefault();
    if (!pubTitle || !pubContent) {
      triggerToast('Please fill out Notice Title and Notice Content.');
      return;
    }

    setIsPublishing(true);
    setPublishProgress(15);

    const interval = setInterval(() => {
      setPublishProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setPublishProgress(100);

      setTimeout(() => {
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0];
        
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes} ${ampm}`;

        const attachmentsArray = [];
        if (pubAttachmentName.trim()) {
          attachmentsArray.push({
            name: pubAttachmentName,
            size: '1.2 MB'
          });
        }

        const newNoticeItem = {
          id: Date.now() + Math.random(),
          title: pubTitle,
          content: pubContent,
          category: pubCategory,
          sender: 'Dr. Sarah Ahmed',
          senderRole: 'Course Instructor',
          senderEmail: 'sarah.ahmed@qgenix.edu',
          date: formattedDate,
          time: formattedTime,
          targetBatch: pubBatch,
          targetSemester: pubSemester,
          attachments: attachmentsArray
        };

        setNotices(prev => [newNoticeItem, ...prev]);
        setSelectedNoticeId(newNoticeItem.id);

        // Reset fields
        setPubTitle('');
        setPubContent('');
        setPubAttachmentName('');
        setPubBatch('All');
        setPubSemester('All');
        setPubCategory('Academic');

        setIsPublishing(false);
        setActiveTab('feed');
        triggerToast('Broadcast notice successfully published to student rosters.');
      }, 300);

    }, 1200);
  };

  // Delete posted notice function
  const handleDeleteNotice = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this notice?')) {
      const remainingNotices = notices.filter(n => n.id !== id);
      setNotices(remainingNotices);
      
      // Auto select first notice after delete
      if (remainingNotices.length > 0) {
        setSelectedNoticeId(remainingNotices[0].id);
      } else {
        setSelectedNoticeId(null);
      }

      setMobileDetailActive(false);
      triggerToast('Notice deleted successfully.');
    }
  };

  return (
    <div className="flex-col gap-6 w-full relative z-10" style={{ display: 'flex' }}>
      
      {/* Page Inline CSS */}
      <style>{`
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
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .glass-card-notices:hover {
          transform: translateY(-2px) !important;
          box-shadow:
            inset 0 1.5px 0   rgba(255, 255, 255, 0.20),
            0 16px 40px -12px rgba(0, 0, 0, 0.55),
            0 0 25px -5px     rgba(139, 92, 246, 0.15) !important;
        }

        body.light-mode .glass-card-notices {
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 8px 30px -10px rgba(100, 160, 220, 0.15) !important;
        }

        body.light-mode .glass-card-notices:hover {
          background: rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 12px 40px -10px rgba(100, 160, 220, 0.2) !important;
        }

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

        .badge-urgent { background: rgba(239, 68, 68, 0.12); color: #EF4444; }
        .badge-academic { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
        .badge-events { background: rgba(16, 185, 129, 0.12); color: #10B981; }
        .badge-admin { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }

        .notices-scroll-pane {
          max-height: 520px;
          overflow-y: auto;
          scrollbar-width: thin;
          padding-right: 4px;
        }

        .tabs-notices-bar {
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 6px;
          width: fit-content;
        }
        body.light-mode .tabs-notices-bar {
          background: rgba(0, 0, 0, 0.02);
        }

        .tab-notices-btn {
          padding: 8px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .tab-notices-btn:hover {
          color: var(--text-primary);
        }
        .tab-notices-btn-active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.25);
        }
      `}</style>

      {/* Decorative Glow Orbs */}
      <div style={{ top: '10%', left: '-5%', position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ bottom: '15%', right: '-5%', position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0) 70%)', filter: 'blur(55px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* =======================================================================
         SECTION 1: PAGE HEADER
         ======================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }} className="flex items-center gap-3">
            <Bell className="text-violet-500" size={32} />
            Circulars & Notice Board
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
            Review official announcements, post notices for specific cohorts, and manage academic broadcasts.
          </p>
        </div>
      </div>

      {/* =======================================================================
         SECTION 2: NAVIGATION TABS
         ======================================================================= */}
      <div className="tabs-notices-bar">
        <button
          onClick={() => setActiveTab('feed')}
          className={`tab-notices-btn ${activeTab === 'feed' ? 'tab-notices-btn-active' : ''}`}
        >
          Notice Feed
        </button>
        <button
          onClick={() => setActiveTab('publish')}
          className={`tab-notices-btn ${activeTab === 'publish' ? 'tab-notices-btn-active' : ''}`}
        >
          Broadcast New Notice
        </button>
      </div>

      {/* =======================================================================
         SECTION 3: TOAST NOTIFICATIONS
         ======================================================================= */}
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

      {/* =======================================================================
         SECTION 4: ACTIVE TAB PANES
         ======================================================================= */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: NOTICE FEED split-pane */}
        {activeTab === 'feed' && (
          <motion.div
            key="feed-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}
            className="lg:grid-cols-[1.2fr_1.8fr] w-full"
          >
            
            {/* Left: Notices Scroll List */}
            <div className={`flex flex-col gap-4 ${mobileDetailActive ? 'hidden lg:flex' : 'flex'}`}>
              <Card title="Circulars & Broadcasts Index">
                
                {/* Search & Filters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text"
                      placeholder="Search notices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '38px', borderRadius: '12px', fontSize: '0.82rem', height: '36px' }}
                    />
                  </div>

                  <div className="notices-filter-bar" style={{ padding: '4px' }}>
                    {['All', 'Urgent', 'Academic', 'Administrative'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`filter-btn ${activeCategory === cat ? 'filter-btn-active' : ''}`}
                        style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px' }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="notices-scroll-pane flex flex-col gap-3">
                  {filteredNotices.length === 0 ? (
                    <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      No notices matched your criteria.
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
                          onClick={() => {
                            setSelectedNoticeId(notice.id);
                            setMobileDetailActive(true);
                          }}
                          className={`notice-list-item ${isSelected ? 'notice-list-item-selected' : ''}`}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }} className={badgeClass}>
                              {notice.category}
                            </span>
                            
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{notice.date}</span>
                          </div>

                          <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {notice.title}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>
                              {notice.content}
                            </p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>Sender: {notice.sender.substring(0, 18)}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>Batch: {notice.targetBatch || 'All'}</span>
                              <ChevronRight size={12} className="text-violet-500" />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </Card>
            </div>

            {/* Right: Detailed Notice Panel */}
            <div className={`flex flex-col gap-4 ${!mobileDetailActive ? 'hidden lg:flex' : 'flex'}`}>
              {selectedNotice ? (
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
                      <span>Notice Inspector</span>
                    </div>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
                    
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', display: 'inline-block' }} className={
                          selectedNotice.category === 'Urgent' ? 'badge-urgent' :
                          selectedNotice.category === 'Academic' ? 'badge-academic' : 'badge-admin'
                        }>
                          {selectedNotice.category} Notice
                        </span>
                        
                        <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px' }}>
                          Target: {selectedNotice.targetSemester || 'All'} Sem • {selectedNotice.targetBatch || 'All'} Batch
                        </span>
                      </div>
                      
                      <h3 style={{ margin: '12px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                        {selectedNotice.title}
                      </h3>
                    </div>

                    {/* Sender Profile Header */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '16px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', fontWeight: 'bold' }}>
                        <User size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedNotice.sender}</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{selectedNotice.senderRole} ({selectedNotice.senderEmail})</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: '700' }} className="flex items-center gap-1">
                          <Calendar size={12} />
                          {selectedNotice.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {selectedNotice.time}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {selectedNotice.content}
                      </p>
                    </div>

                    {/* Attachments */}
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        ATTACHMENTS
                      </h4>

                      {!selectedNotice.attachments || selectedNotice.attachments.length === 0 ? (
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Info size={14} />
                          <span>No attachment files referenced with this circular.</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedNotice.attachments.map((file, idx) => (
                            <div 
                              key={idx}
                              style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={16} style={{ color: '#8B5CF6' }} />
                                <div>
                                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{file.name}</span>
                                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>{file.size}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete capability if posted by Sarah */}
                    {selectedNotice.sender === 'Dr. Sarah Ahmed' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <button
                          onClick={() => handleDeleteNotice(selectedNotice.id)}
                          className="btn btn-secondary flex items-center gap-1"
                          style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#EF4444', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={14} />
                          <span>Delete Broadcast</span>
                        </button>
                      </div>
                    )}

                  </div>
                </Card>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Select an announcement to display detailed descriptions.
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* TAB 2: BROADCAST PUBLISHER FORM */}
        {activeTab === 'publish' && (
          <motion.div
            key="publish-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
          >
            <Card title="Broadcast & Publish Official Notice" className="glass-card-notices" style={{ padding: '28px' }}>
              
              <form onSubmit={handlePublishNotice} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '12px' }}>
                
                {/* Form inputs grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  
                  {/* Title */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Notice Subject / Title *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Schedule Update: Algortihms Lab Midterm Practical Viva"
                      value={pubTitle}
                      onChange={(e) => setPubTitle(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Category dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Notice Category *</label>
                    <select
                      value={pubCategory}
                      onChange={(e) => setPubCategory(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px' }}
                    >
                      <option value="Academic">Academic</option>
                      <option value="Urgent">Urgent Alert</option>
                      <option value="Administrative">Administrative</option>
                    </select>
                  </div>

                  {/* Target Semester */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Target Semester *</label>
                    <select
                      value={pubSemester}
                      onChange={(e) => setPubSemester(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px' }}
                    >
                      <option value="All">All Semesters</option>
                      <option value="4th Semester">4th Semester</option>
                      <option value="5th Semester">5th Semester</option>
                      <option value="6th Semester">6th Semester</option>
                    </select>
                  </div>

                  {/* Target Batch */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Target Batch *</label>
                    <select
                      value={pubBatch}
                      onChange={(e) => setPubBatch(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem', background: 'var(--bg-primary)', padding: '0 10px' }}
                    >
                      <option value="All">All Batches</option>
                      <option value="Batch 20">Batch 20</option>
                      <option value="Batch 21">Batch 21</option>
                      <option value="Batch 22">Batch 22</option>
                    </select>
                  </div>

                  {/* Optional attachment naming */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Add Attachment File Name (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Lab_Viva_Guidelines.pdf"
                      value={pubAttachmentName}
                      onChange={(e) => setPubAttachmentName(e.target.value)}
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                </div>

                {/* Content text area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Notice Broadcast Message Content *</label>
                  <textarea 
                    required
                    rows="6"
                    placeholder="Enter detailed notice content body text. Describe instructions clearly..."
                    value={pubContent}
                    onChange={(e) => setPubContent(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.85rem', padding: '10px 14px', height: 'auto', resize: 'vertical' }}
                  />
                </div>

                {/* Progress bar loader overlay */}
                <AnimatePresence>
                  {isPublishing && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}
                    >
                      <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${publishProgress}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)', transition: 'width 0.15s linear' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Validating notice payload and broadcasting notification emails... {publishProgress}%
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('feed')}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px' }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.82rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', opacity: isPublishing ? 0.7 : 1 }}
                  >
                    {isPublishing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>{isPublishing ? 'Publishing...' : 'Broadcast Notice'}</span>
                  </button>
                </div>

              </form>

            </Card>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}

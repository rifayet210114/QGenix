// =========================================================================================
// NoticeBoard.jsx — 100% Functional Central Notice Board & Circular Dispatch
// -----------------------------------------------------------------------------------------
// Bengali Note:
// এই পেজটি সম্পূর্ণ কার্যকর (100% Functional):
// ১. Compose Circular: শিরোনাম, ক্যাটাগরি, টার্গেটেড অডিয়েন্স এবং বার্তা দিয়ে নতুন নোটিশ পাবলিশ করা।
// ২. Pin / Unpin: যেকোনো নোটিশকে সরাসরি টপে পিন বা আনপিন করা।
// ৩. Delete Notice: তালিকা থেকে নোটিশ রিমুভ করা।
// ৪. Audience Filter: All, Teachers Only, Students Only ক্যাটাগরিতে রিয়েল-টাইম ফিল্টারিং।
// সমস্ত ডাটা AdminDataContext এবং LocalStorage-এ স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।
// =========================================================================================

import React, { useState } from 'react';
import Card from '../../components/Card';
import { useAdminData } from '../../contexts/AdminDataContext';
import { 
  Bell, 
  Pin, 
  Send, 
  Filter, 
  Paperclip, 
  Users, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  Plus, 
  X 
} from 'lucide-react';

export default function NoticeBoard() {
  const { notices, addNotice, deleteNotice, togglePinNotice } = useAdminData();

  const [toastMessage, setToastMessage] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterAudience, setFilterAudience] = useState('All');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Academic');
  const [newAudience, setNewAudience] = useState('All Students & Teachers');
  const [newPriority, setNewPriority] = useState('Normal');
  const [newContent, setNewContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  // Toast feedback helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  // Submit Notice
  const handlePublishNotice = (e) => {
    e.preventDefault();
    addNotice({
      title: newTitle,
      category: newCategory,
      audience: newAudience,
      priority: newPriority,
      pinned: isPinned,
      author: 'Office of the Administrator',
      content: newContent,
      attachment: null
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setIsPinned(false);
    showToast('Official Circular broadcasted across target portals!');
  };

  return (
    <div className="flex-col gap-6" style={{ display: 'flex', width: '100%' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '14px 22px',
            background: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
          }}
        >
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div 
        className="glass-panel" 
        style={{
          padding: '24px',
          borderRadius: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              Institutional Communications
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>
            Central Notice Board & Circular Dispatch
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Live circular board: broadcast announcements, pin urgent directives, and filter delivery channels.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>Create New Notice</span>
        </button>
      </div>

      {/* Audience Filter Pills */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} /> Filter Audience:
        </span>
        {['All', 'Teachers Only', 'All Students'].map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterAudience(filter)}
            className={`btn ${filterAudience === filter ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '20px' }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notices Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notices
          .filter(n => filterAudience === 'All' ? true : n.audience.includes(filterAudience))
          .map((notice) => (
            <div 
              key={notice.id}
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: '14px',
                borderLeft: notice.pinned ? '4px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: notice.pinned ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, var(--bg-secondary) 100%)' : 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Header Badges & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      togglePinNotice(notice.id);
                      showToast(notice.pinned ? 'Unpinned notice' : 'Pinned notice to top');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <span className={`badge ${notice.pinned ? 'badge-primary' : 'badge-secondary'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Pin size={12} /> {notice.pinned ? 'Pinned Directive' : 'Pin to Top'}
                    </span>
                  </button>
                  <span className="badge badge-secondary">{notice.category}</span>
                  <span className={`badge ${notice.priority === 'Urgent' ? 'badge-danger' : 'badge-warning'}`}>
                    {notice.priority}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} /> To: {notice.audience}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {notice.date}
                  </span>
                  <button 
                    onClick={() => {
                      if (window.confirm(`Delete circular "${notice.title}"?`)) {
                        deleteNotice(notice.id);
                        showToast('Notice permanently deleted.');
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}
                    title="Delete Notice"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 700 }}>
                {notice.title}
              </h3>

              {/* Content */}
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {notice.content}
              </p>

              {/* Footer Meta & Attachment */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color-light)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 500 }}>
                  Issued by: {notice.author}
                </div>

                {notice.attachment && (
                  <div 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-tertiary)',
                      fontSize: '0.8rem',
                      color: 'var(--accent-primary)',
                      cursor: 'pointer'
                    }}
                    onClick={() => showToast(`Downloading ${notice.attachment}`)}
                  >
                    <Paperclip size={14} />
                    <span>{notice.attachment}</span>
                  </div>
                )}
              </div>
            </div>
        ))}
      </div>

      {/* ==================== CREATE NOTICE MODAL ==================== */}
      {isCreateModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '28px',
              borderRadius: '16px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color-light)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Compose Official Circular</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePublishNotice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Circular Title</label>
                <input 
                  required 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Schedule for Course Advising & Add/Drop" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Category</label>
                  <select 
                    className="input-field" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option>Academic</option>
                    <option>Exam</option>
                    <option>Finance</option>
                    <option>Event</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Target Audience</label>
                  <select 
                    className="input-field" 
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="All Students & Teachers">All Students & Teachers</option>
                    <option value="Teachers Only">Teachers Only</option>
                    <option value="All Students">All Students</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Notice Body Content</label>
                <textarea 
                  required 
                  rows={4} 
                  className="input-field" 
                  placeholder="Type the detailed circular instructions here..." 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="pinCheck" 
                  checked={isPinned} 
                  onChange={(e) => setIsPinned(e.target.checked)} 
                  style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                />
                <label htmlFor="pinCheck" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Pin this circular to top of dashboard feed
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} /> Broadcast Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

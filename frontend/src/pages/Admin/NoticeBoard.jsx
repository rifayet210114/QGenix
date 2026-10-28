// =========================================================================================
// NoticeBoard.jsx — 100% Functional Central Notice Board
// -----------------------------------------------------------------------------------------
// Bengali Note:
// =========================================================================================

import React, { useState, useRef } from 'react';
import Card from '../../components/Card';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useDeleteConfirm } from '../../contexts/DeleteConfirmContext';
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
  X,
  ChevronRight,
  Eye,
  Shield,
  FileText,
  Download,
  Printer,
  Upload
} from 'lucide-react';

export default function NoticeBoard() {
  const { confirmDelete } = useDeleteConfirm();
  const { notices, addNotice, deleteNotice, togglePinNotice } = useAdminData();

  const [toastMessage, setToastMessage] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterAudience, setFilterAudience] = useState('All');
  const [selectedNotice, setSelectedNotice] = useState(null); // Notice Details Card Modal State

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Academic');
  const [newAudience, setNewAudience] = useState('All Students & Teachers');
  const [newPriority, setNewPriority] = useState('Normal');
  const [newContent, setNewContent] = useState('');
  const [isPinned, setIsPinned] = useState(true); // New notices are pinned to top by default
  const [attachedFile, setAttachedFile] = useState(null); // { name, size, type, data }

  const fileInputRef = useRef(null);

  // Toast feedback helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  // Handle file selection (PDF, Docs, Images, etc.)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('File size must be under 15 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        data: reader.result // Base64 Data URL for real downloading
      });
      showToast(`Attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Handle real or simulated download
  const handleDownloadAttachment = (notice) => {
    if (notice?.attachmentData) {
      const link = document.createElement('a');
      link.href = notice.attachmentData;
      link.download = notice.attachment || 'Notice_Document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloaded: ${notice.attachment}`);
    } else {
      showToast(`Downloading ${notice?.attachment || 'document'}...`);
    }
  };

  // Submit Notice — New notice is prioritized and placed at the very top
  const handlePublishNotice = (e) => {
    e.preventDefault();
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    addNotice({
      title: newTitle,
      category: newCategory,
      audience: newAudience,
      priority: newPriority,
      pinned: isPinned,
      author: 'Office of the Administrator',
      content: newContent,
      attachment: attachedFile ? attachedFile.name : null,
      attachmentData: attachedFile ? attachedFile.data : null,
      attachmentSize: attachedFile ? attachedFile.size : null,
      date: formattedDate
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsPinned(true);
    showToast('Official Notice broadcasted across target portals!');
  };

  // Audience Filtering & Strict Top-Sorting Logic
  const filteredAndSortedNotices = [...notices]
    .filter((n) => {
      const aud = (n.audience || '').trim().toLowerCase();
      if (filterAudience === 'All') return true;
      if (filterAudience === 'Teachers Only') {
        // Only notices explicitly targeted to teachers
        return aud === 'teachers only' || (aud.includes('teacher') && !aud.includes('student'));
      }
      if (filterAudience === 'Students Only') {
        // Only notices explicitly targeted to students
        return aud === 'students only' || aud === 'all students' || (aud.includes('student') && !aud.includes('teacher'));
      }
      return true;
    })
    .sort((a, b) => {
      // 1. Pinned notices go to the top
      if (Boolean(a.pinned) !== Boolean(b.pinned)) {
        return a.pinned ? -1 : 1;
      }
      // 2. Newest notices always on top (higher numeric id or timestamp)
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      if (idB !== idA) return idB - idA;
      return 0;
    });

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
            Central Notice Board
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Live circular board: broadcast announcements, pin urgent directives, and filter delivery channels.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => {
            setAttachedFile(null);
            setIsCreateModalOpen(true);
          }}
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
        {['All', 'Teachers Only', 'Students Only'].map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterAudience(filter)}
            className={`btn ${filterAudience === filter ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              padding: '6px 16px', 
              fontSize: '0.82rem', 
              borderRadius: '20px',
              fontWeight: filterAudience === filter ? 700 : 500,
              transition: 'all 0.2s ease'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notices Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAndSortedNotices.length === 0 ? (
          <div 
            className="glass-panel"
            style={{
              padding: '48px 24px',
              borderRadius: '16px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <Bell size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)' }}>No Notices Found</h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              There are currently no circulars matching the selected filter ({filterAudience}).
            </p>
          </div>
        ) : (
          filteredAndSortedNotices.map((notice) => (
            <div 
              key={notice.id}
              className="glass-panel"
              onClick={() => setSelectedNotice(notice)}
              title="Click to view complete notice details card"
              style={{
                padding: '24px',
                borderRadius: '14px',
                borderLeft: notice.pinned ? '4px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: notice.pinned 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, var(--bg-secondary) 100%)' 
                  : 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = notice.pinned ? 'var(--accent-primary)' : 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Header Badges & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinNotice(notice.id);
                      showToast(notice.pinned ? 'Unpinned notice' : 'Pinned notice to top');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    title={notice.pinned ? 'Click to unpin' : 'Click to pin to top'}
                  >
                    <span className={`badge ${notice.pinned ? 'badge-primary' : 'badge-secondary'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Pin size={12} /> {notice.pinned ? 'Pinned Directive' : 'Pin to Top'}
                    </span>
                  </button>
                  <span className="badge badge-secondary">{notice.category}</span>
                  <span className={`badge ${notice.priority === 'Urgent' ? 'badge-danger' : notice.priority === 'High' ? 'badge-warning' : 'badge-primary'}`}>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete({
                        title: 'Delete Official Circular',
                        itemName: `"${notice.title}"`,
                        itemType: 'Notice Circular',
                        warningText: 'This will permanently remove the circular announcement from student and teacher notice boards.',
                        confirmBtnText: 'Delete Notice',
                        onConfirm: () => {
                          deleteNotice(notice.id);
                          if (selectedNotice && selectedNotice.id === notice.id) {
                            setSelectedNotice(null);
                          }
                          showToast('Notice permanently deleted.');
                        }
                      });
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}
                    title="Delete Notice"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {notice.title}
              </h3>

              {/* Content preview */}
              <p style={{ margin: 0, fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {notice.content}
              </p>

              {/* Footer Meta, Attachment & Details prompt */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color-light)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 500 }}>
                  Issued by: {notice.author}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {notice.attachment && (
                    <div 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'var(--bg-tertiary)',
                        fontSize: '0.8rem',
                        color: 'var(--accent-primary)',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadAttachment(notice);
                      }}
                      title="Click to download attachment"
                    >
                      <Paperclip size={13} />
                      <span>{notice.attachment}</span>
                    </div>
                  )}

                  <div 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      color: 'var(--accent-primary)',
                      fontWeight: 600
                    }}
                  >
                    <span>View Details</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ==================== NOTICE DETAILS CARD MODAL ==================== */}
      {selectedNotice && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '20px'
          }}
          onClick={() => setSelectedNotice(null)}
        >
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '20px',
              background: 'var(--bg-primary)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(139, 92, 246, 0.15)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top Accent Gradient Bar */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #8B5CF6, #3B82F6, #EC4899)', flexShrink: 0 }} />

            {/* Modal Header */}
            <div style={{ padding: '24px 28px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color-light)', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Official Notice Details
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    REF: QG-CIRC-{selectedNotice.id}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                  {selectedNotice.title}
                </h3>
              </div>

              {/* Date & Close Button at Top Right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}>
                  <Calendar size={14} color="var(--accent-primary)" />
                  <span>{selectedNotice.date || 'Today'}</span>
                </div>

                <button 
                  onClick={() => setSelectedNotice(null)}
                  style={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)', 
                    cursor: 'pointer'
                  }}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Badges Strip */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {selectedNotice.pinned && (
                  <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Pin size={12} /> Pinned Directive
                  </span>
                )}
                <span className="badge badge-secondary">{selectedNotice.category} Notice</span>
                <span className={`badge ${selectedNotice.priority === 'Urgent' ? 'badge-danger' : selectedNotice.priority === 'High' ? 'badge-warning' : 'badge-primary'}`}>
                  Priority: {selectedNotice.priority || 'Normal'}
                </span>
                <span style={{ fontSize: '0.82rem', padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Users size={14} /> To: <strong style={{ color: 'var(--text-primary)' }}>{selectedNotice.audience}</strong>
                </span>
              </div>

              {/* Full Content */}
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Notice Content & Directive
                </div>
                <div 
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.96rem',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    minHeight: '120px'
                  }}
                >
                  {selectedNotice.content}
                </div>
              </div>

              {/* Attachment if present */}
              {selectedNotice.attachment && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {selectedNotice.attachment}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {selectedNotice.attachmentSize || 'Official Attached Document'}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownloadAttachment(selectedNotice)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div 
              style={{
                padding: '16px 28px',
                borderTop: '1px solid var(--border-color-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <button 
                onClick={() => {
                  togglePinNotice(selectedNotice.id);
                  setSelectedNotice(prev => ({ ...prev, pinned: !prev.pinned }));
                  showToast(selectedNotice.pinned ? 'Unpinned notice' : 'Pinned notice to top');
                }}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Pin size={15} />
                <span>{selectedNotice.pinned ? 'Unpin Notice' : 'Pin to Top'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  onClick={() => window.print()}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <Printer size={15} />
                  <span>Print Circular</span>
                </button>
                <button 
                  onClick={() => setSelectedNotice(null)}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE OFFICIAL NOTICE MODAL ==================== */}
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
              maxWidth: '580px',
              padding: '28px',
              borderRadius: '16px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color-light)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)'
                }}>
                  <Shield size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Official Notice</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePublishNotice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    <option value="Students Only">Students Only</option>
                  </select>
                </div>
              </div>

              {/* Notice Body Content & Attachment Upload */}
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

                {/* Hidden File Input */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.zip"
                />

                {/* File Attachment Box */}
                {!attachedFile ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '1.5px dashed var(--border-color)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      marginTop: '8px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-primary)'
                      }}>
                        <Upload size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Upload Document / PDF
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Attach PDF, Word, Excel, Images, or ZIP file (Max 15MB)
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                      Browse File
                    </span>
                  </div>
                ) : (
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      marginTop: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0
                      }}>
                        <FileText size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {attachedFile.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {attachedFile.size} • Attached Document
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-danger)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0
                      }}
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
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
                  Pin this notice to top of dashboard feed
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} /> Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================================
// DeleteConfirmContext.jsx — Universal Modern Delete Confirmation Modal System
// -----------------------------------------------------------------------------------------
// Bengali Note:
// পুরো প্রোজেক্টের যেকোনো জায়গা থেকে ডিলিট বাটনে ক্লিক করলে ব্রাউজারের সাধারণ window.confirm
// এর পরিবর্তে যাতে একটি আল্ট্রা-মডার্ন, গ্লাস-মরফিক ডিলিট কনফার্মেশন কার্ড/মডাল প্রদর্শিত হয়।
// =========================================================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

const DeleteConfirmContext = createContext(null);

export const DeleteConfirmProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: 'Confirm Deletion',
    itemName: '',
    itemType: 'Record',
    warningText: 'This action is irreversible. The selected record and associated data will be permanently removed.',
    confirmBtnText: 'Delete Permanently',
    onConfirm: null,
    onCancel: null
  });

  const confirmDelete = useCallback(({
    title = 'Confirm Permanent Deletion',
    itemName = '',
    itemType = 'Record',
    warningText = 'This action cannot be undone. All associated records and access privileges will be permanently revoked.',
    confirmBtnText = 'Delete Permanently',
    onConfirm,
    onCancel
  }) => {
    setModalState({
      isOpen: true,
      title,
      itemName,
      itemType,
      warningText,
      confirmBtnText,
      onConfirm,
      onCancel
    });
  }, []);

  const closeModal = useCallback(() => {
    if (modalState.onCancel) {
      modalState.onCancel();
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, [modalState]);

  const handleConfirmAction = useCallback(() => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, [modalState]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalState.isOpen) {
        closeModal();
      }
    };
    if (modalState.isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState.isOpen, closeModal]);

  return (
    <DeleteConfirmContext.Provider value={{ confirmDelete, closeModal }}>
      {children}

      {/* Universal Modern Custom Delete Confirmation Dialog Card */}
      {modalState.isOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(3, 7, 18, 0.78)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeInOverlay 0.18s ease-out'
          }}
          onClick={closeModal}
        >
          <style>{`
            @keyframes fadeInOverlay {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUpCard {
              from { opacity: 0; transform: scale(0.92) translateY(12px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes pulseDangerGlow {
              0%, 100% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.28); }
              50% { box-shadow: 0 0 45px rgba(239, 68, 68, 0.55); }
            }
            .delete-cancel-btn:hover {
              background: rgba(255, 255, 255, 0.1) !important;
              color: #ffffff !important;
              border-color: rgba(255, 255, 255, 0.25) !important;
            }
            .delete-confirm-btn:hover {
              background: #dc2626 !important;
              box-shadow: 0 6px 20px rgba(220, 38, 38, 0.45) !important;
              transform: translateY(-1px);
            }
          `}</style>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
              borderRadius: '20px',
              background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.98))',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.22)',
              padding: '28px 26px 24px 26px',
              color: '#f8fafc',
              animation: 'scaleUpCard 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden'
            }}
          >
            {/* Top decorative accent light */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: '10%',
                right: '10%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #ef4444, transparent)'
              }} 
            />

            {/* Close Cross Button */}
            <button
              onClick={closeModal}
              title="Cancel"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
            >
              <X size={16} />
            </button>

            {/* Header: Danger Icon & Title */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '18px' }}>
              <div 
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.35))',
                  border: '1.5px solid rgba(239, 68, 68, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f87171',
                  flexShrink: 0,
                  animation: 'pulseDangerGlow 2.5s infinite ease-in-out'
                }}
              >
                <Trash2 size={24} />
              </div>

              <div style={{ flex: 1, paddingRight: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span 
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(239, 68, 68, 0.18)',
                      color: '#fca5a5',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    {modalState.itemType || 'Record'}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  {modalState.title}
                </h3>
              </div>
            </div>

            {/* Selected Target Item Card Preview */}
            {modalState.itemName && (
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <ShieldAlert size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Target To Be Deleted:
                  </span>
                  <span 
                    style={{ 
                      fontSize: '0.92rem', 
                      fontWeight: 700, 
                      color: '#ffffff',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {modalState.itemName}
                  </span>
                </div>
              </div>
            )}

            {/* Warning Message Box */}
            <div 
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                borderLeft: '3px solid #ef4444',
                padding: '10px 14px',
                borderRadius: '0 8px 8px 0',
                marginBottom: '24px',
                fontSize: '0.82rem',
                color: '#cbd5e1',
                lineHeight: '1.45'
              }}
            >
              {modalState.warningText}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={closeModal}
                className="delete-cancel-btn"
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                className="delete-confirm-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                  transition: 'all 0.18s ease'
                }}
              >
                <Trash2 size={15} />
                <span>{modalState.confirmBtnText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DeleteConfirmContext.Provider>
  );
};

export const useDeleteConfirm = () => {
  const context = useContext(DeleteConfirmContext);
  if (!context) {
    throw new Error('useDeleteConfirm must be used within a DeleteConfirmProvider');
  }
  return context;
};

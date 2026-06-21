import React from 'react';

export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`glass-panel ${className}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
      {(title || action) && (
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          {title && <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
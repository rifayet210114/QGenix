import React from 'react';

export default function Card({ children, className = '', title, action, style = {}, onClick, onKeyDown, ...restProps }) {
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div 
      className={`glass-panel premium-card ${className}`} 
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        cursor: onClick ? 'pointer' : undefined,
        ...style 
      }}
      {...restProps}
    >
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
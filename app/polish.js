import React, { useState } from 'react';

// ── LOADING SPINNER ──────────────────────────────────────────────────────────
export function LoadingSpinner({ size = 32, color = '#4ECDC4', message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        width: size,
        height: size,
        border: `4px solid rgba(78, 205, 196, 0.2)`,
        borderTop: `4px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <div style={{ marginTop: 12, fontSize: 13, color: '#999' }}>{message}</div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── ERROR MESSAGE BANNER ─────────────────────────────────────────────────────
export function ErrorBanner({ message, onClose, T }) {
  return (
    <div style={{
      background: '#FF6B6B',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: 8,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      fontSize: 13,
      fontWeight: 700,
    }}>
      <div>⚠️ {message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: 4,
            color: '#fff',
            cursor: 'pointer',
            padding: '4px 8px',
            fontWeight: 700,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── SUCCESS BANNER ───────────────────────────────────────────────────────────
export function SuccessBanner({ message, onClose, T }) {
  return (
    <div style={{
      background: '#4CAF50',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: 8,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      fontSize: 13,
      fontWeight: 700,
    }}>
      <div>✅ {message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: 4,
            color: '#fff',
            cursor: 'pointer',
            padding: '4px 8px',
            fontWeight: 700,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── CONFIRMATION MODAL ───────────────────────────────────────────────────────
export function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = '✅ Confirm', cancelText = '❌ Cancel', danger = false, T }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        background: T.card,
        border: `2px solid ${danger ? '#FF6B6B' : T.accent}`,
        borderRadius: 16,
        padding: 32,
        maxWidth: 400,
        textAlign: 'center',
        color: T.text,
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{danger ? '⚠️' : '❓'}</div>
        <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700 }}>{title}</h2>
        <p style={{ color: '#999', marginBottom: 24, fontSize: 14 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: T.border,
              border: 'none',
              borderRadius: 8,
              color: T.text,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              background: danger ? '#FF6B6B' : T.accent,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TOOLTIP ──────────────────────────────────────────────────────────────────
export function Tooltip({ text, children, position = 'top' }) {
  const [visible, setVisible] = useState(false);

  const positionStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div style={{
          position: 'absolute',
          ...positionStyles[position],
          background: '#333',
          color: '#fff',
          padding: '6px 10px',
          borderRadius: 4,
          fontSize: 11,
          whiteSpace: 'nowrap',
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          {text}
          <div style={{
            position: 'absolute',
            width: 0,
            height: 0,
            borderStyle: 'solid',
            ...(position === 'top' && {
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '6px 6px 0 6px',
              borderColor: '#333 transparent transparent transparent',
            }),
            ...(position === 'bottom' && {
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '0 6px 6px 6px',
              borderColor: 'transparent transparent #333 transparent',
            }),
          }} />
        </div>
      )}
    </div>
  );
}

// ── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ progress, label, color = '#4ECDC4', height = 6, T }) {
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: T.text }}>{label}</div>}
      <div style={{
        width: '100%',
        height,
        background: T.border,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${Math.min(progress, 100)}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}

// ── BADGE ────────────────────────────────────────────────────────────────────
export function Badge({ text, color = '#4ECDC4', icon = '' }) {
  return (
    <span style={{
      display: 'inline-block',
      background: color,
      color: '#111',
      padding: '4px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 700,
      marginRight: 4,
    }}>
      {icon} {text}
    </span>
  );
}

// ── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'Nothing here', message = '', action = null, T }) {
  return (
    <div style={{
      padding: 40,
      textAlign: 'center',
      color: T.text,
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{title}</h3>
      {message && <p style={{ color: '#999', marginBottom: action ? 20 : 0 }}>{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '10px 20px',
            background: T.accent,
            border: 'none',
            borderRadius: 8,
            color: '#111',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── SKELETON LOADER ──────────────────────────────────────────────────────────
export function SkeletonLoader({ count = 3, height = 20, T }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            background: T.border,
            borderRadius: 4,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── MODAL WRAPPER ────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, footer = null, T }) {
  if(!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        maxWidth: 600,
        maxHeight: '90vh',
        overflowY: 'auto',
        color: T.text,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: `1px solid ${T.border}`,
          position: 'sticky',
          top: 0,
          background: T.card,
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: T.text,
              cursor: 'pointer',
              fontSize: 20,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '20px',
            borderTop: `1px solid ${T.border}`,
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TABS COMPONENT ───────────────────────────────────────────────────────────
export function TabPanel({ tabs, activeTab, onTabChange, T }) {
  return (
    <>
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: `2px solid ${T.border}`,
        marginBottom: 20,
        overflowX: 'auto',
        paddingBottom: 8,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? `2px solid ${T.accent}` : 'none',
              color: activeTab === tab.key ? T.accent : '#999',
              fontWeight: activeTab === tab.key ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: 14,
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs.find(t => t.key === activeTab)?.content}
      </div>
    </>
  );
}

// ── CARD COMPONENT ───────────────────────────────────────────────────────────
export function Card({ title, icon, children, footer = null, T }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    }}>
      {title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          fontSize: 14,
          fontWeight: 700,
          color: T.text,
        }}>
          {icon} {title}
        </div>
      )}
      <div style={{ color: T.text }}>
        {children}
      </div>
      {footer && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${T.border}`,
          fontSize: 12,
          color: '#999',
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}

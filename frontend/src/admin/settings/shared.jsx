// src/admin/settings/shared.jsx
// ─────────────────────────────────────────────────────────────
// Shared UI primitives reused across all settings tabs.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export const C = {
  midnight: '#0B1F3A', teal: '#14B8A6', tealDark: '#0E9488',
  border: 'rgba(11,31,58,0.1)', gray: '#6B7280', light: '#F9FAFB',
  error: '#EF4444'
};

// ── Toast ──────────────────────────────────────────────────────
export function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? C.teal : type === 'error' ? C.error : '#F59E0B';
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: 'white', borderRadius: 12, padding: '13px 20px',
      boxShadow: `0 6px 24px ${bg}55`,
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
      animation: 'stgToast 0.35s cubic-bezier(0.34,1.56,0.64,1)'
    }}>
      <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      {msg}
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%',
        width: 20, height: 20, cursor: 'pointer', color: 'white',
        fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>✕</button>
    </div>
  );
}

// ── Section card wrapper ───────────────────────────────────────
export function SettingCard({ title, subtitle, icon, children, onEdit, isEditing, saving, onSave, onCancel, hasData }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 12px rgba(11,31,58,0.06)',
      overflow: 'hidden', marginBottom: 24
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 24px',
        background: 'linear-gradient(135deg,rgba(20,184,166,0.05),rgba(11,31,58,0.02))',
        borderBottom: `1px solid ${C.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>{icon}</div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: C.midnight }}>
              {title}
            </div>
            {subtitle && <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{subtitle}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isEditing ? (
            <>
              <button onClick={onCancel} disabled={saving} style={btnSecondary}>Cancel</button>
              <button onClick={onSave} disabled={saving} style={{
                ...btnPrimary, opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 7
              }}>
                {saving && <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'stgSpin 0.8s linear infinite', display: 'inline-block' }} />}
                {saving ? 'Saving…' : '✓ Save'}
              </button>
            </>
          ) : (
            <button onClick={onEdit} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 8,
              background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)',
              color: C.teal, cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              {hasData ? 'Edit' : 'Setup'}
            </button>
          )}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '24px' }}>
        {children}
      </div>
    </div>
  );
}

// ── Input field ───────────────────────────────────────────────
export function Field({ label, hint, error, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 12, fontWeight: 700, color: error ? C.error : 'rgba(11,31,58,0.6)',
        letterSpacing: '0.08em', textTransform: 'uppercase'
      }}>
        {label}{required && <span style={{ color: C.teal, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && <span style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.5 }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: C.error, display: 'flex', alignItems: 'center', gap: 4 }}>⚠ {error}</span>}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', disabled, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      disabled={disabled}
      style={{
        padding: '11px 14px', border: `1.5px solid ${hasError ? C.error : focused ? C.teal : C.border}`,
        borderRadius: 10, fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#374151',
        background: disabled ? '#F9FAFB' : 'white', outline: 'none',
        boxShadow: focused && !disabled ? '0 0 0 3px rgba(20,184,166,0.1)' : 'none',
        transition: 'all 0.2s', width: '100%', boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'text'
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder}
      rows={rows} disabled={disabled}
      style={{
        padding: '11px 14px', border: `1.5px solid ${focused ? C.teal : C.border}`,
        borderRadius: 10, fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#374151',
        background: disabled ? '#F9FAFB' : 'white', outline: 'none', resize: 'vertical',
        boxShadow: focused && !disabled ? '0 0 0 3px rgba(20,184,166,0.1)' : 'none',
        transition: 'all 0.2s', width: '100%', boxSizing: 'border-box', lineHeight: 1.7
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.midnight }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: C.gray, marginTop: 3 }}>{description}</div>}
      </div>
      <button onClick={() => !disabled && onChange(!checked)} style={{
        width: 44, height: 24, borderRadius: 100, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? C.teal : '#D1D5DB', position: 'relative', transition: 'background 0.2s',
        flexShrink: 0, marginLeft: 16
      }}>
        <span style={{
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s'
        }} />
      </button>
    </div>
  );
}

// ── View row (key-value display when not editing) ──────────────
export function ViewRow({ label, value, isLink }) {
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '10px 0',
      borderBottom: `1px solid ${C.border}`, alignItems: 'flex-start'
    }}>
      <div style={{ width: 160, flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', paddingTop: 1 }}>
        {label}
      </div>
      <div style={{ flex: 1, fontSize: 14, color: value ? C.midnight : '#D1D5DB', wordBreak: 'break-word', fontStyle: value ? 'normal' : 'italic' }}>
        {value ? (
          isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: C.teal, textDecoration: 'none', wordBreak: 'break-all' }}>
              {value}
            </a>
          ) : value
        ) : 'Not set'}
      </div>
    </div>
  );
}

// ── Button styles ─────────────────────────────────────────────
export const btnPrimary = {
  padding: '9px 22px', borderRadius: 9, border: 'none',
  background: 'linear-gradient(135deg,#14B8A6,#0E9488)',
  color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,184,166,0.3)', transition: 'all 0.2s'
};

export const btnSecondary = {
  padding: '9px 18px', borderRadius: 9,
  border: '1px solid rgba(11,31,58,0.15)', background: 'white',
  color: '#374151', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s'
};

export const fieldGrid = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18
};

export const ANIM = `
  @keyframes stgToast { from{opacity:0;transform:translateY(10px) scale(0.95);} to{opacity:1;transform:translateY(0) scale(1);} }
  @keyframes stgSpin  { to{transform:rotate(360deg);} }
  @keyframes stgFadeIn{ from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
`;
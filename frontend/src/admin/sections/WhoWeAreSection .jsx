/**
 * WhoWeAreSection.jsx
 * ─────────────────────────────────────────────────────────────
 * Admin section to manage the "Who We Are" content.
 * Rules:
 *  - Only ONE entry can ever exist in who_we_are table
 *  - Default state: empty — shows a ✏️ Write icon/button
 *  - Write mode: full textarea + Save button
 *  - After save: content displayed in a styled card with Edit icon
 *  - Edit mode: textarea pre-filled with existing content + Update button
 *  - Cancel always returns to the previous stable state
 * ─────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useRef } from 'react';
import api from '../api';

// ── Toast notification ────────────────────────────────────────
function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);

  const colors = {
    success: { bg: '#14B8A6', shadow: 'rgba(20,184,166,0.4)' },
    error:   { bg: '#EF4444', shadow: 'rgba(239,68,68,0.4)'  },
  };
  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed', top: 28, right: 28, zIndex: 9999,
      background: c.bg, color: 'white',
      borderRadius: 14, padding: '15px 22px',
      boxShadow: `0 8px 32px ${c.shadow}`,
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600,
      animation: 'wwaSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      maxWidth: 380
    }}>
      <span style={{ fontSize: 20 }}>{type === 'success' ? '✅' : '❌'}</span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%',
        width: 22, height: 22, cursor: 'pointer', color: 'white',
        fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>✕</button>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{
      width: 36, height: 36, margin: '0 auto',
      border: '3px solid rgba(20,184,166,0.2)',
      borderTopColor: '#14B8A6', borderRadius: '50%',
      animation: 'wwaSpin 0.8s linear infinite'
    }} />
  );
}

// ── Write / Edit textarea form ────────────────────────────────
function ContentForm({ initialValue = '', onSave, onCancel, isEdit }) {
  const [text,    setText]    = useState(initialValue);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const textareaRef           = useRef(null);

  // Auto-focus and move cursor to end
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleSave = async () => {
    setError('');
    if (!text.trim()) {
      setError('Content cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await onSave(text.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Ctrl/Cmd + Enter to save
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div style={{
      background: '#F8FAFC',
      border: '1px solid rgba(20,184,166,0.2)',
      borderRadius: 16, padding: 28,
      animation: 'wwaFadeDown 0.3s ease'
    }}>
      {/* Form header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 18
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(20,184,166,0.12)',
            border: '1px solid rgba(20,184,166,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16
          }}>
            {isEdit ? '✏️' : '📝'}
          </div>
          <div>
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 16, fontWeight: 700, color: '#0B1F3A'
            }}>
              {isEdit ? 'Edit Content' : 'Write Content'}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
              Tip: Press <kbd style={{
                background: '#E5E7EB', borderRadius: 4, padding: '1px 5px',
                fontSize: 11, fontFamily: 'monospace', color: '#374151'
              }}>Ctrl + Enter</kbd> to save
            </div>
          </div>
        </div>
        <button onClick={onCancel} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9CA3AF', fontSize: 20, lineHeight: 1, padding: 4,
          borderRadius: 6, transition: 'color 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#374151'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
        >✕</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 14,
          color: '#EF4444', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => { setText(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="Write the 'Who We Are' content here. Describe the company background, experience, expertise, certifications and key strengths..."
          style={{
            width: '100%', minHeight: 320,
            padding: '16px 18px',
            border: '1.5px solid rgba(20,184,166,0.3)',
            borderRadius: 12, resize: 'vertical',
            fontFamily: 'Outfit, sans-serif', fontSize: 15,
            lineHeight: 1.8, color: '#374151',
            background: 'white', outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#14B8A6';
            e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(20,184,166,0.3)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {/* Character count */}
        <div style={{
          position: 'absolute', bottom: 12, right: 14,
          fontSize: 11, color: '#9CA3AF',
          background: 'rgba(255,255,255,0.85)',
          padding: '2px 8px', borderRadius: 100,
          pointerEvents: 'none'
        }}>
          {charCount} chars · {wordCount} words
        </div>
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex', gap: 12,
        justifyContent: 'flex-end', marginTop: 18
      }}>
        <button onClick={onCancel} disabled={saving} style={{
          padding: '11px 24px', borderRadius: 10,
          border: '1px solid rgba(11,31,58,0.15)',
          background: 'white', color: '#374151',
          fontFamily: 'Outfit, sans-serif', fontSize: 14,
          fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', opacity: saving ? 0.5 : 1
        }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#F9FAFB'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
        >
          Cancel
        </button>

        <button onClick={handleSave} disabled={saving || !text.trim()} style={{
          padding: '11px 28px', borderRadius: 10, border: 'none',
          background: (saving || !text.trim())
            ? 'rgba(20,184,166,0.4)'
            : 'linear-gradient(135deg,#14B8A6,#0E9488)',
          color: 'white', fontFamily: 'Outfit, sans-serif',
          fontSize: 14, fontWeight: 600,
          cursor: (saving || !text.trim()) ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: (saving || !text.trim()) ? 'none' : '0 4px 14px rgba(20,184,166,0.3)',
          transition: 'all 0.2s'
        }}
          onMouseEnter={e => { if (!saving && text.trim()) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {saving && (
            <span style={{
              width: 15, height: 15, display: 'inline-block',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white', borderRadius: '50%',
              animation: 'wwaSpin 0.8s linear infinite'
            }} />
          )}
          {saving ? (isEdit ? 'Updating…' : 'Saving…') : (isEdit ? '✓ Update' : '✓ Save')}
        </button>
      </div>
    </div>
  );
}

// ── Saved content display card ────────────────────────────────
function ContentCard({ data, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const preview = data.content.slice(0, 400);
  const isLong  = data.content.length > 400;

  const fmt = (dt) => new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={{
      background: 'white', borderRadius: 16,
      border: '1px solid rgba(11,31,58,0.08)',
      boxShadow: '0 4px 20px rgba(11,31,58,0.06)',
      overflow: 'hidden',
      animation: 'wwaFadeDown 0.35s ease'
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px',
        background: 'linear-gradient(135deg,rgba(20,184,166,0.06),rgba(11,31,58,0.03))',
        borderBottom: '1px solid rgba(11,31,58,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#14B8A6',
            boxShadow: '0 0 6px rgba(20,184,166,0.5)'
          }} />
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 15, fontWeight: 700, color: '#0B1F3A'
          }}>Who We Are — Content</span>
        </div>

        {/* Edit icon button */}
        <button
          onClick={onEdit}
          title="Edit content"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(20,184,166,0.08)',
            border: '1px solid rgba(20,184,166,0.2)',
            color: '#14B8A6', cursor: 'pointer',
            fontFamily: 'Outfit, sans-serif',
            fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(20,184,166,0.15)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(20,184,166,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(20,184,166,0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Pencil SVG icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
      </div>

      {/* Content body */}
      <div style={{ padding: '24px 28px' }}>
        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 15, lineHeight: 1.85, color: '#374151',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word'
        }}>
          {expanded || !isLong ? data.content : preview + '…'}
        </div>

        {isLong && (
          <button onClick={() => setExpanded(e => !e)} style={{
            marginTop: 14, background: 'none', border: 'none',
            cursor: 'pointer', color: '#14B8A6',
            fontFamily: 'Outfit, sans-serif', fontSize: 13,
            fontWeight: 600, padding: 0,
            display: 'flex', alignItems: 'center', gap: 5
          }}>
            {expanded ? 'Show less ↑' : 'Read more ↓'}
          </button>
        )}
      </div>

      {/* Footer — timestamps */}
      <div style={{
        padding: '12px 28px',
        borderTop: '1px solid rgba(11,31,58,0.05)',
        background: '#FAFAFA',
        display: 'flex', gap: 24, flexWrap: 'wrap'
      }}>
        {[
          { label: 'Created',      value: fmt(data.created_at) },
          { label: 'Last updated', value: fmt(data.updated_at) },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {item.label}:
            </span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty state — no content yet ──────────────────────────────
function EmptyState({ onWrite }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{
      background: 'white', borderRadius: 16,
      border: '2px dashed rgba(20,184,166,0.25)',
      padding: '64px 40px', textAlign: 'center',
      transition: 'border-color 0.2s',
      animation: 'wwaFadeDown 0.3s ease'
    }}>
      {/* Write icon button */}
      <button
        onClick={onWrite}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'rgba(20,184,166,0.12)' : 'rgba(20,184,166,0.07)',
          border: `2px solid ${hovered ? 'rgba(20,184,166,0.5)' : 'rgba(20,184,166,0.2)'}`,
          borderRadius: '50%', width: 80, height: 80,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', cursor: 'pointer',
          transition: 'all 0.3s',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          boxShadow: hovered ? '0 8px 24px rgba(20,184,166,0.2)' : 'none'
        }}
        title="Write content"
      >
        {/* Pen / write SVG */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="#14B8A6" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>

      <h3 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 20, fontWeight: 700,
        color: '#0B1F3A', marginBottom: 10
      }}>No content written yet</h3>

      <p style={{
        color: '#9CA3AF', fontSize: 14, lineHeight: 1.7,
        maxWidth: 400, margin: '0 auto 28px'
      }}>
        Click the write icon above to add the <b>"Who We Are"</b> section content.
        Once written, you can edit it any time using the Edit button.
      </p>

      <button onClick={onWrite} style={{
        padding: '12px 28px', borderRadius: 10, border: 'none',
        background: 'linear-gradient(135deg,#14B8A6,#0E9488)',
        color: 'white', fontFamily: 'Outfit, sans-serif',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        transition: 'all 0.2s'
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        Write Content
      </button>
    </div>
  );
}

// ── Main WhoWeAreSection ──────────────────────────────────────
export default function WhoWeAreSection() {
  // 'loading' | 'empty' | 'view' | 'writing' | 'editing'
  const [mode,    setMode]    = useState('loading');
  const [data,    setData]    = useState(null);      // saved row from DB
  const [toast,   setToast]   = useState(null);
  const [fetchErr,setFetchErr] = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // Load existing content on mount
  useEffect(() => {
    api.get('/api/admin/whoweare')
      .then(({ data: res }) => {
        if (res.success && res.data) {
          setData(res.data);
          setMode('view');
        } else {
          setMode('empty');
        }
      })
      .catch(() => {
        setFetchErr('Could not load content. Is the backend running?');
        setMode('empty');
      });
  }, []);

  // POST — create new entry
  const handleCreate = async (text) => {
    const { data: res } = await api.post('/api/admin/whoweare', { content: text });
    setData(res.data);
    setMode('view');
    showToast('Content saved successfully! 🎉');
  };

  // PUT — update existing entry
  const handleUpdate = async (text) => {
    const { data: res } = await api.put('/api/admin/whoweare', { content: text });
    setData(res.data);
    setMode('view');
    showToast('Content updated successfully! ✨');
  };

  return (
    <div style={{
      marginTop: 24,
      background: 'white', borderRadius: 20,
      border: '1px solid rgba(11,31,58,0.08)',
      boxShadow: '0 4px 24px rgba(11,31,58,0.06)',
      overflow: 'hidden',
      animation: 'wwaFadeDown 0.35s ease',
      fontFamily: 'Outfit, sans-serif'
    }}>

      {/* Section header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 28px',
        borderBottom: '1px solid rgba(11,31,58,0.07)',
        background: 'linear-gradient(135deg,#0B1F3A 0%,#0d2a4a 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(20,184,166,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>🏢</div>
          <div>
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 18, fontWeight: 700, color: 'white', margin: 0
            }}>Who We Are</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0 }}>
              {mode === 'view' ? 'Content saved · click Edit to modify' : 'No content yet'}
            </p>
          </div>
        </div>

        {/* Header action: show Write button only in empty mode from header */}
        {mode === 'empty' && (
          <button onClick={() => setMode('writing')} style={{
            padding: '9px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#14B8A6,#0E9488)',
            color: 'white', fontFamily: 'Outfit, sans-serif',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: '0 4px 14px rgba(20,184,166,0.4)',
            transition: 'all 0.2s'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Write
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 28 }}>

        {fetchErr && (
          <div style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, padding: '12px 16px',
            color: '#EF4444', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 20
          }}>
            🔌 {fetchErr}
          </div>
        )}

        {/* LOADING */}
        {mode === 'loading' && (
          <div style={{ textAlign: 'center', padding: '52px 0' }}>
            <Spinner />
            <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 16 }}>Loading content…</p>
          </div>
        )}

        {/* EMPTY — no content yet */}
        {mode === 'empty' && (
          <EmptyState onWrite={() => setMode('writing')} />
        )}

        {/* WRITING — create new */}
        {mode === 'writing' && (
          <ContentForm
            initialValue=""
            isEdit={false}
            onSave={handleCreate}
            onCancel={() => setMode('empty')}
          />
        )}

        {/* VIEW — show saved content */}
        {mode === 'view' && data && (
          <ContentCard
            data={data}
            onEdit={() => setMode('editing')}
          />
        )}

        {/* EDITING — update existing */}
        {mode === 'editing' && data && (
          <ContentForm
            initialValue={data.content}
            isEdit={true}
            onSave={handleUpdate}
            onCancel={() => setMode('view')}
          />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      <style>{`
        @keyframes wwaFadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wwaSlideIn {
          from { opacity: 0; transform: translateX(30px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes wwaSpin {
          to { transform: rotate(360deg); }
        }
        textarea::placeholder {
          color: #C4C9D4 !important;
        }
      `}</style>
    </div>
  );
}
/**
 * ServicesSection.jsx
 * ─────────────────────────────────────────────────────────────
 * Two togglable tabs in one panel:
 *   [⚡ Services]   [📋 Deliverables]    ← nav-bar style tabs in the header
 *
 * Services tab  — full CRUD (unchanged logic, same as before)
 * Deliverables tab — single-entry write/edit with bullet-point editor
 * ─────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useRef } from 'react';
import api from '../api';

// ══════════════════════════════════════════════════════════════
//  Shared primitives  (Toast, ConfirmDialog, ImagePicker, inputs)
// ══════════════════════════════════════════════════════════════

function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? '#14B8A6' : '#EF4444';
  return (
    <div style={{
      position: 'fixed', top: 28, right: 28, zIndex: 9999,
      background: bg, color: 'white', borderRadius: 14, padding: '16px 24px',
      boxShadow: `0 8px 32px ${bg}55`, display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600,
      animation: 'svcSlideToast 0.4s cubic-bezier(0.34,1.56,0.64,1)'
    }}>
      <span style={{ fontSize: 20 }}>{type === 'success' ? '✅' : '❌'}</span>
      {msg}
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%',
        width: 22, height: 22, cursor: 'pointer', color: 'white',
        fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginLeft: 4, flexShrink: 0
      }}>✕</button>
    </div>
  );
}

function ConfirmDialog({ item, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '36px 32px',
        maxWidth: 420, width: '100%', textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        animation: 'svcPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, margin: '0 auto 20px'
        }}>🗑️</div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#0B1F3A', marginBottom: 10 }}>
          Are you sure?
        </h3>
        <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
          You are about to delete the service:
        </p>
        <p style={{
          fontWeight: 700, color: '#0B1F3A', fontSize: 15,
          background: '#F3F4F6', borderRadius: 8, padding: '8px 14px', marginBottom: 20
        }}>"{item?.title}"</p>
        <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 24 }}>
          This will permanently delete the image and all data. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 12, borderRadius: 10,
            border: '1px solid rgba(11,31,58,0.15)', background: 'white',
            color: '#374151', fontFamily: 'Outfit, sans-serif', fontSize: 14,
            fontWeight: 600, cursor: 'pointer'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: 12, borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#EF4444,#DC2626)',
            color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(239,68,68,0.35)'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}

function ImagePicker({ onChange, existingUrl, label = 'Add Image' }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(existingUrl || null);
  useEffect(() => { setPreview(existingUrl || null); }, [existingUrl]);
  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    onChange(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div onClick={() => inputRef.current.click()} style={{
        border: '2px dashed rgba(20,184,166,0.4)', borderRadius: 12, height: 160,
        cursor: 'pointer', background: preview ? 'transparent' : 'rgba(20,184,166,0.03)',
        overflow: 'hidden', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s'
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#14B8A6'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(20,184,166,0.4)'}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <span style={{ fontSize: 28 }}>📷</span>
              <span style={{ color: 'white', fontSize: 13, fontWeight: 600, marginTop: 6 }}>Click to change</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
            <div style={{ color: '#14B8A6', fontWeight: 600, fontSize: 14 }}>Click to upload image</div>
            <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>JPG, PNG, WEBP · Max 5 MB</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: 'rgba(11,31,58,0.55)', letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: 8
};
const inputStyle = {
  width: '100%', padding: '12px 14px',
  border: '1px solid rgba(11,31,58,0.12)', borderRadius: 10,
  fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#374151',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  background: 'white', boxSizing: 'border-box'
};

function InputField({ label, value, onChange, placeholder, multiline, minHeight = '80px' }) {
  const [focused, setFocused] = useState(false);
  const style = {
    ...inputStyle,
    borderColor: focused ? '#14B8A6' : 'rgba(11,31,58,0.12)',
    boxShadow: focused ? '0 0 0 3px rgba(20,184,166,0.1)' : 'none',
    ...(multiline ? { minHeight, resize: 'vertical' } : {})
  };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={onChange} placeholder={placeholder}
            style={style} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        : <input type="text" value={value} onChange={onChange} placeholder={placeholder}
            style={style} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SERVICES TAB — (unchanged logic, same as before)
// ══════════════════════════════════════════════════════════════

function ServiceForm({ editService, onSuccess, onCancel }) {
  const isEdit = !!editService;
  const [image, setImage]         = useState(null);
  const [title, setTitle]         = useState(editService?.title      || '');
  const [shortDesc, setShortDesc] = useState(editService?.short_desc || '');
  const [fullDesc, setFullDesc]   = useState(editService?.full_desc  || '');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!isEdit && !image) { setError('Please select an image.'); return; }
    if (!title.trim())     { setError('Title is required.'); return; }
    if (!shortDesc.trim()) { setError('Short description is required.'); return; }
    const fd = new FormData();
    if (image) fd.append('image', image);
    fd.append('title', title.trim());
    fd.append('short_desc', shortDesc.trim());
    fd.append('full_desc', fullDesc.trim());
    setLoading(true);
    try {
      const res = isEdit
        ? await api.put(`/api/admin/services/${editService.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await api.post('/api/admin/services', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess(res.data.service, isEdit ? 'updated' : 'uploaded');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: '#F8FAFC', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 16, padding: 28, animation: 'svcFadeDown 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: '#0B1F3A', margin: 0 }}>
          {isEdit ? '✏️ Edit Service' : '📤 Upload New Service'}
        </h4>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
      </div>
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#EF4444', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>⚠️ {error}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ImagePicker onChange={setImage} existingUrl={isEdit ? editService.image_url : null} label={isEdit ? 'Replace Image (optional)' : 'Add Image *'} />
        <InputField label="Title *" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Solar Power Plants" />
        <InputField label="Short Description *" value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="Brief summary shown on the service card" multiline minHeight="80px" />
        <InputField label="Full Detail" value={fullDesc} onChange={e => setFullDesc(e.target.value)} placeholder="Complete description shown when expanded..." multiline minHeight="140px" />
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '11px 24px', borderRadius: 10, border: '1px solid rgba(11,31,58,0.15)', background: 'white', color: '#374151', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSubmit} disabled={loading} style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: loading ? 'rgba(20,184,166,0.5)' : 'linear-gradient(135deg,#14B8A6,#0E9488)', color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 14px rgba(20,184,166,0.3)', transition: 'all 0.2s' }}>
          {loading && <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'svcSpin 0.8s linear infinite' }} />}
          {loading ? (isEdit ? 'Updating…' : 'Uploading…') : (isEdit ? 'Update Service' : 'Upload Service')}
        </button>
      </div>
    </div>
  );
}

function ServiceCard({ service, deleteMode, onEdit, onDelete }) {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 18px rgba(11,31,58,0.1)', border: '1px solid rgba(11,31,58,0.07)', background: 'white', transition: 'transform 0.25s, box-shadow 0.25s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(11,31,58,0.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(11,31,58,0.1)'; }}
    >
      <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
        <img src={service.image_url} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://placehold.co/400x200/0B1F3A/14B8A6?text=No+Image'; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,31,58,0.7) 0%, transparent 60%)' }} />
        <button onClick={() => deleteMode ? onDelete(service) : onEdit(service)} title={deleteMode ? 'Delete' : 'Edit'} style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: deleteMode ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.background = deleteMode ? '#EF4444' : 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = deleteMode ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.9)'; }}
        >{deleteMode ? '🗑️' : '✏️'}</button>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 14, color: '#0B1F3A', marginBottom: 4, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.title}</div>
        {service.short_desc && <div style={{ color: '#6B7280', fontSize: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{service.short_desc}</div>}
        {service.full_desc && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#14B8A6', fontWeight: 600, background: 'rgba(20,184,166,0.08)', borderRadius: 100, padding: '2px 8px', marginTop: 4 }}><span>📄</span> Has detail</div>}
      </div>
    </div>
  );
}

function ServicesTab() {
  const [services, setServices]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState('');
  const [showForm, setShowForm]           = useState(false);
  const [editService, setEditService]     = useState(null);
  const [deleteMode, setDeleteMode]       = useState(false);
  const [confirmService, setConfirmService] = useState(null);
  const [toast, setToast]                 = useState(null);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    setLoading(true); setFetchError('');
    try { const { data } = await api.get('/api/admin/services'); setServices(data.services || []); }
    catch (err) { setFetchError(err.response?.data?.message || 'Failed to load services.'); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleFormSuccess = (service, action) => {
    if (action === 'uploaded') { setServices(prev => [...prev, service]); showToast('Service uploaded! 🎉'); }
    else { setServices(prev => prev.map(s => s.id === service.id ? service : s)); showToast('Service updated! ✨'); }
    setShowForm(false); setEditService(null);
  };

  const handleDeleteConfirm = async () => {
    const svc = confirmService; setConfirmService(null);
    try { await api.delete(`/api/admin/services/${svc.id}`); setServices(prev => prev.filter(s => s.id !== svc.id)); showToast('Service deleted.'); }
    catch (err) { showToast(err.response?.data?.message || 'Delete failed.', 'error'); }
  };

  const toggleDeleteMode = () => { setDeleteMode(d => !d); setShowForm(false); setEditService(null); };

  return (
    <>
      {/* Action buttons row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button onClick={() => { setShowForm(s => !s); setEditService(null); setDeleteMode(false); }} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: showForm ? 'rgba(20,184,166,0.12)' : 'linear-gradient(135deg,#14B8A6,#0E9488)', color: showForm ? '#14B8A6' : 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: showForm ? 'none' : '0 4px 14px rgba(20,184,166,0.3)', border: showForm ? '1px solid rgba(20,184,166,0.3)' : 'none', transition: 'all 0.2s' }}>
          <span>{showForm ? '✕' : '+'}</span>{showForm ? 'Cancel' : 'Post'}
        </button>
        <button onClick={toggleDeleteMode} style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${deleteMode ? '#EF4444' : 'rgba(11,31,58,0.15)'}`, background: deleteMode ? 'rgba(239,68,68,0.08)' : 'white', color: deleteMode ? '#EF4444' : '#374151', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s' }}>
          <span>🗑️</span>{deleteMode ? 'Done' : 'Delete'}
        </button>
      </div>

      {deleteMode && (
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, animation: 'svcFadeDown 0.25s ease' }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span style={{ color: '#EF4444', fontSize: 13, fontWeight: 500 }}>Delete mode active — click 🗑️ on any card. Press <b>Done</b> to exit.</span>
        </div>
      )}

      {showForm && !editService && <div style={{ marginBottom: 28 }}><ServiceForm onSuccess={handleFormSuccess} onCancel={() => { setShowForm(false); setEditService(null); }} /></div>}
      {editService && <div style={{ marginBottom: 28 }}><ServiceForm editService={editService} onSuccess={handleFormSuccess} onCancel={() => { setShowForm(false); setEditService(null); }} /></div>}

      {loading && (
        <div style={{ textAlign: 'center', padding: 52, color: '#9CA3AF' }}>
          <div style={{ width: 40, height: 40, margin: '0 auto 14px', border: '3px solid rgba(20,184,166,0.2)', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'svcSpin 0.8s linear infinite' }} />
          Loading services…
        </div>
      )}
      {fetchError && !loading && (
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 20, textAlign: 'center', color: '#EF4444' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔌</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Could not load services</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>{fetchError}</div>
          <button onClick={fetchServices} style={{ marginTop: 14, padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13 }}>Retry</button>
        </div>
      )}
      {!loading && !fetchError && services.length === 0 && (
        <div style={{ textAlign: 'center', padding: 52, color: '#9CA3AF' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>⚡</div>
          <div style={{ fontWeight: 600, color: '#374151', marginBottom: 6 }}>No services yet</div>
          <div style={{ fontSize: 14 }}>Click the <b>Post</b> button above to add your first service.</div>
        </div>
      )}
      {!loading && !fetchError && services.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
          {services.map(service => (
            <ServiceCard key={service.id} service={service} deleteMode={deleteMode} onEdit={s => { setShowForm(false); setEditService(s); }} onDelete={s => setConfirmService(s)} />
          ))}
        </div>
      )}

      {confirmService && <ConfirmDialog item={confirmService} onConfirm={handleDeleteConfirm} onCancel={() => setConfirmService(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  DELIVERABLES TAB — single-entry bullet-point editor
// ══════════════════════════════════════════════════════════════

function BulletEditor({ initialValue = '', onSave, onCancel, isEdit }) {
  // Store lines as array — each line is one bullet point
  const [lines, setLines] = useState(() => {
    if (!initialValue) return [''];
    return initialValue
      .split('\n')
      .map(l => l.replace(/^[•\-]\s*/, '').trimEnd());
  });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const endRef                = useRef(null);

  const updateLine = (idx, val) => {
    setLines(prev => { const n = [...prev]; n[idx] = val; return n; });
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Insert new bullet after current line
      setLines(prev => {
        const n = [...prev];
        n.splice(idx + 1, 0, '');
        return n;
      });
      // Focus next input after render
      setTimeout(() => {
        const inputs = document.querySelectorAll('.dlv-bullet-input');
        if (inputs[idx + 1]) inputs[idx + 1].focus();
      }, 20);
    }
    if (e.key === 'Backspace' && lines[idx] === '' && lines.length > 1) {
      e.preventDefault();
      setLines(prev => { const n = [...prev]; n.splice(idx, 1); return n; });
      setTimeout(() => {
        const inputs = document.querySelectorAll('.dlv-bullet-input');
        const target = inputs[Math.max(0, idx - 1)];
        if (target) { target.focus(); target.setSelectionRange(target.value.length, target.value.length); }
      }, 20);
    }
  };

  const addBullet = () => {
    setLines(prev => [...prev, '']);
    setTimeout(() => {
      const inputs = document.querySelectorAll('.dlv-bullet-input');
      if (inputs.length) inputs[inputs.length - 1].focus();
    }, 20);
  };

  const removeLine = (idx) => {
    if (lines.length === 1) { setLines(['']); return; }
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setError('');
    const nonEmpty = lines.filter(l => l.trim());
    if (nonEmpty.length === 0) { setError('Please add at least one bullet point.'); return; }
    // Serialise as "• line\n• line…"
    const content = nonEmpty.map(l => `• ${l.trim()}`).join('\n');
    setSaving(true);
    try { await onSave(content); }
    catch (err) { setError(err.response?.data?.message || 'Failed to save. Try again.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: '#F8FAFC', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, padding: 28, animation: 'svcFadeDown 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            {isEdit ? '✏️' : '📝'}
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#0B1F3A' }}>
              {isEdit ? 'Edit Deliverables' : 'Write Deliverables'}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
              Each line becomes a bullet point · <kbd style={{ background: '#E5E7EB', borderRadius: 3, padding: '1px 4px', fontSize: 10, fontFamily: 'monospace', color: '#374151' }}>Enter</kbd> adds a new bullet · <kbd style={{ background: '#E5E7EB', borderRadius: 3, padding: '1px 4px', fontSize: 10, fontFamily: 'monospace', color: '#374151' }}>Backspace</kbd> on empty line removes it
            </div>
          </div>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#EF4444', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Bullet list editor */}
      <div style={{ background: 'white', border: '1.5px solid rgba(20,184,166,0.3)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {lines.map((line, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Bullet dot */}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6', flexShrink: 0, marginTop: 1 }} />
            {/* Input */}
            <input
              className="dlv-bullet-input"
              type="text"
              value={line}
              onChange={e => updateLine(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(e, idx)}
              placeholder={idx === 0 ? 'Type your first deliverable…' : 'Type next point…'}
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontFamily: 'Outfit, sans-serif', fontSize: 14,
                color: '#374151', background: 'transparent',
                lineHeight: 1.6
              }}
            />
            {/* Remove button */}
            {lines.length > 1 && (
              <button onClick={() => removeLine(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', fontSize: 16, padding: '2px 4px', lineHeight: 1, transition: 'color 0.2s', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#D1D5DB'}
              >✕</button>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Add bullet button */}
      <button onClick={addBullet} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1.5px dashed rgba(20,184,166,0.35)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: '#14B8A6', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.05)'; e.currentTarget.style.borderColor = '#14B8A6'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(20,184,166,0.35)'; }}
      >
        <span style={{ fontSize: 16 }}>+</span> Add Bullet Point
      </button>

      {/* Preview */}
      {lines.some(l => l.trim()) && (
        <div style={{ marginTop: 18, background: 'rgba(11,31,58,0.03)', border: '1px solid rgba(11,31,58,0.08)', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Preview</div>
          {lines.filter(l => l.trim()).map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
              <span style={{ color: '#14B8A6', fontWeight: 700, fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>•</span>
              <span style={{ color: '#374151', fontSize: 14, lineHeight: 1.6 }}>{l.trim()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Save / Cancel */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} disabled={saving} style={{ padding: '11px 24px', borderRadius: 10, border: '1px solid rgba(11,31,58,0.15)', background: 'white', color: '#374151', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>Cancel</button>
        <button onClick={handleSave} disabled={saving || !lines.some(l => l.trim())} style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: (saving || !lines.some(l => l.trim())) ? 'rgba(20,184,166,0.4)' : 'linear-gradient(135deg,#14B8A6,#0E9488)', color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: (saving || !lines.some(l => l.trim())) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: (saving || !lines.some(l => l.trim())) ? 'none' : '0 4px 14px rgba(20,184,166,0.3)', transition: 'all 0.2s' }}>
          {saving && <span style={{ width: 15, height: 15, display: 'inline-block', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'svcSpin 0.8s linear infinite' }} />}
          {saving ? (isEdit ? 'Updating…' : 'Saving…') : (isEdit ? '✓ Update' : '✓ Save')}
        </button>
      </div>
    </div>
  );
}

function DeliverablesContentCard({ data, onEdit }) {
  const lines = data.content.split('\n').filter(l => l.trim()).map(l => l.replace(/^[•]\s*/, '').trim());
  const fmt = dt => new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid rgba(11,31,58,0.08)', boxShadow: '0 4px 20px rgba(11,31,58,0.06)', overflow: 'hidden', animation: 'svcFadeDown 0.35s ease' }}>
      {/* Card header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'linear-gradient(135deg,rgba(20,184,166,0.06),rgba(11,31,58,0.03))', borderBottom: '1px solid rgba(11,31,58,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6', boxShadow: '0 0 6px rgba(20,184,166,0.5)' }} />
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: '#0B1F3A' }}>Deliverables — Content</span>
          <span style={{ fontSize: 12, background: 'rgba(20,184,166,0.1)', color: '#14B8A6', borderRadius: 100, padding: '2px 10px', fontWeight: 600 }}>{lines.length} point{lines.length !== 1 ? 's' : ''}</span>
        </div>
        <button onClick={onEdit} title="Edit content" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', color: '#14B8A6', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
      </div>

      {/* Bullet list */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6', marginTop: 7, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, color: '#374151', lineHeight: 1.7 }}>{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer timestamps */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(11,31,58,0.05)', background: '#FAFAFA', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[{ label: 'Created', value: fmt(data.created_at) }, { label: 'Last updated', value: fmt(data.updated_at) }].map(item => (
          <div key={item.label} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.label}:</span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliverablesTab() {
  const [mode, setMode]     = useState('loading');   // loading | empty | view | writing | editing
  const [data, setData]     = useState(null);
  const [toast, setToast]   = useState(null);
  const [fetchErr, setFetchErr] = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => {
    api.get('/api/admin/deliverables')
      .then(({ data: res }) => {
        if (res.success && res.data) { setData(res.data); setMode('view'); }
        else setMode('empty');
      })
      .catch(() => { setFetchErr('Could not load content. Is the backend running?'); setMode('empty'); });
  }, []);

  const handleCreate = async (content) => {
    const { data: res } = await api.post('/api/admin/deliverables', { content });
    setData(res.data); setMode('view'); showToast('Deliverables saved! 🎉');
  };

  const handleUpdate = async (content) => {
    const { data: res } = await api.put('/api/admin/deliverables', { content });
    setData(res.data); setMode('view'); showToast('Deliverables updated! ✨');
  };

  return (
    <>
      {fetchErr && (
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
          🔌 {fetchErr}
        </div>
      )}

      {/* LOADING */}
      {mode === 'loading' && (
        <div style={{ textAlign: 'center', padding: '52px 0' }}>
          <div style={{ width: 36, height: 36, margin: '0 auto 14px', border: '3px solid rgba(20,184,166,0.2)', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'svcSpin 0.8s linear infinite' }} />
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</p>
        </div>
      )}

      {/* EMPTY */}
      {mode === 'empty' && (
        <div style={{ background: 'white', borderRadius: 16, border: '2px dashed rgba(20,184,166,0.25)', padding: '64px 40px', textAlign: 'center', animation: 'svcFadeDown 0.3s ease' }}>
          <button onClick={() => setMode('writing')} style={{ background: 'rgba(20,184,166,0.07)', border: '2px solid rgba(20,184,166,0.2)', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', cursor: 'pointer', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.14)'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,184,166,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.07)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#0B1F3A', marginBottom: 10 }}>No deliverables written yet</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 28px' }}>
            Click the write icon above to add your deliverables as bullet points. Only one entry is allowed — you can edit it anytime.
          </p>
          <button onClick={() => setMode('writing')} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#14B8A6,#0E9488)', color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(20,184,166,0.3)', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Write Deliverables
          </button>
        </div>
      )}

      {/* WRITING */}
      {mode === 'writing' && <BulletEditor isEdit={false} onSave={handleCreate} onCancel={() => setMode('empty')} />}

      {/* VIEW */}
      {mode === 'view' && data && <DeliverablesContentCard data={data} onEdit={() => setMode('editing')} />}

      {/* EDITING */}
      {mode === 'editing' && data && <BulletEditor isEdit={true} initialValue={data.content} onSave={handleUpdate} onCancel={() => setMode('view')} />}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN — ServicesSection with tab navigation
// ══════════════════════════════════════════════════════════════
export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState('services');  // 'services' | 'deliverables'

  const TABS = [
    { id: 'services',      label: 'Services',      icon: '⚡' },
    { id: 'deliverables',  label: 'Deliverables',  icon: '📋' },
  ];

  return (
    <div style={{ marginTop: 24, background: 'white', borderRadius: 20, border: '1px solid rgba(11,31,58,0.08)', boxShadow: '0 4px 24px rgba(11,31,58,0.06)', overflow: 'hidden', animation: 'svcFadeDown 0.35s ease' }}>

      {/* ── Header with embedded tab nav ── */}
      <div style={{ padding: '0 28px', background: 'linear-gradient(135deg, #0B1F3A 0%, #0d2a4a 100%)', borderBottom: '1px solid rgba(11,31,58,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 0 }}>
          {/* Left: icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
            <div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'white', margin: 0 }}>Services Manager</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>Manage services & deliverables</p>
            </div>
          </div>
        </div>

        {/* Tab nav bar — sits at bottom of header */}
        <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 20px',
                background: isActive ? 'rgba(20,184,166,0.18)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #14B8A6' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                color: isActive ? '#14B8A6' : 'rgba(255,255,255,0.5)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s',
                letterSpacing: '0.02em'
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >
                <span style={{ fontSize: 15 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab body ── */}
      <div style={{ padding: 28 }}>
        {activeTab === 'services'     && <ServicesTab />}
        {activeTab === 'deliverables' && <DeliverablesTab />}
      </div>

      <style>{`
        @keyframes svcFadeDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes svcSlideToast {
          from { opacity:0; transform:translateX(30px) scale(0.95); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
        @keyframes svcPopIn {
          from { opacity:0; transform:scale(0.88); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes svcSpin { to { transform:rotate(360deg); } }
        .dlv-bullet-input:focus { outline: none; }
      `}</style>
    </div>
  );
}
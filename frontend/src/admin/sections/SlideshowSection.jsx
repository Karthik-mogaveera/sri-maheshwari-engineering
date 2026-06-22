/**
 * SlideshowSection.jsx
 * Full CRUD UI for hero_slides:
 *  - Post button → upload form → save → success popup
 *  - Edit icon on each card → pre-filled edit form → update
 *  - Delete toggle button → delete icon on cards → confirm popup → delete
 */
import { useState, useEffect, useRef } from 'react';
import api from '../api';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Reusable toast / confirm popup ────────────────────────────
function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  const bg = type === 'success' ? '#14B8A6' : '#EF4444';
  return (
    <div style={{
      position: 'fixed', top: '28px', right: '28px', zIndex: 9999,
      background: bg, color: 'white',
      borderRadius: '14px', padding: '16px 24px',
      boxShadow: `0 8px 32px ${bg}55`,
      display: 'flex', alignItems: 'center', gap: '12px',
      fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 600,
      animation: 'slideToast 0.4s cubic-bezier(0.34,1.56,0.64,1)'
    }}>
      <span style={{ fontSize: '20px' }}>{type === 'success' ? '✅' : '❌'}</span>
      {msg}
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%',
        width: '22px', height: '22px', cursor: 'pointer', color: 'white',
        fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginLeft: '4px', flexShrink: 0
      }}>✕</button>
    </div>
  );
}

function ConfirmDialog({ slide, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '36px 32px',
        maxWidth: '420px', width: '100%', textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', margin: '0 auto 20px'
        }}>🗑️</div>
        <h3 style={{
          fontFamily: 'Playfair Display, serif', fontSize: '20px',
          color: '#0B1F3A', marginBottom: '10px'
        }}>Are you sure?</h3>
        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
          You are about to delete the slide:
        </p>
        <p style={{
          fontWeight: 700, color: '#0B1F3A', fontSize: '15px',
          background: '#F3F4F6', borderRadius: '8px', padding: '8px 14px',
          marginBottom: '28px'
        }}>"{slide?.title}"</p>
        <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '24px' }}>
          This will permanently delete the image and data. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px', borderRadius: '10px',
            border: '1px solid rgba(11,31,58,0.15)', background: 'white',
            color: '#374151', fontFamily: 'Outfit, sans-serif', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '12px', borderRadius: '10px',
            border: 'none', background: 'linear-gradient(135deg,#EF4444,#DC2626)',
            color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
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

// ── Image Preview picker ───────────────────────────────────────
function ImagePicker({ value, onChange, existingUrl, label = 'Add Image' }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(existingUrl || null);

  useEffect(() => { setPreview(existingUrl || null); }, [existingUrl]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div
        onClick={() => inputRef.current.click()}
        style={{
          border: '2px dashed rgba(20,184,166,0.4)',
          borderRadius: '12px', height: '160px', cursor: 'pointer',
          background: preview ? 'transparent' : 'rgba(20,184,166,0.03)',
          overflow: 'hidden', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.2s',
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
              <span style={{ fontSize: '28px' }}>📷</span>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: 600, marginTop: '6px' }}>Click to change</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ color: '#14B8A6', fontWeight: 600, fontSize: '14px' }}>Click to upload image</div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>JPG, PNG, WEBP · Max 5 MB</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

// ── Shared input style helpers ────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: 700,
  color: 'rgba(11,31,58,0.55)', letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: '8px'
};
const inputStyle = {
  width: '100%', padding: '12px 14px',
  border: '1px solid rgba(11,31,58,0.12)', borderRadius: '10px',
  fontFamily: 'Outfit, sans-serif', fontSize: '14px', color: '#374151',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  background: 'white', boxSizing: 'border-box'
};

function InputField({ label, value, onChange, placeholder, type = 'text', multiline }) {
  const [focused, setFocused] = useState(false);
  const style = {
    ...inputStyle,
    borderColor: focused ? '#14B8A6' : 'rgba(11,31,58,0.12)',
    boxShadow: focused ? '0 0 0 3px rgba(20,184,166,0.1)' : 'none',
    ...(multiline ? { minHeight: '80px', resize: 'vertical' } : {})
  };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={onChange} placeholder={placeholder}
            style={style} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder}
            style={style} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      }
    </div>
  );
}

// ── Upload / Edit Form ────────────────────────────────────────
function SlideForm({ editSlide, onSuccess, onCancel }) {
  const isEdit = !!editSlide;
  const [image,   setImage]   = useState(null);
  const [title,   setTitle]   = useState(editSlide?.title   || '');
  const [subject, setSubject] = useState(editSlide?.subject || '');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!isEdit && !image) { setError('Please select an image.'); return; }
    if (!title.trim())     { setError('Title is required.'); return; }

    const fd = new FormData();
    if (image) fd.append('image', image);
    fd.append('title', title.trim());
    fd.append('subject', subject.trim());

    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await api.put(`/api/admin/slideshow/${editSlide.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/api/admin/slideshow', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onSuccess(res.data.slide, isEdit ? 'updated' : 'uploaded');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#F8FAFC', border: '1px solid rgba(20,184,166,0.15)',
      borderRadius: '16px', padding: '28px',
      animation: 'fadeDown 0.3s ease'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px'
      }}>
        <h4 style={{
          fontFamily: 'Playfair Display, serif', fontSize: '17px',
          color: '#0B1F3A', margin: 0
        }}>
          {isEdit ? '✏️ Edit Slide' : '📤 Upload New Slide'}
        </h4>
        <button onClick={onCancel} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9CA3AF', fontSize: '20px', lineHeight: 1, padding: '4px'
        }}>✕</button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
          color: '#EF4444', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center'
        }}>⚠️ {error}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <ImagePicker
          onChange={setImage}
          existingUrl={isEdit ? editSlide.image_url : null}
          label={isEdit ? 'Replace Image (optional)' : 'Add Image *'}
        />
        <InputField
          label="Title *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Powering Progress Through Engineering Excellence"
        />
        <InputField
          label="Subject / Sub-text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="e.g. Up to 220 KV System Voltage"
          multiline
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{
          padding: '11px 24px', borderRadius: '10px',
          border: '1px solid rgba(11,31,58,0.15)', background: 'white',
          color: '#374151', fontFamily: 'Outfit, sans-serif', fontSize: '14px',
          fontWeight: 600, cursor: 'pointer'
        }}>Cancel</button>
        <button onClick={handleSubmit} disabled={loading} style={{
          padding: '11px 28px', borderRadius: '10px', border: 'none',
          background: loading ? 'rgba(20,184,166,0.5)' : 'linear-gradient(135deg,#14B8A6,#0E9488)',
          color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '14px',
          fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: loading ? 'none' : '0 4px 14px rgba(20,184,166,0.3)',
          transition: 'all 0.2s'
        }}>
          {loading && <span style={{
            width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
            borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
          }} />}
          {loading ? (isEdit ? 'Updating…' : 'Uploading…') : (isEdit ? 'Update Slide' : 'Upload Slide')}
        </button>
      </div>
    </div>
  );
}

// ── Individual slide card ─────────────────────────────────────
function SlideCard({ slide, deleteMode, onEdit, onDelete }) {
  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden',
      boxShadow: '0 4px 18px rgba(11,31,58,0.1)',
      border: '1px solid rgba(11,31,58,0.07)',
      background: 'white',
      transition: 'transform 0.25s, box-shadow 0.25s',
      position: 'relative'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 36px rgba(11,31,58,0.14)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 18px rgba(11,31,58,0.1)';
      }}
    >
      {/* Image */}
      <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={slide.image_url}
          alt={slide.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = 'https://placehold.co/400x200/0B1F3A/14B8A6?text=No+Image'; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(11,31,58,0.7) 0%, transparent 60%)'
        }} />

        {/* Action icon — top-right */}
        <button
          onClick={() => deleteMode ? onDelete(slide) : onEdit(slide)}
          title={deleteMode ? 'Delete this slide' : 'Edit this slide'}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '34px', height: '34px', borderRadius: '50%',
            background: deleteMode ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.2s',
            backdropFilter: 'blur(4px)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.background = deleteMode ? '#EF4444' : 'white';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = deleteMode ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.9)';
          }}
        >
          {deleteMode ? '🗑️' : '✏️'}
        </button>
      </div>

      {/* Text */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700, fontSize: '14px', color: '#0B1F3A',
          marginBottom: '4px', lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>{slide.title}</div>
        {slide.subject && (
          <div style={{
            color: '#6B7280', fontSize: '12px', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>{slide.subject}</div>
        )}
      </div>
    </div>
  );
}

// ── Main SlideshowSection ─────────────────────────────────────
export default function SlideshowSection() {
  const [slides,      setSlides]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState('');
  const [showForm,    setShowForm]    = useState(false);   // upload form open
  const [editSlide,   setEditSlide]   = useState(null);    // slide being edited
  const [deleteMode,  setDeleteMode]  = useState(false);   // delete toggle
  const [confirmSlide,setConfirmSlide]= useState(null);    // slide pending delete
  const [toast,       setToast]       = useState(null);    // { msg, type }

  // Fetch all slides
  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true); setFetchError('');
    try {
      const { data } = await api.get('/api/admin/slideshow');
      setSlides(data.slides || []);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load slides. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // Called after successful upload or edit
  const handleFormSuccess = (slide, action) => {
    if (action === 'uploaded') {
      setSlides(prev => [...prev, slide]);
      showToast('Slide uploaded successfully! 🎉');
    } else {
      setSlides(prev => prev.map(s => s.id === slide.id ? slide : s));
      showToast('Slide updated successfully! ✨');
    }
    setShowForm(false);
    setEditSlide(null);
  };

  // Delete confirmed
  const handleDeleteConfirm = async () => {
    const slide = confirmSlide;
    setConfirmSlide(null);
    try {
      await api.delete(`/api/admin/slideshow/${slide.id}`);
      setSlides(prev => prev.filter(s => s.id !== slide.id));
      showToast('Slide deleted successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const openEdit = (slide) => {
    setShowForm(false);
    setEditSlide(slide);
  };

  const cancelForm = () => { setShowForm(false); setEditSlide(null); };

  const toggleDeleteMode = () => {
    setDeleteMode(d => !d);
    setShowForm(false);
    setEditSlide(null);
  };

  return (
    <div style={{
      marginTop: '24px',
      background: 'white', borderRadius: '20px',
      border: '1px solid rgba(11,31,58,0.08)',
      boxShadow: '0 4px 24px rgba(11,31,58,0.06)',
      overflow: 'hidden',
      animation: 'fadeDown 0.35s ease'
    }}>

      {/* ── Section header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 28px',
        borderBottom: '1px solid rgba(11,31,58,0.07)',
        background: 'linear-gradient(135deg, #0B1F3A 0%, #0d2a4a 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(20,184,166,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
          }}>🖼️</div>
          <div>
            <h3 style={{
              fontFamily: 'Playfair Display, serif', fontSize: '18px',
              fontWeight: 700, color: 'white', margin: 0
            }}>Slideshow Manager</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: 0 }}>
              {slides.length} slide{slides.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        {/* Post + Delete buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setShowForm(s => !s); setEditSlide(null); setDeleteMode(false); }}
            style={{
              padding: '9px 20px', borderRadius: '10px', border: 'none',
              background: showForm
                ? 'rgba(255,255,255,0.15)'
                : 'linear-gradient(135deg,#14B8A6,#0E9488)',
              color: 'white', fontFamily: 'Outfit, sans-serif',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: showForm ? 'none' : '0 4px 14px rgba(20,184,166,0.4)',
              transition: 'all 0.2s'
            }}
          >
            <span>{showForm ? '✕' : '+'}</span>
            {showForm ? 'Cancel' : 'Post'}
          </button>

          <button
            onClick={toggleDeleteMode}
            style={{
              padding: '9px 20px', borderRadius: '10px',
              border: `1px solid ${deleteMode ? '#EF4444' : 'rgba(255,255,255,0.2)'}`,
              background: deleteMode ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)',
              color: deleteMode ? '#FCA5A5' : 'rgba(255,255,255,0.75)',
              fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px',
              transition: 'all 0.2s'
            }}
          >
            <span>🗑️</span>
            {deleteMode ? 'Done' : 'Delete'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '28px' }}>

        {/* Delete mode banner */}
        {deleteMode && (
          <div style={{
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px',
            animation: 'fadeDown 0.25s ease'
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span style={{ color: '#EF4444', fontSize: '13px', fontWeight: 500 }}>
              Delete mode active — click the 🗑️ icon on any slide card to delete it. Press <b>Done</b> to exit.
            </span>
          </div>
        )}

        {/* Upload form */}
        {showForm && !editSlide && (
          <div style={{ marginBottom: '28px' }}>
            <SlideForm onSuccess={handleFormSuccess} onCancel={cancelForm} />
          </div>
        )}

        {/* Edit form */}
        {editSlide && (
          <div style={{ marginBottom: '28px' }}>
            <SlideForm
              editSlide={editSlide}
              onSuccess={handleFormSuccess}
              onCancel={cancelForm}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '52px', color: '#9CA3AF' }}>
            <div style={{
              width: '40px', height: '40px', margin: '0 auto 14px',
              border: '3px solid rgba(20,184,166,0.2)', borderTopColor: '#14B8A6',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            Loading slides…
          </div>
        )}

        {/* Error */}
        {fetchError && !loading && (
          <div style={{
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#EF4444'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔌</div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Could not load slides</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>{fetchError}</div>
            <button onClick={fetchSlides} style={{
              marginTop: '14px', padding: '9px 20px', borderRadius: '8px',
              border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)',
              color: '#EF4444', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              fontWeight: 600, fontSize: '13px'
            }}>Retry</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && slides.length === 0 && (
          <div style={{ textAlign: 'center', padding: '52px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>🖼️</div>
            <div style={{ fontWeight: 600, color: '#374151', marginBottom: '6px' }}>No slides yet</div>
            <div style={{ fontSize: '14px' }}>Click the <b>Post</b> button above to upload your first slide.</div>
          </div>
        )}

        {/* Slide cards grid */}
        {!loading && !fetchError && slides.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '18px'
          }}>
            {slides.map(slide => (
              <SlideCard
                key={slide.id}
                slide={slide}
                deleteMode={deleteMode}
                onEdit={openEdit}
                onDelete={s => setConfirmSlide(s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {confirmSlide && (
        <ConfirmDialog
          slide={confirmSlide}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmSlide(null)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      <style>{`
        @keyframes fadeDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideToast {
          from { opacity:0; transform:translateX(30px) scale(0.95); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(0.88); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}

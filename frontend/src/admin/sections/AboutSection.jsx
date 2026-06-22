/**
 * AboutSection.jsx
 * ─────────────────────────────────────────────────────────────
 * 3-tab panel inside the About card:
 *   [👥 People]  [🏢 Company]  [📊 Performance]
 *
 * People tab   — full CRUD with image, name, designation, description
 *                100% consistent with SlideshowSection pattern
 * Company tab  — coming soon placeholder
 * Performance  — coming soon placeholder
 * ─────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useRef } from 'react';
import api from '../api';

// ══════════════════════════════════════════════════════════════
//  Shared primitives — identical to SlideshowSection
// ══════════════════════════════════════════════════════════════

function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? '#14B8A6' : '#EF4444';
  return (
    <div style={{
      position: 'fixed', top: '28px', right: '28px', zIndex: 9999,
      background: bg, color: 'white', borderRadius: '14px', padding: '16px 24px',
      boxShadow: `0 8px 32px ${bg}55`, display: 'flex', alignItems: 'center', gap: '12px',
      fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 600,
      animation: 'abtSlideToast 0.4s cubic-bezier(0.34,1.56,0.64,1)'
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

function ConfirmDialog({ item, onConfirm, onCancel }) {
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
        animation: 'abtPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', margin: '0 auto 20px'
        }}>🗑️</div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: '#0B1F3A', marginBottom: '10px' }}>
          Are you sure?
        </h3>
        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
          You are about to delete:
        </p>
        <p style={{
          fontWeight: 700, color: '#0B1F3A', fontSize: '15px',
          background: '#F3F4F6', borderRadius: '8px', padding: '8px 14px', marginBottom: '20px'
        }}>"{item?.name}"</p>
        <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '24px' }}>
          This will permanently delete the image and all data. This cannot be undone.
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
            flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg,#EF4444,#DC2626)',
            color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
            transition: 'all 0.2s'
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
        border: '2px dashed rgba(20,184,166,0.4)', borderRadius: '12px', height: '160px',
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
//  PEOPLE FORM  (image + name + designation + description)
// ══════════════════════════════════════════════════════════════
function PersonForm({ editPerson, onSuccess, onCancel }) {
  const isEdit = !!editPerson;
  const [image,       setImage]       = useState(null);
  const [name,        setName]        = useState(editPerson?.name        || '');
  const [designation, setDesignation] = useState(editPerson?.designation || '');
  const [description, setDescription] = useState(editPerson?.description || '');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!isEdit && !image)  { setError('Please select an image.'); return; }
    if (!name.trim())       { setError('Name is required.'); return; }
    if (!designation.trim()){ setError('Designation is required.'); return; }

    const fd = new FormData();
    if (image) fd.append('image', image);
    fd.append('name',        name.trim());
    fd.append('designation', designation.trim());
    fd.append('description', description.trim());

    setLoading(true);
    try {
      const res = isEdit
        ? await api.put(`/api/admin/about-people/${editPerson.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await api.post('/api/admin/about-people', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess(res.data.person, isEdit ? 'updated' : 'uploaded');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      background: '#F8FAFC', border: '1px solid rgba(20,184,166,0.15)',
      borderRadius: '16px', padding: '28px', animation: 'abtFadeDown 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', color: '#0B1F3A', margin: 0 }}>
          {isEdit ? '✏️ Edit Person' : '📤 Add New Person'}
        </h4>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '20px', lineHeight: 1, padding: '4px' }}>✕</button>
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
          existingUrl={isEdit ? editPerson.image_url : null}
          label={isEdit ? 'Replace Image (optional)' : 'Add Image *'}
        />
        <InputField label="Name *"        value={name}        onChange={e => setName(e.target.value)}        placeholder="e.g. C. Venkatachalaiah" />
        <InputField label="Designation *" value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Founder & Managing Director" />
        <InputField label="Description"   value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief bio or role description..." multiline minHeight="100px" />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{
          padding: '11px 24px', borderRadius: '10px',
          border: '1px solid rgba(11,31,58,0.15)', background: 'white',
          color: '#374151', fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
        }}>Cancel</button>
        <button onClick={handleSubmit} disabled={loading} style={{
          padding: '11px 28px', borderRadius: '10px', border: 'none',
          background: loading ? 'rgba(20,184,166,0.5)' : 'linear-gradient(135deg,#14B8A6,#0E9488)',
          color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: loading ? 'none' : '0 4px 14px rgba(20,184,166,0.3)', transition: 'all 0.2s'
        }}>
          {loading && <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'abtSpin 0.8s linear infinite' }} />}
          {loading ? (isEdit ? 'Updating…' : 'Uploading…') : (isEdit ? 'Update Person' : 'Upload Person')}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PERSON CARD — mirrors SlideCard exactly
// ══════════════════════════════════════════════════════════════
function PersonCard({ person, deleteMode, onEdit, onDelete }) {
  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden',
      boxShadow: '0 4px 18px rgba(11,31,58,0.1)',
      border: '1px solid rgba(11,31,58,0.07)',
      background: 'white', position: 'relative',
      transition: 'transform 0.25s, box-shadow 0.25s'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(11,31,58,0.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(11,31,58,0.1)'; }}
    >
      {/* Image */}
      <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={person.image_url} alt={person.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          onError={e => { e.target.src = `https://placehold.co/400x200/0B1F3A/14B8A6?text=${encodeURIComponent(person.name)}`; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,31,58,0.75) 0%, transparent 55%)' }} />

        {/* Edit / Delete icon — identical logic to SlideCard */}
        <button
          onClick={() => deleteMode ? onDelete(person) : onEdit(person)}
          title={deleteMode ? 'Delete' : 'Edit'}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '34px', height: '34px', borderRadius: '50%',
            background: deleteMode ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.2s', backdropFilter: 'blur(4px)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.background = deleteMode ? '#EF4444' : 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = deleteMode ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.9)'; }}
        >{deleteMode ? '🗑️' : '✏️'}</button>

        {/* Name + designation overlay at bottom of image */}
        <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '15px', color: 'white', lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {person.name}
          </div>
          {person.designation && (
            <div style={{ fontSize: '11px', color: '#14B8A6', fontWeight: 600, letterSpacing: '0.05em', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {person.designation}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {person.description && (
        <div style={{ padding: '12px 14px' }}>
          <p style={{
            color: '#6B7280', fontSize: '12px', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0
          }}>{person.description}</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PEOPLE TAB — main CRUD logic, mirrors SlideshowSection shell
// ══════════════════════════════════════════════════════════════
function PeopleTab() {
  const [people,        setPeople]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState('');
  const [showForm,      setShowForm]      = useState(false);
  const [editPerson,    setEditPerson]    = useState(null);
  const [deleteMode,    setDeleteMode]    = useState(false);
  const [confirmPerson, setConfirmPerson] = useState(null);
  const [toast,         setToast]         = useState(null);

  useEffect(() => { fetchPeople(); }, []);

  const fetchPeople = async () => {
    setLoading(true); setFetchError('');
    try {
      const { data } = await api.get('/api/admin/about-people');
      setPeople(data.people || []);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load. Is the backend running?');
    } finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleFormSuccess = (person, action) => {
    if (action === 'uploaded') { setPeople(prev => [...prev, person]); showToast('Person added successfully! 🎉'); }
    else { setPeople(prev => prev.map(p => p.id === person.id ? person : p)); showToast('Person updated successfully! ✨'); }
    setShowForm(false); setEditPerson(null);
  };

  const handleDeleteConfirm = async () => {
    const p = confirmPerson; setConfirmPerson(null);
    try {
      await api.delete(`/api/admin/about-people/${p.id}`);
      setPeople(prev => prev.filter(x => x.id !== p.id));
      showToast('Person deleted successfully.');
    } catch (err) { showToast(err.response?.data?.message || 'Delete failed.', 'error'); }
  };

  const toggleDeleteMode = () => { setDeleteMode(d => !d); setShowForm(false); setEditPerson(null); };

  return (
    <>
      {/* ── Action buttons — Post + Delete, identical to SlideshowSection ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => { setShowForm(s => !s); setEditPerson(null); setDeleteMode(false); }}
          style={{
            padding: '9px 20px', borderRadius: '10px', border: 'none',
            background: showForm ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg,#14B8A6,#0E9488)',
            color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px',
            boxShadow: showForm ? 'none' : '0 4px 14px rgba(20,184,166,0.4)', transition: 'all 0.2s'
          }}
        >
          <span>{showForm ? '✕' : '+'}</span>{showForm ? 'Cancel' : 'Post'}
        </button>
        <button
          onClick={toggleDeleteMode}
          style={{
            padding: '9px 20px', borderRadius: '10px',
            border: `1px solid ${deleteMode ? '#EF4444' : 'rgba(11,31,58,0.15)'}`,
            background: deleteMode ? 'rgba(239,68,68,0.08)' : 'white',
            color: deleteMode ? '#EF4444' : '#374151',
            fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.2s'
          }}
        >
          <span>🗑️</span>{deleteMode ? 'Done' : 'Delete'}
        </button>
      </div>

      {/* Delete mode banner */}
      {deleteMode && (
        <div style={{
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px', animation: 'abtFadeDown 0.25s ease'
        }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{ color: '#EF4444', fontSize: '13px', fontWeight: 500 }}>
            Delete mode active — click 🗑️ on any card. Press <b>Done</b> to exit.
          </span>
        </div>
      )}

      {/* Upload form */}
      {showForm && !editPerson && (
        <div style={{ marginBottom: '28px' }}>
          <PersonForm onSuccess={handleFormSuccess} onCancel={() => { setShowForm(false); setEditPerson(null); }} />
        </div>
      )}

      {/* Edit form */}
      {editPerson && (
        <div style={{ marginBottom: '28px' }}>
          <PersonForm editPerson={editPerson} onSuccess={handleFormSuccess} onCancel={() => { setShowForm(false); setEditPerson(null); }} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '52px', color: '#9CA3AF' }}>
          <div style={{ width: '40px', height: '40px', margin: '0 auto 14px', border: '3px solid rgba(20,184,166,0.2)', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'abtSpin 0.8s linear infinite' }} />
          Loading people…
        </div>
      )}

      {/* Error */}
      {fetchError && !loading && (
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#EF4444' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔌</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Could not load people</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>{fetchError}</div>
          <button onClick={fetchPeople} style={{ marginTop: '14px', padding: '9px 20px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '13px' }}>Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !fetchError && people.length === 0 && (
        <div style={{ textAlign: 'center', padding: '52px', color: '#9CA3AF' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>👥</div>
          <div style={{ fontWeight: 600, color: '#374151', marginBottom: '6px' }}>No people added yet</div>
          <div style={{ fontSize: '14px' }}>Click <b>Post</b> above to add your first team member.</div>
        </div>
      )}

      {/* Cards grid — identical to SlideshowSection */}
      {!loading && !fetchError && people.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '18px' }}>
          {people.map(person => (
            <PersonCard
              key={person.id} person={person} deleteMode={deleteMode}
              onEdit={p => { setShowForm(false); setEditPerson(p); }}
              onDelete={p => setConfirmPerson(p)}
            />
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmPerson && <ConfirmDialog item={confirmPerson} onConfirm={handleDeleteConfirm} onCancel={() => setConfirmPerson(null)} />}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  COMPANY TAB — single-entry write/edit, mirrors WhoWeAreSection
// ══════════════════════════════════════════════════════════════

// ── Spinner (same as WhoWeAreSection) ─────────────────────────
function CompanySpinner() {
  return (
    <div style={{
      width: 36, height: 36, margin: '0 auto',
      border: '3px solid rgba(20,184,166,0.2)',
      borderTopColor: '#14B8A6', borderRadius: '50%',
      animation: 'acSpin 0.8s linear infinite'
    }} />
  );
}

// ── Write / Edit textarea form (identical to WhoWeAreSection) ─
function CompanyContentForm({ initialValue = '', onSave, onCancel, isEdit }) {
  const [text,   setText]   = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const textareaRef         = useRef(null);

  // Auto-focus + cursor to end
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
    if (!text.trim()) { setError('Content cannot be empty.'); return; }
    setSaving(true);
    try {
      await onSave(text.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally { setSaving(false); }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div style={{
      background: '#F8FAFC', border: '1px solid rgba(20,184,166,0.2)',
      borderRadius: 16, padding: 28, animation: 'acFadeDown 0.3s ease'
    }}>
      {/* Form header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
          }}>
            {isEdit ? '✏️' : '📝'}
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: '#0B1F3A' }}>
              {isEdit ? 'Edit Content' : 'Write Content'}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
              Tip: Press{' '}
              <kbd style={{ background: '#E5E7EB', borderRadius: 4, padding: '1px 5px', fontSize: 11, fontFamily: 'monospace', color: '#374151' }}>
                Ctrl + Enter
              </kbd>{' '}
              to save
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
          color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
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
          placeholder="Write the company information here — history, vision, mission, certifications, key achievements..."
          style={{
            width: '100%', minHeight: 320, padding: '16px 18px',
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
        {/* char/word count */}
        <div style={{
          position: 'absolute', bottom: 12, right: 14,
          fontSize: 11, color: '#9CA3AF',
          background: 'rgba(255,255,255,0.85)',
          padding: '2px 8px', borderRadius: 100, pointerEvents: 'none'
        }}>
          {charCount} chars · {wordCount} words
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18 }}>
        <button onClick={onCancel} disabled={saving} style={{
          padding: '11px 24px', borderRadius: 10,
          border: '1px solid rgba(11,31,58,0.15)',
          background: 'white', color: '#374151',
          fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', opacity: saving ? 0.5 : 1
        }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#F9FAFB'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
        >Cancel</button>

        <button onClick={handleSave} disabled={saving || !text.trim()} style={{
          padding: '11px 28px', borderRadius: 10, border: 'none',
          background: (saving || !text.trim())
            ? 'rgba(20,184,166,0.4)'
            : 'linear-gradient(135deg,#14B8A6,#0E9488)',
          color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
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
              animation: 'acSpin 0.8s linear infinite'
            }} />
          )}
          {saving ? (isEdit ? 'Updating…' : 'Saving…') : (isEdit ? '✓ Update' : '✓ Save')}
        </button>
      </div>
    </div>
  );
}

// ── Saved content display card (identical to WhoWeAreSection) ─
function CompanyContentCard({ data, onEdit }) {
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
      overflow: 'hidden', animation: 'acFadeDown 0.35s ease'
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
            background: '#14B8A6', boxShadow: '0 0 6px rgba(20,184,166,0.5)'
          }} />
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: '#0B1F3A' }}>
            Company — Content
          </span>
        </div>

        {/* Edit icon button — identical to WhoWeAreSection */}
        <button onClick={onEdit} title="Edit content" style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 16px', borderRadius: 8,
          background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)',
          color: '#14B8A6', cursor: 'pointer',
          fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            marginTop: 14, background: 'none', border: 'none', cursor: 'pointer',
            color: '#14B8A6', fontFamily: 'Outfit, sans-serif', fontSize: 13,
            fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 5
          }}>
            {expanded ? 'Show less ↑' : 'Read more ↓'}
          </button>
        )}
      </div>

      {/* Footer timestamps */}
      <div style={{
        padding: '12px 28px', borderTop: '1px solid rgba(11,31,58,0.05)',
        background: '#FAFAFA', display: 'flex', gap: 24, flexWrap: 'wrap'
      }}>
        {[
          { label: 'Created',      value: fmt(data.created_at) },
          { label: 'Last updated', value: fmt(data.updated_at) }
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

// ── Empty state (identical to WhoWeAreSection) ────────────────
function CompanyEmptyState({ onWrite }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      background: 'white', borderRadius: 16,
      border: '2px dashed rgba(20,184,166,0.25)',
      padding: '64px 40px', textAlign: 'center',
      transition: 'border-color 0.2s', animation: 'acFadeDown 0.3s ease'
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
          margin: '0 auto 24px', cursor: 'pointer', transition: 'all 0.3s',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          boxShadow: hovered ? '0 8px 24px rgba(20,184,166,0.2)' : 'none'
        }}
        title="Write content"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="#14B8A6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>

      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#0B1F3A', marginBottom: 10 }}>
        No content written yet
      </h3>
      <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 28px' }}>
        Click the write icon above to add the <b>"Company"</b> section content.
        Once written, you can edit it any time using the Edit button.
      </p>

      <button onClick={onWrite} style={{
        padding: '12px 28px', borderRadius: 10, border: 'none',
        background: 'linear-gradient(135deg,#14B8A6,#0E9488)',
        color: 'white', fontFamily: 'Outfit, sans-serif',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
        display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        Write Content
      </button>
    </div>
  );
}

// ── Main CompanyTab root ──────────────────────────────────────
function CompanyTab() {
  // 'loading' | 'empty' | 'view' | 'writing' | 'editing'
  const [mode,     setMode]     = useState('loading');
  const [data,     setData]     = useState(null);
  const [toast,    setToast]    = useState(null);
  const [fetchErr, setFetchErr] = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => {
    api.get('/api/admin/about-company')
      .then(({ data: res }) => {
        if (res.success && res.data) { setData(res.data); setMode('view'); }
        else setMode('empty');
      })
      .catch(() => {
        setFetchErr('Could not load content. Is the backend running?');
        setMode('empty');
      });
  }, []);

  const handleCreate = async (text) => {
    const { data: res } = await api.post('/api/admin/about-company', { content: text });
    setData(res.data); setMode('view'); showToast('Content saved successfully! 🎉');
  };

  const handleUpdate = async (text) => {
    const { data: res } = await api.put('/api/admin/about-company', { content: text });
    setData(res.data); setMode('view'); showToast('Content updated successfully! ✨');
  };

  return (
    <>
      {fetchErr && (
        <div style={{
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10
        }}>
          🔌 {fetchErr}
        </div>
      )}

      {/* LOADING */}
      {mode === 'loading' && (
        <div style={{ textAlign: 'center', padding: '52px 0' }}>
          <CompanySpinner />
          <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 16 }}>Loading content…</p>
        </div>
      )}

      {/* EMPTY */}
      {mode === 'empty' && <CompanyEmptyState onWrite={() => setMode('writing')} />}

      {/* WRITING */}
      {mode === 'writing' && (
        <CompanyContentForm
          initialValue="" isEdit={false}
          onSave={handleCreate}
          onCancel={() => setMode('empty')}
        />
      )}

      {/* VIEW */}
      {mode === 'view' && data && (
        <CompanyContentCard data={data} onEdit={() => setMode('editing')} />
      )}

      {/* EDITING */}
      {mode === 'editing' && data && (
        <CompanyContentForm
          initialValue={data.content} isEdit={true}
          onSave={handleUpdate}
          onCancel={() => setMode('view')}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes acFadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes acSpin { to { transform: rotate(360deg); } }
        textarea::placeholder { color: #C4C9D4 !important; }
      `}</style>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  PERFORMANCE TAB — editable Business Performance table
// ══════════════════════════════════════════════════════════════

function bpFormatINR(value) {
  // Light formatting helper: if it's a pure number, add Indian comma grouping
  if (!value) return '';
  const cleaned = value.toString().replace(/[^0-9.]/g, '');
  if (!cleaned) return value; // not numeric, return as-is
  const [intPart, decPart] = cleaned.split('.');
  let last3 = intPart.slice(-3);
  let other = intPart.slice(0, -3);
  if (other !== '') last3 = ',' + last3;
  const formatted = other.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + last3;
  return decPart ? `${formatted}.${decPart}` : formatted;
}

function PerformanceTab() {
  // 'loading' | 'view' | 'edit'
  const [mode, setMode]       = useState('loading');
  const [savedRows, setSavedRows] = useState([]);   // last saved data from DB
  const [rows, setRows]       = useState([]);        // working copy in edit mode
  const [toast, setToast]     = useState(null);
  const [fetchErr, setFetchErr] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => {
    api.get('/api/admin/business-performance')
      .then(({ data: res }) => {
        if (res.success) {
          setSavedRows(res.rows || []);
          setMode('view');
        } else {
          setMode('view');
        }
      })
      .catch(() => {
        setFetchErr('Could not load data. Is the backend running?');
        setMode('view');
      });
  }, []);

  const startEdit = () => {
    // Clone saved rows into editable working copy
    setRows(savedRows.map(r => ({ financial_year: r.financial_year, annual_turnover: r.annual_turnover })));
    setError('');
    setMode('edit');
  };

  const cancelEdit = () => {
    setRows([]);
    setError('');
    setMode('view');
  };

  const addRow = () => {
    setRows(prev => [...prev, { financial_year: '', annual_turnover: '' }]);
  };

  const updateRow = (idx, field, value) => {
    setRows(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removeRow = (idx) => {
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setError('');
    // Validate
    for (const r of rows) {
      if (!r.financial_year.trim() || !r.annual_turnover.toString().trim()) {
        setError('Please fill in both Financial Year and Annual Turnover for every row, or remove empty rows.');
        return;
      }
    }
    setSaving(true);
    try {
      const { data: res } = await api.put('/api/admin/business-performance', { rows });
      setSavedRows(res.rows || []);
      setMode('view');
      showToast('Business performance data saved! 🎉');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayRows = mode === 'edit' ? rows : savedRows;
  const isEmpty = displayRows.length === 0;

  return (
    <div style={{
      background: 'white', borderRadius: 16,
      border: '1px solid rgba(11,31,58,0.08)',
      boxShadow: '0 4px 20px rgba(11,31,58,0.06)',
      overflow: 'hidden', animation: 'bpFadeDown 0.35s ease'
    }}>

      {/* ── Form header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 24px',
        background: 'linear-gradient(135deg,rgba(20,184,166,0.06),rgba(11,31,58,0.03))',
        borderBottom: '1px solid rgba(11,31,58,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#14B8A6', boxShadow: '0 0 6px rgba(20,184,166,0.5)'
          }} />
          <div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: '#0B1F3A' }}>
              Business Performance
            </span>
            <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0, marginTop: 2 }}>
              {mode === 'edit' ? 'Editing — add rows, then click Save' : 'Click the edit icon to update this table'}
            </p>
          </div>
        </div>

        {/* Edit icon / Cancel button — top right */}
        {mode === 'view' && (
          <button onClick={startEdit} title="Edit table" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)',
            color: '#14B8A6', cursor: 'pointer',
            fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
        )}

        {mode === 'edit' && (
          <button onClick={cancelEdit} disabled={saving} style={{
            background: 'none', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            color: '#9CA3AF', fontSize: 20, lineHeight: 1, padding: 4,
            borderRadius: 6, transition: 'color 0.2s', opacity: saving ? 0.5 : 1
          }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.color = '#374151'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; }}
          >✕</button>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: 24 }}>

        {fetchErr && (
          <div style={{
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 18,
            color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10
          }}>
            🔌 {fetchErr}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* LOADING */}
        {mode === 'loading' && (
          <div style={{ textAlign: 'center', padding: '52px 0' }}>
            <div style={{
              width: 36, height: 36, margin: '0 auto',
              border: '3px solid rgba(20,184,166,0.2)',
              borderTopColor: '#14B8A6', borderRadius: '50%',
              animation: 'bpSpin 0.8s linear infinite'
            }} />
            <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: 16 }}>Loading…</p>
          </div>
        )}

        {/* TABLE */}
        {mode !== 'loading' && (
          <div style={{
            border: '1px solid rgba(11,31,58,0.08)', borderRadius: 12,
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Outfit, sans-serif' }}>
              <thead>
                <tr style={{ background: '#0B1F3A' }}>
                  <th style={bpTh}>Serial No.</th>
                  <th style={bpTh}>Financial Year</th>
                  <th style={{ ...bpTh, textAlign: mode === 'edit' ? 'left' : 'right' }}>
                    Annual Turnover Achieved (₹)
                  </th>
                  {mode === 'edit' && <th style={{ ...bpTh, width: 60, textAlign: 'center' }}></th>}
                </tr>
              </thead>
              <tbody>
                {isEmpty && (
                  <tr>
                    <td colSpan={mode === 'edit' ? 4 : 3} style={{
                      padding: '40px 16px', textAlign: 'center',
                      color: '#9CA3AF', fontSize: 14
                    }}>
                      {mode === 'edit'
                        ? <>No rows yet — click <b>Add Row</b> below to start.</>
                        : <>No data yet — click the <b>Edit</b> icon above to add rows.</>}
                    </td>
                  </tr>
                )}

                {/* VIEW mode rows */}
                {mode === 'view' && savedRows.map((r, i) => (
                  <tr key={r.id ?? i} style={{
                    borderBottom: i < savedRows.length - 1 ? '1px solid rgba(11,31,58,0.06)' : 'none',
                    background: i % 2 === 0 ? 'white' : '#FAFBFC'
                  }}>
                    <td style={bpTd}>{i + 1}</td>
                    <td style={{ ...bpTd, fontWeight: 600, color: '#0B1F3A' }}>{r.financial_year}</td>
                    <td style={{ ...bpTd, textAlign: 'right', fontWeight: 700, color: '#14B8A6', fontFamily: 'monospace, Outfit, sans-serif' }}>
                      ₹ {bpFormatINR(r.annual_turnover)}
                    </td>
                  </tr>
                ))}

                {/* EDIT mode rows */}
                {mode === 'edit' && rows.map((r, i) => (
                  <tr key={i} style={{
                    borderBottom: i < rows.length - 1 ? '1px solid rgba(11,31,58,0.06)' : 'none',
                    background: i % 2 === 0 ? 'white' : '#FAFBFC'
                  }}>
                    <td style={{ ...bpTd, fontWeight: 700, color: '#9CA3AF', width: 90 }}>{i + 1}</td>
                    <td style={{ ...bpTd, padding: '8px 12px' }}>
                      <input
                        type="text"
                        value={r.financial_year}
                        onChange={e => updateRow(i, 'financial_year', e.target.value)}
                        placeholder="e.g. 2021-22"
                        style={bpInput}
                        onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(11,31,58,0.12)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </td>
                    <td style={{ ...bpTd, padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#9CA3AF', fontWeight: 600, fontSize: 14 }}>₹</span>
                        <input
                          type="text"
                          value={r.annual_turnover}
                          onChange={e => updateRow(i, 'annual_turnover', e.target.value)}
                          placeholder="e.g. 12,50,00,000"
                          style={{ ...bpInput, textAlign: 'left' }}
                          onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(11,31,58,0.12)'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    </td>
                    <td style={{ ...bpTd, textAlign: 'center', width: 60 }}>
                      <button onClick={() => removeRow(i)} title="Remove row" style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#D1D5DB', fontSize: 18, lineHeight: 1, padding: 4,
                        transition: 'color 0.2s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#D1D5DB'}
                      >✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Row + Save (edit mode only) */}
        {mode === 'edit' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, flexWrap: 'wrap', gap: 12 }}>
            <button onClick={addRow} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'none', border: '1.5px dashed rgba(20,184,166,0.35)',
              borderRadius: 8, padding: '10px 18px', cursor: 'pointer',
              color: '#14B8A6', fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600,
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.05)'; e.currentTarget.style.borderColor = '#14B8A6'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(20,184,166,0.35)'; }}
            >
              <span style={{ fontSize: 16 }}>+</span> Add Row
            </button>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={cancelEdit} disabled={saving} style={{
                padding: '11px 24px', borderRadius: 10,
                border: '1px solid rgba(11,31,58,0.15)',
                background: 'white', color: '#374151',
                fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', opacity: saving ? 0.5 : 1
              }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
              >Cancel</button>

              <button onClick={handleSave} disabled={saving} style={{
                padding: '11px 28px', borderRadius: 10, border: 'none',
                background: saving ? 'rgba(20,184,166,0.4)' : 'linear-gradient(135deg,#14B8A6,#0E9488)',
                color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: saving ? 'none' : '0 4px 14px rgba(20,184,166,0.3)', transition: 'all 0.2s'
              }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {saving && <span style={{
                  width: 15, height: 15, display: 'inline-block',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'bpSpin 0.8s linear infinite'
                }} />}
                {saving ? 'Saving…' : '✓ Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes bpFadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bpSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Table cell styles for PerformanceTab
const bpTh = {
  padding: '13px 16px', textAlign: 'left',
  fontSize: 12, fontWeight: 700, color: 'white',
  letterSpacing: '0.08em', textTransform: 'uppercase'
};
const bpTd = {
  padding: '13px 16px', fontSize: 14, color: '#374151'
};
const bpInput = {
  width: '100%', padding: '9px 12px',
  border: '1px solid rgba(11,31,58,0.12)', borderRadius: 8,
  fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#374151',
  outline: 'none', background: 'white', boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s'
};

// ══════════════════════════════════════════════════════════════
//  MAIN AboutSection — tab nav identical to ServicesSection
// ══════════════════════════════════════════════════════════════
export default function AboutSection() {
  const [activeTab, setActiveTab] = useState('people');

  const TABS = [
    { id: 'people',      label: 'People',      icon: '👥' },
    { id: 'company',     label: 'Company',     icon: '🏢' },
    { id: 'performance', label: 'Performance', icon: '📊' },
  ];

  return (
    <div style={{
      marginTop: '24px', background: 'white', borderRadius: '20px',
      border: '1px solid rgba(11,31,58,0.08)',
      boxShadow: '0 4px 24px rgba(11,31,58,0.06)',
      overflow: 'hidden', animation: 'abtFadeDown 0.35s ease'
    }}>

      {/* ── Header with embedded tab nav ── */}
      <div style={{
        padding: '0 28px',
        background: 'linear-gradient(135deg, #0B1F3A 0%, #0d2a4a 100%)',
        borderBottom: '1px solid rgba(11,31,58,0.07)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '20px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(20,184,166,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
          }}>ℹ️</div>
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700, color: 'white', margin: 0 }}>
              About Manager
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
              Manage people, company info & performance data
            </p>
          </div>
        </div>

        {/* Tab nav bar */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '16px' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 20px',
                background: isActive ? 'rgba(20,184,166,0.18)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #14B8A6' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                color: isActive ? '#14B8A6' : 'rgba(255,255,255,0.5)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px', fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s', letterSpacing: '0.02em'
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >
                <span style={{ fontSize: '15px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab body ── */}
      <div style={{ padding: '28px' }}>
        {activeTab === 'people'      && <PeopleTab />}
        {activeTab === 'company'     && <CompanyTab />}
        {activeTab === 'performance' && <PerformanceTab />}
      </div>

      <style>{`
        @keyframes abtFadeDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes abtSlideToast {
          from { opacity:0; transform:translateX(30px) scale(0.95); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
        @keyframes abtPopIn {
          from { opacity:0; transform:scale(0.88); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes abtSpin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
/**
 * ProjectsSection.jsx
 * Full CRUD UI for projects + project_works — mirrors SlideshowSection exactly.
 *  - Post button  → form (project name + image, then dynamic "works" list
 *                    with "Add Work" button) → save → success toast
 *  - Edit icon on each card → pre-filled form (edit name/image, edit/add/remove works) → update
 *  - Delete toggle → delete icon on cards → confirm popup → delete
 */
import { useState, useEffect, useRef } from 'react';
import api from '../api';

let _workKeySeq = 0;
const newWorkKey = () => `w_${++_workKeySeq}_${Date.now()}`;

// ══════════════════════════════════════════════════════════════
//  Shared UI primitives — identical to SlideshowSection
// ══════════════════════════════════════════════════════════════

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
      animation: 'prjSlideToast 0.4s cubic-bezier(0.34,1.56,0.64,1)'
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
        animation: 'prjPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'
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
          You are about to delete the project:
        </p>
        <p style={{
          fontWeight: 700, color: '#0B1F3A', fontSize: '15px',
          background: '#F3F4F6', borderRadius: '8px', padding: '8px 14px', marginBottom: '20px'
        }}>"{item?.name}"</p>
        <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '24px' }}>
          This will permanently delete the project, all its work entries, and images. This cannot be undone.
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

// ── Image picker — identical to SlideshowSection (compact variant available) ──
function ImagePicker({ onChange, existingUrl, label = 'Add Image', height = '160px' }) {
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
      {label && <label style={labelStyle}>{label}</label>}
      <div
        onClick={() => inputRef.current.click()}
        style={{
          border: '2px dashed rgba(20,184,166,0.4)',
          borderRadius: '12px', height, cursor: 'pointer',
          background: preview ? 'transparent' : 'rgba(20,184,166,0.03)',
          overflow: 'hidden', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.2s'
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
              <span style={{ fontSize: '24px' }}>📷</span>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>Click to change</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>🖼️</div>
            <div style={{ color: '#14B8A6', fontWeight: 600, fontSize: '13px' }}>Click to upload</div>
            <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>JPG, PNG, WEBP · Max 5 MB</div>
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

function InputField({ label, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        type="text" value={value} onChange={onChange} placeholder={placeholder}
        style={{
          ...inputStyle,
          borderColor: focused ? '#14B8A6' : 'rgba(11,31,58,0.12)',
          boxShadow: focused ? '0 0 0 3px rgba(20,184,166,0.1)' : 'none'
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PROJECT FORM  (name + image + dynamic works list)
// ══════════════════════════════════════════════════════════════
function ProjectForm({ editProject, onSuccess, onCancel }) {
  const isEdit = !!editProject;

  const [projectImage, setProjectImage] = useState(null);
  const [name, setName] = useState(editProject?.name || '');
  const [works, setWorks] = useState(() => {
    if (editProject?.works?.length) {
      return editProject.works.map(w => ({
        key: newWorkKey(),
        name: w.work_name,
        file: null,
        previewUrl: w.image_url,
        existing_image: w.image_filename
      }));
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addWork = () => {
    setWorks(prev => [...prev, {
      key: newWorkKey(), name: '', file: null, previewUrl: null, existing_image: null
    }]);
  };

  const updateWorkName = (key, val) => {
    setWorks(prev => prev.map(w => w.key === key ? { ...w, name: val } : w));
  };

  const updateWorkImage = (key, file) => {
    setWorks(prev => prev.map(w => w.key === key ? { ...w, file } : w));
  };

  const removeWork = (key) => {
    setWorks(prev => prev.filter(w => w.key !== key));
  };

  const handleSubmit = async () => {
    setError('');
    if (!isEdit && !projectImage) { setError('Please select a project image.'); return; }
    if (!name.trim()) { setError('Project name is required.'); return; }
    for (let i = 0; i < works.length; i++) {
      if (!works[i].name.trim()) { setError(`Work #${i + 1} needs a name.`); return; }
      if (!works[i].file && !works[i].existing_image) { setError(`Work #${i + 1} needs an image.`); return; }
    }

    const fd = new FormData();
    fd.append('name', name.trim());
    if (projectImage) fd.append('image', projectImage);

    let newImgIdx = 0;
    const worksMeta = works.map(w => {
      if (w.file) {
        const idx = newImgIdx++;
        fd.append(`work_image_${idx}`, w.file);
        return { name: w.name.trim(), new_image_index: idx, existing_image: null };
      }
      return { name: w.name.trim(), new_image_index: null, existing_image: w.existing_image };
    });
    fd.append('works', JSON.stringify(worksMeta));

    setLoading(true);
    try {
      const res = isEdit
        ? await api.put(`/api/admin/projects/${editProject.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await api.post('/api/admin/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess(res.data.project, isEdit ? 'updated' : 'uploaded');
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
      animation: 'prjFadeDown 0.3s ease'
    }}>
      {/* Form header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px'
      }}>
        <h4 style={{
          fontFamily: 'Playfair Display, serif', fontSize: '17px',
          color: '#0B1F3A', margin: 0
        }}>
          {isEdit ? '✏️ Edit Project' : '📤 Add New Project'}
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

      {/* Project name + image */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
        <InputField
          label="Project Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. 110/11 KV Substation, Doddaballapur"
        />
        <ImagePicker
          onChange={setProjectImage}
          existingUrl={isEdit ? editProject.image_url : null}
          label={isEdit ? 'Replace Project Image (optional)' : 'Project Image *'}
        />
      </div>

      {/* Divider */}
      <div style={{
        borderTop: '1px dashed rgba(11,31,58,0.12)', margin: '0 0 20px'
      }} />

      {/* Works list */}
      <div style={{ marginBottom: '8px' }}>
        <label style={labelStyle}>Works</label>
      </div>

      {works.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '24px', color: '#9CA3AF',
          fontSize: '13px', border: '1px dashed rgba(11,31,58,0.1)',
          borderRadius: '10px', marginBottom: '14px', background: 'white'
        }}>
          No works added yet. Click <b>Add Work</b> below.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
        {works.map((w, idx) => (
          <div key={w.key} style={{
            display: 'grid', gridTemplateColumns: '1fr 160px 36px',
            gap: '12px', alignItems: 'start',
            background: 'white', border: '1px solid rgba(11,31,58,0.08)',
            borderRadius: '12px', padding: '14px'
          }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: '6px' }}>Work #{idx + 1} Name *</label>
              <InputField
                value={w.name}
                onChange={e => updateWorkName(w.key, e.target.value)}
                placeholder="e.g. Foundation & Civil Works"
              />
            </div>
            <div>
              <ImagePicker
                onChange={file => updateWorkImage(w.key, file)}
                existingUrl={w.previewUrl}
                label="Work Image *"
                height="90px"
              />
            </div>
            <button
              onClick={() => removeWork(w.key)}
              title="Remove this work"
              style={{
                marginTop: '26px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px', width: '36px', height: '36px',
                cursor: 'pointer', color: '#EF4444', fontSize: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            >🗑️</button>
          </div>
        ))}
      </div>

      {/* Add Work button */}
      <button onClick={addWork} style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        background: 'none', border: '1.5px dashed rgba(20,184,166,0.35)',
        borderRadius: '8px', padding: '10px 18px', cursor: 'pointer',
        color: '#14B8A6', fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: 600,
        transition: 'all 0.2s', marginBottom: '24px'
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.05)'; e.currentTarget.style.borderColor = '#14B8A6'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(20,184,166,0.35)'; }}
      >
        <span style={{ fontSize: '16px' }}>+</span> Add Work
      </button>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
          {loading && (
            <span style={{
              width: '16px', height: '16px',
              border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: 'white', borderRadius: '50%',
              animation: 'prjSpin 0.8s linear infinite'
            }} />
          )}
          {loading
            ? (isEdit ? 'Updating…' : 'Saving…')
            : (isEdit ? 'Update Project' : 'Save Project')}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PROJECT CARD — project image/name + works thumbnail strip
// ══════════════════════════════════════════════════════════════
function ProjectCard({ project, deleteMode, onEdit, onDelete }) {
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
      {/* Project image */}
      <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={project.image_url}
          alt={project.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = `https://placehold.co/400x200/0B1F3A/14B8A6?text=${encodeURIComponent(project.name)}`; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(11,31,58,0.7) 0%, transparent 60%)'
        }} />

        {/* Edit / Delete icon */}
        <button
          onClick={() => deleteMode ? onDelete(project) : onEdit(project)}
          title={deleteMode ? 'Delete this project' : 'Edit this project'}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '34px', height: '34px', borderRadius: '50%',
            background: deleteMode ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.2s', backdropFilter: 'blur(4px)'
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

        {/* Name overlay */}
        <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px' }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700, fontSize: '15px', color: 'white',
            lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
          }}>{project.name}</div>
        </div>
      </div>

      {/* Works thumbnail strip */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{
          fontSize: '11px', fontWeight: 700, color: '#9CA3AF',
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px'
        }}>
          {project.works?.length || 0} Work{project.works?.length === 1 ? '' : 's'}
        </div>
        {project.works?.length > 0 ? (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {project.works.map(w => (
              <div key={w.id} style={{
                flexShrink: 0, width: '56px', textAlign: 'center'
              }}>
                <div style={{
                  width: '56px', height: '44px', borderRadius: '8px',
                  overflow: 'hidden', border: '1px solid rgba(11,31,58,0.08)'
                }}>
                  <img
                    src={w.image_url} alt={w.work_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = 'https://placehold.co/56x44/E5E7EB/9CA3AF?text=·'; }}
                  />
                </div>
                <div style={{
                  fontSize: '10px', color: '#6B7280', marginTop: '3px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }} title={w.work_name}>{w.work_name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: '#D1D5DB', fontStyle: 'italic' }}>No works added</div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  Main ProjectsSection — identical shell to SlideshowSection
// ══════════════════════════════════════════════════════════════
export default function ProjectsSection() {
  const [projects,       setProjects]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState('');
  const [showForm,       setShowForm]       = useState(false);
  const [editProject,    setEditProject]    = useState(null);
  const [deleteMode,     setDeleteMode]     = useState(false);
  const [confirmProject, setConfirmProject] = useState(null);
  const [toast,          setToast]          = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true); setFetchError('');
    try {
      const { data } = await api.get('/api/admin/projects');
      setProjects(data.projects || []);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load projects. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleFormSuccess = (project, action) => {
    if (action === 'uploaded') {
      setProjects(prev => [...prev, project]);
      showToast('Project added successfully! 🎉');
    } else {
      setProjects(prev => prev.map(p => p.id === project.id ? project : p));
      showToast('Project updated successfully! ✨');
    }
    setShowForm(false);
    setEditProject(null);
  };

  const handleDeleteConfirm = async () => {
    const proj = confirmProject;
    setConfirmProject(null);
    try {
      await api.delete(`/api/admin/projects/${proj.id}`);
      setProjects(prev => prev.filter(p => p.id !== proj.id));
      showToast('Project deleted successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const openEdit = (project) => {
    setShowForm(false);
    setEditProject(project);
  };

  const cancelForm = () => { setShowForm(false); setEditProject(null); };

  const toggleDeleteMode = () => {
    setDeleteMode(d => !d);
    setShowForm(false);
    setEditProject(null);
  };

  return (
    <div style={{
      marginTop: '24px',
      background: 'white', borderRadius: '20px',
      border: '1px solid rgba(11,31,58,0.08)',
      boxShadow: '0 4px 24px rgba(11,31,58,0.06)',
      overflow: 'hidden',
      animation: 'prjFadeDown 0.35s ease'
    }}>

      {/* ── Section header — identical to SlideshowSection ── */}
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
          }}>🏗️</div>
          <div>
            <h3 style={{
              fontFamily: 'Playfair Display, serif', fontSize: '18px',
              fontWeight: 700, color: 'white', margin: 0
            }}>Projects Manager</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: 0 }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        {/* Post + Delete buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setShowForm(s => !s); setEditProject(null); setDeleteMode(false); }}
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
            animation: 'prjFadeDown 0.25s ease'
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span style={{ color: '#EF4444', fontSize: '13px', fontWeight: 500 }}>
              Delete mode active — click the 🗑️ icon on any project card to delete it. Press <b>Done</b> to exit.
            </span>
          </div>
        )}

        {/* Add form */}
        {showForm && !editProject && (
          <div style={{ marginBottom: '28px' }}>
            <ProjectForm onSuccess={handleFormSuccess} onCancel={cancelForm} />
          </div>
        )}

        {/* Edit form */}
        {editProject && (
          <div style={{ marginBottom: '28px' }}>
            <ProjectForm
              editProject={editProject}
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
              borderRadius: '50%', animation: 'prjSpin 0.8s linear infinite'
            }} />
            Loading projects…
          </div>
        )}

        {/* Error */}
        {fetchError && !loading && (
          <div style={{
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#EF4444'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔌</div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Could not load projects</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>{fetchError}</div>
            <button onClick={fetchProjects} style={{
              marginTop: '14px', padding: '9px 20px', borderRadius: '8px',
              border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)',
              color: '#EF4444', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              fontWeight: 600, fontSize: '13px'
            }}>Retry</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '52px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>🏗️</div>
            <div style={{ fontWeight: 600, color: '#374151', marginBottom: '6px' }}>No projects yet</div>
            <div style={{ fontSize: '14px' }}>Click the <b>Post</b> button above to add your first project.</div>
          </div>
        )}

        {/* Project cards grid */}
        {!loading && !fetchError && projects.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '18px'
          }}>
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                deleteMode={deleteMode}
                onEdit={openEdit}
                onDelete={p => setConfirmProject(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {confirmProject && (
        <ConfirmDialog
          item={confirmProject}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmProject(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      <style>{`
        @keyframes prjFadeDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes prjSlideToast {
          from { opacity:0; transform:translateX(30px) scale(0.95); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
        @keyframes prjPopIn {
          from { opacity:0; transform:scale(0.88); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes prjSpin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}


// src/admin/settings/SocialTab.jsx
// ─────────────────────────────────────────────────────────────
// Social Media settings tab.
// - Shows an "Edit" button by default (matches InformationTab style)
// - In edit mode: lists existing entries + "Add" button
// - "Add" expands an inline row form (name, icon, link)
// - Each entry can be edited inline or deleted
// - Saves individual entries to /api/admin/settings/social-media
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import api from '../api';
import { SettingCard, Field, TextInput, Toast, C, btnPrimary, btnSecondary } from './shared';

// ── Icon name suggestions (common social platforms) ────────────
const ICON_SUGGESTIONS = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Twitter / X', value: 'twitter' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Pinterest', value: 'pinterest' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Koo', value: 'koo' },
  { label: 'Threads', value: 'threads' },
];

// ── Map icon name → SVG path (simple icon library) ────────────
function SocialIcon({ name, size = 18, color = 'currentColor' }) {
  const icons = {
    facebook: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    instagram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="3.5"/>
        <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none"/>
      </svg>
    ),
    twitter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    linkedin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
    youtube: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
      </svg>
    ),
    whatsapp: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>
    ),
    pinterest: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    ),
    telegram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    koo: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    ),
    threads: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.186c0-3.4.85-6.254 2.495-8.305C5.845 1.575 8.598.394 12.179.37h.014c2.746.018 5.476 1.08 7.467 2.895l-1.44 1.618c-1.622-1.445-3.834-2.24-6.027-2.255h-.012c-2.97.02-5.204.952-6.638 2.77C4.07 7.152 3.25 9.576 3.25 12.186c0 2.61.82 5.034 2.293 6.788 1.434 1.818 3.668 2.75 6.638 2.77h.012c2.383-.016 4.44-.628 5.834-1.73.977-.779 1.657-1.889 1.987-3.295l.002-.007-1.948-.447c-.271 1.086-.817 1.94-1.58 2.536-1.142.912-2.824 1.385-4.875 1.398l-.427-.001z"/>
        <path d="M19.94 10.56c-.22-2.17-1.34-3.79-3.24-4.67-1.38-.64-3.01-.73-4.74-.26-.15.04-.3.09-.44.13l.43 1.95c.12-.04.25-.08.38-.12 1.33-.36 2.55-.29 3.54.2 1.25.58 1.99 1.72 2.14 3.28.13 1.37-.19 2.54-.94 3.37-.69.77-1.68 1.19-2.91 1.23h-.08c-.89 0-1.64-.29-2.17-.85-.56-.59-.82-1.43-.74-2.46.12-1.55 1.2-2.76 2.72-3.13.7-.18 1.43-.1 2.03.23.5.27.84.72.95 1.28.12.62-.03 1.25-.42 1.71-.3.36-.7.57-1.15.6h-.05c-.31 0-.56-.11-.73-.31-.18-.22-.25-.54-.19-.9.07-.44.3-.79.59-.95l-.91-1.74c-.72.39-1.22 1.1-1.36 1.97-.12.76.03 1.48.43 2.01.4.54 1.01.84 1.75.84h.08c.87-.03 1.65-.39 2.2-1.02.73-.84 1.03-2.02.82-3.24-.16-.91-.63-1.67-1.37-2.16-.74-.49-1.67-.65-2.62-.47-2.3.52-3.88 2.5-4.05 4.96-.11 1.51.28 2.82 1.11 3.73.82.9 1.98 1.37 3.39 1.38h.1c1.71-.05 3.1-.71 4.04-1.87.94-1.16 1.38-2.79 1.22-4.62z"/>
      </svg>
    ),
  };
  return icons[name?.toLowerCase()] || (
    <span style={{ fontSize: size * 0.7, fontWeight: 700, color }}>{(name || '?').slice(0, 2).toUpperCase()}</span>
  );
}

// ── Inline row form (add / edit) ───────────────────────────────
function EntryForm({ initial = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    icon: initial.icon || '',
    link: initial.link || '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.icon.trim()) e.icon = 'Required';
    if (!form.link.trim()) e.link = 'Required';
    else if (!/^https?:\/\//i.test(form.link.trim())) e.link = 'Must start with http:// or https://';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = () => { if (validate()) onSave(form); };

  return (
    <div style={{
      background: 'rgba(20,184,166,0.04)',
      border: `1.5px dashed rgba(20,184,166,0.35)`,
      borderRadius: 12,
      padding: '18px 20px',
      marginBottom: 12,
      animation: 'stgFadeIn 0.25s ease'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 14, marginBottom: 14 }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>Platform Name {errors.name && <span style={{ color: C.error }}> — {errors.name}</span>}</label>
          <input
            style={{ ...inputStyle, borderColor: errors.name ? C.error : 'rgba(11,31,58,0.15)' }}
            placeholder="e.g. LinkedIn"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            list="icon-suggestions"
          />
          <datalist id="icon-suggestions">
            {ICON_SUGGESTIONS.map(s => <option key={s.value} value={s.label} />)}
          </datalist>
        </div>

        {/* Icon */}
        <div>
          <label style={labelStyle}>
            Icon Key {errors.icon && <span style={{ color: C.error }}> — {errors.icon}</span>}
            {form.icon && (
              <span style={{ marginLeft: 8, verticalAlign: 'middle', color: C.teal }}>
                <SocialIcon name={form.icon} size={14} color={C.teal} />
              </span>
            )}
          </label>
          <input
            style={{ ...inputStyle, borderColor: errors.icon ? C.error : 'rgba(11,31,58,0.15)' }}
            placeholder="e.g. linkedin"
            value={form.icon}
            onChange={e => set('icon', e.target.value.toLowerCase().trim())}
            list="icon-keys"
          />
          <datalist id="icon-keys">
            {ICON_SUGGESTIONS.map(s => <option key={s.value} value={s.value} />)}
          </datalist>
        </div>

        {/* Link */}
        <div>
          <label style={labelStyle}>URL {errors.link && <span style={{ color: C.error }}> — {errors.link}</span>}</label>
          <input
            style={{ ...inputStyle, borderColor: errors.link ? C.error : 'rgba(11,31,58,0.15)' }}
            placeholder="https://linkedin.com/company/..."
            value={form.link}
            onChange={e => set('link', e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} disabled={saving} style={btnSecondary}>Cancel</button>
        <button onClick={submit} disabled={saving} style={{
          ...btnPrimary,
          opacity: saving ? 0.6 : 1,
          cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          {saving && <span style={spinStyle} />}
          {saving ? 'Saving…' : '✓ Save'}
        </button>
      </div>
    </div>
  );
}

// ── View row for a social media entry ─────────────────────────
function EntryRow({ entry, onEdit, onDelete, deleting }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '12px 16px', borderRadius: 10,
      border: `1px solid ${C.border}`,
      marginBottom: 10, background: 'white',
      transition: 'box-shadow 0.2s'
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(11,31,58,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 9,
        background: 'rgba(20,184,166,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <SocialIcon name={entry.icon} size={18} color={C.teal} />
      </div>

      {/* Name + link */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, color: '#0B1F3A' }}>
          {entry.name}
        </div>
        <a href={entry.link} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: C.teal, textDecoration: 'none', wordBreak: 'break-all' }}>
          {entry.link}
        </a>
      </div>

      {/* Icon key badge */}
      <span style={{
        fontSize: 11, fontFamily: 'monospace', padding: '3px 8px',
        borderRadius: 6, background: 'rgba(11,31,58,0.05)',
        color: '#6B7280', flexShrink: 0
      }}>{entry.icon}</span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(entry)} style={iconBtn('#14B8A6')} title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button onClick={() => onDelete(entry.id)} disabled={deleting === entry.id} style={iconBtn('#EF4444')} title="Delete">
          {deleting === entry.id
            ? <span style={{ ...spinStyle, borderColor: 'rgba(239,68,68,0.3)', borderTopColor: '#EF4444' }} />
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
          }
        </button>
      </div>
    </div>
  );
}

// ── Shared micro styles ────────────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'rgba(11,31,58,0.55)', letterSpacing: '0.08em',
  textTransform: 'uppercase', marginBottom: 5
};
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 13px', border: '1.5px solid rgba(11,31,58,0.15)',
  borderRadius: 9, fontFamily: 'Outfit, sans-serif',
  fontSize: 14, color: '#374151', outline: 'none', background: 'white'
};
const spinStyle = {
  display: 'inline-block', width: 13, height: 13,
  border: '2px solid rgba(255,255,255,0.4)',
  borderTopColor: 'white', borderRadius: '50%',
  animation: 'stgSpin 0.8s linear infinite'
};
const iconBtn = (hoverColor) => ({
  width: 32, height: 32, borderRadius: 8,
  border: '1px solid rgba(11,31,58,0.1)',
  background: 'white', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#9CA3AF', transition: 'all 0.2s',
  // hover handled inline via onMouseEnter
});

// ── Main component ─────────────────────────────────────────────
export default function SocialTab() {
  const [entries, setEntries]   = useState([]);
  const [editing, setEditing]   = useState(false);   // card in edit mode
  const [adding, setAdding]     = useState(false);   // "add new" form visible
  const [editingId, setEditingId] = useState(null);  // which row is being edited
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast]       = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get('/api/admin/settings/social-media');
      setEntries(res.data.data || []);
    } catch {
      setToast({ type: 'error', msg: 'Failed to load social media' });
    }
  };

  const handleAdd = async (form) => {
    try {
      setSaving(true);
      const res = await api.post('/api/admin/settings/social-media', form);
      setEntries(prev => [...prev, res.data.data]);
      setAdding(false);
      setToast({ type: 'success', msg: `${form.name} added successfully` });
    } catch {
      setToast({ type: 'error', msg: 'Failed to add entry' });
    } finally { setSaving(false); }
  };

  const handleUpdate = async (id, form) => {
    try {
      setSaving(true);
      const res = await api.put(`/api/admin/settings/social-media/${id}`, form);
      setEntries(prev => prev.map(e => e.id === id ? res.data.data : e));
      setEditingId(null);
      setToast({ type: 'success', msg: `${form.name} updated` });
    } catch {
      setToast({ type: 'error', msg: 'Failed to update entry' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this social media entry?')) return;
    try {
      setDeleting(id);
      await api.delete(`/api/admin/settings/social-media/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
      setToast({ type: 'success', msg: 'Entry deleted' });
    } catch {
      setToast({ type: 'error', msg: 'Failed to delete entry' });
    } finally { setDeleting(null); }
  };

  const cancelEditing = () => {
    setEditing(false);
    setAdding(false);
    setEditingId(null);
  };

  return (
    <>
      <style>{`
        @keyframes stgToast  { from{opacity:0;transform:translateY(10px) scale(0.95);} to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes stgSpin   { to{transform:rotate(360deg);} }
        @keyframes stgFadeIn { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
      `}</style>

      <SettingCard
        title="Social Media"
        subtitle="Manage company social profiles shown in footer"
        icon="🌐"
        isEditing={editing}
        saving={false}
        hasData={entries.length > 0}
        onEdit={() => setEditing(true)}
        onCancel={cancelEditing}
        onSave={cancelEditing}   /* "Done" just exits edit mode — saves happen per-entry */
      >
        {editing ? (
          /* ── Edit mode ── */
          <div>
            {entries.length === 0 && !adding && (
              <div style={{
                textAlign: 'center', padding: '28px 0', color: '#9CA3AF',
                fontFamily: 'Outfit, sans-serif', fontSize: 14
              }}>
                No social media links yet. Press <strong>Add</strong> to add one.
              </div>
            )}

            {/* Existing entries */}
            {entries.map(entry =>
              editingId === entry.id
                ? <EntryForm
                    key={entry.id}
                    initial={entry}
                    saving={saving}
                    onSave={form => handleUpdate(entry.id, form)}
                    onCancel={() => setEditingId(null)}
                  />
                : <EntryRow
                    key={entry.id}
                    entry={entry}
                    onEdit={e => { setEditingId(e.id); setAdding(false); }}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
            )}

            {/* Add form */}
            {adding && (
              <EntryForm
                saving={saving}
                onSave={handleAdd}
                onCancel={() => setAdding(false)}
              />
            )}

            {/* Add button */}
            {!adding && editingId === null && (
              <button
                onClick={() => setAdding(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginTop: 6, padding: '9px 18px',
                  background: 'rgba(20,184,166,0.08)',
                  border: '1.5px dashed rgba(20,184,166,0.4)',
                  borderRadius: 10, color: '#14B8A6',
                  fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,184,166,0.08)'}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Social Media
              </button>
            )}
          </div>
        ) : (
          /* ── View mode ── */
          entries.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '28px 0',
              color: '#9CA3AF', fontFamily: 'Outfit, sans-serif',
              fontSize: 14, fontStyle: 'italic'
            }}>
              No social media configured. Click <strong>Edit</strong> to add links.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {entries.map(entry => (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 10,
                  border: `1px solid ${C.border}`, background: '#F9FAFB'
                }}>
                  <SocialIcon name={entry.icon} size={16} color={C.teal} />
                  <a href={entry.link} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 13, fontWeight: 600, color: '#0B1F3A', textDecoration: 'none', fontFamily: 'Outfit, sans-serif' }}>
                    {entry.name}
                  </a>
                </div>
              ))}
            </div>
          )
        )}
      </SettingCard>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
}
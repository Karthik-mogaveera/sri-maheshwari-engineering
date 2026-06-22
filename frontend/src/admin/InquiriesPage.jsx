/**
 * InquiriesPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Industry-standard admin inquiries manager.
 * Features:
 *  - Summary stat cards (Total / Unread / Starred / Today)
 *  - Sidebar filters (All / Unread / Read / Starred / Trash)
 *  - Search bar with debounce
 *  - Sort selector
 *  - Paginated table with bulk-select checkboxes
 *  - Star / Mark-read toggle per row
 *  - Click row → detail drawer (right panel)
 *  - Bulk delete with confirm dialog
 *  - CSV export
 *  - Unread badge count on sidebar tab
 * ─────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import api from './api';

// ── Colour tokens ──────────────────────────────────────────────
const C = {
  midnight: '#0B1F3A', teal: '#14B8A6', tealLight: 'rgba(20,184,166,0.1)',
  border: 'rgba(11,31,58,0.08)', gray: '#6B7280', light: '#F9FAFB'
};

// ── Tiny helpers ───────────────────────────────────────────────
const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
}) : '—';

const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric'
}) : '—';

const timeAgo = (dt) => {
  if (!dt) return '';
  const diff = Date.now() - new Date(dt).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return fmtDate(dt);
};

// ══════════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════════
function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? '#14B8A6' : type === 'error' ? '#EF4444' : '#F59E0B';
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: 'white', borderRadius: 12, padding: '13px 20px',
      boxShadow: `0 6px 24px ${bg}55`, display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
      animation: 'inqToast 0.35s cubic-bezier(0.34,1.56,0.64,1)'
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

// ══════════════════════════════════════════════════════════════
//  CONFIRM DIALOG
// ══════════════════════════════════════════════════════════════
function ConfirmDialog({ count, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        background: 'white', borderRadius: 18, padding: '36px 32px',
        maxWidth: 400, width: '100%', textAlign: 'center',
        boxShadow: '0 24px 70px rgba(0,0,0,0.2)',
        animation: 'inqPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, margin: '0 auto 18px'
        }}>🗑️</div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, color: C.midnight, marginBottom: 10 }}>
          Move to Trash?
        </h3>
        <p style={{ color: C.gray, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          {count === 1 ? 'This inquiry' : `${count} inquiries`} will be moved to trash.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 11, borderRadius: 10,
            border: '1px solid rgba(11,31,58,0.15)', background: 'white',
            color: '#374151', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: 11, borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#EF4444,#DC2626)',
            color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
          }}>Move to Trash</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  DETAIL DRAWER (right panel)
// ══════════════════════════════════════════════════════════════
function DetailDrawer({ inquiry, onClose, onStar, onToggleRead, onDelete }) {
  if (!inquiry) return null;

  const copyEmail = () => {
    navigator.clipboard?.writeText(inquiry.email);
  };

  return (
    <>
      {/* Backdrop on mobile */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 290,
        background: 'rgba(0,0,0,0.2)', display: 'none'
      }} className="inq-drawer-backdrop" />

      <div style={{
        width: '380px', flexShrink: 0,
        background: 'white', borderLeft: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        animation: 'inqSlideIn 0.3s ease'
      }}>
        {/* Drawer header */}
        <div style={{
          padding: '18px 20px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: C.light
        }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: C.midnight }}>
            Inquiry Detail
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Star */}
            <button onClick={() => onStar(inquiry)} title="Star/Unstar" style={{
              background: inquiry.is_starred ? 'rgba(245,158,11,0.1)' : 'none',
              border: inquiry.is_starred ? '1px solid rgba(245,158,11,0.3)' : `1px solid ${C.border}`,
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}>
              {inquiry.is_starred ? '⭐' : '☆'}
            </button>
            {/* Mark read/unread */}
            <button onClick={() => onToggleRead(inquiry)} title={inquiry.is_read ? 'Mark unread' : 'Mark read'} style={{
              background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}>
              {inquiry.is_read ? '📭' : '📬'}
            </button>
            {/* Delete */}
            <button onClick={() => onDelete([inquiry.id])} title="Move to trash" style={{
              background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = C.border; }}
            >🗑️</button>
            {/* Close */}
            <button onClick={onClose} style={{
              background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✕</button>
          </div>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Sender avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#14B8A6,#0E9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'white'
            }}>
              {(inquiry.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: C.midnight }}>
                {inquiry.name}
              </div>
              {!inquiry.is_read && (
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#14B8A6',
                  background: 'rgba(20,184,166,0.1)', borderRadius: 100,
                  padding: '2px 10px', letterSpacing: '0.05em'
                }}>NEW</span>
              )}
            </div>
          </div>

          {/* Contact details */}
          {[
            { label: 'Email', value: inquiry.email, action: copyEmail, actionLabel: 'Copy' },
            { label: 'Phone', value: inquiry.phone || '—' },
            { label: 'Company', value: inquiry.company_name || '—' },
            { label: 'Received', value: fmt(inquiry.created_at) },
            { label: 'IP Address', value: inquiry.ip_address || '—' },
          ].map(({ label, value, action, actionLabel }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '10px 0', borderBottom: `1px solid ${C.border}`
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, marginRight: 12 }}>
                {label}
              </span>
              <span style={{ fontSize: 13, color: '#374151', textAlign: 'right', wordBreak: 'break-all' }}>
                {value}
                {action && value !== '—' && (
                  <button onClick={action} style={{
                    marginLeft: 8, fontSize: 11, color: C.teal, background: 'none',
                    border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'Outfit, sans-serif'
                  }}>{actionLabel}</button>
                )}
              </span>
            </div>
          ))}

          {/* Message */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Message
            </div>
            <div style={{
              background: C.light, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '16px',
              fontSize: 14, color: '#374151', lineHeight: 1.8,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word'
            }}>
              {inquiry.message}
            </div>
          </div>

          {/* Reply button */}
          <a
            href={`mailto:${inquiry.email}?subject=Re: Your enquiry to Sri Maheshwari Engineering Enterprises`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 20, padding: '12px',
              background: 'linear-gradient(135deg,#14B8A6,#0E9488)',
              borderRadius: 10, color: 'white', textDecoration: 'none',
              fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
              boxShadow: '0 4px 14px rgba(20,184,166,0.3)', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Reply via Email
          </a>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  STAT CARD
// ══════════════════════════════════════════════════════════════
function StatCard({ label, value, icon, color, bg, loading }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '18px 20px',
      border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: '0 2px 8px rgba(11,31,58,0.05)', transition: 'box-shadow 0.2s'
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(11,31,58,0.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(11,31,58,0.05)'}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 12, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
      }}>{icon}</div>
      <div>
        <div style={{
          fontFamily: 'Playfair Display, serif', fontSize: 28,
          fontWeight: 800, color, lineHeight: 1
        }}>
          {loading ? <div style={{ width: 50, height: 24, background: '#E5E7EB', borderRadius: 6 }} /> : (value ?? '—')}
        </div>
        <div style={{ color: C.gray, fontSize: 12, fontWeight: 500, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN InquiriesPage
// ══════════════════════════════════════════════════════════════
export default function InquiriesPage() {
  const [inquiries, setInquiries]     = useState([]);
  const [stats, setStats]             = useState({});
  const [pagination, setPagination]   = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading]         = useState(true);
  const [statsLoad, setStatsLoad]     = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');
  const [search, setSearch]           = useState('');
  const [sort, setSort]               = useState('newest');
  const [selected, setSelected]       = useState([]);           // selected row ids
  const [activeInquiry, setActiveInquiry] = useState(null);    // detail drawer
  const [confirmIds, setConfirmIds]   = useState(null);        // bulk delete confirm
  const [toast, setToast]             = useState(null);
  const [page, setPage]               = useState(1);
  const searchRef                     = useRef(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // ── Fetch stats ────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/inquiries/stats');
      if (data.success) setStats(data.stats);
    } catch (_) {} finally { setStatsLoad(false); }
  }, []);

  // ── Fetch list ─────────────────────────────────────────────
  const fetchInquiries = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/inquiries', {
        params: { page: pg, limit: 20, status: activeStatus, search, sort }
      });
      if (data.success) {
        setInquiries(data.inquiries);
        setPagination(data.pagination);
        setSelected([]);
      }
    } catch (_) {} finally { setLoading(false); }
  }, [activeStatus, search, sort]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { setPage(1); fetchInquiries(1); }, [activeStatus, search, sort]);
  useEffect(() => { fetchInquiries(page); }, [page]);

  // ── Debounced search ───────────────────────────────────────
  const searchTimeout = useRef(null);
  const handleSearchChange = (val) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 400);
  };

  // ── Toggle select ──────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleSelectAll = () =>
    setSelected(prev =>
      prev.length === inquiries.length ? [] : inquiries.map(i => i.id)
    );

  // ── Open detail (auto-marks read) ─────────────────────────
  const openDetail = async (inquiry) => {
    if (!inquiry.is_read) {
      // Optimistic update
      setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, is_read: 1 } : i));
      setStats(prev => ({ ...prev, unread: Math.max(0, (prev.unread || 0) - 1) }));
      await api.put(`/api/admin/inquiries/${inquiry.id}/read`, { is_read: 1 }).catch(() => {});
    }
    const { data } = await api.get(`/api/admin/inquiries/${inquiry.id}`);
    if (data.success) setActiveInquiry(data.inquiry);
  };

  // ── Star toggle ────────────────────────────────────────────
  const handleStar = async (inquiry) => {
    const { data } = await api.put(`/api/admin/inquiries/${inquiry.id}/star`);
    if (data.success) {
      const update = (i) => i.id === inquiry.id ? { ...i, is_starred: data.is_starred } : i;
      setInquiries(prev => prev.map(update));
      if (activeInquiry?.id === inquiry.id) setActiveInquiry(prev => ({ ...prev, is_starred: data.is_starred }));
      fetchStats();
    }
  };

  // ── Toggle read ────────────────────────────────────────────
  const handleToggleRead = async (inquiry) => {
    const newVal = inquiry.is_read ? 0 : 1;
    await api.put(`/api/admin/inquiries/${inquiry.id}/read`, { is_read: newVal });
    const update = (i) => i.id === inquiry.id ? { ...i, is_read: newVal } : i;
    setInquiries(prev => prev.map(update));
    if (activeInquiry?.id === inquiry.id) setActiveInquiry(prev => ({ ...prev, is_read: newVal }));
    fetchStats();
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = (ids) => setConfirmIds(ids);

  const confirmDelete = async () => {
    const ids = confirmIds;
    setConfirmIds(null);
    if (ids.length === 1) {
      await api.delete(`/api/admin/inquiries/${ids[0]}`);
    } else {
      await api.delete('/api/admin/inquiries/bulk/delete', { data: { ids } });
    }
    setInquiries(prev => prev.filter(i => !ids.includes(i.id)));
    if (activeInquiry && ids.includes(activeInquiry.id)) setActiveInquiry(null);
    setSelected([]);
    fetchStats();
    showToast(`${ids.length} inquiry/inquiries moved to trash.`);
  };

  // ── Export CSV ─────────────────────────────────────────────
  const handleExport = () => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/inquiries/export`;
    window.open(url, '_blank');
  };

  // ── Sidebar filters ────────────────────────────────────────
  const SIDEBAR_ITEMS = [
    { key: 'all',     label: 'All Inquiries', icon: '📋' },
    { key: 'unread',  label: 'Unread',        icon: '📬', badge: stats.unread },
    { key: 'read',    label: 'Read',          icon: '📭' },
    { key: 'starred', label: 'Starred',       icon: '⭐', badge: stats.starred },
    { key: 'deleted', label: 'Trash',         icon: '🗑️' },
  ];

  const STAT_CARDS = [
    { key: 'total',   label: 'Total',   icon: '📋', color: C.midnight, bg: 'rgba(11,31,58,0.07)' },
    { key: 'unread',  label: 'Unread',  icon: '📬', color: C.teal,     bg: C.tealLight },
    { key: 'starred', label: 'Starred', icon: '⭐', color: '#F59E0B',  bg: 'rgba(245,158,11,0.1)' },
    { key: 'today',   label: 'Today',   icon: '📅', color: '#6366F1',  bg: 'rgba(99,102,241,0.1)' },
  ];

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif', height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, color: C.midnight, margin: 0 }}>
              Inquiries
            </h1>
            <p style={{ color: C.gray, fontSize: 13, margin: '4px 0 0' }}>
              Manage all contact form submissions from your website.
            </p>
          </div>
          {/* Export */}
          <button onClick={handleExport} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 10,
            background: 'white', border: `1px solid ${C.border}`,
            color: C.midnight, fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(11,31,58,0.06)', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(11,31,58,0.1)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(11,31,58,0.06)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {STAT_CARDS.map(s => (
          <StatCard key={s.key} label={s.label} value={stats[s.key] ?? 0}
            icon={s.icon} color={s.color} bg={s.bg} loading={statsLoad} />
        ))}
      </div>

      {/* ── Main panel: sidebar + table + drawer ── */}
      <div style={{
        display: 'flex', background: 'white', borderRadius: 16,
        border: `1px solid ${C.border}`, overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(11,31,58,0.06)', flex: 1, minHeight: 0
      }}>

        {/* Sidebar */}
        <div style={{
          width: 200, flexShrink: 0, borderRight: `1px solid ${C.border}`,
          padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', marginBottom: 4 }}>
            Filter
          </div>
          {SIDEBAR_ITEMS.map(item => {
            const isActive = activeStatus === item.key;
            return (
              <button key={item.key} onClick={() => { setActiveStatus(item.key); setPage(1); }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 9,
                background: isActive ? C.tealLight : 'transparent',
                border: 'none', cursor: 'pointer',
                color: isActive ? C.teal : C.gray,
                fontFamily: 'Outfit, sans-serif', fontSize: 13,
                fontWeight: isActive ? 700 : 400, transition: 'all 0.15s'
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.light; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span style={{
                    background: isActive ? C.teal : '#EF4444', color: 'white',
                    borderRadius: 100, fontSize: 10, fontWeight: 700,
                    padding: '1px 7px', minWidth: 18, textAlign: 'center'
                  }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
            background: C.light, flexWrap: 'wrap'
          }}>
            {/* Search */}
            <div style={{ flex: 1, position: 'relative', minWidth: 180 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search name, email, company…"
                onChange={e => handleSearchChange(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 34px',
                  border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13,
                  fontFamily: 'Outfit, sans-serif', color: '#374151',
                  outline: 'none', background: 'white', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = C.teal}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8,
              fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#374151',
              outline: 'none', background: 'white', cursor: 'pointer'
            }}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
            </select>

            {/* Bulk delete */}
            {selected.length > 0 && (
              <button onClick={() => handleDelete(selected)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#EF4444', fontFamily: 'Outfit, sans-serif', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', animation: 'inqFadeIn 0.2s ease'
              }}>
                🗑️ Delete ({selected.length})
              </button>
            )}

            <div style={{ marginLeft: 'auto', fontSize: 12, color: C.gray, whiteSpace: 'nowrap' }}>
              {pagination.total} result{pagination.total !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: C.gray }}>
                <div style={{ width: 36, height: 36, margin: '0 auto 14px', border: '3px solid rgba(20,184,166,0.2)', borderTopColor: C.teal, borderRadius: '50%', animation: 'inqSpin 0.8s linear infinite' }} />
                Loading inquiries…
              </div>
            ) : inquiries.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: C.gray }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>📭</div>
                <div style={{ fontWeight: 600, color: C.midnight, marginBottom: 6 }}>No inquiries found</div>
                <div style={{ fontSize: 13 }}>
                  {search ? 'Try a different search term.' : 'Nothing in this category yet.'}
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.light, borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ width: 40, padding: '10px 12px', textAlign: 'center' }}>
                      <input type="checkbox" checked={selected.length === inquiries.length && inquiries.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer', accentColor: C.teal, width: 15, height: 15 }} />
                    </th>
                    <th style={thStyle}>Sender</th>
                    <th style={thStyle}>Company</th>
                    <th style={{ ...thStyle, display: 'none' }} className="inq-col-msg">Message</th>
                    <th style={thStyle}>Received</th>
                    <th style={{ ...thStyle, width: 80, textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq, idx) => {
                    const isSelected = selected.includes(inq.id);
                    const isOpen     = activeInquiry?.id === inq.id;
                    return (
                      <tr key={inq.id}
                        onClick={() => openDetail(inq)}
                        style={{
                          borderBottom: `1px solid ${C.border}`,
                          background: isOpen ? 'rgba(20,184,166,0.05)'
                            : isSelected ? 'rgba(20,184,166,0.04)'
                            : idx % 2 === 0 ? 'white' : '#FCFCFD',
                          cursor: 'pointer', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(11,31,58,0.02)'; }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = isOpen ? 'rgba(20,184,166,0.05)'
                            : isSelected ? 'rgba(20,184,166,0.04)'
                            : idx % 2 === 0 ? 'white' : '#FCFCFD';
                        }}
                      >
                        <td style={{ padding: '10px 12px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected}
                            onChange={() => toggleSelect(inq.id)}
                            style={{ cursor: 'pointer', accentColor: C.teal, width: 15, height: 15 }} />
                        </td>
                        <td style={{ padding: '11px 14px', minWidth: 160 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Avatar */}
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                              background: inq.is_read ? '#E5E7EB' : 'linear-gradient(135deg,#14B8A6,#0E9488)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13, fontWeight: 700,
                              color: inq.is_read ? '#9CA3AF' : 'white'
                            }}>
                              {(inq.name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{
                                fontSize: 13, fontWeight: inq.is_read ? 400 : 700,
                                color: C.midnight, lineHeight: 1.3
                              }}>{inq.name}</div>
                              <div style={{ fontSize: 11, color: C.gray }}>{inq.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: C.gray }}>
                          {inq.company_name || '—'}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.5 }}>
                            {timeAgo(inq.created_at)}
                          </div>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                            {fmtDate(inq.created_at)}
                          </div>
                        </td>
                        <td style={{ padding: '11px 14px', textAlign: 'center' }}
                          onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            {/* Star */}
                            <button onClick={() => handleStar(inq)} style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: 16, lineHeight: 1, opacity: inq.is_starred ? 1 : 0.3,
                              transition: 'opacity 0.2s'
                            }}
                              onMouseEnter={e => e.currentTarget.style.opacity = 1}
                              onMouseLeave={e => e.currentTarget.style.opacity = inq.is_starred ? 1 : 0.3}
                            >⭐</button>
                            {/* Unread dot */}
                            {!inq.is_read && (
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, flexShrink: 0 }} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{
              padding: '12px 16px', borderTop: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: C.light, flexWrap: 'wrap', gap: 10
            }}>
              <div style={{ fontSize: 12, color: C.gray }}>
                Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { label: '←', action: () => setPage(p => p - 1), disabled: !pagination.hasPrev },
                  ...Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pg = Math.max(1, Math.min(page - 2, pagination.totalPages - 4)) + i;
                    return { label: pg, action: () => setPage(pg), active: pg === page };
                  }),
                  { label: '→', action: () => setPage(p => p + 1), disabled: !pagination.hasNext },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} disabled={btn.disabled} style={{
                    width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`,
                    background: btn.active ? C.teal : btn.disabled ? '#F9FAFB' : 'white',
                    color: btn.active ? 'white' : btn.disabled ? '#9CA3AF' : C.midnight,
                    fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: btn.active ? 700 : 400,
                    cursor: btn.disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
                  }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detail drawer */}
        {activeInquiry && (
          <DetailDrawer
            inquiry={activeInquiry}
            onClose={() => setActiveInquiry(null)}
            onStar={handleStar}
            onToggleRead={handleToggleRead}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Confirm dialog */}
      {confirmIds && (
        <ConfirmDialog count={confirmIds.length} onConfirm={confirmDelete} onCancel={() => setConfirmIds(null)} />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes inqToast  { from { opacity:0; transform:translateY(10px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes inqPopIn  { from { opacity:0; transform:scale(0.88); } to { opacity:1; transform:scale(1); } }
        @keyframes inqSlideIn{ from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes inqFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes inqSpin   { to   { transform:rotate(360deg); } }
        @media(max-width:900px){
          div[style*="gridTemplateColumns: 'repeat(4,1fr)'"]{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>
    </div>
  );
}

const thStyle = {
  padding: '10px 14px', textAlign: 'left',
  fontSize: 11, fontWeight: 700, color: '#9CA3AF',
  letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap'
};

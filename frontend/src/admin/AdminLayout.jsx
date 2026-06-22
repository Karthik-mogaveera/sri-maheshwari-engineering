import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const NAV_ITEMS = [
  { path: '/admin/dashboard',  label: 'Dashboard',   icon: '⊞' },
  /*{ path: '/admin/projects',   label: 'Projects',    icon: '🏗️' },
  { path: '/admin/services',   label: 'Services',    icon: '⚡' },*/
  { path: '/admin/inquiries',  label: 'Inquiries',   icon: '✉️' },
  { path: '/admin/settings',   label: 'Settings',    icon: '⚙️' },
];

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut]   = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/admin', { replace: true });
  };

  const SidebarContent = () => (
    <div style={{
      width: '240px', minHeight: '100vh',
      background: 'linear-gradient(180deg, #060F1D 0%, #0B1F3A 100%)',
      borderRight: '1px solid rgba(20,184,166,0.12)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Brand */}
      <div style={{
        padding: '28px 24px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #14B8A6, #0E9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 800, color: 'white',
            fontFamily: 'Playfair Display, serif', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(20,184,166,0.3)'
          }}>S</div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '14px', lineHeight: 1.2, fontFamily: 'Playfair Display, serif' }}>
              SMEE Admin
            </div>
            <div style={{ color: '#14B8A6', fontSize: '11px', letterSpacing: '0.08em', marginTop: '2px' }}>
              Control Panel
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '20px 12px', flex: 1 }}>
        <p style={{
          color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          padding: '0 12px', marginBottom: '10px'
        }}>Navigation</p>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 12px', borderRadius: '10px',
                marginBottom: '4px', textDecoration: 'none',
                background: active ? 'rgba(20,184,166,0.15)' : 'transparent',
                border: active ? '1px solid rgba(20,184,166,0.25)' : '1px solid transparent',
                color: active ? '#14B8A6' : 'rgba(255,255,255,0.55)',
                fontSize: '14px', fontWeight: active ? 600 : 400,
                transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif'
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                }
              }}
            >
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {active && (
                <div style={{
                  marginLeft: 'auto', width: '6px', height: '6px',
                  borderRadius: '50%', background: '#14B8A6'
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)',
          marginBottom: '10px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #14B8A6, #0E9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '15px', flexShrink: 0
          }}>
            {admin?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {admin?.name || 'Admin'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {admin?.role || 'admin'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: '100%', padding: '10px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', cursor: 'pointer',
            color: '#FCA5A5', fontFamily: 'Outfit, sans-serif',
            fontSize: '13px', fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
        >
          {loggingOut ? '…' : '⏻'} {loggingOut ? 'Signing out' : 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#F0F4F8', fontFamily: 'Outfit, sans-serif'
    }}>
      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 200, backdropFilter: 'blur(2px)'
          }}
        />
      )}
      <div style={{
        position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-260px',
        zIndex: 201, transition: 'left 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'none'
      }} className="admin-sidebar-mobile">
        <SidebarContent />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: '64px', background: 'white',
          borderBottom: '1px solid rgba(11,31,58,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', flexShrink: 0,
          boxShadow: '0 1px 8px rgba(11,31,58,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Hamburger for mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-hamburger"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px', display: 'none', color: '#0B1F3A'
              }}
            >
              <div style={{ width: '22px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[0,1,2].map(i => <span key={i} style={{ display: 'block', height: '2px', background: '#0B1F3A', borderRadius: '1px' }} />)}
              </div>
            </button>
            <div>
              <h2 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(16px, 2vw, 20px)',
                fontWeight: 700, color: '#0B1F3A', margin: 0
              }}>
                {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'Admin Panel'}
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/"
              target="_blank"
              style={{
                background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)',
                borderRadius: '8px', padding: '7px 14px',
                color: '#14B8A6', textDecoration: 'none',
                fontSize: '13px', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              🌐 View Site
            </Link>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #14B8A6, #0E9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '15px', cursor: 'pointer'
            }}>
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 'clamp(20px,3vw,32px)' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .admin-sidebar-mobile { display: none !important; }
        }
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-sidebar-mobile { display: block !important; }
          .admin-hamburger { display: block !important; }
        }
      `}</style>
    </div>
  );
}

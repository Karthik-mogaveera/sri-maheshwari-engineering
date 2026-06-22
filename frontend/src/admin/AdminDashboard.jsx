import { useState } from 'react';
import SlideshowSection from './sections/SlideshowSection';
import WhoWeAreSection from './sections/WhoWeAreSection ';
import ServicesSection from './sections/ServicesSection';
import ClientsSection   from './sections/ClientsSection';
import AboutSection     from './sections/AboutSection';
import ProjectsSection     from './sections/ProjectsSection';



// ── Colour tokens (matching site palette) ────────────────────
const C = {
  midnight: '#0B1F3A',
  teal:     '#14B8A6',
  tealDark: '#0E9488',
  offwhite: '#FAFAFA',
  gray:     '#374151',
};

// ── Dashboard menu items ──────────────────────────────────────
const MENU = [
  {
    id:    'slideshow',
    label: 'Slideshow',
    icon:  SlideIcon,
    // desc:  'Manage hero banner slides — add, edit or remove images & text.',
    color: '#6366F1',
    bg:    'rgba(99,102,241,0.08)',
    border:'rgba(99,102,241,0.2)',
  },
  {
    id:    'whoweare',
    label: 'Who We Are',
    icon:  AboutIcon,
    // desc:  'Edit the company introduction, taglines and about section.',
    color: C.teal,
    bg:    'rgba(20,184,166,0.08)',
    border:'rgba(20,184,166,0.2)',
  },
  {
    id:    'services',
    label: 'Services',
    icon:  ServiceIcon,
    // desc:  'Add, update or remove the services listed on the website.',
    color: '#F59E0B',
    bg:    'rgba(245,158,11,0.08)',
    border:'rgba(245,158,11,0.2)',
  },
  {
    id:    'clients',
    label: 'Clients',
    icon:  ClientIcon,
    // desc:  'Manage the clients & partners displayed on the homepage.',
    color: '#10B981',
    bg:    'rgba(16,185,129,0.08)',
    border:'rgba(16,185,129,0.2)',
  },{
    id:    'about',
    label: 'About',
    icon:  AboutPageIcon,
    // desc:  'Manage people, company info and performance data.',
    color: '#8B5CF6',
    bg:    'rgba(139,92,246,0.08)',
    border:'rgba(139,92,246,0.2)',
  },
  {
    id:    'projects',
    label: 'Projects',
    icon:  ProjectsIcon,
    // desc:  'Add and manage completed or ongoing projects.',
    color: '#EC4899',
    bg:    'rgba(236,72,153,0.08)',
    border:'rgba(236,72,153,0.2)',
  },
  {
    id:    'gallery',
    label: 'Gallery',
    icon:  GalleryIcon,
    // desc:  'Upload and organise the photo gallery.',
    color: '#F97316',
    bg:    'rgba(249,115,22,0.08)',
    border:'rgba(249,115,22,0.2)',
  },
];

// ── SVG Icons ─────────────────────────────────────────────────
function SlideIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M8 5V3M16 5V3M2 10h20"/>
      <circle cx="12" cy="15" r="1" fill={color}/>
      <path d="M9 15h-1M16 15h-1"/>
    </svg>
  );
}
function AboutIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      <path d="M17 11l1.5 1.5L21 10"/>
    </svg>
  );
}
function ServiceIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
    </svg>
  );
}
function ClientIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2"/>
      <path d="M3 10h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
      <circle cx="9" cy="14" r="1.5" fill={color} stroke="none"/>
      <path d="M13 14h4"/>
    </svg>
  );
}

function AboutPageIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4"/>
      <path d="M5.5 20a7 7 0 0 1 13 0"/>
      <path d="M15 10l2 2 4-4" strokeWidth="2"/>
    </svg>
  );
}
function ProjectsIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5"/>
      <rect x="13" y="3" width="8" height="8" rx="1.5"/>
      <rect x="3" y="13" width="8" height="8" rx="1.5"/>
      <path d="M13 17h8M17 13v8"/>
    </svg>
  );
}
function GalleryIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill={color} stroke="none"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
  );
}

// ── Coming Soon placeholder ───────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div style={{
      marginTop: '24px',
      background: 'white', borderRadius: '16px',
      border: '1px solid rgba(11,31,58,0.08)',
      padding: '52px', textAlign: 'center',
      boxShadow: '0 2px 12px rgba(11,31,58,0.05)'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '14px' }}>🚧</div>
      <h3 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '20px', color: C.midnight, marginBottom: '8px'
      }}>{label} — Coming Soon</h3>
      <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
        This section is under development and will be available shortly.
      </p>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState(null);

  const handleCardClick = (id) => {
    setActiveSection(prev => (prev === id ? null : id));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'slideshow': return <SlideshowSection />;
      case 'whoweare':  return <WhoWeAreSection />;
      case 'services':  return <ServicesSection/>;
      case 'clients':   return <ClientsSection />;
      case 'about':     return <AboutSection />;
      case 'projects':  return <ProjectsSection />;
      case 'gallery':   return <ComingSoon label="Gallery" />;
      default:          return null;
    }
  };

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(22px,3vw,30px)',
          fontWeight: 700, color: C.midnight, marginBottom: '6px'
        }}>
          Content Dashboard
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>
          Select a section below to manage the website content.
        </p>
      </div>

      {/* Menu cards — 4 in a row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '18px',
        marginBottom: '8px'
      }}>
        {MENU.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              style={{
                background: isActive ? item.bg : 'white',
                border: `2px solid ${isActive ? item.color : 'rgba(11,31,58,0.07)'}`,
                borderRadius: '18px',
                padding: '28px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: isActive
                  ? `0 8px 32px ${item.color}22`
                  : '0 2px 10px rgba(11,31,58,0.06)',
                transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 28px ${item.color}18`;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'rgba(11,31,58,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(11,31,58,0.06)';
                }
              }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: '14px', right: '14px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 6px ${item.color}`
                }} />
              )}

              {/* Icon circle */}
              <div style={{
                width: '60px', height: '60px', borderRadius: '16px',
                background: isActive ? `${item.color}22` : `${item.color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                transition: 'background 0.2s',
                border: `1px solid ${item.color}30`
              }}>
                <Icon color={item.color} />
              </div>

              <div style={{
                fontWeight: 700, fontSize: '15px',
                color: isActive ? item.color : C.midnight,
                marginBottom: '6px', transition: 'color 0.2s',
                fontFamily: 'Playfair Display, serif'
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: '12px', color: '#9CA3AF', lineHeight: 1.5
              }}>
                {item.desc}
              </div>

              {/* Bottom indicator bar */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '3px', borderRadius: '0 0 16px 16px',
                background: isActive
                  ? `linear-gradient(90deg, ${item.color}, ${item.color}88)`
                  : 'transparent',
                transition: 'background 0.3s'
              }} />
            </button>
          );
        })}
      </div>

      {/* Arrow pointing to the active section */}
      {activeSection && (() => {
        const idx  = MENU.findIndex(m => m.id === activeSection);
        const item = MENU[idx];
        // Calculate left offset: card is idx/4 of total width
        const leftPct = (idx / 7) * 100 + 7.25; // center of that card
        return (
          <div style={{ position: 'relative', height: '20px', margin: '0 0 4px' }}>
            <div style={{
              position: 'absolute',
              left: `${leftPct}%`,
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: `12px solid ${item.color}`,
              transition: 'left 0.3s'
            }} />
          </div>
        );
      })()}

      {/* Dynamic section panel */}
      {renderSection()}

      <style>{`
        @media(max-width:900px){
          div[style*="repeat(4, 1fr)"]{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:500px){
          div[style*="repeat(4, 1fr)"]{grid-template-columns:repeat(1,1fr)!important}
        }
      `}</style>
    </div>
  );
}

// src/components/Header.jsx
// ─────────────────────────────────────────────────────────────
// Shared header — import and use on every page.
// Handles: sticky scroll effect, desktop nav, mobile hamburger menu.
//
// Nav items map directly to dedicated pages:
//   Home     -> /
//   Services -> /services
//   About    -> /about
//   Projects -> /projects
//   Contact  -> scrolls to the footer's #contact section
//               (navigates home first if on another page)
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Single source of truth: label -> route
const NAV_ITEMS = [
  { label: 'Home',     path: '/'         },
  { label: 'Services', path: '/services' },
  { label: 'About',    path: '/about'    },
  { label: 'Projects', path: '/projects' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logo, setLogo] = useState(null)
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
  const fetchLogo = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/settings/information/public`
      )

      if (res.data.success) {
        setLogo(res.data.data?.logo_url || null)
      }
    } catch (err) {
      console.error('Failed to load logo', err)
    }
  }

  fetchLogo()
}, [])

  // Close mobile menu when route changes
  useEffect(() => { setMenuOpen(false) }, [location])

  // Navigate to a dedicated page, scrolling to top
  const goToPage = (path) => {
    setMenuOpen(false)
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // "Contact" scrolls to the #contact section (in the footer).
  // If we're not on the home page, go home first, then scroll.
  const goToContact = () => {
  setMenuOpen(false)
  navigate('/contact')
  window.scrollTo({ top: 0, behavior: 'instant' })
}

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled
        ? 'rgba(11,31,58,0.97)'
        : 'linear-gradient(180deg, rgba(11,31,58,0.95) 0%, rgba(11,31,58,0.7) 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid rgba(20,184,166,0.2)' : 'none',
      transition: 'all 0.4s ease',
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px, 3vw, 24px)' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: 'clamp(64px, 8vw, 76px)'
        }}>

          {/* ── Logo + Name ── */}
          <button
            onClick={() => goToPage('/')}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 'clamp(10px, 2vw, 14px)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0
            }}
          >
            <div
              style={{
                width: 'clamp(38px, 5vw, 46px)',
                height: 'clamp(38px, 5vw, 46px)',
                borderRadius: '45px',
                overflow: 'hidden',
                background: '#14B8A6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(20,184,166,0.4)',
                flexShrink: 0
              }}
            >
              {logo ? (
                <img
                  src={logo}
                  alt="Company Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 'clamp(18px, 2.5vw, 22px)',
                    fontWeight: 800,
                    color: '#14B8A6',
                    fontFamily: 'var(--font-display)'
                  }}
                >
                  S
                </span>
              )}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'clamp(12px, 2vw, 18px)',
                color: '#14B8A6', lineHeight: 1.2, letterSpacing: '0.01em'
              }}>
                Sri Maheshwari
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'clamp(12px, 2vw, 18px)',
                color: '#14B8A6', lineHeight: 1.2, letterSpacing: '0.01em'
              }}>Engineering Enterprises</div>
            </div>
          </button>

          {/* ── Desktop Nav ── */}
          <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="smee-desktop-nav">
            {NAV_ITEMS.map(({ label, path }) => {
              const isActive = location.pathname === path
              return (
                <button
                  key={label}
                  onClick={() => goToPage(path)}
                  className="nav-link"
                  style={{
                    background: isActive ? 'rgba(20,184,166,0.1)' : 'none',
                    border: 'none', cursor: 'pointer',
                    color: isActive ? '#14B8A6' : 'rgba(255,255,255,0.88)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(13px, 1.2vw, 14px)',
                    fontWeight: isActive ? 600 : 500,
                    padding: '8px clamp(10px, 1.5vw, 16px)',
                    borderRadius: '6px', letterSpacing: '0.03em', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#14B8A6'
                    e.currentTarget.style.background = 'rgba(20,184,166,0.08)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = isActive ? '#14B8A6' : 'rgba(255,255,255,0.88)'
                    e.currentTarget.style.background = isActive ? 'rgba(20,184,166,0.1)' : 'none'
                  }}
                >{label}</button>
              )
            })}
            <button
              onClick={goToContact}
              className="btn-primary"
              style={{
                padding: 'clamp(7px,1vw,9px) clamp(14px,1.8vw,22px)',
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: 'clamp(12px, 1.1vw, 14px)', marginLeft: '8px'
              }}
            >Get Quote</button>
          </nav>

          {/* ── Hamburger (mobile) ── */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'white', padding: '8px', display: 'none'
            }}
            className="smee-hamburger"
          >
            <div style={{ width: '24px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{
                display: 'block', height: '2px', borderRadius: '1px',
                background: menuOpen ? '#14B8A6' : 'white', transition: 'all 0.3s',
                transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
              }} />
              <span style={{
                display: 'block', height: '2px', borderRadius: '1px',
                background: '#14B8A6', transition: 'all 0.3s',
                opacity: menuOpen ? 0 : 1
              }} />
              <span style={{
                display: 'block', height: '2px', borderRadius: '1px',
                background: menuOpen ? '#14B8A6' : 'white', transition: 'all 0.3s',
                transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
              }} />
            </div>
          </button>
        </div>

        {/* ── Mobile dropdown menu ── */}
        <div className={`mobile-menu ${menuOpen ? 'open' : 'closed'}`}>
          <div style={{
            paddingBottom: '16px', display: 'flex',
            flexDirection: 'column', gap: '2px'
          }}>
            {NAV_ITEMS.map(({ label, path }) => {
              const isActive = location.pathname === path
              return (
                <button
                  key={label}
                  onClick={() => goToPage(path)}
                  style={{
                    background: isActive ? 'rgba(20,184,166,0.08)' : 'none',
                    border: 'none', cursor: 'pointer',
                    color: isActive ? '#14B8A6' : 'rgba(255,255,255,0.85)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px', fontWeight: isActive ? 600 : 500,
                    padding: '12px 16px', textAlign: 'left',
                    borderRadius: '8px', letterSpacing: '0.03em',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    transition: 'color 0.2s, background 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#14B8A6'
                    e.currentTarget.style.background = 'rgba(20,184,166,0.06)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = isActive ? '#14B8A6' : 'rgba(255,255,255,0.85)'
                    e.currentTarget.style.background = isActive ? 'rgba(20,184,166,0.08)' : 'none'
                  }}
                >{label}</button>
              )
            })}
            <button
              onClick={goToContact}
              className="btn-primary"
              style={{
                margin: '8px 16px 0', padding: '12px', borderRadius: '8px',
                border: 'none', cursor: 'pointer', fontSize: '14px'
              }}
            >Get Quote</button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .smee-desktop-nav { display: none !important; }
          .smee-hamburger    { display: block !important; }
        }
      `}</style>
    </header>
  )
}
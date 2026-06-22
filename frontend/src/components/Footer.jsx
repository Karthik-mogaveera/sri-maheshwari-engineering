// src/components/Footer.jsx
// ─────────────────────────────────────────────────────────────
// Shared footer — import and use on every page.
// ─────────────────────────────────────────────────────────────
import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = ['Home', 'Services', 'About', 'Projects', 'Contact']

const CONTACT_INFO = [
  { icon: '📍', label: '12, 3rd Cross, 1st Main, RMV 2nd Stage, Nageshettyhalli, Bengaluru – 560094' },
  { icon: '📞', label: '+91 80 XXXX XXXX' },
  { icon: '✉️', label: 'info@smeeindia.com' },
]

const SOCIAL = ['in', 'tw', 'fb']

export default function Footer() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const scrollTo = (id) => {
  if (id === 'Services') {
    navigate('/services')
    return
  }
  if (id === 'About') {
    navigate('/about')
    return
  }

  if (id === 'Projects') {
    navigate('/projects')
    return
  }
  if (id === 'Contact') {
    navigate('/contact')
    return
  }

  if (window.location.pathname !== '/') {
    navigate('/')

    setTimeout(() => {
      const el = document.getElementById(id.toLowerCase())
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)

    return
  }

  const el = document.getElementById(id.toLowerCase())

  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

  return (
    <footer id="contact" className="footer-bg" style={{ color: 'white' }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: 'clamp(40px,6vw,80px) clamp(16px,3vw,24px) 32px'
      }}>

        {/* ── Three-column grid ── */}
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 'clamp(28px,4vw,48px)',
          marginBottom: '48px'
        }}>

          {/* Brand column */}
          <div>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center',
                gap: '14px', marginBottom: '20px',
                background: 'none', border: 'none',
                cursor: 'pointer', padding: 0
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                background: 'linear-gradient(135deg, #14B8A6, #0E9488)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: 800, color: 'white',
                fontFamily: 'var(--font-display)'
              }}>S</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '17px', lineHeight: 1.2, color: 'white'
                }}>Sri Maheshwari Engineering</div>
                <div style={{ fontSize: '12px', color: '#14B8A6', letterSpacing: '0.1em' }}>
                  Enterprises
                </div>
              </div>
            </button>

            <p style={{
              color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(13px,1.4vw,14px)',
              lineHeight: 1.8, marginBottom: '24px', maxWidth: '360px'
            }}>
              A Super Grade Electrical Contractor executing EPC projects in power,
              solar, irrigation, and industrial sectors since 2008. Authorized by
              Chief Electrical Inspectorate, Govt. of Karnataka.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {SOCIAL.map(s => (
                <div key={s} style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(20,184,166,0.2)'
                    e.currentTarget.style.color = '#14B8A6'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                  }}
                >{s}</div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-display)', fontSize: '16px',
              fontWeight: 600, marginBottom: '20px', color: 'white'
            }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {NAV_ITEMS.map(item => (
                <button key={item} onClick={() => scrollTo(item)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.55)', fontSize: '14px',
                  fontFamily: 'var(--font-body)', textAlign: 'left',
                  padding: 0, transition: 'color 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#14B8A6'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                >{item}</button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-display)', fontSize: '16px',
              fontWeight: 600, marginBottom: '20px', color: 'white'
            }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {CONTACT_INFO.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', marginTop: '2px', flexShrink: 0 }}>{c.icon}</span>
                  <span style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 'clamp(12px,1.3vw,13px)', lineHeight: 1.7
                  }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '10px'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 'clamp(11px,1.2vw,13px)' }}>
            © {new Date().getFullYear()} Sri Maheshwari Engineering Enterprises. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 'clamp(10px,1.1vw,12px)' }}>
            Established 2008 · Bengaluru, Karnataka, India
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (min-width: 480px) and (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  )
}

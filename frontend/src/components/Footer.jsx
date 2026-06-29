// src/components/Footer.jsx
// ─────────────────────────────────────────────────────────────
// Shared footer — fetches contact info and social media from DB.
// ─────────────────────────────────────────────────────────────
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const NAV_ITEMS = ['Home', 'Services', 'About', 'Projects', 'Contact']

// ── Social icon SVG map ────────────────────────────────────────
function SocialIcon({ name, size = 18, color = 'currentColor' }) {
  const n = name?.toLowerCase()
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
  }
  return icons[n] || (
    <span style={{ fontSize: size * 0.65, fontWeight: 800, color, lineHeight: 1 }}>
      {(name || '?').slice(0, 2).toUpperCase()}
    </span>
  )
}

export default function Footer() {
  const navigate = useNavigate()
  const [info, setInfo]       = useState(null)
  const [socials, setSocials] = useState([])
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    // Fetch contact information
    fetch(`${BASE_URL}/api/admin/settings/information/public`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setInfo(d.data) })
      .catch(() => {})

    // Fetch social media links
    fetch(`${BASE_URL}/api/admin/settings/social-media/public`)
      .then(r => r.json())
      .then(d => { if (d.success) setSocials(d.data || []) })
      .catch(() => {})
  }, [])
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/admin/settings/information/public`
        )

        if (res.data.success) {
          setSettings(res.data.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchSettings()
  }, [])

  const scrollTo = (id) => {
    if (id === 'Services') { navigate('/services'); return }
    if (id === 'About')    { navigate('/about');    return }
    if (id === 'Projects') { navigate('/projects'); return }
    if (id === 'Contact')  { navigate('/contact');  return }
    if (window.location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id.toLowerCase())
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return
    }
    const el = document.getElementById(id.toLowerCase())
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // ── Contact rows — built from live DB data ─────────────────
  const contactItems = []

  if (info?.phone) {
    contactItems.push({
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1 3.18 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.61 5.61l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      label: info.phone,
      href: `tel:${info.phone.replace(/\s+/g, '')}`,
      title: 'Call us'
    })
  }

  if (info?.email) {
    contactItems.push({
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: info.email,
      href: `mailto:${info.email}`,
      title: 'Email us'
    })
  }

  if (info?.address) {
    contactItems.push({
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: info.address,
      href: info.map_url || null,
      title: info.map_url ? 'View on map' : null
    })
  }

  // Fallback contact items when DB has no data yet
  const fallbackItems = [
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: '12, 3rd Cross, 1st Main, RMV 2nd Stage, Nageshettyhalli, Bengaluru – 560094',
      href: null
    },
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1 3.18 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.61 5.61l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      label: '+91 80 XXXX XXXX',
      href: 'tel:+918000000000'
    },
    {
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: 'info@smeeindia.com',
      href: 'mailto:info@smeeindia.com'
    },
  ]

  const displayItems = contactItems.length > 0 ? contactItems : fallbackItems

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
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '45px',
                  overflow: 'hidden',
                  background: '#14B8A6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {settings?.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt="Sri Maheshwari Engineering Enterprises"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: '22px',
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
                  fontSize: '17px', lineHeight: 1.2, color: 'white'
                }}>Sri Maheshwari</div>
                <div style={{ fontSize: '17px', color: '#14B8A6', letterSpacing: '0.1em' }}>
                  Engineering Enterprises
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

            {/* Dynamic social icons */}
            {socials.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {socials.map(s => (
                  <a
                    key={s.id}
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                    style={{
                      width: '38px', height: '38px', borderRadius: '9px',
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.6)',
                      textDecoration: 'none', transition: 'all 0.22s', flexShrink: 0
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(20,184,166,0.22)'
                      e.currentTarget.style.borderColor = 'rgba(20,184,166,0.5)'
                      e.currentTarget.style.color = '#14B8A6'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <SocialIcon name={s.icon} size={17} color="currentColor" />
                  </a>
                ))}
              </div>
            )}
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

          {/* Contact — live from DB */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-display)', fontSize: '16px',
              fontWeight: 600, marginBottom: '20px', color: 'white'
            }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displayItems.map((c, i) => {
                const inner = (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{
                      marginTop: '1px', flexShrink: 0,
                      color: c.href ? '#14B8A6' : 'rgba(255,255,255,0.45)',
                      transition: 'color 0.2s'
                    }}>
                      {c.icon}
                    </span>
                    <span style={{
                      color: c.href ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.55)',
                      fontSize: 'clamp(12px,1.3vw,13px)', lineHeight: 1.7,
                      transition: 'color 0.2s'
                    }}>
                      {c.label}
                    </span>
                  </div>
                )

                if (c.href) {
                  return (
                    <a
                      key={i}
                      href={c.href}
                      target={c.href.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      title={c.title || ''}
                      style={{ textDecoration: 'none', display: 'block' }}
                      onMouseEnter={e => {
                        const span = e.currentTarget.querySelectorAll('span')
                        span[0].style.color = '#14B8A6'
                        span[1].style.color = '#14B8A6'
                      }}
                      onMouseLeave={e => {
                        const span = e.currentTarget.querySelectorAll('span')
                        span[0].style.color = '#14B8A6'
                        span[1].style.color = 'rgba(255,255,255,0.75)'
                      }}
                    >
                      {inner}
                    </a>
                  )
                }
                return inner
              })}
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
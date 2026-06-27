// src/pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────
// Home page content only — Header and Footer come from Layout.
// All sections are fully responsive for mobile/tablet/desktop.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Fallback slides (shown while DB loads / if DB is empty) ──
const FALLBACK_SLIDES = [
  {
    image_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600&q=80',
    title: 'Electrical Substations & Transmission',
    subject: 'Up to 220 KV System Voltage'
  },
  {
    image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80',
    title: 'Solar Power Plants',
    subject: 'MW Scale — Design, Erection & Commissioning'
  },
  {
    image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80',
    title: 'Irrigation & Lift Irrigation Systems',
    subject: 'Large Scale EPC Contracts'
  },
  {
    image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600&q=80',
    title: 'Industrial Engineering',
    subject: 'India & International Experience'
  }
]

const STATS = [
  { label: 'EPC Projects Delivered', value: 50, suffix: '+' },
  { label: 'KV Max System Voltage', value: 220, suffix: '' },
  { label: 'MW Solar Capacity', value: 100, suffix: '+' },
]

// ══════════════════════════════════════════════════════════════
//  HERO SLIDER
// ══════════════════════════════════════════════════════════════
function HeroSlider() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES)
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const navigate  = useNavigate()

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/slideshow/public`)
      .then(({ data }) => {
        if (data.success && data.slides.length > 0) setSlides(data.slides)
      })
      .catch(() => { })
  }, [])

  const startTimer = (total) => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % total), 5000)
  }

  useEffect(() => {
    startTimer(slides.length)
    return () => clearInterval(timerRef.current)
  }, [slides])

  const goTo = (i) => { clearInterval(timerRef.current); setCurrent(i); startTimer(slides.length) }
  const active = slides[current] || slides[0]
  
  const goToService = () => {
  navigate('/services')
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const goToAbout = () => {
  navigate('about')
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

  return (
    <section id="home" style={{
      position: 'relative',
      height: '100vh', minHeight: '560px',
      overflow: 'hidden'
    }}>
      {/* Slide backgrounds */}
      {slides.map((slide, i) => (
        <div
          key={slide.id || i}
          className={`hero-slide ${i === current ? 'active' : ''}`}
          style={{
            backgroundImage: `url(${slide.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="hero-overlay" style={{ position: 'absolute', inset: 0 }} />
        </div>
      ))}

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        textAlign: 'center',
        padding: 'clamp(80px,12vw,120px) clamp(16px,4vw,40px) clamp(60px,8vw,80px)'
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(20,184,166,0.15)',
          border: '1px solid rgba(20,184,166,0.4)',
          borderRadius: '100px',
          padding: 'clamp(4px,0.8vw,6px) clamp(12px,2vw,18px)',
          marginBottom: 'clamp(18px,3vw,28px)',
          animation: 'fadeInUp 0.8s ease forwards'
        }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#14B8A6', display: 'inline-block', flexShrink: 0
          }} />
          <span style={{
            color: '#14B8A6', fontSize: 'clamp(10px,1.3vw,13px)',
            fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase'
          }}>Est. 2008 · Bengaluru, Karnataka</span>
        </div>

        {/* Main heading */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(26px, 5.5vw, 68px)',
          fontWeight: 800, color: 'white', lineHeight: 1.15,
          marginBottom: 'clamp(14px,2vw,20px)',
          maxWidth: '900px',
          textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.9s 0.2s ease both'
        }}>
          Powering Progress Through<br />
          <span style={{
            background: 'linear-gradient(90deg, #14B8A6, #2DD4C4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>Engineering Excellence</span>
        </h1>

        {/* Slide title */}
        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: 'clamp(14px, 2.2vw, 20px)', fontWeight: 400,
          marginBottom: '8px', animation: 'fadeInUp 0.9s 0.35s ease both'
        }}>{active.title}</p>

        {/* Slide subject */}
        <p style={{
          color: 'rgba(20,184,166,0.9)',
          fontSize: 'clamp(12px, 1.6vw, 16px)', fontWeight: 500,
          letterSpacing: '0.05em', minHeight: '24px',
          marginBottom: 'clamp(28px,4vw,44px)',
          animation: 'fadeInUp 0.9s 0.45s ease both'
        }}>{active.subject || ''}</p>

        {/* CTA buttons */}
        <div style={{
          display: 'flex', gap: 'clamp(10px,2vw,14px)',
          flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 0.9s 0.55s ease both'
        }}>
          <button
            className="btn-primary"
            onClick={goToService}
            style={{
              padding: 'clamp(11px,1.5vw,14px) clamp(20px,3vw,32px)',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontSize: 'clamp(13px,1.3vw,15px)'
            }}
          >Explore Services</button>

          <button
            onClick={goToAbout}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.35)',
              color: 'white',
              padding: 'clamp(11px,1.5vw,14px) clamp(20px,3vw,32px)',
              borderRadius: '10px', cursor: 'pointer',
              fontSize: 'clamp(13px,1.3vw,15px)',
              fontFamily: 'var(--font-body)', fontWeight: 500,
              backdropFilter: 'blur(8px)', transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >About SMEE</button>
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'clamp(30px,4vw,50px)' }}>
          {slides.map((_, i) => (
            <div
              key={i}
              className={`slider-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator — hidden on small phones */}
      <div className="hero-scroll-hint" style={{
        position: 'absolute', bottom: '24px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
      }}>
        <span style={{
          color: 'rgba(255,255,255,0.5)', fontSize: '10px',
          letterSpacing: '0.1em', textTransform: 'uppercase'
        }}>Scroll</span>
        <div style={{
          width: '22px', height: '34px', border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '11px', display: 'flex', justifyContent: 'center', paddingTop: '5px'
        }}>
          <div style={{
            width: '4px', height: '7px', background: '#14B8A6',
            borderRadius: '2px', animation: 'fadeInUp 1.5s ease infinite'
          }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 400px) {
          .hero-scroll-hint { display: none !important; }
        }
      `}</style>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
//  STATS BAR
// ══════════════════════════════════════════════════════════════
function StatsBar() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0B1F3A, #0d2545)' }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: `repeat(${STATS.length}, 1fr)`
      }} className="stats-grid">
        {STATS.map((s, i) => (
          <div key={i} style={{
            padding: 'clamp(20px,3vw,32px) clamp(12px,2vw,20px)',
            textAlign: 'center',
            borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none'
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4vw, 48px)',
              fontWeight: 800, color: '#14B8A6', lineHeight: 1
            }}>{s.value}{s.suffix}</div>
            <div style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 'clamp(9px, 1.2vw, 13px)', fontWeight: 500,
              marginTop: '6px', letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>{s.label}</div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .stats-grid > div:nth-child(2) { border-right: none !important; }
          .stats-grid > div:nth-child(n+3) { border-top: 1px solid rgba(255,255,255,0.08); }
        }
      `}</style>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  ABOUT / WHO WE ARE
// ══════════════════════════════════════════════════════════════
function AboutSection() {
  const [expanded, setExpanded] = useState(false)
  const [aboutContent, setAboutContent] = useState('')
  const [loading, setLoading] = useState(true)
  const yearsOfExcellence = new Date().getFullYear() - 2008

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/whoweare`)
      .then(({ data }) => { if (data.success && data.data) setAboutContent(data.data.content) })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="about" style={{
      padding: 'clamp(48px,8vw,100px) clamp(16px,3vw,24px)',
      background: '#FAFAFA'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="about-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 'clamp(24px,4vw,48px)',
          alignItems: 'start'
        }}>

          {/* Text card */}
          <div style={{
            background: 'white', borderRadius: '20px',
            padding: 'clamp(24px,4vw,52px)',
            boxShadow: '0 8px 40px rgba(11,31,58,0.08)',
            border: '1px solid rgba(11,31,58,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div className="section-divider" />
              <span style={{
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em',
                color: '#14B8A6', textTransform: 'uppercase'
              }}>Who We Are</span>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px, 3.5vw, 36px)',
              fontWeight: 700, color: '#0B1F3A',
              lineHeight: 1.25, marginBottom: 'clamp(18px,2.5vw,28px)'
            }}>Sri Maheshwari Engineering Enterprises</h2>

            <div className={`expandable-text ${expanded ? 'expanded' : 'collapsed'}`}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[100, 90, 95, 80].map((w, i) => (
                    <div key={i} style={{
                      height: '16px', borderRadius: '6px', background: '#E5E7EB',
                      width: `${w}%`, animation: 'shimmer 1.5s infinite'
                    }} />
                  ))}
                </div>
              ) : (
                aboutContent
                  .split(/\n\s*\n/).filter(p => p.trim())
                  .map((para, i) => (
                    <p key={i} style={{
                      color: '#374151',
                      fontSize: 'clamp(13px,1.5vw,16px)',
                      lineHeight: 1.8, marginBottom: '16px'
                    }}>{para}</p>
                  ))
              )}
            </div>

            {!loading && aboutContent && (
              <button
                onClick={() => setExpanded(e => !e)}
                style={{
                  marginTop: '18px', background: 'none', border: 'none',
                  cursor: 'pointer', color: '#14B8A6',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(13px,1.3vw,15px)', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '6px', padding: 0
                }}
              >
                {expanded ? 'Show Less' : 'Read More'}
                <span style={{
                  fontSize: '18px', transition: 'transform 0.3s',
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  display: 'inline-block'
                }}>↓</span>
              </button>
            )}
          </div>

          {/* Badges column */}
          <div className="about-badges" style={{
            display: 'flex', flexDirection: 'column',
            gap: '16px', minWidth: '160px', maxWidth: '200px'
          }}>
            {/* Years badge */}
            <div className="excellence-badge" style={{
              borderRadius: '20px', padding: 'clamp(24px,3vw,36px) clamp(18px,2.5vw,28px)',
              textAlign: 'center', color: 'white'
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 5vw, 72px)',
                fontWeight: 800, lineHeight: 1
              }}>{yearsOfExcellence}</div>
              <div style={{
                fontSize: 'clamp(10px,1.1vw,13px)', fontWeight: 600,
                letterSpacing: '0.08em', marginTop: '8px', opacity: 0.9
              }}>YEARS OF<br />EXCELLENCE</div>
              <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.7 }}>
                2008 – {new Date().getFullYear()}
              </div>
            </div>

            {/* Super grade badge */}
            <div style={{
              background: '#0B1F3A', borderRadius: '16px',
              padding: 'clamp(16px,2vw,24px) clamp(12px,1.5vw,20px)',
              textAlign: 'center', color: 'white'
            }}>
              <div style={{ fontSize: 'clamp(22px,2.5vw,28px)', marginBottom: '8px' }}>🏆</div>
              <div style={{
                fontSize: 'clamp(11px,1.1vw,13px)', fontWeight: 600,
                letterSpacing: '0.06em', lineHeight: 1.5, color: 'rgba(255,255,255,0.88)'
              }}>Super Grade<br />Electrical Contractor</div>
              <div style={{ fontSize: '11px', color: '#14B8A6', marginTop: '6px' }}>
                Govt. of Karnataka
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; }
          .about-badges {
            flex-direction: row !important;
            min-width: unset !important;
            max-width: 100% !important;
            overflow-x: auto;
          }
          .about-badges > div { min-width: 140px; flex: 1; }
        }
      `}</style>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
//  SERVICES
// ══════════════════════════════════════════════════════════════
function ServicesSection() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeService, setActiveService] = useState(null)
  const navigate  = useNavigate()

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/services/public`)
      .then(({ data }) => { if (data.success) setServices(data.services) })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  const goToContact = () => {
  navigate('/contact')
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

  const activeData = services.find(s => s.id === activeService)

  // Skeleton loader
  if (loading) return (
    <section id="services" style={{
      padding: 'clamp(48px,8vw,100px) clamp(16px,3vw,24px)',
      background: '#F0F4F8'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px,4vw,44px)', fontWeight: 700, color: '#0B1F3A'
          }}>Our Core Areas of Expertise</h2>
        </div>
        <div className="services-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px'
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              borderRadius: '16px', overflow: 'hidden', background: 'white',
              boxShadow: '0 4px 20px rgba(11,31,58,0.07)'
            }}>
              <div style={{
                height: '180px',
                background: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
              }} />
              <div style={{ padding: '20px' }}>
                <div style={{ height: '16px', background: '#E5E7EB', borderRadius: '6px', marginBottom: '10px', width: '70%' }} />
                <div style={{ height: '12px', background: '#F3F4F6', borderRadius: '6px', width: '90%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  if (!loading && services.length === 0) return (
    <section id="services" style={{
      padding: 'clamp(48px,8vw,100px) clamp(16px,3vw,24px)',
      background: '#F0F4F8', textAlign: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px,3vw,36px)', color: '#0B1F3A', marginBottom: '12px'
        }}>Our Core Areas of Expertise</h2>
        <p style={{ color: '#9CA3AF', fontSize: '16px' }}>
          Services will appear here once added from the admin panel.
        </p>
      </div>
    </section>
  )

  return (
    <section id="services" style={{
      padding: 'clamp(48px,8vw,100px) clamp(16px,3vw,24px)',
      background: '#F0F4F8', position: 'relative', overflow: 'hidden'
    }}>
      <div className="pattern-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,60px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div className="section-divider" />
            <span style={{
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em',
              color: '#14B8A6', textTransform: 'uppercase'
            }}>What We Do</span>
            <div className="section-divider" />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px,4vw,44px)', fontWeight: 700, color: '#0B1F3A', marginBottom: '14px'
          }}>Our Core Areas of Expertise</h2>
          <p style={{
            color: '#6B7280', fontSize: 'clamp(13px,1.5vw,17px)',
            maxWidth: '560px', margin: '0 auto', lineHeight: 1.7
          }}>
            Engineering excellence across power, energy, and infrastructure — from concept to commissioning.
          </p>
        </div>

        {/* Cards */}
        <div className="services-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'clamp(14px,2vw,20px)', marginBottom: 'clamp(24px,3vw,40px)'
        }}>
          {services.map(svc => (
            <div
              key={svc.id}
              className={`service-card ${activeService === svc.id ? 'active-card' : ''}`}
              onClick={() => setActiveService(p => p === svc.id ? null : svc.id)}
              style={{
                background: 'white', borderRadius: '16px', overflow: 'hidden',
                border: '2px solid transparent', boxShadow: '0 4px 20px rgba(11,31,58,0.07)'
              }}
            >
              <div style={{ position: 'relative', height: 'clamp(140px,18vw,180px)', overflow: 'hidden' }}>
                <img
                  src={svc.image_url} alt={svc.title}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                    transform: activeService === svc.id ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onError={e => { e.target.src = `https://placehold.co/400x200/0B1F3A/14B8A6?text=${encodeURIComponent(svc.title)}` }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: activeService === svc.id
                    ? 'linear-gradient(to top, rgba(11,31,58,0.7) 0%, rgba(20,184,166,0.15) 100%)'
                    : 'linear-gradient(to top, rgba(11,31,58,0.5) 0%, transparent 60%)'
                }} />
              </div>
              <div style={{ padding: 'clamp(14px,1.8vw,20px)' }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(13px,1.4vw,17px)', fontWeight: 700,
                  color: '#0B1F3A', marginBottom: '8px', lineHeight: 1.3
                }}>{svc.title}</h3>
                {svc.short_desc && (
                  <p style={{ color: '#6B7280', fontSize: 'clamp(11px,1.1vw,13px)', lineHeight: 1.6 }}>
                    {svc.short_desc}
                  </p>
                )}
                {svc.full_desc && (
                  <div style={{
                    marginTop: '12px', display: 'flex', alignItems: 'center', gap: '5px',
                    color: '#14B8A6', fontSize: 'clamp(11px,1.1vw,13px)', fontWeight: 600
                  }}>
                    <span>{activeService === svc.id ? 'Hide Details' : 'Learn More'}</span>
                    <span style={{
                      transition: 'transform 0.3s',
                      transform: activeService === svc.id ? 'rotate(180deg)' : 'none',
                      display: 'inline-block'
                    }}>↓</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {activeData && activeData.full_desc && (
          <div className="service-detail visible">
            <div className="service-detail-inner" style={{
              background: 'white', borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 12px 50px rgba(11,31,58,0.12)',
              border: '1px solid rgba(20,184,166,0.2)',
              display: 'grid', gridTemplateColumns: '1fr 1fr'
            }}>
              <div style={{ position: 'relative', minHeight: 'clamp(220px,30vw,320px)' }}>
                <img
                  src={activeData.image_url} alt={activeData.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = `https://placehold.co/600x400/0B1F3A/14B8A6?text=${encodeURIComponent(activeData.title)}` }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg,rgba(11,31,58,0.6) 0%,rgba(20,184,166,0.15) 100%)'
                }} />
                <div style={{ position: 'absolute', bottom: '24px', left: '24px', color: 'white' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(16px,2.5vw,28px)', fontWeight: 700
                  }}>{activeData.title}</h3>
                </div>
              </div>
              <div style={{ padding: 'clamp(24px,3vw,40px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div className="section-divider" />
                  <span style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em',
                    color: '#14B8A6', textTransform: 'uppercase'
                  }}>Service Detail</span>
                </div>
                <p style={{
                  color: '#374151',
                  fontSize: 'clamp(13px,1.5vw,16px)', lineHeight: 1.85
                }}>{activeData.full_desc}</p>
                <button
                  onClick={goToContact}
                  className="btn-primary"
                  style={{
                    marginTop: 'clamp(20px,2.5vw,32px)',
                    padding: 'clamp(10px,1.3vw,13px) clamp(18px,2.5vw,28px)',
                    borderRadius: '10px', border: 'none', cursor: 'pointer',
                    fontSize: 'clamp(12px,1.2vw,14px)'
                  }}
                >Enquire About This Service</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .services-grid {
          grid-template-columns: repeat(4, 1fr) !important;
        }
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .service-detail-inner { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
//  CLIENTS
// ══════════════════════════════════════════════════════════════
function ClientCard({ client }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: '14px', overflow: 'hidden',
        width: 'clamp(110px,14vw,150px)', height: 'clamp(80px,10vw,110px)',
        background: '#ffffffe5', cursor: 'default', flexShrink: 0,
        border: `1px solid ${hovered ? 'rgba(20,184,166,0.5)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: hovered ? '0 8px 28px rgba(20,184,166,0.18)' : '0 2px 10px rgba(0,0,0,0.2)',
        transition: 'border-color 0.3s, box-shadow 0.3s'
      }}
    >
      <img
        src={client.image_url} alt={client.name}
        style={{
          width: '100%', height: '100%', objectFit: 'contain',
          transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1), filter 0.35s ease',
          transform: hovered ? 'scale(0.82)' : 'scale(1)',
          filter: hovered ? 'brightness(0.3) blur(1px)' : 'brightness(1)'
        }}
        onError={e => { e.target.style.display = 'none' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px',
        opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease', pointerEvents: 'none'
      }}>
        <span style={{
          color: 'white', fontFamily: 'var(--font-body)',
          fontSize: 'clamp(9px,1.1vw,12px)', fontWeight: 700,
          letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.35,
          background: 'rgba(20,184,166,0.2)', borderRadius: '8px',
          padding: '5px 8px', backdropFilter: 'blur(4px)',
          border: '1px solid rgba(20,184,166,0.3)', wordBreak: 'break-word'
        }}>{client.name}</span>
      </div>
    </div>
  )
}

function SupplyVendorCard({ vendor }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        width: 'clamp(110px,14vw,150px)',
        height: 'clamp(80px,10vw,110px)',
        background: '#ffffffe5',
        cursor: 'default',
        flexShrink: 0,
        border: `1px solid ${
          hovered
            ? 'rgba(20,184,166,0.5)'
            : 'rgba(255,255,255,0.08)'
        }`,
        boxShadow: hovered
          ? '0 8px 28px rgba(20,184,166,0.18)'
          : '0 2px 10px rgba(0,0,0,0.2)',
        transition: 'border-color 0.3s, box-shadow 0.3s'
      }}
    >
      <img
        src={vendor.image_url}
        alt={vendor.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transition:
            'transform 0.45s cubic-bezier(0.4,0,0.2,1), filter 0.35s ease',
          transform: hovered ? 'scale(0.82)' : 'scale(1)',
          filter: hovered
            ? 'brightness(0.3) blur(1px)'
            : 'brightness(1)'
        }}
        onError={e => {
          e.target.style.display = 'none'
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          pointerEvents: 'none'
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 'clamp(9px,1.1vw,12px)',
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.35,
            background: 'rgba(20,184,166,0.2)',
            borderRadius: '8px',
            padding: '5px 8px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(20,184,166,0.3)'
          }}
        >
          {vendor.name}
        </span>
      </div>
    </div>
  )
}

function ClientsSection() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/clients/public`)
      .then(({ data }) => { if (data.success && data.clients.length > 0) setClients(data.clients) })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section style={{
      padding: 'clamp(40px,6vw,80px) clamp(16px,3vw,24px)',
      background: '#0B1F3A'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,4vw,48px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div className="section-divider" />
            <span style={{
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em',
              color: '#14B8A6', textTransform: 'uppercase'
            }}>Trusted By</span>
            <div className="section-divider" />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px,3vw,36px)', fontWeight: 700, color: 'white'
          }}>Our Valued Clients & Partners</h2>
        </div>

        {/* Skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} style={{
                width: 'clamp(110px,14vw,150px)', height: 'clamp(80px,10vw,110px)',
                borderRadius: '14px', flexShrink: 0,
                background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)',
                backgroundSize: '300% 100%', animation: 'shimmer 1.6s infinite',
                border: '1px solid rgba(255,255,255,0.06)'
              }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && clients.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤝</div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
              Client logos will appear here once added from the admin panel.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && clients.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            gap: 'clamp(10px,1.5vw,16px)', justifyContent: 'center'
          }}>
            {clients.map(client => <ClientCard key={client.id} client={client} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function SupplyVendorsSection() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/supply-vendors/public`)
      .then(({ data }) => {
        if (data.success && data.vendors.length > 0) {
          setVendors(data.vendors)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      style={{
        padding: 'clamp(40px,6vw,80px) clamp(16px,3vw,24px)',
        background: '#F8FAFC'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {/* Heading */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(28px,4vw,48px)'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '14px'
            }}
          >
            <div className="section-divider" />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#14B8A6',
                textTransform: 'uppercase'
              }}
            >
              Supply Network
            </span>
            <div className="section-divider" />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px,3vw,36px)',
              fontWeight: 700,
              color: '#0B1F3A'
            }}
          >
            Our Supply Vendors
          </h2>
        </div>

        {/* Skeleton */}
        {loading && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'center'
            }}
          >
            {[1,2,3,4,5,6].map(i => (
              <div
                key={i}
                style={{
                  width: 'clamp(110px,14vw,150px)',
                  height: 'clamp(80px,10vw,110px)',
                  borderRadius: '14px',
                  background:
                    'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
                  backgroundSize: '300% 100%',
                  animation: 'shimmer 1.6s infinite'
                }}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && vendors.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0'
            }}
          >
            <div
              style={{
                fontSize: '40px',
                marginBottom: '12px'
              }}
            >
              🏭
            </div>

            <p
              style={{
                color: '#6B7280',
                fontSize: '14px'
              }}
            >
              Supply vendor logos will appear here once added from the admin panel.
            </p>
          </div>
        )}

        {/* Vendors Grid */}
        {!loading && vendors.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(10px,1.5vw,16px)',
              justifyContent: 'center'
            }}
          >
            {vendors.map(vendor => (
              <SupplyVendorCard
                key={vendor.id}
                vendor={vendor}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
//  HOME PAGE ROOT
// ══════════════════════════════════════════════════════════════
export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <StatsBar />
      <AboutSection />
      <ServicesSection />
      <ClientsSection />
      <SupplyVendorsSection />
    </>
  )
}

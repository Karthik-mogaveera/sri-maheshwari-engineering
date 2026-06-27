// src/pages/ServicesPage.jsx
// ─────────────────────────────────────────────────────────────
// Public Services page — reached from header nav "Services".
// Two sections:
//   1. Services grid   — image, title, full_desc from services table
//   2. Deliverables    — bullet points from deliverables table
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Shared section label ──────────────────────────────────────
function SectionLabel({ text }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div className="section-divider" />
      <span style={{
        fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em',
        color: '#14B8A6', textTransform: 'uppercase'
      }}>{text}</span>
      <div className="section-divider" />
    </div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: '20px', overflow: 'hidden', background: 'white',
      boxShadow: '0 4px 24px rgba(11,31,58,0.07)',
      border: '1px solid rgba(11,31,58,0.06)'
    }}>
      <div style={{
        height: '240px',
        background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
        backgroundSize: '200% 100%',
        animation: 'svcPageShimmer 1.5s infinite'
      }} />
      <div style={{ padding: '28px' }}>
        <div style={{ height: '22px', background: '#E5E7EB', borderRadius: '6px', width: '60%', marginBottom: '14px' }} />
        <div style={{ height: '14px', background: '#F3F4F6', borderRadius: '6px', marginBottom: '8px' }} />
        <div style={{ height: '14px', background: '#F3F4F6', borderRadius: '6px', width: '85%', marginBottom: '8px' }} />
        <div style={{ height: '14px', background: '#F3F4F6', borderRadius: '6px', width: '70%' }} />
      </div>
    </div>
  )
}

// ── Single service card ───────────────────────────────────────
function ServiceCard({ service, index }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [expanded, setExpanded]   = useState(false)
  const navigate  = useNavigate()

  // Truncate full_desc for "read more" behaviour
  const CHAR_LIMIT = 260
  const isLong     = (service.full_desc || '').length > CHAR_LIMIT
  const displayText = expanded || !isLong
    ? service.full_desc
    : service.full_desc.slice(0, CHAR_LIMIT).trimEnd() + '…'
const goToContact = () => {
  navigate('/contact')
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
  return (
    <div
      style={{
        borderRadius: '20px', overflow: 'hidden', background: 'white',
        boxShadow: '0 4px 24px rgba(11,31,58,0.07)',
        border: '1px solid rgba(11,31,58,0.06)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        animation: `svcCardIn 0.5s ${index * 0.08}s ease both`
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(11,31,58,0.13)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(11,31,58,0.07)'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 'clamp(180px,22vw,260px)', overflow: 'hidden', background: '#E5E7EB' }}>
        {!imgLoaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
            backgroundSize: '200% 100%', animation: 'svcPageShimmer 1.5s infinite'
          }} />
        )}
        <img
          src={service.image_url}
          alt={service.title}
          onLoad={() => setImgLoaded(true)}
          onError={e => {
            setImgLoaded(true)
            e.target.src = `https://placehold.co/800x400/0B1F3A/14B8A6?text=${encodeURIComponent(service.title)}`
          }}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.4s ease'
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(11,31,58,0.65) 0%, rgba(11,31,58,0.1) 55%, transparent 100%)'
        }} />
        {/* Title on image */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(16px,2.5vw,24px)' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(17px,2.2vw,22px)',
            fontWeight: 700, color: 'white',
            lineHeight: 1.25, margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>{service.title}</h3>
        </div>
        {/* Teal accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: '4px', height: '100%',
          background: 'linear-gradient(180deg, #14B8A6, #0E9488)'
        }} />
      </div>

      {/* Body */}
      <div style={{ padding: 'clamp(20px,2.5vw,28px)' }}>
        {service.full_desc ? (
          <>
            <p style={{
              color: '#374151',
              fontSize: 'clamp(13px,1.4vw,15px)',
              lineHeight: 1.85, margin: 0
            }}>{displayText}</p>
            {isLong && (
              <button
                onClick={() => setExpanded(e => !e)}
                style={{
                  marginTop: '12px', background: 'none', border: 'none',
                  cursor: 'pointer', color: '#14B8A6',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(12px,1.2vw,13px)', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '5px', padding: 0
                }}
              >
                {expanded ? 'Show Less ↑' : 'Read More ↓'}
              </button>
            )}
          </>
        ) : (
          <p style={{ color: '#9CA3AF', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>
            Detailed description coming soon.
          </p>
        )}

        {/* Enquire button */}
        <button
          onClick={goToContact}
          className="btn-primary"
          style={{
            marginTop: 'clamp(16px,2vw,22px)',
            padding: 'clamp(9px,1.2vw,11px) clamp(18px,2vw,24px)',
            borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: 'clamp(12px,1.2vw,13px)',
            display: 'inline-flex', alignItems: 'center', gap: '7px'
          }}
        >
          Enquire
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  SERVICES SECTION
// ══════════════════════════════════════════════════════════════
function ServicesListSection({ services, loading }) {
  return (
    <section style={{
      padding: 'clamp(48px,7vw,90px) clamp(16px,3vw,24px)',
      background: '#FAFAFA'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,60px)' }}>
          <SectionLabel text="What We Do" />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px,4.5vw,48px)',
            fontWeight: 800, color: '#0B1F3A',
            lineHeight: 1.2, marginBottom: '16px'
          }}>Our Core Services</h2>
          <p style={{
            color: '#6B7280',
            fontSize: 'clamp(14px,1.5vw,17px)',
            maxWidth: '560px', margin: '0 auto', lineHeight: 1.75
          }}>
            End-to-end EPC expertise across power, energy, irrigation and industrial sectors
            — engineered to deliver.
          </p>
        </div>

        {/* Skeleton grid */}
        {loading && (
          <div className="svc-page-grid">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && services.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>⚡</div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#0B1F3A', marginBottom: '10px' }}>
              Services Coming Soon
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '15px' }}>
              Our services will be listed here once added from the admin panel.
            </p>
          </div>
        )}

        {/* Services grid */}
        {!loading && services.length > 0 && (
          <div className="svc-page-grid">
            {services.map((svc, i) => (
              <ServiceCard key={svc.id} service={svc} index={i} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .svc-page-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(18px, 2.5vw, 28px);
        }
        @media (max-width: 900px) {
          .svc-page-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .svc-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
//  DELIVERABLES SECTION
// ══════════════════════════════════════════════════════════════
function DeliverablesSection({ data, loading }) {
  // Parse "• line\n• line" into an array of strings
  const bullets = data
    ? data.content
        .split('\n')
        .map(l => l.replace(/^[•\-]\s*/, '').trim())
        .filter(l => l.length > 0)
    : []

  return (
    <section style={{
      padding: 'clamp(48px,7vw,90px) clamp(16px,3vw,24px)',
      background: 'linear-gradient(135deg, #0B1F3A 0%, #0d2a4a 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative background dots */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'radial-gradient(circle at 1px 1px, #14B8A6 1px, transparent 0)',
        backgroundSize: '32px 32px', pointerEvents: 'none'
      }} />
      {/* Teal glow */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)',
        top: '-100px', right: '-80px', pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,56px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '50px', height: '3px', background: 'linear-gradient(90deg,#14B8A6,#2DD4C4)', borderRadius: '2px' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', color: '#14B8A6', textTransform: 'uppercase' }}>
              What We Deliver
            </span>
            <div style={{ width: '50px', height: '3px', background: 'linear-gradient(90deg,#2DD4C4,#14B8A6)', borderRadius: '2px' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px,4.5vw,46px)',
            fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '14px'
          }}>Our Deliverables</h2>
          <p style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 'clamp(13px,1.4vw,16px)',
            maxWidth: '500px', margin: '0 auto', lineHeight: 1.7
          }}>
            Every project we undertake comes with a commitment to quality,
            precision, and on-time delivery.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '700px', margin: '0 auto' }}>
            {[100, 80, 90, 70, 85].map((w, i) => (
              <div key={i} style={{
                height: '20px', borderRadius: '6px',
                background: 'rgba(255,255,255,0.06)',
                width: `${w}%`,
                animation: 'svcPageShimmer 1.5s infinite'
              }} />
            ))}
          </div>
        )}

        {/* No data */}
        {!loading && bullets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>📋</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>
              Deliverables will appear here once added from the admin panel.
            </p>
          </div>
        )}

        {/* Bullet grid */}
        {!loading && bullets.length > 0 && (
          <div className="dlv-page-grid">
            {bullets.map((point, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(20,184,166,0.15)',
                  borderRadius: '14px', padding: 'clamp(16px,2.2vw,22px)',
                  transition: 'all 0.25s ease',
                  animation: `svcCardIn 0.4s ${i * 0.06}s ease both`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(20,184,166,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(20,184,166,0.35)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(20,184,166,0.15)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                {/* Bullet icon */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(20,184,166,0.18)',
                  border: '1.5px solid rgba(20,184,166,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '1px'
                }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#14B8A6' }} />
                </div>
                {/* Text */}
                <p style={{
                  color: 'rgba(255,255,255,0.88)',
                  fontSize: 'clamp(13px,1.4vw,15px)',
                  lineHeight: 1.75, margin: 0, flex: 1
                }}>{point}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .dlv-page-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(12px, 1.8vw, 18px);
        }
        @media (max-width: 640px) {
          .dlv-page-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE HERO BANNER
// ══════════════════════════════════════════════════════════════
function PageHero() {
  return (
    <section style={{
      paddingTop: 'clamp(100px,14vw,140px)',
      paddingBottom: 'clamp(40px,6vw,64px)',
      paddingLeft: 'clamp(16px,3vw,24px)',
      paddingRight: 'clamp(16px,3vw,24px)',
      background: 'linear-gradient(135deg, #060F1D 0%, #0B1F3A 60%, #0d2a4a 100%)',
      textAlign: 'center', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background rings */}
      {[300, 500, 700].map(size => (
        <div key={size} style={{
          position: 'absolute', width: size, height: size,
          border: '1px solid rgba(20,184,166,0.06)', borderRadius: '50%',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          pointerEvents: 'none'
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'rgba(255,255,255,0.45)', fontSize: '13px',
          marginBottom: '20px', fontFamily: 'var(--font-body)'
        }}>
          <span>Home</span>
          <span style={{ color: '#14B8A6' }}>›</span>
          <span style={{ color: '#14B8A6', fontWeight: 600 }}>Services</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(30px,5vw,60px)',
          fontWeight: 800, color: 'white',
          lineHeight: 1.15, marginBottom: '18px',
          textShadow: '0 2px 20px rgba(0,0,0,0.3)'
        }}>
          Engineering Services<br />
          <span style={{
            background: 'linear-gradient(90deg, #14B8A6, #2DD4C4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>Built to Last</span>
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: 'clamp(14px,1.6vw,18px)', lineHeight: 1.75,
          maxWidth: '560px', margin: '0 auto'
        }}>
          Comprehensive EPC solutions in power, solar, irrigation and industrial engineering —
          executed with precision from concept to commissioning.
        </p>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE ROOT
// ══════════════════════════════════════════════════════════════
export default function ServicesPage() {
  const [services,  setServices]  = useState([])
  const [svcLoad,   setSvcLoad]   = useState(true)
  const [dlvData,   setDlvData]   = useState(null)
  const [dlvLoad,   setDlvLoad]   = useState(true)

  // Scroll to top on mount
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [])

  // Fetch both in parallel
  useEffect(() => {
    axios.get(`${API_URL}/api/admin/services/public`)
      .then(({ data }) => { if (data.success) setServices(data.services || []) })
      .catch(() => {})
      .finally(() => setSvcLoad(false))

    axios.get(`${API_URL}/api/admin/deliverables`)
      .then(({ data }) => { if (data.success && data.data) setDlvData(data.data) })
      .catch(() => {})
      .finally(() => setDlvLoad(false))
  }, [])

  return (
    <>
      <PageHero />
      <ServicesListSection services={services} loading={svcLoad} />
      <DeliverablesSection data={dlvData} loading={dlvLoad} />

      <style>{`
        @keyframes svcPageShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes svcCardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
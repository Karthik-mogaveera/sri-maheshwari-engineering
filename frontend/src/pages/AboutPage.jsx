// src/pages/AboutPage.jsx
// ─────────────────────────────────────────────────────────────
// Public About page — reached from header nav "About".
// Three sections:
//   1. Company        — content from about_company table
//   2. Performance    — financial trend chart from business_performance
//   3. People         — team cards from about_people table
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
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

// ── INR formatting helper ──────────────────────────────────────
function formatINR(value) {
  if (value === null || value === undefined) return ''
  const cleaned = value.toString().replace(/[^0-9.]/g, '')
  if (!cleaned) return value.toString()
  const [intPart, decPart] = cleaned.split('.')
  let last3 = intPart.slice(-3)
  let other = intPart.slice(0, -3)
  if (other !== '') last3 = ',' + last3
  const formatted = other.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + last3
  return decPart ? `${formatted}.${decPart}` : formatted
}

// Convert a turnover string to a plain number for chart scaling
function toNumber(value) {
  if (value === null || value === undefined) return 0
  const cleaned = value.toString().replace(/[^0-9.]/g, '')
  return cleaned ? parseFloat(cleaned) : 0
}

// Compact display: 12,50,00,000 -> ₹12.5 Cr
function compactINR(num) {
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(2).replace(/\.00$/, '')} Cr`
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(2).replace(/\.00$/, '')} L`
  return `₹${formatINR(num)}`
}

// ══════════════════════════════════════════════════════════════
//  PAGE HERO BANNER
// ══════════════════════════════════════════════════════════════
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
      textAlign: 'center', position: 'relative', overflow: 'hidden'
    }}>
      {/* Static hero image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('/images/transs.jpg')`, // ← swap in your image path/URL
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Dark gradient overlay — same colors as before, now translucent over the image */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(6,15,29,0.92) 0%, rgba(11,31,58,0.88) 60%, rgba(13,42,74,0.75) 100%)',
      }} />

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
//  COMPANY SECTION
// ══════════════════════════════════════════════════════════════
function CompanySection({ content, loading }) {
  const [expanded, setExpanded] = useState(false)
  const paragraphs = content
    ? content.split(/\n\s*\n/).filter(p => p.trim())
    : []

  return (
    <section style={{
      padding: 'clamp(48px,7vw,90px) clamp(16px,3vw,24px)',
      background: '#FAFAFA'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,4vw,44px)' }}>
          <SectionLabel text="Who We Are" />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px,4.5vw,46px)',
            fontWeight: 800, color: '#0B1F3A', lineHeight: 1.2
          }}>Our Company</h2>
        </div>

        <div style={{
          background: 'white', borderRadius: '20px',
          padding: 'clamp(24px,4vw,48px)',
          boxShadow: '0 8px 40px rgba(11,31,58,0.08)',
          border: '1px solid rgba(11,31,58,0.06)'
        }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[100, 92, 96, 85, 70].map((w, i) => (
                <div key={i} style={{
                  height: '16px', borderRadius: '6px', background: '#E5E7EB',
                  width: `${w}%`, animation: 'aboutShimmer 1.5s infinite'
                }} />
              ))}
            </div>
          ) : paragraphs.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: '15px', textAlign: 'center', fontStyle: 'italic' }}>
              Company information will appear here once added from the admin panel.
            </p>
          ) : (
            <>
              <div className={`expandable-text ${expanded ? 'expanded' : 'collapsed'}`}>
                {paragraphs.map((para, i) => (
                  <p key={i} style={{
                    color: '#374151', fontSize: 'clamp(14px,1.5vw,16px)',
                    lineHeight: 1.85, marginBottom: '16px'
                  }}>{para}</p>
                ))}
              </div>
              {paragraphs.length > 1 && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  style={{
                    marginTop: '8px', background: 'none', border: 'none',
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
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
//  PERFORMANCE SECTION — trend chart + stat cards
// ══════════════════════════════════════════════════════════════
function TrendChart({ data }) {
  // data: array of { financial_year, value }
  const width  = 700
  const height = 260
  const padL   = 60
  const padR   = 24
  const padT   = 30
  const padB   = 44

  const max = Math.max(...data.map(d => d.value), 1)
  const min = 0
  const innerW = width - padL - padR
  const innerH = height - padT - padB

  const points = data.map((d, i) => {
    const x = padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
    const y = padT + innerH - ((d.value - min) / (max - min)) * innerH
    return { x, y, ...d }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padT + innerH} L ${points[0].x} ${padT + innerH} Z`

  // Y-axis grid lines (4 steps)
  const steps = 4
  const gridLines = Array.from({ length: steps + 1 }, (_, i) => {
    const value = (max / steps) * i
    const y = padT + innerH - (value / max) * innerH
    return { y, value }
  })

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '460px', height: 'auto' }}>
        {/* Grid lines */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={padL} y1={g.y} x2={width - padR} y2={g.y}
              stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={padL - 10} y={g.y + 4} textAnchor="end"
              fontSize="11" fill="rgba(255,255,255,0.4)" fontFamily="Outfit, sans-serif">
              {compactINR(g.value)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points + labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#0B1F3A" stroke="#14B8A6" strokeWidth="2.5" />
            {/* Value label above point */}
            <text x={p.x} y={p.y - 14} textAnchor="middle"
              fontSize="12" fontWeight="700" fill="#2DD4C4" fontFamily="Outfit, sans-serif">
              {compactINR(p.value)}
            </text>
            {/* X-axis label */}
            <text x={p.x} y={height - 14} textAnchor="middle"
              fontSize="12" fill="rgba(255,255,255,0.6)" fontFamily="Outfit, sans-serif" fontWeight="600">
              {p.financial_year}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function PerformanceSection({ rows, loading }) {
  // Use last 5 if more than 5 entries (chronological order assumed from sort_order)
  const chartData = rows.length > 5 ? rows.slice(-5) : rows
  const dataPoints = chartData.map(r => ({
    financial_year: r.financial_year,
    value: toNumber(r.annual_turnover)
  }))

  const latest = rows.length > 0 ? rows[rows.length - 1] : null
  const previous = rows.length > 1 ? rows[rows.length - 2] : null

  let growthPct = null
  if (latest && previous) {
    const a = toNumber(latest.annual_turnover)
    const b = toNumber(previous.annual_turnover)
    if (b > 0) growthPct = ((a - b) / b) * 100
  }

  return (
    <section style={{
      padding: 'clamp(48px,7vw,90px) clamp(16px,3vw,24px)',
      background: 'linear-gradient(135deg, #0B1F3A 0%, #0d2a4a 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative bg */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'radial-gradient(circle at 1px 1px, #14B8A6 1px, transparent 0)',
        backgroundSize: '32px 32px', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)',
        top: '-100px', left: '-80px', pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,4vw,44px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '50px', height: '3px', background: 'linear-gradient(90deg,#14B8A6,#2DD4C4)', borderRadius: '2px' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', color: '#14B8A6', textTransform: 'uppercase' }}>
              Growth Story
            </span>
            <div style={{ width: '50px', height: '3px', background: 'linear-gradient(90deg,#2DD4C4,#14B8A6)', borderRadius: '2px' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px,4.5vw,46px)', fontWeight: 800, color: 'white', lineHeight: 1.2
          }}>Financial Performance</h2>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            height: '260px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(20,184,166,0.1)'
          }}>
            <div style={{
              width: 36, height: 36, border: '3px solid rgba(20,184,166,0.2)',
              borderTopColor: '#14B8A6', borderRadius: '50%',
              animation: 'aboutSpin 0.8s linear infinite'
            }} />
          </div>
        )}

        {/* No data */}
        {!loading && rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>📊</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>
              Financial performance data will appear here once added from the admin panel.
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && rows.length > 0 && (
          <>
            {/* Stat cards row */}
            <div className="perf-stats-grid" style={{ marginBottom: 'clamp(24px,3vw,36px)' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(20,184,166,0.18)',
                borderRadius: '16px', padding: 'clamp(18px,2.5vw,26px)', textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>
                  Latest Turnover
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: '#14B8A6' }}>
                  {compactINR(toNumber(latest.annual_turnover))}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
                  FY {latest.financial_year}
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(20,184,166,0.18)',
                borderRadius: '16px', padding: 'clamp(18px,2.5vw,26px)', textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>
                  Year-on-Year Growth
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800,
                  color: growthPct === null ? 'rgba(255,255,255,0.4)' : growthPct >= 0 ? '#2DD4C4' : '#F87171'
                }}>
                  {growthPct === null ? '—' : `${growthPct >= 0 ? '+' : ''}${growthPct.toFixed(1)}%`}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
                  {previous ? `vs FY ${previous.financial_year}` : 'No prior data'}
                </div>
              </div>

              {/* <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(20,184,166,0.18)',
                borderRadius: '16px', padding: 'clamp(18px,2.5vw,26px)', textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>
                  Years of Record
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: 'white' }}>
                  {rows.length}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
                  {rows[0].financial_year} – {rows[rows.length - 1].financial_year}
                </div>
              </div> */}
            </div>

            {/* Chart card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(20,184,166,0.15)',
              borderRadius: '20px', padding: 'clamp(16px,3vw,32px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(15px,1.8vw,19px)', fontWeight: 700, color: 'white', margin: 0 }}>
                  Annual Turnover Trend
                </h3>
                {rows.length > 5 && (
                  <span style={{
                    fontSize: '11px', color: '#14B8A6', background: 'rgba(20,184,166,0.12)',
                    borderRadius: '100px', padding: '4px 12px', fontWeight: 600, letterSpacing: '0.04em'
                  }}>
                    Showing last 5 years
                  </span>
                )}
              </div>
              <TrendChart data={dataPoints} />
            </div>
          </>
        )}
      </div>

      <style>{`
        .perf-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(12px, 1.8vw, 18px);
        }
        @media (max-width: 640px) {
          .perf-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
//  PEOPLE SECTION
// ══════════════════════════════════════════════════════════════
function PersonCard({ person, index }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [expanded, setExpanded]   = useState(false)
  const CHAR_LIMIT = 140
  const isLong = (person.description || '').length > CHAR_LIMIT
  const displayText = expanded || !isLong
    ? person.description
    : person.description.slice(0, CHAR_LIMIT).trimEnd() + '…'

  return (
    <div style={{
      borderRadius: '18px', overflow: 'hidden', background: 'white',
      boxShadow: '0 4px 20px rgba(11,31,58,0.07)',
      border: '1px solid rgba(11,31,58,0.06)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      animation: `aboutCardIn 0.5s ${index * 0.08}s ease both`
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.boxShadow = '0 14px 40px rgba(11,31,58,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(11,31,58,0.07)'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 'clamp(200px,24vw,260px)', overflow: 'hidden', background: '#E5E7EB' }}>
        {!imgLoaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)',
            backgroundSize: '200% 100%', animation: 'aboutShimmer 1.5s infinite'
          }} />
        )}
        <img
          src={person.image_url} alt={person.name}
          onLoad={() => setImgLoaded(true)}
          onError={e => {
            setImgLoaded(true)
            e.target.src = `https://placehold.co/400x400/0B1F3A/14B8A6?text=${encodeURIComponent(person.name)}`
          }}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top',
            opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.4s ease'
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(11,31,58,0.85) 0%, rgba(11,31,58,0.1) 60%, transparent 100%)'
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(14px,2vw,20px)' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(16px,2vw,20px)', fontWeight: 700, color: 'white',
            lineHeight: 1.25, marginBottom: '4px',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>{person.name}</h3>
          {person.designation && (
            <p style={{
              color: '#2DD4C4', fontSize: 'clamp(11px,1.2vw,13px)',
              fontWeight: 600, letterSpacing: '0.05em', margin: 0
            }}>{person.designation}</p>
          )}
        </div>
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: '4px', height: '100%',
          background: 'linear-gradient(180deg, #14B8A6, #0E9488)'
        }} />
      </div>

      {/* Description */}
      {person.description && (
        <div style={{ padding: 'clamp(16px,2vw,22px)' }}>
          <p style={{
            color: '#6B7280', fontSize: 'clamp(12px,1.3vw,14px)',
            lineHeight: 1.75, margin: 0
          }}>{displayText}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                marginTop: '10px', background: 'none', border: 'none',
                cursor: 'pointer', color: '#14B8A6',
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(11px,1.1vw,12px)', fontWeight: 700, padding: 0
              }}
            >{expanded ? 'Show Less ↑' : 'Read More ↓'}</button>
          )}
        </div>
      )}
    </div>
  )
}

function PeopleSection({ people, loading }) {
  return (
    <section style={{
      padding: 'clamp(48px,7vw,90px) clamp(16px,3vw,24px)',
      background: '#FAFAFA'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,56px)' }}>
          <SectionLabel text="Meet The Team" />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px,4.5vw,46px)', fontWeight: 800,
            color: '#0B1F3A', lineHeight: 1.2, marginBottom: '14px'
          }}>The People Behind SMEE</h2>
          <p style={{
            color: '#6B7280', fontSize: 'clamp(14px,1.5vw,17px)',
            maxWidth: '560px', margin: '0 auto', lineHeight: 1.75
          }}>
            Experienced technocrats and skilled professionals driving engineering excellence.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="people-grid">
            {[1,2,3,4].map(i => (
              <div key={i} style={{ borderRadius: '18px', overflow: 'hidden', background: 'white', boxShadow: '0 4px 20px rgba(11,31,58,0.07)' }}>
                <div style={{ height: '240px', background: 'linear-gradient(90deg,#E5E7EB 25%,#F3F4F6 50%,#E5E7EB 75%)', backgroundSize: '200% 100%', animation: 'aboutShimmer 1.5s infinite' }} />
                <div style={{ padding: '20px' }}>
                  <div style={{ height: '14px', background: '#F3F4F6', borderRadius: '6px', marginBottom: '8px' }} />
                  <div style={{ height: '14px', background: '#F3F4F6', borderRadius: '6px', width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && people.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#0B1F3A', marginBottom: '10px' }}>
              Team Profiles Coming Soon
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '15px' }}>
              Team member details will be listed here once added from the admin panel.
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && people.length > 0 && (
          <div className="people-grid">
            {people.map((person, i) => (
              <PersonCard key={person.id} person={person} index={i} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .people-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(16px, 2.2vw, 24px);
        }
        @media (max-width: 1000px) {
          .people-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .people-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════
//  PAGE ROOT
// ══════════════════════════════════════════════════════════════
export default function AboutPage() {
  const [companyContent, setCompanyContent] = useState('')
  const [companyLoad,    setCompanyLoad]    = useState(true)

  const [perfRows, setPerfRows] = useState([])
  const [perfLoad, setPerfLoad] = useState(true)

  const [people,    setPeople]    = useState([])
  const [peopleLoad, setPeopleLoad] = useState(true)

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [])

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/about-company`)
      .then(({ data }) => { if (data.success && data.data) setCompanyContent(data.data.content) })
      .catch(() => {})
      .finally(() => setCompanyLoad(false))

    axios.get(`${API_URL}/api/admin/business-performance`)
      .then(({ data }) => { if (data.success) setPerfRows(data.rows || []) })
      .catch(() => {})
      .finally(() => setPerfLoad(false))

    axios.get(`${API_URL}/api/admin/about-people/public`)
      .then(({ data }) => { if (data.success) setPeople(data.people || []) })
      .catch(() => {})
      .finally(() => setPeopleLoad(false))
  }, [])

  return (
    <>
      <PageHero />
      <CompanySection content={companyContent} loading={companyLoad} />
      <PerformanceSection rows={perfRows} loading={perfLoad} />
      <PeopleSection people={people} loading={peopleLoad} />

      <style>{`
        @keyframes aboutShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes aboutSpin { to { transform: rotate(360deg); } }
        @keyframes aboutCardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
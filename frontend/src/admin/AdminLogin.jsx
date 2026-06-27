import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function AdminLogin() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted,  setMounted]  = useState(false);

  const { login, admin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  // If already logged in, skip login page
  useEffect(() => {
    if (!loading && admin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [loading, admin]);

  // Still initialising — show nothing to avoid flash
  if (loading) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // admin state is now set synchronously inside login()
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060F1D 0%, #0B1F3A 50%, #0a2545 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
      fontFamily: 'Outfit, sans-serif'
    }}>
      {/* Decorative rings */}
      {[600, 900].map(size => (
        <div key={size} style={{
          position: 'absolute', width: size, height: size,
          border: '1px solid rgba(20,184,166,0.05)', borderRadius: '50%',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          pointerEvents: 'none'
        }} />
      ))}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)',
        top: '30%', right: '10%', pointerEvents: 'none'
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: 'clamp(32px,5vw,52px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg,#14B8A6,#0E9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white',
            fontFamily: 'Playfair Display, serif',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(20,184,166,0.35)'
          }}>S</div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 22,
            fontWeight: 700, color: 'white', marginBottom: 6
          }}>Admin Portal</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: '0.05em' }}>
            Sri Maheshwari Engineering Enterprises
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span>⚠️</span>
            <span style={{ color: '#FCA5A5', fontSize: 13 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 8
            }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              // placeholder="admin@smeeindia.com"
              autoComplete="email"
              required
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, color: 'white',
                fontFamily: 'Outfit, sans-serif', fontSize: 15,
                outline: 'none', boxSizing: 'border-box'
              }}
              onFocus={e => { e.target.style.borderColor='rgba(20,184,166,0.7)'; e.target.style.boxShadow='0 0 0 3px rgba(20,184,166,0.15)'; }}
              onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 8
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                // placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{
                  width: '100%', padding: '13px 44px 13px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, color: 'white',
                  fontFamily: 'Outfit, sans-serif', fontSize: 15,
                  outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={e => { e.target.style.borderColor='rgba(20,184,166,0.7)'; e.target.style.boxShadow='0 0 0 3px rgba(20,184,166,0.15)'; }}
                onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', fontSize: 16, padding: 4
              }}>{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: 15,
            background: submitting ? 'rgba(20,184,166,0.45)' : 'linear-gradient(135deg,#14B8A6,#0E9488)',
            border: 'none', borderRadius: 12,
            cursor: submitting ? 'not-allowed' : 'pointer',
            color: 'white', fontFamily: 'Outfit, sans-serif',
            fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: submitting ? 'none' : '0 8px 24px rgba(20,184,166,0.3)',
            transition: 'all 0.25s'
          }}>
            {submitting && (
              <span style={{
                width: 18, height: 18, display: 'inline-block',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
            )}
            {submitting ? 'Signing In…' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: 24,
          color: 'rgba(255,255,255,0.18)', fontSize: 12, lineHeight: 1.6
        }}>
          🔐 Secure access — SMEE Admin only.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.22) !important; }
      `}</style>
    </div>
  );
}

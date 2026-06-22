import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    // Full-screen spinner while we verify the stored token
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0B1F3A'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', border: '4px solid rgba(20,184,166,0.2)',
            borderTopColor: '#14B8A6', borderRadius: '50%',
            animation: 'spin 0.9s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontFamily: 'Outfit, sans-serif' }}>
            Verifying session…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return admin ? children : <Navigate to="/admin" replace />;
}

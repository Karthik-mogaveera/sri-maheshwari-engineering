import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Shared layout
import Layout from './components/Layout.jsx'

// Public pages
import HomePage from './pages/HomePage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ContactPage from './pages/ContactPage.jsx'

// Admin
import { AuthProvider } from './admin/AuthContext.jsx'
import ProtectedRoute from './admin/ProtectedRoute.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import InquiriesPage from './admin/InquiriesPage.jsx'
import { Toast, SettingCard } from './admin/settings/shared';
import SettingPage from './admin/SettingsPage.jsx'


// Placeholder pages (expand these later)
const Placeholder = ({ title }) => (
  <div style={{
    background: 'white', borderRadius: '16px', padding: '48px',
    textAlign: 'center', boxShadow: '0 2px 12px rgba(11,31,58,0.06)',
    border: '1px solid rgba(11,31,58,0.06)'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
    <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#0B1F3A', marginBottom: '8px' }}>{title}</h2>
    <p style={{ color: '#9CA3AF', fontSize: '14px' }}>This section is under development.</p>
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public site ───────────────────────── */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />

          <Route
            path="/services"
            element={
              <Layout>
                <ServicesPage />
              </Layout>
            }
          />

          <Route
            path="/about"
            element={
              <Layout>
                <AboutPage />
              </Layout>
            }
          />

          {/* ── Projects page ─────────────────────── */}
          <Route path="/projects" element={
            <Layout>
              <ProjectsPage />
            </Layout>
          } />

          <Route path="/contact" element={
            <Layout>
              <ContactPage />
            </Layout>
          } />

          {/* Future public pages — just add more Routes here,
              each wrapped in <Layout> — Header & Footer come free */}
          {/* <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} /> */}

          {/* Admin login */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Protected admin routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="inquiries" element={<InquiriesPage />} />
                  <Route path="settings" element={<SettingPage />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />


          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

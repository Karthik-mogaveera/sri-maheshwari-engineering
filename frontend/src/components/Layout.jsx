// src/components/Layout.jsx
// ─────────────────────────────────────────────────────────────
// Wrap any page with <Layout> to get the shared Header + Footer.
// Usage:
//   <Layout>
//     <YourPageContent />
//   </Layout>
// ─────────────────────────────────────────────────────────────
import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}

import { Footer, Layout, ThemeSwitch } from 'nextra-theme-blog'
import { Head } from 'nextra/components'
import 'nextra-theme-blog/style.css'

function CustomNavbar() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--nextra-border-color, #e5e7eb)',
        backgroundColor: 'var(--nextra-bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <a
        href="/"
        style={{
          fontWeight: 'bold',
          fontSize: '1.5rem',
          textDecoration: 'none',
          color: 'var(--nextra-fg)',
        }}
      >
        💻 Tech Insights
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a
            href="/"
            style={{
              textDecoration: 'none',
              color: 'var(--nextra-fg)',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              transition: 'background-color 0.2s',
            }}
          >
            Home
          </a>
          <a
            href="/posts"
            style={{
              textDecoration: 'none',
              color: 'var(--nextra-fg)',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              transition: 'background-color 0.2s',
            }}
          >
            Posts
          </a>
          <a
            href="/about"
            style={{
              textDecoration: 'none',
              color: 'var(--nextra-fg)',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              transition: 'background-color 0.2s',
            }}
          >
            About
          </a>
        </div>
        <ThemeSwitch />
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head />
      <body>
        <Layout>
          <CustomNavbar />
          {children}
          <Footer />
        </Layout>
      </body>
    </html>
  )
}

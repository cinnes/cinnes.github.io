import type { AppProps } from 'next/app'
import Link from 'next/link'
import { Layout } from 'nextra-theme-blog'
import 'nextra-theme-blog/style.css'

const navigation = [
  { url: '/', name: 'Blog' },
  { url: '/about', name: 'About' },
  { url: 'https://github.com/cinnes', name: 'GitHub' },
]

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        .nx-container {
          max-width: 90rem !important;
        }

        .nx-content {
          max-width: none !important;
        }

        @media (min-width: 768px) {
          .nx-container {
            padding-left: 2rem !important;
            padding-right: 2rem !important;
          }
        }

        .custom-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 2rem;
        }

        .custom-nav a {
          text-decoration: none;
          color: #374151;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .custom-nav a:hover {
          background-color: #f3f4f6;
          color: #111827;
        }

        @media (prefers-color-scheme: dark) {
          .custom-nav {
            border-bottom-color: #374151;
          }

          .custom-nav a {
            color: #d1d5db;
          }

          .custom-nav a:hover {
            background-color: #374151;
            color: #f9fafb;
          }
        }
      `}</style>
      <Layout>
        <nav className="custom-nav">
          {navigation.map(item =>
            item.url.startsWith('http') ? (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.name}
              </a>
            ) : (
              <Link key={item.name} href={item.url}>
                {item.name}
              </Link>
            )
          )}
        </nav>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}

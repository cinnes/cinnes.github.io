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
        /* SWR-inspired Design System */
        :root {
          --max-width: 90rem;
          --content-width: 65ch;
          --spacing-xs: 0.25rem;
          --spacing-sm: 0.5rem;
          --spacing-md: 1rem;
          --spacing-lg: 1.5rem;
          --spacing-xl: 2rem;
          --spacing-2xl: 3rem;
          --radius: 0.5rem;
          --border-color: #e5e7eb;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --bg-primary: #ffffff;
          --bg-secondary: #f9fafb;
          --bg-accent: #f3f4f6;
          --accent: #3b82f6;
          --accent-hover: #2563eb;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --border-color: #374151;
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --bg-primary: #111827;
            --bg-secondary: #1f2937;
            --bg-accent: #374151;
            --accent: #60a5fa;
            --accent-hover: #3b82f6;
          }
        }

        /* Typography Improvements */
        html {
          font-feature-settings:
            'rlig' 1,
            'calt' 1;
        }

        body {
          font-family:
            -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Container & Layout */
        .nx-container {
          max-width: var(--max-width) !important;
          margin: 0 auto;
        }

        .nx-content {
          max-width: var(--content-width) !important;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .nx-container {
            padding-left: var(--spacing-xl) !important;
            padding-right: var(--spacing-xl) !important;
          }
        }

        /* Clean Navigation */
        .custom-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xl);
          padding: var(--spacing-lg) 0;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: var(--spacing-2xl);
          background-color: var(--bg-primary);
          backdrop-filter: blur(12px);
        }

        .custom-nav a {
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.875rem;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius);
          transition: all 0.15s ease;
          letter-spacing: -0.025em;
        }

        .custom-nav a:hover {
          background-color: var(--bg-accent);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        /* Content Styling */
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          color: var(--text-primary);
          font-weight: 600;
          letter-spacing: -0.025em;
          line-height: 1.2;
        }

        h1 {
          font-size: 2.25rem;
          margin-bottom: var(--spacing-lg);
        }

        h2 {
          font-size: 1.875rem;
          margin-top: var(--spacing-2xl);
          margin-bottom: var(--spacing-lg);
        }

        h3 {
          font-size: 1.5rem;
          margin-top: var(--spacing-xl);
          margin-bottom: var(--spacing-md);
        }

        p {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
          max-width: 65ch;
        }

        /* Enhanced Code Blocks */
        pre {
          background-color: var(--bg-secondary) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: var(--radius) !important;
          padding: var(--spacing-lg) !important;
          margin: var(--spacing-lg) 0 !important;
          overflow-x: auto;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        code {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family:
            'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', 'Source Code Pro',
            monospace;
        }

        /* Links */
        a {
          color: var(--accent);
          text-decoration: none;
          transition: color 0.15s ease;
        }

        a:hover {
          color: var(--accent-hover);
        }

        /* Lists */
        ul,
        ol {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-md);
        }

        li {
          margin-bottom: var(--spacing-xs);
        }

        /* Blockquotes */
        blockquote {
          border-left: 3px solid var(--accent);
          padding-left: var(--spacing-lg);
          margin: var(--spacing-lg) 0;
          font-style: italic;
          color: var(--text-secondary);
          background-color: var(--bg-secondary);
          padding: var(--spacing-lg);
          border-radius: var(--radius);
        }

        /* Tables */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: var(--spacing-lg) 0;
          font-size: 0.875rem;
        }

        th,
        td {
          border: 1px solid var(--border-color);
          padding: var(--spacing-sm) var(--spacing-md);
          text-align: left;
        }

        th {
          background-color: var(--bg-secondary);
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .custom-nav {
            gap: var(--spacing-md);
            padding: var(--spacing-md) 0;
          }

          .custom-nav a {
            font-size: 0.8125rem;
            padding: var(--spacing-xs) var(--spacing-sm);
          }

          h1 {
            font-size: 1.875rem;
          }
          h2 {
            font-size: 1.5rem;
          }
          h3 {
            font-size: 1.25rem;
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

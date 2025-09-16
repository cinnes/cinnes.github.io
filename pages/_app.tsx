import type { AppProps } from 'next/app'
import { Layout } from 'nextra-theme-blog'
import 'nextra-theme-blog/style.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        /* SWR-inspired Design System */
        :root {
          --max-width: 900px;
          --content-width: 700px;
          --container-padding: 2rem;
          --spacing-xs: 0.25rem;
          --spacing-sm: 0.5rem;
          --spacing-md: 1rem;
          --spacing-lg: 1.5rem;
          --spacing-xl: 2rem;
          --spacing-2xl: 3rem;
          --spacing-3xl: 4rem;
          --spacing-4xl: 6rem;
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
          font-feature-settings: 'rlig' 1, 'calt' 1;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
          background-color: var(--bg-primary) !important;
          color: var(--text-primary) !important;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* SWR-style layout - specific width like their site */
        html,
        html *,
        body,
        body *,
        main,
        main *,
        article,
        article * {
          max-width: none !important;
        }

        /* Container & Layout - Target all possible containers */
        main,
        .main,
        #__next,
        [data-nextra-main],
        .nextra-container,
        .container,
        .layout,
        .content,
        .page,
        .wrapper {
          max-width: 900px !important;
          width: 100% !important;
          margin: 0 auto !important;
          padding-left: var(--container-padding) !important;
          padding-right: var(--container-padding) !important;
        }

        article,
        .article,
        .content-wrapper,
        .post,
        .blog-post {
          max-width: 700px !important;
          margin: 0 auto !important;
          width: 100% !important;
        }

        /* Progressive enhancement for larger screens */
        @media (min-width: 768px) {
          body .nx-container,
          html body .nx-container,
          .nx-container {
            padding-left: var(--spacing-3xl) !important;
            padding-right: var(--spacing-3xl) !important;
          }
        }

        @media (min-width: 1024px) {
          body .nx-container,
          html body .nx-container,
          .nx-container {
            padding-left: var(--spacing-4xl) !important;
            padding-right: var(--spacing-4xl) !important;
          }
        }

        @media (min-width: 1536px) {
          body .nx-container,
          html body .nx-container,
          .nx-container {
            padding-left: 8rem !important;
            padding-right: 8rem !important;
          }
        }


        /* Content Styling */
        h1, h2, h3, h4, h5, h6 {
          color: var(--text-primary) !important;
          font-weight: 600 !important;
          letter-spacing: -0.025em;
          line-height: 1.2 !important;
        }

        h1 { 
          font-size: 2.25rem !important;
          margin-bottom: var(--spacing-lg) !important;
        }

        h2 { 
          font-size: 1.875rem !important;
          margin-top: var(--spacing-2xl) !important;
          margin-bottom: var(--spacing-lg) !important;
        }

        h3 { 
          font-size: 1.5rem !important;
          margin-top: var(--spacing-xl) !important;
          margin-bottom: var(--spacing-md) !important;
        }

        p {
          color: var(--text-secondary) !important;
          margin-bottom: var(--spacing-md) !important;
          max-width: 75ch;
        }

        /* Enhanced Code Blocks */
        pre {
          background-color: var(--bg-secondary) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: var(--radius) !important;
          padding: var(--spacing-lg) !important;
          margin: var(--spacing-lg) 0 !important;
          overflow-x: auto;
          font-size: 0.875rem !important;
          line-height: 1.5 !important;
        }

        code {
          background-color: var(--bg-secondary) !important;
          color: var(--text-primary) !important;
          padding: var(--spacing-xs) var(--spacing-sm) !important;
          border-radius: 0.25rem !important;
          font-size: 0.875rem !important;
          font-family: 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace !important;
        }

        /* Links */
        a {
          color: var(--accent) !important;
          text-decoration: none !important;
          transition: color 0.15s ease;
        }

        a:hover {
          color: var(--accent-hover) !important;
        }

        /* Lists */
        ul, ol {
          color: var(--text-secondary) !important;
          margin-bottom: var(--spacing-md) !important;
        }

        li {
          margin-bottom: var(--spacing-xs) !important;
        }

        /* Blockquotes */
        blockquote {
          border-left: 3px solid var(--accent) !important;
          padding-left: var(--spacing-lg) !important;
          margin: var(--spacing-lg) 0 !important;
          font-style: italic;
          color: var(--text-secondary) !important;
          background-color: var(--bg-secondary) !important;
          padding: var(--spacing-lg) !important;
          border-radius: var(--radius) !important;
        }

        /* Tables */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: var(--spacing-lg) 0 !important;
          font-size: 0.875rem !important;
        }

        th, td {
          border: 1px solid var(--border-color) !important;
          padding: var(--spacing-sm) var(--spacing-md) !important;
          text-align: left !important;
        }

        th {
          background-color: var(--bg-secondary) !important;
          font-weight: 600 !important;
          color: var(--text-primary) !important;
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

          h1 { font-size: 1.875rem !important; }
          h2 { font-size: 1.5rem !important; }
          h3 { font-size: 1.25rem !important; }
        }
      `}</style>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
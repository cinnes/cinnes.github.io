import type { AppProps } from 'next/app'
import { Layout } from 'nextra-theme-blog'
import 'nextra-theme-blog/style.css'

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
      `}</style>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}

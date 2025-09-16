import type { AppProps } from 'next/app'
import { Layout } from 'nextra-theme-blog'
import 'nextra-theme-blog/style.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

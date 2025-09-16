import type { AppProps } from 'next/app'
import Link from 'next/link'
import { Layout } from 'nextra-theme-blog'
import 'nextra-theme-blog/style.css'
import '../styles/globals.css'

const navigation = [
  { url: '/', name: 'Blog' },
  { url: '/about', name: 'About' },
  { url: 'https://github.com/cinnes', name: 'GitHub' },
]

export default function App({ Component, pageProps }: AppProps) {
  return (
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
  )
}
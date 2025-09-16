import { ReactNode } from 'react'
import { Footer, Layout, Navbar, ThemeSwitch } from 'nextra-theme-blog'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-blog/style.css'

export const metadata = {
  title: 'cinnes',
  description: 'side effect shepherd',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap()
  
  return (
    <html lang="en" suppressHydrationWarning>
      <Head backgroundColor={{ dark: '#0f172a', light: '#fefce8' }} />
      <body>
        <Layout>
          <Navbar pageMap={pageMap}>
            <Search />
            <ThemeSwitch />
          </Navbar>
          {children}
          <Footer>{new Date().getFullYear()} © cinnes</Footer>
        </Layout>
      </body>
    </html>
  )
}

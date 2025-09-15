import { Footer, Layout } from 'nextra-theme-blog'
import { Head } from 'nextra/components'
import 'nextra-theme-blog/style.css'

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
          {children}
          <Footer />
        </Layout>
      </body>
    </html>
  )
}

import { ReactNode } from 'react'
import 'nextra-theme-blog/style.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

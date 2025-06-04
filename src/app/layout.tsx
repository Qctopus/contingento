import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Business Continuity Plan Generator',
  description: 'Generate comprehensive business continuity plans',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/@undp/design-system/docs/js/init.min.js"></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 
import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Shared BCP - CARICHAM',
  description: 'View shared Business Continuity Plan',
}

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}



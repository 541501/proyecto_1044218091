import type { Metadata } from 'next'
import { Playfair_Display, Poppins } from 'next/font/google'
import './globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Home | Mi App TypeScript',
  description: 'Página principal del sistema — Fullstack TypeScript + Next.js + Vercel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${playfairDisplay.variable} ${poppins.variable}`}>
      <body className="bg-gradient-to-b from-gray-950 via-slate-950 to-gray-950 min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}

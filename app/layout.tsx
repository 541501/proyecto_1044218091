import './globals.css'
import type { Metadata } from 'next'
import { Playfair_Display, Poppins } from 'next/font/google'
import { ToastProvider } from '@/components/ui/Toast'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700', '900'],
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'ClassSport | Gestión de Salones',
  description: 'Plataforma de asignación de salones universitarios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${playfairDisplay.variable} ${poppins.variable}`}>
      <body className="bg-slate-50 min-h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

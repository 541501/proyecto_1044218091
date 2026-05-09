import type { Metadata } from "next"
import "./globals.css"
import { ToastProvider } from "@/components/ui/Toast"

export const metadata: Metadata = {
  title: "ClassSport | Gestión de Salones",
  description: "Plataforma de asignación de salones universitarios",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 min-h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

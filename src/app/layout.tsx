import type React from "react"
import type { Metadata } from "next"
import { ConfiguracionProvider } from "@/contexts/ConfiguracionContext"

import "./globals.css"

export const metadata: Metadata = {
  title: "Apícola",
  description: "Productos apícolas de la más alta calidad",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <ConfiguracionProvider>{children}</ConfiguracionProvider>
      </body>
    </html>
  )
}

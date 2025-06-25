import type React from "react"
import type { Metadata } from "next"
import { ConfiguracionProvider } from "@/contexts/ConfiguracionContext"

import "./globals.css"

export const metadata: Metadata = {
  title: "Apícola",
  description: "Productos apícolas de la más alta calidad",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#EAB308",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#EAB308" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Apícola" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="font-sans antialiased">
        <ConfiguracionProvider>{children}</ConfiguracionProvider>
      </body>
    </html>
  )
}

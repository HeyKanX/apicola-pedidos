"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface ConfiguracionSitio {
  nombreEmpresa: string
  tituloPagina: string
  subtituloPagina: string
  telefono: string
  direccion: string
  email: string
  facebook: string
  instagram: string
  x: string
  tiktok: string
  imagenes: string[]
  logo: string
  tipoLogo: "predefinido" | "personalizado"
}

interface ConfiguracionContextType {
  configuracion: ConfiguracionSitio
  actualizarConfiguracion: (nuevaConfig: Partial<ConfiguracionSitio>) => void
  loading: boolean
  recargarConfiguracion: () => Promise<void>
}

const defaultConfig: ConfiguracionSitio = {
  nombreEmpresa: "Apícola",
  tituloPagina: "Miel Pura y Natural Directo del Colmenar",
  subtituloPagina:
    "Descubre nuestra selección de productos apícolas de la más alta calidad. Miel, polen, propóleo y más, producidos con amor y cuidado por nuestras abejas.",
  telefono: "+51 900 123 456",
  direccion: "Av. Los Colmenares 123, Lima, Perú",
  email: "contacto@apicoladorada.com",
  facebook: "https://facebook.com/apicoladorada",
  instagram: "https://instagram.com/apicoladorada",
  x: "https://x.com/apicoladorada",
  tiktok: "https://tiktok.com/@apicoladorada",
  imagenes: [
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
  ],
  logo: "🍯",
  tipoLogo: "predefinido",
}

const ConfiguracionContext = createContext<ConfiguracionContextType | undefined>(undefined)

export function ConfiguracionProvider({ children }: { children: React.ReactNode }) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionSitio>(defaultConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConfiguracion()
  }, [])

  const fetchConfiguracion = async () => {
    try {
      console.log("🔄 Cargando configuración desde la base de datos...")
      const response = await fetch("/api/configuracion")
      const data = await response.json()

      if (data.success && data.configuracion) {
        // Asegurar que todos los campos estén presentes
        const configCompleta = {
          ...defaultConfig,
          ...data.configuracion,
          // Asegurar que logo y tipoLogo estén definidos
          logo: data.configuracion.logo || defaultConfig.logo,
          tipoLogo: data.configuracion.tipoLogo || defaultConfig.tipoLogo,
        }

        console.log("✅ Configuración cargada:", {
          logo: configCompleta.logo,
          tipoLogo: configCompleta.tipoLogo,
          nombreEmpresa: configCompleta.nombreEmpresa,
        })

        setConfiguracion(configCompleta)
      } else {
        console.log("⚠️ No se encontró configuración, usando valores por defecto")
        setConfiguracion(defaultConfig)
      }
    } catch (error) {
      console.error("❌ Error al cargar configuración:", error)
      setConfiguracion(defaultConfig)
    } finally {
      setLoading(false)
    }
  }

  const recargarConfiguracion = async () => {
    setLoading(true)
    await fetchConfiguracion()
  }

  const actualizarConfiguracion = (nuevaConfig: Partial<ConfiguracionSitio>) => {
    console.log("🔄 Actualizando configuración local:", nuevaConfig)
    setConfiguracion((prev) => {
      const nuevaConfigCompleta = { ...prev, ...nuevaConfig }
      console.log("✅ Nueva configuración:", {
        logo: nuevaConfigCompleta.logo,
        tipoLogo: nuevaConfigCompleta.tipoLogo,
      })
      return nuevaConfigCompleta
    })
  }

  return (
    <ConfiguracionContext.Provider value={{ configuracion, actualizarConfiguracion, loading, recargarConfiguracion }}>
      {children}
    </ConfiguracionContext.Provider>
  )
}

export function useConfiguracion() {
  const context = useContext(ConfiguracionContext)
  if (context === undefined) {
    throw new Error("useConfiguracion debe ser usado dentro de ConfiguracionProvider")
  }
  return context
}

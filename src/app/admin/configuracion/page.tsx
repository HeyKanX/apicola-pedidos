"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Save, Globe, Phone, Facebook, Instagram, XIcon, Music, RefreshCw } from "lucide-react"
import { useConfiguracion } from "@/contexts/ConfiguracionContext"
import { useToast } from "@/components/ui/toast"
import { GaleriaImagenesAdmin } from "@/components/GaleriaImagenesAdmin"
import { SelectorLogos } from "@/components/SelectorLogos"

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

export default function AdminConfiguracion() {
  const { configuracion, actualizarConfiguracion, recargarConfiguracion } = useConfiguracion()
  const [config, setConfig] = useState<ConfiguracionSitio>({
    ...configuracion,
    logo: configuracion.logo || "🍯",
    tipoLogo: configuracion.tipoLogo || "predefinido",
  })
  const [guardando, setGuardando] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast, toasts } = useToast()

  useEffect(() => {
    console.log("🔄 Configuración recibida en componente:", {
      logo: configuracion.logo,
      tipoLogo: configuracion.tipoLogo,
      nombreEmpresa: configuracion.nombreEmpresa,
    })

    setConfig({
      ...configuracion,
      logo: configuracion.logo || "🍯",
      tipoLogo: configuracion.tipoLogo || "predefinido",
    })
    setLoading(false)
  }, [configuracion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      console.log("💾 Guardando configuración:", {
        logo: config.logo,
        tipoLogo: config.tipoLogo,
        nombreEmpresa: config.nombreEmpresa,
      })

      const response = await fetch("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (data.success) {
        console.log("✅ Configuración guardada exitosamente en BD")

        // Actualizar el contexto global inmediatamente
        actualizarConfiguracion(config)

        // Recargar la configuración desde la base de datos para asegurar sincronización
        await recargarConfiguracion()

        toast({
          title: "Éxito",
          description: "Configuración guardada exitosamente",
          variant: "success",
        })
      } else {
        console.error("❌ Error al guardar:", data.error)
        toast({
          title: "Error",
          description: data.error,
          variant: "error",
        })
      }
    } catch (error) {
      console.error("❌ Error al guardar configuración:", error)
      toast({
        title: "Error",
        description: "Error al guardar la configuración",
        variant: "error",
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleImagenesChange = (nuevasImagenes: string[]) => {
    setConfig({ ...config, imagenes: nuevasImagenes })
  }

  const handleLogoChange = (nuevoLogo: string, tipo: "predefinido" | "personalizado") => {
    console.log("🎨 Cambiando logo:", { nuevoLogo: nuevoLogo.substring(0, 50) + "...", tipo })
    setConfig({ ...config, logo: nuevoLogo, tipoLogo: tipo })
  }

  const handleRecargarConfiguracion = async () => {
    setLoading(true)
    await recargarConfiguracion()
    setLoading(false)
    toast({
      title: "Configuración recargada",
      description: "Se ha recargado la configuración desde la base de datos",
      variant: "success",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toasts}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sitio</h1>
          <p className="text-gray-600">Personaliza la información y apariencia de tu página web</p>
        </div>
        <Button variant="outline" onClick={handleRecargarConfiguracion} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Recargar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo y Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Logo y Branding</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombreEmpresa">Nombre de la Empresa</Label>
              <Input
                id="nombreEmpresa"
                value={config.nombreEmpresa}
                onChange={(e) => setConfig({ ...config, nombreEmpresa: e.target.value })}
                placeholder="Apícola"
              />
              <p className="text-xs text-gray-500 mt-1">Este nombre aparecerá en el título de la página</p>
            </div>

            {/* Selector de Logo */}
            <div>
              <Label>Logo de la Empresa</Label>
              <SelectorLogos logoActual={config.logo} tipoActual={config.tipoLogo} onLogoChange={handleLogoChange} />
              <p className="text-xs text-gray-500 mt-1">
                Selecciona un logo predefinido o sube tu propio logo en formato PNG
              </p>
            </div>

            {/* Vista previa del logo con nombre */}
            <div>
              <Label>Vista Previa</Label>
              <div className="flex items-center space-x-3 p-4 border rounded-lg bg-gray-50">
                {config.tipoLogo === "personalizado" ? (
                  <img
                    src={config.logo || "/placeholder.svg"}
                    alt="Logo personalizado"
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      console.error("❌ Error cargando imagen del logo personalizado")
                      target.style.display = "none"
                    }}
                  />
                ) : (
                  <span className="text-2xl">{config.logo}</span>
                )}
                <span className="text-xl font-bold text-gray-900">{config.nombreEmpresa}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Tipo actual: <strong>{config.tipoLogo}</strong>
                {config.tipoLogo === "personalizado" && (
                  <span> | Tamaño: {config.logo ? `${Math.round(config.logo.length / 1024)}KB` : "0KB"}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Información General</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tituloPagina">Título Principal</Label>
              <Input
                id="tituloPagina"
                value={config.tituloPagina}
                onChange={(e) => setConfig({ ...config, tituloPagina: e.target.value })}
                placeholder="Miel Pura y Natural Directo del Colmenar"
              />
            </div>
            <div>
              <Label htmlFor="subtituloPagina">Subtítulo</Label>
              <Textarea
                id="subtituloPagina"
                value={config.subtituloPagina}
                onChange={(e) => setConfig({ ...config, subtituloPagina: e.target.value })}
                rows={3}
                placeholder="Descripción de tu empresa..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Información de Contacto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={config.telefono}
                  onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                  placeholder="+51 900 123 456"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  placeholder="contacto@apicoladorada.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                value={config.direccion}
                onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                rows={2}
                placeholder="Dirección completa de la empresa"
              />
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Redes Sociales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="facebook" className="flex items-center space-x-2">
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </Label>
                <Input
                  id="facebook"
                  value={config.facebook}
                  onChange={(e) => setConfig({ ...config, facebook: e.target.value })}
                  placeholder="https://facebook.com/tu-pagina"
                />
              </div>
              <div>
                <Label htmlFor="instagram" className="flex items-center space-x-2">
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </Label>
                <Input
                  id="instagram"
                  value={config.instagram}
                  onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                  placeholder="https://instagram.com/tu-cuenta"
                />
              </div>
              <div>
                <Label htmlFor="x" className="flex items-center space-x-2">
                  <XIcon className="h-4 w-4" />
                  <span>X (Twitter)</span>
                </Label>
                <Input
                  id="x"
                  value={config.x}
                  onChange={(e) => setConfig({ ...config, x: e.target.value })}
                  placeholder="https://x.com/tu-cuenta"
                />
              </div>
              <div>
                <Label htmlFor="tiktok" className="flex items-center space-x-2">
                  <Music className="h-4 w-4" />
                  <span>TikTok</span>
                </Label>
                <Input
                  id="tiktok"
                  value={config.tiktok}
                  onChange={(e) => setConfig({ ...config, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@tu-cuenta"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Galería de Imágenes */}
        <GaleriaImagenesAdmin imagenes={config.imagenes} onImagenesChange={handleImagenesChange} />

        <div className="flex justify-end">
          <Button type="submit" disabled={guardando} className="bg-yellow-600 hover:bg-yellow-700">
            <Save className="h-4 w-4 mr-2" />
            {guardando ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>
      </form>
    </div>
  )
}

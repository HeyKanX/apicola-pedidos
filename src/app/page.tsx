"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { DynamicTitle } from "@/components/DynamicTitle"
import { GaleriaImagenesElegante } from "@/components/GaleriaImagenesElegante"
import { ShoppingCart, Phone, MapPin, Mail, Facebook, Instagram, XIcon, Music } from "lucide-react"
import { useConfiguracion } from "@/contexts/ConfiguracionContext"

export default function HomePage() {
  const { configuracion, loading } = useConfiguracion()

  const renderLogo = () => {
    if (configuracion.tipoLogo === "personalizado" && configuracion.logo) {
      return (
        <img
          src={configuracion.logo || "/placeholder.svg"}
          alt={`Logo de ${configuracion.nombreEmpresa}`}
          className="h-8 w-8 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = "none"
            // Mostrar emoji de respaldo si falla la imagen
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = '<span class="text-2xl">🍯</span>'
            }
          }}
        />
      )
    } else {
      return <span className="text-2xl">{configuracion.logo || "🍯"}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      <DynamicTitle />
      <Header />

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{configuracion.tituloPagina}</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{configuracion.subtituloPagina}</p>
          <div className="flex justify-center space-x-4">
            <Link href="/productos">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ver Productos
              </Button>
            </Link>
            <Link href="/pedidos">
              <Button size="lg" variant="outline">
                Hacer Pedido
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Galería de Imágenes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900">Nuestra Apícola</h3>
            <p className="text-gray-600 mt-2">Conoce nuestras instalaciones y procesos</p>
          </div>
          <GaleriaImagenesElegante imagenes={configuracion.imagenes} />
        </div>
      </section>

      {/* Información de Contacto */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900">Contáctanos</h3>
            <p className="text-gray-600 mt-2">Estamos aquí para ayudarte</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-6 w-6 text-yellow-600" />
                  <span>Teléfono</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{configuracion.telefono}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-6 w-6 text-yellow-600" />
                  <span>Email</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{configuracion.email}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-yellow-600" />
                  <span>Dirección</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{configuracion.direccion}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                {renderLogo()}
                <h3 className="text-xl font-bold">{configuracion.nombreEmpresa}</h3>
              </div>
              <p className="text-gray-300">
                Productos apícolas de la más alta calidad, directo del colmenar a tu mesa.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{configuracion.telefono}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{configuracion.email}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{configuracion.direccion}</span>
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                <a
                  href={configuracion.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-yellow-600 transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href={configuracion.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-yellow-600 transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  href={configuracion.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-yellow-600 transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </a>
                <a
                  href={configuracion.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-yellow-600 transition-colors"
                >
                  <Music className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">&copy; 2024 {configuracion.nombreEmpresa}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

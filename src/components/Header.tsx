"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { useConfiguracion } from "@/contexts/ConfiguracionContext"

export function Header() {
  const { configuracion } = useConfiguracion()
  const [clickCount, setClickCount] = useState(0)
  const router = useRouter()

  const handleLogoClick = () => {
    setClickCount((prev) => prev + 1)

    if (clickCount === 2) {
      // Tercer clic - redirigir al admin
      router.push("/admin/login")
      setClickCount(0)
    } else {
      // Resetear contador después de 2 segundos
      setTimeout(() => setClickCount(0), 2000)
    }
  }

  const renderLogo = () => {
    console.log("🎨 Renderizando logo en Header:", {
      tipoLogo: configuracion.tipoLogo,
      logoLength: configuracion.logo?.length,
      esDataUrl: configuracion.logo?.startsWith("data:"),
    })

    if (configuracion.tipoLogo === "personalizado" && configuracion.logo && configuracion.logo.startsWith("data:")) {
      return (
        <img
          src={configuracion.logo || "/placeholder.svg"}
          alt={`Logo de ${configuracion.nombreEmpresa}`}
          className="h-8 w-8 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            console.error("❌ Error cargando logo personalizado en Header, usando fallback")
            target.style.display = "none"
            // Mostrar emoji de respaldo si falla la imagen
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = '<span class="text-2xl">🍯</span>'
            }
          }}
          onLoad={() => {
            console.log("✅ Logo personalizado cargado correctamente en Header")
          }}
        />
      )
    } else {
      return <span className="text-2xl">{configuracion.logo || "🍯"}</span>
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer select-none" onClick={handleLogoClick}>
            {renderLogo()}
            <h1 className="text-2xl font-bold text-gray-900">{configuracion.nombreEmpresa}</h1>
          </div>
          <nav className="flex space-x-4">
            <Link href="/">
              <Button variant="ghost">
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
            </Link>
            <Link href="/productos">
              <Button variant="ghost">Productos</Button>
            </Link>
            <Link href="/pedidos">
              <Button variant="ghost">Hacer Pedido</Button>
            </Link>
            <Link href="/consultar-pedido">
              <Button variant="ghost">Consultar Pedido</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

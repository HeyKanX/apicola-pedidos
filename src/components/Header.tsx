"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Menu, X, ShoppingCart, Search, Phone } from "lucide-react"
import { useConfiguracion } from "@/contexts/ConfiguracionContext"

export function Header() {
  const { configuracion } = useConfiguracion()
  const [clickCount, setClickCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  const navigationItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/productos", label: "Productos", icon: ShoppingCart },
    { href: "/pedidos", label: "Hacer Pedido", icon: ShoppingCart },
    { href: "/consultar-pedido", label: "Consultar", icon: Search },
  ]

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer select-none" onClick={handleLogoClick}>
            {renderLogo()}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{configuracion.nombreEmpresa}</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2 lg:space-x-4">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="text-sm lg:text-base">
                  <item.icon className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.label.split(" ")[0]}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white absolute left-0 right-0 shadow-lg">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left py-3 px-4 text-base"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              ))}

              {/* Contacto rápido en móvil */}
              <div className="pt-4 border-t">
                <a href={`tel:${configuracion.telefono}`} className="block">
                  <Button variant="outline" className="w-full justify-start py-3 px-4 text-base">
                    <Phone className="h-5 w-5 mr-3" />
                    Llamar: {configuracion.telefono}
                  </Button>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

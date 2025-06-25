"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, ShoppingCart, Package, Settings, Menu, X, LogOut, Wrench } from "lucide-react"
import { useConfiguracion } from "@/contexts/ConfiguracionContext"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { configuracion } = useConfiguracion()

  useEffect(() => {
    verifyAuth()
  }, [pathname, router])

  const verifyAuth = async () => {
    const token = localStorage.getItem("adminToken")

    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login")
      setLoading(false)
      return
    }

    if (pathname === "/admin/login") {
      setLoading(false)
      return
    }

    if (token) {
      try {
        const response = await fetch("/api/admin/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (data.success) {
          setIsAuthenticated(true)
          setUsuario(data.usuario)
        } else {
          localStorage.removeItem("adminToken")
          router.push("/admin/login")
        }
      } catch (error) {
        console.error("Error verificando token:", error)
        localStorage.removeItem("adminToken")
        router.push("/admin/login")
      }
    }

    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    setIsAuthenticated(false)
    setUsuario(null)
    router.push("/admin/login")
  }

  const renderLogo = () => {
    if (configuracion.tipoLogo === "personalizado" && configuracion.logo && configuracion.logo.startsWith("data:")) {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  if (pathname === "/admin/login") {
    return children
  }

  if (!isAuthenticated) {
    return null
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
    { name: "Productos", href: "/admin/productos", icon: Package },
    { name: "Configuración", href: "/admin/configuracion", icon: Settings },
    { name: "Herramientas", href: "/admin/herramientas", icon: Wrench },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              {renderLogo()}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{configuracion.nombreEmpresa}</h1>
                <p className="text-xs text-gray-500">Panel de Administración</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="hidden sm:flex">
              {usuario?.nombre || "Administrador"}
            </Badge>
            <Link href="/">
              <Button variant="outline" size="sm">
                Ver Sitio
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start ${isActive ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Contenido principal */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

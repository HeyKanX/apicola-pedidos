"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, TrendingUp, Users, DollarSign, AlertTriangle, Warehouse } from "lucide-react"
import { formatearPrecio } from "@/lib/utils"

interface EstadisticasDashboard {
  totalPedidos: number
  pedidosPendientes: number
  pedidosCompletados: number
  totalProductos: number
  productosStock: number
  productosSinStock: number
  productosBajoStock: number
  ventasHoy: number
  ventasTotales: number
  valorInventario: number
}

export default function AdminDashboard() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasDashboard>({
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosCompletados: 0,
    totalProductos: 0,
    productosStock: 0,
    productosSinStock: 0,
    productosBajoStock: 0,
    ventasHoy: 0,
    ventasTotales: 0,
    valorInventario: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEstadisticas()
  }, [])

  const fetchEstadisticas = async () => {
    try {
      // Obtener pedidos
      const pedidosResponse = await fetch("/api/pedidos")
      const pedidosData = await pedidosResponse.json()

      // Obtener productos
      const productosResponse = await fetch("/api/productos")
      const productosData = await productosResponse.json()

      if (pedidosData.success && productosData.success) {
        const pedidos = pedidosData.pedidos || []
        const productos = productosData.productos || []

        const hoy = new Date().toDateString()
        const pedidosHoy = pedidos.filter((p: any) => new Date(p.createdAt).toDateString() === hoy)
        const pedidosCompletados = pedidos.filter((p: any) => p.estado === "completado")

        // Calcular estadísticas de productos
        const productosSinStock = productos.filter((p: any) => p.stock === 0).length
        const productosBajoStock = productos.filter((p: any) => p.stock > 0 && p.stock <= 5).length
        const productosConStock = productos.filter((p: any) => p.stock > 0).length

        // Calcular valor del inventario
        const valorInventario = productos.reduce((total: number, p: any) => {
          return total + p.precio * p.stock
        }, 0)

        // Calcular ventas
        const ventasTotales = pedidosCompletados.reduce((sum: number, p: any) => sum + (p.total || 0), 0)
        const ventasHoy = pedidosHoy.reduce((sum: number, p: any) => sum + (p.total || 0), 0)

        setEstadisticas({
          totalPedidos: pedidos.length,
          pedidosPendientes: pedidos.filter((p: any) => p.estado === "pendiente").length,
          pedidosCompletados: pedidosCompletados.length,
          totalProductos: productos.length,
          productosStock: productosConStock,
          productosSinStock,
          productosBajoStock,
          ventasHoy,
          ventasTotales,
          valorInventario,
        })
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    } finally {
      setLoading(false)
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general de tu apícola</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalPedidos}</div>
            <p className="text-xs text-muted-foreground">{estadisticas.pedidosPendientes} pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalProductos}</div>
            <p className="text-xs text-muted-foreground">{estadisticas.productosStock} con stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatearPrecio(estadisticas.ventasHoy)}</div>
            <p className="text-xs text-muted-foreground">Ingresos del día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.pedidosCompletados}</div>
            <p className="text-xs text-muted-foreground">Pedidos entregados</p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas financieras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatearPrecio(estadisticas.valorInventario)}</div>
            <p className="text-xs text-muted-foreground">Inversión total en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatearPrecio(estadisticas.ventasTotales)}</div>
            <p className="text-xs text-muted-foreground">Ganancias por ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Sin Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.productosSinStock}</div>
            <p className="text-xs text-muted-foreground">{estadisticas.productosBajoStock} con bajo stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas comunes de administración</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Pedidos Pendientes</p>
                <p className="text-sm text-gray-600">Revisar y procesar pedidos</p>
              </div>
              <Badge variant="secondary">{estadisticas.pedidosPendientes}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Stock Bajo</p>
                <p className="text-sm text-gray-600">Productos que necesitan reposición</p>
              </div>
              <Badge variant={estadisticas.productosBajoStock > 0 ? "destructive" : "outline"}>
                {estadisticas.productosBajoStock}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Información general</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Base de datos</span>
              <Badge className="bg-green-100 text-green-800">Conectada</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Última actualización</span>
              <span className="text-sm text-gray-600">Hace 2 minutos</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Versión</span>
              <span className="text-sm text-gray-600">v1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

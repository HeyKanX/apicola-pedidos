"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Database, Trash2, RefreshCw, AlertTriangle, Search, Zap, Shield } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface EstadisticasDB {
  totalPedidos: number
  totalProductos: number
  totalUsuarios: number
  ultimoNumeroPedido: string
  pedidosOcultos: number
}

export default function HerramientasAdmin() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasDB | null>(null)
  const [loading, setLoading] = useState(false)
  const [operando, setOperando] = useState(false)
  const { toast, toasts } = useToast()

  const obtenerEstadisticas = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/herramientas/estadisticas")
      const data = await response.json()

      if (data.success) {
        setEstadisticas(data.estadisticas)
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
      toast({
        title: "Error",
        description: "Error al obtener estadísticas de la base de datos",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const limpiarPedidos = async () => {
    if (
      !confirm(
        "⚠️ ADVERTENCIA: Esto eliminará TODOS los pedidos de la base de datos y reseteará la numeración. ¿Estás seguro?",
      )
    ) {
      return
    }

    if (!confirm("🚨 ÚLTIMA CONFIRMACIÓN: Esta acción NO se puede deshacer. ¿Continuar?")) {
      return
    }

    setOperando(true)
    try {
      const response = await fetch("/api/admin/herramientas/limpiar-pedidos", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: `${data.eliminados} pedidos eliminados. Numeración reseteada.`,
          variant: "success",
        })
        obtenerEstadisticas()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error al limpiar pedidos:", error)
      toast({
        title: "Error",
        description: "Error al limpiar los pedidos",
        variant: "error",
      })
    } finally {
      setOperando(false)
    }
  }

  const buscarPedidoEspecifico = async () => {
    setOperando(true)
    try {
      const response = await fetch("/api/admin/herramientas/buscar-pedido/AP-0001")
      const data = await response.json()

      if (data.success && data.pedido) {
        toast({
          title: "Pedido encontrado",
          description: `Pedido AP-0001 encontrado. Estado: ${data.pedido.estado}`,
          variant: "success",
        })
      } else {
        toast({
          title: "Pedido no encontrado",
          description: "El pedido AP-0001 no existe en la base de datos",
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error al buscar pedido:", error)
      toast({
        title: "Error",
        description: "Error al buscar el pedido",
        variant: "error",
      })
    } finally {
      setOperando(false)
    }
  }

  const eliminarPedidoEspecifico = async () => {
    if (!confirm("¿Eliminar específicamente el pedido AP-0001?")) {
      return
    }

    setOperando(true)
    try {
      const response = await fetch("/api/admin/herramientas/eliminar-pedido/AP-0001", {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: "Pedido AP-0001 eliminado exitosamente",
          variant: "success",
        })
        obtenerEstadisticas()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error al eliminar pedido:", error)
      toast({
        title: "Error",
        description: "Error al eliminar el pedido",
        variant: "error",
      })
    } finally {
      setOperando(false)
    }
  }

  const resetearNumeracion = async () => {
    if (!confirm("¿Resetear la numeración de pedidos? El próximo pedido será AP-0001")) {
      return
    }

    setOperando(true)
    try {
      const response = await fetch("/api/admin/herramientas/resetear-numeracion", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: "Numeración reseteada. El próximo pedido será AP-0001",
          variant: "success",
        })
        obtenerEstadisticas()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error al resetear numeración:", error)
      toast({
        title: "Error",
        description: "Error al resetear la numeración",
        variant: "error",
      })
    } finally {
      setOperando(false)
    }
  }

  return (
    <div className="space-y-6">
      {toasts}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Herramientas de Base de Datos</h1>
        <p className="text-gray-600">Herramientas avanzadas para administrar la base de datos</p>
      </div>

      {/* Estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Estadísticas de la Base de Datos</span>
          </CardTitle>
          <CardDescription>Estado actual de los datos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button onClick={obtenerEstadisticas} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Cargando..." : "Actualizar Estadísticas"}
            </Button>
          </div>

          {estadisticas && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{estadisticas.totalPedidos}</div>
                <div className="text-sm text-gray-600">Total Pedidos</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{estadisticas.totalProductos}</div>
                <div className="text-sm text-gray-600">Total Productos</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{estadisticas.totalUsuarios}</div>
                <div className="text-sm text-gray-600">Total Usuarios</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{estadisticas.ultimoNumeroPedido || "Ninguno"}</div>
                <div className="text-sm text-gray-600">Último Número</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Herramientas de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Diagnóstico de Pedidos</span>
          </CardTitle>
          <CardDescription>Buscar y solucionar problemas con pedidos específicos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={buscarPedidoEspecifico} disabled={operando} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Buscar AP-0001
            </Button>

            <Button onClick={eliminarPedidoEspecifico} disabled={operando} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar AP-0001
            </Button>
          </div>

          <Separator />

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Problema de Numeración</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Si los pedidos no empiezan desde AP-0001, puede haber pedidos ocultos o problemas de numeración.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Herramientas de Limpieza */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Herramientas de Limpieza</span>
          </CardTitle>
          <CardDescription>Operaciones de mantenimiento y limpieza</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Resetear Numeración</h4>
              <p className="text-sm text-gray-600 mb-3">Resetea la numeración para que el próximo pedido sea AP-0001</p>
              <Button onClick={resetearNumeracion} disabled={operando} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetear Numeración
              </Button>
            </div>

            <div className="p-4 border rounded-lg border-red-200 bg-red-50">
              <h4 className="font-medium mb-2 text-red-800">Limpiar Todos los Pedidos</h4>
              <p className="text-sm text-red-600 mb-3">⚠️ Elimina TODOS los pedidos y resetea la numeración</p>
              <Button onClick={limpiarPedidos} disabled={operando} variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Todo
              </Button>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">⚠️ Zona Peligrosa</h4>
                <p className="text-sm text-red-700 mt-1">
                  Las operaciones de limpieza son irreversibles. Asegúrate de hacer un respaldo antes de continuar.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

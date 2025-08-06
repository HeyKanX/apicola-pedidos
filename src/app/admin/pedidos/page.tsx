"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Eye, Edit, Search, Filter, History, TrendingUp, Trash2 } from "lucide-react"
import { formatearPrecio } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface ItemPedido {
  producto: any
  cantidad: number
  precio: number
  subtotal: number
}

interface Pedido {
  _id?: string
  numero: string
  cliente: {
    nombre: string
    email: string
    telefono: string
    direccion: string
  }
  items: ItemPedido[]
  total: number
  estado: "pendiente" | "proceso" | "completado" | "cancelado"
  fechaPedido?: string
  notas?: string
  metodoPago: "efectivo" | "transferencia" | "billetera-electronica"
  createdAt?: string
  updatedAt?: string
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null)
  const [actualizando, setActualizando] = useState(false)
  const [tabActiva, setTabActiva] = useState("gestion")
  const { toast, toasts } = useToast()

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      const response = await fetch("/api/pedidos")
      const data = await response.json()
      if (data.success) {
        setPedidos(data.pedidos)
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
    } finally {
      setLoading(false)
    }
  }

  const actualizarEstadoPedido = async (pedidoId: string, nuevoEstado: string, esHistorial = false) => {
    setActualizando(true)
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      const data = await response.json()
      if (data.success) {
        setPedidos((prev) =>
          prev.map((pedido) => (pedido._id === pedidoId ? { ...pedido, estado: nuevoEstado as any } : pedido)),
        )

        toast({
          title: "Éxito",
          description: "Estado actualizado exitosamente",
          variant: "success",
        })

        // Si se mueve desde historial a gestión, cambiar tab
        if (esHistorial && (nuevoEstado === "pendiente" || nuevoEstado === "proceso")) {
          setTabActiva("gestion")
        }
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el estado",
        variant: "error",
      })
    } finally {
      setActualizando(false)
    }
  }

  const eliminarPedido = async (pedidoId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.")) {
      return
    }

    setActualizando(true)
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        setPedidos((prev) => prev.filter((pedido) => pedido._id !== pedidoId))
        toast({
          title: "Éxito",
          description: "Pedido eliminado exitosamente",
          variant: "success",
        })
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
      setActualizando(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEstadoBadge = (estado: string) => {
    const colores = {
      pendiente: "bg-yellow-100 text-yellow-800",
      proceso: "bg-blue-100 text-blue-800",
      completado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
    }
    return colores[estado as keyof typeof colores] || "bg-gray-100 text-gray-800"
  }

  const getMetodoPagoTexto = (metodo: string) => {
    const metodos = {
      efectivo: "Efectivo",
      transferencia: "Transferencia Bancaria",
      "billetera-electronica": "Billetera Electrónica",
    }
    return metodos[metodo as keyof typeof metodos] || metodo
  }

  // Filtrar pedidos para gestión (pendiente y proceso)
  const pedidosGestion = pedidos.filter((pedido) => {
    const esGestion = pedido.estado === "pendiente" || pedido.estado === "proceso"
    const coincideBusqueda =
      pedido.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.cliente.email.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === "todos" || pedido.estado === filtroEstado
    return esGestion && coincideBusqueda && coincideEstado
  })

  // Filtrar pedidos para historial (completado y cancelado)
  const pedidosHistorial = pedidos.filter((pedido) => {
    const esHistorial = pedido.estado === "completado" || pedido.estado === "cancelado"
    const coincideBusqueda =
      pedido.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.cliente.email.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === "todos" || pedido.estado === filtroEstado
    return esHistorial && coincideBusqueda && coincideEstado
  })

  // Calcular ganancias del historial
  const gananciasHistorial = pedidosHistorial
    .filter((pedido) => pedido.estado === "completado")
    .reduce((total, pedido) => total + pedido.total, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  const renderPedidoCard = (pedido: Pedido, esHistorial = false) => (
    <Card key={pedido._id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">#{pedido.numero}</h3>
              <Badge className={getEstadoBadge(pedido.estado)}>{pedido.estado}</Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <p>
                <strong>Cliente:</strong> {pedido.cliente.nombre}
              </p>
              <p>
                <strong>:</strong> {pedido.cliente.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {pedido.cliente.telefono}
              </p>
              <p>
                <strong>Fecha:</strong> {pedido.createdAt ? formatearFecha(pedido.createdAt) : "N/A"}
              </p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                <strong>Productos:</strong> {pedido.items.length} items
              </p>
              <p className="text-lg font-bold text-yellow-600">{formatearPrecio(pedido.total)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setPedidoSeleccionado(pedido)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Pedido #{pedidoSeleccionado?.numero}</DialogTitle>
                  <DialogDescription>Detalles completos del pedido</DialogDescription>
                </DialogHeader>
                {pedidoSeleccionado && (
                  <div className="space-y-4">
                    {/* Información del Cliente */}
                    <div>
                      <h4 className="font-semibold mb-2">Información del Cliente</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                        <p>
                          <strong>Nombre:</strong> {pedidoSeleccionado.cliente.nombre}
                        </p>
                        <p>
                          <strong>Email:</strong> {pedidoSeleccionado.cliente.email}
                        </p>
                        <p>
                          <strong>Teléfono:</strong> {pedidoSeleccionado.cliente.telefono}
                        </p>
                        <p>
                          <strong>Dirección:</strong> {pedidoSeleccionado.cliente.direccion}
                        </p>
                      </div>
                    </div>

                    {/* Productos */}
                    <div>
                      <h4 className="font-semibold mb-2">Detalles del Pedido</h4>
                      <div className="space-y-2">
                        {pedidoSeleccionado.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">
                                {typeof item.producto === "object" && item.producto?.nombre
                                  ? item.producto.nombre
                                  : "Producto"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Cantidad: {item.cantidad} x {formatearPrecio(item.precio)}
                              </p>
                            </div>
                            <p className="font-semibold">{formatearPrecio(item.subtotal)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Información de Entrega */}
                    <div>
                      <h4 className="font-semibold mb-2">Información de Entrega</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                        <p>
                          <strong>Método de pago:</strong> {getMetodoPagoTexto(pedidoSeleccionado.metodoPago)}
                        </p>
                        {pedidoSeleccionado.notas && (
                          <p>
                            <strong>Notas:</strong> {pedidoSeleccionado.notas}
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-yellow-600">{formatearPrecio(pedidoSeleccionado.total)}</span>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Select
              value={pedido.estado}
              onValueChange={(nuevoEstado) => actualizarEstadoPedido(pedido._id!, nuevoEstado, esHistorial)}
              disabled={actualizando}
            >
              <SelectTrigger className="w-40">
                <Edit className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {esHistorial ? (
                  <>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="proceso">En Proceso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="proceso">En Proceso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => eliminarPedido(pedido._id!)}
              disabled={actualizando}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {toasts}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <p className="text-gray-600">Administra y procesa los pedidos de tus clientes</p>
      </div>

      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gestion">Gestión de Pedidos</TabsTrigger>
          <TabsTrigger value="historial" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Historial</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gestion" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por número, cliente o email..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="proceso">En Proceso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Pedidos en Gestión */}
          <div className="grid gap-4">{pedidosGestion.map((pedido) => renderPedidoCard(pedido, false))}</div>

          {pedidosGestion.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No se encontraron pedidos con los filtros aplicados</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="historial" className="space-y-6">
          {/* Estadísticas del Historial */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Completados</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {pedidosHistorial.filter((p) => p.estado === "completado").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cancelados</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {pedidosHistorial.filter((p) => p.estado === "cancelado").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatearPrecio(gananciasHistorial)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros para Historial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por número, cliente o email..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Pedidos en Historial */}
          <div className="grid gap-4">{pedidosHistorial.map((pedido) => renderPedidoCard(pedido, true))}</div>

          {pedidosHistorial.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No se encontraron pedidos en el historial</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

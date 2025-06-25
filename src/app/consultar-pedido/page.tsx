"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import { Header } from "@/components/Header"
import { DynamicTitle } from "@/components/DynamicTitle"
import { formatearPrecio } from "@/lib/utils"

interface Pedido {
  _id: string
  numero: string
  cliente: {
    nombre: string
    email: string
    telefono: string
    direccion: string
  }
  items: Array<{
    producto: {
      nombre: string
      precio: number
    }
    cantidad: number
    subtotal: number
  }>
  total: number
  estado: string
  fechaPedido: string
  fechaEntrega?: string
  notas?: string
  metodoPago: string
}

export default function ConsultarPedido() {
  const [codigo, setCodigo] = useState("")
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const buscarPedido = async () => {
    if (!codigo.trim()) {
      setError("Por favor ingresa un código de pedido")
      return
    }

    setLoading(true)
    setError("")
    setPedido(null)

    try {
      // Limpiar el código y asegurar formato correcto
      const codigoLimpio = codigo.trim().toUpperCase()

      const response = await fetch(`/api/pedidos/consultar/${encodeURIComponent(codigoLimpio)}`)
      const data = await response.json()

      if (data.success && data.pedido) {
        setPedido(data.pedido)
      } else {
        setError(data.error || "Pedido no encontrado. Verifica que el código sea correcto.")
      }
    } catch (error) {
      console.error("Error al consultar pedido:", error)
      setError("Error al consultar el pedido. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEstadoInfo = (estado: string) => {
    const estados = {
      pendiente: { color: "bg-yellow-100 text-yellow-800", icon: Clock, texto: "Pendiente" },
      proceso: { color: "bg-blue-100 text-blue-800", icon: Package, texto: "En Proceso" },
      completado: { color: "bg-green-100 text-green-800", icon: CheckCircle, texto: "Completado" },
      cancelado: { color: "bg-red-100 text-red-800", icon: XCircle, texto: "Cancelado" },
      confirmado: { color: "bg-blue-100 text-blue-800", icon: Package, texto: "Confirmado" },
      preparando: { color: "bg-orange-100 text-orange-800", icon: Package, texto: "Preparando" },
      listo: { color: "bg-green-100 text-green-800", icon: CheckCircle, texto: "Listo para entrega" },
      entregado: { color: "bg-gray-100 text-gray-800", icon: CheckCircle, texto: "Entregado" },
    }
    return estados[estado as keyof typeof estados] || estados.pendiente
  }

  const getMetodoPagoTexto = (metodo: string) => {
    const metodos = {
      efectivo: "Efectivo",
      transferencia: "Transferencia Bancaria",
      "billetera-electronica": "Billetera Electrónica",
    }
    return metodos[metodo as keyof typeof metodos] || metodo
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      <DynamicTitle />
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultar Estado del Pedido</h1>
          <p className="text-gray-600">Ingresa tu código de pedido para ver el estado actual</p>
        </div>

        {/* Formulario de búsqueda */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Buscar Pedido</span>
            </CardTitle>
            <CardDescription>Ingresa el código que recibiste al hacer tu pedido (ej: AP-0001)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="codigo">Código del Pedido</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="Ejemplo: AP-0001"
                  className="mt-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      buscarPedido()
                    }
                  }}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={buscarPedido} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700">
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* Resultado del pedido */}
        {pedido && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Pedido #{pedido.numero}</CardTitle>
                  <CardDescription>Realizado el {formatearFecha(pedido.fechaPedido)}</CardDescription>
                </div>
                <div className="text-right">
                  {(() => {
                    const estadoInfo = getEstadoInfo(pedido.estado)
                    const IconComponent = estadoInfo.icon
                    return (
                      <Badge className={`${estadoInfo.color} flex items-center space-x-1`}>
                        <IconComponent className="h-4 w-4" />
                        <span>{estadoInfo.texto}</span>
                      </Badge>
                    )
                  })()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información del cliente */}
              <div>
                <h3 className="font-semibold mb-2">Información de Entrega</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                  <p>
                    <strong>Cliente:</strong> {pedido.cliente.nombre}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {pedido.cliente.telefono}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {pedido.cliente.direccion}
                  </p>
                  <p>
                    <strong>Método de pago:</strong> {getMetodoPagoTexto(pedido.metodoPago)}
                  </p>
                  {pedido.fechaEntrega && (
                    <p>
                      <strong>Fecha preferida:</strong> {formatearFecha(pedido.fechaEntrega)}
                    </p>
                  )}
                </div>
              </div>

              {/* Productos */}
              <div>
                <h3 className="font-semibold mb-2">Productos</h3>
                <div className="space-y-2">
                  {pedido.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.producto.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {item.cantidad} x {formatearPrecio(item.producto.precio)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatearPrecio(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {pedido.notas && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{pedido.notas}</p>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-yellow-600">{formatearPrecio(pedido.total)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

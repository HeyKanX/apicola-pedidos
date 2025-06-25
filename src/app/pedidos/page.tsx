"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, User, MapPin, Minus, Plus, Trash2 } from "lucide-react"
import { Header } from "@/components/Header"
import { DynamicTitle } from "@/components/DynamicTitle"
import { ResumenPedido } from "@/components/ResumenPedido"
import { useConfiguracion } from "@/contexts/ConfiguracionContext"
import { formatearPrecio } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface Producto {
  _id?: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
  imagen: string
  activo: boolean
  unidadMedida: string
}

interface ItemCarrito {
  producto: Producto
  cantidad: number
}

interface DatosCliente {
  nombre: string
  email: string
  telefono: string
  direccionEntrega: string
}

interface DatosEntrega {
  notas: string
  metodoPago: "efectivo" | "transferencia" | "billetera-electronica"
}

export default function PedidosPage() {
  const { configuracion } = useConfiguracion()
  const [productos, setProductos] = useState<Producto[]>([])
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [datosCliente, setDatosCliente] = useState<DatosCliente>({
    nombre: "",
    email: "",
    telefono: "",
    direccionEntrega: "",
  })
  const [datosEntrega, setDatosEntrega] = useState<DatosEntrega>({
    notas: "",
    metodoPago: "efectivo",
  })
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [paso, setPaso] = useState(1)
  const [pedidoCreado, setPedidoCreado] = useState<any>(null)
  const { toast, toasts } = useToast()

  useEffect(() => {
    fetchProductos()
    cargarCarrito()
  }, [])

  // Cargar carrito del localStorage
  const cargarCarrito = () => {
    const carritoGuardado = localStorage.getItem("carrito")
    if (carritoGuardado) {
      try {
        const carritoData = JSON.parse(carritoGuardado)
        setCarrito(carritoData)
      } catch (error) {
        console.error("Error al cargar carrito:", error)
        localStorage.removeItem("carrito")
      }
    }
  }

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (carrito.length > 0) {
      localStorage.setItem("carrito", JSON.stringify(carrito))
    } else {
      localStorage.removeItem("carrito")
    }
  }, [carrito])

  const fetchProductos = async () => {
    try {
      const response = await fetch("/api/productos")
      const data = await response.json()
      if (data.success) {
        setProductos(data.productos)
      }
    } catch (error) {
      console.error("Error al cargar productos:", error)
    } finally {
      setLoading(false)
    }
  }

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto._id === producto._id)
      if (existente) {
        return prev.map((item) =>
          item.producto._id === producto._id ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
      }
      return [...prev, { producto, cantidad: 1 }]
    })

    toast({
      title: "Producto agregado",
      description: `${producto.nombre} agregado al carrito`,
      variant: "success",
    })
  }

  const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(productoId)
      return
    }
    setCarrito((prev) =>
      prev.map((item) => (item.producto._id === productoId ? { ...item, cantidad: nuevaCantidad } : item)),
    )
  }

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito((prev) => prev.filter((item) => item.producto._id !== productoId))
  }

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.producto.precio * item.cantidad, 0)
  }

  const validarFormulario = () => {
    return (
      datosCliente.nombre.trim() &&
      datosCliente.email.trim() &&
      datosCliente.telefono.trim() &&
      datosCliente.direccionEntrega.trim() &&
      carrito.length > 0
    )
  }

  const enviarPedido = async () => {
    if (!validarFormulario()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "error",
      })
      return
    }

    setEnviando(true)
    try {
      const pedidoData = {
        cliente: {
          nombre: datosCliente.nombre,
          email: datosCliente.email,
          telefono: datosCliente.telefono,
          direccion: datosCliente.direccionEntrega,
        },
        items: carrito.map((item) => ({
          producto: item.producto._id,
          cantidad: item.cantidad,
          precio: item.producto.precio,
          subtotal: item.cantidad * item.producto.precio,
        })),
        notas: datosEntrega.notas || undefined,
        metodoPago: datosEntrega.metodoPago,
      }

      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoData),
      })

      const data = await response.json()

      if (data.success) {
        // Mostrar resumen del pedido
        setPedidoCreado(data.pedido)

        // Limpiar formulario y carrito
        setCarrito([])
        localStorage.removeItem("carrito")
        setDatosCliente({ nombre: "", email: "", telefono: "", direccionEntrega: "" })
        setDatosEntrega({ notas: "", metodoPago: "efectivo" })
        setPaso(1)
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error al enviar pedido:", error)
      toast({
        title: "Error",
        description: "Error al enviar el pedido. Por favor intenta de nuevo.",
        variant: "error",
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      <DynamicTitle />
      <Header />
      {toasts}

      {/* Resumen del pedido */}
      {pedidoCreado && (
        <ResumenPedido
          pedido={{
            numero: pedidoCreado.numero,
            total: pedidoCreado.total,
            cliente: pedidoCreado.cliente,
          }}
          onClose={() => setPedidoCreado(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicador de pasos */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    paso >= num ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {num}
                </div>
                {num < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-600">
              {paso === 1 && "Seleccionar Productos"}
              {paso === 2 && "Datos del Cliente"}
              {paso === 3 && "Confirmar Pedido"}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2">
            {paso === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Seleccionar Productos</span>
                  </CardTitle>
                  <CardDescription>Elige los productos que deseas pedir</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Cargando productos...</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {productos.map((producto) => (
                        <div key={producto._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{producto.nombre}</h3>
                            <Badge variant="secondary">{producto.categoria}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{producto.descripcion}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-yellow-600">{formatearPrecio(producto.precio)}</p>
                              <p className="text-xs text-gray-500">
                                Stock: {producto.stock} {producto.unidadMedida}
                              </p>
                            </div>
                            <Button
                              onClick={() => agregarAlCarrito(producto)}
                              size="sm"
                              disabled={producto.stock === 0}
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {paso === 2 && (
              <div className="space-y-6">
                {/* Datos del Cliente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Datos del Cliente</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombre">Nombre Completo *</Label>
                        <Input
                          id="nombre"
                          value={datosCliente.nombre}
                          onChange={(e) => setDatosCliente({ ...datosCliente, nombre: e.target.value })}
                          placeholder="Juan Pérez"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefono">Teléfono *</Label>
                        <Input
                          id="telefono"
                          value={datosCliente.telefono}
                          onChange={(e) => setDatosCliente({ ...datosCliente, telefono: e.target.value })}
                          placeholder="+51 900 123 456"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={datosCliente.email}
                        onChange={(e) => setDatosCliente({ ...datosCliente, email: e.target.value })}
                        placeholder="juan@ejemplo.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccionEntrega">Dirección de Entrega *</Label>
                      <Textarea
                        id="direccionEntrega"
                        value={datosCliente.direccionEntrega}
                        onChange={(e) => setDatosCliente({ ...datosCliente, direccionEntrega: e.target.value })}
                        placeholder="Av. Los Colmenares 123, Lima, Perú"
                        rows={3}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Información de Entrega */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Información de Entrega</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="metodoPago">Método de Pago *</Label>
                      <Select
                        value={datosEntrega.metodoPago}
                        onValueChange={(value: "efectivo" | "transferencia" | "billetera-electronica") =>
                          setDatosEntrega({ ...datosEntrega, metodoPago: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                          <SelectItem value="billetera-electronica">Billetera Electrónica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notas">Notas Adicionales</Label>
                      <Textarea
                        id="notas"
                        value={datosEntrega.notas}
                        onChange={(e) => setDatosEntrega({ ...datosEntrega, notas: e.target.value })}
                        placeholder="Instrucciones especiales, horarios preferidos, etc."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {paso === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Confirmar Pedido</CardTitle>
                  <CardDescription>Revisa todos los datos antes de confirmar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Datos del Cliente */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Datos del Cliente
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                      <p>
                        <strong>Nombre:</strong> {datosCliente.nombre}
                      </p>
                      <p>
                        <strong>Email:</strong> {datosCliente.email}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {datosCliente.telefono}
                      </p>
                      <p>
                        <strong>Dirección de entrega:</strong> {datosCliente.direccionEntrega}
                      </p>
                    </div>
                  </div>

                  {/* Información de Entrega */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Información de Entrega
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                      <p>
                        <strong>Método de pago:</strong> {datosEntrega.metodoPago}
                      </p>
                      {datosEntrega.notas && (
                        <p>
                          <strong>Notas:</strong> {datosEntrega.notas}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumen del Carrito */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resumen del Pedido</span>
                  <Badge>{carrito.length} productos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {carrito.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay productos en el carrito</p>
                ) : (
                  <div className="space-y-4">
                    {carrito.map((item) => (
                      <div key={item.producto._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.producto.nombre}</h4>
                          <p className="text-xs text-gray-500">{formatearPrecio(item.producto.precio)} c/u</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidad(item.producto._id!, item.cantidad - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.cantidad}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidad(item.producto._id!, item.cantidad + 1)}
                            disabled={item.cantidad >= item.producto.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => eliminarDelCarrito(item.producto._id!)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-yellow-600">{formatearPrecio(calcularTotal())}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {paso === 1 && (
                        <Button
                          onClick={() => setPaso(2)}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                          disabled={carrito.length === 0}
                        >
                          Continuar
                        </Button>
                      )}

                      {paso === 2 && (
                        <div className="space-y-2">
                          <Button
                            onClick={() => setPaso(3)}
                            className="w-full bg-yellow-600 hover:bg-yellow-700"
                            disabled={!validarFormulario()}
                          >
                            Revisar Pedido
                          </Button>
                          <Button onClick={() => setPaso(1)} variant="outline" className="w-full">
                            Volver
                          </Button>
                        </div>
                      )}

                      {paso === 3 && (
                        <div className="space-y-2">
                          <Button
                            onClick={enviarPedido}
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={enviando}
                          >
                            {enviando ? "Enviando..." : "Confirmar Pedido"}
                          </Button>
                          <Button onClick={() => setPaso(2)} variant="outline" className="w-full">
                            Volver
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

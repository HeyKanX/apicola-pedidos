"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/Header"
import { DynamicTitle } from "@/components/DynamicTitle"
import { useConfiguracion } from "@/contexts/ConfiguracionContext"
import { formatearPrecio } from "@/lib/utils"
import type { Producto } from "@/types"

export default function ProductosPage() {
  const { configuracion } = useConfiguracion()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState("todos")
  const [carrito, setCarrito] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetchProductos()
    // Cargar carrito del localStorage
    const carritoGuardado = localStorage.getItem("carrito")
    if (carritoGuardado) {
      const carritoData = JSON.parse(carritoGuardado)
      const carritoCount: { [key: string]: number } = {}
      carritoData.forEach((item: any) => {
        carritoCount[item.producto._id] = item.cantidad
      })
      setCarrito(carritoCount)
    }
  }, [])

  const fetchProductos = async () => {
    try {
      setLoading(true)
      const url = categoria === "todos" ? "/api/productos" : `/api/productos?categoria=${categoria}`

      const response = await fetch(url)
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

  useEffect(() => {
    fetchProductos()
  }, [categoria])

  const agregarAlCarrito = (producto: Producto) => {
    // Obtener carrito actual del localStorage
    const carritoGuardado = localStorage.getItem("carrito")
    let carritoActual = carritoGuardado ? JSON.parse(carritoGuardado) : []

    // Buscar si el producto ya existe
    const existente = carritoActual.find((item: any) => item.producto._id === producto._id)

    if (existente) {
      // Incrementar cantidad
      carritoActual = carritoActual.map((item: any) =>
        item.producto._id === producto._id ? { ...item, cantidad: item.cantidad + 1 } : item,
      )
    } else {
      // Agregar nuevo producto
      carritoActual.push({ producto, cantidad: 1 })
    }

    // Guardar en localStorage
    localStorage.setItem("carrito", JSON.stringify(carritoActual))

    // Actualizar estado local
    setCarrito((prev) => ({
      ...prev,
      [producto._id!]: (prev[producto._id!] || 0) + 1,
    }))

    // Mostrar confirmación
    alert(`${producto.nombre} agregado al carrito`)
  }

  const categorias = [
    { value: "todos", label: "Todos los productos" },
    { value: "miel", label: "Miel" },
    { value: "polen", label: "Polen" },
    { value: "propóleo", label: "Propóleo" },
    { value: "cera", label: "Cera" },
    { value: "jalea-real", label: "Jalea Real" },
  ]

  const totalCarrito = Object.values(carrito).reduce((sum, cantidad) => sum + cantidad, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      <DynamicTitle />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón de carrito */}
        <div className="mb-6 flex justify-end">
          <Link href="/pedidos">
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ir al Carrito
              {totalCarrito > 0 && <Badge className="absolute -top-2 -right-2 bg-yellow-600">{totalCarrito}</Badge>}
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Nuestros Productos</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filtrar por:</span>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Productos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((producto) => (
              <Card key={producto._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={producto.imagen || "/placeholder.svg"}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-yellow-600">{producto.categoria}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                  <CardDescription className="text-sm">{producto.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{formatearPrecio(producto.precio)}</p>
                      <p className="text-sm text-gray-500">por {producto.unidadMedida}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Stock disponible</p>
                      <p className="font-semibold">
                        {producto.stock} {producto.unidadMedida}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => agregarAlCarrito(producto)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    disabled={producto.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {producto.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

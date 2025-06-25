"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Upload, Package, DollarSign, AlertTriangle, Warehouse } from "lucide-react"
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

interface EstadisticasProductos {
  totalProductos: number
  valorInventario: number
  productosSinStock: number
  productosBajoStock: number
}

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasProductos>({
    totalProductos: 0,
    valorInventario: 0,
    productosSinStock: 0,
    productosBajoStock: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [formData, setFormData] = useState<Producto>({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria: "miel",
    imagen: "/placeholder.svg?height=300&width=300",
    activo: true,
    unidadMedida: "kg",
  })
  const { toast, toasts } = useToast()

  useEffect(() => {
    fetchProductos()
  }, [])

  useEffect(() => {
    calcularEstadisticas()
  }, [productos])

  const fetchProductos = async () => {
    try {
      const response = await fetch("/api/productos")
      const data = await response.json()
      if (data.success) {
        setProductos(data.productos)
      }
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const calcularEstadisticas = () => {
    const totalProductos = productos.length
    const valorInventario = productos.reduce((total, p) => total + p.precio * p.stock, 0)
    const productosSinStock = productos.filter((p) => p.stock === 0).length
    const productosBajoStock = productos.filter((p) => p.stock > 0 && p.stock <= 5).length

    setEstadisticas({
      totalProductos,
      valorInventario,
      productosSinStock,
      productosBajoStock,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      const url = editando ? `/api/productos/${editando._id}` : "/api/productos"
      const method = editando ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: editando ? "Producto actualizado exitosamente" : "Producto creado exitosamente",
          variant: "success",
        })
        fetchProductos()
        setDialogOpen(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast({
        title: "Error",
        description: "Error al guardar el producto",
        variant: "error",
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleEdit = (producto: Producto) => {
    setEditando(producto)
    setFormData(producto)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return

    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: "Producto eliminado exitosamente",
          variant: "success",
        })
        fetchProductos()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: "Error al eliminar el producto",
        variant: "error",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      stock: 0,
      categoria: "miel",
      imagen: "/placeholder.svg?height=300&width=300",
      activo: true,
      unidadMedida: "kg",
    })
    setEditando(null)
  }

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(precio)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData({ ...formData, imagen: e.target?.result as string })
      }
      reader.readAsDataURL(file)
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
      {toasts}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalProductos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatearPrecio(estadisticas.valorInventario)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.productosSinStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{estadisticas.productosBajoStock}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600">Administra tu catálogo de productos apícolas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editando ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              <DialogDescription>
                {editando ? "Modifica los datos del producto" : "Agrega un nuevo producto a tu catálogo"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Producto *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miel">Miel</SelectItem>
                      <SelectItem value="polen">Polen</SelectItem>
                      <SelectItem value="propóleo">Propóleo</SelectItem>
                      <SelectItem value="cera">Cera</SelectItem>
                      <SelectItem value="jalea-real">Jalea Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="precio">Precio (PEN) *</Label>
                  <Input
                    id="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unidadMedida">Unidad de Medida *</Label>
                  <Select
                    value={formData.unidadMedida}
                    onValueChange={(value) => setFormData({ ...formData, unidadMedida: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogramos</SelectItem>
                      <SelectItem value="g">Gramos</SelectItem>
                      <SelectItem value="ml">Mililitros</SelectItem>
                      <SelectItem value="l">Litros</SelectItem>
                      <SelectItem value="unidad">Unidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="imagen">Imagen del Producto</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input id="imagen" type="file" accept="image/*" onChange={handleImageUpload} className="flex-1" />
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Subir
                    </Button>
                  </div>
                  {formData.imagen && (
                    <div className="w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={formData.imagen || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={guardando} className="bg-yellow-600 hover:bg-yellow-700">
                  {guardando ? "Guardando..." : editando ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Productos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((producto) => (
          <Card key={producto._id} className="overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={producto.imagen || "/placeholder.svg"}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-2 right-2 bg-yellow-600">{producto.categoria}</Badge>
              {producto.stock === 0 && <Badge className="absolute top-2 left-2 bg-red-600">Sin Stock</Badge>}
              {producto.stock > 0 && producto.stock <= 5 && (
                <Badge className="absolute top-2 left-2 bg-orange-600">Bajo Stock</Badge>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{producto.nombre}</CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">{producto.descripcion}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-yellow-600">{formatearPrecio(producto.precio)}</span>
                  <span className="text-sm text-gray-500">por {producto.unidadMedida}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>
                    Stock: {producto.stock} {producto.unidadMedida}
                  </span>
                  <Badge variant={producto.activo ? "default" : "secondary"}>
                    {producto.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <span>Valor en stock: {formatearPrecio(producto.precio * producto.stock)}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(producto)} className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(producto._id!)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {productos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600 mb-4">Comienza agregando tu primer producto al catálogo</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

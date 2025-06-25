export interface Producto {
  _id?: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: "miel" | "polen" | "propóleo" | "cera" | "jalea-real"
  imagen: string
  activo: boolean
  unidadMedida: "kg" | "g" | "ml" | "l" | "unidad"
  createdAt?: Date
  updatedAt?: Date
}

export interface ItemPedido {
  producto: string | Producto
  cantidad: number
  precio: number
  subtotal: number
}

export interface Pedido {
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
  estado: "pendiente" | "confirmado" | "preparando" | "listo" | "entregado" | "cancelado" | "proceso" | "completado"
  fechaPedido: Date
  fechaEntrega?: Date
  notas?: string
  metodoPago: "efectivo" | "transferencia" | "tarjeta" | "billetera-electronica"
  createdAt?: Date
  updatedAt?: Date
}

export interface Usuario {
  _id?: string
  nombre: string
  email: string
  password: string
  telefono?: string
  direccion?: string
  rol: "cliente" | "admin"
  activo: boolean
  createdAt?: Date
  updatedAt?: Date
}

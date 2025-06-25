import mongoose from "mongoose"

const ProductoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    categoria: {
      type: String,
      required: true,
      enum: ["miel", "polen", "propóleo", "cera", "jalea-real"],
    },
    imagen: {
      type: String,
      default: "/placeholder.svg?height=300&width=300",
    },
    activo: { type: Boolean, default: true },
    unidadMedida: {
      type: String,
      default: "kg",
      enum: ["kg", "g", "ml", "l", "unidad"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Índices para búsquedas eficientes
ProductoSchema.index({ categoria: 1, activo: 1 })
ProductoSchema.index({ nombre: "text", descripcion: "text" })

export default mongoose.models.Producto || mongoose.model("Producto", ProductoSchema)

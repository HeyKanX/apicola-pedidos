import mongoose from "mongoose"

const ItemPedidoSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },
  cantidad: { type: Number, required: true, min: 1 },
  precio: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
})

const PedidoSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      unique: true,
    },
    cliente: {
      nombre: { type: String, required: true },
      email: { type: String, required: true },
      telefono: { type: String, required: true },
      direccion: { type: String, required: true },
    },
    items: [ItemPedidoSchema],
    total: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ["pendiente", "confirmado", "preparando", "listo", "entregado", "cancelado", "proceso", "completado"],
      default: "pendiente",
    },
    fechaPedido: { type: Date, default: Date.now },
    notas: String,
    metodoPago: {
      type: String,
      enum: ["efectivo", "transferencia", "billetera-electronica"],
      default: "efectivo",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Generar número de pedido automáticamente
PedidoSchema.pre("save", async function (next) {
  if (!this.numero) {
    try {
      // Verificar si hay un reseteo de numeración
      const ControlSchema = new mongoose.Schema({
        tipo: String,
        ultimoNumero: Number,
        reseteadoEn: Date,
      })

      const Control = mongoose.models.Control || mongoose.model("Control", ControlSchema)
      const controlReset = await Control.findOne({ tipo: "pedido_numeracion" })

      let siguienteNumero = 1

      if (controlReset) {
        // Si hay un control de reset, empezar desde 1
        console.log("🔄 Usando numeración reseteada")
        siguienteNumero = 1

        // Eliminar el control para que no interfiera con futuros pedidos
        await Control.deleteOne({ tipo: "pedido_numeracion" })
      } else {
        // Obtener el último pedido para generar el siguiente número
        const ultimoPedido = await mongoose.models.Pedido.findOne().sort({ createdAt: -1 })

        if (ultimoPedido && ultimoPedido.numero) {
          const numeroActual = Number.parseInt(ultimoPedido.numero.split("-")[1]) || 0
          siguienteNumero = numeroActual + 1
        }
      }

      this.numero = `AP-${String(siguienteNumero).padStart(4, "0")}`
      console.log("📝 Nuevo número de pedido generado:", this.numero)
    } catch (error) {
      console.error("❌ Error generando número de pedido:", error)
      // Si hay error, generar un número basado en timestamp
      this.numero = `AP-${Date.now().toString().slice(-4)}`
    }
  }
  next()
})

// Índices
PedidoSchema.index({ numero: 1 })
PedidoSchema.index({ "cliente.email": 1 })
PedidoSchema.index({ estado: 1, fechaPedido: -1 })

export default mongoose.models.Pedido || mongoose.model("Pedido", PedidoSchema)

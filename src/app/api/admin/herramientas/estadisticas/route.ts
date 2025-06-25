import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Pedido from "@/models/Pedido"
import Producto from "@/models/Producto"
import Usuario from "@/models/Usuario"

export async function GET() {
  try {
    await dbConnect()

    // Obtener estadísticas
    const totalPedidos = await Pedido.countDocuments()
    const totalProductos = await Producto.countDocuments()
    const totalUsuarios = await Usuario.countDocuments()

    // Obtener el último número de pedido
    const ultimoPedido = await Pedido.findOne().sort({ createdAt: -1 })
    const ultimoNumeroPedido = ultimoPedido?.numero || null

    // Buscar pedidos que podrían estar ocultos
    const todosPedidos = await Pedido.find({}, "numero estado createdAt").sort({ numero: 1 })

    console.log("📊 Estadísticas de BD:")
    console.log("- Total pedidos:", totalPedidos)
    console.log("- Último número:", ultimoNumeroPedido)
    console.log(
      "- Todos los números:",
      todosPedidos.map((p) => p.numero),
    )

    const estadisticas = {
      totalPedidos,
      totalProductos,
      totalUsuarios,
      ultimoNumeroPedido,
      pedidosOcultos: 0, // Por ahora
      todosPedidos: todosPedidos.map((p) => ({
        numero: p.numero,
        estado: p.estado,
        fecha: p.createdAt,
      })),
    }

    return NextResponse.json({
      success: true,
      estadisticas,
    })
  } catch (error: any) {
    console.error("❌ Error al obtener estadísticas:", error)
    return NextResponse.json({ success: false, error: "Error al obtener estadísticas" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Pedido from "@/models/Pedido"
import Producto from "@/models/Producto"

export async function POST() {
  try {
    await dbConnect()

    // Obtener todos los pedidos antes de eliminar
    const pedidosAEliminar = await Pedido.find()
    console.log(
      "🗑️ Pedidos a eliminar:",
      pedidosAEliminar.map((p) => p.numero),
    )

    // Devolver stock a los productos
    for (const pedido of pedidosAEliminar) {
      if (pedido.estado !== "cancelado") {
        for (const item of pedido.items) {
          await Producto.findByIdAndUpdate(item.producto, {
            $inc: { stock: item.cantidad },
          })
        }
      }
    }

    // Eliminar todos los pedidos
    const resultado = await Pedido.deleteMany({})

    console.log("✅ Pedidos eliminados:", resultado.deletedCount)
    console.log("🔄 Stock devuelto a productos")

    return NextResponse.json({
      success: true,
      eliminados: resultado.deletedCount,
      message: "Todos los pedidos eliminados y numeración reseteada",
    })
  } catch (error: any) {
    console.error("❌ Error al limpiar pedidos:", error)
    return NextResponse.json({ success: false, error: "Error al limpiar pedidos: " + error.message }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Pedido from "@/models/Pedido"
import Producto from "@/models/Producto"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  try {
    await dbConnect()

    const { codigo } = await params
    console.log("🗑️ Eliminando pedido:", codigo)

    // Buscar el pedido
    const pedido = await Pedido.findOne({ numero: codigo })

    if (!pedido) {
      return NextResponse.json(
        {
          success: false,
          error: "Pedido no encontrado",
        },
        { status: 404 },
      )
    }

    // Devolver stock si el pedido no estaba cancelado
    if (pedido.estado !== "cancelado") {
      for (const item of pedido.items) {
        await Producto.findByIdAndUpdate(item.producto, {
          $inc: { stock: item.cantidad },
        })
      }
      console.log("📦 Stock devuelto a productos")
    }

    // Eliminar el pedido
    await Pedido.findOneAndDelete({ numero: codigo })

    console.log("✅ Pedido eliminado:", codigo)

    return NextResponse.json({
      success: true,
      message: `Pedido ${codigo} eliminado exitosamente`,
    })
  } catch (error: any) {
    console.error("❌ Error al eliminar pedido:", error)
    return NextResponse.json({ success: false, error: "Error al eliminar pedido: " + error.message }, { status: 500 })
  }
}

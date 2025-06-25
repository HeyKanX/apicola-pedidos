import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Pedido from "@/models/Pedido"

export async function GET(request: NextRequest, { params }: { params: { codigo: string } }) {
  try {
    await dbConnect()

    const codigo = params.codigo
    console.log("🔍 Buscando pedido:", codigo)

    // Buscar el pedido específico
    const pedido = await Pedido.findOne({ numero: codigo }).populate("items.producto")

    if (pedido) {
      console.log("✅ Pedido encontrado:", {
        numero: pedido.numero,
        estado: pedido.estado,
        cliente: pedido.cliente.nombre,
        total: pedido.total,
        fecha: pedido.createdAt,
      })

      return NextResponse.json({
        success: true,
        pedido: {
          numero: pedido.numero,
          estado: pedido.estado,
          cliente: pedido.cliente,
          total: pedido.total,
          items: pedido.items,
          createdAt: pedido.createdAt,
        },
      })
    } else {
      console.log("❌ Pedido no encontrado:", codigo)

      // Buscar pedidos similares
      const pedidosSimilares = await Pedido.find(
        {
          numero: { $regex: codigo.replace("AP-", ""), $options: "i" },
        },
        "numero estado",
      )

      console.log(
        "🔍 Pedidos similares:",
        pedidosSimilares.map((p) => p.numero),
      )

      return NextResponse.json(
        {
          success: false,
          error: "Pedido no encontrado",
          pedidosSimilares: pedidosSimilares.map((p) => p.numero),
        },
        { status: 404 },
      )
    }
  } catch (error: any) {
    console.error("❌ Error al buscar pedido:", error)
    return NextResponse.json({ success: false, error: "Error al buscar pedido: " + error.message }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Pedido from "@/models/Pedido"

export async function GET(request: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  try {
    await dbConnect()

    // Decodificar y limpiar el código
    const { codigo } = await params
    const codigoBusqueda = decodeURIComponent(codigo).trim().toUpperCase()

    console.log("Buscando pedido con código:", codigoBusqueda)

    // Buscar por número de pedido (código) - búsqueda exacta e insensible a mayúsculas
    const pedido = await Pedido.findOne({
      numero: { $regex: new RegExp(`^${codigoBusqueda}$`, "i") },
    }).populate("items.producto")

    if (!pedido) {
      console.log("Pedido no encontrado para código:", codigoBusqueda)

      // Buscar todos los pedidos para debug (solo en desarrollo)
      const todosPedidos = await Pedido.find({}, "numero").limit(5)
      console.log(
        "Códigos disponibles:",
        todosPedidos.map((p) => p.numero),
      )

      return NextResponse.json(
        {
          success: false,
          error: "Pedido no encontrado. Verifica que el código sea correcto.",
        },
        { status: 404 },
      )
    }

    console.log("Pedido encontrado:", pedido.numero)

    return NextResponse.json({
      success: true,
      pedido,
    })
  } catch (error: any) {
    console.error("Error al consultar pedido:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al consultar el pedido",
      },
      { status: 500 },
    )
  }
}

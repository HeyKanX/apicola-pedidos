import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Pedido from "@/models/Pedido"
import Producto from "@/models/Producto"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const pedido = await Pedido.findById(id).populate("items.producto")

    if (!pedido) {
      return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      pedido,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Error al obtener pedido" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const data = await request.json()

    // Obtener el pedido actual para comparar estados
    const pedidoActual = await Pedido.findById(id)
    if (!pedidoActual) {
      return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
    }

    const estadoAnterior = pedidoActual.estado
    const estadoNuevo = data.estado

    // Si se cancela un pedido que estaba en proceso o completado, devolver stock
    if (estadoNuevo === "cancelado" && (estadoAnterior === "proceso" || estadoAnterior === "completado")) {
      for (const item of pedidoActual.items) {
        await Producto.findByIdAndUpdate(item.producto, { $inc: { stock: item.cantidad } })
      }
    }

    // Si se reactiva un pedido cancelado, reducir stock nuevamente
    if (estadoAnterior === "cancelado" && (estadoNuevo === "proceso" || estadoNuevo === "completado")) {
      for (const item of pedidoActual.items) {
        const producto = await Producto.findById(item.producto)
        if (producto && producto.stock >= item.cantidad) {
          await Producto.findByIdAndUpdate(item.producto, { $inc: { stock: -item.cantidad } })
        } else {
          return NextResponse.json(
            { success: false, error: `Stock insuficiente para ${producto?.nombre || "producto"}` },
            { status: 400 },
          )
        }
      }
    }

    const pedido = await Pedido.findByIdAndUpdate(id, data, { new: true, runValidators: true })

    return NextResponse.json({
      success: true,
      pedido,
      message: "Pedido actualizado exitosamente",
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Error al actualizar pedido" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    // Obtener el pedido antes de eliminarlo para devolver stock si es necesario
    const pedido = await Pedido.findById(id)
    if (!pedido) {
      return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
    }

    // Si el pedido no está cancelado, devolver stock a los productos
    if (pedido.estado !== "cancelado") {
      for (const item of pedido.items) {
        await Producto.findByIdAndUpdate(item.producto, { $inc: { stock: item.cantidad } })
      }
    }

    // Eliminar el pedido
    await Pedido.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Pedido eliminado exitosamente",
    })
  } catch (error: any) {
    console.error("Error al eliminar pedido:", error)
    return NextResponse.json({ success: false, error: "Error al eliminar pedido" }, { status: 500 })
  }
}

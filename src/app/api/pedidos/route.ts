import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Pedido from "@/models/Pedido"
import Producto from "@/models/Producto"

export async function GET() {
  try {
    await dbConnect()
    const pedidos = await Pedido.find().populate("items.producto").sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      pedidos,
    })
  } catch (error: any) {
    console.error("Error al obtener pedidos:", error)
    return NextResponse.json({ success: false, error: "Error al obtener pedidos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const data = await request.json()

    console.log("Datos recibidos para crear pedido:", data)

    // Validar que los datos requeridos estén presentes
    if (!data.cliente || !data.items || data.items.length === 0) {
      return NextResponse.json({ success: false, error: "Datos incompletos del pedido" }, { status: 400 })
    }

    // Validar datos del cliente
    const { nombre, email, telefono, direccion } = data.cliente
    if (!nombre || !email || !telefono || !direccion) {
      return NextResponse.json({ success: false, error: "Datos del cliente incompletos" }, { status: 400 })
    }

    // Validar stock disponible y calcular totales
    let totalCalculado = 0
    const itemsValidados = []

    for (const item of data.items) {
      const producto = await Producto.findById(item.producto)
      if (!producto) {
        return NextResponse.json({ success: false, error: `Producto ${item.producto} no encontrado` }, { status: 400 })
      }

      if (!producto.activo) {
        return NextResponse.json(
          { success: false, error: `Producto ${producto.nombre} no está disponible` },
          { status: 400 },
        )
      }

      if (producto.stock < item.cantidad) {
        return NextResponse.json(
          { success: false, error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}` },
          { status: 400 },
        )
      }

      const subtotal = item.cantidad * producto.precio
      totalCalculado += subtotal

      itemsValidados.push({
        producto: item.producto,
        cantidad: item.cantidad,
        precio: producto.precio,
        subtotal: subtotal,
      })
    }

    // Crear el pedido
    const nuevoPedido = new Pedido({
      cliente: data.cliente,
      items: itemsValidados,
      total: totalCalculado,
      estado: "pendiente",
      notas: data.notas || "",
      metodoPago: data.metodoPago || "efectivo",
    })

    const pedidoGuardado = await nuevoPedido.save()

    // Actualizar stock de productos
    for (const item of itemsValidados) {
      await Producto.findByIdAndUpdate(item.producto, { $inc: { stock: -item.cantidad } })
    }

    // Obtener el pedido completo con productos poblados
    const pedidoCompleto = await Pedido.findById(pedidoGuardado._id).populate("items.producto")

    console.log("Pedido creado exitosamente:", pedidoCompleto.numero)

    return NextResponse.json({
      success: true,
      pedido: pedidoCompleto,
      message: "Pedido creado exitosamente",
    })
  } catch (error: any) {
    console.error("Error al crear pedido:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor: " + error.message }, { status: 500 })
  }
}

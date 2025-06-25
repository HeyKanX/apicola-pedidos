import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Producto from "@/models/Producto"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get("categoria")

    // Corregir el tipado del query
    const query: any = { activo: true }
    if (categoria && categoria !== "todos") {
      query.categoria = categoria
    }

    const productos = await Producto.find(query).sort({ nombre: 1 })

    return NextResponse.json({
      success: true,
      productos,
    })
  } catch (error: any) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ success: false, error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const data = await request.json()

    const producto = await Producto.create(data)

    return NextResponse.json({
      success: true,
      producto,
      message: "Producto creado exitosamente",
    })
  } catch (error: any) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ success: false, error: "Error al crear producto" }, { status: 500 })
  }
}

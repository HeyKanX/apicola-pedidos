import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Producto from "@/models/Producto"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const producto = await Producto.findById(id)

    if (!producto) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      producto,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Error al obtener producto" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const data = await request.json()

    const producto = await Producto.findByIdAndUpdate(id, data, { new: true, runValidators: true })

    if (!producto) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      producto,
      message: "Producto actualizado exitosamente",
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const producto = await Producto.findByIdAndUpdate(id, { activo: false }, { new: true })

    if (!producto) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Producto desactivado exitosamente",
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Error al desactivar producto" }, { status: 500 })
  }
}

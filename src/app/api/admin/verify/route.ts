import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Usuario from "@/models/Usuario"

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: "Token requerido" }, { status: 401 })
    }

    // Decodificar token simple
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8")
      const [userId] = decoded.split(":")

      const usuario = await Usuario.findById(userId)

      if (!usuario || usuario.rol !== "admin") {
        return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      })
    } catch (error) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
    }
  } catch (error: any) {
    console.error("Error en verificación:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

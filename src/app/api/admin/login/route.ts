import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Usuario from "@/models/Usuario"

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { email, password } = await request.json()

    // Buscar usuario admin
    const usuario = await Usuario.findOne({ email, rol: "admin" })

    if (!usuario) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 401 })
    }

    // Verificar contraseña
    const isValidPassword = await usuario.comparePassword(password)

    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: "Contraseña incorrecta" }, { status: 401 })
    }

    // Crear token simple (sin JWT por ahora)
    const token = Buffer.from(`${usuario._id}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      success: true,
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    })
  } catch (error: any) {
    console.error("Error en login:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

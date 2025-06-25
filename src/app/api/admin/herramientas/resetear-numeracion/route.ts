import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import mongoose from "mongoose"

export async function POST() {
  try {
    await dbConnect()

    console.log("🔄 Iniciando reseteo de numeración...")

    // Método 1: Eliminar contadores si existen
    try {
      const db = mongoose.connection.db
      if (db) {
        await db.collection("counters").deleteMany({ _id: /pedido/ })
        console.log("🗑️ Contadores de pedidos eliminados")
      }
    } catch (error) {
      console.log("⚠️ No se encontraron contadores para eliminar")
    }

    // Método 2: Crear un documento de control para resetear
    const ControlSchema = new mongoose.Schema({
      tipo: String,
      ultimoNumero: Number,
      reseteadoEn: Date,
    })

    const Control = mongoose.models.Control || mongoose.model("Control", ControlSchema)

    // Eliminar control anterior y crear uno nuevo
    await Control.deleteMany({ tipo: "pedido_numeracion" })
    await Control.create({
      tipo: "pedido_numeracion",
      ultimoNumero: 0,
      reseteadoEn: new Date(),
    })

    console.log("✅ Numeración reseteada exitosamente")
    console.log("📝 El próximo pedido será AP-0001")

    return NextResponse.json({
      success: true,
      message: "Numeración reseteada. El próximo pedido será AP-0001",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Error al resetear numeración:", error)

    // Información adicional para debug
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack?.split("\n")[0],
    })

    return NextResponse.json(
      {
        success: false,
        error: "Error al resetear numeración",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

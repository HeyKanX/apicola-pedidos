import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("🔄 Intentando conectar a MongoDB...")
    console.log("URI:", process.env.MONGODB_URI ? "✅ Definida" : "❌ No definida")

    await dbConnect()

    console.log("✅ Conexión exitosa a MongoDB")
    return NextResponse.json({
      success: true,
      message: "Conexión exitosa a MongoDB Atlas",
    })
  } catch (error: any) {
    console.error("❌ Error de conexión:", error.message)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import mongoose from "mongoose"

const ConfiguracionSchema = new mongoose.Schema(
  {
    nombreEmpresa: { type: String, default: "Apícola Dorada" },
    tituloPagina: { type: String, default: "Miel Pura y Natural Directo del Colmenar" },
    subtituloPagina: { type: String, default: "Descubre nuestra selección de productos apícolas..." },
    telefono: { type: String, default: "+57 300 123 4567" },
    direccion: { type: String, default: "Finca La Colmena, Vereda El Panal" },
    email: { type: String, default: "contacto@apicoladorada.com" },
    facebook: { type: String, default: "https://facebook.com/apicoladorada" },
    instagram: { type: String, default: "https://instagram.com/apicoladorada" },
    x: { type: String, default: "https://x.com/apicoladorada" },
    tiktok: { type: String, default: "https://tiktok.com/@apicoladorada" },
    imagenes: [{ type: String }],
    logo: { type: String, default: "🍯" },
    tipoLogo: { type: String, enum: ["predefinido", "personalizado"], default: "predefinido" },
  },
  { timestamps: true },
)

const Configuracion = mongoose.models.Configuracion || mongoose.model("Configuracion", ConfiguracionSchema)

export async function GET() {
  try {
    await dbConnect()
    let configuracion = await Configuracion.findOne()

    if (!configuracion) {
      console.log("📝 Creando configuración por defecto")
      configuracion = await Configuracion.create({})
    }

    console.log("📖 Configuración obtenida de BD:", {
      logo: configuracion.logo?.substring(0, 50) + (configuracion.logo?.length > 50 ? "..." : ""),
      tipoLogo: configuracion.tipoLogo,
      nombreEmpresa: configuracion.nombreEmpresa,
    })

    return NextResponse.json({
      success: true,
      configuracion,
    })
  } catch (error: any) {
    console.error("❌ Error al obtener configuración:", error)
    return NextResponse.json({ success: false, error: "Error al obtener configuración" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const data = await request.json()

    console.log("💾 Guardando configuración en BD:", {
      logo: data.logo?.substring(0, 50) + (data.logo?.length > 50 ? "..." : ""),
      tipoLogo: data.tipoLogo,
      nombreEmpresa: data.nombreEmpresa,
    })

    let configuracion = await Configuracion.findOne()

    if (configuracion) {
      // Actualizar configuración existente
      configuracion = await Configuracion.findOneAndUpdate({}, data, {
        new: true,
        upsert: true,
        runValidators: true,
      })
      console.log("✅ Configuración actualizada en BD")
    } else {
      // Crear nueva configuración
      configuracion = await Configuracion.create(data)
      console.log("✅ Nueva configuración creada en BD")
    }

    // Verificar que se guardó correctamente
    const verificacion = await Configuracion.findOne()
    console.log("🔍 Verificación post-guardado:", {
      logo: verificacion.logo?.substring(0, 50) + (verificacion.logo?.length > 50 ? "..." : ""),
      tipoLogo: verificacion.tipoLogo,
      nombreEmpresa: verificacion.nombreEmpresa,
    })

    return NextResponse.json({
      success: true,
      configuracion,
      message: "Configuración guardada exitosamente",
    })
  } catch (error: any) {
    console.error("❌ Error al guardar configuración:", error)
    return NextResponse.json(
      { success: false, error: "Error al guardar configuración: " + error.message },
      { status: 500 },
    )
  }
}

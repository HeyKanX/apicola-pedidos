import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Producto from "@/models/Producto"
import Usuario from "@/models/Usuario"

export async function GET() {
  return NextResponse.json({ message: "Usa POST para poblar la base de datos" })
}

export async function POST() {
  try {
    console.log("🔄 Iniciando población de base de datos...")
    await dbConnect()
    console.log("✅ Conectado a MongoDB")

    // Limpiar datos existentes
    await Producto.deleteMany({})
    await Usuario.deleteMany({})
    console.log("🗑️ Datos anteriores eliminados")

    // Crear productos apícolas
    const productos = [
      {
        nombre: "Miel de Flores Silvestres",
        descripcion: "Miel pura y natural de flores silvestres, cosechada en primavera. Sabor suave y delicado.",
        precio: 25000,
        stock: 50,
        categoria: "miel",
        unidadMedida: "kg",
        imagen: "/placeholder.svg?height=300&width=300",
      },
      {
        nombre: "Miel de Eucalipto",
        descripcion: "Miel con propiedades medicinales, ideal para problemas respiratorios. Sabor intenso.",
        precio: 28000,
        stock: 30,
        categoria: "miel",
        unidadMedida: "kg",
        imagen: "/placeholder.svg?height=300&width=300",
      },
      {
        nombre: "Polen de Abeja",
        descripcion: "Polen fresco rico en proteínas, vitaminas y minerales. Excelente suplemento nutricional.",
        precio: 35000,
        stock: 20,
        categoria: "polen",
        unidadMedida: "g",
        imagen: "/placeholder.svg?height=300&width=300",
      },
      {
        nombre: "Propóleo Puro",
        descripcion: "Propóleo natural con propiedades antibacterianas y antiinflamatorias.",
        precio: 45000,
        stock: 15,
        categoria: "propóleo",
        unidadMedida: "ml",
        imagen: "/placeholder.svg?height=300&width=300",
      },
      {
        nombre: "Cera de Abeja",
        descripcion: "Cera pura para uso cosmético y artesanal. 100% natural.",
        precio: 20000,
        stock: 25,
        categoria: "cera",
        unidadMedida: "kg",
        imagen: "/placeholder.svg?height=300&width=300",
      },
      {
        nombre: "Jalea Real",
        descripcion: "Jalea real fresca, superalimento con múltiples beneficios para la salud.",
        precio: 80000,
        stock: 10,
        categoria: "jalea-real",
        unidadMedida: "g",
        imagen: "/placeholder.svg?height=300&width=300",
      },
    ]

    const productosCreados = await Producto.insertMany(productos)
    console.log(`✅ ${productosCreados.length} productos creados`)

    // Crear usuario administrador
    const admin = new Usuario({
      nombre: "Administrador Apícola",
      email: "admin@apicola.com",
      password: "admin123",
      rol: "admin",
      telefono: "+57 300 123 4567",
      direccion: "Finca La Colmena, Vereda El Panal",
    })

    await admin.save()
    console.log("✅ Usuario administrador creado")

    return NextResponse.json({
      success: true,
      message: "Base de datos poblada exitosamente",
      data: {
        productos: productosCreados.length,
        usuarios: 1,
      },
    })
  } catch (error: any) {
    console.error("❌ Error poblando la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error poblando la base de datos",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

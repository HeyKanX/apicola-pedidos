import dbConnect from "@/lib/mongodb"
import Producto from "@/models/Producto"
import Usuario from "@/models/Usuario"

const productosEjemplo = [
  {
    nombre: "Miel de Flores Silvestres",
    descripcion: "Miel pura extraída de flores silvestres de la región. Sabor suave y aromático.",
    precio: 25000,
    stock: 50,
    categoria: "miel",
    unidadMedida: "kg",
    imagen: "/placeholder.svg?height=300&width=300",
  },
  {
    nombre: "Miel de Eucalipto",
    descripcion: "Miel con propiedades medicinales, ideal para problemas respiratorios.",
    precio: 28000,
    stock: 30,
    categoria: "miel",
    unidadMedida: "kg",
    imagen: "/placeholder.svg?height=300&width=300",
  },
  {
    nombre: "Polen de Abeja",
    descripcion: "Polen fresco rico en proteínas, vitaminas y minerales.",
    precio: 15000,
    stock: 25,
    categoria: "polen",
    unidadMedida: "g",
    imagen: "/placeholder.svg?height=300&width=300",
  },
  {
    nombre: "Propóleo Puro",
    descripcion: "Propóleo natural con propiedades antibacterianas y antiinflamatorias.",
    precio: 35000,
    stock: 20,
    categoria: "propóleo",
    unidadMedida: "ml",
    imagen: "/placeholder.svg?height=300&width=300",
  },
  {
    nombre: "Cera de Abeja",
    descripcion: "Cera pura para uso cosmético y artesanal.",
    precio: 12000,
    stock: 40,
    categoria: "cera",
    unidadMedida: "kg",
    imagen: "/placeholder.svg?height=300&width=300",
  },
  {
    nombre: "Jalea Real",
    descripcion: "Jalea real fresca, superalimento natural rico en nutrientes.",
    precio: 45000,
    stock: 15,
    categoria: "jalea-real",
    unidadMedida: "g",
    imagen: "/placeholder.svg?height=300&width=300",
  },
]

export async function seedDatabase() {
  try {
    await dbConnect()
    console.log("🌱 Iniciando seed de la base de datos...")

    // Limpiar datos existentes
    await Producto.deleteMany({})
    await Usuario.deleteMany({})
    console.log("🧹 Datos anteriores eliminados")

    // Crear productos
    const productos = await Producto.insertMany(productosEjemplo)
    console.log(`✅ ${productos.length} productos creados`)

    // Crear usuario administrador
    const admin = await Usuario.create({
      nombre: "Administrador Apícola",
      email: "admin@apicola.com",
      password: "admin123",
      rol: "admin",
      telefono: "+57 300 123 4567",
      direccion: "Finca La Colmena, Vereda El Panal",
    })
    console.log("✅ Usuario administrador creado")

    // Crear usuario cliente de ejemplo
    const cliente = await Usuario.create({
      nombre: "Juan Pérez",
      email: "juan@email.com",
      password: "123456",
      rol: "cliente",
      telefono: "+57 310 987 6543",
      direccion: "Calle 123 #45-67, Bogotá",
    })
    console.log("✅ Usuario cliente de ejemplo creado")

    console.log("🎉 Base de datos poblada exitosamente!")
    console.log("📧 Admin: admin@apicola.com / admin123")
    console.log("📧 Cliente: juan@email.com / 123456")

    return {
      productos: productos.length,
      usuarios: 2,
    }
  } catch (error) {
    console.error("❌ Error poblando la base de datos:", error)
    throw error
  }
}

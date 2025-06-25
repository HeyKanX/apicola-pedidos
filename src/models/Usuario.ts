import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true, minlength: 6 },
    telefono: String,
    direccion: String,
    rol: {
      type: String,
      enum: ["cliente", "admin"],
      default: "cliente",
    },
    activo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password
        return ret
      },
    },
    toObject: { virtuals: true },
  },
)

// Hash password antes de guardar
UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Método para comparar passwords
UsuarioSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Índices
UsuarioSchema.index({ email: 1 })

export default mongoose.models.Usuario || mongoose.model("Usuario", UsuarioSchema)

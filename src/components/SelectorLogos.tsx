"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Check, ImageIcon } from "lucide-react"

interface SelectorLogosProps {
  logoActual: string
  tipoActual: "predefinido" | "personalizado"
  onLogoChange: (logo: string, tipo: "predefinido" | "personalizado") => void
}

const logosPredefinidos = [
  { emoji: "🍯", nombre: "Miel Clásica" },
  { emoji: "🐝", nombre: "Abeja" },
  { emoji: "🌻", nombre: "Girasol" },
  { emoji: "🌼", nombre: "Margarita" },
  { emoji: "🌺", nombre: "Flor Tropical" },
  { emoji: "🌸", nombre: "Flor de Cerezo" },
  { emoji: "🌹", nombre: "Rosa" },
  { emoji: "🌷", nombre: "Tulipán" },
  { emoji: "🏵️", nombre: "Roseta" },
  { emoji: "💐", nombre: "Ramo de Flores" },
  { emoji: "🌿", nombre: "Hoja Verde" },
  { emoji: "🍃", nombre: "Hojas al Viento" },
  { emoji: "🌱", nombre: "Brote" },
  { emoji: "🌾", nombre: "Espiga de Trigo" },
  { emoji: "🌳", nombre: "Árbol" },
  { emoji: "🌲", nombre: "Pino" },
  { emoji: "🏔️", nombre: "Montaña" },
  { emoji: "☀️", nombre: "Sol" },
  { emoji: "🌅", nombre: "Amanecer" },
  { emoji: "🌄", nombre: "Montañas al Amanecer" },
  { emoji: "🧡", nombre: "Corazón Naranja" },
  { emoji: "💛", nombre: "Corazón Amarillo" },
  { emoji: "💚", nombre: "Corazón Verde" },
  { emoji: "🤎", nombre: "Corazón Marrón" },
]

export function SelectorLogos({ logoActual, tipoActual, onLogoChange }: SelectorLogosProps) {
  const [dragOver, setDragOver] = useState(false)
  const [tabActiva, setTabActiva] = useState(tipoActual === "personalizado" ? "personalizado" : "predefinido")

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const file = files[0]
    if (file) {
      // Validar que sea PNG
      if (!file.type.includes("png")) {
        alert("Solo se permiten archivos PNG para el logo.")
        return
      }

      // Validar tamaño del archivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("El logo es muy grande. Máximo 2MB.")
        return
      }

      console.log("📁 Cargando archivo PNG:", file.name, `${Math.round(file.size / 1024)}KB`)

      const reader = new FileReader()
      reader.onload = (e) => {
        const logoPersonalizado = e.target?.result as string
        console.log("✅ Logo personalizado cargado, tamaño:", logoPersonalizado.length, "caracteres")
        onLogoChange(logoPersonalizado, "personalizado")
        setTabActiva("personalizado")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleImageUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleEmojiSelect = (emoji: string) => {
    console.log("😀 Emoji seleccionado:", emoji)
    onLogoChange(emoji, "predefinido")
    setTabActiva("predefinido")
  }

  return (
    <div className="space-y-4">
      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predefinido">Logos Predefinidos</TabsTrigger>
          <TabsTrigger value="personalizado">Logo Personalizado</TabsTrigger>
        </TabsList>

        <TabsContent value="predefinido" className="space-y-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
            {logosPredefinidos.map((logo, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(logo.emoji)}
                className={`relative p-3 border-2 rounded-lg hover:border-yellow-400 transition-all group ${
                  logoActual === logo.emoji && tipoActual === "predefinido"
                    ? "border-yellow-600 bg-yellow-50"
                    : "border-gray-200"
                }`}
                title={logo.nombre}
              >
                <span className="text-2xl block">{logo.emoji}</span>
                {logoActual === logo.emoji && tipoActual === "predefinido" && (
                  <div className="absolute -top-1 -right-1 bg-yellow-600 text-white rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {logo.nombre}
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="personalizado" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {/* Zona de carga */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? "border-yellow-400 bg-yellow-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-4">
                  {tipoActual === "personalizado" && logoActual && logoActual.startsWith("data:") ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <img
                          src={logoActual || "/placeholder.svg"}
                          alt="Logo personalizado"
                          className="h-16 w-16 object-contain border rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            console.error("❌ Error mostrando logo personalizado")
                            target.style.display = "none"
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Logo personalizado cargado</span>
                      </div>
                      <div className="text-sm text-gray-500">Tamaño: {Math.round(logoActual.length / 1024)}KB</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-600 mb-2">Arrastra tu logo aquí o haz clic para seleccionar</p>
                        <p className="text-sm text-gray-500">Solo archivos PNG, máximo 2MB</p>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept=".png,image/png"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    id="upload-logo"
                  />
                  <label htmlFor="upload-logo">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {tipoActual === "personalizado" && logoActual && logoActual.startsWith("data:")
                          ? "Cambiar Logo"
                          : "Seleccionar Logo"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Especificaciones recomendadas */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Especificaciones recomendadas:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Formato: PNG con fondo transparente</li>
                  <li>• Tamaño: 64x64 píxeles o mayor</li>
                  <li>• Proporción: Cuadrada (1:1) preferible</li>
                  <li>• Peso: Máximo 2MB</li>
                  <li>• Calidad: Alta resolución para mejor visualización</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react"

interface GaleriaImagenesProps {
  imagenes: string[]
  onImagenesChange?: (imagenes: string[]) => void
  editable?: boolean
}

export function GaleriaImagenes({ imagenes, onImagenesChange, editable = false }: GaleriaImagenesProps) {
  const [indiceActual, setIndiceActual] = useState(0)
  const [animando, setAnimando] = useState(false)

  // Auto-avanzar cada 5 segundos
  useEffect(() => {
    if (imagenes.length <= 1) return

    const interval = setInterval(() => {
      siguiente()
    }, 5000)

    return () => clearInterval(interval)
  }, [indiceActual, imagenes.length])

  const siguiente = () => {
    if (animando) return
    setAnimando(true)
    setTimeout(() => {
      setIndiceActual((prev) => (prev + 1) % imagenes.length)
      setAnimando(false)
    }, 300)
  }

  const anterior = () => {
    if (animando) return
    setAnimando(true)
    setTimeout(() => {
      setIndiceActual((prev) => (prev - 1 + imagenes.length) % imagenes.length)
      setAnimando(false)
    }, 300)
  }

  const irAIndice = (indice: number) => {
    if (animando || indice === indiceActual) return
    setAnimando(true)
    setTimeout(() => {
      setIndiceActual(indice)
      setAnimando(false)
    }, 300)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImagenesChange) {
      // Validar tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es muy grande. Máximo 5MB.")
        return
      }

      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten archivos de imagen.")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const nuevaImagen = e.target?.result as string
        const nuevasImagenes = [...imagenes]

        // Si hay menos de 6 imágenes, agregar nueva
        if (nuevasImagenes.length < 6) {
          nuevasImagenes.push(nuevaImagen)
        } else {
          // Reemplazar la imagen actual
          nuevasImagenes[indiceActual] = nuevaImagen
        }

        onImagenesChange(nuevasImagenes)
      }
      reader.readAsDataURL(file)
    }
  }

  const eliminarImagen = (indice: number) => {
    if (onImagenesChange && imagenes.length > 1) {
      const nuevasImagenes = imagenes.filter((_, i) => i !== indice)
      onImagenesChange(nuevasImagenes)

      // Ajustar índice actual si es necesario
      if (indiceActual >= nuevasImagenes.length) {
        setIndiceActual(nuevasImagenes.length - 1)
      }
    }
  }

  if (imagenes.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay imágenes en la galería</p>
            {editable && (
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="upload-imagen"
                  multiple={false}
                />
                <label htmlFor="upload-imagen">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Primera Imagen
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Galería de Imágenes</CardTitle>
        {editable && (
          <div className="flex space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="upload-imagen-galeria"
              multiple={false}
            />
            <label htmlFor="upload-imagen-galeria">
              <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {imagenes.length < 6 ? "Agregar Imagen" : "Reemplazar Imagen"}
                </span>
              </Button>
            </label>
            {imagenes.length < 6 && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    files.forEach((file) => {
                      if (file && onImagenesChange) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert("La imagen es muy grande. Máximo 5MB.")
                          return
                        }
                        if (!file.type.startsWith("image/")) {
                          alert("Solo se permiten archivos de imagen.")
                          return
                        }
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          const nuevaImagen = e.target?.result as string
                          const nuevasImagenes = [...imagenes, nuevaImagen]
                          onImagenesChange(nuevasImagenes)
                        }
                        reader.readAsDataURL(file)
                      }
                    })
                  }}
                  className="hidden"
                  id="upload-multiple-imagenes"
                  multiple
                />
                <label htmlFor="upload-multiple-imagenes">
                  <Button variant="secondary" size="sm" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Múltiples
                    </span>
                  </Button>
                </label>
              </>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Imagen principal */}
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
            <img
              src={imagenes[indiceActual] || "/placeholder.svg?height=400&width=600"}
              alt={`Imagen ${indiceActual + 1}`}
              className={`w-full h-full object-cover transition-all duration-300 ${
                animando ? "opacity-0 scale-105" : "opacity-100 scale-100"
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=400&width=600"
              }}
            />

            {/* Controles de navegación */}
            {imagenes.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={anterior}
                  disabled={animando}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={siguiente}
                  disabled={animando}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Botón eliminar en modo editable */}
            {editable && imagenes.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => eliminarImagen(indiceActual)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Indicador de posición */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <span className="bg-black/50 text-white px-2 py-1 rounded text-sm">
                {indiceActual + 1} / {imagenes.length}
              </span>
            </div>
          </div>

          {/* Miniaturas */}
          {imagenes.length > 1 && (
            <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
              {imagenes.map((imagen, indice) => (
                <button
                  key={indice}
                  onClick={() => irAIndice(indice)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    indice === indiceActual
                      ? "border-yellow-600 ring-2 ring-yellow-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={imagen || "/placeholder.svg?height=64&width=64"}
                    alt={`Miniatura ${indice + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=64&width=64"
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

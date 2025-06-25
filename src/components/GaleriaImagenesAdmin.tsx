"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, ImageIcon } from "lucide-react"

interface GaleriaImagenesAdminProps {
  imagenes: string[]
  onImagenesChange?: (imagenes: string[]) => void
}

export function GaleriaImagenesAdmin({ imagenes, onImagenesChange }: GaleriaImagenesAdminProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleImageUpload = (files: FileList | null) => {
    if (!files || !onImagenesChange) return

    Array.from(files).forEach((file) => {
      if (file && imagenes.length < 6) {
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
          const nuevasImagenes = [...imagenes, nuevaImagen]
          onImagenesChange(nuevasImagenes)
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const eliminarImagen = (indice: number) => {
    if (onImagenesChange) {
      const nuevasImagenes = imagenes.filter((_, i) => i !== indice)
      onImagenesChange(nuevasImagenes)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>Galería de Imágenes</span>
          <span className="text-sm text-gray-500">({imagenes.length}/6)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zona de carga */}
        {imagenes.length < 6 && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver ? "border-yellow-400 bg-yellow-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Arrastra imágenes aquí o haz clic para seleccionar</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              id="upload-imagenes-admin"
              multiple
            />
            <label htmlFor="upload-imagenes-admin">
              <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                <span>Seleccionar Imágenes</span>
              </Button>
            </label>
          </div>
        )}

        {/* Grid de imágenes */}
        {imagenes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagenes.map((imagen, indice) => (
              <div key={indice} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagen || "/placeholder.svg?height=200&width=200"}
                    alt={`Imagen ${indice + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=200&width=200"
                    }}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => eliminarImagen(indice)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {indice + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {imagenes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No hay imágenes en la galería</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

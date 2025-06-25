"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface GaleriaImagenesEleganteProps {
  imagenes: string[]
}

export function GaleriaImagenesElegante({ imagenes }: GaleriaImagenesEleganteProps) {
  const [indiceActual, setIndiceActual] = useState(0)
  const [animando, setAnimando] = useState(false)

  // Auto-avanzar cada 4 segundos
  useEffect(() => {
    if (imagenes.length <= 1) return

    const interval = setInterval(() => {
      siguiente()
    }, 4000)

    return () => clearInterval(interval)
  }, [indiceActual, imagenes.length])

  const siguiente = () => {
    if (animando) return
    setAnimando(true)
    setTimeout(() => {
      setIndiceActual((prev) => (prev + 1) % imagenes.length)
      setAnimando(false)
    }, 500)
  }

  const anterior = () => {
    if (animando) return
    setAnimando(true)
    setTimeout(() => {
      setIndiceActual((prev) => (prev - 1 + imagenes.length) % imagenes.length)
      setAnimando(false)
    }, 500)
  }

  const irAIndice = (indice: number) => {
    if (animando || indice === indiceActual) return
    setAnimando(true)
    setTimeout(() => {
      setIndiceActual(indice)
      setAnimando(false)
    }, 500)
  }

  if (imagenes.length === 0) {
    return (
      <div className="relative h-96 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🍯</span>
          </div>
          <p className="text-gray-600">Galería de imágenes próximamente</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Contenedor de imágenes apiladas */}
      <div className="relative w-full h-full flex items-center justify-center">
        {imagenes.map((imagen, indice) => {
          const distancia = Math.abs(indice - indiceActual)
          const esActual = indice === indiceActual
          const esAnterior = indice === (indiceActual - 1 + imagenes.length) % imagenes.length
          const esSiguiente = indice === (indiceActual + 1) % imagenes.length

          let transformStyle = ""
          let zIndex = 1
          let opacity = 0.3
          let blur = "blur(4px)"

          if (esActual) {
            transformStyle = "translateX(0) scale(1)"
            zIndex = 10
            opacity = 1
            blur = "blur(0px)"
          } else if (esAnterior) {
            transformStyle = "translateX(-60%) scale(0.85)"
            zIndex = 5
            opacity = 0.7
            blur = "blur(2px)"
          } else if (esSiguiente) {
            transformStyle = "translateX(60%) scale(0.85)"
            zIndex = 5
            opacity = 0.7
            blur = "blur(2px)"
          } else if (distancia === 2) {
            if (indice < indiceActual || (indiceActual < 2 && indice > imagenes.length - 3)) {
              transformStyle = "translateX(-120%) scale(0.7)"
            } else {
              transformStyle = "translateX(120%) scale(0.7)"
            }
            zIndex = 2
            opacity = 0.4
            blur = "blur(3px)"
          } else {
            transformStyle = "translateX(0) scale(0.6)"
            zIndex = 1
            opacity = 0.2
            blur = "blur(5px)"
          }

          return (
            <div
              key={indice}
              className={`absolute w-80 h-64 transition-all duration-500 ease-in-out cursor-pointer ${
                animando ? "duration-500" : "duration-300"
              }`}
              style={{
                transform: transformStyle,
                zIndex,
                opacity,
                filter: blur,
              }}
              onClick={() => !esActual && irAIndice(indice)}
            >
              <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white">
                <img
                  src={imagen || "/placeholder.svg?height=256&width=320"}
                  alt={`Imagen ${indice + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=256&width=320"
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Controles de navegación */}
      {imagenes.length > 1 && (
        <>
          <button
            onClick={anterior}
            disabled={animando}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={siguiente}
            disabled={animando}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {imagenes.map((_, indice) => (
          <button
            key={indice}
            onClick={() => irAIndice(indice)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              indice === indiceActual ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>

      {/* Contador */}
      <div className="absolute top-4 right-4 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {indiceActual + 1} / {imagenes.length}
      </div>
    </div>
  )
}

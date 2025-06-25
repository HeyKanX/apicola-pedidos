"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")

  const handleSeed = async () => {
    setLoading(true)
    setResult("")

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult("✅ Base de datos poblada exitosamente!")
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🌱 Poblar Base de Datos</CardTitle>
            <CardDescription>Crear productos y usuarios de ejemplo para la apícola</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSeed} disabled={loading} className="w-full">
              {loading ? "Poblando..." : "Poblar Base de Datos"}
            </Button>

            {result && (
              <div className="p-4 rounded-lg bg-gray-100">
                <p className="text-sm">{result}</p>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p>
                <strong>Esto creará:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>6 productos apícolas (miel, polen, propóleo, etc.)</li>
                <li>1 usuario administrador</li>
                <li>Datos de ejemplo para pruebas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Copy, ExternalLink } from "lucide-react"
import { formatearPrecio } from "@/lib/utils"
import Link from "next/link"

interface ResumenPedidoProps {
  pedido: {
    numero: string
    total: number
    cliente: {
      nombre: string
      email: string
    }
  }
  onClose: () => void
}

export function ResumenPedido({ pedido, onClose }: ResumenPedidoProps) {
  const copiarCodigo = () => {
    navigator.clipboard.writeText(pedido.numero)
    // Aquí podrías agregar una notificación de que se copió
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">¡Pedido Creado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Tu pedido ha sido registrado exitosamente</p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Código del pedido:</p>
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="outline" className="text-lg font-mono px-4 py-2">
                  {pedido.numero}
                </Badge>
                <Button variant="outline" size="sm" onClick={copiarCodigo} className="p-2">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{pedido.cliente.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{pedido.cliente.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-yellow-600">{formatearPrecio(pedido.total)}</span>
            </div>
          </div>

          <Separator />

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Guarda este código para consultar el estado de tu pedido en cualquier
              momento.
            </p>
          </div>

          <div className="space-y-2">
            <Link href="/consultar-pedido">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Consultar Estado del Pedido
              </Button>
            </Link>
            <Button variant="outline" onClick={onClose} className="w-full">
              Continuar Comprando
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

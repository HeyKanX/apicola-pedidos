"use client"

import { useEffect } from "react"
import { useConfiguracion } from "@/contexts/ConfiguracionContext"

export function DynamicTitle() {
  const { configuracion } = useConfiguracion()

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = configuracion.nombreEmpresa
    }
  }, [configuracion.nombreEmpresa])

  return null
}

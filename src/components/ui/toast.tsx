"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
  onClose?: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  const variants = {
    default: "bg-white border-gray-200",
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
  }

  const textVariants = {
    default: "text-gray-900",
    success: "text-green-900",
    error: "text-red-900",
    warning: "text-yellow-900",
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-96 p-4 border rounded-lg shadow-lg transition-all duration-300",
        variants[variant],
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {title && <h4 className={cn("font-semibold mb-1", textVariants[variant])}>{title}</h4>}
          {description && <p className={cn("text-sm", textVariants[variant])}>{description}</p>}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className={cn("ml-2 p-1 rounded-full hover:bg-gray-100", textVariants[variant])}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Hook para usar toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return {
    toast,
    toasts: toasts.map((toast) => <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />),
  }
}

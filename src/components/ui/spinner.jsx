import * as React from "react"
import { cn } from "@/lib/utils"

export function Spinner({ className, size = "md", ...props }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
    xl: "h-16 w-16 border-4",
  }
  return (
    <span
      role="status"
      aria-label="Cargando..."
      className={cn(
        "inline-block rounded-full border-current border-b-transparent animate-spin",
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

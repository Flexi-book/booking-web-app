import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * LoadingScreen — pantalla de carga animada que se superpone sobre el formulario.
 *
 * Props:
 *  - visible     boolean  — si mostrar o no el overlay
 *  - title       string   — título principal (ej: "Iniciando sesión...")
 *  - description string   — texto descriptivo
 *  - onCancel    fn       — si se pasa, muestra botón "Cancelar"
 */
export function LoadingScreen({ visible, title, description, onCancel }) {
  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md",
        "animate-in fade-in duration-300"
      )}
    >
      <div className="flex flex-col items-center gap-6 max-w-xs text-center px-6">
        {/* Logo mark */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring pulse */}
          <span className="absolute h-20 w-20 rounded-full bg-blue-500/10 animate-ping" />
          {/* Spinner ring */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
            <Spinner size="lg" className="text-blue-600" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title ?? "Procesando..."}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {description ?? "Por favor espera. No cierres ni actualices la página."}
          </p>
        </div>

        {/* Optional cancel */}
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
            Cancelar
          </Button>
        )}
      </div>
    </div>
  )
}

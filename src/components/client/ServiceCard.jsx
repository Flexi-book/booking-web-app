import { useState } from "react"
import { Edit2, Clock, DollarSign, Plus, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Tarjeta de servicio — usable en la landing pública y en el panel admin
export function ServiceCard({ service, isAdmin = false, onEdit, onBook }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Card className="relative group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Cover image */}
      <div className="relative aspect-video w-full overflow-hidden bg-blue-50">
        {!imgError ? (
          <img
            src={service.imagen || `https://source.unsplash.com/400x200/?${encodeURIComponent(service.nombre)},spa`}
            alt={service.nombre}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <span className="text-4xl">🧖‍♀️</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Badge (categoria) — top right */}
      <CardAction>
        <Badge className="bg-white/90 text-blue-700 border-0 shadow backdrop-blur-sm text-xs font-semibold">
          {service.categoria || "Servicio"}
        </Badge>
      </CardAction>

      {/* Edit button — only for admin, visible on hover */}
      {isAdmin && (
        <button
          onClick={() => onEdit?.(service)}
          className="absolute top-3 left-3 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-base leading-snug">{service.nombre}</CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          {service.descripcion || "Experiencia de relajación y bienestar personalizada para ti."}
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex items-center justify-between gap-2 pt-0">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1 text-xs">
            <Clock className="h-3.5 w-3.5" />
            {service.duracion ?? 60} min
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            {service.precio ? service.precio.toLocaleString("es-CL") : "—"}
          </span>
        </div>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-xs h-8 px-3 shadow-sm shadow-blue-600/20"
          onClick={() => onBook?.(service)}
        >
          Reservar
        </Button>
      </CardFooter>
    </Card>
  )
}

// Grid de servicios — para la landing pública
export function ServiceGrid({ services = [], isAdmin = false, onEdit, onBook }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <ServiceCard
          key={s.id}
          service={s}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onBook={onBook}
        />
      ))}

      {/* Tarjeta de "Agregar servicio" visible solo para admin */}
      {isAdmin && (
        <button
          onClick={() => onEdit?.(null)}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 p-8 text-slate-400 hover:text-blue-600 min-h-[240px]"
        >
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-sm font-medium">Agregar servicio</span>
        </button>
      )}
    </div>
  )
}

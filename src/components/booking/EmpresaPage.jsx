import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Check, CalendarDays, ArrowRight, User, AlertCircle, Phone, ArrowLeft, Heart, Search, MapPin, Star, Building2, Tag, Calendar as CalendarIcon, Hash,
  Clock, Mail, CheckCircle2, ChevronRight, Sparkles, Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { publicBookingApi } from '../../services/publicBookingService'
import { getEmpresaIcono } from '../admin/PerfilPanel'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Calendar } from '../ui/calendar'

const BUFFER_MIN = 10  // debe coincidir con ReservationService.BUFFER_MINUTES

function getLogoUrl(empresa) {
  return empresa?.logoUrl || empresa?.logo_url || ''
}

// JS getDay(): 0=Dom,1=Lun,...,6=Sab → schema: 1=Lun,...,7=Dom
const jsToSchema = d => d === 0 ? 7 : d

// Convierte "HH:MM" a minutos desde medianoche
const toMin = h => { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm }

// Convierte minutos a "HH:MM"
const toHHMM = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

const getAssetId = (asset) => String(asset?.id ?? asset?.activoId ?? asset?.activo_id ?? '')

function formatCLP(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

/**
 * Genera los slots disponibles para un servicio+activo en una fecha.
 * Usa disponibilidades configuradas en el servicio.
 * Retorna [] si no hay disponibilidad ese día.
 */
function generarSlots(servicio, activoId, fecha) {
  if (!servicio || !activoId || !fecha) return []

  const dispAll = servicio.disponibilidades ?? []
  if (!dispAll.length) return []   // sin configuración → sin slots

  const diaSemana = jsToSchema(new Date(fecha + 'T12:00').getDay())
  const duracion  = servicio.duracionMinutos ?? 30
  const paso      = duracion + BUFFER_MIN

  const ventanas = dispAll.filter(d =>
    (d.activoId === activoId || d.activo_id === activoId) &&
    (d.diaSemana === diaSemana || d.dia_semana === diaSemana)
  )
  if (!ventanas.length) return []

  const slots = new Set()
  ventanas.forEach(v => {
    const inicio = toMin(v.horaInicio ?? v.hora_inicio ?? '08:00')
    const fin    = toMin(v.horaFin    ?? v.hora_fin    ?? '18:00')
    let t = inicio
    while (t + duracion <= fin) {
      slots.add(toHHMM(t))
      t += paso
    }
  })
  return [...slots].sort()
}

/* ──────────────────────────────────────────────────────────────────────
   STEP INDICATOR — animado
   ────────────────────────────────────────────────────────────────────── */
const PASOS = [
  { label: 'Servicio',    icon: Tag },
  { label: 'Profesional', icon: User },
  { label: 'Fecha',       icon: CalendarDays },
  { label: 'Datos',       icon: Mail },
]

function StepBar({ current }) {
  return (
    <div className="mb-8">
      {/* Barra de progreso */}
      <div className="h-1 bg-slate-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / PASOS.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-start justify-between">
        {PASOS.map((p, i) => {
          const Icon = p.icon
          const done   = i < current
          const active = i === current
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border-2',
                done   ? 'border-blue-500 bg-transparent'
                : active ? 'border-blue-600 bg-transparent scale-110'
                : 'border-slate-200 bg-transparent'
              )}>
                {done
                  ? <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  : <Icon className={cn('w-4 h-4', active ? 'text-blue-600' : 'text-slate-300')} />
                }
              </div>
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider hidden sm:block',
                active ? 'text-blue-600' : done ? 'text-blue-400' : 'text-slate-400'
              )}>
                {p.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   ANIMATED WRAPPER
   ────────────────────────────────────────────────────────────────────── */
function Slide({ active, children }) {
  if (!active) return null
  return (
    <div className="animate-in fade-in slide-in-from-right-6 duration-350">
      {children}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   SERVICE CARD
   ────────────────────────────────────────────────────────────────────── */
function ServiceCard({ s, selected, onSelect }) {
  return (
    <button onClick={() => onSelect(s)}
      className={cn(
        'w-full text-left p-5 rounded-2xl border-2 transition-all duration-250 group relative',
        selected
          ? 'border-blue-500 bg-blue-50/60 shadow-md shadow-blue-100/60'
          : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm hover:bg-slate-50/50'
      )}>
      {selected && (
        <div className="absolute top-4 right-4 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <p className={cn('font-black text-base pr-6 transition-colors',
        selected ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-700')}>
        {s.nombreServicio}
      </p>
      {s.descripcion && (
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{s.descripcion}</p>
      )}
      <div className="flex items-center gap-4 mt-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          <Clock className="w-3 h-3" /> {s.duracionMinutos} min
        </span>
        {s.precio > 0 && (
          <span className="text-sm font-black text-slate-700">
            {formatCLP(s.precio)}
          </span>
        )}
      </div>
    </button>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   ASSET CARD
   ────────────────────────────────────────────────────────────────────── */
function AssetCard({ a, selected, onSelect }) {
  const nombre = a.nombreActivo || a.nombre || 'Recurso'
  const tipo   = a.tipoActivo || ''
  return (
    <button onClick={() => onSelect(a)}
      className={cn(
        'w-full text-left p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-250 group',
        selected
          ? 'border-blue-500 bg-blue-50/60 shadow-md shadow-blue-100/60'
          : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm'
      )}>
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-250',
        selected ? 'bg-blue-600 shadow-md shadow-blue-200' : 'bg-slate-100 group-hover:bg-blue-50'
      )}>
        <User className={cn('w-5 h-5', selected ? 'text-white' : 'text-slate-500')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-black truncate transition-colors',
          selected ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-700')}>
          {nombre}
        </p>
        {tipo && <p className="text-xs text-slate-400 capitalize mt-0.5">{tipo}</p>}
      </div>
      {selected && (
        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
      )}
    </button>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   SUCCESS SCREEN
   ────────────────────────────────────────────────────────────────────── */
function SuccessScreen({ sel, empresa, onReset }) {
  return (
    <div className="text-center py-6 animate-in fade-in zoom-in-90 duration-500">
      {/* Check animado */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
        <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full
                        flex items-center justify-center shadow-xl shadow-green-200">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-black text-slate-900 mb-2">¡Reserva confirmada!</h2>
      <p className="text-slate-500 mb-8">
        Te enviamos los detalles a{' '}
        <strong className="text-slate-800 font-bold">{sel.email}</strong>
      </p>

      {/* Tarjeta resumen */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-3 mb-8">
        {[
          { l: '📋 Servicio',    v: sel.servicio?.nombreServicio },
          { l: '👤 Profesional', v: sel.activo?.nombreActivo || sel.activo?.nombre },
          { l: '📅 Fecha',       v: sel.fecha ? new Date(sel.fecha + 'T00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : '' },
          { l: '⏰ Hora',        v: sel.hora },
          { l: '👤 Cliente',     v: sel.nombre },
        ].filter(r => r.v).map(({ l, v }) => (
          <div key={l} className="flex items-start justify-between gap-2 text-sm">
            <span className="text-slate-400 font-medium whitespace-nowrap">{l}</span>
            <span className="font-bold text-slate-800 text-right">{v}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Link to="/">
          <Button className="w-full h-13 rounded-xl text-base font-black
                             bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-200
                             hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 transition-all">
            Volver al inicio
          </Button>
        </Link>
        <button onClick={onReset}
          className="w-full text-sm text-slate-400 hover:text-blue-600 transition-colors font-medium py-2">
          Hacer otra reserva en {empresa?.nombre}
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   PANEL DE RESUMEN LATERAL — Shadcn Calendar + Cards
   ────────────────────────────────────────────────────────────────────── */
function ResumenPanel({ sel, empresa, icono, paso }) {
  const fechaObj = sel.fecha ? new Date(sel.fecha + 'T12:00') : null

  const DIAS_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

  return (
    <div className="space-y-4">

      {/* Empresa */}
      <Card className="border-slate-100 shadow-sm overflow-hidden">
        <div className="h-16 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-4xl">
          {icono}
        </div>
        <CardContent className="p-4 pt-3">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
            {empresa?.tipoNegocio ?? 'Empresa'}
          </p>
          <p className="font-black text-slate-900 text-sm">{empresa?.nombre}</p>
        </CardContent>
      </Card>

      {/* Selecciones del cliente */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5" />
            Tu resumen
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">

          {/* Servicio */}
          <div className={cn('flex items-start gap-3 transition-all duration-300',
            !sel.servicio && 'opacity-30')}>
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
              sel.servicio ? 'bg-violet-100' : 'bg-slate-100')}>
              <Tag className={cn('w-3.5 h-3.5', sel.servicio ? 'text-violet-600' : 'text-slate-400')} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Servicio</p>
                  {sel.servicio ? (
                <>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{sel.servicio.nombreServicio}</p>
                  <p className="text-xs text-slate-500">{sel.servicio.duracionMinutos} min · {formatCLP(sel.servicio.precio || 0)}</p>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">Sin elegir</p>
              )}
            </div>
            {sel.servicio && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />}
          </div>

          <div className="border-t border-slate-100" />

          {/* Profesional */}
          <div className={cn('flex items-start gap-3 transition-all duration-300',
            !sel.activo && 'opacity-30')}>
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
              sel.activo ? 'bg-blue-100' : 'bg-slate-100')}>
              <User className={cn('w-3.5 h-3.5', sel.activo ? 'text-blue-600' : 'text-slate-400')} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Profesional</p>
              {sel.activo ? (
                <p className="text-sm font-bold text-slate-800 leading-tight">
                  {sel.activo.nombreActivo || sel.activo.nombre}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">Sin elegir</p>
              )}
            </div>
            {sel.activo && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />}
          </div>

          <div className="border-t border-slate-100" />

          {/* Fecha + hora */}
          <div className={cn('flex items-start gap-3 transition-all duration-300',
            !sel.fecha && 'opacity-30')}>
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
              sel.fecha ? 'bg-emerald-100' : 'bg-slate-100')}>
              <CalendarDays className={cn('w-3.5 h-3.5', sel.fecha ? 'text-emerald-600' : 'text-slate-400')} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fecha y hora</p>
              {sel.fecha ? (
                <>
                  <p className="text-sm font-bold text-slate-800 capitalize leading-tight">
                    {DIAS_ES[fechaObj.getDay()]} {fechaObj.getDate()} de {MESES_ES[fechaObj.getMonth()]}
                  </p>
                  {sel.hora
                    ? <p className="text-xs text-slate-500">{sel.hora} hrs</p>
                    : <p className="text-xs text-blue-500 italic">Elige una hora →</p>
                  }
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">Sin elegir</p>
              )}
            </div>
            {sel.hora && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />}
          </div>
        </CardContent>
      </Card>

      {/* Total / CTA si todo está completo */}
      {sel.servicio && sel.activo && sel.fecha && sel.hora && (
        <Card className="border-blue-200 bg-blue-50 shadow-sm animate-in fade-in duration-400">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> ¡Todo listo!
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <div className="flex justify-between">
                <span>Duración</span>
                <span className="font-bold">{sel.servicio.duracionMinutos} min</span>
              </div>
              {sel.servicio.precio > 0 && (
                <div className="flex justify-between">
                  <span>Precio</span>
                  <span className="font-bold">{formatCLP(sel.servicio.precio)}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-blue-500 pt-1">
              Solo falta completar tus datos para confirmar →
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   FORM FIELD — reutilizable
   ────────────────────────────────────────────────────────────────────── */
function Field({ icon: Icon, label, required, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
        <Icon className="w-3.5 h-3.5 text-blue-500" />
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   MAIN
   ────────────────────────────────────────────────────────────────────── */
export default function EmpresaPage() {
  const { id } = useParams()
  const [empresa, setEmpresa]       = useState(null)
  const [servicios, setServicios]   = useState([])
  const [activos, setActivos]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [paso, setPaso]             = useState(0)
  const [confirmado, setConfirmado] = useState(false)
  const [enviando, setEnviando]     = useState(false)
  const [errForm, setErrForm]       = useState('')

  const vacío = { servicio: null, activo: null, fecha: '', hora: '', nombre: '', email: '', telefono: '' }
  const [sel, setSel] = useState(vacío)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      publicBookingApi.listarEmpresas(),
      publicBookingApi.listarServiciosPublic(id),
      publicBookingApi.listarActivosPublic(id),
    ]).then(([emps, svcs, acts]) => {
      setEmpresa(emps.find(e => String(e.empresaId) === id) ?? { nombre: 'Empresa', empresaId: id })
      setServicios(svcs)
      setActivos(acts)
    }).catch(() => setError('Error al cargar la información de la empresa.'))
    .finally(() => setLoading(false))
  }, [id])

  const ir = useCallback(n => { setErrForm(''); setPaso(n) }, [])

  const confirmar = async () => {
    if (!sel.nombre.trim() || !sel.email.trim()) {
      setErrForm('Por favor completa tu nombre y correo electrónico.')
      return
    }
    setEnviando(true); setErrForm('')
    try {
      await publicBookingApi.crearReserva({
        serviceOfferingId: sel.servicio?.id,
        assetId:           getAssetId(sel.activo),
        customerName:      sel.nombre,
        customerEmail:     sel.email,
        customerPhone:     sel.telefono || undefined,
        startTime:         `${sel.fecha}T${sel.hora}:00`,
      })
      setConfirmado(true)
    } catch {
      setErrForm('No se pudo crear la reserva. Por favor intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const icono    = getEmpresaIcono(id, empresa?.tipoNegocio)
  const minFecha = new Date().toISOString().split('T')[0]

  const activosDelServicio = useMemo(() => {
    if (!sel.servicio) return []

    const activosAsignados = Array.isArray(sel.servicio.activosAsignados)
      ? sel.servicio.activosAsignados
      : []
    if (activosAsignados.length > 0) return activosAsignados

    const activosPorId = new Map((activos || []).map((a) => [getAssetId(a), a]))
    const vistos = new Set()
    return (sel.servicio.disponibilidades || [])
      .map((d) => {
        const disponibilidadId = getAssetId(d)
        if (!disponibilidadId || vistos.has(disponibilidadId)) return null
        vistos.add(disponibilidadId)

        const activoBase = activosPorId.get(disponibilidadId) || {}
        const nombre = d.activoNombre || activoBase.nombreActivo || activoBase.nombre || 'Recurso'

        return {
          ...activoBase,
          ...d,
          id: disponibilidadId,
          activoId: disponibilidadId,
          nombre,
          nombreActivo: nombre,
        }
      })
      .filter(Boolean)
  }, [activos, sel.servicio])

  // Slots dinámicos basados en disponibilidad real del servicio+activo+fecha
  const activoSeleccionadoId = getAssetId(sel.activo)
  const slots = generarSlots(sel.servicio, activoSeleccionadoId, sel.fecha)
  const sinDisponibilidad = sel.servicio && activoSeleccionadoId && sel.fecha && slots.length === 0
  const sinConfiguracion  = sel.servicio && !(sel.servicio.disponibilidades?.length)

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto">
          <Building2 className="w-7 h-7 text-blue-600 animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="text-slate-700 font-bold text-sm">Cargando información</p>
          <p className="text-slate-400 text-xs">Un momento por favor...</p>
        </div>
        <div className="flex justify-center gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                 style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50/80">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getLogoUrl(empresa) ? (
              <img
                src={getLogoUrl(empresa)}
                alt={`Logo de ${empresa?.nombre || 'empresa'}`}
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
              />
            ) : (
              <span className="text-2xl flex-shrink-0">{icono}</span>
            )}
            <div className="min-w-0">
              <p className="font-black text-slate-900 text-sm truncate leading-tight">{empresa?.nombre}</p>
              {empresa?.tipoNegocio && (
                <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wide">{empresa.tipoNegocio}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Layout 2 columnas ──────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Grid: wizard (izq) + resumen (der) */}
        <div className={cn(
          'grid gap-6',
          confirmado ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-1 lg:grid-cols-[1fr_340px]'
        )}>

          {/* ── Columna izquierda: wizard ────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 p-6 sm:p-8">
          {confirmado ? (
            <SuccessScreen sel={sel} empresa={empresa} onReset={() => { setSel(vacío); setPaso(0); setConfirmado(false) }} />
          ) : (
            <>
              <StepBar current={paso} />

              {/* Error de formulario */}
              {errForm && (
                <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2.5
                                text-red-700 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errForm}
                </div>
              )}

              {/* ── Paso 0: Servicio ──────────────────────────────── */}
              <Slide active={paso === 0}>
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 mb-1">¿Qué servicio necesitas?</h2>
                  <p className="text-sm text-slate-400">Elige el servicio que quieres reservar</p>
                </div>
                {servicios.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Tag className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-500">Sin servicios disponibles</p>
                    <p className="text-sm text-slate-400 mt-1">Este negocio aún no tiene servicios configurados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {servicios.map(s => (
                      <ServiceCard key={s.id} s={s} selected={sel.servicio?.id === s.id}
                        onSelect={sv => {
                          setSel(p => ({
                            ...p,
                            servicio: sv,
                            activo: null,
                            fecha: '',
                            hora: '',
                          }))
                          ir(1)
                        }} />
                    ))}
                  </div>
                )}
              </Slide>

              {/* ── Paso 1: Profesional ───────────────────────────── */}
              <Slide active={paso === 1}>
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 mb-1">¿Con quién?</h2>
                  <p className="text-sm text-slate-400">Selecciona el profesional o espacio disponible</p>
                </div>
                {/* Servicio seleccionado */}
                {sel.servicio && (
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-500 font-bold uppercase tracking-wide">Servicio elegido</p>
                      <p className="text-sm font-black text-blue-800">{sel.servicio.nombreServicio}</p>
                    </div>
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-lg">
                      {sel.servicio.duracionMinutos} min
                    </span>
                  </div>
                )}
                {activosDelServicio.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <User className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-500">Sin profesionales asignados</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Este servicio no tiene activos asignados para reservar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activosDelServicio.map(a => (
                      <AssetCard key={getAssetId(a)} a={a} selected={getAssetId(sel.activo) === getAssetId(a)}
                        onSelect={av => { setSel(p => ({ ...p, activo: av })); ir(2) }} />
                    ))}
                  </div>
                )}
                <button onClick={() => ir(0)}
                  className="mt-5 text-sm text-slate-400 hover:text-blue-600 transition-colors font-medium">
                  ← Cambiar servicio
                </button>
              </Slide>

              {/* ── Paso 2: Fecha y hora ──────────────────────────── */}
              <Slide active={paso === 2}>
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 mb-1">¿Cuándo?</h2>
                  <p className="text-sm text-slate-400">Elige la fecha y hora de tu preferencia</p>
                </div>

                <div className="space-y-6">
                  {/* Selector de fecha Shadcn */}
                  <Field icon={CalendarDays} label="Fecha de la cita" required>
                    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                      <Calendar
                        mode="single"
                        selected={sel.fecha ? new Date(sel.fecha + 'T12:00:00') : undefined}
                        onSelect={date => {
                          if (!date) return
                          const yyyy = date.getFullYear()
                          const mm = String(date.getMonth() + 1).padStart(2, '0')
                          const dd = String(date.getDate()).padStart(2, '0')
                          setSel(p => ({ ...p, fecha: `${yyyy}-${mm}-${dd}`, hora: '' }))
                        }}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today
                        }}
                      />
                    </div>
                  </Field>

                  {/* Slots de hora — basados en disponibilidad real */}
                  {sel.fecha && (
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">

                      {/* Sin configuración de disponibilidad */}
                      {sinConfiguracion && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-amber-800">Sin horarios configurados</p>
                            <p className="text-xs text-amber-600 mt-0.5">
                              Este negocio aún no ha configurado su disponibilidad.
                              Intenta contactarlos directamente.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Sin disponibilidad ese día */}
                      {!sinConfiguracion && sinDisponibilidad && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                          <div className="text-3xl mb-2">📅</div>
                          <p className="font-bold text-slate-700 text-sm">No hay horarios disponibles</p>
                          <p className="text-xs text-slate-400 mt-1 mb-3">
                            {new Date(sel.fecha + 'T12:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} no tiene horarios para{' '}
                            <strong>{sel.activo?.nombreActivo || sel.activo?.nombre}</strong>.
                          </p>
                          <p className="text-xs text-blue-600 font-semibold">Prueba eligiendo otra fecha →</p>
                        </div>
                      )}

                      {/* Slots disponibles */}
                      {!sinConfiguracion && slots.length > 0 && (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              Horarios disponibles
                            </p>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                              {slots.length} {slots.length === 1 ? 'slot' : 'slots'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {slots.map(h => (
                              <button
                                key={h}
                                onClick={() => setSel(p => ({ ...p, hora: h }))}
                                className={cn(
                                  'py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200',
                                  sel.hora === h
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                                )}>
                                {h}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400 mt-2.5 text-center">
                            Cada sesión dura {sel.servicio?.duracionMinutos} min
                            {BUFFER_MIN > 0 && ` + ${BUFFER_MIN} min entre citas`}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Mini resumen */}
                  {sel.servicio && sel.fecha && sel.hora && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2.5 animate-in fade-in duration-300">
                      <p className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Resumen de tu cita
                      </p>
                      {[
                        { l: 'Servicio', v: sel.servicio.nombreServicio },
                        { l: 'Con', v: sel.activo?.nombreActivo || sel.activo?.nombre },
                        { l: 'Fecha', v: new Date(sel.fecha + 'T00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) },
                        { l: 'Hora', v: `${sel.hora} · ${sel.servicio.duracionMinutos} min` },
                      ].filter(r => r.v).map(({ l, v }) => (
                        <div key={l} className="flex justify-between text-sm">
                          <span className="text-blue-500">{l}</span>
                          <span className="font-bold text-blue-900 text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-7">
                  <Button
                    disabled={!sel.fecha || !sel.hora || sinDisponibilidad || sinConfiguracion}
                    onClick={() => ir(3)}
                    className={cn(
                      'flex-1 h-12 rounded-xl font-black text-base transition-all',
                      sel.fecha && sel.hora && !sinDisponibilidad && !sinConfiguracion
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5'
                        : 'opacity-40 cursor-not-allowed'
                    )}>
                    Continuar <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="outline" onClick={() => ir(1)} className="rounded-xl h-12 font-bold">
                    ← Atrás
                  </Button>
                </div>
              </Slide>

              {/* ── Paso 3: Datos del cliente ─────────────────────── */}
              <Slide active={paso === 3}>
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 mb-1">Tus datos</h2>
                  <p className="text-sm text-slate-400">Solo para enviarte la confirmación. Sin registro.</p>
                </div>

                <div className="space-y-4">
                  <Field icon={User} label="Nombre completo" required>
                    <input
                      placeholder="Juan Pérez"
                      value={sel.nombre}
                      onChange={e => setSel(p => ({ ...p, nombre: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800
                                 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                 focus:border-blue-400 transition placeholder:text-slate-300"
                    />
                  </Field>

                  <Field icon={Mail} label="Correo electrónico" required>
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={sel.email}
                      onChange={e => setSel(p => ({ ...p, email: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800
                                 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                 focus:border-blue-400 transition placeholder:text-slate-300"
                    />
                    <p className="text-xs text-slate-400 mt-1.5 ml-1">Recibirás la confirmación aquí ✉️</p>
                  </Field>

                  <Field icon={Phone} label="Teléfono (opcional)">
                    <input
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={sel.telefono}
                      onChange={e => setSel(p => ({ ...p, telefono: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800
                                 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                 focus:border-blue-400 transition placeholder:text-slate-300"
                    />
                  </Field>

                  {/* Resumen final compact */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm space-y-2.5">
                    <p className="font-black text-slate-700 text-xs uppercase tracking-wider">📋 Resumen final</p>
                    {[
                      { l: 'Servicio',    v: sel.servicio?.nombreServicio },
                      { l: 'Con',         v: sel.activo?.nombreActivo || sel.activo?.nombre },
                      { l: 'Fecha',       v: sel.fecha ? new Date(sel.fecha + 'T00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : '' },
                      { l: 'Hora',        v: sel.hora },
                    ].filter(r => r.v).map(({ l, v }) => (
                      <div key={l} className="flex justify-between">
                        <span className="text-slate-400">{l}</span>
                        <span className="font-bold text-slate-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    disabled={!sel.nombre || !sel.email || enviando}
                    onClick={confirmar}
                    className={cn(
                      'flex-1 h-13 rounded-xl font-black text-base text-white flex items-center justify-center gap-2.5',
                      'transition-all duration-300',
                      sel.nombre && sel.email && !enviando
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    )}>
                    {enviando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Confirmando reserva...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Confirmar reserva
                      </>
                    )}
                  </button>
                  <Button variant="outline" onClick={() => ir(2)} className="rounded-xl h-13 font-bold">
                    ← Atrás
                  </Button>
                </div>

                <p className="text-center text-xs text-slate-400 mt-4">
                  🔒 Tus datos solo se usan para confirmar tu reserva
                </p>
              </Slide>
            </>
          )}
          </div>

          {/* ── Columna derecha: resumen desktop ── */}
          {!confirmado && (
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <ResumenPanel sel={sel} empresa={empresa} icono={icono} paso={paso} />
              </div>
            </div>
          )}

        </div>{/* fin grid */}

        {/* ── Resumen mobile: barra fija en la parte inferior ── */}
        {!confirmado && (sel.servicio || sel.recurso || sel.fecha) && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-4 py-3">
            <div className="flex items-center justify-between gap-3 max-w-xl mx-auto">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">{icono}</span>
                <div className="min-w-0">
                  {sel.servicio && (
                    <p className="text-sm font-semibold text-gray-900 truncate">{sel.servicio.nombreServicio}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {sel.fecha
                      ? `${sel.fecha} ${sel.hora ?? ''}`
                      : sel.recurso
                        ? sel.recurso.nombreActivo ?? sel.recurso.nombre
                        : 'Completa los pasos'}
                  </p>
                </div>
              </div>
              {sel.servicio?.precio > 0 && (
                <span className="flex-shrink-0 text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {formatCLP(sel.servicio.precio)}
                </span>
              )}
            </div>
          </div>
        )}
        {/* Padding para que el contenido no quede tapado por la barra fija */}
        {!confirmado && (sel.servicio || sel.recurso || sel.fecha) && (
          <div className="lg:hidden h-20" />
        )}

      </main>
    </div>
  )
}

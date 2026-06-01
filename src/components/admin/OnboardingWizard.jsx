import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Boxes, Scissors, CalendarCheck, CalendarDays,
  Bell, LayoutDashboard, ChevronRight, ChevronLeft,
  X, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '../../auth/useAuth'

/* ──────────────────────────────────────────────────────────────────────
   PASOS DEL TUTORIAL
   ────────────────────────────────────────────────────────────────────── */
const PASOS = [
  {
    id:       'welcome',
    icon:     Sparkles,
    color:    'from-blue-600 to-indigo-600',
    bg:       'bg-gradient-to-br from-blue-50 to-indigo-50',
    iconBg:   'bg-gradient-to-br from-blue-600 to-indigo-600',
    titulo:   '¡Bienvenido a Flexibook! 🎉',
    subtitulo:'Tu plataforma de reservas está lista',
    descripcion: 'En los próximos pasos te mostraremos cómo configurar tu negocio para empezar a recibir reservas en minutos.',
    cta:      'Comenzar tour',
    ruta:     null,
  },
  {
    id:       'activos',
    icon:     Boxes,
    color:    'from-violet-600 to-purple-600',
    bg:       'bg-gradient-to-br from-violet-50 to-purple-50',
    iconBg:   'bg-gradient-to-br from-violet-500 to-purple-600',
    titulo:   '1. Agrega tus activos',
    subtitulo:'Personal, espacios y equipos',
    descripcion: 'Los activos son los recursos que brindan tus servicios: barberos, salas, sillas, canchas, etc. Necesitas al menos uno para recibir reservas.',
    tip:      '💡 Puedes agregar fotos y descripciones para que tus clientes conozcan a tu equipo.',
    cta:      'Ir a Activos',
    ruta:     '/dashboard/activos',
  },
  {
    id:       'servicios',
    icon:     Scissors,
    color:    'from-emerald-600 to-teal-600',
    bg:       'bg-gradient-to-br from-emerald-50 to-teal-50',
    iconBg:   'bg-gradient-to-br from-emerald-500 to-teal-600',
    titulo:   '2. Crea tus servicios',
    subtitulo:'Define precios y duración',
    descripcion: 'Configura cada servicio con su nombre, precio y duración. Tus clientes podrán elegir el servicio antes de reservar.',
    tip:      '💡 Los servicios activos aparecen automáticamente en tu portal público de reservas.',
    cta:      'Ir a Servicios',
    ruta:     '/dashboard/servicios',
  },
  {
    id:       'reservas',
    icon:     CalendarCheck,
    color:    'from-blue-600 to-cyan-600',
    bg:       'bg-gradient-to-br from-blue-50 to-cyan-50',
    iconBg:   'bg-gradient-to-br from-blue-500 to-cyan-600',
    titulo:   '3. Gestiona tus reservas',
    subtitulo:'Todo en un solo lugar',
    descripcion: 'Desde el panel de Reservas puedes ver todas las citas, crearlas manualmente o cancelarlas. También recibirás un email cuando alguien reserve.',
    tip:      '💡 Los clientes también pueden reservar directamente desde tu enlace público, ¡sin crear cuenta!',
    cta:      'Ir a Reservas',
    ruta:     '/dashboard/reservas',
  },
  {
    id:       'calendario',
    icon:     CalendarDays,
    color:    'from-orange-500 to-amber-500',
    bg:       'bg-gradient-to-br from-orange-50 to-amber-50',
    iconBg:   'bg-gradient-to-br from-orange-500 to-amber-500',
    titulo:   '4. Vista de calendario',
    subtitulo:'Tu agenda siempre visible',
    descripcion: 'El calendario te muestra todas tus reservas organizadas por día. Haz clic en cualquier día para ver el detalle de las citas.',
    tip:      '💡 Los puntos de color indican el estado de cada reserva: verde = confirmada, amarillo = pendiente.',
    cta:      'Ver Calendario',
    ruta:     '/dashboard/calendario',
  },
  {
    id:       'notificaciones',
    icon:     Bell,
    color:    'from-rose-500 to-pink-600',
    bg:       'bg-gradient-to-br from-rose-50 to-pink-50',
    iconBg:   'bg-gradient-to-br from-rose-500 to-pink-600',
    titulo:   '5. Notificaciones automáticas',
    subtitulo:'Emails que cuidan a tus clientes',
    descripcion: 'Flexibook envía automáticamente correos de confirmación cuando se crea o cancela una reserva, tanto al cliente como a ti.',
    tip:      '💡 También puedes enviar notificaciones manuales desde el panel de Notificaciones.',
    cta:      'Ver Notificaciones',
    ruta:     '/dashboard/notificaciones',
  },
  {
    id:       'listo',
    icon:     CheckCircle2,
    color:    'from-blue-600 to-blue-700',
    bg:       'bg-gradient-to-br from-blue-50 to-indigo-50',
    iconBg:   'bg-gradient-to-br from-blue-600 to-blue-700',
    titulo:   '¡Todo listo! 🚀',
    subtitulo:'Tu negocio está configurado',
    descripcion: 'Ya conoces todo lo que necesitas para empezar. Recuerda: primero agrega tus activos y servicios, y en minutos podrás recibir tus primeras reservas.',
    cta:      'Ir al Dashboard',
    ruta:     '/dashboard',
  },
]

/* ──────────────────────────────────────────────────────────────────────
   STORAGE KEY
   ────────────────────────────────────────────────────────────────────── */
function getKey(companyId) {
  return `flexibook_onboarding_done_${companyId}`
}

export function useOnboarding() {
  const { companyId } = useAuth()
  const key = getKey(companyId)

  const isDone  = () => !!localStorage.getItem(key)
  const markDone = () => localStorage.setItem(key, '1')

  return { isDone, markDone }
}

/* ──────────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
   ────────────────────────────────────────────────────────────────────── */
export default function OnboardingWizard({ onClose }) {
  const navigate = useNavigate()
  const { companyId, companyName } = useAuth()
  const { markDone } = useOnboarding()

  const [paso, setPaso]     = useState(0)
  const [saliendo, setSaliendo] = useState(false)

  const actual = PASOS[paso]
  const esUltimo = paso === PASOS.length - 1
  const Icon = actual.icon

  const cerrar = () => {
    markDone()
    setSaliendo(true)
    setTimeout(() => onClose?.(), 400)
  }

  const siguiente = () => {
    if (esUltimo) {
      cerrar()
      navigate('/dashboard')
    } else {
      setPaso(p => p + 1)
    }
  }

  const irYCerrar = () => {
    if (actual.ruta) {
      cerrar()
      navigate(actual.ruta)
    } else {
      siguiente()
    }
  }

  const anterior = () => paso > 0 && setPaso(p => p - 1)

  return (
    /* Overlay */
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center p-4',
      'bg-black/40 backdrop-blur-sm transition-all duration-400',
      saliendo ? 'opacity-0' : 'animate-in fade-in duration-400'
    )}>

      {/* Card principal */}
      <div className={cn(
        'relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden',
        'transition-all duration-400',
        saliendo ? 'scale-95 opacity-0' : 'animate-in zoom-in-95 slide-in-from-bottom-4 duration-500'
      )}>

        {/* Botón cerrar */}
        <button
          onClick={cerrar}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm
                     flex items-center justify-center text-slate-500 hover:text-slate-700
                     hover:bg-white shadow-sm transition-all hover:scale-110">
          <X className="w-4 h-4" />
        </button>

        {/* Header con gradiente */}
        <div className={cn('relative px-8 pt-10 pb-8 text-center', actual.bg)}>
          {/* Decoración */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Icono */}
          <div className={cn(
            'relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg',
            actual.iconBg,
            'animate-in zoom-in duration-500'
          )}>
            <Icon className="w-8 h-8 text-white" />
            {paso === 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full
                              flex items-center justify-center text-xs animate-bounce">
                ✨
              </div>
            )}
          </div>

          <h2 className="text-xl font-black text-slate-900 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {actual.titulo}
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            {actual.subtitulo}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-slate-600 leading-relaxed text-sm">
            {paso === 0 && companyName
              ? actual.descripcion.replace('tu negocio', `"${companyName}"`)
              : actual.descripcion
            }
          </p>

          {actual.tip && (
            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <span className="text-base flex-shrink-0 mt-0.5">💡</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {actual.tip.replace('💡 ', '')}
              </p>
            </div>
          )}

          {/* Lista de checks en el último paso */}
          {esUltimo && (
            <div className="space-y-2.5 pt-1">
              {[
                { icon: Boxes,        label: 'Agrega activos (personal/espacios)' },
                { icon: Scissors,     label: 'Crea tus servicios con precios' },
                { icon: CalendarCheck,label: 'Recibe reservas automáticamente' },
                { icon: Bell,         label: 'Emails de confirmación activados' },
              ].map(({ icon: I, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 space-y-3">
          {/* Barra de progreso */}
          <div className="flex items-center gap-1.5">
            {PASOS.map((_, i) => (
              <div
                key={i}
                onClick={() => setPaso(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                  i === paso
                    ? 'flex-1 bg-blue-600'
                    : i < paso
                    ? 'flex-1 bg-blue-200'
                    : 'w-6 bg-slate-100 hover:bg-slate-200'
                )}
              />
            ))}
          </div>

          <p className="text-xs text-center text-slate-400">
            Paso {paso + 1} de {PASOS.length}
          </p>

          {/* Botones */}
          <div className="flex gap-2.5">
            {paso > 0 && (
              <button
                onClick={anterior}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold
                           text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
                <ChevronLeft className="w-4 h-4" /> Atrás
              </button>
            )}

            <button
              onClick={irYCerrar}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl',
                'text-sm font-black text-white transition-all duration-200',
                'bg-gradient-to-r from-blue-600 to-blue-700',
                'shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5'
              )}>
              {actual.cta}
              {esUltimo
                ? <LayoutDashboard className="w-4 h-4" />
                : actual.ruta
                ? <ArrowRight className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />
              }
            </button>
          </div>

          {paso < PASOS.length - 1 && (
            <button
              onClick={siguiente}
              className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors py-1">
              Saltar al siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

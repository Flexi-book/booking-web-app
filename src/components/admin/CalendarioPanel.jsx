import { useState, useEffect, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { format, isSameDay, startOfMonth, endOfMonth } from 'date-fns'
import { Clock, User, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { reservasApi, serviciosApi } from '../../services/gestionService'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../ui/PageHeader'
import { Badge } from '../ui/badge'

const STATUS_VARIANT = {
  confirmada: 'success',
  pendiente:  'warning',
  cancelada:  'destructive',
  completada: 'secondary',
}
const StatusBadge = ({ status }) => (
  <Badge variant={STATUS_VARIANT[status?.toLowerCase()] || 'outline'}>
    {status || 'Pendiente'}
  </Badge>
)
import ErrorBanner from '../common/ErrorBanner'

// Clases Tailwind para DayPicker — sin CSS externo
const DPC = {
  root:             'w-full',
  months:           'flex flex-col',
  month:            'w-full',
  month_caption:    'flex items-center justify-between px-2 pb-4',
  caption_label:    'text-sm font-medium text-gray-600 capitalize',
  nav:              'flex items-center gap-1',
  button_previous:  'p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 transition',
  button_next:      'p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 transition',
  month_grid:       'w-full border-collapse',
  weekdays:         'flex',
  weekday:          'flex-1 text-center text-xs font-medium text-gray-300 pb-3 uppercase tracking-wide',
  week:             'flex',
  day:              'flex-1 p-0.5',
  day_button: [
    'w-full aspect-square flex flex-col items-center justify-center',
    'rounded-lg text-sm font-normal text-gray-500 relative transition-all',
    'hover:bg-gray-50 hover:text-gray-700',
  ].join(' '),
  selected:         '!bg-blue-50 !text-blue-600 !font-semibold rounded-lg ring-1 ring-blue-200',
  today:            'font-semibold text-gray-800',
  outside:          'text-gray-200',
  disabled:         'text-gray-200 cursor-not-allowed',
}

export default function CalendarioPanel() {
  const { companyId } = useAuth()
  const [reservas, setReservas]     = useState([])
  const [servicios, setServicios]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [mes, setMes]               = useState(new Date())
  const [diaSelected, setDiaSelected] = useState(new Date())

  useEffect(() => {
    if (!companyId) return
    setLoading(true)
    const options = { companyId, force: true }
    Promise.all([reservasApi.listar(options), serviciosApi.listar(options)])
      .then(([r, s]) => { setReservas(r); setServicios(s) })
      .catch(() => setError('Error al cargar reservas'))
      .finally(() => setLoading(false))
  }, [companyId])

  const servicioById = useMemo(
    () => Object.fromEntries(servicios.map(s => [s.id, s])),
    [servicios]
  )

  // Mapa fecha → lista de reservas
  const diasConReservas = useMemo(() => {
    const map = {}
    reservas.forEach(r => {
      const start = r.startTime || r.fechaInicio
      if (!start) return
      const key = format(new Date(start), 'yyyy-MM-dd')
      if (!map[key]) map[key] = []
      map[key].push(r)
    })
    return map
  }, [reservas])

  // Reservas del día seleccionado, ordenadas por hora
  const reservasDia = useMemo(() =>
    reservas
      .filter(r => {
        const start = r.startTime || r.fechaInicio
        return start && isSameDay(new Date(start), diaSelected)
      })
      .sort((a, b) => new Date(a.startTime || a.fechaInicio) - new Date(b.startTime || b.fechaInicio)),
    [reservas, diaSelected]
  )

  // KPIs del mes
  const kpis = useMemo(() => {
    const ini = startOfMonth(mes), fin = endOfMonth(mes)
    const del = reservas.filter(r => {
      const start = r.startTime || r.fechaInicio
      if (!start) return false
      const d = new Date(start)
      return d >= ini && d <= fin
    })
    return {
      total:       del.length,
      confirmadas: del.filter(r => r.estado === 'confirmada').length,
      pendientes:  del.filter(r => r.estado === 'pendiente').length,
      canceladas:  del.filter(r => r.estado === 'cancelada').length,
    }
  }, [reservas, mes])

  // Renderizador custom de cada día — agrega punto de color
  const DayContent = ({ day, modifiers }) => {
    const key   = format(day.date, 'yyyy-MM-dd')
    const lista = diasConReservas[key] || []
    const tiene = lista.length > 0

    // Color del punto según estado predominante — tonos suaves
    let dotColor = ''
    if (tiene) {
      if (lista.some(r => r.estado === 'confirmada'))   dotColor = 'bg-emerald-400'
      else if (lista.some(r => r.estado === 'pendiente')) dotColor = 'bg-amber-300'
      else if (lista.some(r => r.estado === 'cancelada')) dotColor = 'bg-rose-300'
      else dotColor = 'bg-gray-300'
    }

    return (
      <div className="flex flex-col items-center justify-center gap-0.5 w-full h-full">
        <span>{day.date.getDate()}</span>
        {tiene && (
          <span className={`w-1 h-1 rounded-full ${modifiers.selected ? 'bg-blue-300' : dotColor}`} />
        )}
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Cargando calendario...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario"
        subtitle="Haz clic en un día para ver sus reservas."
      />

      <ErrorBanner message={error} />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total del mes', value: kpis.total,       vCls: 'text-gray-800' },
          { label: 'Confirmadas',   value: kpis.confirmadas, vCls: 'text-emerald-600' },
          { label: 'Pendientes',    value: kpis.pendientes,  vCls: 'text-amber-500' },
          { label: 'Canceladas',    value: kpis.canceladas,  vCls: 'text-rose-400' },
        ].map(({ label, value, vCls }) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400 truncate">{label}</p>
            <p className={`text-2xl font-semibold mt-1 ${vCls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

        {/* ── Calendario ── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <DayPicker
            mode="single"
            selected={diaSelected}
            onSelect={d => d && setDiaSelected(d)}
            month={mes}
            onMonthChange={setMes}
            locale={es}
            showOutsideDays
            classNames={DPC}
            components={{
              DayButton: ({ day, modifiers, children, ...props }) => (
                <button {...props}>
                  <DayContent day={day} modifiers={modifiers} />
                </button>
              ),
              Chevron: ({ orientation }) =>
                orientation === 'left'
                  ? <ChevronLeft className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />,
            }}
          />

          {/* Leyenda */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-4">
            {[
              { dot: 'bg-emerald-400', label: 'Confirmada' },
              { dot: 'bg-amber-300',   label: 'Pendiente' },
              { dot: 'bg-rose-300',    label: 'Cancelada' },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel detalle del día ── */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Cabecera del panel */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {format(diaSelected, 'EEEE', { locale: es })}
              </p>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {format(diaSelected, "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              reservasDia.length > 0
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {reservasDia.length} reserva{reservasDia.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Lista */}
          <div className="overflow-y-auto max-h-[420px]">
            {reservasDia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">📭</span>
                <p className="text-gray-400 font-medium text-sm">Sin reservas este día</p>
                <p className="text-gray-300 text-xs mt-1">Selecciona un día marcado en el calendario</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {reservasDia.map(r => {
                  const svc = servicioById[r.serviceOfferingId || r.servicioId]
                  const start = r.startTime || r.fechaInicio
                  const end = r.endTime || r.fechaFin
                  const hora = start ? format(new Date(start), 'HH:mm') : '—'
                  const horaFin = end ? format(new Date(end), 'HH:mm') : '—'

                  return (
                    <div key={r.id} className="flex gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">

                      {/* Hora */}
                      <div className="flex-shrink-0 w-14 text-center">
                        <p className="text-sm font-bold text-blue-600">{hora}</p>
                        <div className="w-px h-5 bg-blue-100 mx-auto my-1" />
                        <p className="text-xs text-gray-400">{horaFin}</p>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              {r.customerName || r.clienteNombre || 'Sin nombre'}
                            </p>
                            {(r.customerEmail || r.clienteCorreo) && (
                              <p className="text-xs text-gray-400 ml-5">{r.customerEmail || r.clienteCorreo}</p>
                            )}
                          </div>
                          <StatusBadge status={r.estado} />
                        </div>

                        {svc && (
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {svc.nombreServicio}
                            </span>
                            {svc.duracionMinutos && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {svc.duracionMinutos} min
                              </span>
                            )}
                          </div>
                        )}

                        {r.observacion && (
                          <p className="text-xs text-gray-400 mt-2 italic bg-gray-50 rounded-md px-2.5 py-1.5">
                            "{r.observacion}"
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

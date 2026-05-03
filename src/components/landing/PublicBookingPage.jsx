import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { publicBookingApi } from '../../services/publicBookingService'

const emptyForm = {
  serviceOfferingId: '',
  assetId: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  startTime: '',
  note: '',
}

function formatHora(value) {
  return (value || '').slice(0, 5)
}

function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toIsoLocal(dt) {
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  const hh = String(dt.getHours()).padStart(2, '0')
  const mm = String(dt.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${hh}:${mm}`
}

function nextDateByWeekday(diaSemana) {
  // diaSemana backend: 1=lunes ... 7=domingo
  const now = new Date()
  const jsTarget = diaSemana % 7 // JS: 0=domingo ... 6=sábado
  const current = now.getDay()
  let delta = (jsTarget - current + 7) % 7
  if (delta === 0) delta = 7
  const target = new Date(now)
  target.setDate(now.getDate() + delta)
  return target
}

function weekdayFromDateKey(dateKey) {
  if (!dateKey) return null
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const js = date.getDay()
  return js === 0 ? 7 : js
}

function monthLabel(date) {
  return date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
}

function dayNameShort(date) {
  return date.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', '')
}

function buildMonthDays(baseDate) {
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startOffset = (first.getDay() + 6) % 7 // lunes=0
  const cells = []

  for (let i = 0; i < startOffset; i += 1) cells.push(null)
  for (let d = 1; d <= last.getDate(); d += 1) cells.push(new Date(year, month, d))
  return cells
}

export default function PublicBookingPage() {
  const { empresaId } = useParams()
  const servicesSectionRef = useRef(null)
  const [catalogo, setCatalogo] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedDayByService, setSelectedDayByService] = useState({})
  const [selectedDateByService, setSelectedDateByService] = useState({})
  const [selectedSlotByService, setSelectedSlotByService] = useState({})
  const [occupiedByKey, setOccupiedByKey] = useState({})
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  useEffect(() => {
    function handleClickOutsideCards(event) {
      const section = servicesSectionRef.current
      if (!section) return
      const clickedCard = event.target.closest('[data-service-card="true"]')
      if (section.contains(event.target) && !clickedCard) {
        setForm((f) => ({ ...f, serviceOfferingId: '', assetId: '', startTime: '' }))
      }
    }

    document.addEventListener('mousedown', handleClickOutsideCards)
    return () => document.removeEventListener('mousedown', handleClickOutsideCards)
  }, [])

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError('')
      try {
        const data = await publicBookingApi.obtenerCatalogoEmpresa(empresaId)
        setCatalogo(data)
      } catch {
        setError('No se pudo cargar la información de la empresa.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [empresaId])

  const servicioSeleccionado = useMemo(
    () => catalogo?.servicios?.find((s) => s.servicioId === form.serviceOfferingId),
    [catalogo, form.serviceOfferingId],
  )

  const profesionalesDelServicio = useMemo(() => {
    if (!servicioSeleccionado) return catalogo?.activos || []
    const ids = new Set((servicioSeleccionado.disponibilidades || []).map((d) => d.activoId))
    return (catalogo?.activos || []).filter((a) => ids.has(a.activoId))
  }, [catalogo, servicioSeleccionado])

  const disponibilidadActiva = useMemo(() => {
    if (!servicioSeleccionado || !form.assetId) return []
    return (servicioSeleccionado.disponibilidades || []).filter((d) => d.activoId === form.assetId)
  }, [servicioSeleccionado, form.assetId])

  const weekdaysDisponibles = useMemo(() => {
    return new Set(disponibilidadActiva.map((d) => Number(d.diaSemana)))
  }, [disponibilidadActiva])

  const horariosDisponiblesDia = useMemo(() => {
    const selectedDateKey = selectedDateByService[form.serviceOfferingId]
    const weekday = weekdayFromDateKey(selectedDateKey)
    if (!weekday) return []
    const disp = disponibilidadActiva.find((d) => Number(d.diaSemana) === weekday)
    return disp?.horarios || []
  }, [selectedDateByService, disponibilidadActiva, form.serviceOfferingId])

  useEffect(() => {
    async function cargarOcupados() {
      if (!catalogo?.servicios?.length) return
      const updates = {}
      for (const servicio of catalogo.servicios) {
        const serviceId = servicio.servicioId
        const dateKey = selectedDateByService[serviceId]
        if (!dateKey) continue
        const selectedDay = selectedDayByService[serviceId]
        const disponibilidad = (servicio.disponibilidades || []).find((d) => Number(d.diaSemana) === Number(selectedDay))
        if (!disponibilidad?.activoId) continue
        const key = `${serviceId}|${disponibilidad.activoId}|${dateKey}`
        try {
          const ocupados = await publicBookingApi.obtenerHorariosOcupados({
            serviceOfferingId: serviceId,
            assetId: disponibilidad.activoId,
            date: dateKey,
          })
          updates[key] = new Set((ocupados || []).map((t) => String(t).slice(0, 5)))
        } catch {
          updates[key] = new Set()
        }
      }
      if (Object.keys(updates).length > 0) {
        setOccupiedByKey((prev) => ({ ...prev, ...updates }))
      }
    }
    cargarOcupados()
  }, [catalogo, selectedDateByService, selectedDayByService])

  async function reservar(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSending(true)
    try {
      await publicBookingApi.crearReserva({
        companyId: empresaId,
        serviceOfferingId: form.serviceOfferingId,
        assetId: form.assetId,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone || undefined,
        startTime: form.startTime,
        note: form.note || undefined,
      })

      setSuccess('Reserva creada correctamente. Revisa tu correo para seguimiento con la empresa.')
      setForm(emptyForm)
      setSelectedDateByService({})
      setSelectedSlotByService({})
    } catch (err) {
      const data = err.response?.data
      const msg =
        data?.message ||
        data?.error ||
        (typeof data === 'string' ? data : null) ||
        err.message ||
        'No fue posible crear la reserva.'
      setError(typeof msg === 'string' ? msg : 'No fue posible crear la reserva.')
    } finally {
      setSending(false)
    }
  }

  function seleccionarServicio(servicio) {
    const primerActivo = servicio.disponibilidades?.[0]?.activoId || ''
    const primerDia = servicio.disponibilidades?.[0]?.diaSemana
    const fechaInicial = primerDia ? nextDateByWeekday(Number(primerDia)) : null
    const fechaInicialKey = fechaInicial ? toDateKey(fechaInicial) : ''

    setForm((f) => ({
      ...f,
      serviceOfferingId: servicio.servicioId,
      assetId: primerActivo,
      startTime: f.serviceOfferingId === servicio.servicioId ? f.startTime : '',
    }))

    if (primerDia) {
      setSelectedDayByService((prev) => ({
        ...prev,
        [servicio.servicioId]: Number(primerDia),
      }))
      setSelectedDateByService((prev) => ({
        ...prev,
        [servicio.servicioId]: prev[servicio.servicioId] || fechaInicialKey,
      }))
      setCalendarMonth(new Date(fechaInicial.getFullYear(), fechaInicial.getMonth(), 1))
    }
  }

  function seleccionarHorario(servicioId, disponibilidad, tramo, dateKey) {
    const [horaInicio] = String(tramo).split(' - ').map((x) => x.trim())
    const resolvedDateKey = dateKey || toDateKey(nextDateByWeekday(Number(disponibilidad.diaSemana)))
    const [y, m, d] = resolvedDateKey.split('-').map(Number)
    const fecha = new Date(y, m - 1, d)
    const [hh, mm] = horaInicio.split(':').map(Number)
    fecha.setHours(hh, mm, 0, 0)

    setSelectedDateByService((prev) => ({
      ...prev,
      [servicioId]: resolvedDateKey,
    }))
    setSelectedSlotByService((prev) => ({
      ...prev,
      [servicioId]: `${resolvedDateKey}T${horaInicio}`,
    }))
    setSelectedDayByService((prev) => ({
      ...prev,
      [servicioId]: Number(disponibilidad.diaSemana),
    }))

    setForm((f) => ({
      ...f,
      serviceOfferingId: servicioId,
      assetId: disponibilidad.activoId,
      startTime: toIsoLocal(fecha),
    }))
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8">Cargando...</div>
  }

  if (error && !catalogo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-6">
          <p className="text-red-700 font-medium">{error}</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 font-semibold hover:text-blue-700">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/flexibook-logo.svg" alt="Flexibook" className="w-9 h-9" />
            <div>
              <p className="text-lg font-bold text-gray-900">Flexibook</p>
              <p className="text-xs text-gray-500">Reserva sin login</p>
            </div>
          </Link>
          <Link to="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Ver empresas</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs uppercase tracking-wide text-blue-600 font-bold mb-2">Empresa</p>
          <h1 className="text-2xl font-bold text-gray-900">{catalogo?.empresa?.nombre}</h1>
          <p className="text-gray-600 mt-1">{catalogo?.empresa?.tipoNegocio || 'Negocio'}</p>
          <div className="mt-5 space-y-2 text-sm text-gray-600">
            <p><span className="font-semibold">Contacto:</span> {catalogo?.empresa?.correoContacto}</p>
            {catalogo?.empresa?.telefono && <p><span className="font-semibold">Teléfono:</span> {catalogo.empresa.telefono}</p>}
          </div>
        </section>

        <section ref={servicesSectionRef}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Servicios disponibles</h2>
          <div className="grid grid-cols-1 gap-4">
            {(catalogo?.servicios || []).map((servicio) => {
              const grouped = (servicio.disponibilidades || []).reduce((acc, d) => {
                const key = Number(d.diaSemana)
                if (!acc[key]) acc[key] = []
                acc[key].push(d)
                return acc
              }, {})

              const dias = Object.keys(grouped).map(Number).sort((a, b) => a - b)
              const selectedDia = selectedDayByService[servicio.servicioId] || dias[0]
              const disponibilidadDia = (grouped[selectedDia] || [])[0]
              const horarios = disponibilidadDia?.horarios || []
              const effectiveDateKey = selectedDateByService[servicio.servicioId] || (selectedDia ? toDateKey(nextDateByWeekday(Number(selectedDia))) : '')
              const effectiveWeekday = weekdayFromDateKey(effectiveDateKey)
              const disponibilidadFecha = (grouped[effectiveWeekday] || [])[0] || disponibilidadDia
              const occupiedKey = disponibilidadFecha?.activoId ? `${servicio.servicioId}|${disponibilidadFecha.activoId}|${effectiveDateKey}` : ''
              const occupied = occupiedByKey[occupiedKey] || new Set()

              return (
                <div
                  key={servicio.servicioId}
                  data-service-card="true"
                  onClick={() => seleccionarServicio(servicio)}
                  className={`text-left bg-white rounded-xl border p-5 shadow-sm transition cursor-pointer ${
                    form.serviceOfferingId === servicio.servicioId
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{servicio.nombreServicio}</h3>
                      {servicio.descripcion && <p className="text-sm text-gray-600 mt-1">{servicio.descripcion}</p>}
                    </div>
                    <p className="text-blue-600 font-bold">${Number(servicio.precio).toLocaleString('es-CL')}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Duración: {servicio.duracionMinutos} min</p>

                  {form.serviceOfferingId === servicio.servicioId && (
                    <div className="mt-4 space-y-3 animate-[fadeIn_.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-700">Calendario disponible</p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="w-7 h-7 rounded-md border border-gray-300 text-gray-700"
                              onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                            >
                              ‹
                            </button>
                            <p className="text-xs font-semibold text-gray-700 min-w-[120px] text-center capitalize">{monthLabel(calendarMonth)}</p>
                            <button
                              type="button"
                              className="w-7 h-7 rounded-md border border-gray-300 text-gray-700"
                              onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                            >
                              ›
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-500">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, idx) => <div key={`hdr-card-${idx}`} className="text-center font-semibold">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {buildMonthDays(calendarMonth).map((day, idx) => {
                            if (!day) return <div key={`empty-card-${idx}`} className="h-8" />
                            const key = toDateKey(day)
                            const now = new Date()
                            now.setHours(0, 0, 0, 0)
                            const isPast = day < now
                            const weekday = weekdayFromDateKey(key)
                            const available = !isPast && dias.includes(weekday)
                            const selected = key === effectiveDateKey
                            return (
                              <button
                                key={key}
                                type="button"
                                disabled={!available}
                                onClick={() => {
                                  setSelectedDateByService((prev) => ({ ...prev, [servicio.servicioId]: key }))
                                  setSelectedDayByService((prev) => ({ ...prev, [servicio.servicioId]: weekday }))
                                  setSelectedSlotByService((prev) => ({ ...prev, [servicio.servicioId]: '' }))
                                  setForm((f) => ({ ...f, startTime: '' }))
                                }}
                                className={`h-8 rounded-md border text-xs ${selected ? 'border-blue-600 bg-blue-600 text-white' : available ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-gray-200 bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed'}`}
                              >
                                {day.getDate()}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                  )}

                  {disponibilidadDia && (
                    <p className="text-xs text-gray-500 mt-2">
                      {disponibilidadDia.diaNombre} {formatHora(disponibilidadDia.horaInicio)}-{formatHora(disponibilidadDia.horaFin)} · {disponibilidadDia.cuposPorDia} cupos
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {horarios.slice(0, 8).map((tramo, i) => (
                      (() => {
                        const [horaInicio] = String(tramo).split(' - ').map((x) => x.trim())
                        const selected = selectedSlotByService[servicio.servicioId] === `${effectiveDateKey}T${horaInicio}`
                        return (
                          <button
                            key={`${servicio.servicioId}-${selectedDia}-${i}`}
                            type="button"
                            disabled={occupied.has(horaInicio)}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!disponibilidadFecha) return
                              if (occupied.has(horaInicio)) return
                              seleccionarHorario(
                                servicio.servicioId,
                                disponibilidadFecha,
                                tramo,
                                effectiveDateKey,
                              )
                            }}
                            className={`text-xs px-2 py-1 rounded-md border ${
                              selected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : occupied.has(horaInicio)
                                  ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                            }`}
                          >
                            {tramo}
                          </button>
                        )
                      })()
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reserva tu hora</h2>
          <p className="text-gray-600 mb-6">Elige profesional, fecha y hora para el servicio seleccionado.</p>

          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm font-medium text-red-800">{error}</div>}
          {success && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm font-medium text-green-800">{success}</div>}

          <form onSubmit={reservar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Servicio</label>
                <select required className="w-full h-12 border border-gray-300 rounded-lg px-4 bg-white" value={form.serviceOfferingId} onChange={(e) => setForm((f) => ({ ...f, serviceOfferingId: e.target.value }))}>
                  <option value="">Selecciona un servicio</option>
                  {(catalogo?.servicios || []).map((s) => (
                    <option key={s.servicioId} value={s.servicioId}>{s.nombreServicio} ({s.duracionMinutos} min)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profesional / Puesto</label>
                <select required className="w-full h-12 border border-gray-300 rounded-lg px-4 bg-white" value={form.assetId} onChange={(e) => setForm((f) => ({ ...f, assetId: e.target.value }))}>
                  <option value="">Selecciona un profesional</option>
                  {profesionalesDelServicio.map((a) => (
                    <option key={a.activoId} value={a.activoId}>{a.nombre} ({a.tipoActivo})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tu nombre</label>
                <input required className="w-full h-12 border border-gray-300 rounded-lg px-4" value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tu email</label>
                <input required type="email" className="w-full h-12 border border-gray-300 rounded-lg px-4" value={form.customerEmail} onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tu teléfono</label>
                <input className="w-full h-12 border border-gray-300 rounded-lg px-4" value={form.customerPhone} onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha y hora</label>
                <input required type="datetime-local" className="w-full h-12 border border-gray-300 rounded-lg px-4 bg-gray-50" value={form.startTime} readOnly />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Observación (opcional)</label>
              <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3" rows="3" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </div>

            {servicioSeleccionado && (
              <p className="text-xs text-gray-500">
                Duración estimada: <span className="font-semibold">{servicioSeleccionado.duracionMinutos} min</span> · Valor: <span className="font-semibold">${Number(servicioSeleccionado.precio).toLocaleString('es-CL')}</span>
              </p>
            )}

            <button disabled={sending} className="h-12 px-8 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60">
              {sending ? 'Reservando...' : 'Confirmar reserva'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

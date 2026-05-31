import { useState, useEffect, useMemo } from 'react'
import { reservasApi, activosApi, serviciosApi, notificacionesApi } from '../../services/gestionService'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../ui/PageHeader'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import ErrorBanner from '../common/ErrorBanner'
import ConfirmDialog from '../ui/ConfirmDialog'

const emptyForm = {
  serviceOfferingId: '', assetId: '', customerName: '',
  customerEmail: '', customerPhone: '', startTime: '', note: '',
}

export default function ReservasPanel() {
  const { user, companyId } = useAuth()
  const [reservas, setReservas]   = useState([])
  const [activos, setActivos]     = useState([])
  const [servicios, setServicios] = useState([])
  const [form, setForm]           = useState(emptyForm)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([reservasApi.listar(), activosApi.listar(), serviciosApi.listar()])
      .then(([r, a, s]) => { setReservas(r); setActivos(a); setServicios(s) })
      .catch(() => setError('Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [])

  const servicioById = useMemo(
    () => Object.fromEntries(servicios.map(s => [s.id, s])),
    [servicios]
  )
  const servicioSeleccionado = useMemo(
    () => servicios.find(s => s.id === form.serviceOfferingId),
    [servicios, form.serviceOfferingId]
  )

  async function crearReserva(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const reserva = await reservasApi.crear({
        serviceOfferingId: form.serviceOfferingId,
        assetId:           form.assetId,
        customerName:      form.customerName,
        customerEmail:     form.customerEmail,
        customerPhone:     form.customerPhone || undefined,
        startTime:         form.startTime,
        note:              form.note || undefined,
      })

      // Enviar notificaciones por correo al cliente y al admin
      const servicio = servicios.find(s => s.id === form.serviceOfferingId)
      const fecha    = new Date(form.startTime).toLocaleString('es-CL', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })

      notificacionesApi.enviarConfirmacionReserva({
        clienteEmail:  form.customerEmail,
        clienteNombre: form.customerName,
        adminEmail:    user?.email,
        servicio:      servicio?.nombreServicio ?? 'Servicio',
        fecha,
        empresa:       user?.companyName ?? 'la empresa',
        mensaje:       form.note || '',
      }).catch(err => console.warn('Notificación no enviada:', err.message))
      // El catch es silencioso — la reserva ya fue creada, la notificación es best-effort

      setSuccess('Reserva creada. Se enviaron correos de confirmación.')
      setForm(emptyForm)
      setShowForm(false)
      reservasApi.listar().then(setReservas)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al crear reserva'
      setError(typeof msg === 'string' ? msg : 'Horario no disponible.')
    }
  }

  async function handleCancelar() {
    setError('')
    try {
      const reserva = reservas.find(r => r.id === confirmId)
      await reservasApi.cancelar(confirmId)
      setConfirmId(null)
      reservasApi.listar().then(setReservas)

      // Notificar al cliente por email
      if (reserva?.clienteCorreo) {
        const servicio = servicioById[reserva.servicioId]
        const fecha = reserva.fechaInicio
          ? new Date(reserva.fechaInicio).toLocaleString('es-CL', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })
          : ''
        notificacionesApi.enviarCancelacion({
          clienteEmail:  reserva.clienteCorreo,
          clienteNombre: reserva.clienteNombre || 'Cliente',
          servicio:      servicio?.nombreServicio || 'Servicio',
          fecha,
        }).catch(err => console.warn('Notificación cancelación no enviada:', err.message))
      }
    } catch {
      setError('Error al cancelar reserva')
      setConfirmId(null)
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Reservas"
        subtitle="Administra las reservas de tus servicios."
        action={!showForm && (
          <Button onClick={() => { setShowForm(true); setError(''); setSuccess('') }}>
            + Nueva Reserva
          </Button>
        )}
      />

      <ErrorBanner message={error} />

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nueva Reserva</h2>
          <form onSubmit={crearReserva} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio *</label>
                <select required className={inputCls} value={form.serviceOfferingId}
                  onChange={e => setForm(f => ({ ...f, serviceOfferingId: e.target.value }))}>
                  <option value="">Selecciona un servicio</option>
                  {servicios.filter(s => s.estadoServicioId === 'activo').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombreServicio} ({s.duracionMinutos} min — ${Number(s.precio).toFixed(2)})
                    </option>
                  ))}
                </select>
                {servicioSeleccionado && (
                  <p className="text-xs text-gray-400 mt-1">
                    ⏱ Duración: {servicioSeleccionado.duracionMinutos} min
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activo *</label>
                <select required className={inputCls} value={form.assetId}
                  onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))}>
                  <option value="">Selecciona un activo</option>
                  {activos.filter(a => ['Disponible', 'disponible'].includes(a.estadoDisponibilidad)).map(a => (
                    <option key={a.id} value={a.id}>{a.nombreActivo} ({a.tipoActivo})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Cliente *</label>
                <input required className={inputCls} value={form.customerName}
                  onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  placeholder="Juan Pérez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Cliente *</label>
                <input required type="email" className={inputCls} value={form.customerEmail}
                  onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                  placeholder="cliente@email.com" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora *</label>
                <input required type="datetime-local" className={inputCls} value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Confirmar Reserva</Button>
              <Button variant="secondary" type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); setError('') }}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : reservas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No hay reservas registradas aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Cliente</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Servicio</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Fecha / Hora</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Estado</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservas.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{r.clienteNombre || '—'}</p>
                    <p className="text-xs text-gray-400">{r.clienteCorreo || ''}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {servicioById[r.servicioId]?.nombreServicio || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {r.fechaInicio ? new Date(r.fechaInicio).toLocaleString('es-CL') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={r.estado || 'pendiente'} label={r.estado || 'Pendiente'} />
                  </td>
                  <td className="px-6 py-4">
                    {r.estado !== 'cancelada' && r.estado !== 'completada' && (
                      <Button size="sm" variant="danger" onClick={() => setConfirmId(r.id)}>
                        Cancelar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="¿Cancelar esta reserva?"
        message="El cliente será notificado de la cancelación."
        confirmLabel="Sí, cancelar"
        onConfirm={handleCancelar}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

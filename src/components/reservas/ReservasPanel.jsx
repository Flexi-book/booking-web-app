import { useState, useEffect, useMemo } from 'react'
import { reservasApi, activosApi, serviciosApi } from '../../services/gestionService'
import ErrorBanner from '../common/ErrorBanner'
import { reservationStatusColor } from '../../utils/statusColors'

const emptyForm = { serviceOfferingId: '', assetId: '', customerName: '', customerEmail: '', customerPhone: '', startTime: '', note: '' }

export default function ReservasPanel() {
  const [reservas, setReservas] = useState([])
  const [activos, setActivos] = useState([])
  const [servicios, setServicios] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([reservasApi.listar(), activosApi.listar(), serviciosApi.listar()])
      .then(([reservasList, activosList, serviciosList]) => {
        setReservas(reservasList)
        setActivos(activosList)
        setServicios(serviciosList)
      })
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
      const payload = {
        serviceOfferingId: form.serviceOfferingId,
        assetId: form.assetId,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone || undefined,
        startTime: form.startTime,
        note: form.note || undefined,
      }
      await reservasApi.crear(payload)
      setSuccess('Reserva creada correctamente')
      setForm(emptyForm)
      setShowForm(false)
      reservasApi.listar().then(setReservas).catch(() => {})
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al crear reserva'
      setError(typeof msg === 'string' ? msg : 'Horario no disponible — el activo ya tiene una reserva en ese horario.')
    }
  }

  async function cancelarReserva(id) {
    if (!confirm('¿Cancelar esta reserva?')) return
    setError('')
    try {
      await reservasApi.cancelar(id)
      reservasApi.listar().then(setReservas).catch(() => {})
    } catch {
      setError('Error al cancelar reserva')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestión de Reservas</h1>
          <p className="text-gray-600 mt-2">Administra las reservas de tus servicios.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setError(''); setSuccess('') }}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>+</span> Nueva Reserva
          </button>
        )}
      </div>

      <ErrorBanner message={error} />

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Reserva</h2>
          <form onSubmit={crearReserva} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servicio *</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.serviceOfferingId}
                  onChange={e => setForm(f => ({ ...f, serviceOfferingId: e.target.value }))}
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.filter(s => s.estadoServicioId === 'activo').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombreServicio} ({s.duracionMinutos} min — €{Number(s.precio).toFixed(2)})
                    </option>
                  ))}
                </select>
                {servicioSeleccionado && (
                  <p className="text-xs text-gray-500 mt-2">
                    ⏱️ Duración: {servicioSeleccionado.duracionMinutos} min. La hora de término se calcula automáticamente.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activo / Recurso *</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.assetId}
                  onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))}
                >
                  <option value="">Selecciona un activo</option>
                  {activos.filter(a => a.estadoDisponibilidad === 'Disponible' || a.estadoDisponibilidad === 'disponible').map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nombreActivo} ({a.tipoActivo})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Cliente *</label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.clienteNombre}
                  onChange={e => setForm(f => ({ ...f, clienteNombre: e.target.value }))}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email del Cliente *</label>
                <input
                  required
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.clienteCorreo}
                  onChange={e => setForm(f => ({ ...f, clienteCorreo: e.target.value }))}
                  placeholder="cliente@email.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y hora de inicio *</label>
                <input
                  required
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.fechaInicio}
                  onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition">
                Confirmar Reserva
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); setError('') }}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : reservas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No hay reservas registradas aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">CLIENTE</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">SERVICIO</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">FECHA / HORA</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">ESTADO</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reservas.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{r.clienteNombre || '—'}</p>
                    <p className="text-xs text-gray-500">{r.clienteCorreo || ''}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {servicioById[r.servicioId]?.nombreServicio || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {r.fechaInicio ? new Date(r.fechaInicio).toLocaleString('es-CL') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${reservationStatusColor(r.estado || 'pendiente')}`}>
                      {r.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.estado !== 'cancelada' && r.estado !== 'completada' && (
                      <button onClick={() => cancelarReserva(r.id)} className="text-red-600 hover:text-red-700 font-medium text-xs">
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

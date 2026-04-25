import { useState, useEffect } from 'react'
import { reservasApi, activosApi, serviciosApi } from '../../services/gestionService'

const emptyForm = { servicioId: '', activoId: '', clienteNombre: '', clienteCorreo: '', fechaInicio: '' }

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
    cargar()
    activosApi.listar().then(setActivos).catch(() => {})
    serviciosApi.listar().then(setServicios).catch(() => {})
  }, [])

  async function cargar() {
    setLoading(true)
    try {
      setReservas(await reservasApi.listar())
    } catch {
      setError('Error al cargar reservas')
    } finally {
      setLoading(false)
    }
  }

  async function crearReserva(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const payload = {
        servicioId: form.servicioId,
        activoId: form.activoId,
        clienteNombre: form.clienteNombre,
        clienteCorreo: form.clienteCorreo,
        fechaInicio: form.fechaInicio + ':00',
      }
      await reservasApi.crear(payload)
      setSuccess('Reserva creada correctamente')
      setForm(emptyForm)
      setShowForm(false)
      cargar()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al crear reserva'
      setError(typeof msg === 'string' ? msg : 'Horario no disponible — el activo ya tiene una reserva en ese horario.')
    }
  }

  async function cancelar(id) {
    if (!confirm('¿Cancelar esta reserva?')) return
    setError('')
    try {
      await reservasApi.cancelar(id)
      cargar()
    } catch {
      setError('Error al cancelar reserva')
    }
  }

  const servicioSeleccionado = servicios.find(s => s.id === form.servicioId)

  const estadoColor = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
    completada: 'bg-blue-100 text-blue-800',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Reservas</h3>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setError(''); setSuccess('') }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            + Nueva reserva
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</p>}
      {success && <p className="mb-3 text-sm text-green-700 bg-green-50 p-3 rounded border border-green-200">{success}</p>}

      {showForm && (
        <form onSubmit={crearReserva} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <h4 className="font-medium text-gray-700">Nueva reserva</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Servicio *</label>
              <select
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.servicioId}
                onChange={e => setForm(f => ({ ...f, servicioId: e.target.value }))}
              >
                <option value="">Selecciona un servicio</option>
                {servicios.filter(s => s.estado === 'activo').map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombreServicio} ({s.duracionMinutos} min — ${Number(s.precio).toLocaleString('es-CL')})
                  </option>
                ))}
              </select>
              {servicioSeleccionado && (
                <p className="text-xs text-gray-500 mt-1">
                  Duración: {servicioSeleccionado.duracionMinutos} min. La hora de término se calcula automáticamente.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Activo / Recurso *</label>
              <select
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.activoId}
                onChange={e => setForm(f => ({ ...f, activoId: e.target.value }))}
              >
                <option value="">Selecciona un activo</option>
                {activos.filter(a => a.estadoDisponibilidad === 'disponible').map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nombreActivo} ({a.tipoActivo})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del cliente *</label>
              <input
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.clienteNombre}
                onChange={e => setForm(f => ({ ...f, clienteNombre: e.target.value }))}
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email del cliente *</label>
              <input
                required
                type="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.clienteCorreo}
                onChange={e => setForm(f => ({ ...f, clienteCorreo: e.target.value }))}
                placeholder="cliente@email.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha y hora de inicio *</label>
              <input
                required
                type="datetime-local"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.fechaInicio}
                onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              Confirmar reserva
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(emptyForm); setError('') }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : reservas.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">No hay reservas registradas aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Inicio</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Fin</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {reservas.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.clienteNombre || '—'}</p>
                    <p className="text-xs text-gray-500">{r.clienteCorreo || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.fechaInicio ? new Date(r.fechaInicio).toLocaleString('es-CL') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.fechaFin ? new Date(r.fechaFin).toLocaleString('es-CL') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor[r.estado] || 'bg-gray-100'}`}>
                      {r.estado || 'pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.estado !== 'cancelada' && r.estado !== 'completada' && (
                      <button onClick={() => cancelar(r.id)} className="text-red-500 hover:underline text-xs">
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

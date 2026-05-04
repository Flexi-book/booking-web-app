import { useState, useEffect } from 'react'
import { activosApi } from '../../services/gestionService'

const TIPOS = [
  { id: 'c76b683f-3b17-4058-b26f-2a43f9067441', nombre: 'barbero' },
  { id: '7da96ce4-1f8b-4fb3-97b3-51e8b6c9593d', nombre: 'cancha' },
  { id: '60cf6474-bc41-4bc3-8a90-a1907396610e', nombre: 'otro' },
  { id: '6b0b614a-3fba-48d0-b411-d349b3f003ae', nombre: 'peluquero' },
  { id: 'ba1e470c-25ea-4871-96ff-5aba2ce68ab5', nombre: 'profesional' },
  { id: 'f072393c-016b-47af-ad8d-df4a08ec0a79', nombre: 'sala' },
  { id: '318dd191-b1b2-42d1-87e3-6cfc044bec8b', nombre: 'silla' },
]

const emptyForm = { nombre: '', descripcion: '', tipoActivoId: 'Espacio', estadoDisponibilidadId: 'Disponible' }

export default function ActivosPanel() {
  const [activos, setActivos] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { cargar() }, [])

  function getUserCompanyId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.empresaId || user.companyId || ''
    } catch {
      return ''
    }
  }

  async function cargar() {
    const empresaId = getUserCompanyId()
    if (!empresaId) {
      setError('No se encontró empresa asociada al usuario.')
      return
    }

    setLoading(true)
    try {
      setActivos(await activosApi.listar(empresaId))
      setForm((prev) => ({ ...prev, empresaId }))
    } catch {
      setError('Error al cargar activos')
    } finally {
      setLoading(false)
    }
  }

  function iniciarEdicion(activo) {
    setForm({
      nombre: activo.nombreActivo,
      descripcion: activo.descripcion || '',
      tipoActivoId: activo.tipoActivo,
      estadoDisponibilidadId: activo.estadoDisponibilidad,
    })
    setEditingId(activo.id)
    setShowForm(true)
    setError('')
  }

  function cancelar() {
    setForm({ ...emptyForm, empresaId: getUserCompanyId() })
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')

    if (!form.empresaId || !form.tipoActivoId || !form.estadoDisponibilidadId) {
      setError('Faltan datos obligatorios para crear el activo.')
      return
    }

    try {
      if (editingId) {
        await activosApi.actualizar(editingId, form)
      } else {
        await activosApi.crear(form)
      }
      cancelar()
      cargar()
    } catch (err) {
      const backendMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : null)
      setError(backendMsg || 'Error al guardar activo')
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este activo?')) return
    try {
      await activosApi.eliminar(id)
      cargar()
    } catch {
      setError('Error al eliminar activo')
    }
  }

  const getStatusColor = (estado) => {
    const v = String(estado || '').toLowerCase()
    if (v.includes('disponible') && !v.includes('no_')) return 'bg-green-100 text-green-700'
    if (v.includes('no_disponible') || v.includes('no disponible')) return 'bg-red-100 text-red-700'
    if (v.includes('inactivo') || v.includes('mantenimiento')) return 'bg-orange-100 text-orange-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getTypeIcon = (tipo) => {
    const v = String(tipo || '').toLowerCase()
    if (v.includes('sala') || v.includes('cancha')) return '📍'
    if (v.includes('barbero') || v.includes('peluquero') || v.includes('profesional')) return '👤'
    if (v.includes('silla')) return '🪑'
    return '📦'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestión de Activos</h1>
          <p className="text-gray-600 mt-2">Personal y espacios de trabajo disponibles.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-800 transition flex items-center gap-2"
          >
            <span>+</span> Añadir Activo
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{editingId ? 'Editar Activo' : 'Nuevo Activo'}</h2>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Sala Zen A1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.tipoActivoId}
                  onChange={e => setForm(f => ({ ...f, tipoActivoId: e.target.value }))}
                >
                  {TIPOS.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.estadoDisponibilidadId}
                  onChange={e => setForm(f => ({ ...f, estadoDisponibilidadId: e.target.value }))}
                >
                  {ESTADOS.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm h-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition">
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={cancelar} className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : activos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No hay activos registrados aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">ACTIVO / RECURSO</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">TIPO</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">ESTADO</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activos.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getTypeIcon(a.tipoActivo || '')}</span>
                      <div>
                        <p className="font-medium text-gray-900">{a.nombreActivo}</p>
                        {a.descripcion && <p className="text-xs text-gray-500">{a.descripcion}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{a.tipoActivo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(a.estadoDisponibilidad)}`}>
                        {a.estadoDisponibilidad}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => iniciarEdicion(a)} className="text-blue-600 hover:text-blue-700 font-medium text-xs">
                      Editar
                    </button>
                    <button onClick={() => eliminar(a.id)} className="text-red-600 hover:text-red-700 font-medium text-xs">
                      Eliminar
                    </button>
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

import { useState, useEffect } from 'react'
import { activosApi } from '../../services/gestionService'

const TIPOS = ['Espacio', 'Personal', 'Equipo']
const ESTADOS = ['Disponible', 'No disponible', 'En mantenimiento']

const emptyForm = { nombre: '', descripcion: '', tipoActivoId: 'Espacio', estadoDisponibilidadId: 'Disponible' }

export default function ActivosPanel() {
  const [activos, setActivos] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try {
      setActivos(await activosApi.listar())
    } catch {
      setError('Error al cargar activos')
    } finally {
      setLoading(false)
    }
  }

  function iniciarEdicion(activo) {
    setForm({
      nombre: activo.nombre,
      descripcion: activo.descripcion || '',
      tipoActivoId: activo.tipoActivoId,
      estadoDisponibilidadId: activo.estadoDisponibilidadId,
    })
    setEditingId(activo.id)
    setShowForm(true)
    setError('')
  }

  function cancelar() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await activosApi.actualizar(editingId, form)
      } else {
        await activosApi.crear(form)
      }
      cancelar()
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar activo')
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
    switch(estado) {
      case 'Disponible':
      case 'disponible':
        return 'bg-green-100 text-green-700'
      case 'No disponible':
      case 'no_disponible':
        return 'bg-red-100 text-red-700'
      case 'En mantenimiento':
      case 'inactivo':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (tipo) => {
    switch(tipo.toLowerCase()) {
      case 'espacio':
      case 'sala':
        return '📍'
      case 'personal':
      case 'profesional':
        return '👤'
      case 'equipo':
        return '⚙️'
      default:
        return '📦'
    }
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
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.estadoDisponibilidadId}
                  onChange={e => setForm(f => ({ ...f, estadoDisponibilidadId: e.target.value }))}
                >
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <span className="text-xl">{getTypeIcon(a.tipoActivoId)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{a.nombre}</p>
                        {a.descripcion && <p className="text-xs text-gray-500">{a.descripcion}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{a.tipoActivoId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(a.estadoDisponibilidadId)}`}>
                        {a.estadoDisponibilidadId}
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

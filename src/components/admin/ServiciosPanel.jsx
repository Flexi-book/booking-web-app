import { useState, useEffect } from 'react'
import { serviciosApi } from '../../services/gestionService'

const emptyForm = { nombreServicio: '', descripcion: '', duracionMinutos: 30, precio: 0, estadoServicioId: 'activo' }

export default function ServiciosPanel() {
  const [servicios, setServicios] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try {
      setServicios(await serviciosApi.listar())
    } catch {
      setError('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }

  function iniciarEdicion(s) {
    setForm({
      nombreServicio: s.nombreServicio,
      descripcion: s.descripcion || '',
      duracionMinutos: s.duracionMinutos,
      precio: s.precio,
      estadoServicioId: s.estado,
    })
    setEditingId(s.id)
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
        await serviciosApi.actualizar(editingId, form)
      } else {
        await serviciosApi.crear(form)
      }
      cancelar()
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar servicio')
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este servicio?')) return
    try {
      await serviciosApi.eliminar(id)
      cargar()
    } catch {
      setError('Error al eliminar servicio')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Catálogo de Servicios</h1>
          <p className="text-gray-600 mt-2">Administra los servicios y precios disponibles.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <span>+</span> Nuevo Servicio
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.nombreServicio}
                  onChange={e => setForm(f => ({ ...f, nombreServicio: e.target.value }))}
                  placeholder="Ej: Masaje Deportivo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duración (minutos) *</label>
                <input
                  required
                  type="number"
                  min="5"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.duracionMinutos}
                  onChange={e => setForm(f => ({ ...f, duracionMinutos: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.precio}
                  onChange={e => setForm(f => ({ ...f, precio: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.estadoServicioId}
                  onChange={e => setForm(f => ({ ...f, estadoServicioId: e.target.value }))}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="pausado">Pausado</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Describe el servicio..."
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
      ) : servicios.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No hay servicios registrados aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">SERVICIO</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">DURACIÓN</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">PRECIO</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">ESTADO</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {servicios.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{s.nombreServicio}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-1.414 1.414a1 1 0 101.414 1.414L9 10.586V6z" clipRule="evenodd"></path>
                      </svg>
                      {s.duracionMinutos} min
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-semibold">€{Number(s.precio).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      s.estado?.toLowerCase() === 'activo' ? 'bg-green-100 text-green-700' :
                      s.estado?.toLowerCase() === 'pausado' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {s.estado || 'activo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => iniciarEdicion(s)} className="text-blue-600 hover:text-blue-700 font-medium text-xs">
                      Editar
                    </button>
                    <button onClick={() => eliminar(s.id)} className="text-red-600 hover:text-red-700 font-medium text-xs">
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

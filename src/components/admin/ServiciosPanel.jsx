import { useState, useEffect } from 'react'
import { serviciosApi } from '../../services/gestionService'

const emptyForm = { nombreServicio: '', descripcion: '', duracionMinutos: 30, precio: 0, estado: 'activo' }

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
      estado: s.estado,
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Servicios ofrecidos</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            + Nuevo servicio
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      {showForm && (
        <form onSubmit={guardar} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <h4 className="font-medium text-gray-700">{editingId ? 'Editar servicio' : 'Nuevo servicio'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.nombreServicio}
                onChange={e => setForm(f => ({ ...f, nombreServicio: e.target.value }))}
                placeholder="Ej: Corte de cabello"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duración (minutos) *</label>
              <input
                required
                type="number"
                min="5"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.duracionMinutos}
                onChange={e => setForm(f => ({ ...f, duracionMinutos: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.precio}
                onChange={e => setForm(f => ({ ...f, precio: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.estado}
                onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
              >
                <option value="activo">activo</option>
                <option value="inactivo">inactivo</option>
                <option value="pausado">pausado</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Describe el servicio..."
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={cancelar} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : servicios.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">No hay servicios registrados aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Duración</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Precio</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {servicios.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.nombreServicio}</td>
                  <td className="px-4 py-3 text-gray-600">{s.duracionMinutos} min</td>
                  <td className="px-4 py-3 text-gray-600">${Number(s.precio).toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.estado === 'activo' ? 'bg-green-100 text-green-800' :
                      s.estado === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {s.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => iniciarEdicion(s)} className="text-blue-600 hover:underline text-xs">Editar</button>
                    <button onClick={() => eliminar(s.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
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

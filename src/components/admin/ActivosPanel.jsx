import { useState, useEffect } from 'react'
import { activosApi } from '../../services/gestionService'

const TIPOS = ['sala', 'profesional', 'equipo']
const ESTADOS = ['disponible', 'no_disponible', 'inactivo']

const emptyForm = { nombreActivo: '', descripcion: '', tipoActivo: 'sala', estadoDisponibilidad: 'disponible' }

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
      nombreActivo: activo.nombreActivo,
      descripcion: activo.descripcion || '',
      tipoActivo: activo.tipoActivo,
      estadoDisponibilidad: activo.estadoDisponibilidad,
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

  const badgeColor = {
    disponible: 'bg-green-100 text-green-800',
    no_disponible: 'bg-red-100 text-red-800',
    inactivo: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Activos de la empresa</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            + Nuevo activo
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      {showForm && (
        <form onSubmit={guardar} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <h4 className="font-medium text-gray-700">{editingId ? 'Editar activo' : 'Nuevo activo'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.nombreActivo}
                onChange={e => setForm(f => ({ ...f, nombreActivo: e.target.value }))}
                placeholder="Ej: Sala A, Dr. García"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.tipoActivo}
                onChange={e => setForm(f => ({ ...f, tipoActivo: e.target.value }))}
              >
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.estadoDisponibilidad}
                onChange={e => setForm(f => ({ ...f, estadoDisponibilidad: e.target.value }))}
              >
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Opcional"
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
      ) : activos.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">No hay activos registrados aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {activos.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.nombreActivo}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{a.tipoActivo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor[a.estadoDisponibilidad] || 'bg-gray-100'}`}>
                      {a.estadoDisponibilidad}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => iniciarEdicion(a)} className="text-blue-600 hover:underline text-xs">Editar</button>
                    <button onClick={() => eliminar(a.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
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

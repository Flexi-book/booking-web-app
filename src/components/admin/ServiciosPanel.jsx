import { useState } from 'react'
import { useCrudPanel } from '../../hooks/useCrudPanel'
import { serviciosApi } from '../../services/gestionService'
import PageHeader from '../ui/PageHeader'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import ErrorBanner from '../common/ErrorBanner'
import ConfirmDialog from '../ui/ConfirmDialog'

const emptyForm = { nombreServicio: '', descripcion: '', duracionMinutos: 30, precio: 0, estadoServicioId: 'activo' }

const mapItemToForm = (s) => ({
  nombreServicio:  s.nombreServicio,
  descripcion:     s.descripcion || '',
  duracionMinutos: s.duracionMinutos,
  precio:          s.precio,
  estadoServicioId: s.estadoServicioId,
})

export default function ServiciosPanel() {
  const { items: servicios, form, setForm, editingId, loading, error, showForm, setShowForm, iniciarEdicion, cancelar, guardar } =
    useCrudPanel(serviciosApi, emptyForm, mapItemToForm)

  const [confirmId, setConfirmId] = useState(null)

  const handleEliminar = async () => {
    await serviciosApi.eliminar(confirmId)
    setConfirmId(null)
    cancelar()
    window.location.reload()
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de Servicios"
        subtitle="Administra los servicios y precios disponibles."
        action={!showForm && (
          <Button onClick={() => setShowForm(true)}>
            + Nuevo Servicio
          </Button>
        )}
      />

      <ErrorBanner message={error} />

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input required className={inputCls} value={form.nombreServicio}
                  onChange={e => setForm(f => ({ ...f, nombreServicio: e.target.value }))}
                  placeholder="Ej: Masaje Deportivo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min) *</label>
                <input required type="number" min="5" className={inputCls} value={form.duracionMinutos}
                  onChange={e => setForm(f => ({ ...f, duracionMinutos: parseInt(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input type="number" min="0" step="0.01" className={inputCls} value={form.precio}
                  onChange={e => setForm(f => ({ ...f, precio: parseFloat(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select className={inputCls} value={form.estadoServicioId}
                  onChange={e => setForm(f => ({ ...f, estadoServicioId: e.target.value }))}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="pausado">Pausado</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea rows={3} className={inputCls} value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Describe el servicio..." />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">{editingId ? 'Actualizar' : 'Crear'}</Button>
              <Button variant="secondary" type="button" onClick={cancelar}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : servicios.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No hay servicios registrados aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Servicio</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Duración</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Precio</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Estado</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {servicios.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{s.nombreServicio}</td>
                  <td className="px-6 py-4 text-gray-500">{s.duracionMinutos} min</td>
                  <td className="px-6 py-4 text-gray-700 font-semibold">${Number(s.precio).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <Badge status={s.estadoServicioId} label={s.estadoServicioId} />
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => iniciarEdicion(s)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirmId(s.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="¿Eliminar servicio?"
        message="Esta acción no se puede deshacer."
        onConfirm={handleEliminar}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

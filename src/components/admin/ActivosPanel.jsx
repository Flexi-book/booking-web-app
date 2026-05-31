import { useState } from 'react'
import { useCrudPanel } from '../../hooks/useCrudPanel'
import { activosApi } from '../../services/gestionService'
import { assetTypeIcon } from '../../utils/statusColors'
import PageHeader from '../ui/PageHeader'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import ErrorBanner from '../common/ErrorBanner'
import ConfirmDialog from '../ui/ConfirmDialog'

const TIPOS  = ['Espacio', 'Personal', 'Equipo']
const ESTADOS = ['Disponible', 'No disponible', 'En mantenimiento']
const emptyForm = { nombre: '', descripcion: '', tipoActivoId: 'Espacio', estadoDisponibilidadId: 'Disponible' }

const mapItemToForm = (a) => ({
  nombre:                a.nombre,
  descripcion:           a.descripcion || '',
  tipoActivoId:          a.tipoActivoId,
  estadoDisponibilidadId: a.estadoDisponibilidadId,
})

export default function ActivosPanel() {
  const { items: activos, form, setForm, editingId, loading, error, showForm, setShowForm, iniciarEdicion, cancelar, guardar } =
    useCrudPanel(activosApi, emptyForm, mapItemToForm)

  const [confirmId, setConfirmId] = useState(null)

  const handleEliminar = async () => {
    await activosApi.eliminar(confirmId)
    setConfirmId(null)
    cancelar()
    window.location.reload() // refresh simple por ahora
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Activos"
        subtitle="Personal y espacios de trabajo disponibles."
        action={!showForm && (
          <Button onClick={() => setShowForm(true)}>
            + Añadir Activo
          </Button>
        )}
      />

      <ErrorBanner message={error} />

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Activo' : 'Nuevo Activo'}
          </h2>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input required className={inputCls} value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Sala Zen A1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select className={inputCls} value={form.tipoActivoId}
                  onChange={e => setForm(f => ({ ...f, tipoActivoId: e.target.value }))}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select className={inputCls} value={form.estadoDisponibilidadId}
                  onChange={e => setForm(f => ({ ...f, estadoDisponibilidadId: e.target.value }))}>
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input className={inputCls} value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Opcional" />
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
      ) : activos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No hay activos registrados aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Activo</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Tipo</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Estado</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activos.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{assetTypeIcon(a.tipoActivoId)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{a.nombre}</p>
                        {a.descripcion && <p className="text-xs text-gray-400">{a.descripcion}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 capitalize">{a.tipoActivoId}</td>
                  <td className="px-6 py-4">
                    <Badge status={a.estadoDisponibilidadId} label={a.estadoDisponibilidadId} />
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => iniciarEdicion(a)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirmId(a.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="¿Eliminar activo?"
        message="Esta acción no se puede deshacer."
        onConfirm={handleEliminar}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

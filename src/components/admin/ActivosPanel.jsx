import { useCrudPanel } from '../../hooks/useCrudPanel'
import { activosApi } from '../../services/gestionService'
import ErrorBanner from '../common/ErrorBanner'
import { assetStatusColor, assetTypeIcon } from '../../utils/statusColors'

const TIPOS = ['Espacio', 'Personal', 'Equipo']
const ESTADOS = ['Disponible', 'No disponible', 'En mantenimiento']
const emptyForm = { nombre: '', descripcion: '', tipoActivoId: 'Espacio', estadoDisponibilidadId: 'Disponible' }

const mapItemToForm = (a) => ({
  nombre: a.nombre,
  descripcion: a.descripcion || '',
  tipoActivoId: a.tipoActivoId,
  estadoDisponibilidadId: a.estadoDisponibilidadId,
})

export default function ActivosPanel() {
  const { items: activos, form, setForm, editingId, loading, error, showForm, setShowForm, iniciarEdicion, cancelar, guardar, eliminar } =
    useCrudPanel(activosApi, emptyForm, mapItemToForm)

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

      <ErrorBanner message={error} />

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
                      <span className="text-xl">{assetTypeIcon(a.tipoActivoId)}</span>
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${assetStatusColor(a.estadoDisponibilidadId)}`}>
                        {a.estadoDisponibilidadId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => iniciarEdicion(a)} className="text-blue-600 hover:text-blue-700 font-medium text-xs">
                      Editar
                    </button>
                    <button onClick={() => eliminar(a.id, '¿Eliminar este activo?')} className="text-red-600 hover:text-red-700 font-medium text-xs">
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

import { useEffect, useMemo, useState } from 'react'
import { activosApi, lookupsApi, serviciosApi } from '../../services/gestionService'

const emptyForm = { nombreServicio: '', descripcion: '', duracionMinutos: 30, precio: 0, estadoServicioId: 'activo' }

export default function ServiciosPanel() {
  const [servicios, setServicios] = useState([])
  const [activos, setActivos] = useState([])
  const [estadosServicio, setEstadosServicio] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [bloque, setBloque] = useState(emptyBloque)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBloqueIndex, setEditingBloqueIndex] = useState(null)

  useEffect(() => {
    cargar()
  }, [])

  const cuposBloqueActual = useMemo(
    () => calcularCupos(bloque.horaInicio, bloque.horaFin, Number(form.duracionMinutos || 0)),
    [bloque.horaInicio, bloque.horaFin, form.duracionMinutos],
  )

  async function cargar() {
    const empresaId = getUserCompanyId()
    if (!empresaId) {
      setError('No se encontró empresa asociada al usuario.')
      return
    }

    setLoading(true)
    try {
      const [serviciosData, activosData, estadosData] = await Promise.all([
        serviciosApi.listar(empresaId),
        activosApi.listar(empresaId),
        lookupsApi.estadosServicio(),
      ])

      setServicios(serviciosData)
      setActivos(activosData)
      setEstadosServicio(estadosData)

      if (!form.estadoServicioId) {
        const activo = estadosData.find((e) => e.nombre === 'activo')
        setForm((prev) => ({
          ...prev,
          estadoServicioId: activo?.id || estadosData[0]?.id || '',
        }))
      }
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
      estadoServicioId: s.estadoServicioId,
    })
    setEditingId(s.id)
    setShowForm(true)
    setError('')
  }

  function cancelar() {
    setForm({
      ...emptyForm,
      estadoServicioId: estadosServicio.find((e) => e.nombre === 'activo')?.id || estadosServicio[0]?.id || '',
    })
    setBloque(emptyBloque)
    setEditingId(null)
    setShowForm(false)
    setEditingBloqueIndex(null)
    setError('')
  }

  function agregarBloque() {
    try {
    if (!bloque.activoId) {
      setError('Selecciona un profesional/puesto para el bloque.')
      return
    }

    const tramos = generarTramos(bloque.horaInicio, bloque.horaFin, Number(form.duracionMinutos || 0))
    const cupos = tramos.length
    if (cupos <= 0) {
      setError('El bloque no alcanza para la duración del servicio.')
      return
    }

    const diasSeleccionados = (bloque.diasSemana || []).map(Number)
    if (diasSeleccionados.length === 0) {
      setError('Selecciona al menos un día.')
      return
    }

    const activoNombre = activos.find((a) => a.id === bloque.activoId)?.nombre || ''

    setForm((prev) => {
      const siguientes = [...prev.disponibilidades]

      if (editingBloqueIndex !== null) {
        const base = siguientes[editingBloqueIndex]
        if (!base) {
          throw new Error('No se encontró el bloque a editar.')
        }

        const diaSemana = Number(diasSeleccionados[0])
        if (!diaSemana) {
          throw new Error('Selecciona un día para editar el bloque.')
        }

        const hayCruce = siguientes.some((d, i) =>
          i !== editingBloqueIndex &&
          Number(d.diaSemana) === diaSemana &&
          d.activoId === bloque.activoId &&
          rangosSeSuperponen(d.horaInicio, d.horaFin, bloque.horaInicio, bloque.horaFin)
        )

        if (hayCruce) {
          throw new Error(`El horario se superpone en ${DIAS.find((d) => d.value === diaSemana)?.label}.`)
        }

        siguientes[editingBloqueIndex] = {
          ...base,
          ...bloque,
          diaSemana,
          diaNombre: DIAS.find((d) => d.value === diaSemana)?.label || '',
          activoNombre,
          cuposPorDia: cupos,
          tramos,
        }

        return {
          ...prev,
          disponibilidades: siguientes,
        }
      }

      for (const diaSemana of diasSeleccionados) {
        const baseIndex = siguientes.findIndex((d) =>
          Number(d.diaSemana) === diaSemana && d.activoId === bloque.activoId
        )

        if (baseIndex >= 0) {
          const otros = siguientes.filter((_, i) => i !== baseIndex)
          const hayCruce = otros.some((d) =>
            Number(d.diaSemana) === diaSemana &&
            d.activoId === bloque.activoId &&
            rangosSeSuperponen(d.horaInicio, d.horaFin, bloque.horaInicio, bloque.horaFin)
          )

          if (hayCruce) {
            throw new Error(`El horario se superpone en ${DIAS.find((d) => d.value === diaSemana)?.label}.`)
          }

          siguientes[baseIndex] = {
            ...siguientes[baseIndex],
            ...bloque,
            diaSemana,
            diaNombre: DIAS.find((d) => d.value === diaSemana)?.label || '',
            activoNombre,
            cuposPorDia: cupos,
            tramos,
          }
          continue
        }

        const hayCruce = siguientes.some((d) =>
          Number(d.diaSemana) === diaSemana &&
          d.activoId === bloque.activoId &&
          rangosSeSuperponen(d.horaInicio, d.horaFin, bloque.horaInicio, bloque.horaFin)
        )

        if (hayCruce) {
          throw new Error(`El horario se superpone en ${DIAS.find((d) => d.value === diaSemana)?.label}.`)
        }

        siguientes.push({
          ...bloque,
          diaSemana,
          diaNombre: DIAS.find((d) => d.value === diaSemana)?.label || '',
          activoNombre,
          cuposPorDia: cupos,
          tramos,
        })
      }

      return {
        ...prev,
        disponibilidades: siguientes,
      }
    })
    setError('')
    setEditingBloqueIndex(null)
    setBloque(emptyBloque)
    } catch (e) {
      setError(e.message || 'No se pudo agregar el bloque.')
    }
  }

  function editarBloque(index) {
    const d = form.disponibilidades[index]
    if (!d) return

    setBloque({
      activoId: d.activoId,
      diasSemana: [Number(d.diaSemana)],
      horaInicio: d.horaInicio,
      horaFin: d.horaFin,
    })
    setEditingBloqueIndex(index)
    setError('')
  }

  function quitarBloque(index) {
    setForm((prev) => ({
      ...prev,
      disponibilidades: prev.disponibilidades.filter((_, i) => i !== index),
    }))
    if (editingBloqueIndex === index) {
      setEditingBloqueIndex(null)
      setBloque(emptyBloque)
    }
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')

    const empresaId = getUserCompanyId()
    if (!empresaId) {
      setError('No se encontró empresa asociada al usuario.')
      return
    }

    if (!form.estadoServicioId) {
      setError('Selecciona un estado para el servicio.')
      return
    }

    try {
      const payload = {
        ...form,
        empresaId,
        duracionMinutos: Number(form.duracionMinutos),
        precio: Number(form.precio),
        disponibilidades: form.disponibilidades.map((d) => ({
          id: d.id,
          activoId: d.activoId,
          diaSemana: Number(d.diaSemana),
          horaInicio: d.horaInicio,
          horaFin: d.horaFin,
        })),
      }

      if (editingId) {
        await serviciosApi.actualizar(editingId, payload)
      } else {
        await serviciosApi.crear(payload)
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
          <p className="text-gray-600 mt-2">Administra duración, valor, profesionales y días/horarios disponibles.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
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
                <input required className="w-full h-12 border border-gray-300 rounded-lg px-4 text-sm" value={form.nombreServicio} onChange={e => setForm(f => ({ ...f, nombreServicio: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duración (minutos) *</label>
                <input required type="number" min="5" className="w-full h-12 border border-gray-300 rounded-lg px-4 text-sm" value={form.duracionMinutos} onChange={e => setForm(f => ({ ...f, duracionMinutos: parseInt(e.target.value || '0', 10) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
                <input type="number" min="0" step="0.01" className="w-full h-12 border border-gray-300 rounded-lg px-4 text-sm" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: parseFloat(e.target.value || '0') }))} />
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
                <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Disponibilidad del servicio</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <select
                  multiple
                  size={4}
                  className="h-12 md:h-auto border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  value={bloque.diasSemana.map(String)}
                  onChange={(e) => {
                    const dias = Array.from(e.target.selectedOptions).map((o) => Number(o.value))
                    setBloque((b) => ({ ...b, diasSemana: dias }))
                  }}
                >
                  {DIAS.map((dia) => <option key={dia.value} value={dia.value}>{dia.label}</option>)}
                </select>
                <input type="time" className="h-12 border border-gray-300 rounded-lg px-3 text-sm" value={bloque.horaInicio} onChange={(e) => setBloque((b) => ({ ...b, horaInicio: e.target.value }))} />
                <input type="time" className="h-12 border border-gray-300 rounded-lg px-3 text-sm" value={bloque.horaFin} onChange={(e) => setBloque((b) => ({ ...b, horaFin: e.target.value }))} />
                <select className="h-12 border border-gray-300 rounded-lg px-3 text-sm bg-white" value={bloque.activoId} onChange={(e) => setBloque((b) => ({ ...b, activoId: e.target.value }))}>
                  <option value="">Profesional/Puesto</option>
                  {activos.map((activo) => (
                    <option key={activo.id} value={activo.id}>{activo.nombre} ({activo.tipoActivoNombre || activo.tipoActivoId})</option>
                  ))}
                </select>
                <button type="button" onClick={agregarBloque} className="h-12 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">{editingBloqueIndex !== null ? 'Actualizar día' : 'Agregar bloque'}</button>
              </div>

              <p className="text-xs text-gray-500">
                Con duración {form.duracionMinutos || 0} min y separación fija de {BUFFER_MINUTOS} min, cada día seleccionado permite <span className="font-semibold">{cuposBloqueActual}</span> servicios.
              </p>
              {editingBloqueIndex !== null && (
                <p className="text-xs text-blue-600 font-semibold">Editando disponibilidad por día. Selecciona un solo día y presiona "Actualizar día".</p>
              )}

              {form.disponibilidades.length > 0 && (
                <div className="space-y-2">
                  {form.disponibilidades.map((d, idx) => (
                    <div key={`${d.activoId}-${d.diaSemana}-${d.horaInicio}-${idx}`} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold capitalize">{d.diaNombre || DIAS.find((x) => x.value === d.diaSemana)?.label}</span> {d.horaInicio} - {d.horaFin} · {d.activoNombre} · {d.cuposPorDia || calcularCupos(d.horaInicio, d.horaFin, Number(form.duracionMinutos || 0))} cupos
                        <br />
                        <span className="text-xs text-gray-500">{(() => { const lista = d.tramos || generarTramos(d.horaInicio, d.horaFin, Number(form.duracionMinutos || 0)); return `${lista.slice(0, 8).join(' · ')}${lista.length > 8 ? ` · +${lista.length - 8} más` : ''}` })()}</span>
                      </p>
                      <div className="flex items-center gap-3"><button type="button" onClick={() => editarBloque(idx)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Editar</button><button type="button" onClick={() => quitarBloque(idx)} className="text-xs font-semibold text-red-600 hover:text-red-700">Quitar</button></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition">{editingId ? 'Actualizar' : 'Crear'}</button>
              <button type="button" onClick={cancelar} className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition">Cancelar</button>
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
                <th className="px-6 py-4 text-left font-semibold text-gray-700">VALOR</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">DISPONIBILIDAD</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {servicios.map((s) => (
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
                      s.estadoServicioId === 'activo' ? 'bg-green-100 text-green-700' :
                      s.estadoServicioId === 'pausado' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {s.estadoServicioId}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => iniciarEdicion(s)} className="text-blue-600 hover:text-blue-700 font-medium text-xs">Editar</button>
                    <button onClick={() => eliminar(s.id)} className="text-red-600 hover:text-red-700 font-medium text-xs">Eliminar</button>
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

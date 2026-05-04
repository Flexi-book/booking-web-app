import { useState, useEffect } from 'react'
import { Bell, Mail, RefreshCw, CheckCircle, XCircle, Clock, Plus } from 'lucide-react'
import { notificacionesApi } from '../../services/notificacionesService'
import { Button } from '../ui/button'

const emptyForm = {
  reservaId: '',
  destinatarioEmail: '',
  mensaje: '',
  canal: 'EMAIL',
  tipoEvento: 'RESERVA_RECORDATORIO'
}

export default function NotificacionesPanel() {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const data = await notificacionesApi.listar()
      setNotificaciones(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('No se pudieron cargar las notificaciones. Verifica que el servicio de notificaciones esté activo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await notificacionesApi.crear(form)
      setForm(emptyForm)
      setShowForm(false)
      cargar()
    } catch (err) {
      setError('Error al crear la notificación.')
    } finally {
      setLoading(false)
    }
  }

  async function marcarEnviada(id) {
    try {
      await notificacionesApi.marcarEnviada(id)
      cargar()
    } catch (err) {
      setError('Error al actualizar estado.')
    }
  }

  async function marcarFallida(id) {
    try {
      await notificacionesApi.marcarFallida(id)
      cargar()
    } catch (err) {
      setError('Error al actualizar estado.')
    }
  }

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase()
    if (s === 'enviada' || s === 'sent') {
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
        <CheckCircle className="h-3 w-3" /> ENVIADA
      </span>
    }
    if (s === 'fallida' || s === 'failed') {
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
        <XCircle className="h-3 w-3" /> FALLIDA
      </span>
    }
    return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
      <Clock className="h-3 w-3" /> PENDIENTE
    </span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Centro de Notificaciones</h1>
          <p className="text-slate-500 mt-1 text-sm">Gestiona y monitorea los avisos enviados a tus clientes.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={cargar} 
            disabled={loading}
            className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Notificación
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3">
          <XCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Redactar Notificación Manual</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email del Destinatario</label>
                <input 
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                  value={form.destinatarioEmail}
                  onChange={e => setForm({...form, destinatarioEmail: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ID de Reserva (Opcional)</label>
                <input 
                  type="text"
                  placeholder="UUID de la reserva"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                  value={form.reservaId}
                  onChange={e => setForm({...form, reservaId: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mensaje</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Escribe el contenido del aviso..."
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                  value={form.mensaje}
                  onChange={e => setForm({...form, mensaje: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-8">
                {loading ? 'Enviando...' : 'Programar Envío'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Destinatario / Mensaje</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Evento / Canal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {notificaciones.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Bell className="h-10 w-10 text-slate-200" />
                      <p>No se encontraron notificaciones registradas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                notificaciones.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Mail className="h-3 w-3 text-slate-400" /> {n.destinatarioEmail}
                        </span>
                        <span className="text-xs text-slate-500 line-clamp-1">{n.mensaje}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{n.tipoEvento?.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{n.canal}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(n.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {n.estado?.toLowerCase() === 'pendiente' && (
                          <>
                            <button 
                              onClick={() => marcarEnviada(n.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Marcar como Enviada"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => marcarFallida(n.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Marcar como Fallida"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

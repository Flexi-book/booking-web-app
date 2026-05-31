import { useState, useEffect } from 'react'
import { notificacionesApi } from '../../services/gestionService'
import PageHeader from '../ui/PageHeader'
import Badge from '../ui/Badge'
import ErrorBanner from '../common/ErrorBanner'

const EVENT_LABELS = {
  CONFIRMACION_RESERVA: 'Confirmación',
  CANCELACION_RESERVA:  'Cancelación',
  RESERVA_RECORDATORIO: 'Recordatorio',
}

const STATUS_BADGE = {
  PENDIENTE: 'yellow',
  ENVIADA:   'green',
  FALLIDA:   'red',
}

export default function NotificacionesPanel() {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')

  useEffect(() => {
    setLoading(true)
    notificacionesApi.listar()
      .then(setNotificaciones)
      .catch(() => setError('Error al cargar notificaciones'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        subtitle="Historial de correos enviados a clientes y administradores."
      />

      <ErrorBanner message={error} />

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : notificaciones.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📬</p>
          <p className="text-gray-400 text-sm">No hay notificaciones registradas aún.</p>
          <p className="text-gray-300 text-xs mt-1">
            Los correos aparecen aquí al crear o cancelar reservas.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Destinatario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Canal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mensaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notificaciones.map(n => (
                <tr key={n.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-900 font-medium">{n.recipientEmail || n.destinatario || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      {EVENT_LABELS[n.eventType] ?? n.eventType ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{n.channel ?? n.canal ?? 'EMAIL'}</td>
                  <td className="px-6 py-4">
                    <Badge
                      color={STATUS_BADGE[n.status ?? n.estado] ?? 'gray'}
                      label={n.status ?? n.estado ?? '—'}
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap text-xs">
                    {n.fechaEnvio
                      ? new Date(n.fechaEnvio).toLocaleString('es-CL', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate text-xs">
                    {n.message ?? n.mensaje ?? '—'}
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

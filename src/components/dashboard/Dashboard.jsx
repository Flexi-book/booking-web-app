import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../auth/useAuth'
import { reservasApi, activosApi, serviciosApi } from '../../services/gestionService'
import Badge from '../ui/Badge'
import PageHeader from '../ui/PageHeader'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function StatCard({ label, value, sub, color = 'bg-blue-600', icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`${color} p-3 rounded-xl text-white text-2xl`}>{icon}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user, companyName } = useAuth()
  const [reservas, setReservas]   = useState([])
  const [activos, setActivos]     = useState([])
  const [servicios, setServicios] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([reservasApi.listar(), activosApi.listar(), serviciosApi.listar()])
      .then(([r, a, s]) => { setReservas(r); setActivos(a); setServicios(s) })
      .catch(() => setError('Error al cargar datos del dashboard'))
      .finally(() => setLoading(false))
  }, [])

  // ── KPIs ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    const pendientes  = reservas.filter(r => r.estado === 'pendiente').length
    const confirmadas = reservas.filter(r => r.estado === 'confirmada').length
    const canceladas  = reservas.filter(r => r.estado === 'cancelada').length
    const disponibles = activos.filter(a =>
      ['disponible', 'Disponible'].includes(a.estadoDisponibilidad ?? a.estadoDisponibilidadId)
    ).length
    const svcActivos  = servicios.filter(s => s.estadoServicioId === 'activo').length
    return { total: reservas.length, pendientes, confirmadas, canceladas, disponibles, svcActivos }
  }, [reservas, activos, servicios])

  // ── Próximas reservas ─────────────────────────────────
  const proximas = useMemo(() => {
    const ahora = new Date()
    return reservas
      .filter(r => r.fechaInicio && new Date(r.fechaInicio) > ahora && r.estado !== 'cancelada')
      .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
      .slice(0, 6)
  }, [reservas])

  // ── Mapa de servicios para mostrar nombre ─────────────
  const servicioById = useMemo(
    () => Object.fromEntries(servicios.map(s => [s.id, s])),
    [servicios]
  )

  // ── Gráfico — reservas por día de la semana ───────────
  const chartData = useMemo(() => {
    const conteo = Array(7).fill(0)
    reservas.forEach(r => {
      if (r.fechaInicio) conteo[new Date(r.fechaInicio).getDay()]++
    })
    return DIAS.map((day, i) => ({ day, reservas: conteo[i] }))
  }, [reservas])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Bienvenido${user?.name ? `, ${user.name}` : ''} · ${companyName ?? ''}`}
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total reservas"       value={kpis.total}       icon="📅" color="bg-blue-600"   sub="Historial completo" />
        <StatCard label="Confirmadas"          value={kpis.confirmadas}  icon="✅" color="bg-green-600"  sub="Listas para atender" />
        <StatCard label="Pendientes"           value={kpis.pendientes}   icon="⏳" color="bg-yellow-500" sub="Por confirmar" />
        <StatCard label="Canceladas"           value={kpis.canceladas}   icon="❌" color="bg-red-500"    sub="Este período" />
        <StatCard label="Activos disponibles"  value={kpis.disponibles}  icon="🏷️" color="bg-slate-600"  sub={`de ${activos.length} totales`} />
        <StatCard label="Servicios activos"    value={kpis.svcActivos}   icon="⚙️" color="bg-indigo-600" sub={`de ${servicios.length} totales`} />
      </div>

      {/* Gráfico + Próximas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfico de reservas */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Reservas por día de la semana</h2>
          <p className="text-xs text-gray-400 mb-4">Distribución histórica de reservas</p>
          {reservas.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
              Sin datos suficientes para el gráfico
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="reservas" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Resumen rápido */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-900">Resumen</h2>
          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Tasa confirmación</span>
              <span className="font-semibold text-green-600">
                {kpis.total > 0 ? Math.round((kpis.confirmadas / kpis.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Tasa cancelación</span>
              <span className="font-semibold text-red-500">
                {kpis.total > 0 ? Math.round((kpis.canceladas / kpis.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Activos totales</span>
              <span className="font-semibold text-gray-700">{activos.length}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Servicios totales</span>
              <span className="font-semibold text-gray-700">{servicios.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas reservas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Próximas Reservas</h2>
        {proximas.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No hay reservas próximas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Servicio</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha / Hora</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {proximas.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{r.clienteNombre || '—'}</p>
                      <p className="text-xs text-gray-400">{r.clienteCorreo || ''}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {servicioById[r.servicioId]?.nombreServicio || '—'}
                    </td>
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                      {r.fechaInicio
                        ? new Date(r.fechaInicio).toLocaleString('es-CL', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="py-3">
                      <Badge status={r.estado || 'pendiente'} label={r.estado || 'Pendiente'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

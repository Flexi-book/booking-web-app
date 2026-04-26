import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { reservasApi } from '../../services/gestionService'

const occupationData = [
  { day: 'Lun', value: 65 },
  { day: 'Mar', value: 59 },
  { day: 'Mié', value: 80 },
  { day: 'Jue', value: 81 },
  { day: 'Vie', value: 56 },
  { day: 'Sab', value: 85 },
  { day: 'Dom', value: 73 },
]

const recentActivityMock = [
  {
    id: 1,
    type: 'reserva',
    message: 'Nueva reserva confirmada',
    detail: 'Lucia Sánchez - Masaje Relajante',
    timestamp: 'Hace 5 minutos',
    color: 'blue',
  },
  {
    id: 2,
    type: 'cancelacion',
    message: 'Cita cancelada',
    detail: 'María López - Meditación Express',
    timestamp: 'Hace 27 minutos',
    color: 'red',
  },
  {
    id: 3,
    type: 'pago',
    message: 'Pago recibido',
    detail: 'Transacción #0021 - $45.00',
    timestamp: 'Hace 2 horas',
    color: 'green',
  },
  {
    id: 4,
    type: 'recordatorio',
    message: 'Recordatorio enviado',
    detail: 'SMS enviado a 12 clientes de mañana',
    timestamp: 'Hace 2 horas',
    color: 'amber',
  },
]

const upcomingReservations = [
  {
    id: 1,
    client: 'Lucia Sánchez',
    service: 'Masaje Relajante (60min)',
    time: 'Hoy, 16:30',
    status: 'Confirmada',
    statusColor: 'bg-green-100 text-green-800',
  },
  {
    id: 2,
    client: 'Roberto Pérez',
    service: 'Limpieza Facial Profunda',
    time: 'Hoy, 18:00',
    status: 'En Curso',
    statusColor: 'bg-blue-100 text-blue-800',
  },
  {
    id: 3,
    client: 'Ana Martínez',
    service: 'Manicura Permanente',
    time: 'Mañana, 10:00',
    status: 'Pendiente',
    statusColor: 'bg-yellow-100 text-yellow-800',
  },
]

export default function Dashboard() {
  const [stats, setStats] = useState({
    reservasHoy: 42,
    ingresos: 2450,
    cancelaciones: 3,
    pendientes: 1250,
  })
  const [reservas, setReservas] = useState([])

  useEffect(() => {
    cargarReservas()
  }, [])

  async function cargarReservas() {
    try {
      const data = await reservasApi.listar()
      setReservas(data.slice(0, 3))
    } catch (err) {
      console.error('Error cargando reservas:', err)
    }
  }

  const StatCard = ({ label, value, trend, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className={`text-xs mt-2 ${trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  )

  const ActivityIcon = ({ type }) => {
    switch (type) {
      case 'reserva':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />
      case 'cancelacion':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      case 'pago':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'recordatorio':
        return <div className="w-2 h-2 bg-amber-500 rounded-full" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenido de nuevo, aquí tienes el resumen de hoy.</p>
        </div>
        <button className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <span>+</span> Nueva Reserva
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Reservas del día"
          value="42"
          trend="↑ 12% vs ayer"
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5H4v8a2 2 0 002 2h12a2 2 0 002-2V7h-2v1a1 1 0 11-2 0V7H9v1a1 1 0 11-2 0V7H6v1a1 1 0 11-2 0V7z"></path>
            </svg>
          )}
          color="bg-blue-600"
        />
        <StatCard
          label="Ingresos"
          value="$2,450"
          trend="↑ 8% vs sem. pasada"
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.16 5.314l4.897-4.796A1 1 0 0115 4.03V14a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h10.16z"></path>
            </svg>
          )}
          color="bg-green-600"
        />
        <StatCard
          label="Cancelaciones"
          value="3"
          trend="↓ 2% vs ayer"
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          )}
          color="bg-red-600"
        />
        <StatCard
          label="Reservas Pendientes"
          value="1,250"
          trend="↑ 15% vs mês ant."
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
            </svg>
          )}
          color="bg-amber-600"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupation Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Ocupación Semanal</h2>
          <p className="text-gray-600 text-sm mb-4">Porcentaje de capacidad ocupada por día</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#0674f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            {recentActivityMock.map((activity) => (
              <div key={activity.id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{activity.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.detail}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 block">
              Ver todo el historial →
            </a>
          </div>
        </div>
      </div>

      {/* Upcoming Reservations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Próximas Reservas</h2>
          </div>
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Ver Calendario →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">CLIENTE</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">SERVICIO</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">FECHA / HORA</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">ESTADO</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {upcomingReservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{res.client}</td>
                  <td className="px-6 py-4 text-gray-600">{res.service}</td>
                  <td className="px-6 py-4 text-gray-600">{res.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${res.statusColor}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

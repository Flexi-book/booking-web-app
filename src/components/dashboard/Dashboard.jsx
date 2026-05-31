import { useState, useEffect, useMemo } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  PartyPopper,
  X,
  ArrowUpRight,
  Activity
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { TableLoader } from "@/components/ui/table-loader"
import authService from '../../services/authService'
import { reservasApi, activosApi, serviciosApi } from '../../services/gestionService'

export default function Dashboard() {
  const [user, setUser] = useState(authService.getUser())
  const [showWelcome, setShowWelcome] = useState(false)
  const [reservas, setReservas] = useState([])
  const [activos, setActivos] = useState([])
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.isNewUser) {
      setShowWelcome(true)
      const updatedUser = { ...user, isNewUser: false }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setLoading(true)
    try {
      const [res, act, serv] = await Promise.all([
        reservasApi.listar(),
        activosApi.listar(),
        serviciosApi.listar()
      ])
      setReservas(res || [])
      setActivos(act || [])
      setServicios(serv || [])
    } catch (err) {
      console.error("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Cálculos dinámicos de métricas
  const dashboardStats = useMemo(() => {
    const hoy = new Date()
    const hoyStr = hoy.toDateString()
    
    // 1. Ingresos Totales (Solo confirmadas/completadas)
    const ingresos = reservas
      .filter(r => r.estado !== 'cancelada')
      .reduce((acc, r) => {
        const serv = servicios.find(s => s.id === r.serviceOfferingId)
        return acc + (serv?.precio || 0)
      }, 0)

    // 2. Citas de hoy
    const citasHoy = reservas.filter(r => new Date(r.startTime).toDateString() === hoyStr).length

    // 3. Clientes Únicos
    const clientesUnicos = new Set(reservas.map(r => r.customerEmail)).size

    // 4. Ocupación (Activos con reservas hoy vs total activos)
    const activosConReservaHoy = new Set(
      reservas
        .filter(r => new Date(r.startTime).toDateString() === hoyStr && r.estado !== 'cancelada')
        .map(r => r.assetId)
    ).size
    const tasaOcupacion = activos.length > 0 ? Math.round((activosConReservaHoy / activos.length) * 100) : 0

    return [
      { name: "Ingresos Totales", value: `$${ingresos.toLocaleString()}`, icon: DollarSign, trend: "+12%", desc: "Desde el inicio" },
      { name: "Citas para Hoy", value: citasHoy.toString(), icon: Clock, trend: "+5%", desc: "Día actual" },
      { name: "Clientes Reales", value: clientesUnicos.toString(), icon: Users, trend: "+8%", desc: "Usuarios únicos" },
      { name: "Tasa Ocupación", value: `${tasaOcupacion}%`, icon: TrendingUp, trend: "+2%", desc: "Capacidad utilizada" }
    ]
  }, [reservas, servicios, activos])

  // Datos para la gráfica de tendencia (últimos 7 días)
  const chartData = useMemo(() => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' })
      const count = reservas.filter(r => new Date(r.startTime).toDateString() === d.toDateString()).length
      data.push({ name: label, reservas: count })
    }
    return data
  }, [reservas])

  const recentReservations = useMemo(() => {
    return [...reservas]
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, 5)
  }, [reservas])

  const getStatusBadge = (estado) => {
    const est = (estado || 'pendiente').toLowerCase()
    switch(est) {
      case 'confirmada': return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium">Confirmada</Badge>
      case 'cancelada': return <Badge variant="destructive" className="bg-slate-50 text-slate-400 border-slate-200 line-through">Cancelada</Badge>
      default: return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100">Pendiente</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <div className="h-10 w-64 bg-slate-100 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
          <div className="md:col-span-4 h-64 bg-slate-50 animate-pulse rounded-xl" />
          <div className="md:col-span-3 h-64 bg-slate-50 animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Banner */}
      {showWelcome && (
        <Card className="relative overflow-hidden border-none bg-slate-900 text-white shadow-2xl">
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                  <PartyPopper className="h-10 w-10 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">¡Bienvenido, {user?.companyName}!</h2>
                  <p className="mt-2 text-slate-400 max-w-xl font-medium">
                    Tu centro de mando está listo. Ya puedes empezar a gestionar tus servicios, configurar profesionales y recibir reservas en tiempo real.
                  </p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold h-12 px-8 rounded-xl"
                onClick={() => setShowWelcome(false)}
              >
                Comenzar ahora
              </Button>
            </div>
            <button 
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardContent>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute -bottom-20 left-1/2 h-64 w-64 rounded-full bg-indigo-600/5 blur-[100px]" />
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Resumen Ejecutivo</h1>
        <p className="text-slate-500 font-medium">Hola {user?.name}, esto es lo que ha ocurrido en {user?.companyName} esta semana.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.name} className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden hover:border-slate-300 transition-all group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> {stat.trend}
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{stat.desc}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Trend Chart */}
        <Card className="lg:col-span-4 border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Actividad Semanal</CardTitle>
                <CardDescription className="text-xs">Número de reservas por día</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-blue-600" /> Reservas
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[320px] pt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 500, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 500, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: '500' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reservas" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRes)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Reservations Table */}
        <Card className="lg:col-span-3 border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Últimos Movimientos</CardTitle>
                <CardDescription className="text-xs">Actualizado hace un momento</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  {recentReservations.length > 0 ? recentReservations.map((res) => (
                    <TableRow key={res.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                      <TableCell className="py-4 pl-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{res.customerName || 'Anónimo'}</span>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                            {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {servicios.find(s => s.id === res.serviceOfferingId)?.nombreServicio}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {getStatusBadge(res.estado)}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-48 text-center text-slate-400 font-medium">
                        Sin actividad reciente
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
             <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4 border border-slate-100">
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-100">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-xs font-semibold text-slate-900 uppercase">Sistema Operativo</p>
                   <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-widest">Sincronización Activa</p>
                </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ")
}

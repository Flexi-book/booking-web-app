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
import OnboardingWizard, { useOnboarding } from '../admin/OnboardingWizard'
import { useAuth } from '../../auth/useAuth'

function toSchemaDayOfWeek(date) {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

function getServicePrice(service) {
  return Number(service?.precio || 0)
}

function isReservationActive(reservation) {
  return String(reservation?.estado || '').toLowerCase() !== 'cancelada'
}

export default function Dashboard() {
  const { companyId } = useAuth()
  const [user, setUser]           = useState(authService.getUser())
  const [showWelcome, setShowWelcome] = useState(false)
  const [reservas, setReservas]   = useState([])
  const [activos, setActivos]     = useState([])
  const [servicios, setServicios] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const { isDone } = useOnboarding()

  useEffect(() => {
    if (user?.isNewUser) {
      setShowWelcome(true)
      const updatedUser = { ...user, isNewUser: false }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
    // Mostrar onboarding si es la primera vez
    if (!isDone()) {
      setTimeout(() => setShowOnboarding(true), 600)
    }
    if (companyId) {
      cargarDatos()
    }
  }, [companyId])

  async function cargarDatos() {
    setLoading(true)
    try {
      const options = { companyId }
      const [res, act, serv] = await Promise.all([
        reservasApi.listar(options),
        activosApi.listar(options),
        serviciosApi.listar(options)
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
    const ahora = new Date()
    const hoyStr = ahora.toDateString()
    const diaSemanaHoy = toSchemaDayOfWeek(ahora)
    
    // 1. Ingresos Totales: reservas no canceladas ya ocurridas
    const ingresos = reservas
      .filter((reservation) => {
        if (!isReservationActive(reservation)) return false
        const startTime = new Date(reservation.startTime)
        return !Number.isNaN(startTime.getTime()) && startTime <= ahora
      })
      .reduce((acc, r) => {
        const serv = servicios.find(s => s.id === r.serviceOfferingId)
        return acc + getServicePrice(serv)
      }, 0)

    // 2. Citas de hoy
    const citasHoy = reservas.filter((reservation) => {
      const startTime = new Date(reservation.startTime)
      return !Number.isNaN(startTime.getTime()) && startTime.toDateString() === hoyStr
    }).length

    // 3. Clientes Únicos
    const clientesUnicos = new Set(reservas.map(r => r.customerEmail)).size

    // 4. Ocupación diaria: reservas activas de hoy / cupos configurados para hoy
    const reservasActivasHoy = reservas.filter((reservation) => {
      const startTime = new Date(reservation.startTime)
      return (
        !Number.isNaN(startTime.getTime()) &&
        startTime.toDateString() === hoyStr &&
        isReservationActive(reservation)
      )
    }).length

    const cuposHoy = servicios.reduce((acc, service) => {
      const disponibilidades = Array.isArray(service?.disponibilidades) ? service.disponibilidades : []
      const cuposServicioHoy = disponibilidades
        .filter((availability) => Number(availability?.diaSemana ?? availability?.dia_semana) === diaSemanaHoy)
        .reduce((serviceAcc, availability) => serviceAcc + Number(availability?.cuposPorDia || 0), 0)

      return acc + cuposServicioHoy
    }, 0)

    const tasaOcupacion = cuposHoy > 0
      ? Math.round((reservasActivasHoy / cuposHoy) * 100)
      : 0

    const ingresosDesc = ingresos > 0 ? 'Reservas ya realizadas' : 'Sin reservas realizadas'
    const ocupacionDesc = cuposHoy > 0
      ? `${reservasActivasHoy}/${cuposHoy} cupos hoy`
      : 'Sin cupos hoy'

    return [
      { name: "Ingresos Totales", value: `$${ingresos.toLocaleString()}`, icon: DollarSign, trend: "+12%", desc: ingresosDesc },
      { name: "Citas para Hoy", value: citasHoy.toString(), icon: Clock, trend: "+5%", desc: "Día actual" },
      { name: "Clientes Reales", value: clientesUnicos.toString(), icon: Users, trend: "+8%", desc: "Usuarios únicos" },
      { name: "Tasa Ocupación", value: `${tasaOcupacion}%`, icon: TrendingUp, trend: "+2%", desc: ocupacionDesc }
    ]
  }, [reservas, servicios])

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
      case 'confirmada':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">Confirmada</Badge>
      case 'cancelada':
        return <Badge variant="destructive" className="bg-slate-100 text-slate-500 border-slate-200 line-through dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">Cancelada</Badge>
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">Pendiente</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <div className="h-10 w-64 bg-slate-100 animate-pulse rounded-lg dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-xl dark:bg-slate-900" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
          <div className="md:col-span-4 h-64 bg-slate-50 animate-pulse rounded-xl dark:bg-slate-900" />
          <div className="md:col-span-3 h-64 bg-slate-50 animate-pulse rounded-xl dark:bg-slate-900" />
        </div>
      </div>
    )
  }

  return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Onboarding wizard */}
      {showOnboarding && (
        <OnboardingWizard onClose={() => setShowOnboarding(false)} />
      )}

      {/* Welcome Banner */}
      {showWelcome && (
        <Card className="relative overflow-hidden border-none bg-slate-900 text-white shadow-2xl dark:bg-slate-900">
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
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Resumen Ejecutivo</h1>
        <p className="text-slate-500 font-medium dark:text-slate-400">Hola {user?.name}, esto es lo que ha ocurrido en {user?.companyName} esta semana.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.name} className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden hover:border-slate-300 transition-all group dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-widest dark:text-slate-500">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors dark:text-slate-500 dark:group-hover:text-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-950 dark:text-slate-100">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md dark:bg-emerald-500/10 dark:text-emerald-300">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> {stat.trend}
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider dark:text-slate-500">{stat.desc}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Trend Chart */}
        <Card className="lg:col-span-4 border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold dark:text-slate-100">Actividad Semanal</CardTitle>
                <CardDescription className="text-xs dark:text-slate-400">Número de reservas por día</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest dark:text-slate-500">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', boxShadow: '0 10px 25px -10px rgb(0 0 0 / 0.45)', fontSize: '12px', fontWeight: '500' }}
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
        <Card className="lg:col-span-3 border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden flex flex-col dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold dark:text-slate-100">Últimos Movimientos</CardTitle>
                <CardDescription className="text-xs dark:text-slate-400">Actualizado hace un momento</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10">
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  {recentReservations.length > 0 ? recentReservations.map((res) => (
                    <TableRow key={res.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/30">
                      <TableCell className="py-4 pl-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{res.customerName || 'Anónimo'}</span>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter dark:text-slate-500">
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
                      <TableCell colSpan={2} className="h-48 text-center text-slate-400 font-medium dark:text-slate-500">
                        Sin actividad reciente
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
             <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-700">
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-100 dark:shadow-emerald-950/40">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-xs font-semibold text-slate-900 uppercase dark:text-slate-100">Sistema Operativo</p>
                   <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-widest dark:text-emerald-300">Sincronización Activa</p>
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

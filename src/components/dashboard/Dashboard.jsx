import { useState, useEffect } from "react"
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
  X
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card.jsx"
import { Button } from "@/components/ui/button.jsx"
import { Badge } from "@/components/ui/badge.jsx"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table.jsx"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs.jsx"
import authService from '../../services/authService'

const stats = [
  {
    name: "Total Reservas",
    value: "154",
    change: "+12.5%",
    trend: "up",
    icon: CalendarIcon,
    description: "Este mes"
  },
  {
    name: "Ventas Totales",
    value: "$2,450",
    change: "+18.2%",
    trend: "up",
    icon: DollarSign,
    description: "Últimos 30 días"
  },
  {
    name: "Nuevos Clientes",
    value: "28",
    change: "-4.3%",
    trend: "down",
    icon: Users,
    description: "Vs mes anterior"
  },
  {
    name: "Tasa Ocupación",
    value: "82%",
    change: "+5.1%",
    trend: "up",
    icon: TrendingUp,
    description: "Promedio semanal"
  }
]

const recentReservations = [
  {
    id: "RES-001",
    client: "Juan Perez",
    service: "Masaje Relajante",
    date: "Hoy, 14:30",
    status: "Confirmada",
    amount: "$45"
  },
  {
    id: "RES-002",
    client: "Maria Garcia",
    service: "Tratamiento Facial",
    date: "Hoy, 16:00",
    status: "Pendiente",
    amount: "$60"
  },
  {
    id: "RES-003",
    client: "Carlos Ruiz",
    service: "Yoga Sesión",
    date: "Mañana, 09:00",
    status: "Cancelada",
    amount: "$15"
  },
  {
    id: "RES-004",
    client: "Ana Lopez",
    service: "Manicura Premium",
    date: "Mañana, 11:30",
    status: "Confirmada",
    amount: "$25"
  }
]

export default function Dashboard() {
  const [user, setUser] = useState(authService.getUser())
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (user?.isNewUser) {
      setShowWelcome(true)
      // Limpiar el flag después de mostrarlo una vez
      const updatedUser = { ...user, isNewUser: false }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }, [user])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* New User Welcome Banner */}
      {showWelcome && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-200">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <PartyPopper className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">¡Bienvenido a Flexibook, {user?.companyName || 'tu negocio'}!</h2>
                <p className="mt-1 text-blue-100 max-w-2xl">
                  Estamos muy felices de que hayas elegido nuestra plataforma. Tu cuenta de administrador está lista para que empieces a gestionar tus servicios y clientes.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => setShowWelcome(false)}
              >
                Comenzar ahora
              </Button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 left-1/2 h-24 w-24 rounded-full bg-white/5 blur-xl" />
          <button 
            onClick={() => setShowWelcome(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Panel de {user?.companyName || 'Control'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Hola {user?.name || 'Administrador'}, aquí tienes un resumen de lo que está pasando hoy.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                )}>
                  {stat.change}
                </span>
                <span className="text-xs text-slate-400 ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        {/* Main Chart/Table Area */}
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Reservas Recientes</CardTitle>
                <CardDescription>Tienes 4 reservas programadas para las próximas 24 horas.</CardDescription>
              </div>
              <Button variant="outline" size="sm">Ver todas</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell>
                      <div className="font-medium">{res.client}</div>
                      <div className="text-xs text-slate-500">{res.date}</div>
                    </TableCell>
                    <TableCell>{res.service}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          res.status === "Confirmada" ? "success" : 
                          res.status === "Pendiente" ? "warning" : 
                          "destructive"
                        }
                      >
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{res.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Side Panels */}
        <div className="lg:col-span-3 space-y-8">
          {/* Active Assets Status */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Estado de Activos</CardTitle>
              <CardDescription>Uso de recursos en tiempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Sala de Masajes 1</span>
                </div>
                <Badge variant="success">Libre</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Box Tratamiento 2</span>
                </div>
                <Badge className="bg-blue-500 text-white">En uso</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sala de Yoga</span>
                </div>
                <Badge variant="secondary">Cerrada</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips/Help */}
          <Card className="bg-blue-600 text-white border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <CardTitle className="text-lg">Consejo de hoy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-100">
                "Los clientes que reservan con más de 3 días de antelación tienen un 40% menos de probabilidad de cancelar. ¡Ofrece incentivos por reserva anticipada!"
              </p>
              <Button variant="secondary" size="sm" className="mt-4 w-full bg-white text-blue-600 hover:bg-blue-50">
                Aprender más
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ")
}

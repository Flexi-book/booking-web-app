import { useState, useEffect, useMemo } from 'react'
import { 
  Calendar as CalendarIcon, Search, Filter, MoreHorizontal, 
  Clock, User, Mail, Phone, CalendarClock,
  Trash2, X, Plus, CheckCircle2, LayoutGrid, List as ListIcon,
  ChevronLeft, ChevronRight, Info, Eye, PhoneCall, History,
  ExternalLink, ArrowUpRight, Loader2
} from 'lucide-react'
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { TableLoader } from "@/components/ui/table-loader"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { reservasApi, activosApi, serviciosApi } from '../../services/gestionService'
import { useAuth } from '../../auth/useAuth'

import ReservationDialog from './ReservationDialog'

export default function ReservasPanel() {
  const { companyId } = useAuth()
  const [reservas, setReservas] = useState([])
  const [activos, setActivos] = useState([])
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('list')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (!companyId) return
    cargarTodo()
  }, [companyId])

  async function cargarTodo(force = false) {
    setLoading(true)
    setCatalogLoading(true)
    setError('')
    try {
      const options = { companyId, force }
      const reservasPromise = reservasApi.listar(options)
      const catalogPromise = Promise.allSettled([
        activosApi.listar(options),
        serviciosApi.listar(options),
      ])

      const res = await reservasPromise
      setReservas(res || [])

      const [actResult, servResult] = await catalogPromise
      if (actResult.status === 'fulfilled') setActivos(actResult.value || [])
      if (servResult.status === 'fulfilled') setServicios(servResult.value || [])
    } catch (err) {
      setError('Error al sincronizar datos de reservas')
    } finally {
      setLoading(false)
      setCatalogLoading(false)
    }
  }

  const handleSave = async (payload) => {
    setError('')
    setSuccess('')
    try {
      await reservasApi.crear(payload)
      setSuccess('Reserva confirmada con éxito')
      cargarTodo(true)
    } catch (err) {
      throw new Error(err.response?.data?.message || 'No hay disponibilidad en ese horario.')
    }
  }

  async function cancelarReserva(id) {
    if (actionLoading) return
    if (!window.confirm("¿Estás seguro de anular esta reserva? El registro se mantendrá como 'Cancelado'.")) return
    setError('')
    setSuccess('')
    setActionLoading({ id, action: 'cancelada' })
    try {
      await reservasApi.cancelar(id)
      actualizarReservaLocal(id, 'cancelada')
      setSuccess('Reserva anulada correctamente')
      await cargarTodo(true)
    } catch {
      setError('No se pudo cancelar la reserva')
    } finally {
      setActionLoading(null)
    }
  }

  async function actualizarEstadoReserva(id, estado, mensajeExito) {
    if (actionLoading) return
    setError('')
    setSuccess('')
    setActionLoading({ id, action: estado })
    try {
      await reservasApi.actualizarEstado(id, estado)
      actualizarReservaLocal(id, estado)
      setSuccess(mensajeExito)
      setDetailsOpen(false)
      await cargarTodo(true)
    } catch {
      setError('No se pudo actualizar el estado de la reserva')
    } finally {
      setActionLoading(null)
    }
  }

  function actualizarReservaLocal(id, estado) {
    setReservas((prev) => prev.map((reserva) =>
      reserva.id === id
        ? { ...reserva, estado, status: estado }
        : reserva
    ))
    setSelectedReserva((prev) => (
      prev?.id === id
        ? { ...prev, estado, status: estado }
        : prev
    ))
  }

  function isActionLoading(id, action = null) {
    if (!actionLoading || actionLoading.id !== id) return false
    return action ? actionLoading.action === action : true
  }

  const verDetalles = (reserva) => {
    setSelectedReserva(reserva)
    setDetailsOpen(true)
  }

  const getStatusBadge = (estado) => {
    const est = (estado || 'pendiente').toLowerCase()
    switch(est) {
      case 'confirmada':
        return <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200 font-medium px-2.5 py-0.5 rounded-full dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">Confirmada</Badge>
      case 'cancelada':
        return <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 font-medium px-2.5 py-0.5 rounded-full line-through dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">Cancelada</Badge>
      case 'completada':
        return <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200 font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30">Completada</Badge>
      default:
        return <Badge variant="outline" className="bg-amber-50/50 text-amber-700 border-amber-200 font-medium px-2.5 py-0.5 rounded-full dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">Pendiente</Badge>
    }
  }

  const filteredReservas = useMemo(() => {
    return reservas.filter(r => {
      const name = (r.customerName || 'Cliente Anónimo').toLowerCase()
      const email = (r.customerEmail || '').toLowerCase()
      const search = searchTerm.toLowerCase()
      return name.includes(search) || email.includes(search)
    })
  }, [reservas, searchTerm])

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startDay = new Date(year, month, 1).getDay()
    
    const days = []
    const prevMonthDaysTotal = new Date(year, month, 0).getDate()
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDaysTotal - i,
        currentMonth: false,
        date: new Date(year, month - 1, prevMonthDaysTotal - i),
      })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        currentMonth: false,
        date: new Date(year, month + 1, i),
      })
    }
    return days
  }, [currentDate])

  const getReservasForDate = (date) => {
    if (!date) return []
    return filteredReservas.filter(r => {
      const rDate = new Date(r.startTime)
      return rDate.getDate() === date.getDate() &&
             rDate.getMonth() === date.getMonth() &&
             rDate.getFullYear() === date.getFullYear()
    })
  }

  const stats = useMemo(() => {
    const hoy = new Date().toDateString()
    return {
      totalHoy: reservas.filter(r => new Date(r.startTime).toDateString() === hoy).length,
      confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
      pendientes: reservas.filter(r => !r.estado || r.estado === 'pendiente').length
    }
  }, [reservas])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {(loading && reservas.length === 0) && (
        <LoadingScreen
          visible
          title="Cargando reservas..."
          description="Estamos sincronizando citas, activos y servicios."
        />
      )}
      
      {/* HEADER SECTION - SHADCN STYLE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Gestión de Reservas</h1>
          <p className="text-sm text-muted-foreground font-medium dark:text-slate-400">Administra y monitorea las citas de tu negocio.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all active:scale-95 px-4 h-9 rounded-md text-sm font-medium gap-2"
          >
            <Plus className="w-4 h-4" /> Nueva Reserva
          </Button>
        </div>
      </div>

      {/* SUMMARY STATS - MINIMALIST */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Citas para Hoy', value: stats.totalHoy, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Confirmadas', value: stats.confirmadas, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { label: 'Pendientes', value: stats.pendientes, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50' }
        ].map((stat, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden group hover:border-slate-300 transition-colors dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-700 dark:shadow-black/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 dark:bg-slate-900`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight dark:text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-950 dark:text-slate-100">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={view} onValueChange={setView} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <TabsList className="bg-slate-100 p-1 rounded-lg border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800">
            <TabsTrigger value="list" className="rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-100">
              <ListIcon className="w-3.5 h-3.5 mr-2" /> Listado
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-100">
              <CalendarIcon className="w-3.5 h-3.5 mr-2" /> Calendario
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground dark:text-slate-500" />
            <Input 
              placeholder="Filtrar por cliente..." 
              className="pl-8 h-9 text-xs border-slate-200 bg-white rounded-md focus:ring-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="list" className="mt-0 focus-visible:outline-none animate-in fade-in duration-300">
          <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden dark:bg-slate-950 dark:border-slate-800 dark:shadow-black/20">
            <CardContent className="p-0">
              {loading && reservas.length === 0 ? (
                <div className="p-12"><TableLoader rows={5} columns={6} /></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50 border-b border-slate-200 dark:bg-slate-900/70 dark:border-slate-800">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-slate-900 py-3 px-4 sm:px-6 dark:text-slate-200">Cliente</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold text-slate-900 dark:text-slate-200">Servicio</TableHead>
                        <TableHead className="hidden lg:table-cell font-semibold text-slate-900 dark:text-slate-200">Recurso</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Fecha</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Estado</TableHead>
                        <TableHead className="text-right font-semibold text-slate-900 px-4 sm:px-6 dark:text-slate-200">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservas.length > 0 ? (
                        filteredReservas.map((r) => (
                          <TableRow key={r.id} className="hover:bg-slate-50/30 transition-colors border-slate-100 dark:border-slate-800 dark:hover:bg-slate-900/60">
                            <TableCell className="py-4 px-4 sm:px-6">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-semibold text-xs border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                  {(r.customerName || 'A').charAt(0)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium text-slate-950 text-sm leading-none truncate dark:text-slate-100">{r.customerName || 'Cliente Anónimo'}</span>
                                  <span className="text-[11px] text-muted-foreground mt-1 truncate hidden sm:block dark:text-slate-400">{r.customerEmail || 'Sin correo'}</span>
                                  {/* En mobile mostramos el servicio bajo el nombre */}
                                  <span className="sm:hidden text-[11px] text-slate-500 mt-0.5 truncate dark:text-slate-400">
                                    {servicios.find(s => s.id === r.serviceOfferingId)?.nombreServicio || 'Cargando servicio...'}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm font-medium text-slate-700 max-w-[160px] truncate dark:text-slate-200">
                              {servicios.find(s => s.id === r.serviceOfferingId)?.nombreServicio || (catalogLoading ? 'Cargando...' : 'Sin servicio')}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <span className="text-xs font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50 truncate max-w-[120px] block dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700">
                                {activos.find(a => a.id === r.assetId)?.nombreActivo || (catalogLoading ? 'Cargando...' : 'Sin recurso')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 whitespace-nowrap dark:text-slate-100">
                                  {new Date(r.startTime).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                </span>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 dark:text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  {new Date(r.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(r.estado)}</TableCell>
                            <TableCell className="text-right px-4 sm:px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-md border border-transparent hover:border-slate-200 hover:bg-white transition-all dark:hover:border-slate-700 dark:hover:bg-slate-900">
                                    <MoreHorizontal className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 shadow-lg border-slate-200 rounded-lg p-1 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                                  <DropdownMenuLabel className="text-[10px] font-semibold text-slate-400 uppercase px-2 py-1.5 dark:text-slate-500">Opciones</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => verDetalles(r)} className="cursor-pointer text-xs font-medium gap-2.5 py-2 dark:focus:bg-slate-900 dark:focus:text-slate-100">
                                    <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> Ver detalles
                                  </DropdownMenuItem>
                                  {r.estado === 'pendiente' && (
                                    <DropdownMenuItem
                                      onClick={() => actualizarEstadoReserva(r.id, 'confirmada', 'Reserva confirmada correctamente')}
                                      className="cursor-pointer text-xs font-medium text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 gap-2.5 py-2 dark:text-emerald-300 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-200"
                                      disabled={isActionLoading(r.id)}
                                    >
                                      {isActionLoading(r.id, 'confirmada')
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <CheckCircle2 className="h-3.5 w-3.5" />}
                                      {isActionLoading(r.id, 'confirmada') ? 'Confirmando...' : 'Confirmar reserva'}
                                    </DropdownMenuItem>
                                  )}
                                  {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
                                    <DropdownMenuItem
                                      onClick={() => actualizarEstadoReserva(r.id, 'completada', 'Reserva marcada como completada')}
                                      className="cursor-pointer text-xs font-medium text-blue-600 focus:text-blue-600 focus:bg-blue-50 gap-2.5 py-2 dark:text-blue-300 dark:focus:bg-blue-500/10 dark:focus:text-blue-200"
                                      disabled={isActionLoading(r.id)}
                                    >
                                      {isActionLoading(r.id, 'completada')
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <CheckCircle2 className="h-3.5 w-3.5" />}
                                      {isActionLoading(r.id, 'completada') ? 'Actualizando...' : 'Marcar completada'}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => cancelarReserva(r.id)}
                                    className="cursor-pointer text-xs font-medium text-red-600 focus:text-red-600 focus:bg-red-50 gap-2.5 py-2 dark:text-red-300 dark:focus:bg-red-500/10 dark:focus:text-red-200"
                                    disabled={r.estado === 'cancelada' || isActionLoading(r.id)}
                                  >
                                    {isActionLoading(r.id, 'cancelada')
                                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      : <Trash2 className="h-3.5 w-3.5" />}
                                    {isActionLoading(r.id, 'cancelada') ? 'Anulando...' : 'Anular registro'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                            <p className="text-sm text-muted-foreground dark:text-slate-400">No hay registros de reservas en este momento.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0 focus-visible:outline-none animate-in fade-in duration-300">
          <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden dark:bg-slate-950 dark:border-slate-800 dark:shadow-black/20">
            {/* ── Cabecera del calendario ── */}
            <CardHeader className="border-b border-slate-100 bg-slate-50/30 flex flex-row items-center justify-between py-3 px-5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <CardTitle className="text-sm font-semibold text-slate-900 capitalize dark:text-slate-100">
                  {currentDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                </CardTitle>
                {/* Leyenda de estados */}
                <div className="hidden sm:flex items-center gap-3 ml-2">
                  {[
                    { color: 'bg-blue-500',   label: 'Confirmada' },
                    { color: 'bg-amber-400',  label: 'Pendiente'  },
                    { color: 'bg-red-400',    label: 'Cancelada'  },
                  ].map(l => (
                    <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className={`w-2 h-2 rounded-full ${l.color}`} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-[10px] font-semibold uppercase tracking-wider border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  onClick={() => setCurrentDate(new Date())}>
                  Hoy
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* ── Nombres de los días ── */}
              <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                  <div key={d} className="py-2.5 text-center text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-r-0 dark:border-slate-800 dark:text-slate-500">
                    {d}
                  </div>
                ))}
              </div>

              {/* ── Grid de días — altura dinámica, min-h para que haya espacio ── */}
              <div className="grid grid-cols-7">
                {calendarDays.map((dayObj, i) => {
                  const dayReservas   = getReservasForDate(dayObj.date)
                  const total         = dayReservas.length
                  const isToday       = dayObj.date?.toDateString?.() === new Date().toDateString()
                  const MAX_VISIBLE   = 3

                  return (
                    <div
                      key={i}
                      className={cn(
                        'border-r border-b border-slate-100 last:border-r-0 min-h-[90px] sm:min-h-[110px] lg:min-h-[130px] dark:border-slate-800',
                        'p-1.5 sm:p-2 flex flex-col transition-colors',
                        !dayObj.currentMonth && 'bg-slate-50/60 dark:bg-slate-900/40',
                        dayObj.currentMonth && total > 0 && 'hover:bg-blue-50/30 cursor-pointer dark:hover:bg-slate-900',
                        dayObj.currentMonth && total === 0 && 'hover:bg-slate-50/40 dark:hover:bg-slate-900/70',
                      )}
                      onClick={() => total > 0 && verDetalles(dayReservas[0])}
                    >
                      {/* Número del día */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          'text-xs sm:text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-colors',
                          isToday
                            ? 'bg-blue-600 text-white'
                            : dayObj.currentMonth
                              ? 'text-slate-700 dark:text-slate-200'
                              : 'text-slate-300 dark:text-slate-600'
                        )}>
                          {dayObj.day}
                        </span>
                        {total > 0 && (
                          <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 bg-blue-50 rounded-full px-1.5 py-0.5 leading-none dark:bg-blue-500/15 dark:text-blue-300">
                            {total}
                          </span>
                        )}
                      </div>

                      {/* Eventos */}
                      <div className="space-y-0.5 flex-1 overflow-hidden">
                        {dayReservas.slice(0, MAX_VISIBLE).map(r => {
                          const hora = new Date(r.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
                          const color = r.estado === 'cancelada'
                            ? 'bg-slate-100 text-slate-500 border-slate-200 line-through dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            : r.estado === 'pendiente'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20'
                              : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/20'
                          const dot = r.estado === 'cancelada'
                            ? 'bg-red-400'
                            : r.estado === 'pendiente'
                              ? 'bg-amber-400'
                              : 'bg-blue-500'

                          return (
                            <div key={r.id} className={cn(
                              'flex items-center gap-1 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border truncate font-medium',
                              color
                            )}>
                              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
                              <span className="font-bold flex-shrink-0 hidden sm:inline">{hora}</span>
                              <span className="truncate">{r.customerName}</span>
                            </div>
                          )
                        })}
                        {total > MAX_VISIBLE && (
                          <p className="text-[9px] text-slate-400 font-medium pl-1">
                            +{total - MAX_VISIBLE} más
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOGO DE DETALLES - SHADCN CLEAN STYLE */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-xl bg-white animate-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-950">
          <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-white text-[10px] font-semibold uppercase border-slate-200 px-2 py-0.5 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100">{selectedReserva?.estado || 'pendiente'}</Badge>
              <span className="text-[10px] font-medium text-slate-400 tracking-tighter dark:text-slate-500">REF: {selectedReserva?.id?.substring(0,8)}</span>
            </div>
            <DialogTitle className="text-xl font-semibold text-slate-950 mt-2 dark:text-slate-100">{selectedReserva?.customerName || 'Cliente Anónimo'}</DialogTitle>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest dark:text-slate-500">Servicio</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{servicios.find(s => s.id === selectedReserva?.serviceOfferingId)?.nombreServicio}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest dark:text-slate-500">Recurso</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{activos.find(a => a.id === selectedReserva?.assetId)?.nombreActivo}</p>
              </div>
            </div>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 dark:bg-slate-900 dark:text-slate-400">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest dark:text-slate-500">Programación</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedReserva && new Date(selectedReserva.startTime).toLocaleString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 dark:bg-slate-900 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest dark:text-slate-500">Contacto</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{selectedReserva?.customerEmail || 'No especificado'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 dark:text-slate-400">{selectedReserva?.customerPhone || 'Sin teléfono'}</p>
                </div>
              </div>

              {selectedReserva?.note && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 dark:bg-slate-900 dark:text-slate-400">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest dark:text-slate-500">Notas internas</p>
                    <p className="text-xs text-slate-600 italic leading-relaxed mt-1 dark:text-slate-300">"{selectedReserva.note}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2 dark:bg-slate-950 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setDetailsOpen(false)} className="h-8 text-xs font-medium border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              Cerrar
            </Button>
            {selectedReserva?.estado === 'pendiente' && (
              <Button 
                size="sm"
                onClick={() => actualizarEstadoReserva(selectedReserva?.id, 'confirmada', 'Reserva confirmada correctamente')}
                disabled={isActionLoading(selectedReserva?.id)}
                className="h-8 text-xs font-medium shadow-sm bg-emerald-600 hover:bg-emerald-700"
              >
                {isActionLoading(selectedReserva?.id, 'confirmada') && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                {isActionLoading(selectedReserva?.id, 'confirmada') ? 'Confirmando...' : 'Confirmar'}
              </Button>
            )}
            {(selectedReserva?.estado === 'pendiente' || selectedReserva?.estado === 'confirmada') && (
              <Button 
                size="sm"
                onClick={() => actualizarEstadoReserva(selectedReserva?.id, 'completada', 'Reserva marcada como completada')}
                disabled={isActionLoading(selectedReserva?.id)}
                className="h-8 text-xs font-medium shadow-sm bg-blue-600 hover:bg-blue-700"
              >
                {isActionLoading(selectedReserva?.id, 'completada') && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                {isActionLoading(selectedReserva?.id, 'completada') ? 'Actualizando...' : 'Completar'}
              </Button>
            )}
            {selectedReserva?.estado !== 'cancelada' && (
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => {
                  cancelarReserva(selectedReserva?.id);
                  setDetailsOpen(false);
                }}
                disabled={isActionLoading(selectedReserva?.id)}
                className="h-8 text-xs font-medium shadow-sm"
              >
                {isActionLoading(selectedReserva?.id, 'cancelada') && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                {isActionLoading(selectedReserva?.id, 'cancelada') ? 'Anulando...' : 'Anular Cita'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ReservationDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        servicios={servicios}
        activos={activos}
      />
    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

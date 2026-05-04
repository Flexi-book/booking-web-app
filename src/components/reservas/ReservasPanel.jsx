import { useState, useEffect, useMemo } from 'react'
import { 
  Calendar as CalendarIcon, Search, Filter, MoreHorizontal, 
  Clock, User, Mail, Phone, CalendarClock,
  Trash2, X, Plus, CheckCircle2, LayoutGrid, List as ListIcon,
  ChevronLeft, ChevronRight, Info, Eye, PhoneCall, History,
  ExternalLink, ArrowUpRight
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
import { reservasApi, activosApi, serviciosApi } from '../../services/gestionService'

import ReservationDialog from './ReservationDialog'

export default function ReservasPanel() {
  const [reservas, setReservas] = useState([])
  const [activos, setActivos] = useState([])
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('list')

  useEffect(() => {
    cargarTodo()
  }, [])

  async function cargarTodo() {
    setLoading(true)
    setError('')
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
      setError('Error al sincronizar datos de reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (payload) => {
    setError('')
    setSuccess('')
    try {
      await reservasApi.crear(payload)
      setSuccess('Reserva confirmada con éxito')
      cargarTodo()
    } catch (err) {
      throw new Error(err.response?.data?.message || 'No hay disponibilidad en ese horario.')
    }
  }

  async function cancelarReserva(id) {
    if (!window.confirm("¿Estás seguro de anular esta reserva? El registro se mantendrá como 'Cancelado'.")) return
    setError('')
    try {
      await reservasApi.cancelar(id)
      setSuccess('Reserva anulada correctamente')
      cargarTodo()
    } catch {
      setError('No se pudo cancelar la reserva')
    }
  }

  const verDetalles = (reserva) => {
    setSelectedReserva(reserva)
    setDetailsOpen(true)
  }

  const getStatusBadge = (estado) => {
    const est = (estado || 'pendiente').toLowerCase()
    switch(est) {
      case 'confirmada':
        return <Badge variant="outline" className="bg-emerald-50/50 text-emerald-600 border-emerald-100 font-medium px-2.5 py-0.5 rounded-full">Confirmada</Badge>
      case 'cancelada':
        return <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-medium px-2.5 py-0.5 rounded-full line-through">Cancelada</Badge>
      case 'completada':
        return <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-100 font-medium px-2.5 py-0.5 rounded-full">Completada</Badge>
      default:
        return <Badge variant="outline" className="bg-amber-50/50 text-amber-600 border-amber-100 font-medium px-2.5 py-0.5 rounded-full">Pendiente</Badge>
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
      days.push({ day: prevMonthDaysTotal - i, currentMonth: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, currentMonth: false })
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
      
      {/* HEADER SECTION - SHADCN STYLE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Gestión de Reservas</h1>
          <p className="text-sm text-muted-foreground font-medium">Administra y monitorea las citas de tu negocio.</p>
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
          <Card key={i} className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden group hover:border-slate-300 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-950">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={view} onValueChange={setView} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <TabsList className="bg-slate-100 p-1 rounded-lg border border-slate-200/60">
            <TabsTrigger value="list" className="rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ListIcon className="w-3.5 h-3.5 mr-2" /> Listado
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CalendarIcon className="w-3.5 h-3.5 mr-2" /> Calendario
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Filtrar por cliente..." 
              className="pl-8 h-9 text-xs border-slate-200 bg-white rounded-md focus:ring-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="list" className="mt-0 focus-visible:outline-none animate-in fade-in duration-300">
          <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12"><TableLoader rows={5} columns={6} /></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50 border-b border-slate-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[280px] font-semibold text-slate-900 py-3 px-6">Cliente</TableHead>
                        <TableHead className="font-semibold text-slate-900">Servicio</TableHead>
                        <TableHead className="font-semibold text-slate-900">Recurso</TableHead>
                        <TableHead className="font-semibold text-slate-900">Programación</TableHead>
                        <TableHead className="font-semibold text-slate-900">Estado</TableHead>
                        <TableHead className="text-right font-semibold text-slate-900 px-6">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservas.length > 0 ? (
                        filteredReservas.map((r) => (
                          <TableRow key={r.id} className="hover:bg-slate-50/30 transition-colors border-slate-100">
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-semibold text-xs border border-slate-200">
                                  {(r.customerName || 'A').charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-950 text-sm leading-none">{r.customerName || 'Cliente Anónimo'}</span>
                                  <span className="text-[11px] text-muted-foreground mt-1">{r.customerEmail || 'Sin correo electrónico'}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium text-slate-700">
                              {servicios.find(s => s.id === r.serviceOfferingId)?.nombreServicio}
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50">
                                {activos.find(a => a.id === r.assetId)?.nombreActivo}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900">
                                  {new Date(r.startTime).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                </span>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(r.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(r.estado)}</TableCell>
                            <TableCell className="text-right px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-md border border-transparent hover:border-slate-200 hover:bg-white transition-all">
                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 shadow-lg border-slate-200 rounded-lg p-1">
                                  <DropdownMenuLabel className="text-[10px] font-semibold text-slate-400 uppercase px-2 py-1.5">Opciones</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => verDetalles(r)} className="cursor-pointer text-xs font-medium gap-2.5 py-2">
                                    <Eye className="h-3.5 w-3.5 text-slate-500" /> Ver detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => cancelarReserva(r.id)} className="cursor-pointer text-xs font-medium text-red-600 focus:text-red-600 focus:bg-red-50 gap-2.5 py-2" disabled={r.estado === 'cancelada'}>
                                    <Trash2 className="h-3.5 w-3.5" /> Anular registro
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center">
                            <p className="text-sm text-muted-foreground">No hay registros de reservas en este momento.</p>
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
          <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30 flex flex-row items-center justify-between py-3 px-6">
              <CardTitle className="text-sm font-semibold text-slate-900 capitalize">
                {currentDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-slate-200" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] font-semibold uppercase tracking-wider border-slate-200" onClick={() => setCurrentDate(new Date())}>
                  Hoy
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-slate-200" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b border-slate-100">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                  <div key={d} className="py-2.5 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/20 border-r border-slate-100 last:border-r-0">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 h-[560px]">
                {calendarDays.map((dayObj, i) => {
                  const dayReservas = getReservasForDate(dayObj.date)
                  return (
                    <div key={i} onClick={() => dayReservas.length > 0 && verDetalles(dayReservas[0])} className={cn(
                      "p-1.5 border-r border-b border-slate-100 relative group transition-all overflow-y-auto last:border-r-0 cursor-pointer min-h-[80px]",
                      !dayObj.currentMonth ? "bg-slate-50/50" : "bg-white hover:bg-slate-50/20"
                    )}>
                      <span className={cn("text-[10px] font-semibold mb-1 block", dayObj.currentMonth ? "text-slate-600" : "text-slate-300")}>
                        {dayObj.day}
                      </span>
                      <div className="space-y-1">
                        {dayReservas.map(r => (
                          <div key={r.id} className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded border transition-all truncate font-medium",
                            r.estado === 'cancelada' 
                              ? "bg-slate-50 border-slate-200 text-slate-400 line-through opacity-60" 
                              : "bg-white border-slate-200 text-slate-900 shadow-sm hover:border-slate-400"
                          )}>
                            <span className="font-semibold mr-1">{new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {r.customerName}
                          </div>
                        ))}
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
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-xl bg-white animate-in zoom-in-95 duration-200">
          <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-white text-[10px] font-semibold uppercase border-slate-200 px-2 py-0.5">{selectedReserva?.estado || 'pendiente'}</Badge>
              <span className="text-[10px] font-medium text-slate-400 tracking-tighter">REF: {selectedReserva?.id?.substring(0,8)}</span>
            </div>
            <DialogTitle className="text-xl font-semibold text-slate-950 mt-2">{selectedReserva?.customerName || 'Cliente Anónimo'}</DialogTitle>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Servicio</p>
                <p className="text-sm font-medium text-slate-900">{servicios.find(s => s.id === selectedReserva?.serviceOfferingId)?.nombreServicio}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Recurso</p>
                <p className="text-sm font-medium text-slate-900">{activos.find(a => a.id === selectedReserva?.assetId)?.nombreActivo}</p>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Programación</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedReserva && new Date(selectedReserva.startTime).toLocaleString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Contacto</p>
                  <p className="text-sm font-medium text-slate-900">{selectedReserva?.customerEmail || 'No especificado'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedReserva?.customerPhone || 'Sin teléfono'}</p>
                </div>
              </div>

              {selectedReserva?.note && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Notas internas</p>
                    <p className="text-xs text-slate-600 italic leading-relaxed mt-1">"{selectedReserva.note}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDetailsOpen(false)} className="h-8 text-xs font-medium border-slate-200">
              Cerrar
            </Button>
            {selectedReserva?.estado !== 'cancelada' && (
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => {
                  cancelarReserva(selectedReserva.id);
                  setDetailsOpen(false);
                }}
                className="h-8 text-xs font-medium shadow-sm"
              >
                Anular Cita
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

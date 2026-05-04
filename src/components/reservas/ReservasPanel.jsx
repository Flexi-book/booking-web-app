import { useState, useEffect } from 'react'
import { 
  Calendar, Search, Filter, MoreHorizontal, 
  Clock, User, Mail, Phone, CalendarClock,
  Trash2, X, Plus, CheckCircle2, LayoutGrid
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
import { TableLoader } from "@/components/ui/table-loader"
import { reservasApi, activosApi, serviciosApi } from '../../services/gestionService'

const emptyForm = { 
  serviceOfferingId: '', 
  assetId: '', 
  customerName: '', 
  customerEmail: '', 
  customerPhone: '', 
  startTime: '', 
  note: '' 
}

export default function ReservasPanel() {
  const [reservas, setReservas] = useState([])
  const [activos, setActivos] = useState([])
  const [servicios, setServicios] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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
      setReservas(res)
      setActivos(act)
      setServicios(serv)
    } catch (err) {
      setError('Error al sincronizar datos de reservas')
    } finally {
      setLoading(false)
    }
  }

  async function crearReserva(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await reservasApi.crear(form)
      setSuccess('Reserva confirmada con éxito')
      setForm(emptyForm)
      setShowForm(false)
      cargarTodo()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la reserva. Verifica la disponibilidad.')
    } finally {
      setLoading(false)
    }
  }

  async function cancelarReserva(id) {
    setError('')
    try {
      await reservasApi.cancelar(id)
      cargarTodo()
    } catch {
      setError('No se pudo cancelar la reserva')
    }
  }

  const getStatusBadge = (estado) => {
    const est = (estado || 'pendiente').toLowerCase()
    switch(est) {
      case 'confirmada':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">Confirmada</Badge>
      case 'cancelada':
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-100 hover:bg-red-100">Cancelada</Badge>
      case 'completada':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100">Completada</Badge>
      default:
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100">Pendiente</Badge>
    }
  }

  const filteredReservas = reservas.filter(r => 
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Reservas
          </h1>
          <p className="text-slate-500 font-medium">Control de citas y ocupación en tiempo real</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 font-bold gap-2"
        >
          <Plus className="w-5 h-5" /> Nueva Reserva
        </Button>
      </div>

      {/* STATS MINI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white p-4 flex items-center gap-4 ring-1 ring-slate-100">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Calendar className="text-blue-600 w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Hoy</div>
            <div className="text-2xl font-bold text-slate-900">{reservas.length}</div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white p-4 flex items-center gap-4 ring-1 ring-slate-100">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="text-emerald-600 w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Confirmadas</div>
            <div className="text-2xl font-bold text-slate-900">
              {reservas.filter(r => r.estado === 'confirmada').length}
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white p-4 flex items-center gap-4 ring-1 ring-slate-100">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <Clock className="text-amber-600 w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pendientes</div>
            <div className="text-2xl font-bold text-slate-900">
              {reservas.filter(r => !r.estado || r.estado === 'pendiente').length}
            </div>
          </div>
        </Card>
      </div>

      {/* FEEDBACK MESSAGES */}
      {(error || success) && (
        <div className={cn(
          "p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300",
          error ? "bg-red-50 border-red-100 text-red-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
        )}>
          <Info className="w-5 h-5" />
          <span className="font-semibold text-sm">{error || success}</span>
        </div>
      )}

      {/* MAIN TABLE AREA */}
      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white ring-1 ring-slate-100 overflow-hidden relative">
        <CardHeader className="bg-white border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-slate-800">Listado de Reservas</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por cliente o email..." 
                className="pl-10 bg-slate-50/50 border-slate-100 focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8">
              <TableLoader rows={5} columns={5} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-700 py-4 px-8">Cliente</TableHead>
                    <TableHead className="font-bold text-slate-700">Servicio</TableHead>
                    <TableHead className="font-bold text-slate-700">Recurso</TableHead>
                    <TableHead className="font-bold text-slate-700">Fecha y Hora</TableHead>
                    <TableHead className="font-bold text-slate-700">Estado</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 px-8">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservas.length > 0 ? (
                    filteredReservas.map((r) => (
                      <TableRow key={r.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                        <TableCell className="py-5 px-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold uppercase">
                              {r.customerName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{r.customerName || 'Cliente Anónimo'}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {r.customerEmail}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-700">
                            {servicios.find(s => s.id === r.serviceOfferingId)?.nombreServicio || 'Servicio no especificado'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500">
                            {activos.find(a => a.id === r.assetId)?.nombreActivo || 'Recurso genérico'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-500" />
                              {new Date(r.startTime).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(r.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(r.estado)}</TableCell>
                        <TableCell className="text-right px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-100 rounded-full">
                                <MoreHorizontal className="h-5 w-5 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 shadow-2xl border-slate-100">
                              <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase">Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer py-2">
                                <Phone className="mr-3 h-4 w-4 text-blue-600" /> 
                                <span className="font-medium">Llamar Cliente</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => cancelarReserva(r.id)} 
                                className="cursor-pointer py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                                disabled={r.estado === 'cancelada'}
                              >
                                <X className="mr-3 h-4 w-4" /> 
                                <span className="font-medium">Anular Reserva</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <LayoutGrid className="h-10 w-10 opacity-20" />
                          <p>No hay reservas que coincidan con tu búsqueda.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TODO: Implement Reservation Dialog to match Assets/Services */}
    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

import { useState, useEffect } from 'react'
import { 
  Plus, Search, MoreHorizontal, Pencil, Trash2, 
  Clock, LayoutGrid, Info
} from "lucide-react"
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { serviciosApi } from '../../services/gestionService'
import { TableLoader } from "@/components/ui/table-loader"
import ServiceDialog from './ServiceDialog'
import { Badge } from "@/components/ui/badge"

export default function ServiciosPanel() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    cargarServicios()
  }, [])

  const cargarServicios = async () => {
    setLoading(true)
    try {
      const data = await serviciosApi.listar()
      setServicios(data || [])
    } catch (err) {
      console.error("Error al cargar servicios:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (service) => {
    setSelectedService(service)
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este servicio?")) {
      try {
        await serviciosApi.eliminar(id)
        cargarServicios()
      } catch (err) {
        alert("Error al eliminar el servicio")
      }
    }
  }

  const filteredServicios = servicios.filter(s => 
    (s.nombreServicio || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val)
  }

  const getStatusBadge = (estado) => {
    const isActive = estado === 'activo'
    return (
      <Badge variant="outline" className={isActive ? "bg-emerald-50/50 text-emerald-600 border-emerald-100 font-medium" : "bg-slate-50 text-slate-400 border-slate-200 font-medium"}>
        {isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Servicios</h1>
          <p className="text-sm text-muted-foreground font-medium">Administra tu catálogo de prestaciones y tarifas.</p>
        </div>
        <Button 
          onClick={() => { setSelectedService(null); setDialogOpen(true) }}
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm px-4 h-9 rounded-md text-sm font-medium gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nuevo Servicio
        </Button>
      </div>

      {/* MAIN TABLE CARD */}
      <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/30 border-b border-slate-100 py-4 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-sm font-semibold text-slate-900">Catálogo de Servicios</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por servicio..." 
                className="pl-8 h-8 text-xs border-slate-200 bg-white rounded-md focus:ring-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12">
              <TableLoader columns={5} rows={4} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px] font-semibold text-slate-900 py-3 px-6 text-xs uppercase tracking-wider">Servicio</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Duración</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Tarifa</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Estado</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900 px-6 text-xs uppercase tracking-wider">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServicios.length > 0 ? (
                    filteredServicios.map((s) => (
                      <TableRow key={s.id} className="hover:bg-slate-50/30 transition-colors border-slate-100">
                        <TableCell className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-950 text-sm leading-none">{s.nombreServicio}</span>
                            <span className="text-[11px] text-muted-foreground mt-1.5 truncate max-w-[250px]">
                              {s.descripcion || "Sin descripción registrada"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-slate-600 font-medium bg-slate-100/50 w-fit px-2 py-0.5 rounded-md text-[10px] border border-slate-200/50">
                            <Clock className="mr-1.5 h-3 w-3 text-slate-400" />
                            {s.duracionMinutos} min
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-slate-900">
                            {formatCurrency(s.precio)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(s.estado)}</TableCell>
                        <TableCell className="text-right px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 rounded-md border border-transparent hover:border-slate-200 hover:bg-white transition-all">
                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 shadow-lg border-slate-200 rounded-lg p-1">
                              <DropdownMenuLabel className="text-[10px] font-semibold text-slate-400 uppercase px-2 py-1.5 tracking-tight">Opciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(s)} className="cursor-pointer text-xs font-medium gap-2.5 py-2">
                                <Pencil className="h-3.5 w-3.5 text-slate-500" /> Editar servicio
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(s.id)} className="cursor-pointer text-xs font-medium text-red-600 focus:text-red-600 focus:bg-red-50 gap-2.5 py-2">
                                <Trash2 className="h-3.5 w-3.5" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <p className="text-sm text-muted-foreground">No se encontraron servicios en el catálogo.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        service={selectedService}
        onSave={cargarServicios}
      />
    </div>
  )
}

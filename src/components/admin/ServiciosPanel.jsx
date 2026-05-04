import { useState, useEffect } from 'react'
import { 
  Plus, Search, MoreHorizontal, Pencil, Trash2, 
  Clock, LayoutGrid, Info
} from "lucide-react"
import { 
  Card, CardContent, CardHeader, CardTitle 
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
      setServicios(data)
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
    s.nombreServicio.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val)
  }

  const getStatusBadge = (estado) => {
    if (estado === 'activo') {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">Activo</Badge>
    }
    return <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-200">Inactivo</Badge>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Servicios
          </h1>
          <p className="text-slate-500 font-medium">Gestiona tu oferta de servicios y precios</p>
        </div>
        <Button 
          onClick={() => { setSelectedService(null); setDialogOpen(true) }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 font-bold gap-2"
        >
          <Plus className="w-5 h-5" /> Nuevo Servicio
        </Button>
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white ring-1 ring-slate-100 overflow-hidden relative">
        <CardHeader className="bg-white border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-slate-800">Catálogo de Servicios</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar servicio..." 
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
              <TableLoader columns={4} rows={4} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-700 py-4 text-xs uppercase tracking-wider px-8">Servicio</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Duración</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Precio</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Estado</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 px-8 text-xs uppercase tracking-wider">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServicios.length > 0 ? (
                    filteredServicios.map((s) => (
                      <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                        <TableCell className="py-5 px-8">
                          <div className="font-bold text-slate-900">{s.nombreServicio}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[300px] mt-0.5">
                            {s.descripcion || "Sin descripción"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-slate-700 font-medium bg-slate-100/50 w-fit px-2 py-1 rounded-md text-xs border border-slate-200/50">
                            <Clock className="mr-1.5 h-3 w-3 text-slate-500" />
                            {s.duracionMinutos} min
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900">
                            {formatCurrency(s.precio)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(s.estado)}</TableCell>
                        <TableCell className="text-right px-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-full transition-all">
                                <MoreHorizontal className="h-5 w-5 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 shadow-2xl border-slate-100 p-1 rounded-xl">
                              <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1.5">Gestión</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-100" />
                              <DropdownMenuItem onClick={() => handleEdit(s)} className="cursor-pointer py-2.5 rounded-lg gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <Pencil className="h-4 w-4 text-blue-600" /> 
                                </div>
                                <span className="font-semibold text-slate-700">Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(s.id)} className="cursor-pointer py-2.5 rounded-lg gap-3 text-red-600 focus:text-red-600 focus:bg-red-50">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                  <Trash2 className="h-4 w-4" /> 
                                </div>
                                <span className="font-semibold">Eliminar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <LayoutGrid className="h-10 w-10 opacity-20" />
                          <p>No se encontraron servicios registrados.</p>
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

      <ServiceDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        service={selectedService}
        onSave={cargarServicios}
      />
    </div>
  )
}

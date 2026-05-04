import { useState, useEffect } from 'react'
import { 
  Plus, Search, MoreHorizontal, Pencil, Trash2, 
  Tag, Users, LayoutGrid, Info
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
import { activosApi } from '../../services/gestionService'
import { TableLoader } from "@/components/ui/table-loader"
import AssetDialog from './AssetDialog'
import { Badge } from "@/components/ui/badge"

export default function ActivosPanel() {
  const [activos, setActivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)

  useEffect(() => {
    cargarActivos()
  }, [])

  const cargarActivos = async () => {
    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const empresaId = user.empresaId || user.companyId
      const data = await activosApi.listar(empresaId)
      setActivos(data)
    } catch (err) {
      console.error("Error al cargar activos:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (asset) => {
    setSelectedAsset(asset)
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este recurso?")) {
      try {
        await activosApi.eliminar(id)
        cargarActivos()
      } catch (err) {
        alert("Error al eliminar el activo")
      }
    }
  }

  const filteredActivos = activos.filter(a => 
    (a.nombreActivo || a.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (estado) => {
    const isAvailable = (estado || '').toLowerCase() === 'disponible'
    if (isAvailable) {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">Disponible</Badge>
    }
    return <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-200">No Disponible</Badge>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Recursos
          </h1>
          <p className="text-slate-500 font-medium">Gestiona tus salas, profesionales y equipos</p>
        </div>
        <Button 
          onClick={() => { setSelectedAsset(null); setDialogOpen(true) }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 font-bold gap-2"
        >
          <Plus className="w-5 h-5" /> Nuevo Recurso
        </Button>
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white ring-1 ring-slate-100 overflow-hidden relative">
        <CardHeader className="bg-white border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-slate-800">Inventario de Activos</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar activo..." 
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
                    <TableHead className="font-bold text-slate-700 py-4 text-xs uppercase tracking-wider px-8">Activo / Recurso</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tipo</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Capacidad</TableHead>
                    <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Estado</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 px-8 text-xs uppercase tracking-wider">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivos.length > 0 ? (
                    filteredActivos.map((a) => (
                      <TableRow key={a.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                        <TableCell className="py-5 px-8">
                          <div className="font-bold text-slate-900">{a.nombreActivo || a.nombre}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[300px] mt-0.5">
                            {a.descripcion || "Sin descripción adicional"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-slate-700 font-medium bg-slate-100/50 w-fit px-2 py-1 rounded-md text-xs uppercase tracking-wider border border-slate-200/50">
                            <Tag className="mr-1.5 h-3 w-3 text-slate-500" />
                            {a.tipoActivoNombre || a.tipoActivo || "General"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-slate-700 font-medium">
                            <Users className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                            {a.capacidad || 1} personas
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(a.estado)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleEdit(a)} className="cursor-pointer py-2.5 rounded-lg gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <Pencil className="h-4 w-4 text-blue-600" /> 
                                </div>
                                <span className="font-semibold text-slate-700">Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(a.id)} className="cursor-pointer py-2.5 rounded-lg gap-3 text-red-600 focus:text-red-600 focus:bg-red-50">
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
                          <p>No se encontraron activos registrados.</p>
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

      <AssetDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        asset={selectedAsset}
        onSave={cargarActivos}
      />
    </div>
  )
}

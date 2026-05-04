import { useState, useEffect } from 'react'
import { 
  Plus, Search, MoreHorizontal, Pencil, Trash2, 
  Tag, Users, LayoutGrid, Info
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
      setActivos(data || [])
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
    return (
      <Badge variant="outline" className={isAvailable ? "bg-emerald-50/50 text-emerald-600 border-emerald-100 font-medium" : "bg-slate-50 text-slate-400 border-slate-200 font-medium"}>
        {isAvailable ? 'Disponible' : 'No Disponible'}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Recursos</h1>
          <p className="text-sm text-muted-foreground font-medium">Gestiona tus profesionales, salas y equipos técnicos.</p>
        </div>
        <Button 
          onClick={() => { setSelectedAsset(null); setDialogOpen(true) }}
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm px-4 h-9 rounded-md text-sm font-medium gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nuevo Recurso
        </Button>
      </div>

      {/* MAIN TABLE CARD */}
      <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/30 border-b border-slate-100 py-4 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-sm font-semibold text-slate-900">Inventario de Activos</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre..." 
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
                    <TableHead className="w-[300px] font-semibold text-slate-900 py-3 px-6 text-xs uppercase tracking-wider">Recurso</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Tipo</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Capacidad</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Estado</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900 px-6 text-xs uppercase tracking-wider">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivos.length > 0 ? (
                    filteredActivos.map((a) => (
                      <TableRow key={a.id} className="hover:bg-slate-50/30 transition-colors border-slate-100">
                        <TableCell className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-950 text-sm leading-none">{a.nombreActivo || a.nombre}</span>
                            <span className="text-[11px] text-muted-foreground mt-1.5 truncate max-w-[250px]">
                              {a.descripcion || "Sin descripción registrada"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-slate-600 font-medium bg-slate-100/50 w-fit px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider border border-slate-200/50">
                            <Tag className="mr-1.5 h-3 w-3 text-slate-400" />
                            {a.tipoActivoNombre || a.tipoActivo || "General"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm font-medium text-slate-700">
                            <Users className="mr-2 h-3.5 w-3.5 text-slate-400" />
                            {a.capacidad || 1}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(a.estado)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleEdit(a)} className="cursor-pointer text-xs font-medium gap-2.5 py-2">
                                <Pencil className="h-3.5 w-3.5 text-slate-500" /> Editar datos
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(a.id)} className="cursor-pointer text-xs font-medium text-red-600 focus:text-red-600 focus:bg-red-50 gap-2.5 py-2">
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
                        <p className="text-sm text-muted-foreground">No se encontraron recursos configurados.</p>
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

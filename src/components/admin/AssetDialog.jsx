import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Loader2, Settings, Layout, Info 
} from "lucide-react"
import { activosApi } from '../../services/gestionService'

const TIPOS = [
  { id: 'barbero', nombre: 'Barbero' },
  { id: 'cancha', nombre: 'Cancha' },
  { id: 'peluquero', nombre: 'Peluquero' },
  { id: 'profesional', nombre: 'Profesional' },
  { id: 'sala', nombre: 'Sala / Espacio' },
  { id: 'silla', nombre: 'Silla / Puesto' },
  { id: 'otro', nombre: 'Otro' }
]

const ESTADOS = [
  { id: 'disponible', nombre: 'Disponible' },
  { id: 'no_disponible', nombre: 'No Disponible' },
  { id: 'mantenimiento', nombre: 'Mantenimiento' }
]

const emptyForm = {
  nombre: '',
  descripcion: '',
  tipoActivo: '',
  estadoDisponibilidad: 'disponible'
}

export default function AssetDialog({ open, onOpenChange, asset, onSave }) {
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      if (asset) {
        setFormData({
          nombre: asset.nombreActivo || asset.nombre || '',
          descripcion: asset.descripcion || '',
          tipoActivo: asset.tipoActivoId || asset.tipoActivo || '',
          estadoDisponibilidad: asset.estadoDisponibilidadId || asset.estadoDisponibilidad || 'disponible'
        })
      } else {
        setFormData(emptyForm)
      }
      setError('')
    }
  }, [asset, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const empresaId = user.empresaId || user.companyId

      const payload = { 
        ...formData, 
        empresaId 
      }

      if (asset?.id) {
        await activosApi.actualizar(asset.id, payload)
      } else {
        await activosApi.crear(payload)
      }

      onSave()
      onOpenChange(false)
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar el activo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-[750px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-2xl bg-white flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                <Settings className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {asset ? 'Editar Recurso' : 'Nuevo Recurso'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm hidden sm:block">Define el personal o espacio que brindará tus servicios.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Identidad del Recurso</Label>
                <div className="relative">
                  <Layout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    name="nombre"
                    placeholder="Ej. Sala Premium A1 o Juan Pérez"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="h-10 sm:h-12 pl-10 border-slate-200 rounded-xl focus:ring-slate-500 font-medium text-base sm:text-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo de Activo</Label>
                <Select 
                  value={formData.tipoActivo} 
                  onValueChange={(val) => handleSelectChange('tipoActivo', val)}
                >
                  <SelectTrigger className="h-10 sm:h-12 border-slate-200 rounded-xl bg-white focus:ring-slate-500">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Determina el icono y categoría.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Estado Operativo</Label>
                <Select 
                  value={formData.estadoDisponibilidad} 
                  onValueChange={(val) => handleSelectChange('estadoDisponibilidad', val)}
                >
                  <SelectTrigger className="h-10 sm:h-12 border-slate-200 rounded-xl font-semibold bg-white focus:ring-slate-500">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Notas Adicionales</Label>
                <Textarea
                  name="descripcion"
                  placeholder="Detalles sobre el recurso, ubicación o especialidad..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="min-h-[100px] sm:min-h-[110px] border-slate-200 rounded-xl resize-none py-3 text-sm"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 flex-shrink-0">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 sm:flex-none rounded-xl font-semibold text-slate-500 h-11"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !formData.nombre}
            className="flex-1 sm:flex-none bg-slate-900 hover:bg-black text-white rounded-xl font-bold px-8 shadow-lg shadow-slate-200 transition-all active:scale-95 h-11"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (asset ? 'Guardar' : 'Crear')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

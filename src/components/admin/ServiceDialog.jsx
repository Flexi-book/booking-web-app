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
  Loader2, Sparkles, Clock, DollarSign,
  Plus, Trash2, Info
} from "lucide-react"
import { serviciosApi, activosApi } from '../../services/gestionService'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const emptyForm = {
  nombreServicio: '',
  descripcion: '',
  duracionMinutos: 30,
  precio: '',
  moneda: 'CLP',
  estado: 'activo',
  disponibilidades: []
}

const diasSemana = [
  { id: 1, nombre: 'Lunes', letra: 'L' },
  { id: 2, nombre: 'Martes', letra: 'M' },
  { id: 3, nombre: 'Miércoles', letra: 'X' },
  { id: 4, nombre: 'Jueves', letra: 'J' },
  { id: 5, nombre: 'Viernes', letra: 'V' },
  { id: 6, nombre: 'Sábado', letra: 'S' },
  { id: 7, nombre: 'Domingo', letra: 'D' }
]

export default function ServiceDialog({ open, onOpenChange, service, onSave }) {
  const [formData, setFormData] = useState(emptyForm)
  const [activos, setActivos] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingActivos, setLoadingActivos] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      cargarActivos()
      if (service) {
        // Agrupar disponibilidades planas del backend por (activoId, horaInicio, horaFin)
        const groupedMap = new Map()
        if (service.disponibilidades) {
          service.disponibilidades.forEach(av => {
            const key = `${av.activoId}-${av.horaInicio}-${av.horaFin}`
            if (!groupedMap.has(key)) {
              groupedMap.set(key, {
                activoId: av.activoId,
                horaInicio: av.horaInicio ? av.horaInicio.substring(0, 5) : '',
                horaFin: av.horaFin ? av.horaFin.substring(0, 5) : '',
                diasSeleccionados: []
              })
            }
            groupedMap.get(key).diasSeleccionados.push(av.diaSemana)
          })
        }

        setFormData({
          ...service,
          precio: service.precio || '',
          moneda: service.moneda || 'CLP',
          estado: service.estado || 'activo',
          disponibilidades: Array.from(groupedMap.values())
        })
      } else {
        setFormData(emptyForm)
      }
      setError('')
    }
  }, [service, open])

  const cargarActivos = async () => {
    setLoadingActivos(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const empresaId = user.empresaId || user.companyId
      if (empresaId) {
        const data = await activosApi.listar(empresaId)
        setActivos(data)
      }
    } catch (err) {
      console.error("Error al cargar activos:", err)
    } finally {
      setLoadingActivos(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const finalValue = (name === 'duracionMinutos' || name === 'precio')
      ? (value === '' ? '' : Number(value))
      : value
    setFormData(prev => ({ ...prev, [name]: finalValue }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addAvailability = () => {
    // El usuario pidió que NO haya datos pre-completados.
    const newAv = {
      activoId: '', // Vacío para que el usuario elija
      diasSeleccionados: [], // Vacío para que el usuario elija
      horaInicio: '', // Vacío para que el usuario elija
      horaFin: '' // Vacío para que el usuario elija
    }
    setFormData(prev => ({
      ...prev,
      disponibilidades: [...prev.disponibilidades, newAv]
    }))
  }

  const removeAvailability = (index) => {
    setFormData(prev => ({
      ...prev,
      disponibilidades: prev.disponibilidades.filter((_, i) => i !== index)
    }))
  }

  const updateAvailability = (index, field, value) => {
    const newAvs = [...formData.disponibilidades]
    newAvs[index] = { ...newAvs[index], [field]: value }
    setFormData(prev => ({ ...prev, disponibilidades: newAvs }))
  }

  const toggleDay = (avIndex, dayId) => {
    const av = formData.disponibilidades[avIndex]
    const current = av.diasSeleccionados || []
    const updated = current.includes(dayId)
      ? current.filter(id => id !== dayId)
      : [...current, dayId].sort((a, b) => a - b)
    updateAvailability(avIndex, 'diasSeleccionados', updated)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    // Validación básica de disponibilidades
    for (const av of formData.disponibilidades) {
      if (!av.activoId || av.diasSeleccionados.length === 0 || !av.horaInicio || !av.horaFin) {
        setError("Por favor, completa todos los campos de disponibilidad o elimina las filas vacías.")
        setLoading(false)
        return
      }
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const empresaId = user.empresaId || user.companyId

      const finalDisponibilidades = []
      formData.disponibilidades.forEach(av => {
        const dias = av.diasSeleccionados || []
        dias.forEach(dia => {
          finalDisponibilidades.push({
            activoId: av.activoId,
            diaSemana: dia,
            horaInicio: av.horaInicio,
            horaFin: av.horaFin
          })
        })
      })

      const payload = {
        ...formData,
        empresaId,
        disponibilidades: finalDisponibilidades,
        precio: Number(formData.precio) || 0,
        duracionMinutos: Number(formData.duracionMinutos) || 30,
        estadoServicioId: formData.estado === 'activo'
          ? '739a4304-18cf-4cef-a2e7-1c4914781b03'
          : '64c7a71c-820c-4fa6-83ff-6d9476893a3b'
      }

      if (service?.id) {
        await serviciosApi.actualizar(service.id, payload)
      } else {
        await serviciosApi.crear(payload)
      }

      onSave()
      onOpenChange(false)
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar el servicio")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-[850px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-2xl bg-white flex flex-col h-[95vh] sm:h-auto sm:max-h-[90vh]">

        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Sparkles className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {service ? 'Editar Servicio' : 'Nuevo Servicio'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm hidden sm:block">
                  Configura los detalles y la disponibilidad de tu oferta.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Nombre del Servicio
                </Label>
                <Input
                  name="nombreServicio"
                  placeholder="Ej. Sesión de Yoga"
                  value={formData.nombreServicio}
                  onChange={handleChange}
                  className="h-10 sm:h-12 border-slate-200 rounded-xl focus:ring-blue-500"
                />
                <Textarea
                  name="descripcion"
                  placeholder="Describe brevemente de qué trata este servicio..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="min-h-[80px] sm:min-h-[100px] border-slate-200 rounded-xl resize-none py-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Duración (min)
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      name="duracionMinutos"
                      type="number"
                      placeholder="30"
                      value={formData.duracionMinutos}
                      onChange={handleChange}
                      className="h-10 sm:h-12 pl-10 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Moneda
                  </Label>
                  <Select 
                    value={formData.moneda} 
                    onValueChange={(val) => handleSelectChange('moneda', val)}
                  >
                    <SelectTrigger className="h-10 sm:h-12 border-slate-200 rounded-xl bg-white focus:ring-blue-500">
                      <SelectValue placeholder="Moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLP">CLP ($)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Precio
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {formData.moneda === 'EUR' ? '€' : '$'}
                  </span>
                  <Input
                    name="precio"
                    type="number"
                    placeholder="0"
                    value={formData.precio}
                    onChange={handleChange}
                    className="h-10 sm:h-12 pl-10 border-slate-200 rounded-xl text-lg font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Disponibilidad y Recursos
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAvailability}
                  className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
                </Button>
              </div>

              <div className="space-y-3">
                {formData.disponibilidades.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-[10px] sm:text-xs text-slate-400 leading-relaxed">
                    Define cuándo y dónde se ofrece este servicio pulsando "Añadir".
                  </div>
                ) : (
                  formData.disponibilidades.map((av, idx) => (
                    <div key={idx} className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200 relative group shadow-sm">
                      <button
                        onClick={() => removeAvailability(idx)}
                        className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="space-y-3">
                        <Select 
                          value={av.activoId} 
                          onValueChange={(val) => updateAvailability(idx, 'activoId', val)}
                        >
                          <SelectTrigger className="h-9 text-xs border-slate-200 bg-slate-50/50">
                            <SelectValue placeholder="Seleccionar Profesional" />
                          </SelectTrigger>
                          <SelectContent>
                            {activos.map(a => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.nombreActivo || a.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex flex-wrap gap-1.5">
                          {diasSemana.map(d => {
                            const isSelected = (av.diasSeleccionados || []).includes(d.id)
                            return (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => toggleDay(idx, d.id)}
                                className={cn(
                                  "w-8 h-8 rounded-lg text-[10px] font-bold transition-all border",
                                  isSelected
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                                    : "bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500"
                                )}
                              >
                                {d.letra}
                              </button>
                            )
                          })}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <Input
                            type="time"
                            step="60"
                            value={av.horaInicio || ''}
                            onChange={(e) => updateAvailability(idx, 'horaInicio', e.target.value)}
                            className="h-9 flex-1 text-[11px] border-slate-200 bg-white"
                          />
                          <span className="text-slate-300 text-xs">a</span>
                          <Input
                            type="time"
                            step="60"
                            value={av.horaFin || ''}
                            onChange={(e) => updateAvailability(idx, 'horaFin', e.target.value)}
                            className="h-9 flex-1 text-[11px] border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] sm:text-xs text-red-600 flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="secondary" className="bg-white border-slate-200 text-slate-500 font-medium px-3">
              {formData.estado === 'activo' ? 'Publicado' : 'Borrador'}
            </Badge>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none rounded-xl font-semibold text-slate-500 h-11"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.nombreServicio}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8 shadow-lg shadow-blue-100 transition-all active:scale-95 h-11"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (service ? 'Guardar' : 'Crear')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

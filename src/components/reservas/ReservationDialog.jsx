import { useState, useEffect } from "react"
import { 
  Calendar, Clock, User, Mail, Phone, 
  FileText, CheckCircle2, AlertCircle, X,
  Briefcase, Search, ArrowRight, ArrowLeft,
  Check, Sparkles, ShieldCheck, UserCheck, Loader2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { catalogApi } from "../../services/gestionService"

const emptyForm = {
  serviceOfferingId: "",
  assetId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  startTime: "",
  note: ""
}

export default function ReservationDialog({ open, onOpenChange, onSave, servicios = [], activos = [] }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setStep(1)
      setForm(emptyForm)
      setError("")
      fetchCatalog()
    }
  }, [open])

  const fetchCatalog = async () => {
    setLoadingCatalog(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const empresaId = user.empresaId || user.companyId
      if (empresaId) {
        const data = await catalogApi.obtenerCatalogo(empresaId)
        setCatalog(data)
      }
    } catch (err) {
      console.error("Error fetching catalog:", err)
    } finally {
      setLoadingCatalog(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && !form.serviceOfferingId) {
      setError("Selecciona el servicio primero")
      return
    }
    if (step === 2 && (!form.startTime || !form.assetId)) {
      setError("Debes seleccionar un profesional y una hora disponible")
      return
    }
    setError("")
    setStep(step + 1)
  }

  const prevStep = () => {
    setError("")
    setStep(step - 1)
  }

  const selectSlot = (assetId, fullSlot) => {
    // El slot viene como "09:00 - 09:30", extraemos solo el inicio
    const hour = fullSlot.split(" - ")[0]
    setForm(prev => ({
      ...prev, 
      assetId: assetId,
      startTime: `${selectedDate}T${hour}:00`
    }))
    setError("")
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      await onSave(form)
      onOpenChange(false)
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error al confirmar la reserva")
    } finally {
      setLoading(false)
    }
  }

  const selectedService = servicios.find(s => s.id === form.serviceOfferingId)
  const selectedAsset = activos.find(a => a.id === form.assetId)
  const selectedHour = form.startTime ? form.startTime.split('T')[1].substring(0, 5) : ""

  // Obtener disponibilidades reales del catálogo para el servicio seleccionado y día de la semana
  const getAvailableHoursForDay = () => {
    if (!catalog || !form.serviceOfferingId || !selectedDate) return []
    
    const dateObj = new Date(selectedDate + 'T00:00:00')
    let dayOfWeek = dateObj.getDay() // 0 = Domingo, 1 = Lunes...
    if (dayOfWeek === 0) dayOfWeek = 7 // Ajustar a 7 para Domingo en nuestro sistema
    
    const serviceInCatalog = catalog.servicios.find(s => s.servicioId === form.serviceOfferingId)
    if (!serviceInCatalog) return []

    // Filtrar disponibilidades por el día de la semana seleccionado
    return serviceInCatalog.disponibilidades.filter(d => d.diaSemana === dayOfWeek)
  }

  const realDisponibilidades = getAvailableHoursForDay()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-[32px] bg-white">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 flex">
          <div 
            className="h-full bg-blue-600 transition-all duration-700 ease-in-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="flex flex-col h-full max-h-[92vh]">
          
          <div className="p-8 pb-4 text-center space-y-1 relative">
            <DialogTitle className="text-2xl font-semibold text-slate-900 tracking-tight">
              {step === 1 && "Nueva Reserva"}
              {step === 2 && "Horarios Disponibles"}
              {step === 3 && "Finalizar Reserva"}
            </DialogTitle>
            <p className="text-slate-500 text-sm font-medium">
              {step === 1 && "Paso 1: ¿Qué servicio deseas?"}
              {step === 2 && `Paso 2: Disponibilidad para el ${selectedDate}`}
              {step === 3 && "Paso 3: Confirmación de datos"}
            </p>
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-900 rounded-full h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-8 py-4 overflow-y-auto hide-scrollbar">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in zoom-in-95">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-semibold">{error}</p>
              </div>
            )}

            {/* PASO 1: SERVICIOS */}
            {step === 1 && (
              <div className="grid gap-3 animate-in fade-in">
                {servicios.map(s => (
                  <button 
                    key={s.id}
                    type="button"
                    onClick={() => { setForm({...form, serviceOfferingId: s.id}); setError("") }}
                    className={`p-4 rounded-[20px] border-2 transition-all text-left flex items-center justify-between ${
                      form.serviceOfferingId === s.id 
                      ? "border-blue-600 bg-blue-50/30" 
                      : "border-slate-100 bg-slate-50/50 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        form.serviceOfferingId === s.id ? "bg-blue-600 text-white" : "bg-white text-slate-400"
                      }`}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{s.nombreServicio}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{s.duracionMinutos} MINUTOS</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">${s.precio}</p>
                  </button>
                ))}
              </div>
            )}

            {/* PASO 2: DISPONIBILIDAD REAL */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl">
                  <Calendar className="w-5 h-5 text-blue-600 ml-2" />
                  <Input 
                    type="date"
                    className="bg-transparent border-none font-semibold text-slate-900 p-0 focus:ring-0"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                  />
                </div>

                {loadingCatalog ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sincronizando agenda...</p>
                  </div>
                ) : realDisponibilidades.length === 0 ? (
                  <div className="py-12 px-8 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center space-y-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <AlertCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">No hay disponibilidad configurada para este día.</p>
                    <p className="text-xs text-slate-400">Por favor, selecciona otra fecha o verifica la configuración del servicio.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {realDisponibilidades.map(disponibilidad => (
                      <div key={`${disponibilidad.activoId}-${disponibilidad.diaSemana}`} className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-semibold text-slate-900">{disponibilidad.activoNombre}</span>
                          </div>
                          <Badge variant="outline" className="bg-white text-[10px] text-emerald-600 border-emerald-100 uppercase">
                            Disponible
                          </Badge>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {disponibilidad.horarios.map(fullSlot => {
                              const hourOnly = fullSlot.split(" - ")[0]
                              const isSelected = form.assetId === disponibilidad.activoId && selectedHour === hourOnly
                              return (
                                <button
                                  key={fullSlot}
                                  type="button"
                                  onClick={() => selectSlot(disponibilidad.activoId, fullSlot)}
                                  className={`py-2.5 rounded-xl text-xs font-semibold transition-all border-2 ${
                                    isSelected
                                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105"
                                    : "bg-white border-slate-100 text-slate-600 hover:border-blue-100 hover:text-blue-600"
                                  }`}
                                >
                                  {hourOnly}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PASO 3: CONFIRMACIÓN */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Nombre Cliente</label>
                    <Input 
                      placeholder="Juan Pérez"
                      className="h-12 bg-slate-50 border-none rounded-xl font-medium px-4"
                      value={form.customerName}
                      onChange={e => setForm({...form, customerName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <Input 
                      placeholder="+56 9 ..."
                      className="h-12 bg-slate-50 border-none rounded-xl font-medium px-4"
                      value={form.customerPhone}
                      onChange={e => setForm({...form, customerPhone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <Input 
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    className="h-12 bg-slate-50 border-none rounded-xl font-medium px-4"
                    value={form.customerEmail}
                    onChange={e => setForm({...form, customerEmail: e.target.value})}
                  />
                </div>
                
                <div className="mt-8 p-6 bg-slate-900 rounded-[28px] text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl" />
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">Servicio</p>
                        <p className="text-lg font-semibold">{selectedService?.nombreServicio}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">Precio</p>
                        <p className="text-lg font-semibold text-blue-400">${selectedService?.precio}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-white/10">
                      <div>
                        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">Profesional</p>
                        <p className="font-semibold text-blue-200">{selectedAsset?.nombreActivo || selectedAsset?.nombre}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">Cita para el</p>
                        <p className="font-semibold">{selectedHour} • {selectedDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-white border-t border-slate-50 flex items-center justify-between gap-4">
            {step > 1 ? (
              <Button 
                variant="ghost" 
                onClick={prevStep}
                className="h-14 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver
              </Button>
            ) : (
              <div />
            )}

            <Button 
              onClick={step < 3 ? nextStep : handleSubmit}
              disabled={loading || (step === 2 && loadingCatalog)}
              className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Procesando...
                </div>
              ) : step < 3 ? "Continuar" : "Confirmar Reserva"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

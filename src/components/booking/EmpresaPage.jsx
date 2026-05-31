import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, DollarSign, User, Mail, Phone, CalendarDays, CheckCircle2, ChevronRight } from 'lucide-react'
import { publicBookingApi } from '../../services/publicBookingService'
import { getEmpresaIcono } from '../admin/PerfilPanel'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const PASOS = ['Servicio', 'Profesional', 'Fecha y hora', 'Tus datos']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {PASOS.map((paso, i) => (
        <div key={paso} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${i < current  ? 'bg-blue-600 text-white'
              : i === current ? 'bg-blue-600 text-white ring-4 ring-blue-100'
              : 'bg-gray-100 text-gray-400'}`}>
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block
              ${i === current ? 'text-blue-600' : 'text-gray-400'}`}>
              {paso}
            </span>
          </div>
          {i < PASOS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all
              ${i < current ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function EmpresaPage() {
  const { id } = useParams()
  const [empresa, setEmpresa]       = useState(null)
  const [servicios, setServicios]   = useState([])
  const [activos, setActivos]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [paso, setPaso]             = useState(0)
  const [confirmado, setConfirmado] = useState(false)
  const [enviando, setEnviando]     = useState(false)

  const [sel, setSel] = useState({
    servicio: null,
    activo:   null,
    fecha:    '',
    hora:     '',
    nombre:   '',
    email:    '',
    telefono: '',
  })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      publicBookingApi.listarEmpresas(),
      publicBookingApi.listarServiciosPublic(id),
      publicBookingApi.listarActivosPublic(id),
    ]).then(([empresas, svcs, acts]) => {
      const emp = empresas.find(e => e.empresaId === id || String(e.empresaId) === id)
      setEmpresa(emp ?? { nombre: 'Empresa', empresaId: id })
      setServicios(svcs)
      setActivos(acts)
    }).catch(() => setError('Error al cargar información'))
    .finally(() => setLoading(false))
  }, [id])

  async function confirmarReserva() {
    setEnviando(true)
    try {
      const fechaHora = `${sel.fecha}T${sel.hora}:00`
      await publicBookingApi.crearReserva({
        serviceOfferingId: sel.servicio?.id,
        assetId:           sel.activo?.id,
        customerName:      sel.nombre,
        customerEmail:     sel.email,
        customerPhone:     sel.telefono || undefined,
        startTime:         fechaHora,
      })
      setConfirmado(true)
    } catch {
      setError('No se pudo crear la reserva. Por favor intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const icono = getEmpresaIcono(id, empresa?.tipoNegocio)

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    </div>
  )

  if (confirmado) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva confirmada!</h2>
        <p className="text-gray-500 mb-2">
          Te hemos enviado un correo de confirmación a <strong>{sel.email}</strong>.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 text-left text-sm space-y-2 my-6">
          <div className="flex justify-between"><span className="text-gray-400">Servicio</span><span className="font-medium">{sel.servicio?.nombreServicio}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Profesional</span><span className="font-medium">{sel.activo?.nombreActivo || sel.activo?.nombre}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Fecha</span><span className="font-medium">{sel.fecha} {sel.hora}</span></div>
        </div>
        <Link to="/" className="block">
          <Button className="w-full">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icono}</span>
            <div>
              <p className="font-bold text-slate-900 text-sm">{empresa?.nombre}</p>
              {empresa?.tipoNegocio && (
                <p className="text-xs text-slate-400">{empresa.tipoNegocio}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        <StepIndicator current={paso} />

        {/* Paso 0 — Elegir servicio */}
        {paso === 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 mb-4">¿Qué servicio necesitas?</h2>
            {servicios.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400">
                No hay servicios disponibles en este momento.
              </div>
            ) : servicios.map(s => (
              <button key={s.id}
                onClick={() => { setSel(p => ({ ...p, servicio: s })); setPaso(1) }}
                className="w-full bg-white rounded-xl border border-slate-100 shadow-sm p-5
                           hover:border-blue-200 hover:shadow-md transition-all text-left group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-blue-700">{s.nombreServicio}</p>
                    {s.descripcion && <p className="text-sm text-slate-400 mt-0.5">{s.descripcion}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.duracionMinutos} min</span>
                      {s.precio > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />${Number(s.precio).toLocaleString('es-CL')}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Paso 1 — Elegir profesional/activo */}
        {paso === 1 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 mb-4">¿Con quién o en qué espacio?</h2>
            {activos.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400">
                No hay recursos disponibles.
              </div>
            ) : activos.map(a => (
              <button key={a.id}
                onClick={() => { setSel(p => ({ ...p, activo: a })); setPaso(2) }}
                className="w-full bg-white rounded-xl border border-slate-100 shadow-sm p-5
                           hover:border-blue-200 hover:shadow-md transition-all text-left group flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-blue-700">
                    {a.nombreActivo || a.nombre}
                  </p>
                  {a.tipoActivo && <p className="text-sm text-slate-400">{a.tipoActivo}</p>}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition" />
              </button>
            ))}
            <button onClick={() => setPaso(0)} className="text-sm text-slate-400 hover:text-slate-600 mt-2">
              ← Cambiar servicio
            </button>
          </div>
        )}

        {/* Paso 2 — Fecha y hora */}
        {paso === 2 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">¿Cuándo quieres tu cita?</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <CalendarDays className="inline w-4 h-4 mr-1" /> Fecha
                </label>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={sel.fecha}
                  onChange={e => setSel(p => ({ ...p, fecha: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Clock className="inline w-4 h-4 mr-1" /> Hora
                </label>
                <Input
                  type="time"
                  value={sel.hora}
                  onChange={e => setSel(p => ({ ...p, hora: e.target.value }))}
                />
              </div>

              {/* Resumen */}
              {sel.servicio && (
                <div className="bg-blue-50 rounded-xl p-4 text-sm space-y-1.5 mt-2">
                  <p className="font-semibold text-blue-900">Resumen</p>
                  <p className="text-blue-700">📋 {sel.servicio.nombreServicio}</p>
                  <p className="text-blue-700">👤 {sel.activo?.nombreActivo || sel.activo?.nombre}</p>
                  {sel.servicio.duracionMinutos && (
                    <p className="text-blue-600">⏱ Duración: {sel.servicio.duracionMinutos} min</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                disabled={!sel.fecha || !sel.hora}
                onClick={() => setPaso(3)}
              >
                Continuar
              </Button>
              <Button variant="ghost" onClick={() => setPaso(1)}>← Atrás</Button>
            </div>
          </div>
        )}

        {/* Paso 3 — Datos del cliente */}
        {paso === 3 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Tus datos de contacto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <User className="inline w-4 h-4 mr-1" /> Nombre completo *
                </label>
                <Input
                  placeholder="Juan Pérez"
                  value={sel.nombre}
                  onChange={e => setSel(p => ({ ...p, nombre: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Mail className="inline w-4 h-4 mr-1" /> Email *
                </label>
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  value={sel.email}
                  onChange={e => setSel(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Phone className="inline w-4 h-4 mr-1" /> Teléfono (opcional)
                </label>
                <Input
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={sel.telefono}
                  onChange={e => setSel(p => ({ ...p, telefono: e.target.value }))}
                />
              </div>

              {/* Resumen final */}
              <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2 border border-slate-100">
                <p className="font-semibold text-slate-700 mb-2">Resumen de tu reserva</p>
                <div className="flex justify-between"><span className="text-slate-400">Servicio</span><span className="font-medium">{sel.servicio?.nombreServicio}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Con</span><span className="font-medium">{sel.activo?.nombreActivo || sel.activo?.nombre}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Fecha</span><span className="font-medium">{sel.fecha}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Hora</span><span className="font-medium">{sel.hora}</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                disabled={!sel.nombre || !sel.email || enviando}
                onClick={confirmarReserva}
              >
                {enviando ? 'Confirmando...' : 'Confirmar reserva'}
              </Button>
              <Button variant="ghost" onClick={() => setPaso(2)}>← Atrás</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

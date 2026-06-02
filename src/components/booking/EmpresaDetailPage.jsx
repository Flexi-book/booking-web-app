import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Clock, ChevronRight, MapPin,
  Phone, CalendarCheck, Star, Search,
  SlidersHorizontal, Wifi, Car, Coffee, Share2, Heart, Building2, Mail, Globe
} from 'lucide-react'
import { publicBookingApi } from '../../services/publicBookingService'
import { getEmpresaIcono } from '../admin/PerfilPanel'
import { cn } from '@/lib/utils'
import Footer from '../layout/Footer'
import MapEmbed from '../ui/MapEmbed'
import { serializarHorario, parsearHorario } from '../ui/HorarioPicker'

function getLogoUrl(empresa) {
  return empresa?.logoUrl || empresa?.logo_url || ''
}

function formatCLP(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function calcularResumenResenas(resenas) {
  if (!Array.isArray(resenas) || resenas.length === 0) {
    return { ratingPromedio: 0, totalResenas: 0 }
  }
  const total = resenas.length
  const suma = resenas.reduce((acc, item) => acc + Number(item?.puntuacion || 0), 0)
  return {
    ratingPromedio: suma / total,
    totalResenas: total,
  }
}


function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-56 bg-gray-200" />
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-5 lg:gap-8">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-100 rounded-full w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl" />)}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Service Card ────────────────────────────────────────────────────── */
function ServiceCard({ s, empresaId, popular }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm
                    hover:shadow-md hover:border-blue-100 transition-all duration-200 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{s.nombreServicio}</h3>
        {popular && (
          <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider
                           bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Popular
          </span>
        )}
      </div>
      {s.descripcion && (
        <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2 flex-1">
          {s.descripcion}
        </p>
      )}
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
          <Clock className="w-3 h-3" /> {s.duracionMinutos} min
        </span>
        {s.precio > 0 && (
          <span className="text-sm font-bold text-gray-800">
            {formatCLP(s.precio)}
          </span>
        )}
      </div>
      <Link
        to={`/empresa/${empresaId}/reservar`}
        className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs
                   font-semibold py-2.5 rounded-xl transition-all duration-200
                   hover:shadow-md hover:shadow-blue-200 mt-auto">
        Reservar
      </Link>
    </div>
  )
}

/* ── MAIN ────────────────────────────────────────────────────────────── */
export default function EmpresaDetailPage() {
  const { id } = useParams()
  const [empresa, setEmpresa]     = useState(null)
  const [servicios, setServicios] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [busqueda, setBusqueda]   = useState('')
  const [resenas, setResenas] = useState([])
  const [nuevaResena, setNuevaResena] = useState({ nombreCliente: '', comentario: '', puntuacion: 5 })
  const [enviandoResena, setEnviandoResena] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    publicBookingApi.obtenerCatalogoEmpresa(id)
      .then(({ empresa: emp, servicios: svcs }) => {
        if (cancelled) return
        setEmpresa(emp)
        setServicios(Array.isArray(svcs) ? svcs : [])
      })
      .catch(() => {
        if (!cancelled) setError('No pudimos cargar esta empresa.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    publicBookingApi.listarResenasEmpresa(id)
      .then((reviews) => {
        if (!cancelled) setResenas(Array.isArray(reviews) ? reviews : [])
      })
      .catch(() => {
        if (!cancelled) setResenas([])
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const icono  = getEmpresaIcono(id, empresa?.tipoNegocio)
  const logoUrl = getLogoUrl(empresa)

  const descripcionFinal = empresa?.descripcion || null
  const direccionFinal   = empresa?.direccion || null
  const horarioFinal     = empresa?.horario
    ? serializarHorario(parsearHorario(empresa.horario))
    : null
  const amenidadesFinal  = []
  try {
    if (empresa?.amenidades) {
      const parsed = JSON.parse(empresa.amenidades)
      if (Array.isArray(parsed)) amenidadesFinal.push(...parsed)
    }
  } catch (e) { /* ignore */ }

  const AMENIDADES_MAP = {
    wifi:      { label: 'Wi-Fi gratis',       icon: Wifi },
    parking:   { label: 'Aparcamiento',       icon: Car },
    ac:        { label: 'Aire acondicionado', icon: Coffee },
    cafe:      { label: 'Café / bebidas',     icon: Coffee },
    gym:       { label: 'Zona de ejercicio',  icon: Coffee },
    accesible: { label: 'Acceso especial',    icon: Car },
  }

  const serviciosFiltrados = busqueda.trim()
    ? servicios.filter(s => s.nombreServicio.toLowerCase().includes(busqueda.toLowerCase()))
    : servicios

  const resumenResenas = calcularResumenResenas(resenas)
  const ratingPromedio = Number(empresa?.ratingPromedio ?? resumenResenas.ratingPromedio ?? 0)
  const totalResenas = Number(empresa?.totalResenas ?? resumenResenas.totalResenas ?? 0)

  async function enviarResena(e) {
    e.preventDefault()
    if (!nuevaResena.nombreCliente.trim() || !nuevaResena.comentario.trim()) return
    setEnviandoResena(true)
    try {
      await publicBookingApi.crearResenaEmpresa(id, {
        nombreCliente: nuevaResena.nombreCliente.trim(),
        comentario: nuevaResena.comentario.trim(),
        puntuacion: Number(nuevaResena.puntuacion),
      })
      const updated = await publicBookingApi.listarResenasEmpresa(id)
      setResenas(updated)
      setNuevaResena({ nombreCliente: '', comentario: '', puntuacion: 5 })
      const refreshed = await publicBookingApi.obtenerCatalogoEmpresa(id).catch(() => null)
      if (refreshed?.empresa) setEmpresa((prev) => ({ ...prev, ...refreshed.empresa }))
    } catch {
      setError('No se pudo enviar la reseña. Intenta nuevamente.')
    } finally {
      setEnviandoResena(false)
    }
  }

  if (loading) return <Skeleton />

  if (error || !empresa) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <p className="text-gray-400">{error || 'Empresa no encontrada'}</p>
      <Link to="/" className="text-blue-600 text-sm font-semibold hover:underline">← Volver al inicio</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img src="/flexibook-logo.svg" alt="Flexibook" className="w-6 h-6 object-contain" />
          <span className="text-sm font-semibold text-gray-700">Flexibook</span>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <div className="relative h-56 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 overflow-hidden">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`Logo de ${empresa.nombre}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Fondo decorativo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 overflow-hidden">
          <span className="text-[100px] sm:text-[180px] select-none">{icono}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Nombre y categoría sobre el hero */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              {empresa.tipoNegocio && (
                <span className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-1 block">
                  {empresa.tipoNegocio}
                </span>
              )}
              <h1 className="text-3xl font-bold text-white drop-shadow-sm">{empresa.nombre}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={cn('w-3.5 h-3.5', i <= Math.round(ratingPromedio) ? 'text-yellow-400 fill-yellow-400' : 'text-white/40')} />
                  ))}
                </div>
                <span className="text-white/70 text-xs">
                  {totalResenas > 0 ? `${ratingPromedio.toFixed(1)} (${totalResenas} reseñas)` : 'Sin reseñas aún'}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 text-2xl">{icono}</div>
          </div>
        </div>
      </div>

      {/* ── BODY: 2 columnas ───────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-5 lg:gap-8">

        {/* ── SIDEBAR ────────────────────────────────────────────── */}
        <aside className="space-y-5">

          {/* Info de contacto */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Información de contacto
            </h3>
            <div className="space-y-3">
              {direccionFinal ? (
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">{direccionFinal}</span>
                </div>
              ) : null}

              {horarioFinal ? (
                <div className="flex items-start gap-3 text-gray-600">
                  <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">{horarioFinal}</span>
                </div>
              ) : null}

              {empresa.correoContacto && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs">{empresa.correoContacto}</span>
                </div>
              )}

              {!direccionFinal && !horarioFinal && !empresa.correoContacto && (
                <p className="text-xs text-gray-400 italic">
                  El negocio aún no ha completado su información de contacto.
                </p>
              )}
            </div>
          </div>

          {/* Mapa OpenStreetMap — sin librería React */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <MapEmbed
              direccion={direccionFinal}
              position={empresa.latitud && empresa.longitud
                ? { lat: empresa.latitud, lng: empresa.longitud }
                : null}
              readOnly
            />
          </div>

          {/* Amenidades configuradas */}
          {amenidadesFinal.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Servicios destacados
              </h3>
              <div className="flex flex-wrap gap-2">
                {amenidadesFinal.map(id => {
                  const a = AMENIDADES_MAP[id]
                  if (!a) return null
                  const Icon = a.icon
                  return (
                    <span key={id}
                      className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50
                                 border border-gray-100 px-2.5 py-1.5 rounded-lg">
                      <Icon className="w-3 h-3 text-blue-500" />
                      {a.label}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* CTA móvil eliminado por petición del usuario */}
        </aside>

        {/* ── CATÁLOGO ───────────────────────────────────────────── */}
        <section>
          {/* Header del catálogo */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Catálogo de Servicios
              {servicios.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">· {serviciosFiltrados.length}</span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {/* Mini buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar servicio..."
                  className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl
                             bg-white focus:outline-none focus:border-blue-400 focus:ring-2
                             focus:ring-blue-500/10 w-32 sm:w-44 transition-all"
                />
              </div>
              <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Descripción */}
          {descripcionFinal && (
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{descripcionFinal}</p>
          )}

          {/* Grid de servicios */}
          {servicios.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="text-5xl mb-4">🚧</div>
              <p className="font-medium text-gray-500">Sin servicios configurados</p>
              <p className="text-sm text-gray-400 mt-1">Este negocio aún no ha cargado sus servicios.</p>
            </div>
          ) : serviciosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-400 text-sm">No se encontraron servicios para "{busqueda}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {serviciosFiltrados.map((s, i) => (
                <ServiceCard
                  key={s.id}
                  s={s}
                  empresaId={id}
                  popular={i === 0}
                />
              ))}
            </div>
          )}

          {/* CTA desktop eliminado por petición del usuario */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Reseñas</h3>
            <form onSubmit={enviarResena} className="space-y-3 mb-5">
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                placeholder="Tu nombre"
                value={nuevaResena.nombreCliente}
                onChange={(e) => setNuevaResena((p) => ({ ...p, nombreCliente: e.target.value }))}
                required
              />
              <textarea
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm min-h-[90px]"
                placeholder="Escribe tu reseña"
                value={nuevaResena.comentario}
                onChange={(e) => setNuevaResena((p) => ({ ...p, comentario: e.target.value }))}
                required
              />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setNuevaResena((p) => ({ ...p, puntuacion: v }))}
                      className={`text-2xl transition-colors ${v <= nuevaResena.puntuacion ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={enviandoResena}
                  className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60"
                >
                  {enviandoResena ? 'Enviando...' : 'Enviar reseña'}
                </button>
              </div>
            </form>
            <div className="space-y-3">
              {resenas.length === 0 ? (
                <p className="text-sm text-gray-400">Todavía no hay reseñas.</p>
              ) : (
                resenas.slice(0, 20).map((r) => (
                  <div key={r.resenaId} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">{r.nombreCliente}</p>
                      <p className="text-xs text-yellow-600 font-semibold">{'★'.repeat(r.puntuacion)}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{r.comentario}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}

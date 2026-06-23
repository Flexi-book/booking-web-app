import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, ArrowRight, SlidersHorizontal, X, Star, MapPin, Clock, Building2 } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from '@/lib/utils'
import { publicBookingApi } from '../../services/publicBookingService'
import { getEmpresaIcono } from '../admin/PerfilPanel'
import Footer from '../layout/Footer'
import ThemeToggle from '../ui/ThemeToggle'
import LogoMark from '../ui/LogoMark'

const TIPOS_FILTRO = [
  'Todos', 'Barbería', 'Peluquería', 'Spa', 'Fitness',
  'Centro Médico', 'Salón de belleza', 'Petshop', 'Otro'
]

const CATEGORIA_KEYWORDS = {
  'Barbería': ['barberia', 'barbería', 'barber', 'barber shop'],
  'Peluquería': ['peluqueria', 'peluquería', 'hair', 'cabello'],
  'Spa': ['spa', 'masaje', 'wellness', 'relajacion', 'relajación'],
  'Fitness': ['fitness', 'gym', 'gimnasio', 'deporte', 'deportivo', 'cancha', 'futbol', 'fútbol', 'entrenamiento'],
  'Centro Médico': ['medico', 'médico', 'medicina', 'clinica', 'clínica', 'salud', 'odontologia', 'odontología'],
  'Salón de belleza': ['salon de belleza', 'salón de belleza', 'belleza', 'manicure', 'pedicure', 'estetica', 'estética'],
  'Petshop': ['petshop', 'pet shop', 'mascota', 'veterinaria', 'veterinario', 'pet'],
}

function normalizeText(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function matchesTipoFiltro(empresa, filtro) {
  if (filtro === 'Todos') return true

  const selected = normalizeText(filtro)
  const tipo = normalizeText(empresa?.tipoNegocio)
  const nombre = normalizeText(empresa?.nombre)
  const descripcion = normalizeText(empresa?.descripcion)
  const haystack = `${tipo} ${nombre} ${descripcion}`.trim()

  if (!haystack) return filtro === 'Otro'

  const keywords = CATEGORIA_KEYWORDS[filtro] || []
  const hasKeywordMatch = keywords.some((keyword) => haystack.includes(normalizeText(keyword)))
  if (hasKeywordMatch) return true

  if (tipo === selected) return true
  if (tipo.includes(selected)) return true

  if (filtro === 'Otro') {
    const knownKeywords = Object.values(CATEGORIA_KEYWORDS).flat().map(normalizeText)
    return !knownKeywords.some((keyword) => haystack.includes(keyword))
  }

  return false
}

function getLogoUrl(empresa) {
  const remoteLogo = empresa?.logoUrl || empresa?.logo_url || ''
  if (remoteLogo) return remoteLogo
  const id = empresa?.empresaId
  if (!id) return ''
  try {
    return localStorage.getItem(`flexibook_logo_url_${id}`) || ''
  } catch {
    return ''
  }
}

/* ── Skeleton ────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse dark:border-slate-800 dark:bg-slate-900">
      <div className="h-28 bg-gray-50 dark:bg-slate-900" />
      <div className="p-4 space-y-2">
        <div className="h-2 bg-gray-100 rounded-full w-1/4 dark:bg-slate-800" />
        <div className="h-4 bg-gray-100 rounded-full w-2/3 dark:bg-slate-800" />
        <div className="h-2 bg-gray-100 rounded-full w-full dark:bg-slate-800" />
        <div className="h-2 bg-gray-100 rounded-full w-3/4 dark:bg-slate-800" />
      </div>
    </div>
  )
}

/* ── Card grande para carrusel ───────────────────────────────────────── */
function HeroCard({ empresa }) {
  const icono = getEmpresaIcono(empresa.empresaId, empresa.tipoNegocio)
  const descripcion = empresa.descripcion || null
  const logoUrl = getLogoUrl(empresa)

  return (
    <Link to={`/empresa/${empresa.empresaId}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl
                 transition-all duration-300 hover:-translate-y-1 border border-gray-100
                 dark:bg-slate-900 dark:border-slate-800">
      <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-50/60
                      flex items-center justify-center overflow-hidden relative
                      dark:from-slate-800 dark:to-slate-900">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`Logo de ${empresa.nombre}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-7xl select-none group-hover:scale-105 transition-transform duration-300 drop-shadow-sm">
            {icono}
          </span>
        )}
        {empresa.tipoNegocio && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full
                           bg-white/90 text-blue-700 border border-blue-100 shadow-sm
                           dark:bg-slate-950/90 dark:text-blue-300 dark:border-slate-700">
            {empresa.tipoNegocio}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5 dark:text-slate-100">
          {empresa.nombre}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed dark:text-slate-400">
          {descripcion ?? 'Reserva tu hora de forma rápida y sin crear cuenta.'}
        </p>
        <span className="flex items-center gap-1 text-sm font-medium text-blue-600
                         group-hover:gap-2 transition-all duration-200">
          Reservar hora <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  )
}

/* ── Card estilo foto para grid ──────────────────────────────────────── */
function GridCard({ empresa, index }) {
  const icono = getEmpresaIcono(empresa.empresaId, empresa.tipoNegocio)
  const logoUrl = getLogoUrl(empresa)
  const rating = Number(empresa?.ratingPromedio || 0).toFixed(1)
  const totalResenas = Number(empresa?.totalResenas || 0)

  return (
    <div
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms`, animationFillMode: 'both' }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl
                 transition-all duration-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2
                 dark:bg-slate-900 dark:shadow-black/20">

      {/* Foto / Imagen de la empresa */}
      <div className="relative h-44 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100
                      flex items-center justify-center overflow-hidden dark:from-slate-800 dark:via-slate-900 dark:to-slate-950">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`Logo de ${empresa.nombre}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <span className="text-7xl select-none group-hover:scale-110 transition-transform duration-500 drop-shadow-md">
            {icono}
          </span>
        )}

        {/* Rating badge */}
        {totalResenas > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm
                          px-2 py-1 rounded-full shadow-sm text-xs font-bold text-gray-800
                          dark:bg-slate-950/95 dark:text-slate-100">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {rating}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {empresa.tipoNegocio && (
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 dark:text-blue-300">
            {empresa.tipoNegocio}
          </p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1.5 dark:text-slate-100">
          {empresa.nombre}
        </h3>

        {/* Dirección / contacto */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3 dark:text-slate-400">
          <MapPin className="w-3 h-3 flex-shrink-0 text-gray-300 dark:text-slate-500" />
          <span className="truncate">
            {empresa.correoContacto ?? 'Disponible online'}
          </span>
        </div>

        {/* Botón Ver */}
        <Link
          to={`/empresa/${empresa.empresaId}`}
          className="block text-center text-sm font-semibold text-blue-600 bg-blue-50
                     border border-blue-100 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white
                     hover:border-blue-600 transition-all duration-200
                     dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 dark:hover:bg-blue-500 dark:hover:text-white">
          Ver agenda
        </Link>
      </div>
    </div>
  )
}

/* ── MAIN ────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [empresas, setEmpresas]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [busqueda, setBusqueda]     = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('Todos')
  const [orden, setOrden]           = useState('az')
  const [slideActual, setSlideActual] = useState(0)

  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }))
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [autoplay.current])

  const onSelect = useCallback(() => {
    if (emblaApi) setSlideActual(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  useEffect(() => {
    const freshCache = publicBookingApi.getCachedEmpresas?.()
    const staleCache = publicBookingApi.getCachedEmpresasStale?.()
    const instantData = (Array.isArray(freshCache) && freshCache.length > 0)
      ? freshCache
      : staleCache

    if (Array.isArray(instantData) && instantData.length > 0) {
      setEmpresas(instantData)
      setLoading(false)
    }

    publicBookingApi.listarEmpresas()
      .then(d => setEmpresas(Array.isArray(d) ? d : []))
      .catch(() => setError('No se pudieron cargar las empresas.'))
      .finally(() => {
        // Evita mostrar skeleton si ya renderizamos desde caché.
        setLoading(false)
      })
  }, [])

  const carrusel = useMemo(() => empresas.slice(0, 6), [empresas])

  const filtradas = useMemo(() => {
    let lista = [...empresas]
    if (busqueda.trim()) {
      const q = normalizeText(busqueda)
      lista = lista.filter(e =>
        normalizeText(`${e.nombre} ${e.tipoNegocio ?? ''} ${e.descripcion ?? ''}`).includes(q)
      )
    }
    if (tipoFiltro !== 'Todos') {
      lista = lista.filter((empresa) => matchesTipoFiltro(empresa, tipoFiltro))
    }
    return lista.sort((a, b) =>
      orden === 'az'
        ? a.nombre.localeCompare(b.nombre, 'es')
        : b.nombre.localeCompare(a.nombre, 'es')
    )
  }, [empresas, busqueda, tipoFiltro, orden])

  const hayFiltros = busqueda.trim() || tipoFiltro !== 'Todos'
  const limpiar   = () => { setBusqueda(''); setTipoFiltro('Todos') }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark className="w-8 h-8" />
            <span className="text-lg font-bold text-gray-900 dark:text-slate-100">Flexibook</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login"
              className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold
                         px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-sm">
              Ingreso empresa <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-white py-16 px-5 border-b border-gray-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:border-slate-800">
        <div className="max-w-3xl mx-auto text-center">

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4 tracking-tight dark:text-slate-100">
            Reserva tu hora<br />
            <span className="text-blue-600">en segundos</span>
          </h1>

          <p className="text-base text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed dark:text-slate-300">
            Descubre{' '}
            <span className="text-pink-500 font-semibold">peluquerías</span>,{' '}
            <span className="text-blue-500 font-semibold">centros médicos</span>,{' '}
            <span className="text-emerald-500 font-semibold">gimnasios</span>,{' '}
            <span className="text-purple-500 font-semibold">spas</span>{' '}
            y mucho más — agenda sin crear cuenta y recibe confirmación al instante.
          </p>

          {/* Buscador con dropdown instantáneo */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10 dark:text-slate-500" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Busca barbería, spa, fitness, médico..."
              className="w-full h-16 pl-14 pr-14 text-base bg-white rounded-2xl border border-gray-200
                         shadow-lg focus:shadow-xl focus:border-blue-500 focus:outline-none
                         focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400
                         text-gray-800 transition-all
                         dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100
                         dark:placeholder:text-slate-500 dark:shadow-black/20 dark:focus:bg-slate-900"
            />
            {busqueda && (
              <button onClick={limpiar}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full z-10
                           text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all
                           dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown de resultados instantáneos */}
            {busqueda.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl
                              shadow-2xl border border-gray-100 overflow-hidden z-50
                              max-h-[60vh] overflow-y-auto
                              animate-in fade-in slide-in-from-top-2 duration-200
                              dark:bg-slate-900 dark:border-slate-700">
                {filtradas.length === 0 ? (
                  <div className="px-5 py-6 text-center text-gray-400 text-sm dark:text-slate-400">
                    <div className="text-3xl mb-2">🔍</div>
                    No encontramos "<strong className="text-gray-600 dark:text-slate-200">{busqueda}</strong>"
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between dark:bg-slate-800 dark:border-slate-700">
                      <p className="text-xs text-gray-500 font-medium dark:text-slate-400">
                        {filtradas.length} {filtradas.length === 1 ? 'resultado' : 'resultados'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">↵ para ver todos</p>
                    </div>
                    {filtradas.slice(0, 5).map(e => {
                      const icono = getEmpresaIcono(e.empresaId, e.tipoNegocio)
                      return (
                        <Link
                          key={e.empresaId}
                          to={`/empresa/${e.empresaId}`}
                          onClick={limpiar}
                          className="flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50
                                     transition-colors group border-b border-gray-50 last:border-0
                                     dark:hover:bg-slate-800 dark:border-slate-800">
                          <span className="text-2xl flex-shrink-0">{icono}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 truncate dark:text-slate-100">
                              {e.nombre}
                            </p>
                            {e.tipoNegocio && (
                              <p className="text-xs text-gray-400 dark:text-slate-400">{e.tipoNegocio}</p>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors dark:text-slate-500 dark:group-hover:text-blue-400" />
                        </Link>
                      )
                    })}
                    {filtradas.length > 5 && (
                      <div className="px-5 py-3 bg-gray-50 text-center dark:bg-slate-800">
                        <p className="text-xs text-blue-600 font-semibold dark:text-blue-300">
                          +{filtradas.length - 5} más en el directorio ↓
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {!loading && empresas.length > 0 && !busqueda && (
            <p className="text-xs text-gray-400 mt-4 dark:text-slate-400">
              <span className="font-semibold text-gray-600 dark:text-slate-200">{empresas.length}</span> negocios disponibles
            </p>
          )}
        </div>
      </section>

      {/* ── CARRUSEL ───────────────────────────────────────────────── */}
      {!loading && carrusel.length > 0 && (
        <section className="py-12 px-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Destacados</h2>
                <p className="text-sm text-gray-400 dark:text-slate-400">Desliza para explorar</p>
              </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {carrusel.map(e => (
                  <div key={e.empresaId} className="flex-none w-[85%] sm:w-[45%] lg:w-[30%]">
                    <HeroCard empresa={e} />
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {carrusel.map((_, i) => (
                <button key={i} onClick={() => emblaApi?.scrollTo(i)}
                  className={cn('rounded-full transition-all duration-300',
                    i === slideActual ? 'w-5 h-1.5 bg-blue-600 dark:bg-blue-400' : 'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600'
                  )} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── DIRECTORIO ─────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 pb-12">

        {/* Filtros */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                Directorio
                {!loading && (
                  <span className="ml-2 text-sm font-normal text-gray-400 dark:text-slate-400">
                    · {filtradas.length} {filtradas.length === 1 ? 'negocio' : 'negocios'}
                  </span>
                )}
              </h2>
              {hayFiltros && (
                <button onClick={limpiar} className="text-xs text-blue-600 hover:underline mt-0.5 dark:text-blue-300">
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
              <SlidersHorizontal className="w-4 h-4" />
              <select value={orden} onChange={e => setOrden(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700
                           text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition
                           dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
            </div>
          </div>

          {/* Chips de tipo */}
          <div className="flex flex-wrap gap-2">
            {TIPOS_FILTRO.map(tipo => (
              <button key={tipo} onClick={() => setTipoFiltro(tipo)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                  tipoFiltro === tipo
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:border-blue-400 dark:hover:text-blue-300'
                )}>
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-600 font-medium mb-1 dark:text-slate-200">Sin resultados</p>
            <p className="text-gray-400 text-sm mb-5 dark:text-slate-400">Prueba con otro término o categoría</p>
            <button onClick={limpiar}
              className="text-sm text-blue-600 font-medium hover:underline dark:text-blue-300">
              Limpiar filtros
            </button>
          </div>
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtradas.map((empresa) => (
              <Link
                key={empresa.empresaId}
                to={`/empresa/${empresa.empresaId}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm
                           hover:shadow-lg hover:border-blue-100 transition-all duration-200 overflow-hidden
                           dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 dark:shadow-black/20"
              >
                {/* Banner con icono elegido */}
                <div className="w-full h-32 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100
                                flex items-center justify-center text-6xl select-none
                                dark:from-slate-800 dark:via-slate-900 dark:to-slate-950">
                  {getLogoUrl(empresa) ? (
                    <img
                      src={getLogoUrl(empresa)}
                      alt={`Logo de ${empresa.nombre}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getEmpresaIcono(empresa.empresaId, empresa.tipoNegocio)
                  )}
                </div>

                <div className="p-5">
                  {/* Tipo badge */}
                  {empresa.tipoNegocio && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold
                                     bg-blue-50 text-blue-600 border border-blue-100 mb-3
                                     dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">
                      {empresa.tipoNegocio}
                    </span>
                  )}

                  {/* Nombre */}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors dark:text-slate-100">
                    {empresa.nombre}
                  </h3>

                  {/* Descripción o fallback */}
                  <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 min-h-[40px] dark:text-slate-400">
                    {empresa.descripcion || 'Reserva tu hora de forma rápida y sencilla.'}
                  </p>

                  {/* CTA */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-600 group-hover:underline dark:text-blue-300">
                      Reservar hora →
                    </span>
                    {Number(empresa.totalResenas || 0) > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold dark:text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {Number(empresa.ratingPromedio || 0).toFixed(1)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        Disponible
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}

          </div>
        )}
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}

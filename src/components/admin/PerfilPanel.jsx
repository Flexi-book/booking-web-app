import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import MapEmbed from '../ui/MapEmbed'
import HorarioPicker from '../ui/HorarioPicker'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../ui/PageHeader'
import { CheckCircle2, MapPin, Clock, Wifi, Car, Wind, Coffee, Dumbbell, ParkingCircle, X, Navigation, Upload, Image as ImageIcon, CalendarDays } from 'lucide-react'
import { empresaApi, reservasApi } from '../../services/gestionService'
import { companyProfileApi } from '../../services/companyProfileService'
import { Calendar } from '../ui/calendar'

/* ──────────────────────────────────────────────────────────────────────
   ICONOS DISPONIBLES
   ────────────────────────────────────────────────────────────────────── */
const ICONOS = [
  { emoji: '✂️', label: 'Barbería' },
  { emoji: '💇', label: 'Peluquería' },
  { emoji: '💆', label: 'Spa' },
  { emoji: '🏋️', label: 'Fitness' },
  { emoji: '🏥', label: 'Médico' },
  { emoji: '💅', label: 'Belleza' },
  { emoji: '⚽', label: 'Deportes' },
  { emoji: '🐾', label: 'Mascotas' },
  { emoji: '🍕', label: 'Restaurante' },
  { emoji: '🎨', label: 'Arte' },
  { emoji: '🔧', label: 'Técnico' },
  { emoji: '📚', label: 'Educación' },
  { emoji: '🌿', label: 'Bienestar' },
  { emoji: '🎵', label: 'Música' },
  { emoji: '📷', label: 'Fotografía' },
  { emoji: '🏢', label: 'Empresa' },
  { emoji: '🧴', label: 'Estética' },
  { emoji: '🐕', label: 'Veterinaria' },
  { emoji: '🚗', label: 'Automotriz' },
  { emoji: '🍽️', label: 'Gastronomía' },
]

const AMENIDADES_OPTS = [
  { id: 'wifi',           icon: Wifi,          label: 'Wi-Fi gratis' },
  { id: 'parking',        icon: ParkingCircle, label: 'Aparcamiento' },
  { id: 'ac',             icon: Wind,          label: 'Aire acondicionado' },
  { id: 'cafe',           icon: Coffee,        label: 'Café / bebidas' },
  { id: 'gym',            icon: Dumbbell,      label: 'Zona de ejercicio' },
  { id: 'accesible',      icon: Car,           label: 'Acceso especial' },
]

const ATENCION_OPTS = [
  { id: 'presencial', label: 'Presencial' },
  { id: 'online', label: 'Online' },
  { id: 'ambos', label: 'Ambos' },
]

/* ──────────────────────────────────────────────────────────────────────
   STORAGE HELPERS FOR LEGACY COMPONENTS
   ────────────────────────────────────────────────────────────────────── */
function getKey(companyId, campo) {
  return `flexibook_${campo}_${companyId}`
}

function getLogoKey(companyId) {
  return `flexibook_logo_url_${companyId}`
}

export function getEmpresaIcono(companyId, tipoNegocio) {
  if (companyId) {
    const stored = localStorage.getItem(getKey(companyId, 'icono'))
    if (stored) return stored
  }
  const TIPO_MAP = {
    'barbería': '✂️', 'peluquería': '💇', 'spa': '💆',
    'fitness': '🏋️', 'centro médico': '🏥', 'salón de belleza': '💅',
    'cancha deportiva': '⚽', 'sala de reuniones': '🏢', 'petshop': '🐾',
  }
  return TIPO_MAP[tipoNegocio?.toLowerCase()] ?? '🏢'
}

export function getEmpresaPerfil(companyId) {
  const get = (campo, def) => localStorage.getItem(getKey(companyId, campo)) ?? def
  return {
    icono:       get('icono', '🏢'),
    descripcion: get('descripcion', ''),
    direccion:   get('direccion', ''),
    horario:     get('horario', ''),
    amenidades:  JSON.parse(localStorage.getItem(getKey(companyId, 'amenidades')) ?? '[]'),
  }
}

/* ──────────────────────────────────────────────────────────────────────
   FIELD HELPER
   ────────────────────────────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</label>
      {children}
    </div>
  )
}

const inputCls = `w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition
  bg-white text-slate-900 placeholder:text-slate-400
  dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500`

function normalizeSupabaseBaseUrl(rawUrl) {
  if (!rawUrl) return ''
  try {
    const parsed = new URL(rawUrl)
    return parsed.origin
  } catch {
    return rawUrl
      .replace(/\/rest\/v1\/?$/i, '')
      .replace(/\/storage\/v1\/?$/i, '')
      .replace(/\/+$/, '')
  }
}

function getReservationDate(reserva) {
  const rawDate =
    reserva?.fechaInicio ??
    reserva?.startTime ??
    reserva?.fecha_inicio ??
    reserva?.fecha ??
    null

  if (!rawDate) return null
  const date = new Date(rawDate)
  return Number.isNaN(date.getTime()) ? null : date
}

/* ──────────────────────────────────────────────────────────────────────
   MAIN
   ────────────────────────────────────────────────────────────────────── */
export default function PerfilPanel() {
  const { user, companyId, companyName, updateSessionUser } = useAuth()

  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [icono,       setIcono]       = useState('🏢')
  const [descripcion, setDescripcion] = useState('')
  const [direccion,   setDireccion]   = useState('')
  const [horario,     setHorario]     = useState('')
  const [tipoAtencion,setTipoAtencion]= useState('presencial')
  const [amenidades,  setAmenidades]  = useState([])
  const [position,    setPosition]    = useState(null)
  const [reservas,    setReservas]    = useState([])
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [loadingReservas, setLoadingReservas] = useState(false)
  const [reservasError, setReservasError] = useState('')
  
  const [guardado,    setGuardado]    = useState(false)
  const [loading,     setLoading]     = useState(true)

  const [logoUrl, setLogoUrl] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [logoError, setLogoError] = useState('')
  const storageMode = import.meta.env.VITE_STORAGE_MODE || 'local'
  const supabaseUrl = normalizeSupabaseBaseUrl(import.meta.env.VITE_SUPABASE_URL || '')
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  const logoBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'company-logos'
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
  const useLocalStorageMode =
    isLocalHost ||
    storageMode === 'local' ||
    (!supabaseUrl && !supabaseAnonKey)

  useEffect(() => {
    let active = true
    if (companyId) {
      empresaApi.obtener(companyId).then(data => {
        if (!active) return
        setNombreEmpresa(data.nombre || companyName || '')
        if (data.icono) setIcono(data.icono)
        if (data.descripcion) setDescripcion(data.descripcion)
        if (data.direccion) setDireccion(data.direccion)
        if (data.horario) setHorario(data.horario)
        if (data.tipoAtencion) setTipoAtencion(data.tipoAtencion)
        if (data.amenidades) {
          try {
            setAmenidades(JSON.parse(data.amenidades))
          } catch { setAmenidades([]) }
        }
        if (data.latitud && data.longitud) {
          setPosition({ lat: data.latitud, lng: data.longitud })
        }

        // Fallback para logo desde endpoint público de empresa.
        const publicLogo = data?.logoUrl || data?.logo_url || ''
        if (publicLogo) {
          setLogoUrl(publicLogo)
          setLogoPreview(publicLogo)
          localStorage.setItem(getLogoKey(companyId), publicLogo)
        }
      }).finally(() => { if (active) setLoading(false) })

      setLoadingReservas(true)
      setReservasError('')
      reservasApi.listar({ companyId })
        .then((data) => {
          if (!active) return
          setReservas(Array.isArray(data) ? data : [])
        })
        .catch(() => {
          if (!active) return
          setReservas([])
          setReservasError('No se pudo cargar el calendario de reservas.')
        })
        .finally(() => {
          if (active) setLoadingReservas(false)
        })

      companyProfileApi.obtenerMiEmpresa()
        .then((data) => {
          if (!active) return
          const currentLogo = data?.logoUrl || data?.logo_url || ''
          setLogoUrl(currentLogo)
          setLogoPreview(currentLogo)
          if (currentLogo && companyId) {
            localStorage.setItem(getLogoKey(companyId), currentLogo)
          }
        })
        .catch(() => {
          if (!active) return
          // Si falla /companies/me, intentamos al menos mostrar lo último persistido.
          const cachedLogo = localStorage.getItem(getLogoKey(companyId)) || ''
          if (cachedLogo) {
            setLogoUrl(cachedLogo)
            setLogoPreview(cachedLogo)
          } else {
            setLogoError('No se pudo cargar el logo actual.')
          }
        })
    } else {
      setNombreEmpresa(companyName || '')
    }
    return () => { active = false }
  }, [companyId, companyName])

  const previewNode = useMemo(() => {
    if (logoPreview) {
      return <img src={logoPreview} alt="Logo empresa" className="w-full h-full object-cover" />
    }
    return <span className="text-6xl">{icono}</span>
  }, [logoPreview, icono])

  const toggleAmenidad = (id) => {
    setAmenidades(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const reservasConFecha = useMemo(
    () => reservas
      .map((reserva) => ({ ...reserva, fechaReserva: getReservationDate(reserva) }))
      .filter((reserva) => reserva.fechaReserva),
    [reservas]
  )

  const reservasDelMes = useMemo(() => {
    const inicio = startOfMonth(calendarMonth)
    const fin = endOfMonth(calendarMonth)
    return reservasConFecha
      .filter((reserva) => reserva.fechaReserva >= inicio && reserva.fechaReserva <= fin)
      .sort((a, b) => a.fechaReserva - b.fechaReserva)
      .slice(0, 5)
  }, [calendarMonth, reservasConFecha])

  const diasConReserva = useMemo(
    () => reservasConFecha.map((reserva) => reserva.fechaReserva),
    [reservasConFecha]
  )

  async function handleUploadLogo(event) {
    const file = event.target.files?.[0]
    if (!file || !companyId) return

    setLogoError('')
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setLogoError('La imagen supera 10 MB.')
      return
    }
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setLogoError('Solo se permiten imágenes JPG o PNG.')
      return
    }

    setSubiendoLogo(true)
    try {
      let finalLogoUrl = ''

      if (useLocalStorageMode) {
        const updated = await companyProfileApi.subirLogo(file)
        finalLogoUrl = updated?.logoUrl || updated?.logo_url || ''
      } else {
        if (!supabaseUrl || !supabaseAnonKey) {
          const updated = await companyProfileApi.subirLogo(file)
          finalLogoUrl = updated?.logoUrl || updated?.logo_url || ''
        } else {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const objectPath = `empresas/${companyId}/${Date.now()}-${safeName}`
          const uploadUrl = `${supabaseUrl}/storage/v1/object/${logoBucket}/${objectPath}`

          const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
              'Content-Type': file.type,
              'x-upsert': 'true',
            },
            body: file,
          })

          if (!uploadRes.ok) {
            const body = await uploadRes.text()
            throw new Error(body || 'Error subiendo imagen')
          }

          const publicUrl = `${supabaseUrl}/storage/v1/object/public/${logoBucket}/${objectPath}`
          const updated = await companyProfileApi.actualizarLogo(publicUrl)
          await empresaApi.actualizar(companyId, { logoUrl: publicUrl, logo_url: publicUrl })
          finalLogoUrl = updated?.logoUrl || updated?.logo_url || publicUrl
        }
      }

      setLogoUrl(finalLogoUrl)
      setLogoPreview(finalLogoUrl)
      localStorage.setItem(getLogoKey(companyId), finalLogoUrl)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch (err) {
      setLogoError(`No se pudo subir el logo: ${err.message}`)
    } finally {
      setSubiendoLogo(false)
      event.target.value = ''
    }
  }

  const guardar = async () => {
    if (!companyId) return
    
    // Fallback: guardar en localStorage por si otros componentes antiguos lo leen
    const save = (campo, val) => localStorage.setItem(getKey(companyId, campo), val)
    save('icono', icono)
    save('descripcion', descripcion)
    save('direccion', direccion)
    save('horario', horario)
    localStorage.setItem(getKey(companyId, 'amenidades'), JSON.stringify(amenidades))
    
    try {
      await empresaApi.actualizar(companyId, {
        nombre: nombreEmpresa,
        descripcion,
        direccion,
        horario,
        icono,
        tipoAtencion,
        latitud: position?.lat,
        longitud: position?.lng,
        amenidades: JSON.stringify(amenidades)
      })
      updateSessionUser?.({ companyName: nombreEmpresa })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch (err) {
      console.error("Error al guardar empresa:", err)
      alert("Hubo un error al guardar la configuración.")
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Cargando perfil...</div>

  const defaultCenter = { lat: 40.416775, lng: -3.703790 } // Default to Madrid if no position

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Mi Empresa"
        subtitle="Personaliza cómo aparece tu negocio en el directorio público."
      />

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">

        {/* ── Columna izquierda: formulario ──────────────────────────── */}
        <div className="space-y-6 min-w-0">

      {/* Carga de imagen/logo */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 dark:bg-slate-950 dark:border-slate-800 dark:shadow-black/20">
        <p className="text-sm font-medium text-gray-700 mb-1 dark:text-slate-200">Logo o imagen de empresa</p>
        <p className="text-xs text-gray-400 mb-4 dark:text-slate-400">
          Esta imagen se mostrará en la vista pública para que tus clientes identifiquen tu marca.
        </p>
        <p className="text-xs text-gray-500 mb-4 dark:text-slate-500">
          Formatos permitidos: JPG y PNG. Tamaño máximo: 10 MB.
        </p>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center dark:border-slate-700 dark:bg-slate-900">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo actual" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400 dark:text-slate-500" />
            )}
          </div>
          <label className="inline-flex">
            <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden" onChange={handleUploadLogo} />
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
              <Upload className="w-4 h-4" />
              {subiendoLogo ? 'Subiendo...' : 'Subir imagen'}
            </span>
          </label>
        </div>

        {logoUrl && (
          <p className="mt-3 text-xs text-gray-500 break-all dark:text-slate-500">{logoUrl}</p>
        )}
        {logoError && (
          <p className="mt-3 text-sm text-red-600">{logoError}</p>
        )}
      </div>

      {/* Icono */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 dark:bg-slate-950 dark:border-slate-800 dark:shadow-black/20">
        <p className="text-sm font-semibold text-gray-700 mb-1 dark:text-slate-200">Icono del negocio</p>
        <p className="text-xs text-gray-400 mb-4 dark:text-slate-400">Elige el que mejor representa tu actividad (se usa si no tienes logo)</p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {ICONOS.map(({ emoji, label }) => (
            <button key={emoji} onClick={() => setIcono(emoji)} title={label}
              className={`aspect-square rounded-xl text-2xl flex items-center justify-center
                border-2 transition-all hover:scale-110
                ${icono === emoji
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-110 dark:bg-blue-500/10 dark:border-blue-400'
                  : 'border-transparent bg-gray-50 hover:border-gray-200 dark:bg-slate-900 dark:hover:border-slate-700'}`}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Info del negocio */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 dark:bg-slate-950 dark:border-slate-800 dark:shadow-black/20">
        <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Información pública</p>

        <Field label="Nombre del negocio">
          <input
            className={inputCls}
            placeholder="Ej: Barberia ronaldo"
            value={nombreEmpresa}
            onChange={e => setNombreEmpresa(e.target.value)}
          />
        </Field>

        <Field label="Descripción del negocio">
          <textarea
            rows={3}
            className={inputCls + ' resize-none'}
            placeholder="Ej: Somos un spa de bienestar especializado en masajes relajantes y tratamientos faciales..."
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
          <p className="text-xs text-gray-400 dark:text-slate-500">{descripcion.length}/300 caracteres</p>
        </Field>

        <Field label={<span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500" />Dirección</span>}>
          <input
            className={inputCls}
            placeholder="Ej: Calle Velázquez 45, 28003 Madrid"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
          />
        </Field>

        <Field label={<span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500" />Ubicación en el mapa</span>}>
          <p className="text-xs text-gray-400 mb-2 dark:text-slate-500">
            Escribe tu dirección arriba y pulsa "Localizar" para mostrarla en el mapa.
          </p>
          <MapEmbed
            direccion={direccion}
            position={position}
            onPositionChange={setPosition}
          />
        </Field>

        <Field label={<span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" />Horario de atención</span>}>
          <HorarioPicker
            value={horario}
            onChange={(json, texto) => setHorario(json)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tipo de Atención">
            <select
              className={inputCls}
              value={tipoAtencion}
              onChange={e => setTipoAtencion(e.target.value)}
            >
              {ATENCION_OPTS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Amenidades */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 dark:bg-slate-950 dark:border-slate-800 dark:shadow-black/20">
        <p className="text-sm font-semibold text-gray-700 mb-1 dark:text-slate-200">Servicios y comodidades</p>
        <p className="text-xs text-gray-400 mb-4 dark:text-slate-500">Marca lo que ofreces en tu local</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AMENIDADES_OPTS.map(({ id, icon: Icon, label }) => {
            const activa = amenidades.includes(id)
            return (
              <button key={id} onClick={() => toggleAmenidad(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm
                            font-medium transition-all duration-150 text-left
                            ${activa
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-400'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600'}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${activa ? 'text-blue-500 dark:text-blue-300' : 'text-gray-400 dark:text-slate-500'}`} />
                {label}
                {activa && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 ml-auto flex-shrink-0 dark:text-blue-300" />}
              </button>
            )
          })}
        </div>
      </div>{/* fin amenidades */}

        {/* Botón guardar */}
        <div className="flex items-center gap-4">
          <button onClick={guardar}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3
                       rounded-xl transition-all shadow-sm hover:shadow-md text-sm">
            Guardar cambios
          </button>
          {guardado && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium animate-in fade-in dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4" /> Guardado correctamente
          </span>
        )}
        </div>
        </div>{/* fin columna izquierda */}

        {/* ── Columna derecha: sticky ────────────────────────────────── */}
        <div className="space-y-4 xl:sticky xl:top-6">

          {/* Vista previa */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 dark:bg-slate-950 dark:border-slate-800 dark:shadow-black/20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 dark:text-slate-500">Vista previa</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden dark:border-slate-800">
              <div className="h-24 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center dark:from-slate-900 dark:to-slate-950">
                {previewNode}
              </div>
              <div className="p-3 bg-white dark:bg-slate-950">
                <p className="font-bold text-gray-900 text-sm dark:text-slate-100">{companyName ?? 'Mi Empresa'}</p>
                {descripcion && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 dark:text-slate-400">{descripcion}</p>
                )}
                {direccion && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 dark:text-slate-400">
                    <MapPin className="w-3 h-3 flex-shrink-0" />{direccion}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Datos de la cuenta */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 dark:bg-slate-950 dark:border-slate-800 dark:shadow-black/20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 dark:text-slate-500">Datos de la cuenta</p>
            <div className="space-y-2 text-sm">
              {[
                { l: 'Nombre',  v: user?.name || user?.nombre },
                { l: 'Email',   v: user?.email },
                { l: 'Empresa', v: companyName },
              ].map(({ l, v }) => (
                <div key={l} className="flex flex-col gap-0.5 py-1.5 border-b border-gray-50 last:border-0 dark:border-slate-800">
                  <span className="text-xs text-gray-400 dark:text-slate-500">{l}</span>
                  <span className="font-medium text-gray-700 text-sm truncate dark:text-slate-200">{v || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 dark:bg-slate-950 dark:border-slate-800 dark:shadow-black/20">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide dark:text-slate-500">Calendario de reservas</p>
                <p className="text-sm text-gray-500 mt-1 dark:text-slate-400">Vista rápida de las citas agendadas.</p>
              </div>
              <CalendarDays className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            </div>

            {loadingReservas ? (
              <div className="h-64 flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
                Cargando calendario...
              </div>
            ) : (
              <>
                  <Calendar
                  mode="single"
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  showOutsideDays
                  modifiers={{ reservado: diasConReserva }}
                  modifiersClassNames={{
                    reservado: 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-200',
                  }}
                  className="p-0"
                />

                <div className="mt-4 space-y-2">
                  {reservasError && (
                    <p className="text-xs text-rose-500">{reservasError}</p>
                  )}

                {reservasDelMes.length > 0 ? (
                    reservasDelMes.map((reserva) => (
                      <div
                        key={reserva.id || `${reserva.fechaReserva.toISOString()}-${reserva.clienteNombre || 'cliente'}`}
                        className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <p className="text-xs font-semibold text-gray-900 truncate dark:text-slate-100">
                          {reserva.clienteNombre || reserva.customerName || 'Cliente'}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 dark:text-slate-400">
                          {format(reserva.fechaReserva, "d 'de' MMMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                      No hay reservas registradas para este mes.
                    </p>
                  )}

                  <Link
                    to="/dashboard/calendario"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    Ver calendario completo
                    <CalendarDays className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>

        </div>{/* fin columna derecha */}

      </div>{/* fin grid */}
    </div>
  )
}

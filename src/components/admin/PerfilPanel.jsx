import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../ui/PageHeader'
import { CheckCircle2, MapPin, Clock, Wifi, Car, Wind, Coffee, Dumbbell, ParkingCircle, X, Navigation, Upload, Image as ImageIcon } from 'lucide-react'
import { empresaApi } from '../../services/gestionService'
import { companyProfileApi } from '../../services/companyProfileService'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon path issues
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  )
}

const inputCls = `w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition`

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })
  return position ? <Marker position={position} /> : null
}

/* ──────────────────────────────────────────────────────────────────────
   MAIN
   ────────────────────────────────────────────────────────────────────── */
export default function PerfilPanel() {
  const { user, companyId, companyName } = useAuth()

  const [icono,       setIcono]       = useState('🏢')
  const [descripcion, setDescripcion] = useState('')
  const [direccion,   setDireccion]   = useState('')
  const [horario,     setHorario]     = useState('')
  const [tipoAtencion,setTipoAtencion]= useState('presencial')
  const [amenidades,  setAmenidades]  = useState([])
  const [position,    setPosition]    = useState(null)
  
  const [guardado,    setGuardado]    = useState(false)
  const [loading,     setLoading]     = useState(true)

  const [logoUrl, setLogoUrl] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [logoError, setLogoError] = useState('')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  const logoBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'company-logos'

  useEffect(() => {
    let active = true
    if (companyId) {
      empresaApi.obtener(companyId).then(data => {
        if (!active) return
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
      }).finally(() => { if (active) setLoading(false) })

      companyProfileApi.obtenerMiEmpresa()
        .then((data) => {
          if (!active) return
          const currentLogo = data?.logoUrl || ''
          setLogoUrl(currentLogo)
          setLogoPreview(currentLogo)
        })
        .catch(() => {
          if (!active) return
          setLogoError('No se pudo cargar el logo actual.')
        })
    }
    return () => { active = false }
  }, [companyId])

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

  async function handleUploadLogo(event) {
    const file = event.target.files?.[0]
    if (!file || !companyId) return

    setLogoError('')
    if (!supabaseUrl || !supabaseAnonKey) {
      setLogoError('Faltan variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en Render.')
      return
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setLogoError('La imagen supera 2MB.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setLogoError('Debes subir un archivo de imagen.')
      return
    }

    setSubiendoLogo(true)
    try {
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
      setLogoUrl(updated.logoUrl || publicUrl)
      setLogoPreview(updated.logoUrl || publicUrl)
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
        descripcion,
        direccion,
        horario,
        icono,
        tipoAtencion,
        latitud: position?.lat,
        longitud: position?.lng,
        amenidades: JSON.stringify(amenidades)
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch (err) {
      console.error("Error al guardar empresa:", err)
      alert("Hubo un error al guardar la configuración.")
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>

  const defaultCenter = { lat: 40.416775, lng: -3.703790 } // Default to Madrid if no position

  return (
    <div className="space-y-6 max-w-2xl pb-12">
      <PageHeader
        title="Mi Empresa"
        subtitle="Personaliza cómo aparece tu negocio en el directorio público."
      />

      {/* Vista previa */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vista previa</p>
        <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
          <div className="h-28 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
            {previewNode}
          </div>
          <div className="p-4">
            <p className="font-bold text-gray-900">{companyName ?? 'Mi Empresa'}</p>
            {descripcion && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{descripcion}</p>}
            {direccion && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{direccion}</p>}
          </div>
        </div>
      </div>

      {/* Carga de imagen/logo */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-700 mb-1">Logo o imagen de empresa</p>
        <p className="text-xs text-gray-400 mb-4">
          Esta imagen se mostrará en la vista pública para que tus clientes identifiquen tu marca.
        </p>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo actual" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <label className="inline-flex">
            <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} />
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
              <Upload className="w-4 h-4" />
              {subiendoLogo ? 'Subiendo...' : 'Subir imagen'}
            </span>
          </label>
        </div>

        {logoUrl && (
          <p className="mt-3 text-xs text-gray-500 break-all">{logoUrl}</p>
        )}
        {logoError && (
          <p className="mt-3 text-sm text-red-600">{logoError}</p>
        )}
      </div>

      {/* Icono */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Icono del negocio</p>
        <p className="text-xs text-gray-400 mb-4">Elige el que mejor representa tu actividad (se usa si no tienes logo)</p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {ICONOS.map(({ emoji, label }) => (
            <button key={emoji} onClick={() => setIcono(emoji)} title={label}
              className={`aspect-square rounded-xl text-2xl flex items-center justify-center
                border-2 transition-all hover:scale-110
                ${icono === emoji
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-110'
                  : 'border-transparent bg-gray-50 hover:border-gray-200'}`}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Info del negocio */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-700">Información pública</p>

        <Field label="Descripción del negocio">
          <textarea
            rows={3}
            className={inputCls + ' resize-none'}
            placeholder="Ej: Somos un spa de bienestar especializado en masajes relajantes y tratamientos faciales..."
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
          <p className="text-xs text-gray-400">{descripcion.length}/300 caracteres</p>
        </Field>

        <Field label={<span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500" />Dirección</span>}>
          <input
            className={inputCls}
            placeholder="Ej: Calle Velázquez 45, 28003 Madrid"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
          />
        </Field>

        <Field label={<span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-blue-500" />Ubicación en el Mapa</span>}>
          <div className="flex items-center justify-between mb-2">
            {position ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg font-medium">
                  <MapPin className="w-3 h-3" />
                  {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </span>
                <button
                  type="button"
                  onClick={() => setPosition(null)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-2.5 py-1 rounded-lg transition-colors font-medium"
                  title="Quitar ubicación"
                >
                  <X className="w-3 h-3" /> Limpiar
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Sin ubicación establecida — haz clic en el mapa para marcarla</p>
            )}
          </div>
          <div className="h-64 rounded-xl overflow-hidden border border-gray-200 z-0">
            <MapContainer 
              center={position || defaultCenter} 
              zoom={position ? 15 : 5} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
          {!position && (
            <p className="text-xs text-blue-500 mt-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Haz clic en cualquier punto del mapa para fijar la ubicación
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={<span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" />Horario de atención</span>}>
            <input
              className={inputCls}
              placeholder="Ej: L-V: 09:00 - 20:00"
              value={horario}
              onChange={e => setHorario(e.target.value)}
            />
          </Field>
          
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Servicios y comodidades</p>
        <p className="text-xs text-gray-400 mb-4">Marca lo que ofreces en tu local</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AMENIDADES_OPTS.map(({ id, icon: Icon, label }) => {
            const activa = amenidades.includes(id)
            return (
              <button key={id} onClick={() => toggleAmenidad(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm
                            font-medium transition-all duration-150 text-left
                            ${activa
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${activa ? 'text-blue-500' : 'text-gray-400'}`} />
                {label}
                {activa && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 ml-auto flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Datos de la cuenta */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Datos de la cuenta</p>
        <div className="space-y-2 text-sm">
          {[
            { l: 'Nombre',  v: user?.name || user?.nombre },
            { l: 'Email',   v: user?.email },
            { l: 'Empresa', v: companyName },
          ].map(({ l, v }) => (
            <div key={l} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-400">{l}</span>
              <span className="font-medium text-gray-700">{v || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex items-center gap-4">
        <button onClick={guardar}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3
                     rounded-xl transition-all shadow-sm hover:shadow-md text-sm">
          Guardar cambios
        </button>
        {guardado && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> Guardado correctamente
          </span>
        )}
      </div>
    </div>
  )
}

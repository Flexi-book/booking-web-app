import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../ui/PageHeader'
import { Button } from '../ui/button'
import { CheckCircle2, Upload, Image as ImageIcon } from 'lucide-react'
import { companyProfileApi } from '../../services/companyProfileService'

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

function getStorageKey(companyId) {
  return `flexibook_icono_${companyId}`
}

export function getEmpresaIcono(companyId, tipoNegocio) {
  if (companyId) {
    const stored = localStorage.getItem(getStorageKey(companyId))
    if (stored) return stored
  }
  // Fallback por tipo de negocio
  const TIPO_MAP = {
    'barbería': '✂️', 'peluquería': '💇', 'spa': '💆',
    'fitness': '🏋️', 'centro médico': '🏥', 'salón de belleza': '💅',
    'cancha deportiva': '⚽', 'sala de reuniones': '🏢', 'petshop': '🐾',
  }
  return TIPO_MAP[tipoNegocio?.toLowerCase()] ?? '🏢'
}

export default function PerfilPanel() {
  const { user, companyId, companyName } = useAuth()

  const [iconoActual, setIconoActual] = useState(
    () => localStorage.getItem(getStorageKey(companyId)) ?? '🏢'
  )
  const [guardado, setGuardado] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [logoError, setLogoError] = useState('')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  const logoBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'company-logos'

  useEffect(() => {
    let active = true
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
    return () => { active = false }
  }, [])

  const previewNode = useMemo(() => {
    if (logoPreview) {
      return <img src={logoPreview} alt="Logo empresa" className="w-full h-full object-cover" />
    }
    return <span className="text-3xl">{iconoActual}</span>
  }, [logoPreview, iconoActual])

  function seleccionarIcono(emoji) {
    setIconoActual(emoji)
    setGuardado(false)
  }

  function guardar() {
    if (companyId) {
      localStorage.setItem(getStorageKey(companyId), iconoActual)
    }
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
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

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Perfil de la Empresa"
        subtitle="Personaliza cómo aparece tu negocio en el directorio público."
      />

      {/* Vista previa */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-500 mb-4">Vista previa de tu tarjeta</p>
        <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50 flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden
                          flex items-center justify-center text-3xl flex-shrink-0 border border-blue-100">
            {previewNode}
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Empresa</span>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5">{companyName ?? 'Mi Empresa'}</h3>
            <p className="text-sm text-gray-400 mt-1">Reserva tu hora de forma rápida y sencilla.</p>
            <p className="text-sm font-semibold text-blue-600 mt-3">Reservar hora →</p>
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

      {/* Selector de icono */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-700 mb-1">Elige el icono de tu negocio</p>
        <p className="text-xs text-gray-400 mb-4">El icono aparecerá en el directorio público de Flexibook.</p>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {ICONOS.map(({ emoji, label }) => (
            <button
              key={emoji}
              onClick={() => seleccionarIcono(emoji)}
              title={label}
              className={`
                aspect-square rounded-xl text-2xl flex items-center justify-center
                border-2 transition-all hover:scale-110
                ${iconoActual === emoji
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-110'
                  : 'border-transparent bg-gray-50 hover:border-gray-200'}
              `}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={guardar}>
            Guardar icono
          </Button>
          {guardado && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Guardado
            </span>
          )}
        </div>
      </div>

      {/* Info del usuario */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm font-medium text-gray-700 mb-4">Datos de la cuenta</p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Nombre</span>
            <span className="font-medium text-gray-700">{user?.name || user?.nombre || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Email</span>
            <span className="font-medium text-gray-700">{user?.email || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Empresa</span>
            <span className="font-medium text-gray-700">{companyName || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

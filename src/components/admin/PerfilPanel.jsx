import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../ui/PageHeader'
import { Button } from '../ui/button'
import { CheckCircle2 } from 'lucide-react'

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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100
                          flex items-center justify-center text-3xl flex-shrink-0 border border-blue-100">
            {iconoActual}
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Empresa</span>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5">{companyName ?? 'Mi Empresa'}</h3>
            <p className="text-sm text-gray-400 mt-1">Reserva tu hora de forma rápida y sencilla.</p>
            <p className="text-sm font-semibold text-blue-600 mt-3">Reservar hora →</p>
          </div>
        </div>
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

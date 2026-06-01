import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const DIAS = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
]

const HORAS = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

const DEFAULT_HORARIO = {
  lun: { activo: true,  apertura: '09:00', cierre: '18:00' },
  mar: { activo: true,  apertura: '09:00', cierre: '18:00' },
  mie: { activo: true,  apertura: '09:00', cierre: '18:00' },
  jue: { activo: true,  apertura: '09:00', cierre: '18:00' },
  vie: { activo: true,  apertura: '09:00', cierre: '18:00' },
  sab: { activo: false, apertura: '10:00', cierre: '14:00' },
  dom: { activo: false, apertura: '10:00', cierre: '14:00' },
}

export function serializarHorario(h) {
  const activos = DIAS.filter(d => h[d.key]?.activo)
  if (!activos.length) return 'Cerrado'
  const grupos = []
  let grupo = null
  for (const d of activos) {
    const slot = `${h[d.key].apertura}–${h[d.key].cierre}`
    if (grupo && grupo.slot === slot) {
      grupo.fin = d.label.slice(0, 3)
    } else {
      grupo = { inicio: d.label.slice(0, 3), fin: null, slot }
      grupos.push(grupo)
    }
  }
  return grupos
    .map(g => `${g.fin ? `${g.inicio}–${g.fin}` : g.inicio}: ${g.slot}`)
    .join(' · ')
}

export function parsearHorario(str) {
  if (!str) return DEFAULT_HORARIO
  try {
    const parsed = JSON.parse(str)
    if (parsed && typeof parsed === 'object' && 'lun' in parsed) return parsed
  } catch {}
  return DEFAULT_HORARIO
}

function Toggle({ activo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-checked={activo}
      role="switch"
      className={cn(
        'relative inline-flex w-10 h-[22px] flex-shrink-0 rounded-full border-2 border-transparent',
        'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        activo ? 'bg-blue-600' : 'bg-gray-200'
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block w-[18px] h-[18px] rounded-full bg-white shadow',
        'transform transition-transform duration-200',
        activo ? 'translate-x-[18px]' : 'translate-x-0'
      )} />
    </button>
  )
}

function HoraSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'appearance-none w-[84px] text-sm font-medium text-gray-700',
          'border border-gray-200 rounded-lg px-3 py-1.5 pr-7 bg-white',
          'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10',
          'hover:border-gray-300 transition cursor-pointer'
        )}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
  )
}

export default function HorarioPicker({ value, onChange }) {
  const [horario, setHorario] = useState(() => parsearHorario(value))

  useEffect(() => {
    setHorario(parsearHorario(value))
  }, [value])

  function update(dia, campo, val) {
    const next = { ...horario, [dia]: { ...horario[dia], [campo]: val } }
    setHorario(next)
    onChange(JSON.stringify(next), serializarHorario(next))
  }

  function toggle(dia) {
    const next = { ...horario, [dia]: { ...horario[dia], activo: !horario[dia].activo } }
    setHorario(next)
    onChange(JSON.stringify(next), serializarHorario(next))
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
      {DIAS.map(d => {
        const slot   = horario[d.key]
        const activo = slot?.activo ?? false

        return (
          <div
            key={d.key}
            className={cn(
              'flex items-center gap-4 px-4 py-3 transition-colors',
              !activo && 'bg-gray-50/50'
            )}
          >
            {/* Toggle */}
            <Toggle activo={activo} onClick={() => toggle(d.key)} />

            {/* Nombre del día — ancho fijo para alinear */}
            <span className={cn(
              'w-24 text-sm font-medium select-none transition-colors',
              activo ? 'text-gray-800' : 'text-gray-400'
            )}>
              {d.label}
            </span>

            {/* Horario o badge cerrado */}
            {activo ? (
              <div className="flex items-center gap-2 ml-auto">
                <HoraSelect
                  value={slot.apertura}
                  onChange={v => update(d.key, 'apertura', v)}
                  options={HORAS}
                />
                <span className="text-gray-300 text-sm font-light select-none">—</span>
                <HoraSelect
                  value={slot.cierre}
                  onChange={v => update(d.key, 'cierre', v)}
                  options={HORAS.filter(h => h > slot.apertura)}
                />
              </div>
            ) : (
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                Cerrado
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

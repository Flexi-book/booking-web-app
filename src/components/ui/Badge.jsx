const COLORS = {
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:    'bg-red-100 text-red-700',
  blue:   'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  gray:   'bg-gray-100 text-gray-700',
}

// Mapeo automático por estado
const STATUS_COLOR = {
  // activos / disponibilidad
  disponible:        'green',
  available:         'green',
  no_disponible:     'red',
  'no disponible':   'red',
  'en mantenimiento':'orange',
  inactivo:          'gray',
  inactive:          'gray',
  // servicios
  activo:            'green',
  active:            'green',
  pausado:           'yellow',
  paused:            'yellow',
  // reservas
  confirmada:        'green',
  confirmed:         'green',
  pendiente:         'yellow',
  pending:           'yellow',
  cancelada:         'red',
  cancelled:         'red',
  completada:        'blue',
  completed:         'blue',
}

export default function Badge({ label, color, status }) {
  const resolved = color ?? STATUS_COLOR[status?.toLowerCase()] ?? 'gray'
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${COLORS[resolved] ?? COLORS.gray}`}>
      {label ?? status}
    </span>
  )
}

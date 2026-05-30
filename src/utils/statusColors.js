const ASSET_STATUS = {
  disponible: 'bg-green-100 text-green-700',
  'no disponible': 'bg-red-100 text-red-700',
  no_disponible: 'bg-red-100 text-red-700',
  'en mantenimiento': 'bg-orange-100 text-orange-700',
  inactivo: 'bg-orange-100 text-orange-700',
}

const SERVICE_STATUS = {
  activo: 'bg-green-100 text-green-700',
  pausado: 'bg-yellow-100 text-yellow-700',
  inactivo: 'bg-gray-100 text-gray-700',
}

const RESERVATION_STATUS = {
  confirmada: 'bg-green-100 text-green-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  cancelada: 'bg-red-100 text-red-700',
  completada: 'bg-blue-100 text-blue-700',
}

const TYPE_ICONS = {
  espacio: '📍',
  sala: '📍',
  personal: '👤',
  profesional: '👤',
  equipo: '⚙️',
}

const FALLBACK = 'bg-gray-100 text-gray-700'

export const assetStatusColor = (estado) => ASSET_STATUS[estado?.toLowerCase()] ?? FALLBACK
export const serviceStatusColor = (estado) => SERVICE_STATUS[estado?.toLowerCase()] ?? FALLBACK
export const reservationStatusColor = (estado) => RESERVATION_STATUS[estado?.toLowerCase()] ?? FALLBACK
export const assetTypeIcon = (tipo) => TYPE_ICONS[tipo?.toLowerCase()] ?? '📦'

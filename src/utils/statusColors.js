const ASSET_STATUS = {
  disponible: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300',
  'no disponible': 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  no_disponible: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  'en mantenimiento': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
  inactivo: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
}

const SERVICE_STATUS = {
  activo: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300',
  pausado: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300',
  inactivo: 'bg-gray-100 text-gray-700 dark:bg-slate-500/10 dark:text-slate-300',
}

const RESERVATION_STATUS = {
  confirmada: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300',
  pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300',
  cancelada: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  completada: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
}

const TYPE_ICONS = {
  espacio: '📍',
  sala: '📍',
  personal: '👤',
  profesional: '👤',
  equipo: '⚙️',
}

const FALLBACK = 'bg-gray-100 text-gray-700 dark:bg-slate-500/10 dark:text-slate-300'

export const assetStatusColor = (estado) => ASSET_STATUS[estado?.toLowerCase()] ?? FALLBACK
export const serviceStatusColor = (estado) => SERVICE_STATUS[estado?.toLowerCase()] ?? FALLBACK
export const reservationStatusColor = (estado) => RESERVATION_STATUS[estado?.toLowerCase()] ?? FALLBACK
export const assetTypeIcon = (tipo) => TYPE_ICONS[tipo?.toLowerCase()] ?? '📦'

/**
 * Extrae un mensaje de error legible desde una respuesta de Axios.
 * Cubre: string, { message }, { error }, { errors: { campo } }
 */
export function extractApiError(err, fallback = 'Error inesperado. Intenta de nuevo.') {
  const data = err?.response?.data

  if (!data) {
    if (err?.message?.includes('Network Error')) return 'Sin conexión al servidor.'
    if (err?.message?.includes('timeout'))       return 'El servidor tardó demasiado. Reintenta.'
    return err?.message || fallback
  }

  if (typeof data === 'string')           return data
  if (typeof data.message === 'string')   return data.message
  if (typeof data.error === 'string')     return data.error

  // { errors: { campo: 'mensaje' } }
  if (data.errors && typeof data.errors === 'object') {
    const msgs = Object.values(data.errors).filter(Boolean)
    if (msgs.length) return msgs.join(' · ')
  }

  // HTTP status helpers
  const status = err?.response?.status
  if (status === 400) return 'Datos inválidos. Revisa el formulario.'
  if (status === 401) return 'Sesión expirada. Inicia sesión nuevamente.'
  if (status === 403) return 'No tienes permisos para esta acción.'
  if (status === 404) return 'Recurso no encontrado.'
  if (status === 409) return 'Ya existe un registro con esos datos.'
  if (status >= 500)  return 'Error en el servidor. Contacta soporte.'

  return fallback
}

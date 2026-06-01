import { adminClient, authClient } from '../api/apiClients'
import { extractApiError } from '../utils/apiError'
import { fetchWithCache, clearCacheKeys } from './requestCache'

const CACHE_KEYS = {
  activos: 'gestion:activos:list',
  servicios: 'gestion:servicios:list',
  reservas: 'gestion:reservas:list',
}

const LIST_TTL_MS = 30000

// ── Helper: lanza error legible ──────────────────────────────────────────────
function apiCall(promise) {
  return promise.then(r => r.data).catch(err => {
    throw new Error(extractApiError(err))
  })
}

// ── Activos ───────────────────────────────────────────────────────────────────
export const activosApi = {
  listar: () => fetchWithCache(
    CACHE_KEYS.activos,
    () => apiCall(adminClient.get('/activos')),
    LIST_TTL_MS,
  ),
  crear: (activo) => apiCall(adminClient.post('/activos', activo)).then((data) => {
    clearCacheKeys([CACHE_KEYS.activos, CACHE_KEYS.reservas])
    return data
  }),
  actualizar: (id, activo) => apiCall(adminClient.put(`/activos/${id}`, activo)).then((data) => {
    clearCacheKeys([CACHE_KEYS.activos, CACHE_KEYS.reservas])
    return data
  }),
  eliminar: (id) => apiCall(adminClient.delete(`/activos/${id}`)).then((data) => {
    clearCacheKeys([CACHE_KEYS.activos, CACHE_KEYS.reservas])
    return data
  }),
}

// ── Servicios ────────────────────────────────────────────────────────────────
export const serviciosApi = {
  listar: () => fetchWithCache(
    CACHE_KEYS.servicios,
    () => apiCall(adminClient.get('/servicios')),
    LIST_TTL_MS,
  ),
  crear: (servicio) => apiCall(adminClient.post('/servicios', servicio)).then((data) => {
    clearCacheKeys([CACHE_KEYS.servicios, CACHE_KEYS.reservas])
    return data
  }),
  actualizar: (id, servicio) => apiCall(adminClient.put(`/servicios/${id}`, servicio)).then((data) => {
    clearCacheKeys([CACHE_KEYS.servicios, CACHE_KEYS.reservas])
    return data
  }),
  eliminar: (id) => apiCall(adminClient.delete(`/servicios/${id}`)).then((data) => {
    clearCacheKeys([CACHE_KEYS.servicios, CACHE_KEYS.reservas])
    return data
  }),
}

// ── Reservas ─────────────────────────────────────────────────────────────────
export const reservasApi = {
  listar: () => fetchWithCache(
    CACHE_KEYS.reservas,
    () => apiCall(adminClient.get('/reservations')),
    LIST_TTL_MS,
  ),
  crear: (reserva) => apiCall(adminClient.post('/reservations', reserva)).then((data) => {
    clearCacheKeys([CACHE_KEYS.reservas])
    return data
  }),
  cancelar: (id) => apiCall(adminClient.delete(`/reservations/${id}`)).then((data) => {
    clearCacheKeys([CACHE_KEYS.reservas])
    return data
  }),
}

// ── Catalog (catálogo público) ────────────────────────────────────────────────
export const catalogApi = {
  obtenerCatalogo: (empresaId) =>
    apiCall(adminClient.get(`/catalog`, { params: { empresaId } })),
}

// ── Notificaciones ────────────────────────────────────────────────────────────
export const notificacionesApi = {
  listar:        ()      => apiCall(adminClient.get('/notificaciones')),
  enviar:        (body)  => apiCall(adminClient.post('/notificaciones/send', body)),
  marcarEnviada: (id)    => apiCall(adminClient.put(`/notificaciones/${id}/enviada`)),
  marcarFallida: (id)    => apiCall(adminClient.put(`/notificaciones/${id}/fallida`)),

  enviarConfirmacionReserva: ({ clienteEmail, clienteNombre, adminEmail, servicio, fecha, empresa, mensaje }) =>
    Promise.allSettled([
      adminClient.post('/notificaciones/send', {
        eventType: 'CONFIRMACION_RESERVA', recipientEmail: clienteEmail,
        nombre: clienteNombre, servicio, fecha, empresa, mensaje,
      }),
      adminClient.post('/notificaciones/send', {
        eventType: 'NUEVA_RESERVA_ADMIN', recipientEmail: adminEmail,
        servicio, fecha, cliente: clienteNombre, emailCliente: clienteEmail, mensaje,
      }),
    ]),

  enviarCancelacion: ({ clienteEmail, clienteNombre, servicio, fecha }) =>
    adminClient.post('/notificaciones/send', {
      eventType: 'CANCELACION_RESERVA', recipientEmail: clienteEmail,
      nombre: clienteNombre, servicio, fecha,
    }).catch(() => {}), // best-effort
}

// ── Empresa (Configuración) ───────────────────────────────────────────────────
export const empresaApi = {
  actualizar: (id, data) => apiCall(authClient.put(`/companies/${id}`, data, {
    // Add header to bypass security check in the controller if needed, or rely on token
    headers: { 'X-Empresa-Id': id }
  })),
  obtener: (id) => apiCall(authClient.get(`/companies/public/${id}`)),
}

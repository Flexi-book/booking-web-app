import { adminClient } from '../api/apiClients'
import { extractApiError } from '../utils/apiError'

// ── Helper: lanza error legible ──────────────────────────────────────────────
function apiCall(promise) {
  return promise.then(r => r.data).catch(err => {
    throw new Error(extractApiError(err))
  })
}

// ── Activos ───────────────────────────────────────────────────────────────────
export const activosApi = {
  listar:     ()           => apiCall(adminClient.get('/activos')),
  crear:      (activo)     => apiCall(adminClient.post('/activos', activo)),
  actualizar: (id, activo) => apiCall(adminClient.put(`/activos/${id}`, activo)),
  eliminar:   (id)         => apiCall(adminClient.delete(`/activos/${id}`)),
}

// ── Servicios ────────────────────────────────────────────────────────────────
export const serviciosApi = {
  listar:     ()             => apiCall(adminClient.get('/servicios')),
  crear:      (servicio)     => apiCall(adminClient.post('/servicios', servicio)),
  actualizar: (id, servicio) => apiCall(adminClient.put(`/servicios/${id}`, servicio)),
  eliminar:   (id)           => apiCall(adminClient.delete(`/servicios/${id}`)),
}

// ── Reservas ─────────────────────────────────────────────────────────────────
export const reservasApi = {
  listar:  ()        => apiCall(adminClient.get('/reservations')),
  crear:   (reserva) => apiCall(adminClient.post('/reservations', reserva)),
  cancelar: (id)     => apiCall(adminClient.delete(`/reservations/${id}`)),
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

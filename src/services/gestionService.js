import { adminClient } from '../api/apiClients'

// Panel Admin (bff-backoffice /api/backoffice/*)

export const activosApi = {
  listar:     ()           => adminClient.get('/activos').then(r => r.data),
  crear:      (activo)     => adminClient.post('/activos', activo).then(r => r.data),
  actualizar: (id, activo) => adminClient.put(`/activos/${id}`, activo).then(r => r.data),
  eliminar:   (id)         => adminClient.delete(`/activos/${id}`),
}

export const serviciosApi = {
  listar:     ()             => adminClient.get('/servicios').then(r => r.data),
  crear:      (servicio)     => adminClient.post('/servicios', servicio).then(r => r.data),
  actualizar: (id, servicio) => adminClient.put(`/servicios/${id}`, servicio).then(r => r.data),
  eliminar:   (id)           => adminClient.delete(`/servicios/${id}`),
}

export const reservasApi = {
  listar:  ()        => adminClient.get('/reservations').then(r => r.data),
  crear:   (reserva) => adminClient.post('/reservations', reserva).then(r => r.data),
  cancelar: (id)     => adminClient.delete(`/reservations/${id}`),
}

export const notificacionesApi = {
  listar: () => adminClient.get('/notificaciones').then(r => r.data),

  enviar: (payload) => adminClient.post('/notificaciones', payload).then(r => r.data),

  marcarEnviada: (id) => adminClient.put(`/notificaciones/${id}/enviada`).then(r => r.data),
  marcarFallida: (id) => adminClient.put(`/notificaciones/${id}/fallida`).then(r => r.data),

  // Confirmación al cliente + notificación al admin
  enviarConfirmacionReserva: ({ clienteEmail, clienteNombre, adminEmail, servicio, fecha, empresa, mensaje }) =>
    Promise.all([
      // Al cliente — confirmación
      adminClient.post('/notificaciones/send', {
        eventType:     'CONFIRMACION_RESERVA',
        recipientEmail: clienteEmail,
        nombre:        clienteNombre,
        servicio,
        fecha,
        empresa,
        mensaje,
      }),
      // Al admin — nueva reserva recibida
      adminClient.post('/notificaciones/send', {
        eventType:     'NUEVA_RESERVA_ADMIN',
        recipientEmail: adminEmail,
        servicio,
        fecha,
        cliente:       clienteNombre,
        emailCliente:  clienteEmail,
        mensaje,
      }),
    ]),

  // Cancelación al cliente
  enviarCancelacion: ({ clienteEmail, clienteNombre, servicio, fecha }) =>
    adminClient.post('/notificaciones/send', {
      eventType:     'CANCELACION_RESERVA',
      recipientEmail: clienteEmail,
      nombre:        clienteNombre,
      servicio,
      fecha,
    }),
}

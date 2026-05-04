import { backofficeApi } from '../api/apiClients'

export const activosApi = {
  listar: () =>
    backofficeApi.get('/activos').then(r => r.data),
  crear: (activo) =>
    backofficeApi.post('/activos', activo).then(r => r.data),
  actualizar: (id, activo) =>
    backofficeApi.put(`/activos/${id}`, activo).then(r => r.data),
  eliminar: (id) =>
    backofficeApi.delete(`/activos/${id}`),
}

export const serviciosApi = {
  listar: () =>
    backofficeApi.get('/servicios').then(r => r.data),
  crear: (servicio) =>
    backofficeApi.post('/servicios', servicio).then(r => r.data),
  actualizar: (id, servicio) =>
    backofficeApi.put(`/servicios/${id}`, servicio).then(r => r.data),
  eliminar: (id) =>
    backofficeApi.delete(`/servicios/${id}`),
}

export const reservasApi = {
  listar: () =>
    backofficeApi.get('/reservas').then(r => r.data),
  crear: (reserva) =>
    backofficeApi.post('/reservas', reserva).then(r => r.data),
  cancelar: (id) =>
    backofficeApi.delete(`/reservas/${id}`),
}

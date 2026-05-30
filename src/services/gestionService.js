import { bookingApi, catalogApi } from '../api/apiClients'


export const activosApi = {
  listar: () =>
    catalogApi.get('/assets').then(r => r.data),
  crear: (activo) =>
    catalogApi.post('/assets', activo).then(r => r.data),
  actualizar: (id, activo) =>
    catalogApi.put(`/assets/${id}`, activo).then(r => r.data),
  eliminar: (id) =>
    catalogApi.delete(`/assets/${id}`),
}

export const serviciosApi = {
  listar: () =>
    catalogApi.get('/service-offerings').then(r => r.data),
  crear: (servicio) =>
    catalogApi.post('/service-offerings', servicio).then(r => r.data),
  actualizar: (id, servicio) =>
    catalogApi.put(`/service-offerings/${id}`, servicio).then(r => r.data),
  eliminar: (id) =>
    catalogApi.delete(`/service-offerings/${id}`),
}


export const reservasApi = {
  listar: () =>
    bookingApi.get('').then(r => r.data),
  crear: (reserva) =>
    bookingApi.post('', reserva).then(r => r.data),
  cancelar: (id) =>
    bookingApi.delete(`/${id}`),
}

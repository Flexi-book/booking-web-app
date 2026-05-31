import { bookingApi, catalogApi } from '../api/apiClients'

export const publicBookingApi = {
  listarEmpresas: () => catalogApi.get('/public/empresas').then((r) => r.data),
  obtenerCatalogoEmpresa: (empresaId) => catalogApi.get(`/public/empresas/${empresaId}`).then((r) => r.data),
  crearReserva: (payload) => bookingApi.post('', payload).then((r) => r.data),
  obtenerHorariosOcupados: ({ serviceOfferingId, assetId, date }) =>
    bookingApi.get('/ocupados', { params: { serviceOfferingId, assetId, date } }).then((r) => r.data),
}

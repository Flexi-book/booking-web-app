import { backofficeApi } from '../api/apiClients'

export const auditoriaApi = {
  obtenerLogs: (params) =>
    backofficeApi.get('/auditoria/logs', { params }).then(r => r.data),
}

export default auditoriaApi

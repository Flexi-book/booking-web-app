import { backofficeApi } from '../api/apiClients'

export const notificacionesApi = {
  listar: (params) => 
    backofficeApi.get('/notificaciones', { params }).then(r => r.data),
  
  crear: (data) => 
    backofficeApi.post('/notificaciones', data).then(r => r.data),
  
  marcarEnviada: (id) => 
    backofficeApi.put(`/notificaciones/${id}/enviada`).then(r => r.data),
  
  marcarFallida: (id) => 
    backofficeApi.put(`/notificaciones/${id}/fallida`).then(r => r.data),
}

export default notificacionesApi

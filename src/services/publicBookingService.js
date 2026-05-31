import axios from 'axios'

// En dev → proxy Vite (evita CORS)
// En prod → URLs directas de los servicios
const isDev = import.meta.env.DEV

// catalog-service — listado público de empresas
const catalogBase = isDev
  ? '/proxy/catalog'
  : `${import.meta.env.VITE_CATALOG_URL || 'http://localhost:8084'}/api`
const catalogPublic = axios.create({ baseURL: catalogBase })

// bff-backoffice — servicios y activos por empresaId (UUID)
const backofficeBase = isDev
  ? '/proxy/backoffice'
  : `${import.meta.env.VITE_BFF_BACKOFFICE_URL || 'http://localhost:8091'}/api/backoffice`
const backofficePublic = axios.create({ baseURL: backofficeBase })

// bff-user — crear reserva
const userBase = isDev
  ? '/proxy/bff-user'
  : `${import.meta.env.VITE_BFF_USER_URL || 'http://localhost:8090'}/api/user`
const userPublic = axios.create({ baseURL: userBase })

export const publicBookingApi = {
  // Listado de empresas — catalog-service
  listarEmpresas: () =>
    catalogPublic.get('/public/empresas').then(r => r.data),

  // Servicios activos de una empresa — bff-backoffice acepta UUID
  listarServiciosPublic: (empresaId) =>
    backofficePublic.get('/servicios', { params: { empresaId } })
      .then(r => (r.data || []).filter(s => s.estadoServicioId === 'activo' || s.estado === 'activo')),

  // Activos disponibles de una empresa — bff-backoffice acepta UUID
  listarActivosPublic: (empresaId) =>
    backofficePublic.get('/activos', { params: { empresaId } })
      .then(r => (r.data || []).filter(a =>
        ['disponible', 'Disponible'].includes(a.estadoDisponibilidad ?? a.estadoDisponibilidadId)
      )),

  // Crear reserva — bff-user (reservations endpoint)
  crearReserva: (payload) =>
    userPublic.post('/reservations', payload).then(r => r.data),
}

import axios from 'axios'
import authService from './authService'

const GESTION_URL = 'http://localhost:8090/api/user'

function authHeaders() {
  return { Authorization: `Bearer ${authService.getToken()}` }
}

// --- Activos ---
export const activosApi = {
  listar: () =>
    axios.get(`${GESTION_URL}/activos`, { headers: authHeaders() }).then(r => r.data),
  crear: (activo) =>
    axios.post(`${GESTION_URL}/activos`, activo, { headers: authHeaders() }).then(r => r.data),
  actualizar: (id, activo) =>
    axios.put(`${GESTION_URL}/activos/${id}`, activo, { headers: authHeaders() }).then(r => r.data),
  eliminar: (id) =>
    axios.delete(`${GESTION_URL}/activos/${id}`, { headers: authHeaders() }),
}

// --- Servicios ---
export const serviciosApi = {
  listar: () =>
    axios.get(`${GESTION_URL}/servicios`, { headers: authHeaders() }).then(r => r.data),
  crear: (servicio) =>
    axios.post(`${GESTION_URL}/servicios`, servicio, { headers: authHeaders() }).then(r => r.data),
  actualizar: (id, servicio) =>
    axios.put(`${GESTION_URL}/servicios/${id}`, servicio, { headers: authHeaders() }).then(r => r.data),
  eliminar: (id) =>
    axios.delete(`${GESTION_URL}/servicios/${id}`, { headers: authHeaders() }),
}

// --- Reservas ---
export const reservasApi = {
  listar: () =>
    axios.get(`${GESTION_URL}/reservas`, { headers: authHeaders() }).then(r => r.data),
  crear: (reserva) =>
    axios.post(`${GESTION_URL}/reservas`, reserva, { headers: authHeaders() }).then(r => r.data),
  cancelar: (id) =>
    axios.delete(`${GESTION_URL}/reservas/${id}`, { headers: authHeaders() }),
}

import axios from 'axios'

// En dev → proxy Vite (evita CORS)
// En prod → URLs directas de los servicios
const isDev = import.meta.env.DEV

// catalog-service — listado público de empresas
const catalogBase = isDev
  ? '/proxy/catalog'
  : import.meta.env.VITE_CATALOG_API_URL
const catalogPublic = axios.create({ baseURL: catalogBase })

// bff-backoffice — servicios y activos por empresaId (UUID)
const backofficeBase = isDev
  ? '/proxy/backoffice'
  : import.meta.env.VITE_BACKOFFICE_URL
const backofficePublic = axios.create({ baseURL: backofficeBase })

// bff-user — crear reserva
const userBase = isDev
  ? '/proxy/bff-user'
  : import.meta.env.VITE_BOOKING_API_URL
const userPublic = axios.create({ baseURL: userBase })

const EMPRESAS_CACHE_KEY = 'public_empresas_cache_v1'
const EMPRESAS_CACHE_TTL_MS = 5 * 60 * 1000

function readEmpresasCache({ allowStale = false } = {}) {
  try {
    const raw = localStorage.getItem(EMPRESAS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.data)) return null
    if (typeof parsed?.expiresAt !== 'number') return null
    if (!allowStale && Date.now() > parsed.expiresAt) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeEmpresasCache(data) {
  try {
    localStorage.setItem(EMPRESAS_CACHE_KEY, JSON.stringify({
      data,
      expiresAt: Date.now() + EMPRESAS_CACHE_TTL_MS,
    }))
  } catch {
    // Ignore storage quota/runtime errors.
  }
}

export const publicBookingApi = {
  getCachedEmpresas: () => readEmpresasCache({ allowStale: false }),
  getCachedEmpresasStale: () => readEmpresasCache({ allowStale: true }),

  // Listado de empresas — catalog-service
  listarEmpresas: () =>
    catalogPublic.get('/public/empresas')
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : []
        writeEmpresasCache(data)
        return data
      })
      .catch((err) => {
        // Fallback a cache stale para no bloquear Home cuando el backend está frío.
        const stale = readEmpresasCache({ allowStale: true })
        if (Array.isArray(stale) && stale.length > 0) {
          return stale
        }
        throw err
      }),

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

import axios from 'axios'

// En dev → proxy Vite (evita CORS)
// En prod → URLs directas de los servicios
const isDev = import.meta.env.DEV

function normalizeBaseUrl(rawUrl = '', fallback = '') {
  if (!rawUrl) return fallback
  try {
    const parsed = new URL(rawUrl)
    return `${parsed.origin}${parsed.pathname}`
      .replace(/\/+$/, '')
      .replace(/\/servicios?$/i, '')
      .replace(/\/+$/, '')
  } catch {
    return rawUrl
      .replace(/[?#].*$/, '')
      .replace(/\/+$/, '')
      .replace(/\/servicios?$/i, '')
      .replace(/\/+$/, '') || fallback
  }
}

function resolveCatalogBaseUrl() {
  const raw = import.meta.env.VITE_CATALOG_API_URL || ''
  const fallback = 'https://flexibook-catalog-service.onrender.com/api'
  const normalized = normalizeBaseUrl(raw, fallback)

  if (!normalized) return fallback
  if (normalized.includes('bff-backoffice') || normalized.includes('/api/backoffice')) {
    return fallback
  }

  return normalized
}

// catalog-service — listado público de empresas
const catalogBase = isDev
  ? '/proxy/catalog'
  : resolveCatalogBaseUrl()
const catalogPublic = axios.create({ baseURL: catalogBase })

// bff-user — crear reserva
const userBase = isDev
  ? '/proxy/bff-user'
  : normalizeBaseUrl(import.meta.env.VITE_BOOKING_API_URL, '')
const userPublic = axios.create({ baseURL: userBase })

const EMPRESAS_CACHE_KEY = 'public_empresas_cache_v1'
const EMPRESAS_CACHE_TTL_MS = 5 * 60 * 1000

function normalizeEmpresa(raw = {}) {
  return {
    ...raw,
    empresaId: raw.empresaId ?? raw.empresa_id ?? raw.id ?? '',
    logoUrl: raw.logoUrl ?? raw.logo_url ?? '',
    tipoNegocio: raw.tipoNegocio ?? raw.tipo_negocio ?? raw.rubro ?? '',
    correoContacto: raw.correoContacto ?? raw.correo_contacto ?? '',
  }
}

function normalizeActivo(raw = {}) {
  const id = raw.id ?? raw.activoId ?? raw.activo_id ?? ''
  return {
    ...raw,
    id,
    activoId: id,
    activo_id: id,
    nombre: raw.nombre ?? raw.nombreActivo ?? raw.nombre_activo ?? '',
    nombreActivo: raw.nombreActivo ?? raw.nombre ?? raw.nombre_activo ?? '',
    tipoActivo: raw.tipoActivo ?? raw.tipo_activo ?? raw.tipoActivoNombre ?? '',
  }
}

function normalizeDisponibilidad(raw = {}) {
  const activoId = raw.activoId ?? raw.activo_id ?? ''
  return {
    ...raw,
    activoId,
    activo_id: activoId,
    activoNombre: raw.activoNombre ?? raw.activo_nombre ?? '',
    diaSemana: raw.diaSemana ?? raw.dia_semana ?? null,
    dia_semana: raw.dia_semana ?? raw.diaSemana ?? null,
    horaInicio: raw.horaInicio ?? raw.hora_inicio ?? '',
    hora_inicio: raw.hora_inicio ?? raw.horaInicio ?? '',
    horaFin: raw.horaFin ?? raw.hora_fin ?? '',
    hora_fin: raw.hora_fin ?? raw.horaFin ?? '',
  }
}

function normalizeService(raw = {}) {
  return {
    ...raw,
    id: raw.id ?? raw.servicioId ?? raw.servicio_id ?? '',
    servicioId: raw.servicioId ?? raw.id ?? raw.servicio_id ?? '',
    estado: raw.estado ?? raw.estadoServicioNombre ?? raw.estado_servicio_nombre ?? '',
    disponibilidades: Array.isArray(raw.disponibilidades)
      ? raw.disponibilidades.map(normalizeDisponibilidad)
      : [],
    activosAsignados: Array.isArray(raw.activosAsignados)
      ? raw.activosAsignados.map(normalizeActivo)
      : [],
  }
}

function normalizeArrayPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.content)) return payload.content
  return []
}

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
        const data = normalizeArrayPayload(r.data).map(normalizeEmpresa)
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

  // Servicios activos de una empresa — catalog-service público
  listarServiciosPublic: (empresaId) =>
    catalogPublic.get(`/public/empresas/${empresaId}`)
      .then(r => {
        const payload = r.data?.data ?? r.data
        return normalizeArrayPayload(payload?.servicios)
          .map(normalizeService)
          .filter((s) => s.estadoServicioId === 'activo' || s.estado === 'activo')
      }),

  // Activos disponibles de una empresa — catalog-service público
  listarActivosPublic: (empresaId) =>
    catalogPublic.get(`/public/empresas/${empresaId}`)
      .then(r => {
        const payload = r.data?.data ?? r.data
        return normalizeArrayPayload(payload?.activos)
          .map(normalizeActivo)
          .filter(a =>
            ['disponible', 'Disponible'].includes(a.estadoDisponibilidad ?? a.estadoDisponibilidadId)
          )
      }),

  obtenerCatalogoEmpresa: (empresaId) =>
    catalogPublic.get(`/public/empresas/${empresaId}`)
      .then(r => {
        const payload = r.data?.data ?? r.data
        const empresa = payload?.empresa ?? null
        const servicios = normalizeArrayPayload(payload?.servicios).map(normalizeService)
        const activos = normalizeArrayPayload(payload?.activos).map(normalizeActivo)
        return { empresa, servicios, activos }
      }),

  obtenerHorariosOcupados: ({ serviceOfferingId, assetId, date }) =>
    userPublic.get('/reservations/ocupados', {
      params: {
        serviceOfferingId,
        assetId,
        date,
      },
    }).then(r => normalizeArrayPayload(r.data)),

  // Crear reserva — bff-user (reservations endpoint)
  crearReserva: (payload) =>
    userPublic.post('/reservations', payload).then(r => r.data),

  listarResenasEmpresa: (empresaId) =>
    catalogPublic.get(`/public/empresas/${empresaId}/resenas`).then((r) =>
      normalizeArrayPayload(r.data)
    ),

  crearResenaEmpresa: (empresaId, payload) =>
    catalogPublic.post(`/public/empresas/${empresaId}/resenas`, payload).then((r) => r.data),
}

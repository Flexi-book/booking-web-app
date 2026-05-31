import axios from 'axios'

const BFF_BACKOFFICE_URL = import.meta.env.VITE_BFF_BACKOFFICE_URL || 'http://localhost:8091'
const BFF_USER_URL       = import.meta.env.VITE_BFF_USER_URL       || 'http://localhost:8090'

// Auth — sin interceptors de tenant
export const authClient = axios.create({
  baseURL: `${BFF_BACKOFFICE_URL}/api/backoffice/auth`,
})

// Admin (backoffice) — X-Empresa-Id se agrega en tokenStore
export const adminClient = axios.create({
  baseURL: `${BFF_BACKOFFICE_URL}/api/backoffice`,
})

// Público (cliente final, sin auth obligatoria)
export const publicClient = axios.create({
  baseURL: `${BFF_USER_URL}/api/user`,
})

// Módulo de token — AuthProvider lo actualiza al login/logout
export const tokenStore = {
  token:     null,
  companyId: null,
  set(token, companyId) {
    this.token     = token
    this.companyId = companyId
  },
  clear() {
    this.token     = null
    this.companyId = null
  },
}

// Interceptor admin: Authorization + X-Empresa-Id (header Y body para POST/PUT)
adminClient.interceptors.request.use((config) => {
  if (tokenStore.token)     config.headers.Authorization   = `Bearer ${tokenStore.token}`
  if (tokenStore.companyId) config.headers['X-Empresa-Id'] = tokenStore.companyId

  // bff-backoffice también espera empresaId en el body de POST/PUT
  if (tokenStore.companyId && ['post', 'put', 'patch'].includes(config.method)) {
    if (config.data && typeof config.data === 'object' && !Array.isArray(config.data)) {
      config.data = { ...config.data, empresaId: tokenStore.companyId }
    }
  }
  // Y como query param para GET
  if (tokenStore.companyId && config.method === 'get') {
    config.params = { ...config.params, empresaId: tokenStore.companyId }
  }
  return config
})

// Interceptor público: empresaId como query param
publicClient.interceptors.request.use((config) => {
  if (tokenStore.token)     config.headers.Authorization = `Bearer ${tokenStore.token}`
  if (tokenStore.companyId) config.params = { ...config.params, empresaId: tokenStore.companyId }
  return config
})

// Interceptor de respuesta: 401 → limpiar sesión
const handle401 = (error) => {
  if (error.response?.status === 401) {
    tokenStore.clear()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  return Promise.reject(error)
}

adminClient.interceptors.response.use(null, handle401)
publicClient.interceptors.response.use(null, handle401)

// Aliases para compatibilidad con develop
export const backofficeApi = adminClient
export const authApi       = authClient

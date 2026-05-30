import axios from 'axios'

const BFF_USER_URL = import.meta.env.VITE_BFF_USER_URL || 'http://localhost:8090'
const CATALOG_URL = import.meta.env.VITE_CATALOG_URL || 'http://localhost:8084'

export const authApi = axios.create({
  baseURL: `${BFF_USER_URL}/api/user/auth`,
})

export const catalogApi = axios.create({
  baseURL: `${CATALOG_URL}/api`,
})

export const bookingApi = axios.create({
  baseURL: `${BFF_USER_URL}/api/user/reservas`,
})

const addAuthHeader = (config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

catalogApi.interceptors.request.use(addAuthHeader)
bookingApi.interceptors.request.use(addAuthHeader)

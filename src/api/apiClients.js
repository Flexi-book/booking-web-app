import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api'

const createClient = (basePath) => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}${basePath}`,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return client
}

export const authApi = createClient('/auth')
export const bookingApi = createClient('/reservations')
export const catalogApi = createClient('/catalog')

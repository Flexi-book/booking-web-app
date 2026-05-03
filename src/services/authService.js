<<<<<<< HEAD
import axios from 'axios'

const API_URL = 'http://localhost:8090/api/user/auth'
=======
import { authApi } from '../api/apiClients'
>>>>>>> 2a370b3 (feat: integrate frontend with backend services (auth, catalog, booking))

const authService = {
  login: async (email, password) => {
    const response = await authApi.post('/login', {
      email,
      password,
    })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
  },

  register: async (data) => {
    const response = await authApi.post('/register', data)
    return response.data
  },

  googleLogin: async (idToken) => {
    const response = await authApi.post('/google', {
      idToken,
    })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getToken: () => localStorage.getItem('token'),

  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
}

export default authService

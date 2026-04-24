import axios from 'axios'

const API_URL = 'http://localhost:8080/api/auth'

const authService = {
  login: async (correo, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      correo,
      password,
    })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
  },

  register: async (data) => {
    const response = await axios.post(`${API_URL}/register`, data)
    return response.data
  },

  googleLogin: async (idToken) => {
    const response = await axios.post(`${API_URL}/google`, {
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

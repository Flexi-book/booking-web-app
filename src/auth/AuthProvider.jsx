import { useState, useCallback } from 'react'
import { AuthContext } from './AuthContext'
import { authClient, tokenStore } from '../api/apiClients'
import { ensureAuthServiceReady, warmAuthService } from '../services/authWarmup'

function loadSession() {
  try {
    const token = localStorage.getItem('token')
    const user  = JSON.parse(localStorage.getItem('user') || 'null')
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

function saveSession(data) {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data))
}

function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function AuthProvider({ children }) {
  const initial = loadSession()
  const [token, setToken]         = useState(initial.token)
  const [user, setUser]           = useState(initial.user)
  const [loading, setLoading]     = useState(false)

  // Hidratar tokenStore con la sesión persistida
  if (initial.token && initial.user) {
    tokenStore.set(initial.token, initial.user.companyId ?? initial.user.empresaId)
  }

  const companyId   = user?.companyId   ?? user?.empresaId ?? null
  const companyName = user?.companyName ?? null
  const isAuthenticated = !!token

  const applySession = (data) => {
    saveSession(data)
    setToken(data.token)
    setUser(data)
    tokenStore.set(data.token, data.companyId ?? data.empresaId)
  }

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      await ensureAuthServiceReady()

      try {
        const { data } = await authClient.post('/login', { email, password }, { timeout: 12000 })
        applySession(data)
        return data
      } catch (error) {
        const shouldRetry = error.code === 'ECONNABORTED' || error.response?.status === 503
        if (!shouldRetry) throw error

        await warmAuthService()
        await ensureAuthServiceReady({ maxWaitMs: 10000 })

        const { data } = await authClient.post('/login', { email, password }, { timeout: 12000 })
        applySession(data)
        return data
      }

    } finally {
      setLoading(false)
    }
  }, [])

  const googleLogin = useCallback(async (idToken) => {
    setLoading(true)
    try {
      const { data } = await authClient.post('/google', { idToken })
      applySession(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await authClient.post('/register', payload)
    return data
  }, [])

  const logout = useCallback(() => {
    clearSession()
    tokenStore.clear()
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      companyId,
      companyName,
      isAuthenticated,
      loading,
      login,
      googleLogin,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

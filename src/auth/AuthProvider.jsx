import { useState, useCallback } from 'react'
import { AuthContext } from './AuthContext'
import { authClient, tokenStore } from '../api/apiClients'
import { ensureAuthServiceReady, warmAuthService } from '../services/authWarmup'

function extractCompanyIdFromToken(token) {
  try {
    if (!token) return null
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized))
    return decoded.companyId ?? null
  } catch {
    return null
  }
}

function normalizeSession(data) {
  if (!data) return data
  const companyId = data.companyId ?? data.empresaId ?? extractCompanyIdFromToken(data.token)
  return {
    ...data,
    companyId,
    empresaId: data.empresaId ?? companyId,
  }
}

function loadSession() {
  try {
    const token = localStorage.getItem('token')
    const rawUser = JSON.parse(localStorage.getItem('user') || 'null')
    const user = rawUser ? normalizeSession({ ...rawUser, token: rawUser.token ?? token }) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

function saveSession(data) {
  const normalized = normalizeSession(data)
  localStorage.setItem('token', normalized.token)
  localStorage.setItem('user', JSON.stringify(normalized))
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
    const normalized = normalizeSession(data)
    saveSession(normalized)
    setToken(normalized.token)
    setUser(normalized)
    tokenStore.set(normalized.token, normalized.companyId ?? normalized.empresaId)
  }

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      await ensureAuthServiceReady()

      try {
        const { data } = await authClient.post('/login', { email, password }, { timeout: 20000 })
        applySession(data)
        return data
      } catch (error) {
        const shouldRetry = error.code === 'ECONNABORTED' || error.response?.status === 503
        if (!shouldRetry) throw error

        await warmAuthService()
        await ensureAuthServiceReady({ maxWaitMs: 20000 })

        const { data } = await authClient.post('/login', { email, password }, { timeout: 20000 })
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

  const updateSessionUser = useCallback((partialUser) => {
    setUser((current) => {
      if (!current) return current
      const nextUser = normalizeSession({ ...current, ...partialUser })
      saveSession(nextUser)
      return nextUser
    })
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
      updateSessionUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

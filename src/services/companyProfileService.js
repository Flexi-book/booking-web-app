import { authClient } from '../api/apiClients'
import { fetchWithCache, clearCacheKeys } from './requestCache'

const PROFILE_CACHE_KEY = 'company:profile:me'
const PROFILE_TTL_MS = 30000

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const companyProfileApi = {
  obtenerMiEmpresa: () =>
    fetchWithCache(
      PROFILE_CACHE_KEY,
      () => authClient.get('/../companies/me', { headers: authHeaders() }).then((r) => r.data),
      PROFILE_TTL_MS,
    ),

  actualizarLogo: (logoUrl) =>
    authClient.put(
      '/companies/me/logo',
      { logoUrl, logo_url: logoUrl },
      { headers: authHeaders() },
    ).then((r) => {
      clearCacheKeys([PROFILE_CACHE_KEY])
      return r.data
    }).catch(async () => {
      // Fallback de compatibilidad entre versiones de backend
      const r = await authClient.put(
        '/../companies/me/logo',
        { logoUrl, logo_url: logoUrl },
        { headers: authHeaders() },
      )
      clearCacheKeys([PROFILE_CACHE_KEY])
      return r.data
    }),

  subirLogo: (file) => {
    const formData = new FormData()
    formData.append('file', file)

    return authClient.post(
      '/companies/me/logo/upload',
      formData,
      {
        headers: {
          ...authHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      },
    ).then((r) => {
      clearCacheKeys([PROFILE_CACHE_KEY])
      return r.data
    })
  },
}

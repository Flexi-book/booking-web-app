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
      { logoUrl },
      { headers: authHeaders() },
    ).then((r) => {
      clearCacheKeys([PROFILE_CACHE_KEY])
      return r.data
    }),
}

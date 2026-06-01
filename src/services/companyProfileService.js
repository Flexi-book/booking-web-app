import { authClient } from '../api/apiClients'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const companyProfileApi = {
  obtenerMiEmpresa: () =>
    authClient.get('/../companies/me', { headers: authHeaders() }).then((r) => r.data),

  actualizarLogo: (logoUrl) =>
    authClient.put(
      '/../companies/me/logo',
      { logoUrl },
      { headers: authHeaders() },
    ).then((r) => r.data),
}


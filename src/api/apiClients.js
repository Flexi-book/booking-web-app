import axios from 'axios';

const USER_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090/api/user';
const BACKOFFICE_API_URL = import.meta.env.VITE_BACKOFFICE_URL || 'http://localhost:8091/api/backoffice';

const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const empresaId = user.empresaId || user.companyId;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (empresaId) {
      config.headers['X-Empresa-Id'] = empresaId;
    }
    return config;
  });

  return client;
};

export const authApi = createClient(`${USER_API_URL}/auth`);
export const catalogApi = createClient(USER_API_URL);
export const bookingApi = createClient(`${USER_API_URL}/reservas`);
export const backofficeApi = createClient(BACKOFFICE_API_URL);

export default {
  authApi,
  catalogApi,
  bookingApi,
  backofficeApi,
};

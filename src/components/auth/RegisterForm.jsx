import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../../services/authService'
import GoogleLoginButton from './GoogleLoginButton'

const BUSINESS_TYPES = [
  'Barbería',
  'Peluquería',
  'Centro Médico',
  'Cancha Deportiva',
  'Sala de Reuniones',
  'Spa',
  'Otro',
]

export default function RegisterForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    correoContacto: '',
    tipoNegocio: '',
    nombreUsuario: '',
    correoUsuario: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...data } = formData
      const dataToSend = {
        companyName: data.nombreEmpresa,
        contactEmail: data.correoContacto,
        businessType: data.tipoNegocio,
        userName: data.nombreUsuario,
        userEmail: data.correoUsuario,
        password: data.password,
      }
      await authService.register(dataToSend)
      navigate('/register-success', { state: { email: formData.correoUsuario } })
    } catch (err) {
      setError(err.response?.data || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/flexibook-logo.svg" alt="Flexibook" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Bienvenido a Flexibook</h1>
          <p className="text-gray-600 text-sm sm:text-base">Crea tu cuenta de administrador</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div>
            <GoogleLoginButton isRegister={true} />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">O completa el formulario</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombreEmpresa" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Negocio
              </label>
              <input
                id="nombreEmpresa"
                name="nombreEmpresa"
                type="text"
                required
                placeholder="Ej. Mi Studio Fitness"
                value={formData.nombreEmpresa}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="tipoNegocio" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Negocio
              </label>
              <select
                id="tipoNegocio"
                name="tipoNegocio"
                required
                value={formData.tipoNegocio}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
              >
                <option value="" disabled>
                  Selecciona un tipo de negocio
                </option>
                {BUSINESS_TYPES.map((businessType) => (
                  <option key={businessType} value={businessType}>
                    {businessType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="correoContacto" className="block text-sm font-medium text-gray-700 mb-2">
                Email de Contacto
              </label>
              <input
                id="correoContacto"
                name="correoContacto"
                type="email"
                required
                placeholder="contacto@empresa.com"
                value={formData.correoContacto}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="nombreUsuario" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario
              </label>
              <input
                id="nombreUsuario"
                name="nombreUsuario"
                type="text"
                required
                placeholder="Tu nombre"
                value={formData.nombreUsuario}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="correoUsuario" className="block text-sm font-medium text-gray-700 mb-2">
                Email Corporativo
              </label>
              <input
                id="correoUsuario"
                name="correoUsuario"
                type="email"
                required
                placeholder="admin@empresa.com"
                value={formData.correoUsuario}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="8"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength="8"
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              Inicia sesión
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500 space-y-1">
          <p>© 2024 Flexibook. Todos los derechos reservados.</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="hover:text-gray-700 transition">Privacidad</a>
            <a href="#" className="hover:text-gray-700 transition">Términos</a>
            <a href="#" className="hover:text-gray-700 transition">Soporte</a>
          </div>
        </div>
      </div>
    </div>
  )
}

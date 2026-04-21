import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../../services/authService'

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
      const { confirmPassword, ...dataToSend } = formData
      await authService.register(dataToSend)
      navigate('/login', { state: { message: 'Registro exitoso. Por favor, inicia sesión.' } })
    } catch (err) {
      setError(err.response?.data || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Flexibook</h2>
          <p className="mt-2 text-gray-600">Crea tu cuenta para empezar</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="nombreEmpresa" className="block text-sm font-medium text-gray-700">
                Nombre de empresa
              </label>
              <input
                id="nombreEmpresa"
                name="nombreEmpresa"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.nombreEmpresa}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="correoContacto" className="block text-sm font-medium text-gray-700">
                Email de contacto
              </label>
              <input
                id="correoContacto"
                name="correoContacto"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.correoContacto}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="tipoNegocio" className="block text-sm font-medium text-gray-700">
                Tipo de negocio
              </label>
              <input
                id="tipoNegocio"
                name="tipoNegocio"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.tipoNegocio}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="nombreUsuario" className="block text-sm font-medium text-gray-700">
                Nombre de usuario
              </label>
              <input
                id="nombreUsuario"
                name="nombreUsuario"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.nombreUsuario}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="correoUsuario" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="correoUsuario"
                name="correoUsuario"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.correoUsuario}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña (mín. 8 caracteres)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="8"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength="8"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className="text-center">
            <span className="text-gray-600">¿Ya tienes cuenta? </span>
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

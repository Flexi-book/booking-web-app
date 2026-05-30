import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../../services/authService'
import GoogleLoginButton from './GoogleLoginButton'
import AuthPageShell from '../common/AuthPageShell'
import ErrorBanner from '../common/ErrorBanner'

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
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      await authService.register({
        companyName: data.nombreEmpresa,
        contactEmail: data.correoContacto,
        businessType: data.tipoNegocio,
        userName: data.nombreUsuario,
        userEmail: data.correoUsuario,
        password: data.password,
      })
      navigate('/register-success', { state: { email: formData.correoUsuario } })
    } catch (err) {
      setError(err.response?.data || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const field = (id, label, type = 'text', placeholder = '') => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        required
        placeholder={placeholder}
        value={formData[id]}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
    </div>
  )

  return (
    <AuthPageShell subtitle="Crea tu cuenta de administrador">
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <ErrorBanner message={error} />

        <GoogleLoginButton isRegister />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500 font-medium">O completa el formulario</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('nombreEmpresa', 'Nombre del Negocio', 'text', 'Ej. Mi Studio Fitness')}
          {field('tipoNegocio', 'Tipo de Negocio', 'text', 'Ej. Fitness, Salón de belleza')}
          {field('correoContacto', 'Email de Contacto', 'email', 'contacto@empresa.com')}
          {field('nombreUsuario', 'Nombre de Usuario', 'text', 'Tu nombre')}
          {field('correoUsuario', 'Email Corporativo', 'email', 'admin@empresa.com')}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
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
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
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
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition">
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthPageShell>
  )
}

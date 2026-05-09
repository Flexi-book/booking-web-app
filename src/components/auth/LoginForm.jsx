import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../../services/authService'
import GoogleLoginButton from './GoogleLoginButton'
import { Button } from "@/components/ui/button"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { ArrowLeft } from "lucide-react"

export default function LoginForm() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      setError('Ingresa un correo válido')
      return
    }

    // Validar contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres')
      return
    }

    setLoading(true)

    try {
      await authService.login(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(
        err.response?.data ||
        'Credenciales incorrectas. Intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">

      <LoadingScreen
        visible={loading}
        title="Iniciando sesión..."
        description="Verificando tus credenciales. Por favor espera un momento."
      />

      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Button>
      </div>

      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/flexibook-logo.svg"
              alt="Flexibook"
              className="w-14 h-14 object-contain"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Bienvenido a Flexibook
          </h1>

          <p className="text-gray-600 text-sm sm:text-base">
            Accede a tu cuenta de administrador
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Corporativo
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 18a8 8 0 001.447-.052l4.449 4.449a1 1 0 001.414-1.414L2.586 2.586A8 8 0 0010 18zm0-16C4.477 2 1 5.477 1 10s3.477 8 9 8 9-3.477 9-9-3.477-9-9-9z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
              >
                ¿Olvidé mi contraseña?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Iniciando sesión...'
                : 'Entrar a mi Negocio'
              }
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">
                O continúa con
              </span>
            </div>
          </div>

          {/* Google Login */}
          <GoogleLoginButton setLoading={setLoading} />

          {/* Register Link */}
          <p className="text-center text-gray-600 text-sm">
            ¿No tienes cuenta?{' '}

            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 space-y-1">
          <p>© 2024 Flexibook. Todos los derechos reservados.</p>

          <div className="flex justify-center gap-4">
            <a href="#" className="hover:text-gray-700 transition">
              Privacidad
            </a>

            <a href="#" className="hover:text-gray-700 transition">
              Términos
            </a>

            <a href="#" className="hover:text-gray-700 transition">
              Soporte
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
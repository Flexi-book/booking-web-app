import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import GoogleLoginButton from './GoogleLoginButton'
import { Button } from "@/components/ui/button"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { warmDashboardData } from '../../services/dashboardWarmup'
import { warmAuthService } from '../../services/authWarmup'
import { warmBackofficeService } from '../../services/backofficeWarmup'
import LogoMark from '../ui/LogoMark'

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    warmAuthService()
    warmBackofficeService()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const session = await login(email, password)
      warmDashboardData(session?.companyId)
      setLoading(false)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Credenciales incorrectas. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <LoadingScreen
        visible={loading}
        title="Iniciando sesión..."
        description="Verificando tus credenciales. Por favor espera un momento."
      />
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors dark:text-slate-300 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Button>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <LogoMark className="w-14 h-14" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 dark:text-slate-100">Bienvenido a Flexibook</h1>
          <p className="text-gray-600 text-sm sm:text-base dark:text-slate-400">Accede a tu cuenta de administrador</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-white/70 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.45)] p-8 space-y-6
                        dark:bg-slate-950 dark:border-slate-800 dark:shadow-[0_32px_100px_-45px_rgba(0,0,0,0.95)]">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-500/10 dark:border-red-500/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
                Email Corporativo
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={warmAuthService}
                placeholder="nombre@empresa.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={warmAuthService}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                             dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition dark:text-slate-500 dark:hover:text-slate-300"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition dark:text-blue-300 dark:hover:text-blue-200"
              >
                ¿Olvidé mi contraseña?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={warmAuthService}
              onFocus={warmAuthService}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Entrar a mi Negocio'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium dark:bg-slate-950 dark:text-slate-400">O continúa con</span>
            </div>
          </div>

          {/* Google Login */}
          <GoogleLoginButton setLoading={setLoading} />

          {/* Register Link */}
          <p className="text-center text-gray-600 text-sm dark:text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 transition dark:text-blue-300 dark:hover:text-blue-200"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 space-y-1 dark:text-slate-500">
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

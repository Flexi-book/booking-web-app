import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function ForgotPasswordForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Email Enviado!</h2>
              <p className="text-gray-600 text-sm mb-2">
                Hemos enviado un enlace de recuperación a:
              </p>
              <p className="font-semibold text-gray-900">{email}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Revisa tu bandeja de entrada y sigue las instrucciones para resetear tu contraseña.
                Si no ves el email, revisa la carpeta de spam.
              </p>
            </div>

            <Link
              to="/login"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition inline-block text-center"
            >
              Volver al Inicio de Sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Bienvenido a Flexibook</h1>
          <p className="text-gray-600 text-sm sm:text-base">Ingresa tu email para recibir un enlace de recuperación</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
              Enviar Enlace de Recuperación
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Volver al Inicio de Sesión
            </Link>
          </div>
        </div>

        {/* Footer */}
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

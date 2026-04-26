import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function RegisterSuccessForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email] = useState(location.state?.email || 'tu email')
  const [seconds, setSeconds] = useState(10)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          navigate('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Bienvenido a Flexibook</h1>
          <p className="text-gray-600 text-sm sm:text-base">¡Tu cuenta ha sido creada exitosamente!</p>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Confirmation Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
            <p className="text-sm text-gray-700">
              Hemos enviado un email de confirmación a:
            </p>
            <p className="font-semibold text-lg text-gray-900 break-all">{email}</p>
            <p className="text-xs text-gray-500">
              Revisa tu bandeja de entrada para confirmar tu cuenta
            </p>
          </div>

          {/* What's Next */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Próximos pasos:</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Confirma tu email</p>
                  <p className="text-xs text-gray-600">Abre el enlace que enviamos a tu bandeja</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Inicia sesión</p>
                  <p className="text-xs text-gray-600">Usa tus credenciales para acceder</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Comienza a gestionar</p>
                  <p className="text-xs text-gray-600">Administra tus activos, servicios y reservas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Redirect Button and Timer */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition inline-block text-center"
            >
              Ir al Inicio de Sesión
            </Link>
            <p className="text-xs text-gray-500 text-center">
              Serás redirigido automáticamente en {seconds}s
            </p>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-8 bg-white rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">¿Necesitas ayuda?</p>
          <div className="flex justify-center gap-4 text-xs">
            <a href="#" className="text-blue-600 hover:text-blue-700 transition font-medium">Centro de Ayuda</a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-blue-600 hover:text-blue-700 transition font-medium">Contactar Soporte</a>
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

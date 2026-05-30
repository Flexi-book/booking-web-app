import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthPageShell from '../common/AuthPageShell'

export default function RegisterSuccessForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email] = useState(location.state?.email || 'tu email')
  const [seconds, setSeconds] = useState(10)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) { navigate('/login'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [navigate])

  return (
    <AuthPageShell subtitle="¡Tu cuenta ha sido creada exitosamente!">
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
          <p className="text-sm text-gray-700">Hemos enviado un email de confirmación a:</p>
          <p className="font-semibold text-lg text-gray-900 break-all">{email}</p>
          <p className="text-xs text-gray-500">Revisa tu bandeja de entrada para confirmar tu cuenta</p>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Próximos pasos:</h2>
          <div className="space-y-3">
            {[
              { label: 'Confirma tu email', detail: 'Abre el enlace que enviamos a tu bandeja' },
              { label: 'Inicia sesión', detail: 'Usa tus credenciales para acceder' },
              { label: 'Comienza a gestionar', detail: 'Administra tus activos, servicios y reservas' },
            ].map(({ label, detail }, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{i + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-600">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/login"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition inline-block text-center"
          >
            Ir al Inicio de Sesión
          </Link>
          <p className="text-xs text-gray-500 text-center">Serás redirigido automáticamente en {seconds}s</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 mb-2">¿Necesitas ayuda?</p>
        <div className="flex justify-center gap-4 text-xs">
          <a href="#" className="text-blue-600 hover:text-blue-700 transition font-medium">Centro de Ayuda</a>
          <span className="text-gray-300">•</span>
          <a href="#" className="text-blue-600 hover:text-blue-700 transition font-medium">Contactar Soporte</a>
        </div>
      </div>
    </AuthPageShell>
  )
}

import LogoMark from '../ui/LogoMark'

export default function AuthPageShell({ subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <LogoMark className="w-14 h-14" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Bienvenido a Flexibook</h1>
          {subtitle && <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>}
        </div>

        {children}

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

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicBookingApi } from '../../services/publicBookingService'

function BuildingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 12h.01M9 15h.01M12 9h.01M12 12h.01M12 15h.01M15 9h.01M15 12h.01M15 15h.01" />
    </svg>
  )
}

export default function LandingPage() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        setEmpresas(await publicBookingApi.listarEmpresas())
      } catch {
        setError('No se pudieron cargar las empresas.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const empresasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return empresas
    return empresas.filter((e) =>
      `${e.nombre} ${e.tipoNegocio || ''}`.toLowerCase().includes(q),
    )
  }, [empresas, busqueda])

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/flexibook-logo.svg" alt="Flexibook" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold text-gray-900">Flexibook</span>
          </Link>

          <Link to="/login" className="shrink-0 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition">
            Ingreso empresa
          </Link>
        </div>
      </header>

      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Reserva tu hora sin crear cuenta
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Elige una empresa, selecciona servicio y profesional, y agenda en minutos.
          </p>
          <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar barbería, peluquería, spa..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-6 py-10">
        {error && <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-800">{error}</div>}

        {loading ? (
          <p className="text-sm text-gray-500">Cargando empresas...</p>
        ) : empresasFiltradas.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">No hay empresas para mostrar.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {empresasFiltradas.map((empresa) => (
              <Link
                key={empresa.empresaId}
                to={`/empresa/${empresa.empresaId}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition p-5"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <BuildingIcon />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{empresa.tipoNegocio || 'Empresa'}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{empresa.nombre}</h3>
                <p className="text-sm text-gray-500 mt-2">{empresa.correoContacto}</p>
                <p className="mt-4 text-sm font-semibold text-blue-600">Reservar hora →</p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-auto bg-gray-900 text-gray-400 py-7">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <img src="/flexibook-logo.svg" alt="Flexibook" className="w-7 h-7 object-contain" />
            <span className="text-white font-semibold">Flexibook</span>
          </div>
          <p>© 2026 Flexibook. Todos los derechos reservados.</p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition font-medium">Acceso administrador →</Link>
        </div>
      </footer>
    </div>
  )
}

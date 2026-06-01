import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Clock } from 'lucide-react'
import { publicBookingApi } from '../../services/publicBookingService'
import { getEmpresaIcono } from '../admin/PerfilPanel'

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
          <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md px-4 py-3 flex items-center gap-3">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar barbería, peluquería, spa..."
              className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
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
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm
                           hover:shadow-lg hover:border-blue-100 transition-all duration-200 overflow-hidden"
              >
                {/* Banner con icono elegido */}
                <div className="w-full h-32 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100
                                flex items-center justify-center text-6xl select-none">
                  {empresa.logoUrl ? (
                    <img
                      src={empresa.logoUrl}
                      alt={`Logo de ${empresa.nombre}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getEmpresaIcono(empresa.empresaId, empresa.tipoNegocio)
                  )}
                </div>

                <div className="p-5">
                  {/* Tipo badge */}
                  {empresa.tipoNegocio && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold
                                     bg-blue-50 text-blue-600 border border-blue-100 mb-3">
                      {empresa.tipoNegocio}
                    </span>
                  )}

                  {/* Nombre */}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {empresa.nombre}
                  </h3>

                  {/* Descripción o fallback */}
                  <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 min-h-[40px]">
                    {empresa.descripcion || 'Reserva tu hora de forma rápida y sencilla.'}
                  </p>

                  {/* CTA */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-600 group-hover:underline">
                      Reservar hora →
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      Disponible
                    </div>
                  </div>
                </div>
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

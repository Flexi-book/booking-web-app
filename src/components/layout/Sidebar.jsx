import { Link, useLocation } from 'react-router-dom'
import authService from '../../services/authService'

export default function Sidebar() {
  const location = useLocation()
  const user = authService.getUser()

  const isActive = (path) => location.pathname === path

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        isActive(to)
          ? 'bg-blue-100 text-blue-600 font-semibold border-l-4 border-blue-600'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  )

  return (
    <div className="w-64 bg-white border-r border-gray-200 fixed h-screen overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Flexibook</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem
          to="/dashboard"
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
            </svg>
          )}
          label="Dashboard"
        />

        <NavItem
          to="/dashboard/reservas"
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
            </svg>
          )}
          label="Reservas"
        />

        <NavItem
          to="/dashboard/servicios"
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5H4v8a2 2 0 002 2h12a2 2 0 002-2V7h-2v1a1 1 0 11-2 0V7H9v1a1 1 0 11-2 0V7H6v1a1 1 0 11-2 0V7z" clipRule="evenodd"></path>
            </svg>
          )}
          label="Servicios"
        />

        <NavItem
          to="/dashboard/activos"
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h1a1 1 0 001-1v-6a1 1 0 00-1-1h-1z"></path>
            </svg>
          )}
          label="Activos"
        />

        <NavItem
          to="/dashboard/historial"
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6z" clipRule="evenodd"></path>
            </svg>
          )}
          label="Historial"
        />
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-600">
            {user?.nombre?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm">{user?.nombre || 'Admin'}</p>
            <p className="text-xs text-gray-500 truncate">Super Admin</p>
          </div>
        </div>

        <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"></path>
          </svg>
          Configuración
        </button>

        <button
          onClick={() => {
            authService.logout()
            window.location.href = '/login'
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}

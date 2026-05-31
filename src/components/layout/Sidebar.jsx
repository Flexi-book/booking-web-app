import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CalendarCheck, Scissors,
  Boxes, CalendarDays, Bell, History,
  Settings2, LogOut, ChevronRight, Building2,
} from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard',                icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/reservas',       icon: CalendarCheck,   label: 'Reservas' },
  { to: '/dashboard/servicios',      icon: Scissors,        label: 'Servicios' },
  { to: '/dashboard/activos',        icon: Boxes,           label: 'Activos' },
  { to: '/dashboard/calendario',     icon: CalendarDays,    label: 'Calendario' },
  { to: '/dashboard/notificaciones', icon: Bell,            label: 'Notificaciones' },
  { to: '/dashboard/historial',      icon: History,         label: 'Historial' },
  { to: '/dashboard/perfil',         icon: Building2,       label: 'Mi Empresa' },
]

function NavItem({ to, icon: Icon, label, exact = false }) {
  const location = useLocation()
  const active = exact
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      )}
    >
      <Icon className={cn(
        'w-5 h-5 flex-shrink-0 transition-colors',
        active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
      )} />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
    </Link>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, companyName, logout } = useAuth()

  const initials = (user?.name || user?.nombre || 'A')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 fixed h-screen overflow-y-auto flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <CalendarCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">Flexibook</p>
            <p className="text-xs text-slate-400 leading-tight">Panel Admin</p>
          </div>
        </Link>
      </div>

      {/* Empresa */}
      {companyName && (
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-0.5">Empresa</p>
          <p className="text-sm font-semibold text-slate-700 truncate">{companyName}</p>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" exact />
        {NAV_ITEMS.slice(1).map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        {/* Avatar del usuario */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700
                          flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 truncate">
              {user?.name || user?.nombre || 'Admin'}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
          </div>
        </div>

        {/* Configuración */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                           font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <Settings2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
          Configuración
        </button>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                     font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 flex-shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

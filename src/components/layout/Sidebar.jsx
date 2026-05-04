import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  CalendarDays, 
  Clock, 
  Users, 
  History, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react'
import authService from '../../services/authService'

export default function Sidebar() {
  const location = useLocation()
  const user = authService.getUser()

  const isActive = (path) => location.pathname === path

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
        isActive(to)
          ? 'bg-slate-900 text-white shadow-md'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 transition-colors ${isActive(to) ? 'text-white' : 'group-hover:text-slate-900'}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {isActive(to) && <ChevronRight className="w-3 h-3 text-white/50" />}
    </Link>
  )

  return (
    <div className="w-64 bg-white border-r border-slate-200 fixed h-screen overflow-y-auto flex flex-col z-40">
      {/* Brand Logo */}
      <div className="px-6 py-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0">
            <img 
              src="/flexibook-logo.svg" 
              alt="Flexibook" 
              className="h-full w-full object-contain filter drop-shadow-sm" 
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-semibold text-slate-900 leading-none tracking-tight truncate">
              {user?.companyName || user?.nombreEmpresa || 'Mi Negocio'}
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1.5">Panel de Gestión</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">General</p>
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/dashboard/reservas" icon={CalendarDays} label="Reservas" />
        <NavItem to="/dashboard/servicios" icon={Clock} label="Servicios" />
        <NavItem to="/dashboard/activos" icon={Users} label="Recursos" />
        <NavItem to="/dashboard/historial" icon={History} label="Historial" />
      </nav>

      {/* User & Settings Section */}
      <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-semibold text-slate-900 shadow-sm shrink-0">
            {user?.nombre?.charAt(0) || user?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 text-sm truncate">{user?.nombre || user?.name || 'Administrador'}</p>
            <p className="text-[11px] font-medium text-slate-400 lowercase truncate leading-tight">{user?.email || 'admin@flexibook.app'}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            to="/dashboard/configuracion"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/dashboard/configuracion') 
              ? 'bg-slate-900 text-white' 
              : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuración
          </Link>
          
          <button
            onClick={() => {
              authService.logout()
              window.location.href = '/login'
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}

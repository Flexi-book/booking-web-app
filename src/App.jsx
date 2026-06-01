import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { useAuth } from './auth/useAuth'
import Sidebar from './components/layout/Sidebar'

// Lazy loading — reduce bundle inicial
const LandingPage         = lazy(() => import('./components/landing/LandingPage'))
const LoginForm           = lazy(() => import('./components/auth/LoginForm'))
const RegisterForm        = lazy(() => import('./components/auth/RegisterForm'))
const RegisterSuccessForm = lazy(() => import('./components/auth/RegisterSuccessForm'))
const ForgotPasswordForm  = lazy(() => import('./components/auth/ForgotPasswordForm'))
const Dashboard           = lazy(() => import('./components/dashboard/Dashboard'))
const ActivosPanel        = lazy(() => import('./components/admin/ActivosPanel'))
const ServiciosPanel      = lazy(() => import('./components/admin/ServiciosPanel'))
const ReservasPanel       = lazy(() => import('./components/reservas/ReservasPanel'))
const CalendarioPanel     = lazy(() => import('./components/admin/CalendarioPanel'))
const NotificacionesPanel = lazy(() => import('./components/admin/NotificacionesPanel'))
const PerfilPanel         = lazy(() => import('./components/admin/PerfilPanel'))
const EmpresaPage         = lazy(() => import('./components/booking/EmpresaPage'))
const EmpresaDetailPage   = lazy(() => import('./components/booking/EmpresaDetailPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function DashboardLayout() {
  const { user } = useAuth()

  const initials = (user?.name || user?.nombre || 'A')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-6 py-3.5 flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar reservas, clientes..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg
                           text-sm text-slate-700 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700
                              flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-6 lg:p-8">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="activos"        element={<ActivosPanel />} />
              <Route path="servicios"      element={<ServiciosPanel />} />
              <Route path="reservas"       element={<ReservasPanel />} />
              <Route path="calendario"     element={<CalendarioPanel />} />
              <Route path="notificaciones" element={<NotificacionesPanel />} />
              <Route path="perfil"         element={<PerfilPanel />} />
              <Route path="historial"      element={
                <div className="flex items-center justify-center h-64 text-slate-400">
                  Historial — próximamente
                </div>
              } />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login"            element={<LoginForm />} />
          <Route path="/register"         element={<RegisterForm />} />
          <Route path="/register-success" element={<RegisterSuccessForm />} />
          <Route path="/forgot-password"  element={<ForgotPasswordForm />} />
          <Route path="/"                 element={<LandingPage />} />
          <Route path="/empresa/:id"          element={<EmpresaDetailPage />} />
          <Route path="/empresa/:id/reservar" element={<EmpresaPage />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

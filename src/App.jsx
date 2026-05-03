import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/landing/LandingPage'
import PublicBookingPage from './components/landing/PublicBookingPage'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import RegisterSuccessForm from './components/auth/RegisterSuccessForm'
import ForgotPasswordForm from './components/auth/ForgotPasswordForm'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './components/dashboard/Dashboard'
import ActivosPanel from './components/admin/ActivosPanel'
import ServiciosPanel from './components/admin/ServiciosPanel'
import ReservasPanel from './components/reservas/ReservasPanel'
import authService from './services/authService'

function ProtectedRoute({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />
}

function DashboardLayout() {
  const user = authService.getUser()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar reservas, clientes..."
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-6">
              <button className="text-gray-600 hover:text-gray-900 relative">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H9.5A1.5 1.5 0 008 3v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-4V3a1.5 1.5 0 00-1.5-1.5zM10 8a2 2 0 110-4 2 2 0 010 4z"></path>
                </svg>
              </button>
              <button className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 hover:bg-blue-200 relative">
                {user?.nombre?.charAt(0) || 'A'}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="activos" element={<ActivosPanel />} />
            <Route path="servicios" element={<ServiciosPanel />} />
            <Route path="reservas" element={<ReservasPanel />} />
            <Route path="historial" element={<div>Historial - Coming soon</div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/register-success" element={<RegisterSuccessForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
        <Route path="/empresa/:empresaId" element={<PublicBookingPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

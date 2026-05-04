import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/landing/LandingPage'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import RegisterSuccessForm from './components/auth/RegisterSuccessForm'
import ForgotPasswordForm from './components/auth/ForgotPasswordForm'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './components/dashboard/Dashboard'
import ActivosPanel from './components/admin/ActivosPanel'
import ServiciosPanel from './components/admin/ServiciosPanel'
import ReservasPanel from './components/reservas/ReservasPanel'
import ConfigPanel from './components/admin/ConfigPanel'
import NotificacionesPanel from './components/admin/NotificacionesPanel'
import authService from './services/authService'

function ProtectedRoute({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter 
      future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/register-success" element={<RegisterSuccessForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />

        {/* Rutas de administración — usan el nuevo AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reservas" element={<ReservasPanel />} />
          <Route path="activos" element={<ActivosPanel />} />
          <Route path="servicios" element={<ServiciosPanel />} />
          <Route path="config" element={<ConfigPanel />} />
          <Route path="notificaciones" element={<NotificacionesPanel />} />
          <Route path="historial" element={<div className="p-8 text-center text-slate-500">Historial — Próximamente</div>} />
        </Route>

        {/* Redirección legacy de /dashboard al nuevo /admin */}
        <Route path="/dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

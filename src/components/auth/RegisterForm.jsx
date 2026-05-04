import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Loader2, ArrowRight, UserPlus, Building2, Mail, Lock, User } from "lucide-react"
import authService from '../../services/authService'
import GoogleLoginButton from './GoogleLoginButton'

const BUSINESS_TYPES = [
  'Barbería',
  'Peluquería',
  'Centro Médico',
  'Cancha Deportiva',
  'Sala de Reuniones',
  'Spa',
  'Otro',
]

export default function RegisterForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    correoContacto: '',
    tipoNegocio: '',
    nombreUsuario: '',
    correoUsuario: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...data } = formData
      const dataToSend = {
        companyName: data.nombreEmpresa,
        contactEmail: data.correoContacto,
        businessType: data.tipoNegocio,
        userName: data.nombreUsuario,
        userEmail: data.correoUsuario,
        password: data.password,
      }
      
      console.log('Enviando registro:', dataToSend)
      await authService.register(dataToSend)
      console.log('Registro exitoso, navegando...')
      
      navigate('/register-success', { 
        state: { email: formData.correoUsuario },
        replace: true 
      })
    } catch (err) {
      console.error('Error en registro:', err)
      const errorMessage = typeof err.response?.data === 'string' 
        ? err.response.data 
        : err.response?.data?.message || 'Error al conectar con el servidor'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <LoadingScreen
        visible={loading}
        title="Creando tu cuenta..."
        description="Estamos registrando tu empresa en Flexibook. Solo tomará un momento."
      />
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/flexibook-logo.svg" alt="Flexibook" className="w-14 h-14 object-contain" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Flexibook
            </span>
          </Link>
        </div>

<<<<<<< HEAD
        <Card className="border-none shadow-xl shadow-slate-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Crea tu cuenta</CardTitle>
            <CardDescription>
              Comienza a gestionar tu negocio hoy mismo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-100">
                <AlertDescription className="text-red-800 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Datos de Empresa */}
                <div className="space-y-4 col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm border-b pb-2">
                    <Building2 className="w-4 h-4" />
                    Información del Negocio
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreEmpresa">Nombre del Negocio</Label>
                  <Input
                    id="nombreEmpresa"
                    name="nombreEmpresa"
                    placeholder="Mi Local"
                    required
                    value={formData.nombreEmpresa}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoNegocio">Rubro / Tipo</Label>
                  <Input
                    id="tipoNegocio"
                    name="tipoNegocio"
                    placeholder="Barbería, Gym, etc."
                    required
                    value={formData.tipoNegocio}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="correoContacto">Email de la Empresa</Label>
                  <Input
                    id="correoContacto"
                    name="correoContacto"
                    type="email"
                    placeholder="contacto@miempresa.com"
                    required
                    value={formData.correoContacto}
                    onChange={handleChange}
                  />
                </div>

                {/* Datos de Usuario */}
                <div className="space-y-4 col-span-1 md:col-span-2 mt-4">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm border-b pb-2">
                    <User className="w-4 h-4" />
                    Cuenta Administrador
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreUsuario">Tu Nombre</Label>
                  <Input
                    id="nombreUsuario"
                    name="nombreUsuario"
                    placeholder="Ej. Juan Pérez"
                    required
                    value={formData.nombreUsuario}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correoUsuario">Email de Acceso</Label>
                  <Input
                    id="correoUsuario"
                    name="correoUsuario"
                    type="email"
                    placeholder="admin@miempresa.com"
                    required
                    value={formData.correoUsuario}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 mt-6" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">O continúa con</span>
              </div>
            </div>

            <GoogleLoginButton isRegister={true} setLoading={setLoading} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-slate-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Inicia sesión
              </Link>
            </div>
            <p className="text-xs text-center text-slate-400 px-8">
              Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


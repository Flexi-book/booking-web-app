import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button.jsx"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { CheckCircle2, Mail, ArrowRight, Home } from "lucide-react"

export default function RegisterSuccessForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email] = useState(location.state?.email || 'tu email')
  const [seconds, setSeconds] = useState(10)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          navigate('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [navigate])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-xl shadow-slate-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">¡Cuenta Creada!</CardTitle>
            <CardDescription className="text-base">
              Tu registro se ha completado con éxito
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Hemos enviado un correo a:</p>
                <p className="font-semibold text-slate-900 break-all">{email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">¿Qué sigue ahora?</h3>
              <ul className="space-y-3">
                {[
                  { step: "1", text: "Confirma tu dirección de correo" },
                  { step: "2", text: "Inicia sesión con tu nueva cuenta" },
                  { step: "3", text: "Configura tus primeros servicios" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              asChild 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100"
            >
              <Link to="/login">
                Ir al Inicio de Sesión
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <div className="text-center">
              <p className="text-xs text-slate-400">
                Serás redirigido automáticamente en <span className="font-bold text-slate-600">{seconds}s</span>
              </p>
            </div>
            <Button asChild variant="ghost" className="text-slate-500 hover:text-slate-700">
              <Link to="/">
                <Home className="mr-2 w-4 h-4" />
                Volver al Inicio
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


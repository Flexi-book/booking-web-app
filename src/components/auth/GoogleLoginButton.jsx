import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import authService from '../../services/authService'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function GoogleLoginButton({ isRegister = false, setLoading: setParentLoading }) {
  const navigate = useNavigate()
  const [internalLoading, setInternalLoading] = useState(false)
  const [error, setError] = useState('')

  const setLoading = (val) => {
    setInternalLoading(val)
    if (setParentLoading) setParentLoading(val)
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      const response = await authService.googleLogin(credentialResponse.credential)
      
      if (isRegister) {
        navigate('/register-success', { 
          state: { email: response.email, isGoogle: true },
          replace: true 
        })
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error con Google:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || 'Error al autenticar con Google. Intenta de nuevo.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('No se pudo completar la autenticación con Google.')
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="w-full space-y-4">
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs text-center font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative w-full flex justify-center">
            {internalLoading && (
              <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-md">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            )}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              size="large"
              text={isRegister ? 'signup_with' : 'signin_with'}
              width="100%"
              disabled={internalLoading}
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/authService'

export default function GoogleLoginButton() {
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await authService.googleLogin(credentialResponse.credential)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error con Google:', error)
    }
  }

  const handleGoogleError = () => {
    console.error('Error en login con Google')
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">O continúa con</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            size="large"
            text="signin_with"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

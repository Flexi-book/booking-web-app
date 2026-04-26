import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/authService'

export default function GoogleLoginButton({ isRegister = false }) {
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
      <div className={isRegister ? 'w-full' : ''}>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            size={isRegister ? 'large' : 'large'}
            text={isRegister ? 'signup_with' : 'signin_with'}
            width={isRegister ? '100%' : 'auto'}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

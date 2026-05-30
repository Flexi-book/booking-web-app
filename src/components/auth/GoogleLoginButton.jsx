import { GoogleLogin } from '@react-oauth/google'
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

  return (
    <div className={`flex justify-center ${isRegister ? 'w-full' : ''}`}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.error('Error en login con Google')}
        size="large"
        text={isRegister ? 'signup_with' : 'signin_with'}
        width={isRegister ? '100%' : 'auto'}
      />
    </div>
  )
}

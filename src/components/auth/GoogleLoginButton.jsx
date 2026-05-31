import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

export default function GoogleLoginButton({ isRegister = false }) {
  const navigate = useNavigate()
  const { googleLogin } = useAuth()

  const handleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error con Google:', error)
    }
  }

  return (
    <div className={`flex justify-center ${isRegister ? 'w-full' : ''}`}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error('Error en login con Google')}
        size="large"
        text={isRegister ? 'signup_with' : 'signin_with'}
        width={isRegister ? '100%' : 'auto'}
      />
    </div>
  )
}

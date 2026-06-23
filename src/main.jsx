import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './auth/AuthProvider'
import App from './App'
import './index.css'
import { applyTheme, getStoredTheme } from './lib/theme'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

applyTheme(getStoredTheme())

const app = (
  <AuthProvider>
    <App />
  </AuthProvider>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {googleClientId
      ? <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
      : app}
  </React.StrictMode>,
)

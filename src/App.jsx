import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppRoutes from '@/routes/AppRoutes'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import Loader from "./components/common/Loader"
import IncomingCall from './components/calls/IncomingCall'
import { useSocket } from './hooks/useSocket'

// ✅ Socket alag component mein — BrowserRouter ke ANDAR hoga
function SocketInitializer() {
  useSocket();
  return null;
}

export default function App() {
  const { initTheme } = useThemeStore()
  const { login, logout, setLoading, accessToken, authLoading } = useAuthStore()

  useEffect(() => {
    initTheme()
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      if (!accessToken) {
        setLoading(false)
        return
      }
      try {
        const res = await authService.getMe()
        login(res.data.user, accessToken)
      } catch {
        try {
          const ref = await authService.refreshToken()
          useAuthStore.getState().setAccessToken(ref.data.accessToken)
          const res2 = await authService.getMe()
          login(res2.data.user, ref.data.accessToken)
        } catch {
          logout()
        }
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  if (authLoading) return <Loader fullScreen text="Loading CONNECT..." />

  return (
    <BrowserRouter>
      <SocketInitializer />
      <IncomingCall />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--toast-bg, #1E293B)',
            color: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid rgba(99,102,241,0.3)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6366F1', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  )
}
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, setLoading } =
    useAuthStore()

  const fetchUser = async () => {
    try {
      setLoading(true)
      const res = await authService.getMe()
      login(res.data.user, useAuthStore.getState().accessToken)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  return { user, isAuthenticated, isLoading, fetchUser, logout }
}
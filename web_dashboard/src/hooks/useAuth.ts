import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '@/lib/api'
import { isAuthenticated, setToken, removeToken, getUsername } from '@/lib/auth'
import type { LoginRequest, User } from '@/types/auth'
import toast from 'react-hot-toast'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      const authenticated = isAuthenticated()
      setIsLoggedIn(authenticated)

      if (authenticated) {
        try {
          // Try to fetch user info
          const username = getUsername()
          if (username) {
            setUser({
              username,
              role: 'admin', // Default role, update from API if available
            })
          }
        } catch (error) {
          console.error('Failed to fetch user:', error)
          removeToken()
          setIsLoggedIn(false)
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      const response = await apiLogin(credentials)

      // Store token
      setToken(response.access_token)

      // Set user state
      setUser({
        username: credentials.username,
        role: response.user?.role || 'admin',
      })
      setIsLoggedIn(true)

      toast.success('Login successful!')
      router.push('/')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    apiLogout()
    setUser(null)
    setIsLoggedIn(false)
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const requireAuth = () => {
    if (!loading && !isLoggedIn) {
      router.push('/login')
    }
  }

  return {
    user,
    loading,
    isLoggedIn,
    login,
    logout,
    requireAuth,
  }
}

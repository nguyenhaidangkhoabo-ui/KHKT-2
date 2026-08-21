import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { APP_CONFIG } from '../config/app.config'
import { HOME_BY_ROLE } from '../config/constants'
import { authService } from '../services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(APP_CONFIG.storageKeys.user)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => {
    return localStorage.getItem(APP_CONFIG.storageKeys.token) || null
  })
  const [loading, setLoading] = useState(true)

  const initAuth = useCallback(async () => {
    const savedToken = localStorage.getItem(APP_CONFIG.storageKeys.token)
    if (!savedToken) {
      setUser(null)
      setToken(null)
      setLoading(false)
      return
    }

    try {
      const profileData = await authService.getCurrentUser()
      if (profileData?.data?.user) {
        setUser(profileData.data.user)
        localStorage.setItem(APP_CONFIG.storageKeys.user, JSON.stringify(profileData.data.user))
      }
    } catch (err) {
      console.warn('Phiên đăng nhập hết hạn hoặc không hợp lệ:', err.message)
      localStorage.removeItem(APP_CONFIG.storageKeys.token)
      localStorage.removeItem(APP_CONFIG.storageKeys.user)
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const login = async (credentials) => {
    const res = await authService.login(credentials)
    if (res?.data) {
      const { token: receivedToken, user: receivedUser } = res.data
      
      if (receivedToken) {
        localStorage.setItem(APP_CONFIG.storageKeys.token, receivedToken)
        setToken(receivedToken)
      }
      
      if (receivedUser) {
        localStorage.setItem(APP_CONFIG.storageKeys.user, JSON.stringify(receivedUser))
        setUser(receivedUser)
      }

      return {
        user: receivedUser,
        token: receivedToken,
        redirectPath: HOME_BY_ROLE[receivedUser?.role] || '/admin/dashboard',
      }
    }
    return res
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.warn('Lỗi khi đăng xuất backend:', err.message)
    } finally {
      localStorage.removeItem(APP_CONFIG.storageKeys.token)
      localStorage.removeItem(APP_CONFIG.storageKeys.user)
      setUser(null)
      setToken(null)
    }
  }

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedUserData }
      localStorage.setItem(APP_CONFIG.storageKeys.user, JSON.stringify(next))
      return next
    })
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    updateUser,
    refreshUser: initAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext


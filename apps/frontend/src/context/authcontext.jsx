import { createContext, useState, useCallback } from 'react'
import { tokenManager } from '../utils/tokenManager'
import { authService } from '../services/auth.service'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenManager.getUser())
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (username, password) => {
    setIsLoading(true)
    try {
      const data = await authService.login(username, password)
      tokenManager.saveUser(data.user)
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* bỏ qua lỗi mạng */ }
    tokenManager.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
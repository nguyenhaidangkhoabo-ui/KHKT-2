import { createContext, useState, useCallback, useEffect } from 'react'
import { tokenManager } from '../utils/tokenManager'
import { authService } from '../services/auth.service'
import { profileService } from '../services/profile.service'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Khởi tạo user từ localStorage (tokenManager đã lưu sau login)
  const [user, setUser] = useState(() => tokenManager.getUser())
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Khi mở lại app: nếu có token nhưng chưa có user → lấy profile từ backend
  useEffect(() => {
    let active = true
    const hydrate = async () => {
      const token = tokenManager.getToken()
      if (token && !tokenManager.getUser()) {
        try {
          const data = await profileService.getMe()
          if (active) {
            tokenManager.saveUser(data)
            setUser(data)
          }
        } catch {
          tokenManager.clear()
          if (active) setUser(null)
        }
      }
      if (active) setIsInitializing(false)
    }
    hydrate()
    return () => { active = false }
  }, [])

  const login = useCallback(async (username, password) => {
    setIsLoading(true)
    try {
      const data = await authService.login(username, password) // đã lưu token+user trong service
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
    <AuthContext.Provider value={{ user, isLoading, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
import { apiClient } from './api/apiClient'
import { tokenManager } from '../utils/tokenManager'

export const authService = {
  /** POST /api/core/auth/login -> { success, data: { token, user } } */
  async login(username, password) {
    const data = await apiClient('/core/auth/login', { method: 'POST', body: { username, password } })
    // Lưu token + user ngay tại đây để các request sau có header Bearer
    if (data.token) tokenManager.saveAuth(data.token, data.user)
    else tokenManager.saveUser(data.user)
    return data
  },
  logout: () => apiClient('/core/auth/logout', { method: 'POST' }),
}
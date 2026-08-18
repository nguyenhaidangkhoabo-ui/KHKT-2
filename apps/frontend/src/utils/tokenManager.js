import { APP_CONFIG } from '../config/app.config'

const { user: USER_KEY, token: TOKEN_KEY } = APP_CONFIG.storageKeys

/**
 * Lưu JWT token + user vào localStorage.
 * Token do backend trả trong body login (sau fix backend) —
 * frontend gửi lại qua header Authorization: Bearer <token>.
 */
export const tokenManager = {
  saveAuth(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
      return null
    }
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
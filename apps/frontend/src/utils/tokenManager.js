// Token lưu trong cookie `access_token` (httpOnly do backend set).
// Frontend chỉ lưu thông tin user vào localStorage để hiển thị UI.
const USER_KEY = 'hvn_user'

export const tokenManager = {
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
    localStorage.removeItem(USER_KEY)
  },
}
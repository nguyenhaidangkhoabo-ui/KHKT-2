import { apiClient } from './api/apiClient'

export const profileService = {
  getMe: () => apiClient('/core/profile/me'),
  /** Lưu ý: backend dùng snake_case old_password / new_password */
  changePassword: (old_password, new_password) =>
    apiClient('/core/profile/password', { method: 'PATCH', body: { old_password, new_password } }),
}
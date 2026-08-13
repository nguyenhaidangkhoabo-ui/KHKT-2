import { apiClient } from './api/apiClient'

export const profileService = {
  getMe: () => apiClient('/profile/me'),
  changePassword: (oldPassword, newPassword) =>
    apiClient('/profile/password', { method: 'PATCH', body: { oldPassword, newPassword } }),
}
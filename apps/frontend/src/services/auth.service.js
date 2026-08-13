import { apiClient } from './api/apiClient'

export const authService = {
  login: (username, password) =>
    apiClient('/auth/login', { method: 'POST', body: { username, password } }),
  logout: () => apiClient('/auth/logout', { method: 'POST' }),
}
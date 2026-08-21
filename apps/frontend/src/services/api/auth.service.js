import httpClient from '../httpClient'

export const authService = {
  login: async (credentials) => {
    return await httpClient.post('/core/auth/login', credentials)
  },

  logout: async () => {
    return await httpClient.post('/core/auth/logout', {})
  },

  getCurrentUser: async () => {
    return await httpClient.get('/core/profile/me')
  },

  changePassword: async (payload) => {
    return await httpClient.patch('/core/profile/password', payload)
  },
}

export default authService


import { apiClient } from './api/apiClient'

export const studentDiplomaService = {
  getMyDiploma: () => apiClient('/diploma/diplomas/me'),
  getAvailableDates: () => apiClient('/diploma/schedules/available-dates'),
  getMyRegistrations: () => apiClient('/diploma/registrations/me'),
  registerPickup: (pickup_date) => apiClient('/diploma/registrations', { method: 'POST', body: { pickup_date } }),
  getHistory: () => apiClient('/diploma/registrations/me/history'),
  cancelRegistration: (id) => apiClient(`/diploma/registrations/${id}`, { method: 'DELETE' }),
}
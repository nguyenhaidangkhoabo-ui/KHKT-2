import { apiClient } from './api/apiClient'

export const adminScheduleService = {
  getCurrentWeek: () => apiClient('/diploma/schedules/current-week'),
  generateNextWeek: () =>
    apiClient('/diploma/schedules/next-week/generate', { method: 'POST' }),
  updateNextWeekDay: (dayOfWeek, data) =>
    apiClient(`/diploma/schedules/next-week/days/${dayOfWeek}`, { method: 'PATCH', body: data }),
  getRegistrationsByDate: (pickup_date) => apiClient('/diploma/registrations/by-date', { params: { pickup_date } }),
  exportRegistrations: (pickup_date) => `/diploma/registrations/export?pickup_date=${pickup_date}`,


}
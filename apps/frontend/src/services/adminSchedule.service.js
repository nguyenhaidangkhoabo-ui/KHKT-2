import { apiClient } from './api/apiClient'

export const adminScheduleService = {
  getCurrentWeek: () => apiClient('/diploma/schedules/current-week'),
  generateNextWeek: () => apiClient('/diploma/schedules/next-week/generate', { method: 'POST' }),
  updateNextWeekDay: (dayOfWeek, data) =>
    apiClient(`/diploma/schedules/next-week/days/${dayOfWeek}`, { method: 'PATCH', body: data }),
  getRegistrationsByDate: (date) => apiClient('/diploma/registrations/by-date', { params: { date } }),
}
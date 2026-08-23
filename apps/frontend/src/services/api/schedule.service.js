import httpClient from '../httpClient'

// Dịch vụ Lịch phát bằng — khớp backend: /api/diploma/schedules
// Cấu trúc lịch: { _id, year_week, week_start_date, week_end_date,
//   days: [{ day_of_week, enabled, start_time, end_time, capacity, registered_count }] }
export const scheduleService = {
  // Lịch tuần hiện tại
  currentWeek: async () => {
    return await httpClient.get('/diploma/schedules/current-week')
  },

  // Lịch tuần sau (bản xem trước trước khi cấu hình)
  nextWeek: async () => {
    return await httpClient.get('/diploma/schedules/next-week')
  },

  // Sinh lịch phát bằng cho tuần sau (backend không nhận body)
  generateNextWeek: async (data = {}) => {
    return await httpClient.post('/diploma/schedules/next-week/generate', data)
  },

  // Cập nhật cấu hình một ngày của TUẦN SAU.
  // Backend định danh ngày bằng day_of_week (MONDAY..SUNDAY), không phải id bản ghi:
  // PATCH /diploma/schedules/next-week/days/:dayOfWeek
  // payload: { enabled?, start_time?, end_time?, capacity? }
  updateDay: async (dayOfWeek, data) => {
    return await httpClient.patch(`/diploma/schedules/next-week/days/${dayOfWeek}`, data)
  },

  // Các ngày còn nhận đăng ký (dùng cho cổng học sinh / tra cứu nhanh)
  availableDates: async () => {
    return await httpClient.get('/diploma/schedules/available-dates')
  },
}

export default scheduleService

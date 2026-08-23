import httpClient from '../httpClient'

// Dịch vụ Đăng ký nhận bằng — khớp backend: /api/diploma/registrations
export const registrationService = {
  // Danh sách phiếu đăng ký (phân trang) — bộ lọc: { pickup_date, student_id, page, limit }
  // Response: { rows, total, page, limit, total_pages }
  list: async (params = {}) => {
    return await httpClient.get('/diploma/registrations', { params })
  },

  // Thống kê: { PENDING, CONFIRMED, COMPLETED, CANCELLED, today, upcoming }
  stats: async () => {
    return await httpClient.get('/diploma/registrations/stats')
  },

  // Danh sách đăng ký theo một ngày (YYYY-MM-DD)
  byDate: async (date) => {
    return await httpClient.get('/diploma/registrations/by-date', {
      params: { pickup_date: date },
    })
  },

  // Các ngày còn nhận đăng ký (từ module lịch phát bằng)
  availableDates: async () => {
    return await httpClient.get('/diploma/schedules/available-dates')
  },

  // Học sinh đăng ký nhận bằng — payload: { pickup_date: 'YYYY-MM-DD' }
  create: async (data) => {
    return await httpClient.post('/diploma/registrations', data)
  },

  // Hủy phiếu đăng ký
  cancel: async (id) => {
    return await httpClient.delete(`/diploma/registrations/${id}`)
  },

  // Phiếu đăng ký hiện tại của học sinh đang đăng nhập
  mine: async () => {
    return await httpClient.get('/diploma/registrations/me')
  },

  // Xuất danh sách đăng ký theo ngày ra file Excel (blob để tải xuống)
  exportExcel: async (params = {}) => {
    return await httpClient.get('/diploma/registrations/export', {
      params,
      responseType: 'blob',
    })
  },
}

export default registrationService

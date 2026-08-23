import httpClient from '../httpClient'

// Dịch vụ Năm học — khớp backend: /api/core/years
// Payload tạo/cập nhật: { start_year, end_year }
export const yearService = {
  list: async (params = {}) => {
    return await httpClient.get('/core/years', { params })
  },

  getById: async (id) => {
    return await httpClient.get(`/core/years/${id}`)
  },

  create: async (data) => {
    return await httpClient.post('/core/years', data)
  },

  update: async (id, data) => {
    return await httpClient.patch(`/core/years/${id}`, data)
  },

  remove: async (id) => {
    return await httpClient.delete(`/core/years/${id}`)
  },

  // Đặt năm học làm năm hiện tại (unset các năm khác ở backend)
  setCurrent: async (id) => {
    return await httpClient.patch(`/core/years/${id}/set-current`, {})
  },
}

export default yearService

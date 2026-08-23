import httpClient from '../httpClient'

// Dịch vụ Lớp học (danh mục lớp gốc) — khớp backend: /api/core/classes
// Payload tạo/cập nhật: { name, grade } với grade ∈ GRADE_10 | GRADE_11 | GRADE_12
export const classService = {
  list: async (params = {}) => {
    return await httpClient.get('/core/classes', { params })
  },

  getById: async (id) => {
    return await httpClient.get(`/core/classes/${id}`)
  },

  create: async (data) => {
    return await httpClient.post('/core/classes', data)
  },

  update: async (id, data) => {
    return await httpClient.patch(`/core/classes/${id}`, data)
  },

  remove: async (id) => {
    return await httpClient.delete(`/core/classes/${id}`)
  },
}

export default classService

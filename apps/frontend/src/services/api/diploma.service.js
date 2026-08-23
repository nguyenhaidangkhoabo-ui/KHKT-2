import httpClient from '../httpClient'

// Dịch vụ Văn bằng tốt nghiệp — khớp backend: /api/diploma/diplomas
// Bộ lọc list: { status, year_id, student_id, search / student_code }
export const diplomaService = {
  list: async (params = {}) => {
    return await httpClient.get('/diploma/diplomas', { params })
  },

  // Thống kê theo trạng thái: { NOT_STORED, STORED, HANDED_OVER }
  stats: async () => {
    return await httpClient.get('/diploma/diplomas/stats')
  },

  getById: async (id) => {
    return await httpClient.get(`/diploma/diplomas/${id}`)
  },

  // Payload: { student_id, graduation_academic_year_id }
  create: async (data) => {
    return await httpClient.post('/diploma/diplomas', data)
  },

  // Tạo hàng loạt — payload: { academic_year_id } (toàn bộ HS đã tốt nghiệp)
  // hoặc { academic_year_id, student_ids: [] }
  bulkCreate: async (data) => {
    return await httpClient.post('/diploma/diplomas/bulk-create', data)
  },

  // Nhận bằng về trường (NOT_STORED -> STORED)
  receive: async (id) => {
    return await httpClient.post(`/diploma/diplomas/${id}/receive`, {})
  },

  // Nhận hàng loạt — payload: { diploma_ids: [] }
  bulkReceive: async (data) => {
    return await httpClient.post('/diploma/diplomas/bulk-receive', data)
  },

  // Bàn giao cho học sinh (STORED -> HANDED_OVER)
  handover: async (id) => {
    return await httpClient.post(`/diploma/diplomas/${id}/handover`, {})
  },

  // Bàn giao hàng loạt — payload: { diploma_ids: [] }
  bulkHandover: async (data) => {
    return await httpClient.post('/diploma/diplomas/bulk-handover', data)
  },

  // Văn bằng của học sinh đang đăng nhập
  mine: async () => {
    return await httpClient.get('/diploma/diplomas/me')
  },
}

export default diplomaService

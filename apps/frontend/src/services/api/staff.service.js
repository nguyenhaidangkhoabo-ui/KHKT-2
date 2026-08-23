import httpClient from '../httpClient'

// Dịch vụ Cán bộ / Giáo viên — khớp backend: /api/core/staff
// Bộ lọc list: { keyword, status, role, ... }
export const staffService = {
  list: async (params = {}) => {
    return await httpClient.get('/core/staff', { params })
  },

  getById: async (id) => {
    return await httpClient.get(`/core/staff/${id}`)
  },

  // Payload: { username, password, staff_code, full_name, email, phone, role?, status? }
  create: async (data) => {
    return await httpClient.post('/core/staff', data)
  },

  update: async (id, data) => {
    return await httpClient.patch(`/core/staff/${id}`, data)
  },

  remove: async (id) => {
    return await httpClient.delete(`/core/staff/${id}`)
  },

  // Kích hoạt / khóa tài khoản — payload: { status: 'ACTIVE' | 'DISABLED' }
  updateStatus: async (id, status) => {
    return await httpClient.patch(`/core/staff/${id}/status`, { status })
  },

  // Đổi vai trò — payload: { role: 'TEACHER' | 'BGH' | 'ADMIN' | 'SYSTEM_ADMIN' }
  updateRole: async (id, role) => {
    return await httpClient.patch(`/core/staff/${id}/role`, { role })
  },

  // Import danh sách cán bộ từ file Excel (multipart/form-data, trường 'file')
  importExcel: async (formData) => {
    return await httpClient.post('/core/staff/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default staffService

import httpClient from '../httpClient'

// Dịch vụ Lớp theo năm học (ClassAcademicYear) — khớp backend: /api/core/class-years
// Backend chỉ hỗ trợ: GET /, GET /:id, POST /, PATCH /:id/homeroom, DELETE /:id
export const classYearService = {
  list: async (params = {}) => {
    return await httpClient.get('/core/class-years', { params })
  },

  getById: async (id) => {
    return await httpClient.get(`/core/class-years/${id}`)
  },

  // Payload: { academic_year_id, class_id }
  create: async (data) => {
    return await httpClient.post('/core/class-years', data)
  },

  // Backend không có PATCH /:id tổng quát — trường duy nhất có thể cập nhật
  // là giáo viên chủ nhiệm, nên update chuyển hướng sang endpoint homeroom.
  update: async (id, data) => {
    if (data && data.homeroom_staff_id !== undefined) {
      return await httpClient.patch(`/core/class-years/${id}/homeroom`, {
        homeroom_staff_id: data.homeroom_staff_id,
      })
    }
    return Promise.reject(new Error('Lớp-năm học chỉ hỗ trợ cập nhật giáo viên chủ nhiệm.'))
  },

  remove: async (id) => {
    return await httpClient.delete(`/core/class-years/${id}`)
  },

  // Phân công giáo viên chủ nhiệm — payload: { homeroom_staff_id }
  assignHomeroom: async (id, payload) => {
    return await httpClient.patch(`/core/class-years/${id}/homeroom`, payload)
  },

  // Xếp học sinh hàng loạt vào các lớp của năm học (lớp ít học sinh nhất cùng khối).
  autoAssignStudents: async (academicYearId) => {
    return await httpClient.post(`/core/class-years/${academicYearId}/auto-assign-students`)
  },
}

export default classYearService

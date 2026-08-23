import httpClient from '../httpClient'

// Dịch vụ Học sinh — khớp backend: /api/core/students
// Bộ lọc list: { keyword, status, academic_status, gender, ... }
export const studentService = {
  list: async (params = {}) => {
    return await httpClient.get('/core/students', { params })
  },

  getById: async (id) => {
    return await httpClient.get(`/core/students/${id}`)
  },

  // Payload: { username, password, student_code, full_name, birthdate, gender,
  //            email, phone?, father_phone?, mother_phone?, enrollment_year }
  create: async (data) => {
    return await httpClient.post('/core/students', data)
  },

  update: async (id, data) => {
    return await httpClient.patch(`/core/students/${id}`, data)
  },

  remove: async (id) => {
    return await httpClient.delete(`/core/students/${id}`)
  },

  // Cập nhật trạng thái học vụ — payload: { academic_status, current_grade? }
  changeStatus: async (id, status) => {
    return await httpClient.patch(`/core/students/${id}/status`, { academic_status: status })
  },

  // Đánh dấu tốt nghiệp.
  // - payload là mảng id -> POST /bulk-graduate { student_ids }
  // - payload là một id   -> PATCH /:id/graduate
  graduate: async (payload) => {
    const ids = Array.isArray(payload) ? payload : [payload]
    if (ids.length > 1) {
      return await httpClient.post('/core/students/bulk-graduate', { student_ids: ids })
    }
    return await httpClient.patch(`/core/students/${ids[0]}/graduate`, {})
  },

  // Import danh sách học sinh từ file Excel (multipart/form-data, trường 'file')
  importExcel: async (formData) => {
    return await httpClient.post('/core/students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Xuất danh sách học sinh ra file Excel (blob để tải xuống)
  exportExcel: async (params = {}) => {
    return await httpClient.get('/core/students/export', {
      params,
      responseType: 'blob',
    })
  },

  // Lịch sử học vụ (các lớp theo năm học) của một học sinh
  academicHistory: async (id) => {
    return await httpClient.get(`/core/students/${id}/academic-history`)
  },
}

export default studentService

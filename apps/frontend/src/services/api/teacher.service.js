import httpClient from '../httpClient'

// Dịch vụ Giáo viên / Chủ nhiệm — khớp backend: /api/core/teacher
export const teacherService = {
  // Danh sách lớp đang chủ nhiệm (tuỳ chọn lọc theo academic_year_id)
  myClasses: async (params = {}) => {
    return await httpClient.get('/core/teacher/my-classes', { params })
  },

  // Danh sách học sinh của một lớp-năm học
  classStudents: async (classYearId, params = {}) => {
    return await httpClient.get(`/core/teacher/my-classes/${classYearId}/students`, { params })
  },

  // Văn bằng tốt nghiệp của học sinh trong các lớp đang chủ nhiệm
  // (backend: GET /api/diploma/teacher/my-class -> { class_name, diplomas: [...] })
  myClassDiplomas: async (params = {}) => {
    return await httpClient.get('/diploma/teacher/my-class', { params })
  },
}

export default teacherService

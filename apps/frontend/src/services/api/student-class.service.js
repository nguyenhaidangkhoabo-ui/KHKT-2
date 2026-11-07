import httpClient from '../httpClient'

// Dịch vụ Xếp lớp (StudentClassAcademicYear) — khớp backend: /api/core/student-classes
export const studentClassService = {
  // Xếp một học sinh vào lớp — payload: { class_academic_year_id, student_id }
  assign: async (payload) => {
    return await httpClient.post('/core/student-classes/assign', payload)
  },

  // Xếp nhiều học sinh vào lớp — payload: { class_academic_year_id, student_ids: [] }
  bulkAssign: async (payload) => {
    return await httpClient.post('/core/student-classes/bulk-assign', payload)
  },

  // Lịch sử học vụ của học sinh (các lớp theo từng năm học).
  // Backend không có route riêng cho student-classes history;
  // dữ liệu này do GET /core/students/:id/academic-history cung cấp.
  history: async (studentId) => {
    return await httpClient.get(`/core/students/${studentId}/academic-history`)
  },

  // Học sinh của một lớp-năm học — khớp backend: GET /core/students/class-academic-year/:id
  students: async (classAcademicYearId) => {
    return await httpClient.get(`/core/students/class-academic-year/${classAcademicYearId}`)
  },

  // Import danh sách học sinh vào lớp từ file Excel (multipart/form-data, trường 'file')
  importExcel: async (classAcademicYearId, formData) => {
    return await httpClient.post(
      `/core/student-classes/${classAcademicYearId}/import`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },

  // Gỡ học sinh khỏi lớp
  remove: async (classAcademicYearId, studentId) => {
    return await httpClient.delete(
      `/core/student-classes/${classAcademicYearId}/students/${studentId}`
    )
  },
}

export default studentClassService

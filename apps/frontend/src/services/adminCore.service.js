import { apiClient } from './api/apiClient'

export const adminCoreService = {
  // ===== Năm học =====
  getYears: () => apiClient('/core/years'),
  getCurrentYear: () => apiClient('/core/years/current'),
  createYear: (data) => apiClient('/core/years', { method: 'POST', body: data }),
  updateYear: (id, data) => apiClient(`/core/years/${id}`, { method: 'PATCH', body: data }),
  setCurrentYear: (id) => apiClient(`/core/years/${id}/set-current`, { method: 'PATCH' }),
  deleteYear: (id) => apiClient(`/core/years/${id}`, { method: 'DELETE' }),

  // ===== Danh mục lớp =====
  getClasses: (params) => apiClient('/core/classes', { params }),
  createClass: (data) => apiClient('/core/classes', { method: 'POST', body: data }),
  updateClass: (id, data) => apiClient(`/core/classes/${id}`, { method: 'PATCH', body: data }),
  deleteClass: (id) => apiClient(`/core/classes/${id}`, { method: 'DELETE' }),

  // ===== Lớp theo năm học (class-years) =====
  getClassYears: () => apiClient('/core/class-years'),
  getClassYear: (id) => apiClient(`/core/class-years/${id}`),
  createClassYear: (data) => apiClient('/core/class-years', { method: 'POST', body: data }),
  assignHomeroom: (classYearId, homeroom_staff_id) =>
    apiClient(`/core/class-years/${classYearId}/homeroom`, { method: 'PATCH', body: { homeroom_staff_id } }),
  deleteClassYear: (id) => apiClient(`/core/class-years/${id}`, { method: 'DELETE' }),

  // ===== Học sinh =====
  getStudents: (params) => apiClient('/core/students', { params }),
  getGraduatedStudents: () => apiClient('/core/students/graduated'),
  getStudent: (id) => apiClient(`/core/students/${id}`),
  getStudentHistory: (id) => apiClient(`/core/students/${id}/academic-history`),
  createStudent: (data) => apiClient('/core/students', { method: 'POST', body: data }),
  updateStudent: (id, data) => apiClient(`/core/students/${id}`, { method: 'PATCH', body: data }),
  updateStudentStatus: (id, status) =>
    apiClient(`/core/students/${id}/status`, { method: 'PATCH', body: { status } }),
  updateAcademicStatus: (id, academic_status) =>
    apiClient(`/core/students/${id}/academic-status`, { method: 'PATCH', body: { academic_status } }),
  graduateStudent: (id) => apiClient(`/core/students/${id}/graduate`, { method: 'PATCH' }),
  bulkGraduate: (student_ids) =>
    apiClient('/core/students/bulk-graduate', { method: 'POST', body: { student_ids } }),
  importStudents: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient('/core/students/import', { method: 'POST', formData })
  },
  exportStudents: (params) => `/core/students/export?${new URLSearchParams(params)}`,

  // ===== Cán bộ / Giáo viên =====
  getStaff: (params) => apiClient('/core/staff', { params }),
  getStaffMember: (id) => apiClient(`/core/staff/${id}`),
  createStaff: (data) => apiClient('/core/staff', { method: 'POST', body: data }),
  updateStaff: (id, data) => apiClient(`/core/staff/${id}`, { method: 'PATCH', body: data }),
  updateStaffStatus: (id, status) =>
    apiClient(`/core/staff/${id}/status`, { method: 'PATCH', body: { status } }),
  updateStaffRole: (id, role) =>
    apiClient(`/core/staff/${id}/role`, { method: 'PATCH', body: { role } }),
  importStaff: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient('/core/staff/import', { method: 'POST', formData })
  },

  // ===== Phân lớp học sinh (student-classes) =====
  assignStudentToClass: (class_academic_year_id, student_id) =>
    apiClient('/core/student-classes/assign', { method: 'POST', body: { class_academic_year_id, student_id } }),
  bulkAssignStudents: (class_academic_year_id, student_ids) =>
    apiClient('/core/student-classes/bulk-assign', { method: 'POST', body: { class_academic_year_id, student_ids } }),
  removeStudentFromClass: (classAcademicYearId, studentId) =>
    apiClient(`/core/student-classes/${classAcademicYearId}/students/${studentId}`, { method: 'DELETE' }),
}
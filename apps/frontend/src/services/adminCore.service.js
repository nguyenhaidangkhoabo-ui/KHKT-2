import { apiClient } from './api/apiClient'

export const adminCoreService = {
  // Năm học
  getYears: () => apiClient('/core/years'),
  createYear: (data) => apiClient('/core/years', { method: 'POST', body: data }),
  makeCurrentYear: (id) => apiClient(`/core/years/${id}/make-current`, { method: 'POST' }),
  // Lớp học
  getClasses: () => apiClient('/core/classes'),
  assignHomeroom: (classYearId, teacherId) =>
    apiClient(`/core/class-years/${classYearId}/homeroom`, { method: 'PATCH', body: { teacherId } }),
  // Học sinh
  getStudents: (params) => apiClient('/core/students', { params }),
  bulkGraduate: (studentIds) =>
    apiClient('/core/students/bulk-graduate', { method: 'POST', body: { studentIds } }),
  importStudents: (formData) =>
    apiClient('/core/students/import', { method: 'POST', body: formData }),
  // Cán bộ / Giáo viên
  getStaff: () => apiClient('/core/staff'),
  updateStaffRole: (id, role) =>
    apiClient(`/core/staff/${id}/role`, { method: 'PATCH', body: { role } }),
}
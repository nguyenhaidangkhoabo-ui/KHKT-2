import { apiClient } from './api/apiClient'

export const teacherService = {
  /** GET /api/core/teacher/my-classes — các lớp đã/đang làm GVCN */
  getMyClasses: () => apiClient('/core/teacher/my-classes'),
  /** GET /api/core/teacher/my-classes/:classYearId/students — read-only (TCH-01/02/03) */
  getMyClassStudents: (classYearId) => apiClient(`/core/teacher/my-classes/${classYearId}/students`),
  /** Module Diploma (chờ backend) */
  getMyClassDiplomas: () => apiClient('/diploma/teacher/my-class'),
}
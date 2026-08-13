import { apiClient } from './api/apiClient'

export const teacherService = {
  getMyClassStudents: (classYearId) =>
    apiClient(`/core/teacher/my-class/${classYearId}/students`),
  getMyClassDiplomas: () => apiClient('/diploma/teacher/my-class'),
}
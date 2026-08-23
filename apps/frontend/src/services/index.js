export * from './httpClient'
export * from './api/auth.service'
export { default as authService } from './api/auth.service'

// ===== Dịch vụ nghiệp vụ (core) =====
export { yearService } from './api/year.service'
export { classService } from './api/class.service'
export { staffService } from './api/staff.service'
export { studentService } from './api/student.service'
export { classYearService } from './api/class-year.service'
export { studentClassService } from './api/student-class.service'
export { teacherService } from './api/teacher.service'

// ===== Dịch vụ nghiệp vụ (diploma) =====
export { diplomaService } from './api/diploma.service'
export { scheduleService } from './api/schedule.service'
export { registrationService } from './api/registration.service'

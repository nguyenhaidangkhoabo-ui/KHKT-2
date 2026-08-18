// ===== Vai trò (UserRole) =====
export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  BGH: 'BGH',
  ADMIN: 'ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
}

export const ROLE_LABELS = {
  STUDENT: 'Học sinh',
  TEACHER: 'Giáo viên',
  BGH: 'Ban giám hiệu',
  ADMIN: 'Quản trị viên',
  SYSTEM_ADMIN: 'Quản trị hệ thống',
}

// ===== Trạng thái tài khoản =====
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
}

export const USER_STATUS_LABELS = {
  ACTIVE: 'Hoạt động',
  DISABLED: 'Đã khóa',
}

// ===== Trạng thái học tập (AcademicStatus - State Machine) =====
export const ACADEMIC_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DROPOUT: 'DROPOUT',
  TRANSFERRED: 'TRANSFERRED',
  GRADUATED: 'GRADUATED',
}

export const ACADEMIC_STATUS_LABELS = {
  ACTIVE: 'Đang học',
  SUSPENDED: 'Bảo lưu',
  DROPOUT: 'Đã bỏ học',
  TRANSFERRED: 'Chuyển trường',
  GRADUATED: 'Đã tốt nghiệp',
}

// Màu Badge tương ứng (key trùng giá trị enum)
export const ACADEMIC_STATUS_COLORS = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  DROPOUT: 'danger',
  TRANSFERRED: 'info',
  GRADUATED: 'primary',
}

// ===== Khối lớp (Grade) =====
export const GRADES = {
  GRADE_10: 'GRADE_10',
  GRADE_11: 'GRADE_11',
  GRADE_12: 'GRADE_12',
}

export const GRADE_LABELS = {
  GRADE_10: 'Khối 10',
  GRADE_11: 'Khối 11',
  GRADE_12: 'Khối 12',
}

export const GRADE_OPTIONS = Object.entries(GRADES).map(([key, value]) => ({
  value,
  label: GRADE_LABELS[key],
}))

// ===== Giới tính =====
export const GENDERS = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
}

export const GENDER_LABELS = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
}

// ===== Trạng thái bằng tốt nghiệp (Module Diploma - Phụ lục A) =====
export const DIPLOMA_STATUS = {
  NOT_STORED: 'NOT_STORED',
  STORED: 'STORED',
  HANDED_OVER: 'HANDED_OVER',
}

export const DIPLOMA_STATUS_LABELS = {
  NOT_STORED: 'Chưa về trường',
  STORED: 'Đã về trường',
  HANDED_OVER: 'Đã trao',
}

export const DIPLOMA_STATUS_COLORS = {
  NOT_STORED: 'warning',
  STORED: 'info',
  HANDED_OVER: 'success',
}

// ===== Trang đích theo vai trò (sau đăng nhập) =====
export const HOME_BY_ROLE = {
  STUDENT: '/student/profile',
  TEACHER: '/staff/profile',
  BGH: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  SYSTEM_ADMIN: '/admin/dashboard',
}

// ===== Định dạng trạng thái đăng ký nhận bằng =====
export const REGISTRATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

export const REGISTRATION_STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
}
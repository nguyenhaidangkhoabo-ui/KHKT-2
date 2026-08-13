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

export const DIPLOMA_STATUS = {
  NOT_STORED: 'NOT_STORED',
  STORED: 'STORED',
  HANDED_OVER: 'HANDED_OVER',
}

export const STATUS_LABELS = {
  NOT_STORED: 'Chưa về trường',
  STORED: 'Đã về trường',
  HANDED_OVER: 'Đã trao',
}

export const HOME_BY_ROLE = {
  STUDENT: '/student/profile',
  TEACHER: '/staff/profile',
  BGH: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  SYSTEM_ADMIN: '/admin/dashboard',
}
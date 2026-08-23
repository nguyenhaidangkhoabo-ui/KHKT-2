// Menu điều hướng theo vai trò.
// Mỗi item của getMenuForRole(role): { label, to, iconName }
// - iconName là key chuỗi, được map sang icon lucide-react tại DashboardSidebar (ICON_MAP).
// - Giữ nguyên export NAVIGATION (cũ) để tương thích ngược với các file đang import.

export const NAVIGATION = {
  STUDENT: [
    { label: 'Hồ sơ cá nhân', path: '/student/profile', icon: 'user' },
    { label: 'Bằng tốt nghiệp', path: '/student/diploma', icon: 'award' },
    { label: 'Đăng ký nhận bằng', path: '/student/diploma/pickup', icon: 'calendarPlus' },
    { label: 'Lịch sử đăng ký', path: '/student/diploma/history', icon: 'history' },
  ],
  TEACHER: [
    { label: 'Hồ sơ cá nhân', path: '/staff/profile', icon: 'user' },
    { label: 'Lớp chủ nhiệm', path: '/staff/class/students', icon: 'school' },
    { label: 'Bằng của lớp', path: '/staff/class/diplomas', icon: 'award' },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Năm học', path: '/admin/years', icon: 'calendar' },
    { label: 'Lớp học', path: '/admin/classes', icon: 'school' },
    { label: 'Học sinh', path: '/admin/students', icon: 'users' },
    { label: 'Cán bộ / Giáo viên', path: '/admin/staff', icon: 'userCircle' },
    { label: 'Bằng tốt nghiệp', path: '/admin/diplomas', icon: 'award' },
    { label: 'Nhận / Trao bằng', path: '/admin/diplomas/receive', icon: 'inbox' },
    { label: 'Lịch nhận bằng', path: '/admin/schedules/current', icon: 'calendarDays' },
    { label: 'Cấu hình lịch', path: '/admin/schedules/next', icon: 'settings' },
    { label: 'Đăng ký nhận bằng', path: '/admin/registrations', icon: 'clipboard' },
  ],
}

// Menu ADMIN dùng chung cho ADMIN / BGH / SYSTEM_ADMIN
const ADMIN_MENU = [
  { label: 'Dashboard', to: '/admin', iconName: 'dashboard' },
  { label: 'Năm học', to: '/admin/years', iconName: 'calendar' },
  { label: 'Lớp', to: '/admin/classes', iconName: 'school' },
  { label: 'Lớp theo năm học', to: '/admin/class-years', iconName: 'calendarDays' },
  { label: 'Học sinh', to: '/admin/students', iconName: 'users' },
  { label: 'Cán bộ', to: '/admin/staff', iconName: 'userCircle' },
  { label: 'Văn bằng', to: '/admin/diplomas', iconName: 'award' },
  { label: 'Nhận & bàn giao', to: '/admin/diplomas/receive', iconName: 'inbox' },
  { label: 'Lịch tuần này', to: '/admin/schedules/current', iconName: 'calendarDays' },
  { label: 'Lịch tuần sau', to: '/admin/schedules/next', iconName: 'settings' },
  { label: 'Đăng ký nhận', to: '/admin/registrations', iconName: 'clipboard' },
  { label: 'Hồ sơ', to: '/admin/profile', iconName: 'user' },
]

const STUDENT_MENU = [
  { label: 'Hồ sơ', to: '/student/profile', iconName: 'user' },
  { label: 'Văn bằng của tôi', to: '/student/diploma', iconName: 'award' },
  { label: 'Đăng ký nhận', to: '/student/diploma/pickup', iconName: 'calendarPlus' },
  { label: 'Lịch sử nhận', to: '/student/diploma/history', iconName: 'history' },
]

const TEACHER_MENU = [
  { label: 'Hồ sơ', to: '/staff/profile', iconName: 'user' },
  { label: 'Học sinh chủ nhiệm', to: '/staff/class/students', iconName: 'school' },
  { label: 'Văn bằng lớp', to: '/staff/class/diplomas', iconName: 'award' },
]

/**
 * Trả về danh sách item menu theo vai trò người dùng.
 * @param {string} role - Một giá trị trong ROLES (STUDENT | TEACHER | BGH | ADMIN | SYSTEM_ADMIN)
 * @returns {Array<{label: string, to: string, iconName: string}>}
 */
export function getMenuForRole(role) {
  switch (role) {
    case 'STUDENT':
      return STUDENT_MENU
    case 'TEACHER':
      return TEACHER_MENU
    case 'BGH':
    case 'ADMIN':
    case 'SYSTEM_ADMIN':
      return ADMIN_MENU
    default:
      return []
  }
}

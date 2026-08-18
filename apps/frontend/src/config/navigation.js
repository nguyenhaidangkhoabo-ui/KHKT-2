// Icon dùng key của component Icon (xem 8.3 components/ui/icon.jsx)
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
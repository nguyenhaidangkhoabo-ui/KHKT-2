// Menu điều hướng theo role — dùng cho Sidebar
export const NAVIGATION = {
  STUDENT: [
    { label: 'Hồ sơ cá nhân', path: '/student/profile', icon: '👤' },
    { label: 'Bằng tốt nghiệp', path: '/student/diploma', icon: '🎓' },
    { label: 'Đăng ký nhận bằng', path: '/student/diploma/pickup', icon: '📅' },
    { label: 'Lịch sử đăng ký', path: '/student/diploma/history', icon: '📋' },
  ],
  TEACHER: [
    { label: 'Hồ sơ cá nhân', path: '/staff/profile', icon: '👤' },
    { label: 'Lớp chủ nhiệm', path: '/staff/class/students', icon: '🏫' },
    { label: 'Bằng của lớp', path: '/staff/class/diplomas', icon: '🎓' },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Năm học', path: '/admin/years', icon: '📆' },
    { label: 'Lớp học', path: '/admin/classes', icon: '🏫' },
    { label: 'Học sinh', path: '/admin/students', icon: '👨‍🎓' },
    { label: 'Cán bộ / GV', path: '/admin/staff', icon: '👥' },
    { label: 'Bằng tốt nghiệp', path: '/admin/diplomas', icon: '🎓' },
    { label: 'Lịch nhận bằng', path: '/admin/schedules/current', icon: '📅' },
    { label: 'Đăng ký nhận bằng', path: '/admin/registrations', icon: '📝' },
  ],
}
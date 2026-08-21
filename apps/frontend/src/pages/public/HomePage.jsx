import { 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Building2,
  Award,
  Sparkles,
  LayoutDashboard,
  UserCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_CONFIG } from '../../config/app.config'
import { useAuth } from '../../context'
import { ROLE_LABELS, HOME_BY_ROLE } from '../../config/constants'

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()

  const stats = [
    { value: '65+', label: 'Năm truyền thống', sub: 'Thành lập từ năm 1959' },
    { value: '29', label: 'Phòng học chuẩn', sub: 'Trang thiết bị hiện đại' },
    { value: '88', label: 'Cán bộ & Giáo viên', sub: 'Tâm huyết, vững chuyên môn' },
    { value: '1.200+', label: 'Học sinh theo học', sub: 'Khối 10, 11 và 12' },
  ]

  const highlights = [
    {
      title: 'Đào tạo chất lượng',
      desc: 'Phát triển toàn diện năng lực, bồi dưỡng kiến thức và định hướng tương lai vững chắc cho học sinh.',
      icon: GraduationCap,
    },
    {
      title: 'Đội ngũ tâm huyết',
      desc: '88 thầy cô giàu kinh nghiệm, trong đó 8 Thạc sĩ và 69 Cử nhân không ngừng đổi mới phương pháp dạy học.',
      icon: Users,
    },
    {
      title: 'Cơ sở vật chất',
      desc: '29 phòng học đạt chuẩn, khuôn viên cây xanh mát mẻ, phòng thực hành hiện đại phục vụ học tập.',
      icon: Building2,
    },
  ]

  const userDashboardLink = user ? (HOME_BY_ROLE[user?.role] || '/admin/dashboard') : '/admin/dashboard'

  return (
    <div className="flex flex-col font-sans">
      {/* 1. Clean Minimalist Hero (Giới thiệu ngắn gọn) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-slate-50/30 to-white py-16 sm:py-22 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {APP_CONFIG.schoolName}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Ngôi trường giàu truyền thống hiếu học, nơi ươm mầm tri thức, rèn luyện nhân cách và chắp cánh ước mơ cho các thế hệ học sinh tại TP. Tân Uyên, Tỉnh Bình Dương.
          </p>

          {/* Subtle & Elegant Logged-In User Card */}
          {isAuthenticated && (
            <div className="mt-8 mx-auto max-w-xl p-4 sm:p-5 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/90 shadow-xs text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary-100">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {user?.full_name || user?.username}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {ROLE_LABELS[user?.role] || user?.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tài khoản đang đăng nhập trên hệ thống
                    </p>
                  </div>
                </div>

                <Link
                  to={userDashboardLink}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-600 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Trang quản lý</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Stats Bar */}
      <section className="py-10 bg-slate-50/80 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary">{item.value}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-800">{item.label}</div>
                <div className="text-[11px] text-slate-500">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Môi trường học tập (Đơn điệu, thanh lịch, tinh gọn) */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Môi trường học tập
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Các giá trị cốt lõi xây dựng nên chất lượng giáo dục của nhà trường.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((item, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-xl border border-slate-200 bg-white space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Banner Giới thiệu / Hồ sơ trường */}
      <section className="py-12 sm:py-14 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1 max-w-xl">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Hành trình 65 năm xây dựng & phát triển (1959 – 2024)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Tìm hiểu chi tiết các mốc son lịch sử, tiểu sử Thi tướng Huỳnh Văn Nghệ và bảng vàng thành tích.
              </p>
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-primary font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0"
            >
              <span>Xem hồ sơ nhà trường</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


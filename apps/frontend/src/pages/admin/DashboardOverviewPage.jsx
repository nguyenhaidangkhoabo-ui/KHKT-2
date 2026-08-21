import { 
  Users, 
  UserCheck, 
  Award, 
  GraduationCap, 
  Calendar, 
  TrendingUp, 
  FileText, 
  ShieldCheck 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context'
import { ROLE_LABELS } from '../../config/constants'

export default function DashboardOverviewPage() {
  const { user } = useAuth()

  const quickStats = [
    { label: 'Tổng số học sinh', value: '1.240', sub: 'Toàn trường', icon: Users, color: 'text-primary bg-primary-50 border-primary-200' },
    { label: 'Cán bộ & Giáo viên', value: '88', sub: 'Đang công tác', icon: UserCheck, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'Bằng tốt nghiệp', value: '412', sub: 'Đã lưu trữ hệ thống', icon: Award, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { label: 'Lịch trao bằng', value: '3 đợt', sub: 'Đang mở đăng ký', icon: Calendar, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bảng điều khiển quản trị
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary border border-primary-200 text-xs font-bold">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Xin chào, <strong>{user?.full_name || user?.username}</strong>. Chúc bạn một ngày làm việc hiệu quả tại THPT Huỳnh Văn Nghệ.
          </p>
        </div>

        <Link
          to="/admin/profile"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shrink-0"
        >
          <span>Xem hồ sơ cá nhân</span>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((st, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{st.label}</span>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold ${st.color}`}>
                <st.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{st.value}</div>
              <div className="text-[11px] font-medium text-slate-500 mt-0.5">{st.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Modules */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Tính năng quản lý chính</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/diplomas"
            className="p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Quản lý Bằng Tốt Nghiệp</h3>
              <p className="text-[11px] text-slate-500">Tra cứu, lưu trữ & cấp phát</p>
            </div>
          </Link>

          <Link
            to="/admin/students"
            className="p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Hồ sơ Học Sinh</h3>
              <p className="text-[11px] text-slate-500">Danh sách các khối lớp</p>
            </div>
          </Link>

          <Link
            to="/admin/profile"
            className="p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-xs transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Hồ sơ & Đổi Mật Khẩu</h3>
              <p className="text-[11px] text-slate-500">Cài đặt tài khoản của bạn</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

import { MapPin, Phone, Mail, Globe, ShieldCheck, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_CONFIG } from '../../config/app.config'

export default function LandingFooter() {
  return (
    <footer className="relative bg-slate-900 text-slate-300 border-t-2 border-primary-500/80 shadow-inner">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-600 via-amber-500 to-primary-600 opacity-90" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/hvn_logo.png"
                alt="Logo THPT Huỳnh Văn Nghệ"
                className="w-10 h-10 object-contain bg-white rounded-lg p-1"
              />
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base leading-tight">
                  {APP_CONFIG.schoolName}
                </h3>
                <p className="text-xs text-slate-400">
                  Hành trình 65 năm xây dựng và phát triển
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trường THPT Huỳnh Văn Nghệ - Ngôi trường giàu truyền thống hiếu học trên vùng đất Tân Uyên anh hùng.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
              Khám phá
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-primary-300 transition-colors">Trang chủ</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-300 transition-colors">Giới thiệu lịch sử & Ý nghĩa tên trường</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-300 transition-colors">Liên hệ văn phòng</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-300 transition-colors">Cổng thông tin nội bộ</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
              Thông tin liên hệ
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                <span>{APP_CONFIG.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <span>{APP_CONFIG.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <span>{APP_CONFIG.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <p>{APP_CONFIG.schoolName} — Tân Uyên, Tỉnh Bình Dương</p>
          <p>{APP_CONFIG.appName}</p>
        </div>
      </div>
    </footer>
  )
}

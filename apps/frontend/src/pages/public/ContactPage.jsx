import { Phone, Mail, MapPin, Send, School, Clock, Globe } from 'lucide-react'
import { APP_CONFIG } from '../../config/app.config'

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 font-sans">
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Liên hệ với {APP_CONFIG.schoolName}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Quý phụ huynh, học sinh và các tổ chức cần liên hệ công tác hoặc tìm hiểu thông tin tuyển sinh xin vui lòng liên hệ trực tiếp văn phòng nhà trường.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <img src="/hvn_logo.png" alt="HVN Logo" className="w-10 h-10 object-contain" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Văn phòng trường</h2>
              <p className="text-xs text-slate-500">{APP_CONFIG.schoolName}</p>
            </div>
          </div>
          
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800 text-xs">Địa chỉ</p>
                <p className="text-xs text-slate-600 leading-relaxed">{APP_CONFIG.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800 text-xs">Điện thoại</p>
                <p className="text-xs text-slate-600">{APP_CONFIG.phone} (Giờ hành chính)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800 text-xs">Email nhà trường</p>
                <p className="text-xs text-slate-600">{APP_CONFIG.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800 text-xs">Thời gian làm việc</p>
                <p className="text-xs text-slate-600">Thứ Hai - Thứ Sáu: 7h00 - 17h00 | Thứ Bảy: 7h00 - 11h30</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Gửi thư liên hệ trực tiếp</h2>
          <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                placeholder="Nhập họ và tên của bạn"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Số điện thoại</label>
              <input
                type="text"
                placeholder="Số điện thoại hoặc địa chỉ email"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung liên hệ</label>
              <textarea
                rows={3}
                placeholder="Nhập nội dung cần liên hệ hoặc thắc mắc..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-600 text-white font-medium text-xs sm:text-sm shadow-primary transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Gửi liên hệ tới văn phòng trường</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

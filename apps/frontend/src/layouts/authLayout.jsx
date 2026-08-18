import { Outlet } from 'react-router-dom'
import Icon from '../components/ui/icon'
import { APP_CONFIG } from '../config/app.config'

export default function AuthLayout() {
  return (
    <div className="login-page">
      {/* Panel bên trái — branding */}
      <div className="login-hero">
        <div className="login-hero-inner">
          <div className="login-brand">
            <div className="brand-badge"><Icon name="school" size={28} /></div>
            <h1>{APP_CONFIG.appName}</h1>
          </div>
          <h2>Quản lý dữ liệu học sinh & bằng tốt nghiệp hiện đại</h2>
          <p>
            Nền tảng giúp nhà trường quản lý năm học, lớp học, học sinh, giáo viên
            và quy trình nhận — trao bằng tốt nghiệp một cách nhanh chóng, minh bạch.
          </p>
          <ul className="login-features">
            <li><Icon name="check" size={16} /> Quản lý hồ sơ học sinh xuyên suốt các năm học</li>
            <li><Icon name="check" size={16} /> Phân công giáo viên chủ nhiệm linh hoạt</li>
            <li><Icon name="check" size={16} /> Đăng ký nhận bằng tốt nghiệp trực tuyến</li>
            <li><Icon name="check" size={16} /> Theo dõi trạng thái bằng theo thời gian thực</li>
          </ul>
        </div>
      </div>
      {/* Panel bên phải — form đăng nhập */}
      <div className="login-panel">
        <div className="login-card-wrap">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
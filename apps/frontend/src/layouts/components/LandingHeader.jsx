import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ArrowRight, Sparkles, Phone, Info, Home } from 'lucide-react'
import { APP_CONFIG } from '../../config/app.config'
import UserDropdown from './UserDropdown'

export default function LandingHeader({ user = null, onLogout = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Trang chủ', path: '/', icon: Home },
    { label: 'Giới thiệu', path: '/about', icon: Info },
    { label: 'Liên hệ', path: '/contact', icon: Phone },
  ]

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-18">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group shrink-0" title={APP_CONFIG.schoolName}>
            <img
              src="/hvn_logo.png"
              alt="Logo THPT Huỳnh Văn Nghệ"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                THPT Huỳnh Văn Nghệ
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Cổng thông tin điện tử
              </span>
            </div>
          </Link>

          {/* Centered Navigation Bar */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 lg:gap-2">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-primary bg-primary-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Action */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {user ? (
              <UserDropdown user={user} onLogout={onLogout} />
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && <UserDropdown user={user} onLogout={onLogout} />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'text-primary bg-primary-50 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <item.icon className="w-4 h-4 text-slate-400" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {!user && (
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-600 text-white font-medium text-sm shadow-sm"
              >
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

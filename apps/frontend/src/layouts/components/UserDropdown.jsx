import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { ROLE_LABELS } from '../../config/constants'
import { useAuth } from '../../context'

export default function UserDropdown({ user: propUser = null, onLogout = null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { user: authUser, logout: authLogout } = useAuth()

  const currentUser = propUser || authUser

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    } else {
      await authLogout()
    }
    setOpen(false)
    navigate('/', { replace: true })
  }

  const initials = (currentUser?.full_name || currentUser?.username || 'HVN').slice(0, 2).toUpperCase()

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'TEACHER':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'ADMIN':
      case 'SYSTEM_ADMIN':
      case 'BGH':
        return 'bg-primary-100 text-primary-900 border-primary-300'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
      >
        <div className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[120px]">
            {currentUser?.full_name || currentUser?.username || 'Người dùng'}
          </span>
          <span className={`inline-block px-1 py-0.2 rounded text-[9px] font-bold w-fit mt-0.5 ${getRoleBadgeClass(currentUser?.role)}`}>
            {ROLE_LABELS[currentUser?.role] || currentUser?.role || 'Thành viên'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-900">{currentUser?.full_name || currentUser?.username}</p>
            <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold mt-1 ${getRoleBadgeClass(currentUser?.role)}`}>
              {ROLE_LABELS[currentUser?.role] || currentUser?.role}
            </span>
          </div>

          <Link
            to="/admin/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-primary-50 hover:text-primary transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Khu vực quản lý</span>
          </Link>

          <button
            onClick={() => {
              setOpen(false)
              navigate('/admin/profile')
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-primary-50 hover:text-primary transition-colors cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ cá nhân</span>
          </button>

          <div className="my-1 border-t border-slate-100"></div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-accent hover:bg-accent-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  )
}

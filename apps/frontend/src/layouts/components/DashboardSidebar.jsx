import { NavLink, Link } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  School, 
  Users, 
  UserCheck, 
  Award, 
  Inbox, 
  CalendarDays, 
  Settings, 
  ClipboardList,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react'
import { APP_CONFIG } from '../../config/app.config'

const DEFAULT_ADMIN_MENU = [
  { label: 'Tổng quan Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Hồ sơ cá nhân', path: '/admin/profile', icon: User },
  { label: 'Năm học', path: '/admin/years', icon: Calendar },
  { label: 'Lớp học', path: '/admin/classes', icon: School },
  { label: 'Học sinh', path: '/admin/students', icon: Users },
  { label: 'Cán bộ / Giáo viên', path: '/admin/staff', icon: UserCheck },
  { label: 'Bằng tốt nghiệp', path: '/admin/diplomas', icon: Award },
  { label: 'Nhận / Trao bằng', path: '/admin/diplomas/receive', icon: Inbox },
  { label: 'Lịch nhận bằng', path: '/admin/schedules/current', icon: CalendarDays },
  { label: 'Cấu hình lịch', path: '/admin/schedules/next', icon: Settings },
  { label: 'Đăng ký nhận bằng', path: '/admin/registrations', icon: ClipboardList },
]

export default function DashboardSidebar({ 
  menu = DEFAULT_ADMIN_MENU, 
  collapsed = false, 
  setCollapsed,
  mobileOpen = false,
  setMobileOpen
}) {
  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <img
              src="/hvn_logo.png"
              alt="HVN Logo"
              className="w-9 h-9 object-contain shrink-0"
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-800 text-sm truncate leading-tight">
                  {APP_CONFIG.appShortName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate">
                  Hệ thống Quản lý
                </span>
              </div>
            )}
          </Link>

          <button 
            onClick={() => setMobileOpen?.(false)}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
          {!collapsed && (
            <p className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Danh mục quản lý
            </p>
          )}

          {menu.map((item) => {
            const ItemIcon = item.icon || Sparkles
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen?.(false)}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group
                  ${isActive 
                    ? 'bg-primary text-white shadow-primary shadow-xs font-semibold' 
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
              >
                <ItemIcon className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-2.5 border-t border-slate-100 hidden lg:flex items-center justify-between">
          {!collapsed && (
            <span className="text-[11px] text-slate-400 truncate">
              © {new Date().getFullYear()} {APP_CONFIG.appShortName}
            </span>
          )}
          <button
            onClick={() => setCollapsed?.(!collapsed)}
            className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer ${collapsed ? 'w-full flex justify-center' : ''}`}
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  )
}

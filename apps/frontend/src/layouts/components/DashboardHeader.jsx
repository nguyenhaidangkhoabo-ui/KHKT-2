import { Menu, Bell } from 'lucide-react'
import UserDropdown from './UserDropdown'
import { APP_CONFIG } from '../../config/app.config'

export default function DashboardHeader({ title = 'Bảng điều khiển', onOpenMobileMenu }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {APP_CONFIG.schoolName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <UserDropdown />
      </div>
    </header>
  )
}

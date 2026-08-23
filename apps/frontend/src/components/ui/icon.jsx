// Ánh xạ tên icon (chuỗi) -> component lucide-react.
// Dùng cho cấu hình menu / dữ liệu động chỉ chứa tên icon dạng chuỗi.

import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  CalendarPlus,
  School,
  Layers,
  Users,
  UserCircle,
  User,
  Award,
  Inbox,
  Settings,
  ClipboardList,
  History,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  PackageCheck,
  PackageOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Lock,
  Mail,
  Phone,
  Shield,
  Sparkles,
} from 'lucide-react'

export const ICON_MAP = {
  dashboard: LayoutDashboard,
  calendar: Calendar,
  calendarDays: CalendarDays,
  calendarPlus: CalendarPlus,
  school: School,
  layers: Layers,
  users: Users,
  userCircle: UserCircle,
  user: User,
  award: Award,
  inbox: Inbox,
  settings: Settings,
  clipboard: ClipboardList,
  history: History,
  search: Search,
  refresh: RefreshCw,
  plus: Plus,
  edit: Pencil,
  trash: Trash2,
  eye: Eye,
  download: Download,
  upload: Upload,
  check: CheckCircle2,
  close: XCircle,
  warning: AlertTriangle,
  graduation: GraduationCap,
  packageCheck: PackageCheck,
  packageOpen: PackageOpen,
  clock: Clock,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  logout: LogOut,
  lock: Lock,
  mail: Mail,
  phone: Phone,
  shield: Shield,
}

/**
 * Trả về component icon lucide-react tương ứng với tên chuỗi.
 * @param {string} name - Tên icon (khóa trong ICON_MAP)
 * @returns {import('lucide-react').LucideIcon} Component icon (mặc định: Sparkles)
 */
export function getIcon(name) {
  return ICON_MAP[name] || Sparkles
}

export default getIcon

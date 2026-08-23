// Route bảo vệ theo trạng thái đăng nhập và vai trò.
// Props: { allowedRoles?: string[], children }
// - Chưa đăng nhập -> chuyển hướng /login
// - Đăng nhập nhưng sai vai trò -> chuyển hướng về trang chủ theo vai trò (HOME_BY_ROLE)

import { Navigate, useLocation } from 'react-router-dom'
import { APP_CONFIG } from '../../config/app.config'
import { HOME_BY_ROLE } from '../../config/constants'
import { useAuth } from '../../context'

function readStoredUser() {
  try {
    const stored = localStorage.getItem(APP_CONFIG.storageKeys.user)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export default function ProtectedRoute({ allowedRoles, children }) {
  // Ưu tiên context (nguồn sự thật khi chạy trong AuthProvider),
  // fallback về localStorage giống cách AuthContext khởi tạo.
  let contextUser = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contextUser = useAuth()?.user ?? null
  } catch {
    contextUser = null
  }

  const token = localStorage.getItem(APP_CONFIG.storageKeys.token)
  const user = contextUser || readStoredUser()

  const location = useLocation()

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={HOME_BY_ROLE[user.role] || '/login'} replace />
    }
  }

  return children
}

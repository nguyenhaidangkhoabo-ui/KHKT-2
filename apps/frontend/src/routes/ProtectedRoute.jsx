import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Spinner from '../components/ui/spinner'
import { HOME_BY_ROLE } from '../config/constants'

export default function ProtectedRoute({ roles = [], children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="text-center mt-8"><Spinner size="lg" /></div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={HOME_BY_ROLE[user.role] || '/login'} replace />
  }
  return children
}
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { profileService } from '../../services/profile.service'
import Spinner from '../../components/ui/spinner'
import Alert from '../../components/feedback/alert'

export default function StaffProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    profileService.getMe()
      .then((data) => setProfile(data.user || data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <h1 className="page-title">Hồ sơ cá nhân</h1>
      <div className="card">
        <p><strong>Họ tên:</strong> {profile?.full_name || user?.full_name}</p>
        <p><strong>Tên đăng nhập:</strong> {profile?.username || user?.username}</p>
        <p><strong>Vai trò:</strong> Giáo viên</p>
      </div>
    </div>
  )
}
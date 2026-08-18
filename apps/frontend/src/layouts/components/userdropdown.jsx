import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_LABELS } from '../../config/constants'
import Icon from '../../components/ui/icon'

export default function UserDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const goProfile = () => {
    setOpen(false)
    const base = user?.role === 'STUDENT' ? '/student' : user?.role === 'TEACHER' ? '/staff' : '/admin'
    navigate(`${base}/profile`)
  }

  const initials = (user?.full_name || user?.username || '?').slice(0, 2).toUpperCase()

  return (
    <div className="user-dropdown" ref={ref}>
      <button className="user-btn" onClick={() => setOpen(!open)}>
        <span className="user-avatar">{initials}</span>
        <span className="user-meta">
          <span className="user-name">{user?.full_name || user?.username}</span>
          <span className="user-role">{ROLE_LABELS[user?.role] || user?.role}</span>
        </span>
        <Icon name="chevronDown" size={16} />
      </button>
      {open && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={goProfile}>
            <Icon name="user" size={16} /> Hồ sơ cá nhân
          </button>
          <button className="dropdown-item" onClick={handleLogout}>
            <Icon name="logout" size={16} /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
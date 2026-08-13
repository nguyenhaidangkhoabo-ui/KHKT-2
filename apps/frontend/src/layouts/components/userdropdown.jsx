import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_LABELS } from '../../config/constants'

export default function UserDropdown() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="user-dropdown">
      <button className="user-btn" onClick={() => setOpen(!open)}>
        {user?.full_name || user?.username} ▾
      </button>
      {open && (
        <div className="dropdown-menu">
          <div className="dropdown-info">{ROLE_LABELS[user?.role] || user?.role}</div>
          <button onClick={handleLogout}>Đăng xuất</button>
        </div>
      )}
    </div>
  )
}
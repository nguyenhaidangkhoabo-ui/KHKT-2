import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/button'
import Input from '../../components/ui/input'
import Alert from '../../components/feedback/alert'
import Icon from '../../components/ui/icon'
import { HOME_BY_ROLE } from '../../config/constants'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(username.trim(), password)
    if (result.success) {
      navigate(HOME_BY_ROLE[result.user.role] || '/', { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <h1 className="login-title">Đăng nhập</h1>
      <p className="login-subtitle">Chào mừng bạn quay trở lại!</p>
      {error && <Alert type="error">{error}</Alert>}
      <Input
        label="Tên đăng nhập"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="VD: HS1001, CB001..."
        autoComplete="username"
        icon={<Icon name="user" size={18} />}
        required
      />
      <Input
        label="Mật khẩu"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
        icon={<Icon name="lock" size={18} />}
        required
      />
      <div className="flex-between mb-4">
        <label className="flex gap-2" style={{ cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
          Hiện mật khẩu
        </label>
      </div>
      <Button type="submit" disabled={isLoading} fullWidth size="lg">
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
      <div className="login-demo">
        <strong>TK demo:</strong> giáo viên <strong>CB001</strong> · học sinh <strong>HS1001</strong>
      </div>
    </form>
  )
}
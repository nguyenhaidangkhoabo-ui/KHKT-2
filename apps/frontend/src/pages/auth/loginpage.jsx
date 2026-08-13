import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/button'
import Input from '../../components/ui/input'
import Alert from '../../components/feedback/alert'
import { HOME_BY_ROLE } from '../../config/constants'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(username, password)
    if (result.success) {
      navigate(HOME_BY_ROLE[result.user.role] || '/', { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <form className="login-card card" onSubmit={handleSubmit}>
      <h1 className="login-title">Cổng thông tin THPT Huỳnh Văn Nghệ</h1>
      {error && <Alert type="error">{error}</Alert>}
      <Input
        label="Tên đăng nhập"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <Input
        label="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={isLoading} fullWidth>
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  )
}
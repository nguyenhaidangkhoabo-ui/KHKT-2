import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  User,
} from 'lucide-react'

import { useAuth } from '../../context'
import { APP_CONFIG } from '../../config/app.config'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [authError, setAuthError] = useState('')

  const usernameRef = useRef(null)
  const passwordRef = useRef(null)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || null

  useEffect(() => {
    if (usernameError) {
      usernameRef.current?.focus()
    }
  }, [usernameError])

  useEffect(() => {
    if (passwordError) {
      passwordRef.current?.focus()
    }
  }, [passwordError])

  const clearAuthError = () => {
    if (authError) {
      setAuthError('')
    }
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)

    if (usernameError) {
      setUsernameError('')
    }

    clearAuthError()
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)

    if (passwordError) {
      setPasswordError('')
    }

    clearAuthError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    setUsernameError('')
    setPasswordError('')
    setAuthError('')

    const normalizedUsername = username.trim()

    let hasError = false

    if (!normalizedUsername) {
      setUsernameError('Vui lòng nhập tên đăng nhập.')
      hasError = true
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu.')
      hasError = true
    }

    if (hasError) {
      if (!normalizedUsername) {
        usernameRef.current?.focus()
      } else {
        passwordRef.current?.focus()
      }

      return
    }

    try {
      setLoading(true)

      const res = await login({
        username: normalizedUsername,
        password,
      })

      const targetPath = from || res?.redirectPath || '/admin/dashboard'

      navigate(targetPath, { replace: true })
    } catch (err) {
      setAuthError(
        err?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClassName = (hasError, withPasswordToggle = false) =>
    [
      'w-full',
      'min-h-11',
      'rounded-lg',
      'border',
      withPasswordToggle ? 'pl-10 pr-11' : 'pl-10 pr-3.5',
      'text-sm',
      'text-slate-900',
      'placeholder:text-slate-400',
      'bg-slate-50/40',
      'transition-all',
      'focus:outline-none',
      'focus:bg-white',
      hasError
        ? 'border-red-300 ring-2 ring-red-100 focus:border-red-400 focus:ring-red-100'
        : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20',
      'disabled:cursor-not-allowed',
      'disabled:opacity-60',
    ].join(' ')


  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Đăng nhập
        </h1>

        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Nhập tài khoản được cấp bởi {APP_CONFIG.schoolName}
        </p>
      </div>

      {authError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-red-50 p-3.5 text-red-700 animate-in fade-in duration-200"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />

          <p className="text-xs leading-relaxed">{authError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Form đăng nhập"
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Tên đăng nhập
          </label>

          <div className="relative">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
              aria-hidden="true"
            >
              <User className="h-4 w-4" />
            </div>

            <input
              ref={usernameRef}
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Tên đăng nhập hoặc mã định danh"
              className={inputClassName(Boolean(usernameError))}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              disabled={loading}
              aria-invalid={Boolean(usernameError)}
              aria-describedby={
                usernameError ? 'username-error' : undefined
              }
              required
            />
          </div>

          {usernameError && (
            <p
              id="username-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {usernameError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Mật khẩu
          </label>

          <div className="relative">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
              aria-hidden="true"
            >
              <Lock className="h-4 w-4" />
            </div>

            <input
              ref={passwordRef}
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Nhập mật khẩu"
              className={inputClassName(Boolean(passwordError), true)}
              autoComplete="current-password"
              disabled={loading}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? 'password-error' : undefined
              }
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              disabled={loading}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex min-h-11 min-w-11 items-center justify-center rounded-r-lg text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {passwordError && (
            <p
              id="password-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {passwordError}
            </p>
          )}
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden="true"
                />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="border-t border-slate-100 pt-4 text-center">
        <p className="text-[11px] leading-relaxed text-slate-500">
          Liên hệ quản trị viên nếu bạn quên mật khẩu hoặc chưa có tài khoản.
        </p>
      </div>
    </div>
  )
}
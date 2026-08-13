import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="login-page">
      <Outlet />
    </div>
  )
}
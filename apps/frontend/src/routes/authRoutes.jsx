import { Routes, Route } from 'react-router-dom'
import AuthLayout from '../layouts/authLayout'
import LoginPage from '../pages/auth/loginpage'

export default function AuthRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route index element={<LoginPage />} />
      </Route>
    </Routes>
  )
}
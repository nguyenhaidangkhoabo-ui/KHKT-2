import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingLayout, DashboardLayout, AuthLayout } from '../layouts'
import HomePage from '../pages/public/HomePage'
import AboutPage from '../pages/public/AboutPage'
import ContactPage from '../pages/public/ContactPage'
import LoginPage from '../pages/public/LoginPage'
import DashboardOverviewPage from '../pages/admin/DashboardOverviewPage'
import ProfilePage from '../pages/admin/ProfilePage'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route path="/admin" element={<DashboardLayout title="Quản trị hệ thống" />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverviewPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/profile" element={<Navigate to="/admin/profile" replace />} />
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
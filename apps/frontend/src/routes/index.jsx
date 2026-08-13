import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/authcontext'
import { NotificationProvider } from '../context/notificationContext'
import ToastContainer from '../components/feedback/toast'
import ProtectedRoute from './ProtectedRoute'
import AuthRoutes from './authRoutes'
import StudentRoutes from './studentRoutes'
import StaffRoutes from './staffRoutes'
import AdminRoutes from './adminRoutes'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<AuthRoutes />} />
            <Route
              path="/student/*"
              element={<ProtectedRoute roles={['STUDENT']}><StudentRoutes /></ProtectedRoute>}
            />
            <Route
              path="/staff/*"
              element={<ProtectedRoute roles={['TEACHER']}><StaffRoutes /></ProtectedRoute>}
            />
            <Route
              path="/admin/*"
              element={<ProtectedRoute roles={['BGH', 'ADMIN', 'SYSTEM_ADMIN']}><AdminRoutes /></ProtectedRoute>}
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
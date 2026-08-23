import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingLayout, DashboardLayout, AuthLayout } from '../layouts'
import ProtectedRoute from '../components/guards/ProtectedRoute'
import HomePage from '../pages/public/HomePage'
import AboutPage from '../pages/public/AboutPage'
import ContactPage from '../pages/public/ContactPage'
import LoginPage from '../pages/public/LoginPage'

// ===== Admin =====
import DashboardOverviewPage from '../pages/admin/DashboardOverviewPage'
import ProfilePage from '../pages/admin/ProfilePage'
import AcademicYearPage from '../pages/admin/AcademicYearPage'
import ClassPage from '../pages/admin/ClassPage'
import ClassYearPage from '../pages/admin/ClassYearPage'
import StudentListPage from '../pages/admin/StudentListPage'
import StudentDetailPage from '../pages/admin/StudentDetailPage'
import StaffPage from '../pages/admin/StaffPage'
import DiplomaListPage from '../pages/admin/DiplomaListPage'
import DiplomaHandoverPage from '../pages/admin/DiplomaHandoverPage'
import ScheduleCurrentPage from '../pages/admin/ScheduleCurrentPage'
import ScheduleNextWeekPage from '../pages/admin/ScheduleNextWeekPage'
import RegistrationListPage from '../pages/admin/RegistrationListPage'

// ===== Học sinh =====
import StudentProfilePage from '../pages/student/StudentProfilePage'
import MyDiplomaPage from '../pages/student/MyDiplomaPage'
import PickupRegistrationPage from '../pages/student/PickupRegistrationPage'
import PickupHistoryPage from '../pages/student/PickupHistoryPage'

// ===== Giáo viên / Cán bộ =====
import TeacherProfilePage from '../pages/staff/TeacherProfilePage'
import HomeroomStudentsPage from '../pages/staff/HomeroomStudentsPage'
import ClassDiplomasPage from '../pages/staff/ClassDiplomasPage'

// Vai trò được phép vào khu vực quản trị (đồng bộ HOME_BY_ROLE)
const ADMIN_ROLES = ['ADMIN', 'BGH', 'SYSTEM_ADMIN']

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

        {/* ===== Khu vực quản trị ===== */}
        <Route path="/admin" element={<DashboardLayout title="Quản trị hệ thống" />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <DashboardOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="years"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <AcademicYearPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="classes"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <ClassPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="class-years"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <ClassYearPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="students"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <StudentListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="students/:id"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <StudentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="staff"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <StaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="diplomas"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <DiplomaListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="diplomas/receive"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <DiplomaHandoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="schedules/current"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <ScheduleCurrentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="schedules/next"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <ScheduleNextWeekPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="registrations"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <RegistrationListPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ===== Cổng học sinh ===== */}
        <Route path="/student" element={<DashboardLayout title="Cổng học sinh" />}>
          <Route index element={<Navigate to="/student/profile" replace />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="diploma"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyDiplomaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="diploma/pickup"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <PickupRegistrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="diploma/history"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <PickupHistoryPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ===== Cổng giáo viên / chủ nhiệm ===== */}
        <Route path="/staff" element={<DashboardLayout title="Cổng giáo viên" />}>
          <Route index element={<Navigate to="/staff/profile" replace />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <TeacherProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="class/students"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <HomeroomStudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="class/diplomas"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <ClassDiplomasPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ===== Chuyển hướng cũ ===== */}
        <Route path="/profile" element={<Navigate to="/admin/profile" replace />} />
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Catch-all luôn đặt cuối cùng */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

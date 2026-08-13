import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../layouts/adminLayout'
import DashboardPage from '../pages/admin/DashboardPage'
import AcedemicYearsPage from '../pages/admin/AcedemicYearsPage'
import ClassesPage from '../pages/admin/ClassesPage'
import StudentsListPage from '../pages/admin/students_m/studentsListPage'
import StudentImportPage from '../pages/admin/students_m/studentImportPage'
import StaffManagementPage from '../pages/admin/staff_m/staffManagementPage'
import DiplomasOverviewPage from '../pages/admin/diplomas_m/diplomasOverviewPage'
import ReceiveDiplomasPage from '../pages/admin/diplomas_m/receiveDiplomasPage'
import HandoverDiplomasPage from '../pages/admin/diplomas_m/handoverDiplomasPage'
import CurrentSchedulePage from '../pages/admin/schedules/currentSchedulePage'
import NextScheduleConfigPage from '../pages/admin/schedules/nextScheduleConfigPage'
import RegistrationsListPage from '../pages/admin/schedules/registrationsListPage'
import PreparationExportPage from '../pages/admin/schedules/preparationExportPage'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="years" element={<AcedemicYearsPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="students" element={<StudentsListPage />} />
        <Route path="students/import" element={<StudentImportPage />} />
        <Route path="staff" element={<StaffManagementPage />} />
        <Route path="diplomas" element={<DiplomasOverviewPage />} />
        <Route path="diplomas/receive" element={<ReceiveDiplomasPage />} />
        <Route path="diplomas/handover" element={<HandoverDiplomasPage />} />
        <Route path="schedules/current" element={<CurrentSchedulePage />} />
        <Route path="schedules/next" element={<NextScheduleConfigPage />} />
        <Route path="registrations" element={<RegistrationsListPage />} />
        <Route path="registrations/preparation" element={<PreparationExportPage />} />
      </Route>
    </Routes>
  )
}
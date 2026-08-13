import { Routes, Route } from 'react-router-dom'
import StaffLayout from '../layouts/staffLayout'
import StaffProfilePage from '../pages/staff/staffProfilePage'
import ClassStudentsPage from '../pages/staff/class/classstudentsPage'
import ClassDiplomasPage from '../pages/staff/class/classdiplomasPage'

export default function StaffRoutes() {
  return (
    <Routes>
      <Route element={<StaffLayout />}>
        <Route path="profile" element={<StaffProfilePage />} />
        <Route path="class/students" element={<ClassStudentsPage />} />
        <Route path="class/diplomas" element={<ClassDiplomasPage />} />
      </Route>
    </Routes>
  )
}
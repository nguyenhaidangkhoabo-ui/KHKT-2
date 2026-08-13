import { Routes, Route } from 'react-router-dom'
import StudentLayout from '../layouts/studentLayout'
import StudentProfilePage from '../pages/student/studentProfilePage'
import DiplomaOverviewPage from '../pages/student/diploma/diplomaOverviewPage'
import PickupDatesPage from '../pages/student/diploma/pickupDatesPage'
import PickupRegisterPage from '../pages/student/diploma/pickupRegisterPage'
import PickupHistoryPage from '../pages/student/diploma/pickupHistoryPage'

export default function StudentRoutes() {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="diploma" element={<DiplomaOverviewPage />} />
        <Route path="diploma/pickup/dates" element={<PickupDatesPage />} />
        <Route path="diploma/pickup" element={<PickupRegisterPage />} />
        <Route path="diploma/history" element={<PickupHistoryPage />} />
      </Route>
    </Routes>
  )
}
import { Outlet } from 'react-router-dom'
import Header from './components/header'
import Sidebar from './components/sidebar'
import { NAVIGATION } from '../config/navigation'

export default function StaffLayout() {
  return (
    <div className="app-layout">
      <Sidebar menu={NAVIGATION.TEACHER} />
      <div className="app-main">
        <Header title="Giáo viên" />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
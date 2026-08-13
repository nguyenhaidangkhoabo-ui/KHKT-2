import { Outlet } from 'react-router-dom'
import Header from './components/header'
import Sidebar from './components/sidebar'
import { NAVIGATION } from '../config/navigation'

export default function AdminLayout() {
  return (
    <div className="app-layout">
      <Sidebar menu={NAVIGATION.ADMIN} />
      <div className="app-main">
        <Header title="Quản trị hệ thống" />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
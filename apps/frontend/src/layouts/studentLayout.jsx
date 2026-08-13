import { Outlet } from 'react-router-dom'
import Header from './components/header'
import Sidebar from './components/sidebar'
import { NAVIGATION } from '../config/navigation'

export default function StudentLayout() {
  return (
    <div className="app-layout">
      <Sidebar menu={NAVIGATION.STUDENT} />
      <div className="app-main">
        <Header title="Học sinh" />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
import { Outlet } from 'react-router-dom'
import LandingHeader from './components/LandingHeader'
import LandingFooter from './components/LandingFooter'
import { useAuth } from '../context'

export default function LandingLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-bg-main text-slate-800 font-sans selection:bg-primary/20 selection:text-primary-900">
      <LandingHeader user={user} onLogout={logout} />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  )
}


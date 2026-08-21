import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-bg-secondary font-sans">
      <div className="w-full max-w-md bg-white p-7 sm:p-9 rounded-2xl border border-slate-200/90 shadow-sm">
        <Outlet />
      </div>
    </div>
  )
}
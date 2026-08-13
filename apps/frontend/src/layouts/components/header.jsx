import UserDropdown from './userdropdown'

export default function Header({ title }) {
  return (
    <header className="app-header">
      <div className="app-header-title">{title}</div>
      <UserDropdown />
    </header>
  )
}
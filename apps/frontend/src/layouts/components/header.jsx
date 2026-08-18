import UserDropdown from './userdropdown'

export default function Header({ title }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <h1 className="app-header-title">{title}</h1>
        <p className="app-header-sub">Cổng thông tin THPT Huỳnh Văn Nghệ</p>
      </div>
      <UserDropdown />
    </header>
  )
}
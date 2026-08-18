import { NavLink } from 'react-router-dom'
import Icon from '../../components/ui/icon'
import { APP_CONFIG } from '../../config/app.config'

export default function Sidebar({ menu = [] }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-badge"><Icon name="school" size={24} /></div>
        <div className="brand-text">
          <span className="brand-name">{APP_CONFIG.appShortName}</span>
          <span className="brand-sub">Cổng thông tin</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <p className="sidebar-section-title">Menu</p>
        <ul className="sidebar-menu">
          {menu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path.split('/').filter(Boolean).length === 2}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>© {new Date().getFullYear()} {APP_CONFIG.schoolName}</p>
      </div>
    </aside>
  )
}
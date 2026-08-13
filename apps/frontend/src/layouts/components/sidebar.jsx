import { NavLink } from 'react-router-dom'
import { APP_CONFIG } from '../../config/app.config'

export default function Sidebar({ menu = [] }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">{APP_CONFIG.appName}</div>
      <ul className="sidebar-menu">
        {menu.map((item) => (
          <li key={item.path}>
            <NavLink to={item.path} end={item.path.split('/').length <= 3}>
              <span>{item.icon}</span> {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
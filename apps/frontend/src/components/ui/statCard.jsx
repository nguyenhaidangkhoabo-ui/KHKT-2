import Icon from './icon'

// tone: primary | success | warning | danger | info | accent
export default function StatCard({ label, value, icon = 'info', tone = 'primary', sub }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-icon">
        <Icon name={icon} size={22} />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value ?? '—'}</span>
        <span className="stat-label">{label}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  )
}
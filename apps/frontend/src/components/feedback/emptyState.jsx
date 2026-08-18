import Icon from '../ui/icon'

export default function EmptyState({ text = 'Chưa có dữ liệu', icon = 'inbox', hint }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon name={icon} size={32} /></div>
      <p>{text}</p>
      {hint && <span className="empty-hint">{hint}</span>}
    </div>
  )
}
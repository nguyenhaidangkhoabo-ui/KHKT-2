import Icon from '../ui/icon'

// type: success | error | warning | info
export default function Alert({ type = 'info', children, onClose }) {
  const icons = { success: 'check', error: 'close', warning: 'warning', info: 'info' }
  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-content">
        <Icon name={icons[type]} size={16} />
        <span>{children}</span>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Đóng">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  )
}
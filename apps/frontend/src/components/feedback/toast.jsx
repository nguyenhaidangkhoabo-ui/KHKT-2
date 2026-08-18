import { useContext } from 'react'
import { NotificationContext } from '../../context/notificationContext'
import Icon from '../ui/icon'

const TOAST_ICONS = { success: 'check', error: 'close', warning: 'warning', info: 'info' }

export default function ToastContainer() {
  const { toasts, removeToast } = useContext(NotificationContext)

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
          <Icon name={TOAST_ICONS[t.type] || 'info'} size={18} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
import { useContext } from 'react'
import { NotificationContext } from '../../context/notificationContext'

export default function ToastContainer() {
  const { toasts, removeToast } = useContext(NotificationContext)

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
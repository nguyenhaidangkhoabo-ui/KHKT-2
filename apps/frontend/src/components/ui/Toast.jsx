import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

// Hệ thống thông báo nhẹ (toast) tự chứa — không phụ thuộc thư viện ngoài.
// Cách dùng:  import { toast } from '<đường dẫn>/Toast'
//             toast.success('Thành công'); toast.error('Thất bại'); toast.info('Thông tin')
// Mount <ToastContainer /> một lần ở layout gốc.

const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const TOAST_STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
}

const TOAST_ICON_STYLES = {
  success: 'text-emerald-600',
  error: 'text-accent',
  info: 'text-sky-600',
}

let toastId = 0
let pushHandler = null

function push(type, message) {
  const item = { id: ++toastId, type, message }
  if (pushHandler) {
    pushHandler(item)
  }
  return item
}

export const toast = {
  success: (message) => push('success', message),
  error: (message) => push('error', message),
  info: (message) => push('info', message),
}

function ToastItem({ item, onDismiss }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const hideTimer = setTimeout(() => setLeaving(true), 3800)
    const removeTimer = setTimeout(() => onDismiss(item.id), 4200)
    return () => {
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }, [item.id, onDismiss])

  const Icon = TOAST_ICONS[item.type] || Info

  return (
    <div
      role="status"
      className={`
        pointer-events-auto flex items-start gap-2.5 w-80 max-w-full
        px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm
        ${TOAST_STYLES[item.type] || TOAST_STYLES.info}
        transition-all duration-300 animate-in fade-in slide-in-from-top-2
        ${leaving ? 'opacity-0 translate-y-1' : ''}
      `}
    >
      <Icon className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${TOAST_ICON_STYLES[item.type] || ''}`} />
      <p className="flex-1 text-xs font-semibold leading-relaxed break-words">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="text-current/60 hover:text-current cursor-pointer shrink-0 font-bold leading-none"
        aria-label="Đóng thông báo"
      >
        ×
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const [items, setItems] = useState([])

  useEffect(() => {
    pushHandler = (item) => {
      setItems((prev) => [...prev.slice(-4), item])
    }
    return () => {
      pushHandler = null
    }
  }, [])

  const handleDismiss = (id) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }

  if (items.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {items.map((item) => (
        <ToastItem key={item.id} item={item} onDismiss={handleDismiss} />
      ))}
    </div>
  )
}

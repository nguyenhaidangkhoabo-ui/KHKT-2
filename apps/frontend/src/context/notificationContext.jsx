import { createContext, useState, useCallback } from 'react'

export const NotificationContext = createContext(null)

let toastId = 0

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((type, message) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => removeToast(id), 3000)
  }, [removeToast])

  const toast = {
    success: (msg) => showToast('success', msg),
    error: (msg) => showToast('error', msg),
    warning: (msg) => showToast('warning', msg),
    info: (msg) => showToast('info', msg),
  }

  return (
    <NotificationContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
    </NotificationContext.Provider>
  )
}
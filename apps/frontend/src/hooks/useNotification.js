import { useContext } from 'react'
import { NotificationContext } from '../context/notificationContext'

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification phải dùng trong NotificationProvider')
  return ctx
}
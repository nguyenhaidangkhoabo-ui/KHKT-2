import { tokenManager } from './tokenManager'
import { APP_CONFIG } from '../config/app.config'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/**
 * Tải file Excel có xác thực.
 * @param {string} endpoint - Đường dẫn API (VD: '/core/students/export')
 * @param {string} filename - Tên file tải về
 */
export async function downloadExcel(endpoint, filename) {
  const token = tokenManager.getToken()
  const res = await fetch(`${APP_CONFIG.apiBaseUrl}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Không thể tải file Excel')
  }
  const blob = await res.blob()
  downloadBlob(blob, filename)
}
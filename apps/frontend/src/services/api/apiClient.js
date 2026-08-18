import { tokenManager } from '../../utils/tokenManager'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Gọi API tập trung:
 * - Tự gắn Authorization: Bearer <token> (lấy từ localStorage).
 * - Hỗ trợ JSON body lẫn FormData (import Excel).
 * - Xử lý lỗi chuẩn: 401 → xóa phiên & về /login; parse message tiếng Việt.
 * - Trả về `data` (đã bóc envelope { success, data }).
 */
export async function apiClient(endpoint, { method = 'GET', body, params, formData } = {}) {
  let url = `${BASE_URL}${endpoint}`
  if (params) {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    const qs = new URLSearchParams(clean).toString()
    if (qs) url += `?${qs}`
  }

  const headers = {}
  const token = tokenManager.getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (formData) {
    payload = formData // trình duyệt tự set Content-Type: multipart/form-data + boundary
  } else if (body) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(url, { method, headers, body: payload })

  // Phiên hết hạn
  if (res.status === 401) {
    tokenManager.clear()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      const message = json.message || json.error?.message || `Lỗi ${res.status}`
      throw new Error(message)
    }
    return json.data ?? json
  }

  // File (Excel export) — trả về Blob
  if (!res.ok) throw new Error(`Lỗi ${res.status}`)
  return await res.blob()
}
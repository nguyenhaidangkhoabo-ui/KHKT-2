// Wrapper fetch — tự gửi cookie (credentials: 'include'), parse JSON, xử lý lỗi tập trung.
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function apiClient(endpoint, { method = 'GET', body, params } = {}) {
  let url = `${BASE_URL}${endpoint}`
  if (params) {
    const qs = new URLSearchParams(params).toString()
    url += `?${qs}`
  }

  const options = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(url, options)

  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('Phiên đăng nhập đã hết hạn')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Lỗi ${res.status}`)
  }
  return data
}
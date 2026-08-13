export function formatDate(dateStr, withTime = false) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('vi-VN')
  return withTime
    ? `${date} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    : date
}
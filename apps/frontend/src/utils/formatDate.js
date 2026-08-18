/** "2026-08-10T08:30:00Z" -> "10/08/2026" | "10/08/2026 08:30" */
export function formatDate(dateStr, withTime = false) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  const date = d.toLocaleDateString('vi-VN')
  return withTime
    ? `${date} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    : date
}

/** Rút gọn: "10/08" (dùng trong lịch, lịch sử) */
export function formatDateShort(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

/** "2025-2026" cho năm học dạng "Năm học 2025-2026" */
export function formatAcademicYear(year) {
  if (!year) return '—'
  return `Năm học ${year.start_year} - ${year.end_year}`
}
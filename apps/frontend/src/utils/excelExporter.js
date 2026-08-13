export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function downloadExcel(url, filename) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error('Không thể tải file Excel')
  const blob = await res.blob()
  downloadBlob(blob, filename)
}
// Phân trang dùng chung.
// Props: page, totalPages, total, onChange(page)

import { ChevronLeft, ChevronRight } from 'lucide-react'

function buildPageList(page, totalPages) {
  // Trả về danh sách trang hiển thị: 1 ... (p-1, p, p+1) ... totalPages
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  const list = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const result = []
  let prev = 0
  for (const p of list) {
    if (p - prev > 1) result.push('...')
    result.push(p)
    prev = p
  }
  return result
}

export default function Pagination({ page = 1, totalPages = 1, total = 0, onChange }) {
  if (!totalPages || totalPages <= 1) {
    return (
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-slate-500 font-medium">
          Tổng cộng <strong className="text-slate-800">{Number(total || 0).toLocaleString('vi-VN')}</strong> bản ghi
        </span>
      </div>
    )
  }

  const currentPage = Math.min(Math.max(1, page), totalPages)
  const items = buildPageList(currentPage, totalPages)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <span className="text-[11px] text-slate-500 font-medium">
        Trang <strong className="text-slate-800">{currentPage}</strong> / {totalPages} — Tổng cộng{' '}
        <strong className="text-slate-800">{Number(total || 0).toLocaleString('vi-VN')}</strong> bản ghi
      </span>

      <nav className="flex items-center gap-1" aria-label="Phân trang">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onChange?.(currentPage - 1)}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {items.map((item, idx) =>
          item === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-400 select-none">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange?.(item)}
              className={`
                min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer
                ${
                  item === currentPage
                    ? 'bg-primary text-white shadow-primary shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary'
                }
              `}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onChange?.(currentPage + 1)}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  )
}

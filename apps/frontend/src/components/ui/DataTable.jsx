// Bảng dữ liệu dùng chung (DataTable).
// Props:
//  - columns: [{ key, header, render?(row), className? }]
//  - data: mảng bản ghi
//  - loading: đang tải -> hiển thị skeleton
//  - rowKey: 'id' (mặc định) hoặc hàm (row) => string
//  - emptyMessage?: thông báo khi không có dữ liệu
//  - selectable?: bật cột checkbox
//  - selectedIds?: Set | Array các id đang chọn
//  - onToggleSelect?(id), onToggleSelectAll?(checked)

import EmptyState from './EmptyState'
import { Inbox } from 'lucide-react'

function resolveRowKey(row, index, rowKey) {
  if (typeof rowKey === 'function') return String(rowKey(row) ?? index)
  return String(row?.[rowKey] ?? index)
}

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  rowKey = 'id',
  emptyMessage,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) {
  const selectedSet =
    selectedIds instanceof Set ? selectedIds : new Set(selectedIds || [])

  const allChecked =
    data.length > 0 && data.every((row) => selectedSet.has(resolveRowKey(row, 0, rowKey)))

  if (!loading && data.length === 0) {
    return (
      <div className="py-10">
        <EmptyState icon={Inbox} title={emptyMessage || 'Chưa có dữ liệu'} />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/90">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {selectable && (
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                  disabled={data.length === 0}
                  className="w-4 h-4 rounded border-slate-300 text-primary accent-[#295483] cursor-pointer"
                  aria-label="Chọn tất cả"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {loading
            ? [...Array(5)].map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  {selectable && (
                    <td className="px-4 py-3.5">
                      <div className="w-4 h-4 rounded bg-slate-100" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-3.5 rounded bg-slate-100 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            : data.map((row, index) => {
                const id = resolveRowKey(row, index, rowKey)
                const isSelected = selectedSet.has(id)
                return (
                  <tr
                    key={id}
                    className={`transition-colors ${
                      isSelected ? 'bg-primary-50/60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onToggleSelect?.(id, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-primary accent-[#295483] cursor-pointer"
                          aria-label="Chọn dòng"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-xs text-slate-700 align-middle ${col.className || ''}`}
                      >
                        {col.render ? col.render(row) : row?.[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                )
              })}
        </tbody>
      </table>
    </div>
  )
}

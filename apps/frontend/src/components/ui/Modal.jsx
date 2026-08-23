import { useEffect } from 'react'
import { X } from 'lucide-react'

// Hộp thoại (Modal) dùng chung.
// Props: isOpen, onClose, title, size ('md' | 'lg' | 'xl'), footer, children

const SIZE_CLASSES = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  footer,
  children,
}) {
  // Khóa cuộn nền khi modal mở + đóng bằng phím Escape
  useEffect(() => {
    if (!isOpen) return undefined
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Lớp phủ mờ */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Khung nội dung */}
      <div
        role="dialog"
        aria-modal="true"
        className={`
          relative w-full ${SIZE_CLASSES[size] || SIZE_CLASSES.md}
          bg-white rounded-2xl border border-slate-200/90 shadow-xl
          max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Tiêu đề */}
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Đóng hộp thoại"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 custom-scrollbar">
          {children}
        </div>

        {/* Chân modal (nút thao tác) */}
        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

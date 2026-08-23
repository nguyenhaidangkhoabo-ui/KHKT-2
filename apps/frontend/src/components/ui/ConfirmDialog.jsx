// Hộp thoại xác nhận (ConfirmDialog) cho các thao tác quan trọng / phá hủy.
// Props: isOpen, onClose, onConfirm, title, message, confirmText?, danger?, loading?

import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  danger = false,
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="flex items-start gap-3.5">
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${danger ? 'bg-red-50 text-accent' : 'bg-primary-50 text-primary'}
          `}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1.5">{message}</div>
      </div>

      <div className="flex items-center justify-end gap-2.5 mt-6">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          Hủy bỏ
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

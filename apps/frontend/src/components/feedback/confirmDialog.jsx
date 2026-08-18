import Modal from '../ui/modal'
import Button from '../ui/button'

export default function ConfirmDialog({
  open,
  title = 'Xác nhận',
  message,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>{cancelText}</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </>
      }
    >
      <p className="confirm-message">{message}</p>
    </Modal>
  )
}
import { useState } from 'react'
import Card from '../../../components/ui/card'
import Button from '../../../components/ui/button'
import Input from '../../../components/ui/input'
import Alert from '../../../components/feedback/alert'
import { downloadExcel } from '../../../utils/excelExporter'
import { useNotification } from '../../../hooks/useNotification'

export default function PreparationExportPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useNotification()

  const handleExport = async () => {
    if (!date) return toast.error('Vui lòng chọn ngày')
    setLoading(true)
    setError('')
    try {
      await downloadExcel(`/diploma/registrations/export?pickup_date=${date}`, `danh-sach-nhan-bang-${date}.xlsx`)
      toast.success('Đã tải file danh sách')
    } catch (e) {
      setError(e.message)
      toast.error(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Xuất danh sách chuẩn bị trao bằng</h2>
          <p className="page-subtitle">Tải file Excel danh sách học sinh đến nhận bằng theo ngày</p>
        </div>
      </div>

      {error && <Alert type="error">{error.message}</Alert>}
      <Card>
        <Input label="Ngày trao bằng" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button onClick={handleExport} loading={loading} fullWidth size="lg">
          Tải file Excel
        </Button>
        <p className="text-muted mt-4" style={{ fontSize: 'var(--font-size-xs)' }}>
          Tính năng cần module Diploma phía backend (Phụ lục A).
        </p>
      </Card>
    </div>
  )
}
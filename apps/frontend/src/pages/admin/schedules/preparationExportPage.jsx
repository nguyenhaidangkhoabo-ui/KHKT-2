import { useState } from 'react'
import { adminScheduleService } from '../../../services/adminSchedule.service'
import { downloadExcel } from '../../../utils/excelExporter'
import Button from '../../../components/ui/button'
import Input from '../../../components/ui/input'
import Alert from '../../../components/feedback/alert'

export default function PreparationExportPage() {
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!date) {
      setError('Vui lòng chọn ngày.')
      return
    }
    setExporting(true)
    setError('')
    try {
      const url = adminScheduleService.exportRegistrations(date)
      await downloadExcel(url, `danh-sach-rut-bang-${date}.xlsx`)
    } catch (e) {
      setError(e.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Trích xuất Excel rút bằng</h1>
      <div className="card">
        {error && <Alert type="error">{error}</Alert>}
        <Input
          type="date"
          label="Chọn ngày" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? 'Đang xuất...' : 'Xuất Excel'}
        </Button>
      </div>
    </div>
  )
}
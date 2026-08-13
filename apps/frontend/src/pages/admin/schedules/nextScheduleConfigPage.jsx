import { useState } from 'react'
import { adminScheduleService } from '../../../services/adminSchedule.service'
import Button from '../../../components/ui/button'
import Alert from '../../../components/feedback/alert'
import { useNotification } from '../../../hooks/useNotification'

export default function NextScheduleConfigPage() {
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const { toast } = useNotification()

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      await adminScheduleService.generateNextWeek()
      toast.success('Đã tạo lịch tuần kế tiếp')
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Cấu hình lịch tuần kế tiếp</h1>
      <div className="card">
        {error && <Alert type="error">{error}</Alert>}
        <p className="mb-4">
          Tạo lịch nhận bằng cho tuần kế tiếp dựa trên cấu hình mặc định.
        </p>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? 'Đang tạo...' : 'Tạo lịch tuần kế tiếp'}
        </Button>
      </div>
    </div>
  )
}
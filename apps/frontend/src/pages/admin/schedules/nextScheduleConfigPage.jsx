import { useState } from 'react'
import { adminScheduleService } from '../../../services/adminSchedule.service'
import Card from '../../../components/ui/card'
import Button from '../../../components/ui/button'
import Alert from '../../../components/feedback/alert'
import { useNotification } from '../../../hooks/useNotification'

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default function NextScheduleConfigPage() {
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useNotification()

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      await adminScheduleService.generateNextWeek()
      setGenerated(true)
      toast.success('Đã tạo lịch tuần sau')
    } catch (e) {
      setError(e.message)
      toast.error(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Cấu hình lịch tuần sau</h2>
          <p className="page-subtitle">Tạo lịch nhận bằng cho tuần kế tiếp</p>
        </div>
      </div>

      {error && <Alert type="error">{error.message}</Alert>}
      <Card>
        <p className="text-secondary mb-4">
          Nhấn nút bên dưới để sinh lịch mặc định cho 7 ngày trong tuần sau, sau đó điều chỉnh từng ngày.
        </p>
        <Button onClick={handleGenerate} loading={loading}>+ Tạo lịch tuần sau</Button>
        {generated && (
          <div className="mt-4">
            <Alert type="success">Lịch đã được tạo. Hãy điều chỉnh trạng thái từng ngày trong module Diploma (backend).</Alert>
          </div>
        )}
      </Card>

      <Card title="Các ngày trong tuần" className="mt-4">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="flex-between" style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-secondary">{d}</span>
            <Button size="sm" variant="ghost" onClick={async () => {
              try {
                await adminScheduleService.updateNextWeekDay(d, { enable: true })
                toast.success(`Đã bật ${d}`)
              } catch (e) { toast.error(e.message) }
            }}>Bật</Button>
          </div>
        ))}
      </Card>
    </div>
  )
}
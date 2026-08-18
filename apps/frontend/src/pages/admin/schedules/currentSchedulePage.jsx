import { useFetch } from '../../../hooks/useFetch'
import { adminScheduleService } from '../../../services/adminSchedule.service'
import Card from '../../../components/ui/card'
import Badge from '../../../components/ui/badge'
import Spinner from '../../../components/ui/spinner'
import Alert from '../../../components/feedback/alert'
import { formatDate } from '../../../utils/formatDate'

export default function CurrentSchedulePage() {
  const { data: week, loading, error } = useFetch(() => adminScheduleService.getCurrentWeek(), [])

  if (loading) return <div className="text-center py-6"><Spinner size="lg" /></div>
  if (error) return <Alert type="warning">{error.message} — Tính năng cần module Diploma (Phụ lục A).</Alert>

  // Lọc trực tiếp các ngày có enabled = true
  const activeDays = week?.days?.filter((d) => d.enabled) || []

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Lịch nhận bằng hiện tại</h2>
          {/* Cập nhật field start_date -> week_start_date & end_date -> week_end_date */}
          <p className="page-subtitle">
            Tuần từ {formatDate(week?.week_start_date)} đến {formatDate(week?.week_end_date)}
          </p>
        </div>
      </div>
      <div className="grid-3">
        {activeDays.length === 0 && <p className="text-secondary">Chưa có lịch cho tuần này.</p>}
        {activeDays.map((d) => (
          <Card key={d._id} title={formatDate(d.date, true)} subtitle={d.shift_name ? `Ca: ${d.shift_name}` : ''}>
            <Badge variant="success">Nhận bằng</Badge>
            <p className="mt-2 text-secondary">{d.note || ''}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
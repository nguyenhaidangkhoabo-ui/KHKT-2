import { useFetch } from '../../../hooks/useFetch'
import { studentDiplomaService } from '../../../services/studentDiploma.service'
import Card from '../../../components/ui/card'
import Badge from '../../../components/ui/badge'
import Spinner from '../../../components/ui/spinner'
import Alert from '../../../components/feedback/alert'
import EmptyState from '../../../components/feedback/emptyState'
import { formatDate, formatDateShort } from '../../../utils/formatDate'

export default function PickupDatesPage() {
  const { data: dates, loading, error } = useFetch(() => studentDiplomaService.getAvailableDates(), [])

  if (loading) return <div className="text-center py-6"><Spinner size="lg" /></div>
  if (error) return <Alert type="warning">{error.message} — Chờ module Diploma (Phụ lục A).</Alert>
  if (!dates?.length) return <EmptyState text="Chưa có lịch nhận bằng" icon="calendarDays" />

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Lịch nhận bằng</h2>
          <p className="page-subtitle">Các ngày bạn có thể đến trường nhận bằng tốt nghiệp</p>
        </div>
      </div>
      <div className="grid-3">
        {dates.map((d) => (
          <Card key={d.date} title={formatDate(d.date)} subtitle={`Ca ${d.shift_name || '—'}`}>`
            <p className="text-secondary">{d.note || 'Nhận bằng tại văn phòng nhà trường.'}</p>
            <div className="mt-4">
              <Badge variant={d.remaining_slots > 0 ? 'success' : 'danger'}>
                {d.remaining_slots > 0 ? `Còn ${d.remaining_slots} chỗ` : 'Hết chỗ'}
              </Badge>
              <span className="text-muted" style={{ marginLeft: 8 }}>{formatDateShort(d.date)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
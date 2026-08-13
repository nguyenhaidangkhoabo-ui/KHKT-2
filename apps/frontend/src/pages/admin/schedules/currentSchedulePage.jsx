import { useEffect, useState } from 'react'
import { adminScheduleService } from '../../../services/adminSchedule.service'
import { formatDate } from '../../../utils/formatDate'
import Spinner from '../../../components/ui/spinner'
import Table from '../../../components/ui/table'
import Alert from '../../../components/feedback/alert'

export default function CurrentSchedulePage() {
  const [week, setWeek] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminScheduleService.getCurrentWeek()
      .then((data) => setWeek(data.week || data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  const days = week?.days || []

  const columns = [
    { key: 'date', title: 'Ngày', render: (r) => formatDate(r.date) },
    { key: 'slot', title: 'Ca', render: (r) => r.slot || '—' },
    { key: 'capacity', title: 'Sức chứa', render: (r) => r.capacity ?? '—' },
    { key: 'registered', title: 'Đã đăng ký', render: (r) => r.registered ?? '—' },
  ]

  return (
    <div className="container">
      <h1 className="page-title">Lịch tuần hiện tại</h1>
      {week?.label && <p className="text-secondary mb-4">{week.label}</p>}
      <Table columns={columns} data={days} emptyText="Chưa có lịch cho tuần này." />
    </div>
  )
}
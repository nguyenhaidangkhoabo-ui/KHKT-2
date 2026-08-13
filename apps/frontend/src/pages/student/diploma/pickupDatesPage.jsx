import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentDiplomaService } from '../../../services/studentDiploma.service'
import { formatDate } from '../../../utils/formatDate'
import Spinner from '../../../components/ui/spinner'
import Button from '../../../components/ui/button'
import Table from '../../../components/ui/table'
import Alert from '../../../components/feedback/alert'

export default function PickupDatesPage() {
  const [dates, setDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    studentDiplomaService.getAvailableDates()
      .then((data) => setDates(data.dates || data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'date', title: 'Ngày', render: (r) => formatDate(r.date, true) },
    { key: 'slot', title: 'Ca nhận', render: (r) => r.slot || '—' },
    { key: 'remaining', title: 'Còn chỗ', render: (r) => r.remaining ?? '—' },
    {
      key: 'action', title: 'Thao tác',
      render: (r) => (
        <Button size="sm" onClick={() => navigate('/student/diploma/pickup', { state: { dateId: r.id } })}>
          Đăng ký
        </Button>
      ),
    },
  ]

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <h1 className="page-title">Ngày nhận bằng khả dụng</h1>
      <Table columns={columns} data={dates} emptyText="Hiện chưa có lịch nhận bằng khả dụng." />
    </div>
  )
}
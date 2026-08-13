import { useEffect, useState } from 'react'
import { adminScheduleService } from '../../../services/adminSchedule.service'
import { formatDate } from '../../../utils/formatDate'
import Spinner from '../../../components/ui/spinner'
import Table from '../../../components/ui/table'
import Input from '../../../components/ui/input'
import Alert from '../../../components/feedback/alert'

export default function RegistrationsListPage() {
  const [date, setDate] = useState('')
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!date) return
    setLoading(true)
    adminScheduleService.getRegistrationsByDate(date)
      .then((data) => setRegistrations(data.registrations || data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [date])

  const columns = [
    { key: 'student_name', title: 'Học sinh' },
    { key: 'student_code', title: 'Mã HS' },
    { key: 'class_name', title: 'Lớp', render: (r) => r.class_name || '—' },
    { key: 'registered_at', title: 'Đăng ký lúc', render: (r) => formatDate(r.registered_at, true) },
  ]

  return (
    <div className="container">
      <h1 className="page-title">Danh sách đăng ký theo ngày</h1>
      <div className="card mb-4">
        <Input
          type="date"
          label="Chọn ngày"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      {error && <Alert type="error">{error}</Alert>}
      {loading ? (
        <div className="text-center mt-4"><Spinner /></div>
      ) : (
        <Table columns={columns} data={registrations} emptyText="Chưa chọn ngày hoặc không có đăng ký." />
      )}
    </div>
  )
}
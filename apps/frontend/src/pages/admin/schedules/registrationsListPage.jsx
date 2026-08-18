import { useState } from 'react'
import { useFetch } from '../../../hooks/useFetch'
import { adminScheduleService } from '../../../services/adminSchedule.service'
import Card from '../../../components/ui/card'
import Badge from '../../../components/ui/badge'
import Input from '../../../components/ui/input'
import Table from '../../../components/ui/table'
import Alert from '../../../components/feedback/alert'
import { formatDate } from '../../../utils/formatDate'
import { REGISTRATION_STATUS_LABELS } from '../../../config/constants'

const BADGE_COLOR = { PENDING: 'warning', CONFIRMED: 'info', COMPLETED: 'success', CANCELLED: 'secondary' }

export default function RegistrationsListPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const { data: registrations, loading, error } = useFetch(
    () => adminScheduleService.getRegistrationsByDate(date),
    [date]
  )

  const columns = [
    { key: 'student_code', label: 'Mã HS', render: (r) => <strong>{r.student_code}</strong> },
    { key: 'student_name', label: 'Họ tên' },
    { key: 'schedule_date', label: 'Ngày nhận', render: (r) => formatDate(r.schedule_date?.date) },
    { key: 'status', label: 'Trạng thái', render: (r) => (
      <Badge variant={BADGE_COLOR[r.status] || 'secondary'}>{REGISTRATION_STATUS_LABELS[r.status] || r.status}</Badge>
    ) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Đăng ký nhận bằng</h2>
          <p className="page-subtitle">Danh sách học sinh đăng ký theo ngày</p>
        </div>
      </div>

      <div className="filter-bar">
        <Input label="Ngày nhận" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <Alert type="warning">{error.message} — Tính năng cần module Diploma (Phụ lục A).</Alert>}
      <Card>
        <Table columns={columns} data={registrations || []} loading={loading} emptyText="Không có đăng ký trong ngày này" />
      </Card>
    </div>
  )
}
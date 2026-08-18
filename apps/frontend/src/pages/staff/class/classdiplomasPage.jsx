import { useFetch } from '../../../hooks/useFetch'
import { teacherService } from '../../../services/teacher.service'
import Card from '../../../components/ui/card'
import Badge from '../../../components/ui/badge'
import Table from '../../../components/ui/table'
import Spinner from '../../../components/ui/spinner'
import Alert from '../../../components/feedback/alert'
import { DIPLOMA_STATUS_LABELS, DIPLOMA_STATUS_COLORS } from '../../../config/constants'

export default function ClassDiplomasPage() {
  const { data, loading, error } = useFetch(() => teacherService.getMyClassDiplomas(), [])

  if (loading) return <div className="text-center py-6"><Spinner size="lg" /></div>
  if (error) {
    return <Alert type="warning">{error.message} — Tính năng cần module Diploma (Phụ lục A).</Alert>
  }

  const rows = data?.diplomas || data || []
  const columns = [
    { key: 'student_code', label: 'Mã HS', render: (r) => <strong>{r.student_code}</strong> },
    { key: 'student_name', label: 'Họ tên' },
    { key: 'diploma_number', label: 'Số hiệu bằng' },
    { key: 'status', label: 'Trạng thái', render: (r) => (
      <Badge variant={DIPLOMA_STATUS_COLORS[r.status] || 'secondary'}>{DIPLOMA_STATUS_LABELS[r.status] || r.status}</Badge>
    ) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Bằng tốt nghiệp của lớp</h2>
          <p className="page-subtitle">Trạng thái bằng của học sinh lớp chủ nhiệm</p>
        </div>
      </div>
      <Card>
        <Table columns={columns} data={rows} emptyText="Chưa có dữ liệu bằng" />
      </Card>
    </div>
  )
}
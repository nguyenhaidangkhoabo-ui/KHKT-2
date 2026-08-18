import { useState } from 'react'
import { useFetch } from '../../../hooks/useFetch'
import { adminDiplomaService } from '../../../services/adminDiploma.service'
import Card from '../../../components/ui/card'
import Badge from '../../../components/ui/badge'
import Button from '../../../components/ui/button'
import Table from '../../../components/ui/table'
import Spinner from '../../../components/ui/spinner'
import Alert from '../../../components/feedback/alert'
import { useNotification } from '../../../hooks/useNotification'
import { DIPLOMA_STATUS_LABELS, DIPLOMA_STATUS_COLORS } from '../../../config/constants'

export default function DiplomasOverviewPage() {
  const [keyword, setKeyword] = useState('')
  const { toast } = useNotification()
  const { data: diplomas, loading, error, refetch } = useFetch(
    () => adminDiplomaService.getDiplomas({ keyword: keyword || undefined }),
    [keyword]
  )

  const columns = [
    { key: 'student_code', label: 'Mã HS', render: (r) => <strong>{r.student_code}</strong> },
    { key: 'student_name', label: 'Họ tên' },
    { key: 'class_name', label: 'Lớp' },
    { key: 'diploma_number', label: 'Số hiệu' },
    { key: 'status', label: 'Trạng thái', render: (r) => (
      <Badge variant={DIPLOMA_STATUS_COLORS[r.status] || 'secondary'}>{DIPLOMA_STATUS_LABELS[r.status] || r.status}</Badge>
    ) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Bằng tốt nghiệp</h2>
          <p className="page-subtitle">Theo dõi toàn bộ bằng tốt nghiệp của trường</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => refetch()}>Làm mới</Button>
        </div>
      </div>

      {error && <Alert type="warning">{error.message} — Tính năng cần module Diploma (Phụ lục A).</Alert>}
      <Card>
        {loading ? <Spinner /> : <Table columns={columns} data={diplomas || []} emptyText="Chưa có dữ liệu bằng" />}
      </Card>
    </div>
  )
}
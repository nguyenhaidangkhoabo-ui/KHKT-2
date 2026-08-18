import { useFetch } from '../../../hooks/useFetch'
import { studentDiplomaService } from '../../../services/studentDiploma.service'
import Card from '../../../components/ui/card'
import Badge from '../../../components/ui/badge'
import Spinner from '../../../components/ui/spinner'
import Alert from '../../../components/feedback/alert'
import EmptyState from '../../../components/feedback/emptyState'
import Icon from '../../../components/ui/icon'
import { formatDate } from '../../../utils/formatDate'
import { DIPLOMA_STATUS_LABELS, DIPLOMA_STATUS_COLORS } from '../../../config/constants'

export default function DiplomaOverviewPage() {
  const { data: diploma, loading, error } = useFetch(() => studentDiplomaService.getMyDiploma(), [])

  if (loading) return <div className="text-center py-6"><Spinner size="lg" /></div>
  if (error) {
    return (
      <Alert type="warning">
        {error.message} — Tính năng này cần module Diploma phía backend (xem Phụ lục A).
      </Alert>
    )
  }
  if (!diploma) return <EmptyState text="Chưa có thông tin bằng tốt nghiệp" icon="award" />

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <Card className="diploma-card">
        <div className="diploma-seal"><Icon name="award" size={48} /></div>
        <Badge variant={DIPLOMA_STATUS_COLORS[diploma.status] || 'secondary'}>
          {DIPLOMA_STATUS_LABELS[diploma.status] || diploma.status}
        </Badge>
        <h2 className="mt-4">Bằng tốt nghiệp THPT</h2>
        <p className="diploma-meta">
          Số hiệu: <strong>{diploma.diploma_number || '—'}</strong>
          {diploma.issued_date ? ` · Ngày cấp: ${formatDate(diploma.issued_date)}` : ''}
        </p>
        <p className="text-secondary">
          {diploma.student_name || ''}{diploma.class_name ? ` · lớp ${diploma.class_name}` : ''}
        </p>
      </Card>
    </div>
  )
}
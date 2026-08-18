import { useFetch } from '../../../hooks/useFetch'
import { studentDiplomaService } from '../../../services/studentDiploma.service'
import Card from '../../../components/ui/card'
import Badge from '../../../components/ui/badge'
import Button from '../../../components/ui/button'
import Spinner from '../../../components/ui/spinner'
import Alert from '../../../components/feedback/alert'
import EmptyState from '../../../components/feedback/emptyState'
import ConfirmDialog from '../../../components/feedback/confirmDialog'
import { useState } from 'react'
import { useNotification } from '../../../hooks/useNotification'
import { formatDate } from '../../../utils/formatDate'
import { REGISTRATION_STATUS_LABELS } from '../../../config/constants'

const BADGE_COLOR = { PENDING: 'warning', CONFIRMED: 'info', COMPLETED: 'success', CANCELLED: 'secondary' }

export default function PickupHistoryPage() {
  const [cancelId, setCancelId] = useState(null)
  const { toast } = useNotification()
  const { data: history, loading, error, refetch } = useFetch(
    () => studentDiplomaService.getHistory(),
    []
  )

  const handleCancel = async () => {
    try {
      await studentDiplomaService.cancelRegistration(cancelId)
      toast.success('Đã hủy đăng ký')
      setCancelId(null)
      refetch()
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (loading) return <div className="text-center py-6"><Spinner size="lg" /></div>
  if (error) return <Alert type="warning">{error.message} — Chờ module Diploma (Phụ lục A).</Alert>
  if (!history?.length) return <EmptyState text="Bạn chưa đăng ký nhận bằng nào" icon="clipboard" />

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Lịch sử đăng ký</h2>
          <p className="page-subtitle">Theo dõi trạng thái các lần đăng ký nhận bằng</p>
        </div>
      </div>
      <div className="grid-2">
        {history.map((r) => (
          <Card key={r._id}>
            <div className="flex-between">
              <div>
                <div style={{ fontWeight: 700 }}>{formatDate(r.pickup_date)}</div>
                <div className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {r.diploma_id?.diploma_number ? `Số hiệu bằng: ${r.diploma_id.diploma_number}` : ''}
                </div>
              </div>
              <Badge variant={BADGE_COLOR[r.status] || 'secondary'}>
                {REGISTRATION_STATUS_LABELS[r.status] || r.status}
              </Badge>
            </div>
            {r.status === 'PENDING' && (
              <div className="mt-4">
                <Button variant="danger" size="sm" onClick={() => setCancelId(r._id)}>Hủy đăng ký</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      <ConfirmDialog
        open={!!cancelId}
        title="Hủy đăng ký"
        message="Bạn có chắc chắn muốn hủy đăng ký nhận bằng này?"
        confirmText="Hủy đăng ký"
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />
    </div>
  )
}
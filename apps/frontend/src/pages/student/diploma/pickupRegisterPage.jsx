import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { studentDiplomaService } from '../../../services/studentDiploma.service'
import Button from '../../../components/ui/button'
import Alert from '../../../components/feedback/alert'
import { useNotification } from '../../../hooks/useNotification'

export default function PickupRegisterPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useNotification()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const dateId = location.state?.dateId

  const handleRegister = async () => {
    if (!dateId) {
      setError('Vui lòng chọn ngày nhận bằng trước.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await studentDiplomaService.registerPickup(dateId)
      toast.success('Đăng ký nhận bằng thành công!')
      navigate('/student/diploma/history')
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Đăng ký nhận bằng</h1>
      <div className="card">
        {error && <Alert type="error">{error}</Alert>}
        <p className="mb-4">
          {dateId
            ? 'Bạn có chắc chắn muốn đăng ký nhận bằng vào ngày đã chọn?'
            : 'Vui lòng chọn ngày nhận bằng tại trang "Ngày khả dụng" trước.'}
        </p>
        <div className="flex gap-2">
          <Button onClick={handleRegister} disabled={submitting || !dateId}>
            {submitting ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/student/diploma/pickup/dates')}>
            Chọn ngày khác
          </Button>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFetch } from '../../../hooks/useFetch'
import { studentDiplomaService } from '../../../services/studentDiploma.service'
import Card from '../../../components/ui/card'
import Button from '../../../components/ui/button'
import Spinner from '../../../components/ui/spinner'
import Alert from '../../../components/feedback/alert'
import { useNotification } from '../../../hooks/useNotification'
import { formatDate } from '../../../utils/formatDate'

export default function PickupRegisterPage() {
  const [selected, setSelected] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useNotification()
  const navigate = useNavigate()

  const { data: dates, loading, error } = useFetch(() => studentDiplomaService.getAvailableDates(), [])

  const handleRegister = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await studentDiplomaService.registerPickup(selected)
      toast.success('Đăng ký thành công!')
      navigate('/student/diploma/history')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-6"><Spinner size="lg" /></div>
  if (error) return <Alert type="warning">{error.message} — Chờ module Diploma (Phụ lục A).</Alert>

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Đăng ký nhận bằng</h2>
          <p className="page-subtitle">Chọn một ngày phù hợp để nhận bằng tốt nghiệp</p>
        </div>
      </div>
      <Card>
        {(!dates || dates.length === 0) && <p className="text-secondary">Hiện chưa có lịch nhận bằng nào.</p>}
        <div className="grid-3">
          {dates?.map((d) => (
            <label key={d.date} className={`card pickup-option ${selected === d.date ? 'selected' : ''}`}
              style={{ cursor: 'pointer', padding: 'var(--space-4)' }}>
              <input type="radio" name="pickup" value={d.date}
                checked={selected === d.date}
                onChange={() => setSelected(d.date)}
                style={{ display: 'none' }} />
              <div style={{ fontWeight: 700 }}>{formatDate(d.date)}</div>
              <div className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>Ca {d.shift_name || '—'}</div>
              <div className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{d.note || ''}</div>
            </label>
          ))}
        </div>
        <div className="mt-6">
          <Button onClick={handleRegister} loading={submitting} disabled={!selected} fullWidth size="lg">
            Xác nhận đăng ký
          </Button>
        </div>
      </Card>
    </div>
  )
}
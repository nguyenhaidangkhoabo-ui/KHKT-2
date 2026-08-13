import { useEffect, useState } from 'react'
import { studentDiplomaService } from '../../../services/studentDiploma.service'
import { formatDate } from '../../../utils/formatDate'
import Spinner from '../../../components/ui/spinner'
import Table from '../../../components/ui/table'
import Badge from '../../../components/ui/badge'
import Button from '../../../components/ui/button'
import Alert from '../../../components/feedback/alert'

export default function PickupHistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHistory = () => {
    setLoading(true)
    studentDiplomaService.getHistory()
      .then((data) => setHistory(data.registrations || data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadHistory, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Hủy đăng ký nhận bằng này?')) return
    try {
      await studentDiplomaService.cancelRegistration(id)
      loadHistory()
    } catch (e) {
      setError(e.message)
    }
  }

  const columns = [
    { key: 'date', title: 'Ngày nhận', render: (r) => formatDate(r.date, true) },
    { key: 'status', title: 'Trạng thái', render: (r) => <Badge status={r.status} /> },
    {
      key: 'action', title: 'Thao tác',
      render: (r) =>
        r.status === 'REGISTERED' ? (
          <Button variant="danger" size="sm" onClick={() => handleCancel(r.id)}>Hủy</Button>
        ) : '—',
    },
  ]

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <h1 className="page-title">Lịch sử đăng ký nhận bằng</h1>
      <Table columns={columns} data={history} emptyText="Chưa có lịch sử đăng ký." />
    </div>
  )
}
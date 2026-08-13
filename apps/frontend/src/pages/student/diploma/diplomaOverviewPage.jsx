import { useEffect, useState } from 'react'
import { studentDiplomaService } from '../../../services/studentDiploma.service'
import Spinner from '../../../components/ui/spinner'
import Badge from '../../../components/ui/badge'
import Alert from '../../../components/feedback/alert'

export default function DiplomaOverviewPage() {
  const [diploma, setDiploma] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    studentDiplomaService.getMyDiploma()
      .then((data) => setDiploma(data.diploma || data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <h1 className="page-title">Bằng tốt nghiệp</h1>
      <div className="card">
        {diploma ? (
          <>
            <p><strong>Số hiệu bằng:</strong> {diploma.diploma_number || '—'}</p>
            <p><strong>Trạng thái:</strong> <Badge status={diploma.status} /></p>
            <p><strong>Ngày cấp:</strong> {diploma.issued_date || '—'}</p>
          </>
        ) : (
          <p className="text-secondary">Chưa có thông tin bằng tốt nghiệp.</p>
        )}
      </div>
    </div>
  )
}
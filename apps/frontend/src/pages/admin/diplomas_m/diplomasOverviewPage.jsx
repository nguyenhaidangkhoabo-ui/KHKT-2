import { useEffect, useState } from 'react'
import { adminDiplomaService } from '../../../services/adminDiploma.service'
import Spinner from '../../../components/ui/spinner'
import Table from '../../../components/ui/table'
import Badge from '../../../components/ui/badge'
import Alert from '../../../components/feedback/alert'

export default function DiplomasOverviewPage() {
  const [diplomas, setDiplomas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminDiplomaService.getDiplomas()
      .then((data) => setDiplomas(data.diplomas || data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'student_name', title: 'Học sinh' },
    { key: 'diploma_number', title: 'Số hiệu bằng' },
    { key: 'status', title: 'Trạng thái', render: (r) => <Badge status={r.status} /> },
  ]

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <h1 className="page-title">Quản lý bằng tốt nghiệp</h1>
      <Table columns={columns} data={diplomas} emptyText="Không có bằng nào." />
    </div>
  )
}
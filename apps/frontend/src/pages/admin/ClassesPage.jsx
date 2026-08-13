import { useEffect, useState } from 'react'
import { adminCoreService } from '../../services/adminCore.service'
import Spinner from '../../components/ui/spinner'
import Table from '../../components/ui/table'
import Alert from '../../components/feedback/alert'

export default function ClassesPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminCoreService.getClasses()
      .then((data) => setClasses(data.classes || data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'name', title: 'Lớp' },
    { key: 'grade', title: 'Khối' },
    { key: 'homeroom_teacher', title: 'GVCN', render: (r) => r.homeroom_teacher?.full_name || '—' },
    { key: 'student_count', title: 'Sĩ số', render: (r) => r.student_count ?? '—' },
  ]

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <h1 className="page-title">Quản lý lớp học</h1>
      <Table columns={columns} data={classes} emptyText="Chưa có lớp nào." />
    </div>
  )
}
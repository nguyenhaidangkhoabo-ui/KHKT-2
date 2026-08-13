import { useEffect, useState } from 'react'
import { teacherService } from '../../../services/teacher.service'
import Spinner from '../../../components/ui/spinner'
import Table from '../../../components/ui/table'
import Alert from '../../../components/feedback/alert'

export default function ClassStudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    teacherService.getMyClassStudents(1)
      .then((data) => setStudents(data.students || data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'student_code', title: 'Mã HS' },
    { key: 'full_name', title: 'Họ tên' },
    { key: 'gender', title: 'Giới tính' },
    { key: 'dob', title: 'Ngày sinh' },
  ]

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <h1 className="page-title">Danh sách học sinh lớp chủ nhiệm</h1>
      <Table columns={columns} data={students} emptyText="Không có học sinh." />
    </div>
  )
}
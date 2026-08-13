import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminCoreService } from '../../../services/adminCore.service'
import { useDebounce } from '../../../hooks/useDebounce'
import Spinner from '../../../components/ui/spinner'
import Table from '../../../components/ui/table'
import Input from '../../../components/ui/input'
import Button from '../../../components/ui/button'
import Alert from '../../../components/feedback/alert'

export default function StudentsListPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    adminCoreService.getStudents({ keyword: debouncedKeyword })
      .then((data) => setStudents(data.students || data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [debouncedKeyword])

  const columns = [
    { key: 'student_code', title: 'Mã HS' },
    { key: 'full_name', title: 'Họ tên' },
    { key: 'class_name', title: 'Lớp', render: (r) => r.class_name || '—' },
    { key: 'graduated', title: 'Tốt nghiệp', render: (r) => (r.graduated ? '✅' : '—') },
  ]

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <div className="flex-between mb-4">
        <h1 className="page-title">Danh sách học sinh</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button onClick={() => navigate('/admin/students/import')}>Import Excel</Button>
        </div>
      </div>
      <Table columns={columns} data={students} emptyText="Không có học sinh." />
    </div>
  )
}
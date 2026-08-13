import { useEffect, useState } from 'react'
import { adminDiplomaService } from '../../../services/adminDiploma.service'
import Spinner from '../../../components/ui/spinner'
import Table from '../../../components/ui/table'
import Badge from '../../../components/ui/badge'
import Button from '../../../components/ui/button'
import Alert from '../../../components/feedback/alert'
import { useNotification } from '../../../hooks/useNotification'

export default function ReceiveDiplomasPage() {
  const [diplomas, setDiplomas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { toast } = useNotification()

  const loadData = () => {
    setLoading(true)
    adminDiplomaService.getDiplomas({ status: 'NOT_STORED' })
      .then((data) => setDiplomas(data.diplomas || data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [])

  const handleReceive = async (id) => {
    try {
      await adminDiplomaService.receiveDiploma(id)
      toast.success('Đã cập nhật bằng về trường')
      loadData()
    } catch (e) {
      setError(e.message)
    }
  }

  const columns = [
    { key: 'student_name', title: 'Học sinh' },
    { key: 'diploma_number', title: 'Số hiệu bằng' },
    { key: 'status', title: 'Trạng thái', render: (r) => <Badge status={r.status} /> },
    {
      key: 'action', title: 'Thao tác',
      render: (r) => (
        <Button size="sm" onClick={() => handleReceive(r.id)}>Đã về trường</Button>
      ),
    },
  ]

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <h1 className="page-title">Tiếp nhận bằng về trường</h1>
      <Table columns={columns} data={diplomas} emptyText="Không có bằng chờ tiếp nhận." />
    </div>
  )
}
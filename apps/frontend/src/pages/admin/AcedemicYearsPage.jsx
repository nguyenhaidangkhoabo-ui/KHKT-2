import { useEffect, useState } from 'react'
import { adminCoreService } from '../../services/adminCore.service'
import Spinner from '../../components/ui/spinner'
import Table from '../../components/ui/table'
import Button from '../../components/ui/button'
import Modal from '../../components/ui/modal'
import Input from '../../components/ui/input'
import Alert from '../../components/feedback/alert'
import { useNotification } from '../../hooks/useNotification'

export default function AcedemicYearsPage() {
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [newName, setNewName] = useState('')
  const { toast } = useNotification()

  const loadYears = () => {
    setLoading(true)
    adminCoreService.getYears()
      .then((data) => setYears(data.years || data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadYears, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await adminCoreService.createYear({ name: newName.trim() })
      toast.success('Tạo năm học thành công')
      setNewName('')
      setOpenModal(false)
      loadYears()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleMakeCurrent = async (id) => {
    try {
      await adminCoreService.makeCurrentYear(id)
      toast.success('Đã chọn năm học hiện tại')
      loadYears()
    } catch (e) {
      setError(e.message)
    }
  }

  const columns = [
    { key: 'name', title: 'Năm học' },
    {
      key: 'is_current', title: 'Hiện tại',
      render: (r) => (r.is_current ? '✅' : '—'),
    },
    {
      key: 'action', title: 'Thao tác',
      render: (r) =>
        !r.is_current && (
          <Button variant="outline" size="sm" onClick={() => handleMakeCurrent(r.id)}>
            Chọn làm năm hiện tại
          </Button>
        ),
    },
  ]

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <div className="flex-between mb-4">
        <h1 className="page-title">Quản lý năm học</h1>
        <Button onClick={() => setOpenModal(true)}>+ Thêm năm học</Button>
      </div>
      <Table columns={columns} data={years} emptyText="Chưa có năm học nào." />

      <Modal
        open={openModal}
        title="Thêm năm học"
        onClose={() => setOpenModal(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpenModal(false)}>Hủy</Button>
            <Button onClick={handleCreate}>Lưu</Button>
          </>
        }
      >
        <Input
          label="Tên năm học"
          placeholder="VD: 2025-2026"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </Modal>
    </div>
  )
}
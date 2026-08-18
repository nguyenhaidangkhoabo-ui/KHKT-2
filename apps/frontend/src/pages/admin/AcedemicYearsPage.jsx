import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { adminCoreService } from '../../services/adminCore.service'
import Card from '../../components/ui/card'
import Badge from '../../components/ui/badge'
import Button from '../../components/ui/button'
import Input from '../../components/ui/input'
import Modal from '../../components/ui/modal'
import Table from '../../components/ui/table'
import ConfirmDialog from '../../components/feedback/confirmDialog'
import Alert from '../../components/feedback/alert'
import { useNotification } from '../../hooks/useNotification'
import { formatAcademicYear } from '../../utils/formatDate'

export default function AcedemicYearsPage() {
  const [openCreate, setOpenCreate] = useState(false)
  const [startYear, setStartYear] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useNotification()

  const { data: years, loading, error, refetch } = useFetch(() => adminCoreService.getYears(), [])

  const handleCreate = async () => {
    const start = Number(startYear)
    if (!start) return toast.error('Vui lòng nhập năm bắt đầu')
    setSaving(true)
    try {
      await adminCoreService.createYear({ start_year: start, end_year: start + 1 })
      toast.success('Tạo năm học thành công')
      setOpenCreate(false)
      setStartYear('')
      refetch()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  const handleSetCurrent = async (id) => {
    try {
      await adminCoreService.setCurrentYear(id)
      toast.success('Đã chọn năm học hiện tại')
      refetch()
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await adminCoreService.deleteYear(confirmDelete)
      toast.success('Xóa năm học thành công')
      setConfirmDelete(null)
      refetch()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  const columns = [
    { key: 'range', label: 'Năm học', render: (r) => <strong>{r.start_year} - {r.end_year}</strong> },
    { key: 'is_current', label: 'Trạng thái', render: (r) => r.is_current ? <Badge variant="success">Năm hiện tại</Badge> : <Badge variant="secondary">Chưa kích hoạt</Badge> },
    { key: 'actions', label: 'Thao tác', align: 'right', render: (r) => (
      <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
        {!r.is_current && <Button size="sm" onClick={() => handleSetCurrent(r._id)}>Đặt là năm hiện tại</Button>}
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete(r._id)}>Xóa</Button>
      </div>
    ) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Quản lý năm học</h2>
          <p className="page-subtitle">Mỗi năm học: end_year = start_year + 1; chỉ 1 năm được kích hoạt</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => setOpenCreate(true)}>+ Thêm năm học</Button>
        </div>
      </div>

      {error && <Alert type="error">{error.message}</Alert>}
      <Card>
        <Table columns={columns} data={years || []} loading={loading} emptyText="Chưa có năm học nào" />
      </Card>

      <Modal open={openCreate} title="Thêm năm học" onClose={() => setOpenCreate(false)}
        footer={<><Button variant="ghost" onClick={() => setOpenCreate(false)}>Hủy</Button><Button onClick={handleCreate} loading={saving}>Tạo</Button></>}>
        <Input label="Năm bắt đầu" type="number" placeholder="VD: 2026"
          value={startYear} onChange={(e) => setStartYear(e.target.value)} hint={`Năm học sẽ là ${startYear} - ${Number(startYear) + 1 || ''}`} />
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Xóa năm học" variant="danger"
        message="Năm học đang có lớp tham chiếu sẽ không xóa được. Tiếp tục?"
        confirmText="Xóa" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} loading={saving} />
    </div>
  )
}
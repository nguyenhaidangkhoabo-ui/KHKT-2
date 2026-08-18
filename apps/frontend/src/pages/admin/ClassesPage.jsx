import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { adminCoreService } from '../../services/adminCore.service'
import Card from '../../components/ui/card'
import Button from '../../components/ui/button'
import Input from '../../components/ui/input'
import Select from '../../components/ui/select'
import Modal from '../../components/ui/modal'
import Table from '../../components/ui/table'
import ConfirmDialog from '../../components/feedback/confirmDialog'
import Alert from '../../components/feedback/alert'
import { useNotification } from '../../hooks/useNotification'
import { GRADE_OPTIONS, GRADE_LABELS } from '../../config/constants'

const emptyForm = { name: '', grade: 'GRADE_10' }

export default function ClassesPage() {
  const [gradeFilter, setGradeFilter] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useNotification()

  const { data: classes, loading, error, refetch } = useFetch(
    () => adminCoreService.getClasses(gradeFilter ? { grade: gradeFilter } : {}),
    [gradeFilter]
  )

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpenModal(true) }
  const openEdit = (c) => { setEditingId(c._id); setForm({ name: c.name, grade: c.grade }); setOpenModal(true) }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Tên lớp không được để trống')
    setSaving(true)
    try {
      if (editingId) {
        await adminCoreService.updateClass(editingId, form)
        toast.success('Cập nhật lớp thành công')
      } else {
        await adminCoreService.createClass(form)
        toast.success('Thêm lớp thành công')
      }
      setOpenModal(false)
      refetch()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await adminCoreService.deleteClass(confirmDelete)
      toast.success('Xóa lớp thành công')
      setConfirmDelete(null)
      refetch()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  const columns = [
    { key: 'name', label: 'Tên lớp', render: (r) => <strong>{r.name}</strong> },
    { key: 'grade', label: 'Khối', render: (r) => GRADE_LABELS[r.grade] || r.grade },
    { key: 'actions', label: 'Thao tác', align: 'right', render: (r) => (
      <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
        <Button size="sm" variant="soft" onClick={() => openEdit(r)}>Sửa</Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete(r._id)}>Xóa</Button>
      </div>
    ) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Danh mục lớp</h2>
          <p className="page-subtitle">Các lớp tĩnh (10A1, 11A2, 12A1...) độc lập với năm học</p>
        </div>
        <div className="page-actions">
          <Button onClick={openCreate}>+ Thêm lớp</Button>
        </div>
      </div>

      <div className="filter-bar">
        <Select label="Lọc theo khối" placeholder="Tất cả khối" value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)} options={GRADE_OPTIONS} />
      </div>

      {error && <Alert type="error">{error.message}</Alert>}
      <Card>
        <Table columns={columns} data={classes || []} loading={loading} emptyText="Chưa có lớp nào" />
      </Card>

      <Modal open={openModal} title={editingId ? 'Sửa lớp' : 'Thêm lớp'} onClose={() => setOpenModal(false)}
        footer={<><Button variant="ghost" onClick={() => setOpenModal(false)}>Hủy</Button><Button onClick={handleSave} loading={saving}>Lưu</Button></>}>
        <Input label="Tên lớp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: 10A1" />
        <Select label="Khối" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} options={GRADE_OPTIONS} />
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Xóa lớp" variant="danger"
        message="Lớp đã được khởi tạo trong năm học sẽ không xóa được. Tiếp tục?"
        confirmText="Xóa" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} loading={saving} />
    </div>
  )
}
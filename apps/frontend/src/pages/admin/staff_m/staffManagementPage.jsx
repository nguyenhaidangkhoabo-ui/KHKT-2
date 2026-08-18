import { useMemo, useState } from 'react'
import { useFetch } from '../../../hooks/useFetch'
import { useDebounce } from '../../../hooks/useDebounce'
import { adminCoreService } from '../../../services/adminCore.service'
import Card from '../../../components/ui/card'
import Badge from '../../../components/ui/badge'
import Button from '../../../components/ui/button'
import Input from '../../../components/ui/input'
import Select from '../../../components/ui/select'
import Modal from '../../../components/ui/modal'
import Table from '../../../components/ui/table'
import Alert from '../../../components/feedback/alert'
import Icon from '../../../components/ui/icon'
import { useNotification } from '../../../hooks/useNotification'
import { ROLE_LABELS } from '../../../config/constants'

const emptyForm = { username: '', password: '', staff_code: '', full_name: '', email: '', phone: '', role: 'TEACHER' }

export default function StaffManagementPage() {
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)
  const [openModal, setOpenModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { toast } = useNotification()

  const { data: staff, loading, error, refetch } = useFetch(
    () => adminCoreService.getStaff({ keyword: debouncedKeyword, role: roleFilter || undefined }),
    [debouncedKeyword, roleFilter]
  )

  const filtered = useMemo(() => {
    let list = staff || []
    if (roleFilter) list = list.filter((s) => s.role === roleFilter)
    return list
  }, [staff, roleFilter])

  const handleCreate = async () => {
    if (!form.username || !form.password || !form.staff_code || !form.full_name || !form.email) {
      return toast.error('Vui lòng điền đầy đủ các trường bắt buộc')
    }
    setSaving(true)
    try {
      await adminCoreService.createStaff(form)
      toast.success('Tạo tài khoản thành công')
      setOpenModal(false)
      setForm(emptyForm)
      refetch()
    } catch (e) { toast.error(e.message) } finally { setSaving(false) }
  }

  const handleToggleStatus = async (id, current) => {
    try {
      await adminCoreService.updateStaffStatus(id, current === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')
      toast.success('Cập nhật trạng thái thành công')
      refetch()
    } catch (e) { toast.error(e.message) }
  }

  const handleChangeRole = async (id, role) => {
    try {
      await adminCoreService.updateStaffRole(id, role)
      toast.success('Cập nhật vai trò thành công')
      refetch()
    } catch (e) { toast.error(e.message) }
  }

  const columns = [
    { key: 'staff_code', label: 'Mã CB', render: (r) => <strong>{r.staff_code}</strong> },
    { key: 'full_name', label: 'Họ tên' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Vai trò', render: (r) => (
      <select className="form-input form-select" style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
        value={r.role} onChange={(e) => handleChangeRole(r._id, e.target.value)}>
        {Object.entries(ROLE_LABELS).filter(([v]) => v !== 'STUDENT').map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    ) },
    { key: 'status', label: 'Trạng thái', render: (r) => r.status === 'ACTIVE'
      ? <Badge variant="success">Hoạt động</Badge>
      : <Badge variant="danger">Đã khóa</Badge> },
    { key: 'actions', label: 'Thao tác', align: 'right', render: (r) => (
      <Button size="sm" variant={r.status === 'ACTIVE' ? 'danger' : 'success'}
        onClick={() => handleToggleStatus(r._id, r.status)}>
        {r.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
      </Button>
    ) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Quản lý cán bộ & giáo viên</h2>
          <p className="page-subtitle">Tạo tài khoản, phân vai trò, khóa/mở khóa</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => setOpenModal(true)}>+ Thêm tài khoản</Button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="form-group" style={{ minWidth: 240 }}>
          <label className="form-label">Tìm kiếm</label>
          <div className="input-wrap has-icon">
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input className="form-input" placeholder="Tên, mã CB hoặc email..."
              value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
        </div>
        <Select label="Vai trò" placeholder="Tất cả" value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={Object.entries(ROLE_LABELS).filter(([v]) => v !== 'STUDENT').map(([value, label]) => ({ value, label }))} />
      </div>

      {error && <Alert type="error">{error.message}</Alert>}
      <Card>
        <Table columns={columns} data={filtered} loading={loading} emptyText="Không có tài khoản nào" />
      </Card>

      <Modal open={openModal} title="Thêm tài khoản cán bộ / giáo viên" onClose={() => setOpenModal(false)}
        footer={<><Button variant="ghost" onClick={() => setOpenModal(false)}>Hủy</Button><Button onClick={handleCreate} loading={saving}>Tạo tài khoản</Button></>}>
        <Input label="Username *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <Input label="Mật khẩu *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Input label="Mã cán bộ *" value={form.staff_code} onChange={(e) => setForm({ ...form, staff_code: e.target.value })} />
        <Input label="Họ tên *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Select label="Vai trò" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
          options={Object.entries(ROLE_LABELS).filter(([v]) => v !== 'STUDENT').map(([value, label]) => ({ value, label }))} />
      </Modal>
    </div>
  )
}
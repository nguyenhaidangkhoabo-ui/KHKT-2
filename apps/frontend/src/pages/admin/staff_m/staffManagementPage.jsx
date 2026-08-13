import { useEffect, useState } from 'react'
import { adminCoreService } from '../../../services/adminCore.service'
import { ROLE_LABELS } from '../../../config/constants'
import Spinner from '../../../components/ui/spinner'
import Table from '../../../components/ui/table'
import Select from '../../../components/ui/select'
import Alert from '../../../components/feedback/alert'
import { useNotification } from '../../../hooks/useNotification'

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { toast } = useNotification()

  const loadStaff = () => {
    setLoading(true)
    adminCoreService.getStaff()
      .then((data) => setStaff(data.staff || data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadStaff, [])

  const handleRoleChange = async (id, role) => {
    try {
      await adminCoreService.updateStaffRole(id, role)
      toast.success('Cập nhật vai trò thành công')
      loadStaff()
    } catch (e) {
      setError(e.message)
    }
  }

  const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))

  const columns = [
    { key: 'full_name', title: 'Họ tên' },
    { key: 'username', title: 'Tên đăng nhập' },
    {
      key: 'role', title: 'Vai trò',
      render: (r) => (
        <Select
          value={r.role}
          options={roleOptions}
          onChange={(e) => handleRoleChange(r.id, e.target.value)}
        />
      ),
    },
  ]

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  return (
    <div className="container">
      <h1 className="page-title">Quản lý cán bộ / giáo viên</h1>
      <Table columns={columns} data={staff} emptyText="Không có tài khoản nào." />
    </div>
  )
}
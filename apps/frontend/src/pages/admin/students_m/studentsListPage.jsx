import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFetch } from '../../../hooks/useFetch'
import { useDebounce } from '../../../hooks/useDebounce'
import { adminCoreService } from '../../../services/adminCore.service'
import Card from '../../../components/ui/card'
import Badge from '../../../components/ui/badge'
import Button from '../../../components/ui/button'
import Select from '../../../components/ui/select'
import Table from '../../../components/ui/table'
import Alert from '../../../components/feedback/alert'
import ConfirmDialog from '../../../components/feedback/confirmDialog'
import Icon from '../../../components/ui/icon'
import { useNotification } from '../../../hooks/useNotification'
import { ACADEMIC_STATUS, ACADEMIC_STATUS_LABELS, ACADEMIC_STATUS_COLORS, GENDER_LABELS } from '../../../config/constants'
import { downloadExcel } from '../../../utils/excelExporter'
import { APP_CONFIG } from '../../../config/app.config'

export default function StudentsListPage() {
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)
  const [graduateIds, setGraduateIds] = useState([])
  const [confirmGraduate, setConfirmGraduate] = useState(null)
  const navigate = useNavigate()
  const { toast } = useNotification()

  const { data: students, loading, error, refetch } = useFetch(
    () => adminCoreService.getStudents({ keyword: debouncedKeyword, academic_status: statusFilter || undefined }),
    [debouncedKeyword, statusFilter]
  )

  const filtered = useMemo(() => {
    let list = students || []
    if (statusFilter) list = list.filter((s) => s.academic_status === statusFilter)
    return list
  }, [students, statusFilter])

  const toggleSelect = (id) => {
    setGraduateIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const handleGraduate = async () => {
    try {
      const ids = confirmGraduate ? [confirmGraduate] : graduateIds
      await adminCoreService.bulkGraduate(ids)
      toast.success(`Đã tốt nghiệp ${ids.length} học sinh`)
      setConfirmGraduate(null)
      setGraduateIds([])
      refetch()
    } catch (e) { toast.error(e.message) }
  }

  const handleExport = async () => {
    try {
      await downloadExcel('/core/students/export', 'danh-sach-hoc-sinh.xlsx')
      toast.success('Đã tải file Excel')
    } catch (e) { toast.error(e.message) }
  }

  const columns = [
    { key: 'student_code', label: 'Mã HS', render: (r) => <strong>{r.student_code}</strong> },
    { key: 'full_name', label: 'Họ tên' },
    { key: 'gender', label: 'Giới tính', render: (r) => GENDER_LABELS[r.gender] || '—' },
    { key: 'academic_status', label: 'Trạng thái', render: (r) => (
      <Badge variant={ACADEMIC_STATUS_COLORS[r.academic_status] || 'secondary'}>{ACADEMIC_STATUS_LABELS[r.academic_status] || r.academic_status}</Badge>
    ) },
    { key: 'select', label: '', align: 'right', render: (r) => (
      <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
        {r.academic_status === ACADEMIC_STATUS.ACTIVE && (
          <Button size="sm" variant="success" onClick={() => setConfirmGraduate(r._id)}>Tốt nghiệp</Button>
        )}
        <Button size="sm" variant="soft" onClick={() => navigate(`/admin/students/${r._id}`)}>Chi tiết</Button>
        <input type="checkbox" checked={graduateIds.includes(r._id)} onChange={() => toggleSelect(r._id)} />
      </div>
    ) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Quản lý học sinh</h2>
          <p className="page-subtitle">Tìm kiếm, lọc, tốt nghiệp & xuất danh sách</p>
        </div>
        <div className="page-actions">
          {graduateIds.length > 0 && (
            <Button variant="success" onClick={() => setConfirmGraduate('bulk')}>
              Tốt nghiệp ({graduateIds.length})
            </Button>
          )}
          <Button variant="outline" onClick={handleExport}><Icon name="download" size={16} /> Xuất Excel</Button>
          <Button variant="soft" onClick={() => navigate('/admin/students/import')}><Icon name="upload" size={16} /> Import Excel</Button>
          <Button onClick={() => navigate('/admin/students/create')}>+ Thêm học sinh</Button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="form-group" style={{ minWidth: 260 }}>
          <label className="form-label">Tìm kiếm</label>
          <div className="input-wrap has-icon">
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input className="form-input" placeholder="Tên, mã HS hoặc email..."
              value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
        </div>
        <Select label="Trạng thái học tập" placeholder="Tất cả" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={Object.entries(ACADEMIC_STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
        <span className="text-muted" style={{ paddingBottom: 10 }}>
          {filtered.length} / {students?.length || 0} học sinh (backend trả toàn bộ, không phân trang)
        </span>
      </div>

      {error && <Alert type="error">{error.message}</Alert>}
      <Card>
        <Table columns={columns} data={filtered} loading={loading} emptyText="Không tìm thấy học sinh" />
      </Card>

      <ConfirmDialog open={!!confirmGraduate} title="Xác nhận tốt nghiệp" variant="success"
        message={confirmGraduate === 'bulk'
          ? `Tốt nghiệp ${graduateIds.length} học sinh được chọn? (Chỉ áp dụng khối 12)`
          : 'Chuyển học sinh này sang trạng thái Đã tốt nghiệp?'}
        confirmText="Xác nhận" onConfirm={handleGraduate} onCancel={() => setConfirmGraduate(null)} />
    </div>
  )
}
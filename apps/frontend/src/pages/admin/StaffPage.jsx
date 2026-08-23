import { useEffect, useState, useCallback, useRef } from 'react'
import {
  UserCircle,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Upload,
  Power,
} from 'lucide-react'
import { staffService } from '../../services'
import { ROLE_LABELS, USER_STATUS, USER_STATUS_LABELS } from '../../config/constants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

// Các vai trò có thể gán cho cán bộ (đồng bộ validate phía backend)
const ASSIGNABLE_ROLES = ['TEACHER', 'BGH', 'ADMIN', 'SYSTEM_ADMIN']

const EMPTY_FORM = {
  username: '',
  password: '',
  staff_code: '',
  full_name: '',
  email: '',
  phone: '',
  role: 'TEACHER',
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Bộ lọc: input tạm + giá trị đã chốt
  const [keywordInput, setKeywordInput] = useState('')
  const [filters, setFilters] = useState({ keyword: '', status: '', role: '' })

  // Modal thêm / sửa
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef(null)
  const [importing, setImporting] = useState(false)

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = {}
      if (filters.keyword.trim()) params.keyword = filters.keyword.trim()
      if (filters.status) params.status = filters.status
      if (filters.role) params.role = filters.role

      const res = await staffService.list(params)
      setStaffList(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách cán bộ.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  const commitKeyword = (e) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, keyword: keywordInput }))
  }

  const resetFilters = () => {
    setKeywordInput('')
    setFilters({ keyword: '', status: '', role: '' })
  }

  // ===== Thêm / sửa cán bộ =====
  const openCreate = () => {
    setEditingStaff(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (staff) => {
    setEditingStaff(staff)
    setForm({
      username: staff.username || '',
      password: '',
      staff_code: staff.staff_code || '',
      full_name: staff.full_name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      role: staff.role || 'TEACHER',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.username.trim() || !form.staff_code.trim() || !form.full_name.trim()) {
      setFormError('Vui lòng nhập đầy đủ tên đăng nhập, mã cán bộ và họ tên.')
      return
    }
    if (!editingStaff && !form.password) {
      setFormError('Vui lòng nhập mật khẩu khởi tạo.')
      return
    }
    if (!form.email.trim() || !form.phone.trim()) {
      setFormError('Vui lòng nhập email và số điện thoại.')
      return
    }

    try {
      setSubmitting(true)
      if (editingStaff) {
        const payload = {
          staff_code: form.staff_code.trim(),
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
        }
        if (form.password) payload.password = form.password
        await staffService.update(editingStaff._id, payload)
        toast.success('Cập nhật thông tin cán bộ thành công!')
      } else {
        await staffService.create({
          username: form.username.trim(),
          password: form.password,
          staff_code: form.staff_code.trim(),
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
        })
        toast.success('Thêm cán bộ mới thành công!')
      }
      setModalOpen(false)
      await loadStaff()
    } catch (err) {
      setFormError(err.message || 'Không thể lưu thông tin cán bộ.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===== Kích hoạt / khóa tài khoản =====
  const handleToggleStatus = async (staff) => {
    const nextStatus = staff.status === USER_STATUS.ACTIVE ? USER_STATUS.DISABLED : USER_STATUS.ACTIVE
    try {
      await staffService.updateStatus(staff._id, nextStatus)
      toast.success(
        nextStatus === USER_STATUS.ACTIVE
          ? `Đã kích hoạt tài khoản ${staff.full_name}.`
          : `Đã khóa tài khoản ${staff.full_name}.`
      )
      await loadStaff()
    } catch (err) {
      toast.error(err.message || 'Thay đổi trạng thái tài khoản thất bại.')
    }
  }

  // ===== Đổi vai trò nhanh =====
  const handleRoleChange = async (staff, role) => {
    if (!role || role === staff.role) return
    try {
      await staffService.updateRole(staff._id, role)
      toast.success(`Đã đổi vai trò của ${staff.full_name} thành "${ROLE_LABELS[role]}".`)
      await loadStaff()
    } catch (err) {
      toast.error(err.message || 'Đổi vai trò thất bại.')
    }
  }

  // ===== Xóa =====
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await staffService.remove(deleteTarget._id)
      toast.success('Xóa cán bộ thành công!')
      setDeleteTarget(null)
      await loadStaff()
    } catch (err) {
      toast.error(err.message || 'Xóa cán bộ thất bại.')
    } finally {
      setDeleting(false)
    }
  }

  // ===== Import Excel =====
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      setImporting(true)
      const formData = new FormData()
      formData.append('file', file)
      const res = await staffService.importExcel(formData)
      const result = res?.data || {}
      toast.success(
        `Import hoàn tất: thành công ${result.success ?? 0}, lỗi ${result.failed ?? 0}.`
      )
      await loadStaff()
    } catch (err) {
      toast.error(err.message || 'Import file Excel thất bại.')
    } finally {
      setImporting(false)
    }
  }

  const columns = [
    {
      key: 'staff_code',
      header: 'Mã CB',
      render: (row) => <span className="font-mono font-bold text-slate-900">{row.staff_code}</span>,
    },
    {
      key: 'full_name',
      header: 'Họ và tên',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-800">{row.full_name}</span>
          <p className="text-[11px] text-slate-400">@{row.username}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Liên hệ',
      render: (row) => (
        <div className="space-y-0.5">
          <p className="text-xs text-slate-700">{row.email}</p>
          <p className="text-[11px] text-slate-400">{row.phone || '—'}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row, e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          title="Đổi vai trò"
        >
          {ASSIGNABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <Badge color={row.status === USER_STATUS.ACTIVE ? 'success' : 'danger'}>
          {USER_STATUS_LABELS[row.status] || row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleToggleStatus(row)}
            title={row.status === USER_STATUS.ACTIVE ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              row.status === USER_STATUS.ACTIVE
                ? 'text-emerald-700 hover:bg-emerald-50'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openEdit(row)}
            title="Chỉnh sửa"
            className="p-1.5 rounded-lg text-primary hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            title="Xóa cán bộ"
            className="p-1.5 rounded-lg text-accent hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-primary" />
            <span>Quản lý cán bộ / giáo viên</span>
          </h1>
          <p className="text-xs text-slate-500">
            Danh sách tài khoản cán bộ, giáo viên; phân quyền và khóa / kích hoạt tài khoản.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImportFile} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} loading={importing}>
            <Upload className="w-4 h-4" />
            <span>Nhập Excel</span>
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            <span>Thêm cán bộ</span>
          </Button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <form onSubmit={commitKeyword} className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tìm kiếm</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Mã CB, họ tên hoặc email... (Enter để tìm)"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">Tất cả</option>
              {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vai trò</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">Tất cả</option>
              {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pb-0.5">
            <Button variant="primary" size="sm" type="submit">
              <Search className="w-4 h-4" />
              <span>Tìm kiếm</span>
            </Button>
            <Button variant="secondary" size="sm" type="button" onClick={resetFilters}>
              <RefreshCw className="w-4 h-4" />
              <span>Đặt lại</span>
            </Button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bảng cán bộ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
        {!loading && staffList.length === 0 ? (
          <EmptyState
            icon={UserCircle}
            title="Không tìm thấy cán bộ nào"
            description="Thử thay đổi bộ lọc hoặc thêm cán bộ mới vào hệ thống."
          />
        ) : (
          <DataTable
            columns={columns}
            data={staffList}
            loading={loading}
            rowKey="_id"
            emptyMessage="Không có dữ liệu"
          />
        )}
      </div>

      {/* Modal thêm / sửa cán bộ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStaff ? `Cập nhật cán bộ: ${editingStaff.full_name}` : 'Thêm cán bộ mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên đăng nhập <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="VD: gvnguyen"
                disabled={Boolean(editingStaff)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400"
                required
              />
            </div>

            {!editingStaff && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu khởi tạo <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Mật khẩu ban đầu"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã cán bộ <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={form.staff_code}
                onChange={(e) => setForm((f) => ({ ...f, staff_code: e.target.value }))}
                placeholder="VD: GV001"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Họ và tên <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Nguyễn Thị B"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email <span className="text-accent">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@thpthvn.edu.vn"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Số điện thoại <span className="text-accent">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="09xx xxx xxx"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vai trò</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)} disabled={submitting}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              {editingStaff ? 'Lưu thay đổi' : 'Thêm cán bộ'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Xác nhận xóa */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        danger
        loading={deleting}
        title="Xóa cán bộ"
        message={`Bạn chắc chắn muốn xóa tài khoản "${deleteTarget?.full_name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa cán bộ"
      />
    </div>
  )
}

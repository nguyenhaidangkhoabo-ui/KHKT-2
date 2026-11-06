import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Plus,
  Pencil,
  Eye,
  GraduationCap,
  RefreshCw,
  Search,
  Upload,
  Download,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownZA,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { studentService, classService } from '../../services'
import {
  USER_STATUS,
  USER_STATUS_LABELS,
  ACADEMIC_STATUS,
  ACADEMIC_STATUS_LABELS,
  ACADEMIC_STATUS_COLORS,
  GENDERS,
  GENDER_LABELS,
} from '../../config/constants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

const PAGE_SIZE = 200

// Chuyển trạng thái học vụ hợp lệ (đồng bộ state machine phía backend).
// GRADUATED chỉ thực hiện qua thao tác "Tốt nghiệp" riêng.
const ALLOWED_TRANSITIONS = {
  [ACADEMIC_STATUS.ACTIVE]: [ACADEMIC_STATUS.SUSPENDED, ACADEMIC_STATUS.DROPOUT, ACADEMIC_STATUS.TRANSFERRED],
  [ACADEMIC_STATUS.SUSPENDED]: [ACADEMIC_STATUS.ACTIVE, ACADEMIC_STATUS.DROPOUT, ACADEMIC_STATUS.TRANSFERRED],
  [ACADEMIC_STATUS.DROPOUT]: [],
  [ACADEMIC_STATUS.TRANSFERRED]: [],
  [ACADEMIC_STATUS.GRADUATED]: [],
}

const EMPTY_FORM = {
  username: '',
  password: '',
  student_code: '',
  full_name: '',
  birthdate: '',
  gender: '',
  email: '',
  phone: '',
  father_phone: '',
  mother_phone: '',
  enrollment_year: '',
}

// Tải file blob về máy người dùng
function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default function StudentListPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Bộ lọc: input tạm + giá trị đã chốt (commit bằng Enter / nút Tìm kiếm)
  const [keywordInput, setKeywordInput] = useState('')
  const [filters, setFilters] = useState({ keyword: '', status: '', academic_status: '', gender: '', class_id: '' })

  // Danh mục lớp dùng cho bộ lọc theo lớp
  const [classOptions, setClassOptions] = useState([])

  const [page, setPage] = useState(1)

  // Sắp xếp phía client (field: 'full_name' | 'class_name' | 'enrollment_year' | null)
  const [sort, setSort] = useState({ field: null, dir: 'asc' })

  // Chọn dòng (hàng loạt)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  // Modal thêm / sửa
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Đổi trạng thái học vụ
  const [statusTarget, setStatusTarget] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusError, setStatusError] = useState('')
  const [changingStatus, setChangingStatus] = useState(false)

  // Tốt nghiệp (đơn / hàng loạt)
  const [graduateTargets, setGraduateTargets] = useState([]) // mảng id
  const [graduating, setGraduating] = useState(false)

  // Import / Export Excel
  const fileInputRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = {}
      if (filters.keyword.trim()) params.keyword = filters.keyword.trim()
      if (filters.status) params.status = filters.status
      if (filters.academic_status) params.academic_status = filters.academic_status
      if (filters.gender) params.gender = filters.gender
      if (filters.class_id) params.class_id = filters.class_id

      const res = await studentService.list(params)
      const list = Array.isArray(res?.data) ? res.data : []
      setStudents(list)
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách học sinh.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  // Tải danh mục lớp cho bộ lọc (không chặn tải danh sách học sinh nếu lỗi)
  useEffect(() => {
    let isActive = true
    classService
      .list()
      .then((res) => {
        if (isActive) setClassOptions(Array.isArray(res?.data) ? res.data : [])
      })
      .catch(() => {
        if (isActive) setClassOptions([])
      })
    return () => {
      isActive = false
    }
  }, [])

  // Phân trang phía client (backend trả toàn bộ danh sách đã lọc)
  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE))
  // Sắp xếp phía client trước khi phân trang
  const sortedStudents = useMemo(() => {
    if (!sort.field) return students
    const arr = [...students]
    arr.sort((a, b) => {
      // Sắp xếp theo lớp: "Chưa có lớp" luôn nằm cuối.
      if (sort.field === 'class_name') {
        const sa = a.class_name || ''
        const sb = b.class_name || ''
        if (!sa && !sb) return 0
        if (!sa) return 1
        if (!sb) return -1
        return sort.dir === 'asc' ? sa.localeCompare(sb, 'vi') : sb.localeCompare(sa, 'vi')
      }
      const va = a[sort.field]
      const vb = b[sort.field]
      // Sắp xếp số (năm nhập học) và chuỗi (họ tên, hỗ trợ tiếng Việt)
      const aNum = typeof va === 'number' ? va : Number(va)
      const bNum = typeof vb === 'number' ? vb : Number(vb)
      if (va != null && vb != null && !Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return sort.dir === 'asc' ? aNum - bNum : bNum - aNum
      }
      const sa = va == null ? '' : String(va)
      const sb = vb == null ? '' : String(vb)
      return sort.dir === 'asc' ? sa.localeCompare(sb, 'vi') : sb.localeCompare(sa, 'vi')
    })
    return arr
  }, [students, sort])
  const pagedStudents = useMemo(
    () => sortedStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedStudents, page]
  )

  useEffect(() => {
    setPage(1)
    setSelectedIds(new Set())
  }, [filters])

  // Bật sắp xếp hoặc đổi chiều (A-Z <-> Z-A) khi bấm nút
  const toggleSort = (field) => {
    setPage(1)
    setSort((prev) => {
      if (prev.field === field) {
        return { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      }
      return { field, dir: 'asc' }
    })
  }

  const commitKeyword = (e) => {
    e.preventDefault()
    setPage(1)
    setFilters((f) => ({ ...f, keyword: keywordInput }))
  }

  const resetFilters = () => {
    setKeywordInput('')
    setFilters({ keyword: '', status: '', academic_status: '', gender: '', class_id: '' })
    setPage(1)
  }

  // ===== Chọn dòng =====
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(pagedStudents.map((s) => String(s._id))))
    } else {
      setSelectedIds(new Set())
    }
  }

  // ===== Thêm / sửa học sinh =====
  const openCreate = () => {
    setEditingStudent(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (student) => {
    setEditingStudent(student)
    setForm({
      username: student.username || '',
      password: '',
      student_code: student.student_code || '',
      full_name: student.full_name || '',
      birthdate: student.birthdate ? String(student.birthdate).slice(0, 10) : '',
      gender: student.gender || '',
      email: student.email || '',
      phone: student.phone || '',
      father_phone: student.father_phone || '',
      mother_phone: student.mother_phone || '',
      enrollment_year: student.enrollment_year ? String(student.enrollment_year) : '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.username.trim() || !form.student_code.trim() || !form.full_name.trim()) {
      setFormError('Vui lòng nhập đầy đủ tên đăng nhập, mã học sinh và họ tên.')
      return
    }
    if (!editingStudent && !form.password) {
      setFormError('Vui lòng nhập mật khẩu khởi tạo cho học sinh mới.')
      return
    }
    if (!form.birthdate || !form.gender || !form.email.trim() || !form.enrollment_year) {
      setFormError('Vui lòng nhập đầy đủ ngày sinh, giới tính, email và năm nhập học.')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        username: form.username.trim(),
        student_code: form.student_code.trim(),
        full_name: form.full_name.trim(),
        birthdate: form.birthdate,
        gender: form.gender,
        email: form.email.trim(),
        phone: form.phone.trim(),
        father_phone: form.father_phone.trim(),
        mother_phone: form.mother_phone.trim(),
        enrollment_year: Number(form.enrollment_year),
      }
      if (!editingStudent) payload.password = form.password

      if (editingStudent) {
        await studentService.update(editingStudent._id, payload)
        toast.success('Cập nhật học sinh thành công!')
      } else {
        await studentService.create(payload)
        toast.success('Thêm học sinh thành công!')
      }
      setModalOpen(false)
      await loadStudents()
    } catch (err) {
      setFormError(err.message || 'Không thể lưu thông tin học sinh.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===== Đổi trạng thái học vụ =====
  const openStatusModal = (student) => {
    setStatusTarget(student)
    setNewStatus('')
    setStatusError('')
  }

  const handleChangeStatus = async () => {
    if (!statusTarget || !newStatus) {
      setStatusError('Vui lòng chọn trạng thái mới.')
      return
    }
    try {
      setChangingStatus(true)
      await studentService.changeStatus(statusTarget._id, newStatus)
      toast.success('Cập nhật trạng thái học vụ thành công!')
      setStatusTarget(null)
      await loadStudents()
    } catch (err) {
      setStatusError(err.message || 'Đổi trạng thái thất bại.')
    } finally {
      setChangingStatus(false)
    }
  }

  // ===== Tốt nghiệp =====
  const handleGraduate = async () => {
    if (!graduateTargets.length) return
    try {
      setGraduating(true)
      await studentService.graduate(graduateTargets)
      toast.success(`Đã đánh dấu tốt nghiệp ${graduateTargets.length} học sinh!`)
      setGraduateTargets([])
      setSelectedIds(new Set())
      await loadStudents()
    } catch (err) {
      toast.error(err.message || 'Tốt nghiệp thất bại.')
    } finally {
      setGraduating(false)
    }
  }

  // ===== Import / Export Excel =====
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      setImporting(true)
      const formData = new FormData()
      formData.append('file', file)
      const res = await studentService.importExcel(formData)
      const result = res?.data || {}
      const errors = Array.isArray(result.errors) ? result.errors : []
      if (result.failed && errors.length) {
        const detail = errors
          .slice(0, 5)
          .map((err) => `Dòng ${err?.row ?? '?'}: ${err?.message || String(err)}`)
          .join('; ')
        toast.error(`Import có ${result.failed} dòng lỗi. ${detail}`)
      } else if (result.failed && !errors.length) {
        toast.error(`Import có ${result.failed} dòng thất bại.`)
      } else {
        toast.success(`Import hoàn tất: thành công ${result.success ?? 0} dòng.`)
      }
      await loadStudents()
    } catch (err) {
      toast.error(err.message || 'Import file Excel thất bại.')
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const params = {}
      if (filters.keyword.trim()) params.keyword = filters.keyword.trim()
      if (filters.status) params.status = filters.status
      if (filters.academic_status) params.academic_status = filters.academic_status
      if (filters.gender) params.gender = filters.gender
      if (filters.class_id) params.class_id = filters.class_id

      const blob = await studentService.exportExcel(params)
      downloadBlob(blob, 'danh-sach-hoc-sinh.xlsx')
      toast.success('Đã xuất danh sách học sinh ra file Excel.')
    } catch (err) {
      toast.error(err.message || 'Xuất file Excel thất bại.')
    } finally {
      setExporting(false)
    }
  }

  const columns = [
    {
      key: 'student_code',
      header: 'Mã HS',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900">{row.student_code}</span>
      ),
    },
    {
      key: 'full_name',
      header: 'Họ và tên',
      render: (row) => <span className="font-semibold text-slate-800">{row.full_name}</span>,
    },
    {
      key: 'class_name',
      header: 'Lớp',
      render: (row) => <Badge color="amber">{row.class_name || 'Chưa có lớp'}</Badge>,
    },
    {
      key: 'gender',
      header: 'Giới tính',
      render: (row) => GENDER_LABELS[row.gender] || row.gender || '—',
    },
    {
      key: 'enrollment_year',
      header: 'Năm nhập học',
      render: (row) => row.enrollment_year || '—',
    },
    {
      key: 'status',
      header: 'Tài khoản',
      render: (row) => (
        <Badge color={row.status === USER_STATUS.ACTIVE ? 'success' : 'danger'}>
          {USER_STATUS_LABELS[row.status] || row.status}
        </Badge>
      ),
    },
    {
      key: 'academic_status',
      header: 'Học vụ',
      render: (row) => (
        <Badge color={ACADEMIC_STATUS_COLORS[row.academic_status] || 'info'}>
          {ACADEMIC_STATUS_LABELS[row.academic_status] || row.academic_status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/admin/students/${row._id}`}
            title="Xem chi tiết"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
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
            onClick={() => openStatusModal(row)}
            title="Đổi trạng thái học vụ"
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {row.academic_status !== ACADEMIC_STATUS.GRADUATED && (
            <button
              type="button"
              onClick={() => setGraduateTargets([row._id])}
              title="Đánh dấu tốt nghiệp"
              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  const selectedCount = selectedIds.size

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Quản lý học sinh</span>
          </h1>
          <p className="text-xs text-slate-500">
            Tra cứu, cập nhật hồ sơ học sinh; quản lý trạng thái học vụ và tốt nghiệp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} loading={importing}>
            <Upload className="w-4 h-4" />
            <span>Nhập Excel</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} loading={exporting}>
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh</span>
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
                placeholder="Mã HS, họ tên hoặc email... (Enter để tìm)"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lớp</label>
            <select
              value={filters.class_id}
              onChange={(e) => setFilters((f) => ({ ...f, class_id: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">Tất cả</option>
              <option value="__none__">Chưa có lớp</option>
              {classOptions.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trạng thái tài khoản</label>
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

          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trạng thái học vụ</label>
            <select
              value={filters.academic_status}
              onChange={(e) => setFilters((f) => ({ ...f, academic_status: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">Tất cả</option>
              {Object.entries(ACADEMIC_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[130px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Giới tính</label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">Tất cả</option>
              {Object.entries(GENDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
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
              Đặt lại
            </Button>
          </div>
        </form>

        {/* Thanh công cụ hàng loạt */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-primary-50 border border-primary-200 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-primary">
              Đã chọn {selectedCount} học sinh
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedIds(new Set())}>
                Bỏ chọn
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setGraduateTargets([...selectedIds])}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Tốt nghiệp hàng loạt</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bảng học sinh */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
        {!loading && students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Không tìm thấy học sinh nào"
            description="Thử thay đổi bộ lọc hoặc thêm học sinh mới vào hệ thống."
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Sắp xếp
                </span>
                <button
                  type="button"
                  onClick={() => toggleSort('full_name')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    sort.field === 'full_name'
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {(() => {
                    const Icon =
                      sort.field !== 'full_name'
                        ? ArrowUpDown
                        : sort.dir === 'asc'
                          ? ArrowUpAZ
                          : ArrowDownZA
                    return <Icon className="w-4 h-4" />
                  })()}
                  <span>
                    {sort.field === 'full_name' && sort.dir === 'desc'
                      ? 'Tên (Z-A)'
                      : 'Tên (A-Z)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSort('class_name')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    sort.field === 'class_name'
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {(() => {
                    const Icon =
                      sort.field !== 'class_name'
                        ? ArrowUpDown
                        : sort.dir === 'asc'
                          ? ArrowUpAZ
                          : ArrowDownZA
                    return <Icon className="w-4 h-4" />
                  })()}
                  <span>
                    {sort.field === 'class_name' && sort.dir === 'desc'
                      ? 'Lớp (Z-A)'
                      : 'Lớp (A-Z)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSort('enrollment_year')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    sort.field === 'enrollment_year'
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {(() => {
                    const Icon =
                      sort.field !== 'enrollment_year'
                        ? ArrowUpDown
                        : sort.dir === 'asc'
                          ? ArrowUp
                          : ArrowDown
                    return <Icon className="w-4 h-4" />
                  })()}
                  <span>Năm nhập học</span>
                </button>
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                total={students.length}
                onChange={setPage}
              />
            </div>
            <DataTable
              columns={columns}
              data={pagedStudents}
              loading={loading}
              rowKey="_id"
              emptyMessage="Không có dữ liệu"
              selectable
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              total={students.length}
              onChange={setPage}
            />
          </>
        )}
      </div>

      {/* Modal thêm / sửa học sinh */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? `Cập nhật học sinh: ${editingStudent.full_name}` : 'Thêm học sinh mới'}
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
                placeholder="VD: hs2025001"
                disabled={Boolean(editingStudent)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all disabled:bg-slate-100 disabled:text-slate-400"
                required
              />
            </div>

            {!editingStudent && (
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
                Mã học sinh <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={form.student_code}
                onChange={(e) => setForm((f) => ({ ...f, student_code: e.target.value }))}
                placeholder="VD: HS20250001"
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
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày sinh <span className="text-accent">*</span>
              </label>
              <input
                type="date"
                value={form.birthdate}
                onChange={(e) => setForm((f) => ({ ...f, birthdate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all cursor-pointer"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Giới tính <span className="text-accent">*</span>
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                required
              >
                <option value="">— Chọn giới tính —</option>
                {Object.entries(GENDER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email <span className="text-accent">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="09xx xxx xxx"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số điện thoại cha</label>
              <input
                type="tel"
                value={form.father_phone}
                onChange={(e) => setForm((f) => ({ ...f, father_phone: e.target.value }))}
                placeholder="09xx xxx xxx"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số điện thoại mẹ</label>
              <input
                type="tel"
                value={form.mother_phone}
                onChange={(e) => setForm((f) => ({ ...f, mother_phone: e.target.value }))}
                placeholder="09xx xxx xxx"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Năm nhập học <span className="text-accent">*</span>
              </label>
              <input
                type="number"
                min="1990"
                max="2100"
                value={form.enrollment_year}
                onChange={(e) => setForm((f) => ({ ...f, enrollment_year: e.target.value }))}
                placeholder="VD: 2022"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)} disabled={submitting}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              {editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal đổi trạng thái học vụ */}
      <Modal
        isOpen={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title="Đổi trạng thái học vụ"
        size="md"
      >
        <div className="space-y-4">
          {statusError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
              {statusError}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <p>
              Học sinh:{' '}
              <strong className="text-slate-900">
                {statusTarget?.full_name} ({statusTarget?.student_code})
              </strong>
            </p>
            <p>
              Trạng thái hiện tại:{' '}
              <Badge color={ACADEMIC_STATUS_COLORS[statusTarget?.academic_status] || 'info'}>
                {ACADEMIC_STATUS_LABELS[statusTarget?.academic_status] || statusTarget?.academic_status}
              </Badge>
            </p>
          </div>

          {(ALLOWED_TRANSITIONS[statusTarget?.academic_status] || []).length === 0 ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              Học sinh đang ở trạng thái cuối nên không thể chuyển sang trạng thái khác.
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Trạng thái mới <span className="text-accent">*</span>
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="">— Chọn trạng thái —</option>
                {(ALLOWED_TRANSITIONS[statusTarget?.academic_status] || []).map((value) => (
                  <option key={value} value={value}>
                    {ACADEMIC_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Để đánh dấu tốt nghiệp, hãy dùng thao tác "Tốt nghiệp" riêng trên danh sách.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setStatusTarget(null)} disabled={changingStatus}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleChangeStatus}
              loading={changingStatus}
              disabled={(ALLOWED_TRANSITIONS[statusTarget?.academic_status] || []).length === 0}
            >
              Cập nhật trạng thái
            </Button>
          </div>
        </div>
      </Modal>

      {/* Xác nhận tốt nghiệp (đơn / hàng loạt) */}
      <ConfirmDialog
        isOpen={graduateTargets.length > 0}
        onClose={() => setGraduateTargets([])}
        onConfirm={handleGraduate}
        loading={graduating}
        title={
          graduateTargets.length > 1 ? 'Tốt nghiệp hàng loạt' : 'Đánh dấu tốt nghiệp'
        }
        message={
          graduateTargets.length > 1
            ? `Xác nhận đánh dấu TỐT NGHIỆP cho ${graduateTargets.length} học sinh đã chọn? Trạng thái học vụ sẽ chuyển thành "Đã tốt nghiệp" và không thể hoàn tác.`
            : 'Xác nhận đánh dấu học sinh này đã TỐT NGHIỆP? Trạng thái học vụ sẽ chuyển thành "Đã tốt nghiệp" và không thể hoàn tác.'
        }
        confirmText="Xác nhận tốt nghiệp"
      />
    </div>
  )
}

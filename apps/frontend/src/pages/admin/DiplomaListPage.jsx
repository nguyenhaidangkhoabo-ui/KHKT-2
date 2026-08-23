import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Award,
  Plus,
  Layers,
  Eye,
  RefreshCw,
  Search,
  PackageOpen,
  PackageCheck,
  GraduationCap,
} from 'lucide-react'
import { diplomaService, yearService, studentService } from '../../services'
import {
  DIPLOMA_STATUS,
  DIPLOMA_STATUS_LABELS,
  DIPLOMA_STATUS_COLORS,
} from '../../config/constants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

const PAGE_SIZE = 20
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/

const EMPTY_CREATE_FORM = { student_id: '', graduation_academic_year_id: '' }
const EMPTY_BULK_FORM = { academic_year_id: '', student_ids_text: '' }

export default function DiplomaListPage() {
  const [diplomas, setDiplomas] = useState([])
  const [stats, setStats] = useState(null)
  const [years, setYears] = useState([])
  const [graduatedStudents, setGraduatedStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Bộ lọc: input tạm + giá trị đã chốt (commit bằng Enter / nút Tìm kiếm)
  const [keywordInput, setKeywordInput] = useState('')
  const [filters, setFilters] = useState({ search: '', status: '', year_id: '' })

  const [page, setPage] = useState(1)

  // Modal thêm bằng (đơn)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Modal tạo hàng loạt
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkForm, setBulkForm] = useState(EMPTY_BULK_FORM)
  const [bulkError, setBulkError] = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)

  // Modal xem chi tiết
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadMeta = useCallback(async () => {
    try {
      const [yearsRes, studentsRes] = await Promise.allSettled([
        yearService.list(),
        studentService.list({ academic_status: 'GRADUATED' }),
      ])
      if (yearsRes.status === 'fulfilled') {
        const list = Array.isArray(yearsRes.value?.data) ? yearsRes.value.data : []
        setYears([...list].sort((a, b) => (b.start_year || 0) - (a.start_year || 0)))
      }
      if (studentsRes.status === 'fulfilled') {
        const list = Array.isArray(studentsRes.value?.data) ? studentsRes.value.data : []
        setGraduatedStudents(list)
      }
    } catch {
      // Danh mục phụ — lỗi không chặn trang, bỏ qua
    }
  }, [])

  const loadDiplomas = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = {}
      if (filters.search.trim()) params.search = filters.search.trim()
      if (filters.status) params.status = filters.status
      if (filters.year_id) params.year_id = filters.year_id

      const res = await diplomaService.list(params)
      setDiplomas(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bằng tốt nghiệp.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadStats = useCallback(async () => {
    try {
      const res = await diplomaService.stats()
      setStats(res?.data || null)
    } catch {
      setStats(null)
    }
  }, [])

  useEffect(() => {
    loadMeta()
    loadStats()
  }, [loadMeta, loadStats])

  useEffect(() => {
    loadDiplomas()
  }, [loadDiplomas])

  // Phân trang phía client (backend trả toàn bộ danh sách đã lọc)
  const totalPages = Math.max(1, Math.ceil(diplomas.length / PAGE_SIZE))
  const pagedDiplomas = useMemo(
    () => diplomas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [diplomas, page]
  )

  useEffect(() => {
    setPage(1)
  }, [filters])

  const commitKeyword = (e) => {
    e.preventDefault()
    setPage(1)
    setFilters((f) => ({ ...f, search: keywordInput }))
  }

  const resetFilters = () => {
    setKeywordInput('')
    setFilters({ search: '', status: '', year_id: '' })
    setPage(1)
  }

  // ===== Thêm bằng đơn =====
  const openCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM)
    setFormError('')
    setCreateOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!createForm.student_id) {
      setFormError('Vui lòng chọn học sinh đã tốt nghiệp.')
      return
    }
    if (!createForm.graduation_academic_year_id) {
      setFormError('Vui lòng chọn năm tốt nghiệp.')
      return
    }
    try {
      setSubmitting(true)
      await diplomaService.create({
        student_id: createForm.student_id,
        graduation_academic_year_id: createForm.graduation_academic_year_id,
      })
      toast.success('Tạo bằng tốt nghiệp thành công!')
      setCreateOpen(false)
      await Promise.all([loadDiplomas(), loadStats()])
    } catch (err) {
      setFormError(err.message || 'Không thể tạo bằng tốt nghiệp.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===== Tạo hàng loạt =====
  const openBulkCreate = () => {
    setBulkForm(EMPTY_BULK_FORM)
    setBulkError('')
    setBulkOpen(true)
  }

  const parseStudentIds = (text) =>
    text
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)

  const handleBulkCreate = async (e) => {
    e.preventDefault()
    setBulkError('')
    if (!bulkForm.academic_year_id) {
      setBulkError('Vui lòng chọn năm tốt nghiệp.')
      return
    }

    const ids = parseStudentIds(bulkForm.student_ids_text)
    for (const id of ids) {
      if (!OBJECT_ID_REGEX.test(id)) {
        setBulkError(`ID học sinh không hợp lệ: "${id}". Mỗi dòng phải là một ID hợp lệ.`)
        return
      }
    }

    try {
      setBulkSubmitting(true)
      const payload = ids.length > 0
        ? { academic_year_id: bulkForm.academic_year_id, student_ids: ids }
        : { academic_year_id: bulkForm.academic_year_id }
      const res = await diplomaService.bulkCreate(payload)
      const result = res?.data || {}
      toast.success(result.message || `Đã tạo ${result.created_count ?? 0} bằng tốt nghiệp.`)
      setBulkOpen(false)
      await Promise.all([loadDiplomas(), loadStats()])
    } catch (err) {
      setBulkError(err.message || 'Tạo hàng loạt thất bại.')
    } finally {
      setBulkSubmitting(false)
    }
  }

  // ===== Xem chi tiết =====
  const openDetail = async (row) => {
    setDetail(row)
    setDetailLoading(true)
    try {
      const res = await diplomaService.getById(row._id)
      if (res?.data) setDetail(res.data)
    } catch {
      // Giữ dữ liệu dòng bảng nếu không tải được chi tiết
    } finally {
      setDetailLoading(false)
    }
  }

  const statCards = [
    {
      key: DIPLOMA_STATUS.NOT_STORED,
      label: DIPLOMA_STATUS_LABELS[DIPLOMA_STATUS.NOT_STORED],
      value: stats?.[DIPLOMA_STATUS.NOT_STORED] ?? 0,
      icon: PackageOpen,
      iconClass: 'bg-amber-50 text-amber-600',
    },
    {
      key: DIPLOMA_STATUS.STORED,
      label: DIPLOMA_STATUS_LABELS[DIPLOMA_STATUS.STORED],
      value: stats?.[DIPLOMA_STATUS.STORED] ?? 0,
      icon: PackageCheck,
      iconClass: 'bg-sky-50 text-sky-600',
    },
    {
      key: DIPLOMA_STATUS.HANDED_OVER,
      label: DIPLOMA_STATUS_LABELS[DIPLOMA_STATUS.HANDED_OVER],
      value: stats?.[DIPLOMA_STATUS.HANDED_OVER] ?? 0,
      icon: GraduationCap,
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
  ]

  const columns = [
    {
      key: 'diploma_number',
      header: 'Số hiệu bằng',
      render: (row) =>
        row.diploma_number ? (
          <span className="font-mono font-bold text-slate-900">{row.diploma_number}</span>
        ) : (
          <Badge color="slate">Chưa cấp số</Badge>
        ),
    },
    {
      key: 'student',
      header: 'Học sinh',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-800">{row.student_id?.full_name || '—'}</span>
          <p className="text-[11px] text-slate-400 font-mono">
            {row.student_id?.student_code || ''}
          </p>
        </div>
      ),
    },
    {
      key: 'year',
      header: 'Năm tốt nghiệp',
      render: (row) => {
        const y = row.graduation_academic_year_id
        return (
          <span className="text-xs text-slate-600">
            {y ? `${y.start_year} - ${y.end_year}` : y?.name || '—'}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <Badge color={DIPLOMA_STATUS_COLORS[row.status] || 'slate'}>
          {DIPLOMA_STATUS_LABELS[row.status] || row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(row)}
            title="Xem chi tiết"
            className="p-1.5 rounded-lg text-primary hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
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
            <Award className="w-5 h-5 text-primary" />
            <span>Quản lý bằng tốt nghiệp</span>
          </h1>
          <p className="text-xs text-slate-500">
            Danh sách bằng tốt nghiệp của học sinh; theo dõi trạng thái tiếp nhận và trao bằng.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={loadDiplomas}>
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={openBulkCreate}>
            <Layers className="w-4 h-4" />
            <span>Tạo hàng loạt</span>
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            <span>Thêm bằng</span>
          </Button>
        </div>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4 animate-in fade-in duration-300"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.iconClass}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-xl font-black text-slate-900 leading-tight">
                {Number(card.value).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        ))}
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
                placeholder="Mã HS hoặc họ tên... (Enter để tìm)"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">Tất cả</option>
              {Object.entries(DIPLOMA_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[170px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Năm tốt nghiệp</label>
            <select
              value={filters.year_id}
              onChange={(e) => setFilters((f) => ({ ...f, year_id: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">Tất cả</option>
              {years.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.start_year} - {y.end_year}
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
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bảng bằng tốt nghiệp */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
        {!loading && diplomas.length === 0 ? (
          <EmptyState
            icon={Award}
            title="Không tìm thấy bằng tốt nghiệp nào"
            description="Thử thay đổi bộ lọc hoặc tạo bằng cho học sinh đã tốt nghiệp."
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pagedDiplomas}
              loading={loading}
              rowKey="_id"
              emptyMessage="Không có dữ liệu"
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              total={diplomas.length}
              onChange={setPage}
            />
          </>
        )}
      </div>

      {/* Modal thêm bằng */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Thêm bằng tốt nghiệp" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Học sinh đã tốt nghiệp <span className="text-accent">*</span>
            </label>
            <select
              value={createForm.student_id}
              onChange={(e) => setCreateForm((f) => ({ ...f, student_id: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              required
            >
              <option value="">— Chọn học sinh —</option>
              {graduatedStudents.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.full_name} ({s.student_code})
                </option>
              ))}
            </select>
            {graduatedStudents.length === 0 && (
              <p className="mt-1.5 text-[11px] text-amber-700">
                Chưa có học sinh nào ở trạng thái "Đã tốt nghiệp".
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Năm tốt nghiệp <span className="text-accent">*</span>
            </label>
            <select
              value={createForm.graduation_academic_year_id}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, graduation_academic_year_id: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              required
            >
              <option value="">— Chọn năm học —</option>
              {years.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.start_year} - {y.end_year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Tạo bằng
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal tạo hàng loạt */}
      <Modal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} title="Tạo bằng hàng loạt" size="lg">
        <form onSubmit={handleBulkCreate} className="space-y-4">
          {bulkError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
              {bulkError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Năm tốt nghiệp <span className="text-accent">*</span>
            </label>
            <select
              value={bulkForm.academic_year_id}
              onChange={(e) => setBulkForm((f) => ({ ...f, academic_year_id: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              required
            >
              <option value="">— Chọn năm học —</option>
              {years.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.start_year} - {y.end_year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ID học sinh (tùy chọn)
            </label>
            <textarea
              value={bulkForm.student_ids_text}
              onChange={(e) => setBulkForm((f) => ({ ...f, student_ids_text: e.target.value }))}
              rows={4}
              placeholder={'Mỗi dòng một ID học sinh...\nVD: 65a1b2c3d4e5f67890123456'}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all resize-y"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Để trống để tạo bằng cho <strong>tất cả</strong> học sinh đã tốt nghiệp chưa có bằng của năm học đã chọn. Hệ thống tự bỏ qua học sinh đã có bằng.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setBulkOpen(false)} disabled={bulkSubmitting}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={bulkSubmitting}>
              Tạo hàng loạt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        isOpen={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Chi tiết bằng tốt nghiệp"
        size="md"
      >
        {detailLoading && !detail ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-10 rounded-xl bg-slate-100" />
            <div className="h-10 rounded-xl bg-slate-100" />
          </div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-primary-50 border border-primary-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">
                    {detail.diploma_number || 'Chưa cấp số hiệu'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {detail.student_id?.student_code || ''}
                  </p>
                </div>
              </div>
              <Badge color={DIPLOMA_STATUS_COLORS[detail.status] || 'slate'}>
                {DIPLOMA_STATUS_LABELS[detail.status] || detail.status}
              </Badge>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <dt className="text-slate-400 font-medium">Họ và tên</dt>
                <dd className="font-bold text-slate-800">{detail.student_id?.full_name || '—'}</dd>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <dt className="text-slate-400 font-medium">Năm tốt nghiệp</dt>
                <dd className="font-bold text-slate-800">
                  {detail.graduation_academic_year_id
                    ? `${detail.graduation_academic_year_id.start_year ?? ''} - ${detail.graduation_academic_year_id.end_year ?? ''}`
                    : detail.graduation_academic_year_id?.name || '—'}
                </dd>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <dt className="text-slate-400 font-medium">Ngày tạo</dt>
                <dd className="font-bold text-slate-800">
                  {detail.created_at ? new Date(detail.created_at).toLocaleDateString('vi-VN') : '—'}
                </dd>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <dt className="text-slate-400 font-medium">Cập nhật gần nhất</dt>
                <dd className="font-bold text-slate-800">
                  {detail.updated_at ? new Date(detail.updated_at).toLocaleDateString('vi-VN') : '—'}
                </dd>
              </div>
            </dl>

            <div className="flex justify-end pt-1">
              <Button variant="secondary" size="sm" onClick={() => setDetail(null)}>
                Đóng
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

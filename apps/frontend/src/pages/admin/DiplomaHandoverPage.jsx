import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Inbox,
  PackageCheck,
  GraduationCap,
  RefreshCw,
  Search,
} from 'lucide-react'
import { diplomaService, yearService } from '../../services'
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
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

const PAGE_SIZE = 20

export default function DiplomaHandoverPage() {
  const [diplomas, setDiplomas] = useState([])
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Bộ lọc: input tạm + giá trị đã chốt
  const [keywordInput, setKeywordInput] = useState('')
  const [filters, setFilters] = useState({ search: '', status: '', year_id: '' })

  const [page, setPage] = useState(1)

  // Chọn dòng (hàng loạt)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  // Xác nhận thao tác đơn (nhận / bàn giao)
  const [singleAction, setSingleAction] = useState(null) // { type: 'RECEIVE' | 'HANDOVER', diploma }
  const [actionLoading, setActionLoading] = useState(false)

  // Modal hàng loạt
  const [bulkAction, setBulkAction] = useState(null) // 'RECEIVE' | 'HANDOVER' | null
  const [bulkLoading, setBulkLoading] = useState(false)

  const loadYears = useCallback(async () => {
    try {
      const res = await yearService.list()
      const list = Array.isArray(res?.data) ? res.data : []
      setYears([...list].sort((a, b) => (b.start_year || 0) - (a.start_year || 0)))
    } catch {
      setYears([])
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

  useEffect(() => {
    loadYears()
  }, [loadYears])

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
    setSelectedIds(new Set())
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
      setSelectedIds(new Set(pagedDiplomas.map((d) => String(d._id))))
    } else {
      setSelectedIds(new Set())
    }
  }

  // ===== Thao tác đơn =====
  const handleSingleAction = async () => {
    if (!singleAction?.diploma) return
    try {
      setActionLoading(true)
      if (singleAction.type === 'RECEIVE') {
        await diplomaService.receive(singleAction.diploma._id)
        toast.success(
          `Đã tiếp nhận bằng của ${singleAction.diploma.student_id?.full_name || 'học sinh'} về trường.`
        )
      } else {
        await diplomaService.handover(singleAction.diploma._id)
        toast.success(
          `Đã trao bằng cho ${singleAction.diploma.student_id?.full_name || 'học sinh'}.`
        )
      }
      setSingleAction(null)
      setSelectedIds(new Set())
      await loadDiplomas()
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại.')
    } finally {
      setActionLoading(false)
    }
  }

  // ===== Thao tác hàng loạt =====
  // Backend chỉ chấp nhận { diploma_ids } và tự động bỏ qua các bản ghi
  // không ở trạng thái nguồn hợp lệ (NOT_STORED -> STORED, STORED -> HANDED_OVER).
  const eligibleIds = useMemo(() => {
    if (!bulkAction) return []
    const requiredStatus = bulkAction === 'RECEIVE' ? DIPLOMA_STATUS.NOT_STORED : DIPLOMA_STATUS.STORED
    return diplomas
      .filter((d) => selectedIds.has(String(d._id)) && d.status === requiredStatus)
      .map((d) => d._id)
  }, [bulkAction, diplomas, selectedIds])

  const ineligibleCount = bulkAction ? selectedIds.size - eligibleIds.length : 0

  const openBulkModal = (type) => {
    const requiredStatus = type === 'RECEIVE' ? DIPLOMA_STATUS.NOT_STORED : DIPLOMA_STATUS.STORED
    const hasEligible = diplomas.some(
      (d) => selectedIds.has(String(d._id)) && d.status === requiredStatus
    )
    if (!hasEligible) {
      toast.error(
        type === 'RECEIVE'
          ? 'Chỉ các bằng ở trạng thái "Chưa về trường" mới có thể tiếp nhận.'
          : 'Chỉ các bằng ở trạng thái "Đã về trường" mới có thể bàn giao.'
      )
      return
    }
    setBulkAction(type)
  }

  const handleBulkAction = async () => {
    if (!bulkAction || eligibleIds.length === 0) return
    try {
      setBulkLoading(true)
      const payload = { diploma_ids: eligibleIds }
      const res =
        bulkAction === 'RECEIVE'
          ? await diplomaService.bulkReceive(payload)
          : await diplomaService.bulkHandover(payload)
      toast.success(res?.data?.message || 'Thao tác hàng loạt thành công!')
      setBulkAction(null)
      setSelectedIds(new Set())
      await loadDiplomas()
    } catch (err) {
      toast.error(err.message || 'Thao tác hàng loạt thất bại.')
    } finally {
      setBulkLoading(false)
    }
  }

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
          {row.status === DIPLOMA_STATUS.NOT_STORED && (
            <button
              type="button"
              onClick={() => setSingleAction({ type: 'RECEIVE', diploma: row })}
              title="Nhận bằng về trường"
              className="p-1.5 rounded-lg text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
            </button>
          )}
          {row.status === DIPLOMA_STATUS.STORED && (
            <button
              type="button"
              onClick={() => setSingleAction({ type: 'HANDOVER', diploma: row })}
              title="Bàn giao cho học sinh"
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
            <Inbox className="w-5 h-5 text-primary" />
            <span>Nhận &amp; bàn giao bằng tốt nghiệp</span>
          </h1>
          <p className="text-xs text-slate-500">
            Tiếp nhận bằng từ bộ giáo dục về trường và bàn giao cho học sinh (đơn lẻ hoặc hàng loạt).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDiplomas}>
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </Button>
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

        {/* Thanh công cụ hàng loạt */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-primary-50 border border-primary-200 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-primary">
              Đã chọn {selectedCount} bằng tốt nghiệp
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedIds(new Set())}>
                Bỏ chọn
              </Button>
              <Button variant="primary" size="sm" onClick={() => openBulkModal('RECEIVE')}>
                <PackageCheck className="w-4 h-4" />
                <span>Nhận hàng loạt</span>
              </Button>
              <Button variant="primary" size="sm" onClick={() => openBulkModal('HANDOVER')}>
                <GraduationCap className="w-4 h-4" />
                <span>Bàn giao hàng loạt</span>
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

      {/* Bảng bằng */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
        {!loading && diplomas.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Không có bằng nào cần xử lý"
            description="Thử thay đổi bộ lọc để xem danh sách bằng tốt nghiệp."
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pagedDiplomas}
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
              total={diplomas.length}
              onChange={setPage}
            />
          </>
        )}
      </div>

      {/* Xác nhận thao tác đơn */}
      <ConfirmDialog
        isOpen={Boolean(singleAction)}
        onClose={() => setSingleAction(null)}
        onConfirm={handleSingleAction}
        loading={actionLoading}
        danger={false}
        title={singleAction?.type === 'RECEIVE' ? 'Nhận bằng về trường' : 'Bàn giao bằng'}
        message={
          singleAction?.type === 'RECEIVE'
            ? `Xác nhận tiếp nhận bằng "${singleAction?.diploma?.diploma_number || 'chưa cấp số'}" của ${singleAction?.diploma?.student_id?.full_name || 'học sinh'} về trường? Trạng thái sẽ chuyển thành "Đã về trường".`
            : `Xác nhận bàn giao bằng "${singleAction?.diploma?.diploma_number || 'chưa cấp số'}" cho ${singleAction?.diploma?.student_id?.full_name || 'học sinh'}? Trạng thái sẽ chuyển thành "Đã trao".`
        }
        confirmText={singleAction?.type === 'RECEIVE' ? 'Nhận bằng' : 'Bàn giao'}
      />

      {/* Modal thao tác hàng loạt — backend chỉ nhận danh sách diploma_ids */}
      <Modal
        isOpen={Boolean(bulkAction)}
        onClose={() => setBulkAction(null)}
        title={bulkAction === 'RECEIVE' ? 'Nhận bằng hàng loạt' : 'Bàn giao bằng hàng loạt'}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                bulkAction === 'RECEIVE' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {bulkAction === 'RECEIVE' ? (
                <PackageCheck className="w-5 h-5" />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1.5">
              {bulkAction === 'RECEIVE'
                ? `Xác nhận tiếp nhận ${eligibleIds.length} bằng đã chọn về trường? Trạng thái các bằng sẽ chuyển thành "Đã về trường".`
                : `Xác nhận bàn giao ${eligibleIds.length} bằng đã chọn cho học sinh? Trạng thái các bằng sẽ chuyển thành "Đã trao".`}
            </div>
          </div>

          {ineligibleCount > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              {ineligibleCount} bằng đang chọn không ở trạng thái phù hợp và sẽ được hệ thống bỏ qua.
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setBulkAction(null)} disabled={bulkLoading}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBulkAction}
              loading={bulkLoading}
            >
              {bulkAction === 'RECEIVE' ? 'Xác nhận nhận hàng loạt' : 'Xác nhận bàn giao hàng loạt'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

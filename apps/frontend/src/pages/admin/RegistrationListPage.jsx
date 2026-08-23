import { useEffect, useState, useCallback } from 'react'
import {
  ClipboardList,
  RefreshCw,
  Download,
  XCircle,
  Users,
  CalendarClock,
} from 'lucide-react'
import { registrationService } from '../../services'
import { REGISTRATION_STATUS_LABELS } from '../../config/constants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

const PAGE_SIZE = 20

const REGISTRATION_STATUS_COLORS = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

// Trạng thái còn được phép hủy phiếu
const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED']

function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

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

export default function RegistrationListPage() {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Bộ lọc: ngày nhận + trạng thái (lọc phía client vì backend chỉ lọc theo ngày/học sinh)
  const [filters, setFilters] = useState({ pickup_date: '', status: '' })

  // Hủy phiếu đăng ký
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  // Danh sách theo ngày (modal)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [rosterDate, setRosterDate] = useState('')
  const [rosterRows, setRosterRows] = useState([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [rosterError, setRosterError] = useState('')

  // Xuất Excel
  const [exporting, setExporting] = useState(false)

  const loadStats = useCallback(async () => {
    try {
      const res = await registrationService.stats()
      setStats(res?.data || null)
    } catch {
      setStats(null)
    }
  }, [])

  const loadRegistrations = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = { page, limit: PAGE_SIZE }
      if (filters.pickup_date) params.pickup_date = filters.pickup_date

      const res = await registrationService.list(params)
      const data = res?.data || {}
      setRows(Array.isArray(data.rows) ? data.rows : [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đăng ký.')
    } finally {
      setLoading(false)
    }
  }, [page, filters.pickup_date])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadRegistrations()
  }, [loadRegistrations])

  useEffect(() => {
    setPage(1)
  }, [filters])

  const resetFilters = () => {
    setFilters({ pickup_date: '', status: '' })
    setPage(1)
  }

  // Lọc trạng thái phía client trên trang hiện tại
  const visibleRows =
    filters.status && filters.status !== ''
      ? rows.filter((r) => r.status === filters.status)
      : rows

  // ===== Hủy phiếu đăng ký =====
  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      setCancelling(true)
      await registrationService.cancel(cancelTarget._id)
      toast.success(
        `Đã hủy phiếu đăng ký của ${cancelTarget.student_id?.full_name || 'học sinh'}.`
      )
      setCancelTarget(null)
      await Promise.all([loadRegistrations(), loadStats()])
    } catch (err) {
      toast.error(err.message || 'Hủy phiếu đăng ký thất bại.')
    } finally {
      setCancelling(false)
    }
  }

  // ===== Danh sách theo ngày =====
  const openRoster = async () => {
    if (!filters.pickup_date) return
    setRosterDate(filters.pickup_date)
    setRosterOpen(true)
    setRosterRows([])
    setRosterError('')
    try {
      setRosterLoading(true)
      const res = await registrationService.byDate(filters.pickup_date)
      setRosterRows(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      setRosterError(err.message || 'Không thể tải danh sách theo ngày.')
    } finally {
      setRosterLoading(false)
    }
  }

  // ===== Xuất Excel (backend yêu cầu pickup_date) =====
  const handleExport = async () => {
    if (!filters.pickup_date) {
      toast.error('Vui lòng chọn ngày nhận bằng trước khi xuất Excel.')
      return
    }
    try {
      setExporting(true)
      const blob = await registrationService.exportExcel({ pickup_date: filters.pickup_date })
      downloadBlob(blob, `dang-ky-nhan-bang-${filters.pickup_date}.xlsx`)
      toast.success('Đã xuất danh sách đăng ký ra file Excel.')
    } catch (err) {
      toast.error(err.message || 'Xuất file Excel thất bại.')
    } finally {
      setExporting(false)
    }
  }

  const statCards = [
    {
      key: 'today',
      label: 'Nhận hôm nay',
      value: stats?.today ?? 0,
      icon: CalendarClock,
      iconClass: 'bg-primary-50 text-primary',
    },
    {
      key: 'upcoming',
      label: 'Sắp tới',
      value: stats?.upcoming ?? 0,
      icon: CalendarClock,
      iconClass: 'bg-sky-50 text-sky-600',
    },
    {
      key: 'PENDING',
      label: REGISTRATION_STATUS_LABELS.PENDING,
      value: stats?.PENDING ?? 0,
      icon: ClipboardList,
      iconClass: 'bg-amber-50 text-amber-600',
    },
    {
      key: 'CONFIRMED',
      label: REGISTRATION_STATUS_LABELS.CONFIRMED,
      value: stats?.CONFIRMED ?? 0,
      icon: ClipboardList,
      iconClass: 'bg-blue-50 text-blue-600',
    },
    {
      key: 'COMPLETED',
      label: REGISTRATION_STATUS_LABELS.COMPLETED,
      value: stats?.COMPLETED ?? 0,
      icon: ClipboardList,
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
    {
      key: 'CANCELLED',
      label: REGISTRATION_STATUS_LABELS.CANCELLED,
      value: stats?.CANCELLED ?? 0,
      icon: XCircle,
      iconClass: 'bg-red-50 text-accent',
    },
  ]

  const columns = [
    {
      key: 'pickup_date',
      header: 'Ngày nhận',
      render: (row) => (
        <span className="font-bold text-slate-900">
          {row.pickup_date ? new Date(`${row.pickup_date}T00:00:00`).toLocaleDateString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      key: 'student',
      header: 'Học sinh',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-800">
            {row.student_id?.full_name || '—'}
          </span>
          <p className="text-[11px] text-slate-400 font-mono">
            {row.student_id?.student_code || ''}
          </p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Số điện thoại',
      render: (row) => row.student_id?.phone || '—',
    },
    {
      key: 'diploma_number',
      header: 'Số hiệu bằng',
      render: (row) =>
        row.diploma_id?.diploma_number ? (
          <span className="font-mono">{row.diploma_id.diploma_number}</span>
        ) : (
          <Badge color="slate">Chưa cấp số</Badge>
        ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <Badge color={REGISTRATION_STATUS_COLORS[row.status] || 'slate'}>
          {REGISTRATION_STATUS_LABELS[row.status] || row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      render: (row) =>
        CANCELLABLE_STATUSES.includes(row.status) ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setCancelTarget(row)}
              title="Hủy phiếu đăng ký"
              className="p-1.5 rounded-lg text-accent hover:bg-red-50 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-300">—</span>
        ),
    },
  ]

  const rosterColumns = [
    {
      key: 'student_code',
      header: 'Mã HS',
      render: (row) => <span className="font-mono font-bold text-slate-900">{row.student_code}</span>,
    },
    {
      key: 'full_name',
      header: 'Họ và tên',
      render: (row) => <span className="font-semibold text-slate-800">{row.full_name}</span>,
    },
    {
      key: 'phone',
      header: 'Số điện thoại',
      render: (row) => row.phone || '—',
    },
    {
      key: 'diploma_number',
      header: 'Số hiệu bằng',
      render: (row) =>
        row.diploma_number ? (
          <span className="font-mono">{row.diploma_number}</span>
        ) : (
          <Badge color="slate">Chưa cấp số</Badge>
        ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <Badge color={REGISTRATION_STATUS_COLORS[row.status] || 'slate'}>
          {REGISTRATION_STATUS_LABELS[row.status] || row.status}
        </Badge>
      ),
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <span>Quản lý đăng ký nhận bằng</span>
          </h1>
          <p className="text-xs text-slate-500">
            Theo dõi các phiếu đăng ký nhận bằng của học sinh; hủy phiếu và xuất danh sách theo ngày.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={loadRegistrations}>
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </Button>
          <Button variant="primary" size="sm" onClick={handleExport} loading={exporting}>
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </Button>
        </div>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5 animate-in fade-in duration-300"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconClass}`}>
              <card.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {Number(card.value).toLocaleString('vi-VN')}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 leading-tight">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ngày nhận bằng</label>
            <input
              type="date"
              value={filters.pickup_date}
              onChange={(e) => setFilters((f) => ({ ...f, pickup_date: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all cursor-pointer"
            />
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">Tất cả</option>
              {Object.entries(REGISTRATION_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pb-0.5">
            <Button variant="secondary" size="sm" type="button" onClick={resetFilters}>
              Đặt lại
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={openRoster}
              disabled={!filters.pickup_date}
            >
              <Users className="w-4 h-4" />
              <span>Danh sách theo ngày</span>
            </Button>
          </div>

          {!filters.pickup_date && (
            <p className="text-[11px] text-amber-700 pb-1.5">
              Chọn ngày nhận để xem danh sách theo ngày và xuất file Excel.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bảng đăng ký */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
        {!loading && visibleRows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Không có phiếu đăng ký nào"
            description="Thử thay đổi bộ lọc ngày hoặc trạng thái để xem thêm phiếu đăng ký."
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={visibleRows}
              loading={loading}
              rowKey="_id"
              emptyMessage="Không có dữ liệu"
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onChange={setPage}
            />
          </>
        )}
      </div>

      {/* Xác nhận hủy phiếu */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        danger
        loading={cancelling}
        title="Hủy phiếu đăng ký"
        message={`Xác nhận hủy phiếu đăng ký nhận bằng ngày ${
          cancelTarget?.pickup_date
            ? new Date(`${cancelTarget.pickup_date}T00:00:00`).toLocaleDateString('vi-VN')
            : ''
        } của ${cancelTarget?.student_id?.full_name || 'học sinh'}? Lượt đăng ký sẽ được hoàn lại cho ngày đó.`}
        confirmText="Hủy phiếu"
      />

      {/* Modal danh sách theo ngày */}
      <Modal
        isOpen={rosterOpen}
        onClose={() => setRosterOpen(false)}
        title={
          rosterDate
            ? `Danh sách nhận bằng — ${new Date(`${rosterDate}T00:00:00`).toLocaleDateString('vi-VN')}`
            : 'Danh sách nhận bằng'
        }
        size="xl"
      >
        <div className="space-y-4">
          {rosterError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
              {rosterError}
            </div>
          )}

          {!rosterLoading && !rosterError && rosterRows.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Chưa có ai đăng ký ngày này"
              description="Danh sách sẽ hiển thị khi học sinh đăng ký nhận bằng vào ngày đã chọn."
            />
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Tổng cộng <strong className="text-slate-800">{rosterRows.length}</strong> lượt đăng ký
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  loading={exporting}
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất Excel ngày này</span>
                </Button>
              </div>
              <DataTable
                columns={rosterColumns}
                data={rosterRows}
                loading={rosterLoading}
                rowKey="registration_id"
                emptyMessage="Không có dữ liệu"
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

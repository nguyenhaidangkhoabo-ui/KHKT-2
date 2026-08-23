import { useEffect, useState } from 'react'
import { History, CalendarDays, XCircle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { registrationService } from '../../services'
import {
  REGISTRATION_STATUS,
  REGISTRATION_STATUS_LABELS,
} from '../../config/constants'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { toast } from '../../components/ui/Toast'

const DAY_OF_WEEK_LABELS = {
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
  SUNDAY: 'Chủ Nhật',
}

// Màu Badge theo trạng thái đăng ký
const STATUS_COLORS = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatISODate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return dateStr
  const dateObj = new Date(y, m - 1, d)
  const weekday = DAY_OF_WEEK_LABELS[
    ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][dateObj.getDay()]
  ] || ''
  const formatted = dateObj.toLocaleDateString('vi-VN')
  return weekday ? `${weekday}, ${formatted}` : formatted
}

// Chỉ được hủy khi chưa hoàn tất / chưa hủy và còn ở ngày tương lai
function isCancellable(reg) {
  if (!reg) return false
  if (reg.status === REGISTRATION_STATUS.COMPLETED || reg.status === REGISTRATION_STATUS.CANCELLED) {
    return false
  }
  return (reg.pickup_date || '') >= todayISO()
}

export default function PickupHistoryPage() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await registrationService.mine()
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : []
      // Sắp xếp ngày nhận gần nhất lên đầu
      setRegistrations([...list].sort((a, b) => (b.pickup_date || '').localeCompare(a.pickup_date || '')))
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử nhận bằng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleCancel = async () => {
    if (!cancelTarget?._id) return
    try {
      setCancelling(true)
      await registrationService.cancel(cancelTarget._id)
      toast.success('Đã hủy đăng ký nhận bằng.')
      setCancelTarget(null)
      await loadHistory()
    } catch (err) {
      toast.error(err.message || 'Hủy đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        <div className="h-24 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
        <div className="h-64 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <span>Lịch sử nhận bằng</span>
          </h1>
          <p className="text-xs text-slate-500">
            Toàn bộ các lượt đăng ký nhận bằng tốt nghiệp của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadHistory}>
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Làm mới</span>
            </span>
          </Button>
          <Link to="/student/diploma/pickup">
            <Button variant="primary" size="sm">Đăng ký mới</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Danh sách */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-300">
        {registrations.length === 0 ? (
          <div className="p-8 text-center">
            <EmptyState
              icon={CalendarDays}
              title="Chưa có lịch sử đăng ký"
              description="Bạn chưa đăng ký nhận bằng lần nào. Hãy chọn ngày hẹn trong mục Đăng ký nhận."
              action={
                <Link to="/student/diploma/pickup">
                  <Button variant="primary" size="sm">Đăng ký nhận bằng</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ngày nhận</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Buổi nhận</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold text-slate-900">{formatISODate(reg.pickup_date)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-600">{reg.shift_name || 'Theo lịch trường'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge color={STATUS_COLORS[reg.status] || 'info'}>
                        {REGISTRATION_STATUS_LABELS[reg.status] || reg.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isCancellable(reg) ? (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(reg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Hủy đăng ký</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Xác nhận hủy */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Hủy đăng ký nhận bằng"
        message={
          cancelTarget
            ? `Bạn chắc chắn muốn hủy lịch hẹn nhận bằng ngày ${formatISODate(cancelTarget.pickup_date)}? Suất này sẽ được trả lại cho người khác.`
            : ''
        }
        danger
        loading={cancelling}
      />
    </div>
  )
}

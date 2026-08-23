import { useEffect, useState } from 'react'
import { CalendarDays, CalendarPlus, Clock, Users, Info, RefreshCw } from 'lucide-react'
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

// Định dạng ngày 'YYYY-MM-DD' -> hiển thị tiếng Việt (tránh lệch múi giờ)
function formatISODate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return dateStr
  return new Date(y, m - 1, d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function toDateObject(dateStr) {
  const [y, m, d] = (dateStr || '').split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}

export default function PickupRegistrationPage() {
  const [dates, setDates] = useState([])
  const [currentRegistration, setCurrentRegistration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [datesRes, mineRes] = await Promise.allSettled([
        registrationService.availableDates(),
        registrationService.mine(),
      ])

      if (datesRes.status === 'fulfilled') {
        const list = Array.isArray(datesRes.value?.data)
          ? datesRes.value.data
          : Array.isArray(datesRes.value)
            ? datesRes.value
            : []
        setDates(list)
      } else {
        setDates([])
        setError(datesRes.reason?.message || 'Không thể tải lịch phát bằng.')
      }

      if (mineRes.status === 'fulfilled') {
        const mineList = Array.isArray(mineRes.value?.data)
          ? mineRes.value.data
          : Array.isArray(mineRes.value)
            ? mineRes.value
            : []
        // Lịch hẹn hiện tại: bản ghi chưa hủy / chưa hoàn tất gần nhất
        setCurrentRegistration(
          mineList.find((r) => r?.status !== REGISTRATION_STATUS.CANCELLED) || null
        )
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const hasUpcoming = Boolean(currentRegistration)

  const handleSelect = (slot) => {
    if (hasUpcoming) return
    setSelectedDate(slot)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedDate?.date) return
    try {
      setSubmitting(true)
      await registrationService.create({ pickup_date: selectedDate.date })
      toast.success('Đăng ký nhận bằng thành công!')
      setConfirmOpen(false)
      setSelectedDate(null)
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Đăng ký nhận bằng thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        <div className="h-24 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-primary" />
            <span>Đăng ký nhận bằng tốt nghiệp</span>
          </h1>
          <p className="text-xs text-slate-500">
            Chọn một ngày trong lịch phát bằng bên dưới để đặt lịch hẹn nhận bằng của bạn.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </span>
        </Button>
      </div>

      {/* Thông báo đã có lịch hẹn */}
      {hasUpcoming && (
        <div className="p-4 rounded-2xl bg-primary-50 border border-primary-200 flex items-start gap-3 animate-in fade-in duration-200">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-primary">
              Bạn đã có lịch hẹn nhận bằng vào ngày {formatISODate(currentRegistration.pickup_date)}
            </p>
            <p className="text-slate-600">
              Trạng thái:{' '}
              <Badge color={currentRegistration.status === REGISTRATION_STATUS.CONFIRMED ? 'info' : 'warning'}>
                {REGISTRATION_STATUS_LABELS[currentRegistration.status] || currentRegistration.status}
              </Badge>{' '}
              — để đổi lịch, vui lòng{' '}
              <Link to="/student/diploma/history" className="text-primary font-semibold hover:underline">
                hủy đăng ký hiện tại
              </Link>{' '}
              rồi đăng ký lại.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Lưới ngày khả dụng */}
      {dates.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
          <EmptyState
            icon={CalendarDays}
            title="Chưa có lịch phát bằng"
            description="Hiện tại trường chưa mở lịch nhận bằng hoặc các buổi đã đủ số lượng. Vui lòng quay lại kiểm tra sau."
            action={
              <Button variant="primary" size="sm" onClick={loadData}>
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Kiểm tra lại</span>
                </span>
              </Button>
            }
          />
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${hasUpcoming ? 'opacity-60 pointer-events-none' : ''}`}>
          {dates.map((slot) => {
            const dateObj = toDateObject(slot.date)
            const isSelected = selectedDate?.date === slot.date
            return (
              <button
                key={`${slot._id}-${slot.date}`}
                type="button"
                onClick={() => handleSelect(slot)}
                disabled={hasUpcoming}
                className={`text-left p-5 rounded-2xl border bg-white shadow-xs transition-all duration-150 cursor-pointer group ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-slate-200 hover:border-primary-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-primary uppercase tracking-wide">
                      {DAY_OF_WEEK_LABELS[slot.day_of_week] || slot.day_of_week}
                    </p>
                    <p className="text-sm font-black text-slate-900">{formatISODate(slot.date)}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.shift_name || 'Cả ngày'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Còn lại <strong className="text-emerald-700">{slot.remaining_slots ?? '—'}</strong> suất
                    </span>
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Xác nhận đăng ký */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setSelectedDate(null)
        }}
        onConfirm={handleConfirm}
        title="Xác nhận đăng ký nhận bằng"
        message={
          selectedDate
            ? `Bạn muốn đăng ký nhận bằng vào ${DAY_OF_WEEK_LABELS[selectedDate.day_of_week] || ''} ngày ${formatISODate(selectedDate.date)} (${selectedDate.shift_name || 'cả ngày'})?`
            : ''
        }
        loading={submitting}
      />
    </div>
  )
}

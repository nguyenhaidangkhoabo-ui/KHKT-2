import { useEffect, useState, useCallback } from 'react'
import {
  CalendarDays,
  Clock,
  Users,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { scheduleService, registrationService } from '../../services'
import { REGISTRATION_STATUS_LABELS } from '../../config/constants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

// Thứ tự ngày trong lịch phát bằng (tuần bắt đầu từ Thứ Hai)
const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const DAY_LABELS = {
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
  SUNDAY: 'Chủ Nhật',
}

const REGISTRATION_STATUS_COLORS = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function ScheduleCurrentPage() {
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Danh sách đăng ký theo ngày (modal)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [rosterDay, setRosterDay] = useState(null) // { label, date }
  const [rosterRows, setRosterRows] = useState([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [rosterError, setRosterError] = useState('')

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await scheduleService.currentWeek()
      setSchedule(res?.data || null)
    } catch (err) {
      setSchedule(null)
      setError(err.message || 'Không thể tải lịch phát bằng tuần này.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSchedule()
  }, [loadSchedule])

  // Ngày cụ thể của từng ngày trong tuần (tính từ Thứ Hai của tuần hiện tại)
  const monday = getMonday(new Date())
  const daysWithDates = (schedule?.days || [])
    .map((day) => {
      const index = DAY_ORDER.indexOf(day.day_of_week)
      const date = new Date(monday.getTime())
      date.setDate(monday.getDate() + index)
      return { ...day, dateISO: toISODate(date), dateLabel: date.toLocaleDateString('vi-VN') }
    })
    .sort((a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week))

  const openRoster = async (day) => {
    setRosterDay(day)
    setRosterOpen(true)
    setRosterRows([])
    setRosterError('')
    try {
      setRosterLoading(true)
      const res = await registrationService.byDate(day.dateISO)
      setRosterRows(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      setRosterError(err.message || 'Không thể tải danh sách đăng ký.')
    } finally {
      setRosterLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 font-sans">
        <div className="h-32 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 font-sans">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
          <EmptyState
            icon={CalendarDays}
            title="Chưa có lịch phát bằng cho tuần này"
            description='Lịch tuần được sinh tự động khi quản trị viên nhấn "Sinh lịch tuần sau" ở mục "Cấu hình lịch". Vui lòng kiểm tra lại vào tuần kế tiếp.'
          />
          <div className="flex justify-center pb-2">
            <Button variant="outline" size="sm" onClick={loadSchedule}>
              <RefreshCw className="w-4 h-4" />
              <span>Tải lại</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const weekStartLabel = monday.toLocaleDateString('vi-VN')
  const weekEndDate = new Date(monday.getTime())
  weekEndDate.setDate(monday.getDate() + 6)

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <span>Lịch nhận bằng — tuần này</span>
          </h1>
          <p className="text-xs text-slate-500">
            Tuần {schedule.year_week} · {weekStartLabel} → {weekEndDate.toLocaleDateString('vi-VN')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSchedule}>
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Lưới ngày trong tuần */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
        {daysWithDates.map((day) => {
          const isFull = day.registered_count >= day.capacity
          return (
            <div
              key={day.day_of_week}
              className={`
                p-5 rounded-2xl bg-white border shadow-xs space-y-3 transition-all
                ${day.enabled ? 'border-slate-200/90' : 'border-slate-100 opacity-70'}
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-slate-900">{DAY_LABELS[day.day_of_week]}</p>
                  <p className="text-[11px] text-slate-400">{day.dateLabel}</p>
                </div>
                {day.enabled ? (
                  <Badge color="success">Đang mở</Badge>
                ) : (
                  <Badge color="slate">Đóng</Badge>
                )}
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-500">
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {day.start_time} - {day.end_time}
                </p>
                <p className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className={isFull ? 'font-bold text-accent' : 'font-bold text-slate-700'}>
                    {day.registered_count}/{day.capacity}
                  </span>
                  lượt đăng ký
                </p>
              </div>

              {/* Thanh tiến độ sức chứa */}
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isFull ? 'bg-accent' : 'bg-primary'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((day.registered_count / Math.max(1, day.capacity)) * 100))}%`,
                  }}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => openRoster(day)}
                disabled={!day.enabled && day.registered_count === 0}
              >
                <Eye className="w-4 h-4" />
                <span>Xem danh sách</span>
              </Button>
            </div>
          )
        })}
      </div>

      {/* Modal danh sách đăng ký theo ngày */}
      <Modal
        isOpen={rosterOpen}
        onClose={() => setRosterOpen(false)}
        title={
          rosterDay
            ? `Danh sách nhận bằng — ${DAY_LABELS[rosterDay.day_of_week] || ''}, ${rosterDay.dateLabel}`
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
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã xác nhận / hoàn tất
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-accent" /> Đã hủy
                  </span>
                </span>
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

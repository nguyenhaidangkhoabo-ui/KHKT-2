import { useEffect, useState, useCallback } from 'react'
import {
  CalendarDays,
  Settings,
  RefreshCw,
  Sparkles,
  Save,
  Users,
} from 'lucide-react'
import { scheduleService } from '../../services'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
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

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function buildDayForms(days = []) {
  const forms = {}
  for (const day of days) {
    forms[day.day_of_week] = {
      enabled: Boolean(day.enabled),
      start_time: day.start_time || '07:30',
      end_time: day.end_time || '17:00',
      capacity: String(day.capacity ?? 100),
    }
  }
  return forms
}

export default function ScheduleNextWeekPage() {
  const [schedule, setSchedule] = useState(null)
  const [forms, setForms] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Lỗi theo từng ngày (hiển thị ngay trên thẻ cấu hình)
  const [dayErrors, setDayErrors] = useState({})
  const [savingDays, setSavingDays] = useState({})

  // Xác nhận sinh lịch tuần sau
  const [generateOpen, setGenerateOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await scheduleService.nextWeek()
      const data = res?.data || null
      setSchedule(data)
      setForms(buildDayForms(data?.days || []))
      setDayErrors({})
    } catch (err) {
      setSchedule(null)
      setError(err.message || 'Không thể tải lịch tuần sau.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSchedule()
  }, [loadSchedule])

  // ===== Sinh lịch tuần sau =====
  const handleGenerate = async () => {
    try {
      setGenerating(true)
      await scheduleService.generateNextWeek({})
      toast.success('Đã sinh lịch phát bằng cho tuần sau!')
      setGenerateOpen(false)
      await loadSchedule()
    } catch (err) {
      toast.error(err.message || 'Sinh lịch tuần sau thất bại.')
    } finally {
      setGenerating(false)
    }
  }

  // ===== Cập nhật cấu hình một ngày =====
  const updateForm = (dayOfWeek, patch) => {
    setForms((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], ...patch },
    }))
    setDayErrors((prev) => ({ ...prev, [dayOfWeek]: '' }))
  }

  const handleSaveDay = async (dayOfWeek) => {
    const original = schedule?.days?.find((d) => d.day_of_week === dayOfWeek)
    const form = forms[dayOfWeek]
    if (!original || !form) return

    // Chỉ gửi các trường thực sự thay đổi (backend yêu cầu ít nhất một trường)
    const payload = {}
    if (form.enabled !== Boolean(original.enabled)) payload.enabled = form.enabled
    if (form.start_time !== original.start_time) payload.start_time = form.start_time
    if (form.end_time !== original.end_time) payload.end_time = form.end_time
    const capacityNumber = Number(form.capacity)
    if (!Number.isInteger(capacityNumber) || capacityNumber < 1) {
      setDayErrors((prev) => ({ ...prev, [dayOfWeek]: 'Sức chứa phải là số nguyên lớn hơn 0.' }))
      return
    }
    if (capacityNumber !== original.capacity) payload.capacity = capacityNumber

    if (Object.keys(payload).length === 0) {
      toast.info('Chưa có thay đổi nào để lưu.')
      return
    }

    try {
      setSavingDays((prev) => ({ ...prev, [dayOfWeek]: true }))
      await scheduleService.updateDay(dayOfWeek, payload)
      toast.success(`Đã lưu cấu hình ngày ${DAY_LABELS[dayOfWeek]}.`)
      await loadSchedule()
    } catch (err) {
      setDayErrors((prev) => ({ ...prev, [dayOfWeek]: err.message || 'Lưu cấu hình thất bại.' }))
    } finally {
      setSavingDays((prev) => ({ ...prev, [dayOfWeek]: false }))
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 font-sans">
        <div className="h-32 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <EmptyState
            icon={CalendarDays}
            title="Chưa có lịch phát bằng cho tuần sau"
            description='Nhấn "Sinh lịch tuần sau" để tạo khung lịch mặc định (Thứ Hai → Thứ Sáu, 07:30 - 17:00, sức chứa 100 lượt/ngày), sau đó tùy chỉnh từng ngày.'
            action={
              <Button variant="primary" size="sm" onClick={() => setGenerateOpen(true)}>
                <Sparkles className="w-4 h-4" />
                <span>Sinh lịch tuần sau</span>
              </Button>
            }
          />
        </div>

        <ConfirmDialog
          isOpen={generateOpen}
          onClose={() => setGenerateOpen(false)}
          onConfirm={handleGenerate}
          loading={generating}
          title="Sinh lịch tuần sau"
          message="Tạo khung lịch phát bằng cho tuần kế tiếp với cấu hình mặc định? Bạn có thể chỉnh sửa chi tiết từng ngày sau khi tạo."
          confirmText="Sinh lịch"
        />
      </div>
    )
  }

  const monday = getMonday(new Date())
  monday.setDate(monday.getDate() + 7)
  const weekEndDate = new Date(monday.getTime())
  weekEndDate.setDate(monday.getDate() + 6)

  const sortedDays = [...(schedule.days || [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>Cấu hình lịch tuần sau</span>
          </h1>
          <p className="text-xs text-slate-500">
            Tuần {schedule.year_week} · {monday.toLocaleDateString('vi-VN')} →{' '}
            {weekEndDate.toLocaleDateString('vi-VN')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSchedule}>
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Lưu ý nghiệp vụ */}
      <div className="p-4 rounded-2xl bg-primary-50 border border-primary-100 text-xs text-primary-800 leading-relaxed">
        Không thể tắt một ngày hoặc giảm sức chứa xuống dưới số lượt{' '}
        <strong>đã có đăng ký</strong>. Hệ thống sẽ từ chối và hiển thị lỗi ngay trên thẻ ngày đó.
      </div>

      {/* Thẻ cấu hình từng ngày */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
        {sortedDays.map((day) => {
          const form = forms[day.day_of_week]
          if (!form) return null
          const hasRegistrations = day.registered_count > 0

          return (
            <div
              key={day.day_of_week}
              className={`
                p-5 rounded-2xl bg-white border shadow-xs space-y-4 transition-all
                ${form.enabled ? 'border-slate-200/90' : 'border-slate-100 opacity-80'}
              `}
            >
              {/* Đầu thẻ */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-slate-900">{DAY_LABELS[day.day_of_week]}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3" />
                    {day.registered_count}/{form.capacity || day.capacity} lượt đăng ký
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) => updateForm(day.day_of_week, { enabled: e.target.checked })}
                    disabled={hasRegistrations && form.enabled}
                    className="w-4 h-4 rounded border-slate-300 accent-[#295483] cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="text-[11px] font-bold text-slate-600">
                    {form.enabled ? 'Mở nhận' : 'Đóng'}
                  </span>
                </label>
              </div>

              {hasRegistrations && (
                <Badge color="info">Đã có đăng ký — không thể tắt ngày này</Badge>
              )}

              {/* Giờ nhận */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Bắt đầu
                  </label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => updateForm(day.day_of_week, { start_time: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Kết thúc
                  </label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => updateForm(day.day_of_week, { end_time: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Sức chứa */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Sức chứa (lượt/ngày)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => updateForm(day.day_of_week, { capacity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                />
              </div>

              {/* Lỗi của ngày */}
              {dayErrors[day.day_of_week] && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium animate-in fade-in duration-200">
                  {dayErrors[day.day_of_week]}
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => handleSaveDay(day.day_of_week)}
                loading={Boolean(savingDays[day.day_of_week])}
              >
                <Save className="w-4 h-4" />
                <span>Lưu ngày này</span>
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

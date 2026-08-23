import { useEffect, useState } from 'react'
import { Award, GraduationCap, PackageCheck, Clock, CheckCircle2, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { diplomaService } from '../../services'
import {
  DIPLOMA_STATUS,
  DIPLOMA_STATUS_LABELS,
  DIPLOMA_STATUS_COLORS,
} from '../../config/constants'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

// Cấu hình hero card theo trạng thái bằng tốt nghiệp
const STATUS_HERO = {
  [DIPLOMA_STATUS.STORED]: {
    icon: PackageCheck,
    wrapper: 'bg-emerald-50 border-emerald-200',
    iconBox: 'bg-emerald-600 text-white',
    title: 'Bằng tốt nghiệp của bạn đã sẵn sàng!',
    description: 'Bằng đã về trường và đang được lưu trữ an toàn. Hãy đặt lịch hẹn để đến nhận bằng.',
  },
  [DIPLOMA_STATUS.NOT_STORED]: {
    icon: Clock,
    wrapper: 'bg-amber-50 border-amber-200',
    iconBox: 'bg-amber-500 text-white',
    title: 'Bằng tốt nghiệp chưa về trường',
    description: 'Bằng của bạn chưa được trường tiếp nhận. Vui lòng quay lại kiểm tra sau.',
  },
  [DIPLOMA_STATUS.HANDED_OVER]: {
    icon: CheckCircle2,
    wrapper: 'bg-primary-50 border-primary-200',
    iconBox: 'bg-primary text-white',
    title: 'Bằng tốt nghiệp đã được trao',
    description: 'Bạn đã nhận bằng tốt nghiệp thành công tại trường.',
  },
}

export default function MyDiplomaPage() {
  const [diploma, setDiploma] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDiploma = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await diplomaService.mine()
      setDiploma(res?.data ?? null)
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin văn bằng. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiploma()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleString('vi-VN')
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 font-sans">
        <div className="h-44 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
        <div className="h-64 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto font-sans">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-center">
          <EmptyState
            icon={Award}
            title="Không thể tải văn bằng"
            description={error}
            action={
              <button
                type="button"
                onClick={loadDiploma}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thử lại</span>
              </button>
            }
          />
        </div>
      </div>
    )
  }

  const hero = diploma
    ? STATUS_HERO[diploma.status] || {
        icon: Award,
        wrapper: 'bg-slate-50 border-slate-200',
        iconBox: 'bg-slate-600 text-white',
        title: 'Thông tin văn bằng',
        description: 'Trạng thái văn bằng của bạn đang được cập nhật.',
      }
    : null
  const HeroIcon = hero?.icon || Award

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Hero trạng thái */}
      {diploma && hero ? (
        <div className={`p-6 sm:p-8 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5 animate-in fade-in duration-300 ${hero.wrapper}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${hero.iconBox}`}>
            <HeroIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{hero.title}</h1>
              <Badge color={DIPLOMA_STATUS_COLORS[diploma.status] || 'info'}>
                {DIPLOMA_STATUS_LABELS[diploma.status] || diploma.status}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">{hero.description}</p>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
          <EmptyState
            icon={Award}
            title="Chưa có văn bằng trong hệ thống"
            description="Hiện tại bạn chưa có bằng tốt nghiệp nào được ghi nhận. Vui lòng liên hệ văn thư nhà trường nếu cho rằng đây là nhầm lẫn."
          />
        </div>
      )}

      {/* Chi tiết văn bằng */}
      {diploma && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span>Thông tin văn bằng</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Số hiệu bằng</span>
              <p className="text-sm font-bold text-slate-900 font-mono">{diploma.diploma_number || 'Chưa cấp số'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Trạng thái</span>
              <Badge color={DIPLOMA_STATUS_COLORS[diploma.status] || 'info'}>
                {DIPLOMA_STATUS_LABELS[diploma.status] || diploma.status}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Họ và tên</span>
              <p className="text-sm font-semibold text-slate-800">{diploma.full_name || '—'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Mã học sinh</span>
              <p className="text-sm font-semibold text-slate-800 font-mono">{diploma.student_code || '—'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Năm tốt nghiệp</span>
              <p className="text-sm font-semibold text-slate-800">{diploma.graduation_academic_year || '—'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Cập nhật gần nhất</span>
              <p className="text-sm font-semibold text-slate-800">{formatDate(diploma.updated_at)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hướng dẫn nhận bằng */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-3">
        <h2 className="text-base font-bold text-slate-900">Hướng dẫn nhận bằng</h2>
        <ol className="space-y-2.5 text-xs text-slate-600 list-decimal list-inside">
          <li>Kiểm tra trạng thái bằng ở phần trên — chỉ khi bằng <strong>"Đã về trường"</strong> bạn mới có thể đăng ký nhận.</li>
          <li>Vào mục <Link to="/student/diploma/pickup" className="text-primary font-semibold hover:underline">Đăng ký nhận</Link>, chọn ngày hẹn phù hợp trong lịch phát bằng của trường.</li>
          <li>Mang theo giấy tờ tùy thân (CCCD / thẻ học sinh) khi đến nhận bằng vào ngày đã hẹn.</li>
          <li>Nếu cần thay đổi lịch hẹn, hãy hủy đăng ký hiện tại trong <Link to="/student/diploma/history" className="text-primary font-semibold hover:underline">Lịch sử nhận</Link> rồi đăng ký lại.</li>
        </ol>
      </div>
    </div>
  )
}

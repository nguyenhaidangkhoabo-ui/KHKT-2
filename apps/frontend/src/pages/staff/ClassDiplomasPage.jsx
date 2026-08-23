import { useEffect, useState } from 'react'
import { Award, PackageCheck, PackageOpen, Clock, UserX, Users } from 'lucide-react'
import { teacherService } from '../../services'
import {
  DIPLOMA_STATUS,
  DIPLOMA_STATUS_LABELS,
  DIPLOMA_STATUS_COLORS,
} from '../../config/constants'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'

// Nhãn / màu bổ sung cho học sinh chưa có bằng trong hệ thống
const NO_DIPLOMA = 'NO_DIPLOMA'
const STATUS_LABELS = {
  ...DIPLOMA_STATUS_LABELS,
  [NO_DIPLOMA]: 'Chưa có bằng',
}
const STATUS_COLORS = {
  ...DIPLOMA_STATUS_COLORS,
  [NO_DIPLOMA]: 'danger',
}

function normalizeResponse(res) {
  const d = res?.data ?? res
  if (Array.isArray(d)) return { className: '', rows: d }
  if (d && typeof d === 'object') {
    const rows =
      (Array.isArray(d.diplomas) && d.diplomas) ||
      (Array.isArray(d.items) && d.items) ||
      (Array.isArray(d.students) && d.students) ||
      []
    return { className: d.class_name || '', rows }
  }
  return { className: '', rows: [] }
}

export default function ClassDiplomasPage() {
  const [rows, setRows] = useState([])
  const [className, setClassName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    async function loadDiplomas() {
      try {
        setLoading(true)
        setError('')
        const res = await teacherService.myClassDiplomas()
        if (!isActive) return
        const normalized = normalizeResponse(res)
        setRows(normalized.rows)
        setClassName(normalized.className)
      } catch (err) {
        if (isActive) {
          setError(err.message || 'Không thể tải danh sách văn bằng của lớp.')
          setRows([])
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }
    loadDiplomas()
    return () => {
      isActive = false
    }
  }, [])

  const countByStatus = (status) =>
    rows.filter((r) => (r.status || NO_DIPLOMA) === status).length

  const summary = [
    {
      label: 'Học sinh lớp chủ nhiệm',
      value: rows.length,
      icon: Users,
      color: 'text-primary bg-primary-50 border-primary-200',
    },
    {
      label: 'Đã trao bằng',
      value: countByStatus(DIPLOMA_STATUS.HANDED_OVER),
      icon: PackageCheck,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Đã về trường',
      value: countByStatus(DIPLOMA_STATUS.STORED),
      icon: PackageOpen,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    {
      label: 'Chưa về / chưa có bằng',
      value:
        countByStatus(DIPLOMA_STATUS.NOT_STORED) + countByStatus(NO_DIPLOMA),
      icon: Clock,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
  ]

  const columns = [
    {
      key: 'student_code',
      header: 'Mã học sinh',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {row.student_code || '—'}
        </span>
      ),
    },
    {
      key: 'student_name',
      header: 'Họ và tên',
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.student_name || row.full_name || '—'}
        </span>
      ),
    },
    {
      key: 'diploma_number',
      header: 'Số hiệu bằng',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.diploma_number || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái văn bằng',
      render: (row) => {
        const status = row.status || NO_DIPLOMA
        return (
          <Badge color={STATUS_COLORS[status] || 'info'}>
            {STATUS_LABELS[status] || status}
          </Badge>
        )
      },
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <span>Văn bằng lớp chủ nhiệm</span>
        </h1>
        <p className="text-xs text-slate-500">
          Tình trạng bằng tốt nghiệp của học sinh lớp{' '}
          <strong className="text-slate-800">{className || 'chủ nhiệm'}</strong>. Dùng để theo dõi và nhắc học sinh đăng ký nhận bằng.
        </p>
      </div>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((st, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{st.label}</span>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${st.color}`}>
                <st.icon className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black text-slate-900 ${loading ? 'animate-pulse' : ''}`}>
              {typeof st.value === 'number' ? st.value.toLocaleString('vi-VN') : '—'}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bảng văn bằng */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
        <h2 className="text-sm font-bold text-slate-900">Chi tiết theo học sinh</h2>

        {!loading && rows.length === 0 && !error ? (
          <EmptyState
            icon={UserX}
            title="Không có dữ liệu văn bằng"
            description="Lớp chủ nhiệm chưa có học sinh hoặc chưa được cập nhật văn bằng nào."
          />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={loading}
            rowKey={(row) => String(row.student_id || row._id || row.student_code || '')}
          />
        )}
      </div>
    </div>
  )
}

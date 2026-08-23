import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  GraduationCap,
  History,
  School,
  Pencil,
  Phone,
  Mail,
  CalendarDays,
  IdCard,
} from 'lucide-react'
import { studentService, studentClassService, classYearService } from '../../services'
import {
  ACADEMIC_STATUS_LABELS,
  ACADEMIC_STATUS_COLORS,
  GENDER_LABELS,
  GRADE_LABELS,
  USER_STATUS_LABELS,
} from '../../config/constants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

const EMPTY_FORM = {
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

function formatDate(dateStr) {
  if (!dateStr) return 'Chưa cập nhật'
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN')
  } catch {
    return dateStr
  }
}

export default function StudentDetailPage() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [history, setHistory] = useState([])
  const [classYears, setClassYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form xếp lớp
  const [assignClassId, setAssignClassId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState('')

  // Modal chỉnh sửa hồ sơ
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadDetail = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError('')
      const [studentRes, historyRes] = await Promise.allSettled([
        studentService.getById(id),
        studentService.academicHistory(id),
      ])

      if (studentRes.status === 'fulfilled') {
        setStudent(studentRes.value?.data || null)
      } else {
        setError(studentRes.reason?.message || 'Không thể tải hồ sơ học sinh.')
        setStudent(null)
      }

      if (historyRes.status === 'fulfilled') {
        const list = Array.isArray(historyRes.value?.data) ? historyRes.value.data : []
        // Sắp xếp năm học mới nhất lên đầu
        list.sort((a, b) => {
          const ya = a.class_academic_year_id?.academic_year_id?.start_year || 0
          const yb = b.class_academic_year_id?.academic_year_id?.start_year || 0
          return yb - ya
        })
        setHistory(list)
      } else {
        setHistory([])
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  // Danh sách lớp-năm học phục vụ xếp lớp
  useEffect(() => {
    let isActive = true
    async function loadClassYears() {
      try {
        const res = await classYearService.list()
        if (!isActive) return
        const list = Array.isArray(res?.data) ? res.data : []
        // Ưu tiên các lớp của năm học hiện tại lên đầu
        list.sort((a, b) => {
          const ca = a.academic_year_id?.is_current ? 1 : 0
          const cb = b.academic_year_id?.is_current ? 1 : 0
          if (ca !== cb) return cb - ca
          return (b.academic_year_id?.start_year || 0) - (a.academic_year_id?.start_year || 0)
        })
        setClassYears(list)
      } catch {
        if (isActive) setClassYears([])
      }
    }
    loadClassYears()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const openEdit = () => {
    if (!student) return
    setForm({
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
    setEditOpen(true)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.student_code.trim() || !form.full_name.trim()) {
      setFormError('Vui lòng nhập đầy đủ mã học sinh và họ tên.')
      return
    }
    try {
      setSubmitting(true)
      await studentService.update(id, {
        student_code: form.student_code.trim(),
        full_name: form.full_name.trim(),
        birthdate: form.birthdate,
        gender: form.gender,
        email: form.email.trim(),
        phone: form.phone.trim(),
        father_phone: form.father_phone.trim(),
        mother_phone: form.mother_phone.trim(),
        enrollment_year: Number(form.enrollment_year) || undefined,
      })
      toast.success('Cập nhật hồ sơ học sinh thành công!')
      setEditOpen(false)
      await loadDetail()
    } catch (err) {
      setFormError(err.message || 'Không thể cập nhật hồ sơ.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssignClass = async (e) => {
    e.preventDefault()
    setAssignError('')
    if (!assignClassId) {
      setAssignError('Vui lòng chọn lớp cần xếp.')
      return
    }
    try {
      setAssigning(true)
      await studentClassService.assign({
        class_academic_year_id: assignClassId,
        student_id: id,
      })
      toast.success('Xếp lớp cho học sinh thành công!')
      setAssignClassId('')
      await loadDetail()
    } catch (err) {
      setAssignError(err.message || 'Xếp lớp thất bại. Học sinh có thể đã thuộc lớp này.')
    } finally {
      setAssigning(false)
    }
  }

  const initials = (student?.full_name || 'HS').slice(0, 2).toUpperCase()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        <div className="h-40 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
        <div className="h-64 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
          <EmptyState
            icon={User}
            title="Không tìm thấy học sinh"
            description="Hồ sơ này không tồn tại hoặc đã bị xóa khỏi hệ thống."
            action={
              <Link to="/admin/students">
                <Button variant="primary" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại danh sách</span>
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Điều hướng quay lại */}
      <div>
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách học sinh</span>
        </Link>
      </div>

      {/* Thẻ hồ sơ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-primary text-white font-extrabold text-2xl flex items-center justify-center shadow-primary shadow-sm shrink-0">
            {initials}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{student.full_name}</h1>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{student.student_code}</p>
              </div>
              <Button variant="outline" size="sm" onClick={openEdit}>
                <Pencil className="w-4 h-4" />
                <span>Sửa hồ sơ</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge color={ACADEMIC_STATUS_COLORS[student.academic_status] || 'info'}>
                {ACADEMIC_STATUS_LABELS[student.academic_status] || student.academic_status}
              </Badge>
              <Badge color={student.status === 'ACTIVE' ? 'success' : 'danger'}>
                {USER_STATUS_LABELS[student.status] || student.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Lưới thông tin chi tiết */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Ngày sinh
            </span>
            <p className="text-sm font-semibold text-slate-800">{formatDate(student.birthdate)}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium">Giới tính</span>
            <p className="text-sm font-semibold text-slate-800">
              {GENDER_LABELS[student.gender] || student.gender || 'Chưa cập nhật'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </span>
            <p className="text-sm font-semibold text-slate-800 truncate">{student.email || 'Chưa cập nhật'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Số điện thoại
            </span>
            <p className="text-sm font-semibold text-slate-800">{student.phone || 'Chưa cập nhật'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium">Số điện thoại phụ huynh</span>
            <p className="text-sm font-semibold text-slate-800">
              {student.father_phone ? `Cha: ${student.father_phone}` : ''}
              {student.father_phone && student.mother_phone ? ' | ' : ''}
              {student.mother_phone ? `Mẹ: ${student.mother_phone}` : ''}
              {!student.father_phone && !student.mother_phone ? 'Chưa cập nhật' : ''}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5" /> Năm nhập học
            </span>
            <p className="text-sm font-semibold text-slate-800">{student.enrollment_year || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>

      {/* Lịch sử học vụ (timeline) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-slate-900">Lịch sử học vụ</h2>
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Chưa có lịch sử học vụ"
            description="Học sinh chưa được xếp vào lớp nào. Sử dụng biểu mẫu bên dưới để xếp lớp."
          />
        ) : (
          <ol className="relative border-l-2 border-slate-100 ml-3 space-y-6">
            {history.map((item) => {
              const classYear = item.class_academic_year_id
              const year = classYear?.academic_year_id
              const cls = classYear?.class_id
              return (
                <li key={item._id} className="ml-6 animate-in fade-in duration-300">
                  <span className="absolute -left-[9px] w-4 h-4 rounded-full bg-primary border-4 border-primary-100" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary uppercase tracking-wide">
                      Năm học {year ? `${year.start_year} - ${year.end_year}` : '—'}
                      {year?.is_current ? ' (hiện tại)' : ''}
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      Lớp {cls?.name || '—'}
                      <span className="ml-2 text-[11px] font-semibold text-slate-400">
                        {GRADE_LABELS[cls?.grade] || cls?.grade || ''}
                      </span>
                    </p>
                    {classYear?.homeroom_staff_id?.full_name && (
                      <p className="text-[11px] text-slate-500">
                        Chủ nhiệm: {classYear.homeroom_staff_id.full_name}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      {/* Xếp lớp */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <School className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-slate-900">Xếp lớp cho học sinh</h2>
        </div>

        <form onSubmit={handleAssignClass} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chọn lớp (theo năm học) <span className="text-accent">*</span>
            </label>
            <select
              value={assignClassId}
              onChange={(e) => setAssignClassId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">— Chọn lớp —</option>
              {classYears.map((cy) => (
                <option key={cy._id} value={cy._id}>
                  {cy.class_id?.name || 'Lớp'} — Năm học{' '}
                  {cy.academic_year_id
                    ? `${cy.academic_year_id.start_year} - ${cy.academic_year_id.end_year}`
                    : ''}
                  {cy.academic_year_id?.is_current ? ' (hiện tại)' : ''}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="md" type="submit" loading={assigning}>
            Xếp vào lớp
          </Button>
        </form>

        {assignError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
            {assignError}
          </div>
        )}
      </div>

      {/* Modal chỉnh sửa hồ sơ */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Cập nhật hồ sơ học sinh" size="lg">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã học sinh <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={form.student_code}
                onChange={(e) => setForm((f) => ({ ...f, student_code: e.target.value }))}
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
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ngày sinh</label>
              <input
                type="date"
                value={form.birthdate}
                onChange={(e) => setForm((f) => ({ ...f, birthdate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Giới tính</label>
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số điện thoại cha</label>
              <input
                type="tel"
                value={form.father_phone}
                onChange={(e) => setForm((f) => ({ ...f, father_phone: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số điện thoại mẹ</label>
              <input
                type="tel"
                value={form.mother_phone}
                onChange={(e) => setForm((f) => ({ ...f, mother_phone: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Năm nhập học</label>
              <input
                type="number"
                min="1990"
                max="2100"
                value={form.enrollment_year}
                onChange={(e) => setForm((f) => ({ ...f, enrollment_year: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(false)} disabled={submitting}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

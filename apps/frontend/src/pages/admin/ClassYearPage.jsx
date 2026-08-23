import { useEffect, useState, useCallback, useMemo } from 'react'
import { CalendarDays, Plus, Trash2, UserCheck, RefreshCw } from 'lucide-react'
import { classYearService, classService, yearService, staffService } from '../../services'
import { GRADE_LABELS } from '../../config/constants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

export default function ClassYearPage() {
  const [years, setYears] = useState([])
  const [classes, setClasses] = useState([])
  const [staffList, setStaffList] = useState([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ academic_year_id: '', class_id: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [homeroomTarget, setHomeroomTarget] = useState(null)
  const [homeroomStaffId, setHomeroomStaffId] = useState('')
  const [homeroomError, setHomeroomError] = useState('')
  const [assigning, setAssigning] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Tải danh mục dùng chung: năm học, lớp gốc, cán bộ
  useEffect(() => {
    let isActive = true
    async function loadMeta() {
      try {
        setLoading(true)
        setError('')
        const [yearsRes, classesRes, staffRes] = await Promise.allSettled([
          yearService.list(),
          classService.list(),
          staffService.list(),
        ])

        if (!isActive) return

        const yearList = yearsRes.status === 'fulfilled' && Array.isArray(yearsRes.value?.data)
          ? [...yearsRes.value.data].sort((a, b) => (b.start_year || 0) - (a.start_year || 0))
          : []
        setYears(yearList)
        if (yearList.length > 0) {
          const current = yearList.find((y) => y.is_current) || yearList[0]
          setSelectedYearId(current._id)
        }

        setClasses(
          classesRes.status === 'fulfilled' && Array.isArray(classesRes.value?.data)
            ? classesRes.value.data
            : []
        )
        setStaffList(
          staffRes.status === 'fulfilled' && Array.isArray(staffRes.value?.data)
            ? staffRes.value.data
            : []
        )
      } catch (err) {
        if (isActive) setError(err.message || 'Không thể tải dữ liệu danh mục.')
      } finally {
        if (isActive) setLoading(false)
      }
    }
    loadMeta()
    return () => {
      isActive = false
    }
  }, [])

  // Tải lớp-năm học và lọc theo năm được chọn (backend trả về toàn bộ, đã populate)
  const loadClassYears = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await classYearService.list()
      const list = Array.isArray(res?.data) ? res.data : []
      setRows(list)
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách lớp theo năm học.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClassYears()
  }, [loadClassYears])

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) => !selectedYearId || String(r.academic_year_id?._id || r.academic_year_id) === String(selectedYearId)
      ),
    [rows, selectedYearId]
  )

  // Lớp chưa được mở trong năm đang chọn (chỉ cho phép chọn các lớp này khi tạo mới)
  const availableClasses = useMemo(() => {
    const usedIds = new Set(
      rows
        .filter((r) => String(r.academic_year_id?._id || r.academic_year_id) === String(selectedYearId))
        .map((r) => String(r.class_id?._id || r.class_id))
    )
    return classes.filter((c) => !usedIds.has(String(c._id)))
  }, [rows, classes, selectedYearId])

  const openCreate = () => {
    setCreateForm({ academic_year_id: selectedYearId, class_id: '' })
    setFormError('')
    setCreateOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!createForm.academic_year_id) {
      setFormError('Vui lòng chọn năm học.')
      return
    }
    if (!createForm.class_id) {
      setFormError('Vui lòng chọn lớp học.')
      return
    }
    try {
      setSubmitting(true)
      await classYearService.create({
        academic_year_id: createForm.academic_year_id,
        class_id: createForm.class_id,
      })
      toast.success('Mở lớp cho năm học thành công!')
      setCreateOpen(false)
      await loadClassYears()
    } catch (err) {
      setFormError(err.message || 'Không thể mở lớp. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const openHomeroom = (row) => {
    setHomeroomTarget(row)
    setHomeroomStaffId(row.homeroom_staff_id?._id || '')
    setHomeroomError('')
  }

  const handleAssignHomeroom = async () => {
    if (!homeroomTarget) return
    if (!homeroomStaffId) {
      setHomeroomError('Vui lòng chọn giáo viên chủ nhiệm.')
      return
    }
    try {
      setAssigning(true)
      await classYearService.assignHomeroom(homeroomTarget._id, {
        homeroom_staff_id: homeroomStaffId,
      })
      toast.success('Phân công giáo viên chủ nhiệm thành công!')
      setHomeroomTarget(null)
      await loadClassYears()
    } catch (err) {
      setHomeroomError(err.message || 'Phân công chủ nhiệm thất bại.')
    } finally {
      setAssigning(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await classYearService.remove(deleteTarget._id)
      toast.success('Xóa lớp-năm học thành công!')
      setDeleteTarget(null)
      await loadClassYears()
    } catch (err) {
      toast.error(err.message || 'Xóa lớp-năm học thất bại.')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'class',
      header: 'Lớp',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900">{row.class_id?.name || '—'}</span>
          <p className="text-[11px] text-slate-400">
            {GRADE_LABELS[row.class_id?.grade] || row.class_id?.grade || ''}
          </p>
        </div>
      ),
    },
    {
      key: 'year',
      header: 'Năm học',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.academic_year_id
            ? `${row.academic_year_id.start_year} - ${row.academic_year_id.end_year}`
            : '—'}
          {row.academic_year_id?.is_current && (
            <Badge color="success">
              <span className="ml-1">Hiện tại</span>
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: 'homeroom',
      header: 'Giáo viên chủ nhiệm',
      render: (row) =>
        row.homeroom_staff_id ? (
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-800">
              {row.homeroom_staff_id.full_name}
            </span>
            <p className="text-[11px] text-slate-400 font-mono">
              {row.homeroom_staff_id.staff_code}
            </p>
          </div>
        ) : (
          <Badge color="warning">Chưa phân công</Badge>
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
            onClick={() => openHomeroom(row)}
            title="Phân công chủ nhiệm"
            className="p-1.5 rounded-lg text-primary hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            title="Xóa lớp-năm học"
            className="p-1.5 rounded-lg text-accent hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <span>Lớp theo năm học</span>
          </h1>
          <p className="text-xs text-slate-500">
            Mở lớp và phân công giáo viên chủ nhiệm cho từng năm học.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={loadClassYears}>
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate} disabled={!selectedYearId}>
            <Plus className="w-4 h-4" />
            <span>Mở lớp mới</span>
          </Button>
        </div>
      </div>

      {/* Bộ lọc theo năm học */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-wrap items-end gap-4">
        <div className="min-w-[220px]">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Năm học</label>
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            {years.map((y) => (
              <option key={y._id} value={y._id}>
                {y.start_year} - {y.end_year}
                {y.is_current ? ' (hiện tại)' : ''}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[11px] text-slate-500 pb-3">
          Đang hiển thị <strong className="text-slate-800">{filteredRows.length}</strong> lớp
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bảng lớp-năm học */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
        {!loading && filteredRows.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Năm học chưa có lớp nào"
            description="Nhấn 'Mở lớp mới' để thêm lớp vào năm học này."
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredRows}
            loading={loading}
            rowKey="_id"
            emptyMessage="Chưa có dữ liệu"
          />
        )}
      </div>

      {/* Modal mở lớp mới */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Mở lớp cho năm học" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Năm học <span className="text-accent">*</span>
            </label>
            <select
              value={createForm.academic_year_id}
              onChange={(e) => setCreateForm((f) => ({ ...f, academic_year_id: e.target.value }))}
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
              Lớp học <span className="text-accent">*</span>
            </label>
            <select
              value={createForm.class_id}
              onChange={(e) => setCreateForm((f) => ({ ...f, class_id: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              required
            >
              <option value="">— Chọn lớp —</option>
              {availableClasses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({GRADE_LABELS[c.grade] || c.grade})
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Chỉ hiển thị các lớp chưa được mở trong năm học đã chọn.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Mở lớp
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal phân công chủ nhiệm */}
      <Modal
        isOpen={Boolean(homeroomTarget)}
        onClose={() => setHomeroomTarget(null)}
        title="Phân công giáo viên chủ nhiệm"
        size="md"
      >
        <div className="space-y-4">
          {homeroomError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
              {homeroomError}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <p>
              Lớp: <strong className="text-slate-900">{homeroomTarget?.class_id?.name}</strong>
              {' — '}
              Năm học:{' '}
              <strong className="text-slate-900">
                {homeroomTarget?.academic_year_id
                  ? `${homeroomTarget.academic_year_id.start_year} - ${homeroomTarget.academic_year_id.end_year}`
                  : '—'}
              </strong>
            </p>
            {homeroomTarget?.homeroom_staff_id && (
              <p className="text-slate-500">
                Chủ nhiệm hiện tại:{' '}
                <strong>{homeroomTarget.homeroom_staff_id.full_name}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Giáo viên chủ nhiệm <span className="text-accent">*</span>
            </label>
            <select
              value={homeroomStaffId}
              onChange={(e) => setHomeroomStaffId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">— Chọn cán bộ / giáo viên —</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.full_name} ({s.staff_code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setHomeroomTarget(null)} disabled={assigning}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" onClick={handleAssignHomeroom} loading={assigning}>
              Phân công
            </Button>
          </div>
        </div>
      </Modal>

      {/* Xác nhận xóa */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        danger
        loading={deleting}
        title="Xóa lớp-năm học"
        message={`Bạn chắc chắn muốn xóa lớp "${deleteTarget?.class_id?.name}" khỏi năm học? Chỉ có thể xóa lớp chưa có học sinh.`}
        confirmText="Xóa"
      />
    </div>
  )
}

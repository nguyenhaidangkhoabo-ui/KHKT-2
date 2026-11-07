import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Plus, Trash2, UserCheck, UserMinus, RefreshCw, RotateCcw, Upload, WandSparkles, Eye, Users, UserPlus, ArrowLeft } from 'lucide-react'
import { classYearService, classService, yearService, staffService, studentClassService, studentService } from '../../services'
import {
  GRADE_LABELS,
  GENDER_LABELS,
  ACADEMIC_STATUS_LABELS,
  ACADEMIC_STATUS_COLORS,
} from '../../config/constants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

function formatDate(value) {
  if (!value) return 'Chưa cập nhật'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('vi-VN')
}

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

  // Phân công thông minh / hủy / đặt lại phân công
  const [autoAssignConfirm, setAutoAssignConfirm] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)
  const [unassignTarget, setUnassignTarget] = useState(null)
  const [unassigning, setUnassigning] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  const [classImportTarget, setClassImportTarget] = useState(null)
  const [importingClass, setImportingClass] = useState(false)
  const fileInputRef = useRef(null)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Danh sách học sinh của một lớp-năm học (modal mắt)
  const [studentsTarget, setStudentsTarget] = useState(null)
  const [studentsList, setStudentsList] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState('')

  // Hồ sơ tóm tắt của học sinh đang xem ngay trong modal (không rời trang)
  const [profileStudent, setProfileStudent] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Xếp học sinh hàng loạt vào các lớp của năm đang chọn
  const [bulkAssignConfirm, setBulkAssignConfirm] = useState(false)
  const [bulkAssigning, setBulkAssigning] = useState(false)

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

  // Giáo viên đã chủ nhiệm một lớp trong năm đang chọn
  const assignedStaffIds = useMemo(() => {
    const ids = new Set()
    filteredRows.forEach((row) => {
      if (!row.homeroom_staff_id) return
      ids.add(String(row.homeroom_staff_id._id || row.homeroom_staff_id))
    })
    return ids
  }, [filteredRows])

  // Giáo viên còn trống (chưa chủ nhiệm lớp nào trong năm đang chọn)
  const availableHomeroomStaff = useMemo(
    () => staffList.filter((s) => !assignedStaffIds.has(String(s._id))),
    [staffList, assignedStaffIds]
  )

  // Trong modal sửa: vẫn giữ giáo viên hiện tại của chính lớp đó trong danh sách chọn
  const homeroomStaffOptions = useMemo(() => {
    const currentStaffId = String(
      homeroomTarget?.homeroom_staff_id?._id || homeroomTarget?.homeroom_staff_id || ''
    )
    return staffList.filter(
      (s) => !assignedStaffIds.has(String(s._id)) || String(s._id) === currentStaffId
    )
  }, [staffList, assignedStaffIds, homeroomTarget])

  const assignedRows = useMemo(
    () => filteredRows.filter((row) => row.homeroom_staff_id),
    [filteredRows]
  )

  const unassignedRows = useMemo(
    () => filteredRows.filter((row) => !row.homeroom_staff_id),
    [filteredRows]
  )

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

  // Phân công thông minh: lấp các lớp chưa có chủ nhiệm bằng giáo viên còn trống.
  // Không đủ giáo viên thì xếp tối đa có thể rồi báo số lớp còn trống.
  const handleAutoAssign = async () => {
    const targets = [...unassignedRows].sort((a, b) =>
      (a.class_id?.name || '').localeCompare(b.class_id?.name || '', 'vi')
    )
    const teachers = [...availableHomeroomStaff].sort((a, b) =>
      (a.full_name || '').localeCompare(b.full_name || '', 'vi')
    )

    if (targets.length === 0) {
      setAutoAssignConfirm(false)
      toast.info('Tất cả các lớp trong năm học này đã có giáo viên chủ nhiệm.')
      return
    }

    const pairCount = Math.min(targets.length, teachers.length)
    try {
      setAutoAssigning(true)
      let assigned = 0
      let failed = 0
      for (let i = 0; i < pairCount; i++) {
        try {
          await classYearService.assignHomeroom(targets[i]._id, {
            homeroom_staff_id: teachers[i]._id,
          })
          assigned++
        } catch {
          failed++
        }
      }
      setAutoAssignConfirm(false)
      await loadClassYears()

      const remaining = targets.length - assigned
      if (failed > 0) {
        toast.error(
          `Đã phân công ${assigned} lớp, ${failed} lớp phân công thất bại. Còn ${remaining} lớp chưa có chủ nhiệm.`
        )
      } else if (remaining > 0) {
        toast.info(
          `Đã phân công ${assigned} lớp. Còn ${remaining} lớp chưa có giáo viên vì không đủ giáo viên.`
        )
      } else {
        toast.success(`Đã phân công giáo viên chủ nhiệm cho ${assigned} lớp.`)
      }
    } finally {
      setAutoAssigning(false)
    }
  }

  const handleUnassignHomeroom = async () => {
    if (!unassignTarget) return
    try {
      setUnassigning(true)
      await classYearService.assignHomeroom(unassignTarget._id, {
        homeroom_staff_id: null,
      })
      toast.success('Đã hủy phân công giáo viên chủ nhiệm.')
      setUnassignTarget(null)
      await loadClassYears()
    } catch (err) {
      toast.error(err.message || 'Hủy phân công thất bại.')
    } finally {
      setUnassigning(false)
    }
  }

  // Đặt lại toàn bộ phân công của năm đang chọn để phân công lại từ đầu.
  const handleResetHomeroom = async () => {
    const targets = [...assignedRows]
    if (targets.length === 0) {
      setResetConfirm(false)
      toast.info('Không có phân công nào cần đặt lại trong năm học này.')
      return
    }
    try {
      setResetting(true)
      let cleared = 0
      for (const row of targets) {
        try {
          await classYearService.assignHomeroom(row._id, { homeroom_staff_id: null })
          cleared++
        } catch {
          // Tiếp tục các lớp còn lại, báo kết quả cuối cùng.
        }
      }
      setResetConfirm(false)
      await loadClassYears()
      if (cleared === targets.length) {
        toast.success(`Đã đặt lại phân công cho ${cleared} lớp.`)
      } else {
        toast.error(`Đã đặt lại ${cleared}/${targets.length} lớp. Vui lòng thử lại.`)
      }
    } finally {
      setResetting(false)
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

  // Mở modal danh sách học sinh của một lớp-năm học.
  const openStudents = async (row) => {
    setStudentsTarget(row)
    setStudentsList([])
    setStudentsError('')
    setProfileStudent(null)
    setProfileError('')
    try {
      setStudentsLoading(true)
      const res = await studentClassService.students(row._id)
      const list = Array.isArray(res?.data) ? res.data : []
      setStudentsList(list)
    } catch (err) {
      setStudentsError(err.message || 'Không thể tải danh sách học sinh.')
    } finally {
      setStudentsLoading(false)
    }
  }

  // Xem hồ sơ tóm tắt của một học sinh ngay trong modal.
  const openStudentProfile = async (student) => {
    if (!student?._id) return
    setProfileStudent(null)
    setProfileError('')
    try {
      setProfileLoading(true)
      const res = await studentService.getById(student._id)
      setProfileStudent(res?.data || student)
    } catch (err) {
      setProfileError(err.message || 'Không thể tải hồ sơ học sinh.')
    } finally {
      setProfileLoading(false)
    }
  }

  const closeStudentsModal = () => {
    setStudentsTarget(null)
    setProfileStudent(null)
    setProfileError('')
  }

  // Xếp học sinh Đang học chưa có lớp vào lớp ít học sinh nhất cùng khối.
  const handleBulkAssignStudents = async () => {
    if (!selectedYearId) return
    try {
      setBulkAssigning(true)
      const res = await classYearService.autoAssignStudents(selectedYearId)
      const result = res?.data || {}
      const skipped = result.skipped_no_class ?? 0
      setBulkAssignConfirm(false)
      if (skipped > 0) {
        toast.success(`Đã xếp ${result.assigned ?? 0} học sinh, còn ${result.unassigned ?? 0} chưa xếp (${skipped} không khớp khối).`)
      } else {
        toast.success(`Đã xếp ${result.assigned ?? 0} học sinh, còn ${result.unassigned ?? 0} chưa xếp.`)
      }
      await loadClassYears()
    } catch (err) {
      toast.error(err.message || 'Xếp học sinh hàng loạt thất bại.')
    } finally {
      setBulkAssigning(false)
    }
  }

  const openClassImport = (row) => {
    setClassImportTarget(row)
    fileInputRef.current?.click()
  }

  const handleImportClass = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !classImportTarget) return
    try {
      setImportingClass(true)
      const formData = new FormData()
      formData.append('file', file)
      const res = await studentClassService.importExcel(classImportTarget._id, formData)
      const result = res?.data || {}
      const errors = Array.isArray(result.errors) ? result.errors : []
      if (result.failed && errors.length) {
        const detail = errors
          .slice(0, 5)
          .map((err) => `Dòng ${err?.row ?? '?'}: ${err?.message || String(err)}`)
          .join('; ')
        toast.error(`Import vào lớp có ${result.failed} dòng lỗi. ${detail}`)
      } else if (result.failed && !errors.length) {
        toast.error(`Import vào lớp có ${result.failed} dòng thất bại.`)
      } else {
        toast.success(`Đã import ${result.success ?? 0} học sinh vào lớp.`)
      }
    } catch (err) {
      toast.error(err.message || 'Import file Excel vào lớp thất bại.')
    } finally {
      setImportingClass(false)
      setClassImportTarget(null)
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
      key: 'student_count',
      header: 'Sỉ số',
      render: (row) => (
        <Badge color="info">{`${row.student_count ?? 0} học sinh`}</Badge>
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
            onClick={() => openStudents(row)}
            title="Xem danh sách học sinh"
            className="p-1.5 rounded-lg text-primary hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openClassImport(row)}
            title="Nhập Excel"
            disabled={importingClass}
            className="p-1.5 rounded-lg text-primary hover:bg-primary-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openHomeroom(row)}
            title="Phân công chủ nhiệm"
            className="p-1.5 rounded-lg text-primary hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          {row.homeroom_staff_id && (
            <button
              type="button"
              onClick={() => setUnassignTarget(row)}
              title="Hủy phân công chủ nhiệm"
              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
            >
              <UserMinus className="w-4 h-4" />
            </button>
          )}
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
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportClass}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoAssignConfirm(true)}
            disabled={!selectedYearId || autoAssigning}
          >
            <WandSparkles className="w-4 h-4" />
            <span>Phân công thông minh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetConfirm(true)}
            disabled={!selectedYearId || resetting}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt lại phân công</span>
          </Button>
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
        <div className="ml-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setBulkAssignConfirm(true)}
            disabled={!selectedYearId || bulkAssigning}
          >
            <UserPlus className="w-4 h-4" />
            <span>Xếp học sinh hàng loạt</span>
          </Button>
        </div>
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
              {homeroomStaffOptions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.full_name} ({s.staff_code})
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Chỉ hiển thị giáo viên chưa chủ nhiệm lớp khác trong năm học này.
            </p>
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

      {/* Modal danh sách học sinh của lớp */}
      <Modal
        isOpen={Boolean(studentsTarget)}
        onClose={closeStudentsModal}
        title={
          profileStudent
            ? `Hồ sơ: ${profileStudent.full_name}`
            : `Học sinh lớp ${studentsTarget?.class_id?.name || ''}`
        }
        size="md"
      >
        <div className="space-y-3">
          {profileLoading ? (
            <p className="text-xs text-slate-500">Đang tải hồ sơ học sinh...</p>
          ) : profileError ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {profileError}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setProfileError('')
                  setProfileStudent(null)
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Danh sách lớp</span>
              </Button>
            </div>
          ) : profileStudent ? (
            <div className="space-y-4">
              <Button variant="secondary" size="sm" onClick={() => setProfileStudent(null)}>
                <ArrowLeft className="w-4 h-4" />
                <span>Danh sách lớp</span>
              </Button>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <p className="text-sm font-bold text-slate-900">{profileStudent.full_name}</p>
                <p className="font-mono text-xs text-slate-500">{profileStudent.student_code}</p>
                <Badge color={ACADEMIC_STATUS_COLORS[profileStudent.academic_status] || 'info'}>
                  {ACADEMIC_STATUS_LABELS[profileStudent.academic_status] ||
                    profileStudent.academic_status ||
                    '—'}
                </Badge>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-slate-400">Ngày sinh</dt>
                  <dd className="font-semibold text-slate-800">{formatDate(profileStudent.birthdate)}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Giới tính</dt>
                  <dd className="font-semibold text-slate-800">
                    {GENDER_LABELS[profileStudent.gender] || profileStudent.gender || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Email</dt>
                  <dd className="font-semibold text-slate-800 break-all">
                    {profileStudent.email || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Số điện thoại</dt>
                  <dd className="font-semibold text-slate-800">{profileStudent.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Năm nhập học</dt>
                  <dd className="font-semibold text-slate-800">
                    {profileStudent.enrollment_year || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Lớp đang xem</dt>
                  <dd className="font-semibold text-slate-800">
                    {studentsTarget?.class_id?.name || '—'}
                  </dd>
                </div>
              </dl>

              <Link
                to={`/admin/students/${profileStudent._id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>Mở trang hồ sơ đầy đủ</span>
              </Link>
            </div>
          ) : studentsLoading ? (
            <p className="text-xs text-slate-500">Đang tải danh sách học sinh...</p>
          ) : studentsError ? (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {studentsError}
            </div>
          ) : studentsList.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Lớp chưa có học sinh"
              description="Lớp-năm học này chưa có học sinh nào."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {studentsList.map((item) => {
                const s = item.student_id && typeof item.student_id === 'object' ? item.student_id : item
                return (
                  <li key={s._id || item._id} className="py-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openStudentProfile(s)}
                      className="flex-1 text-left text-xs cursor-pointer"
                    >
                      <p className="font-semibold text-slate-800">{s.full_name}</p>
                      <p className="font-mono text-slate-500">{s.student_code}</p>
                    </button>
                    {s._id && (
                      <button
                        type="button"
                        onClick={() => openStudentProfile(s)}
                        title="Xem hồ sơ"
                        className="p-1.5 rounded-lg text-primary hover:bg-primary-50 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Modal>

      {/* Xác nhận xếp học sinh hàng loạt */}
      <ConfirmDialog
        isOpen={bulkAssignConfirm}
        onClose={() => setBulkAssignConfirm(false)}
        onConfirm={handleBulkAssignStudents}
        loading={bulkAssigning}
        title="Xếp học sinh hàng loạt"
        message="Chỉ xếp học sinh Đang học chưa có lớp vào lớp ít học sinh nhất cùng khối. Tiếp tục?"
        confirmText="Xếp học sinh"
      />

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

      {/* Xác nhận phân công thông minh */}
      <ConfirmDialog
        isOpen={autoAssignConfirm}
        onClose={() => setAutoAssignConfirm(false)}
        onConfirm={handleAutoAssign}
        loading={autoAssigning}
        title="Phân công thông minh"
        message={`Tự động phân công giáo viên chưa chủ nhiệm cho ${unassignedRows.length} lớp chưa có chủ nhiệm trong năm học đang chọn. Nếu không đủ giáo viên, các lớp còn lại sẽ được báo lại. Tiếp tục?`}
        confirmText="Phân công"
      />

      {/* Xác nhận hủy phân công một lớp */}
      <ConfirmDialog
        isOpen={Boolean(unassignTarget)}
        onClose={() => setUnassignTarget(null)}
        onConfirm={handleUnassignHomeroom}
        danger
        loading={unassigning}
        title="Hủy phân công chủ nhiệm"
        message={`Hủy phân công giáo viên ${unassignTarget?.homeroom_staff_id?.full_name || ''} khỏi lớp "${unassignTarget?.class_id?.name || ''}"?`}
        confirmText="Hủy phân công"
      />

      {/* Xác nhận đặt lại toàn bộ phân công */}
      <ConfirmDialog
        isOpen={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={handleResetHomeroom}
        danger
        loading={resetting}
        title="Đặt lại toàn bộ phân công"
        message={`Xóa giáo viên chủ nhiệm của tất cả ${assignedRows.length} lớp trong năm học đang chọn để phân công lại?`}
        confirmText="Đặt lại"
      />
    </div>
  )
}

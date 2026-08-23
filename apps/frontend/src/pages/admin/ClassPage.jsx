import { useEffect, useState, useCallback } from 'react'
import { School, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { classService } from '../../services'
import { GRADE_OPTIONS, GRADE_LABELS } from '../../config/constants'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { toast } from '../../components/ui/Toast'

const EMPTY_FORM = { name: '', grade: '' }

export default function ClassPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await classService.list()
      const list = Array.isArray(res?.data) ? res.data : []
      setClasses(
        [...list].sort((a, b) => (a.grade || '').localeCompare(b.grade || '') || (a.name || '').localeCompare(b.name || ''))
      )
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách lớp học.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  const openCreate = () => {
    setEditingClass(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (cls) => {
    setEditingClass(cls)
    setForm({ name: cls.name || '', grade: cls.grade || '' })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim()) {
      setFormError('Vui lòng nhập tên lớp.')
      return
    }
    if (!form.grade) {
      setFormError('Vui lòng chọn khối lớp.')
      return
    }

    try {
      setSubmitting(true)
      const payload = { name: form.name.trim(), grade: form.grade }
      if (editingClass) {
        await classService.update(editingClass._id, payload)
        toast.success('Cập nhật lớp học thành công!')
      } else {
        await classService.create(payload)
        toast.success('Thêm lớp học thành công!')
      }
      setModalOpen(false)
      await loadClasses()
    } catch (err) {
      setFormError(err.message || 'Không thể lưu lớp học. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await classService.remove(deleteTarget._id)
      toast.success('Xóa lớp học thành công!')
      setDeleteTarget(null)
      await loadClasses()
    } catch (err) {
      toast.error(err.message || 'Xóa lớp học thất bại.')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Tên lớp',
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
    },
    {
      key: 'grade',
      header: 'Khối lớp',
      render: (row) => (
        <Badge color="primary">{GRADE_LABELS[row.grade] || row.grade}</Badge>
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
            onClick={() => openEdit(row)}
            title="Chỉnh sửa"
            className="p-1.5 rounded-lg text-primary hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            title="Xóa lớp"
            className="p-1.5 rounded-lg text-accent hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <School className="w-5 h-5 text-primary" />
            <span>Quản lý lớp học</span>
          </h1>
          <p className="text-xs text-slate-500">
            Danh mục lớp gốc của trường (không gắn với năm học cụ thể). Lớp theo từng năm học được khai báo ở mục "Lớp theo năm học".
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={loadClasses}>
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            <span>Thêm lớp học</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bảng lớp học */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
        <DataTable
          columns={columns}
          data={classes}
          loading={loading}
          rowKey="_id"
          emptyMessage="Chưa có lớp học nào trong hệ thống"
        />
      </div>

      {/* Modal thêm / sửa */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClass ? 'Cập nhật lớp học' : 'Thêm lớp học mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên lớp <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="VD: 10A1"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Khối lớp <span className="text-accent">*</span>
            </label>
            <select
              value={form.grade}
              onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              required
            >
              <option value="">— Chọn khối lớp —</option>
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)} disabled={submitting}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              {editingClass ? 'Lưu thay đổi' : 'Thêm lớp học'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Xác nhận xóa */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        danger
        loading={deleting}
        title="Xóa lớp học"
        message={`Bạn chắc chắn muốn xóa lớp "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa lớp"
      />
    </div>
  )
}

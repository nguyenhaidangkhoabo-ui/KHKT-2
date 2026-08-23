import { useEffect, useState, useCallback } from 'react'
import { Calendar, Plus, Pencil, Trash2, Star, RefreshCw } from 'lucide-react'
import { yearService } from '../../services'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

const EMPTY_FORM = { start_year: '', end_year: '' }

export default function AcademicYearPage() {
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingYear, setEditingYear] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [confirmTarget, setConfirmTarget] = useState(null) // { type: 'SET_CURRENT' | 'DELETE', year }
  const [confirmLoading, setConfirmLoading] = useState(false)

  const loadYears = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await yearService.list()
      const list = Array.isArray(res?.data) ? res.data : []
      setYears(list.sort((a, b) => (b.start_year || 0) - (a.start_year || 0)))
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách năm học.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadYears()
  }, [loadYears])

  const openCreate = () => {
    setEditingYear(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (year) => {
    setEditingYear(year)
    setForm({ start_year: String(year.start_year ?? ''), end_year: String(year.end_year ?? '') })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const startYear = Number(form.start_year)
    const endYear = Number(form.end_year)
    if (!startYear || !endYear) {
      setFormError('Vui lòng nhập đầy đủ năm bắt đầu và năm kết thúc.')
      return
    }
    if (endYear <= startYear) {
      setFormError('Năm kết thúc phải lớn hơn năm bắt đầu.')
      return
    }

    try {
      setSubmitting(true)
      const payload = { start_year: startYear, end_year: endYear }
      if (editingYear) {
        await yearService.update(editingYear._id, payload)
        toast.success('Cập nhật năm học thành công!')
      } else {
        await yearService.create(payload)
        toast.success('Thêm năm học thành công!')
      }
      setModalOpen(false)
      await loadYears()
    } catch (err) {
      setFormError(err.message || 'Không thể lưu năm học. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmAction = async () => {
    if (!confirmTarget?.year) return
    try {
      setConfirmLoading(true)
      if (confirmTarget.type === 'SET_CURRENT') {
        await yearService.setCurrent(confirmTarget.year._id)
        toast.success(
          `Đã đặt năm học ${confirmTarget.year.start_year}-${confirmTarget.year.end_year} làm năm hiện tại.`
        )
      } else {
        await yearService.remove(confirmTarget.year._id)
        toast.success('Xóa năm học thành công!')
      }
      setConfirmTarget(null)
      await loadYears()
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại. Vui lòng thử lại.')
    } finally {
      setConfirmLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Năm học',
      render: (row) => (
        <span className="font-bold text-slate-900">
          {row.start_year} - {row.end_year}
        </span>
      ),
    },
    {
      key: 'is_current',
      header: 'Trạng thái',
      render: (row) =>
        row.is_current ? (
          <Badge color="success">Năm học hiện tại</Badge>
        ) : (
          <Badge color="slate">Khác</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {!row.is_current && (
            <button
              type="button"
              onClick={() => setConfirmTarget({ type: 'SET_CURRENT', year: row })}
              title="Đặt làm năm hiện tại"
              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
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
            onClick={() => setConfirmTarget({ type: 'DELETE', year: row })}
            title="Xóa năm học"
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
            <Calendar className="w-5 h-5 text-primary" />
            <span>Quản lý năm học</span>
          </h1>
          <p className="text-xs text-slate-500">
            Danh mục các năm học của trường. Năm học hiện tại được dùng để tổng hợp dữ liệu toàn hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={loadYears}>
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            <span>Thêm năm học</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bảng năm học */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
        <DataTable
          columns={columns}
          data={years}
          loading={loading}
          rowKey="_id"
          emptyMessage="Chưa có năm học nào trong hệ thống"
        />
      </div>

      {/* Modal thêm / sửa */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingYear ? 'Cập nhật năm học' : 'Thêm năm học mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Năm bắt đầu <span className="text-accent">*</span>
              </label>
              <input
                type="number"
                min="1990"
                max="2100"
                value={form.start_year}
                onChange={(e) => setForm((f) => ({ ...f, start_year: e.target.value }))}
                placeholder="VD: 2025"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Năm kết thúc <span className="text-accent">*</span>
              </label>
              <input
                type="number"
                min="1990"
                max="2100"
                value={form.end_year}
                onChange={(e) => setForm((f) => ({ ...f, end_year: e.target.value }))}
                placeholder="VD: 2026"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)} disabled={submitting}>
              Hủy bỏ
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              {editingYear ? 'Lưu thay đổi' : 'Thêm năm học'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Xác nhận đặt năm hiện tại / xóa */}
      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmAction}
        danger={confirmTarget?.type === 'DELETE'}
        loading={confirmLoading}
        title={
          confirmTarget?.type === 'SET_CURRENT' ? 'Đặt làm năm hiện tại' : 'Xóa năm học'
        }
        message={
          confirmTarget?.type === 'SET_CURRENT'
            ? `Đặt năm học ${confirmTarget?.year?.start_year}-${confirmTarget?.year?.end_year} làm năm học hiện tại? Các năm học khác sẽ không còn được đánh dấu là hiện tại.`
            : `Bạn chắc chắn muốn xóa năm học ${confirmTarget?.year?.start_year}-${confirmTarget?.year?.end_year}? Hành động này không thể hoàn tác.`
        }
        confirmText={confirmTarget?.type === 'SET_CURRENT' ? 'Đặt làm hiện tại' : 'Xóa năm học'}
      />

      {!loading && years.length === 0 && !error && (
        <EmptyState
          icon={Calendar}
          title="Chưa có năm học nào"
          description="Hãy thêm năm học đầu tiên để bắt đầu sử dụng hệ thống."
          action={
            <Button variant="primary" size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4" />
              <span>Thêm năm học</span>
            </Button>
          }
        />
      )}
    </div>
  )
}

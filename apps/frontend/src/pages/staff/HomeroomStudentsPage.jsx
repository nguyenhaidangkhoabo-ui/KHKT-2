import { useEffect, useState, useCallback } from 'react'
import { School, Users, Search, RefreshCw } from 'lucide-react'
import { teacherService } from '../../services'
import {
  ACADEMIC_STATUS_LABELS,
  ACADEMIC_STATUS_COLORS,
} from '../../config/constants'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'

const PAGE_SIZE = 20

// Chuẩn hóa nhiều dạng response danh sách về mảng
function normalizeList(res) {
  const d = res?.data ?? res
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.items)) return d.items
  if (Array.isArray(d?.docs)) return d.docs
  if (Array.isArray(d?.classes)) return d.classes
  return []
}

// Trích xuất danh sách học sinh + tổng số từ response phân trang hoặc mảng
function extractStudentPage(res) {
  const d = res?.data ?? res
  if (Array.isArray(d)) return { rows: d, total: d.length, totalPages: 1 }
  if (d && typeof d === 'object') {
    const rows =
      (Array.isArray(d.items) && d.items) ||
      (Array.isArray(d.docs) && d.docs) ||
      (Array.isArray(d.students) && d.students) ||
      (Array.isArray(d.data) && d.data) ||
      []
    const total = d.total != null ? Number(d.total) : rows.length
    const totalPages =
      d.total_pages != null
        ? Number(d.total_pages)
        : d.pages != null
          ? Number(d.pages)
          : Math.max(1, Math.ceil(total / PAGE_SIZE))
    return { rows, total, totalPages }
  }
  return { rows: [], total: 0, totalPages: 1 }
}

const getClassId = (c) => c?.class_year_id || c?.class_academic_year_id || c?._id || c?.id
const getClassName = (c) =>
  [c?.class_name || c?.name, c?.grade].filter(Boolean).join(' - ') || 'Lớp chưa tên'

export default function HomeroomStudentsPage() {
  const [classes, setClasses] = useState([])
  const [activeClassId, setActiveClassId] = useState(null)
  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [error, setError] = useState('')

  // Tải danh sách lớp chủ nhiệm
  useEffect(() => {
    let isActive = true
    async function loadClasses() {
      try {
        setLoadingClasses(true)
        setError('')
        const res = await teacherService.myClasses()
        if (!isActive) return
        const list = normalizeList(res)
        setClasses(list)
        setActiveClassId(getClassId(list[0]) ?? null)
      } catch (err) {
        if (isActive) setError(err.message || 'Không thể tải danh sách lớp chủ nhiệm.')
      } finally {
        if (isActive) setLoadingClasses(false)
      }
    }
    loadClasses()
    return () => {
      isActive = false
    }
  }, [])

  // Tải học sinh theo lớp + bộ lọc (chỉ gọi lại khi đổi lớp / trang / từ khóa đã chốt)
  const loadStudents = useCallback(async () => {
    if (!activeClassId) {
      setStudents([])
      setTotal(0)
      setTotalPages(1)
      return
    }
    try {
      setLoadingStudents(true)
      setError('')
      const params = { page, limit: PAGE_SIZE }
      if (searchQuery.trim()) params.search = searchQuery.trim()
      const res = await teacherService.classStudents(activeClassId, params)
      const { rows, total: t, totalPages: tp } = extractStudentPage(res)
      setStudents(rows)
      setTotal(t)
      setTotalPages(tp)
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách học sinh của lớp.')
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }, [activeClassId, page, searchQuery])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const handleChangeClass = (classId) => {
    setActiveClassId(classId)
    setPage(1)
    setSearchInput('')
    setSearchQuery('')
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchQuery(searchInput.trim())
  }

  const handleSearchReset = () => {
    setSearchInput('')
    setSearchQuery('')
    setPage(1)
  }

  const columns = [
    {
      key: 'student_code',
      header: 'Mã học sinh',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {row.student_code || row.student_id?.student_code || '—'}
        </span>
      ),
    },
    {
      key: 'full_name',
      header: 'Họ và tên',
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.full_name || row.student_name || row.student_id?.full_name || '—'}
        </span>
      ),
    },
    {
      key: 'academic_status',
      header: 'Trạng thái học tập',
      render: (row) => {
        const status = row.academic_status || row.student_id?.academic_status
        if (!status) return <span className="text-slate-400 text-xs">—</span>
        return (
          <Badge color={ACADEMIC_STATUS_COLORS[status] || 'info'}>
            {ACADEMIC_STATUS_LABELS[status] || status}
          </Badge>
        )
      },
    },
  ]

  if (loadingClasses) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 font-sans">
        <div className="h-24 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
        <div className="h-72 rounded-2xl bg-white border border-slate-200/90 shadow-xs animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Tiêu đề */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <School className="w-5 h-5 text-primary" />
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Học sinh chủ nhiệm
          </h1>
        </div>

        {classes.length === 0 ? (
          <EmptyState
            icon={School}
            title="Bạn chưa được phân công chủ nhiệm"
            description="Hiện tại bạn chưa phụ trách lớp nào trong năm học này. Vui lòng liên hệ văn thư / ban giám hiệu nếu có sai sót."
          />
        ) : (
          <>
            {/* Bộ chọn lớp */}
            <div className="flex flex-wrap items-center gap-2">
              {classes.map((c) => {
                const id = getClassId(c)
                const active = String(id) === String(activeClassId)
                return (
                  <button
                    key={String(id)}
                    type="button"
                    onClick={() => handleChangeClass(id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-primary text-white shadow-primary shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {getClassName(c)}
                  </button>
                )
              })}
            </div>

            {/* Thanh tìm kiếm */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm theo mã học sinh hoặc họ tên..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                />
              </div>
              <Button variant="primary" size="sm" type="submit">Tìm kiếm</Button>
              <Button variant="outline" size="sm" type="button" onClick={handleSearchReset}>
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Đặt lại</span>
                </span>
              </Button>
            </form>
          </>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bảng học sinh */}
      {classes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Danh sách học sinh</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              Tổng cộng <strong className="text-slate-800">{typeof total === 'number' ? total.toLocaleString('vi-VN') : '—'}</strong> học sinh
            </span>
          </div>

          {!loadingStudents && students.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Lớp chưa có học sinh"
              description="Chưa có học sinh nào được xếp vào lớp này."
            />
          ) : (
            <DataTable
              columns={columns}
              data={students}
              loading={loadingStudents}
              rowKey={(row) => String(row.student_id || row._id || row.student_code || '')}
            />
          )}

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onChange={(p) => setPage(p)}
            />
          )}
        </div>
      )}
    </div>
  )
}

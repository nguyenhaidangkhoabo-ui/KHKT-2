import { useState } from 'react'
import { useFetch } from '../../../hooks/useFetch'
import { teacherService } from '../../../services/teacher.service'
import Card from '../../../components/ui/card'
import Badge from '../../../components/ui/badge'
import Input from '../../../components/ui/input'
import Select from '../../../components/ui/select'
import Table from '../../../components/ui/table'
import Spinner from '../../../components/ui/spinner'
import Alert from '../../../components/feedback/alert'
import Icon from '../../../components/ui/icon'
import { useDebounce } from '../../../hooks/useDebounce'
import { ACADEMIC_STATUS_LABELS, ACADEMIC_STATUS_COLORS, GRADE_LABELS } from '../../../config/constants'

export default function ClassStudentsPage() {
  const [classYearId, setClassYearId] = useState('')
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)

  const { data: classes, loading: loadingClasses } = useFetch(() => teacherService.getMyClasses(), [])

  const { data: students, loading, error, refetch } = useFetch(
    () => teacherService.getMyClassStudents(classYearId),
    [classYearId, debouncedKeyword],
    { skip: !classYearId }
  )

  const filtered = students?.filter((s) => {
    if (!debouncedKeyword) return true
    const kw = debouncedKeyword.toLowerCase()
    return (s.full_name || '').toLowerCase().includes(kw) || (s.student_code || '').toLowerCase().includes(kw)
  })

  const columns = [
    { key: 'student_code', label: 'Mã HS', render: (r) => <strong>{r.student_code}</strong> },
    { key: 'full_name', label: 'Họ tên' },
    { key: 'gender', label: 'Giới tính', render: (r) => (r.gender === 'MALE' ? 'Nam' : r.gender === 'FEMALE' ? 'Nữ' : '—') },
    { key: 'academic_status', label: 'Trạng thái', render: (r) => (
      <Badge variant={ACADEMIC_STATUS_COLORS[r.academic_status] || 'secondary'}>{ACADEMIC_STATUS_LABELS[r.academic_status] || r.academic_status}</Badge>
    ) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Học sinh lớp chủ nhiệm</h2>
          <p className="page-subtitle">Chế độ chỉ xem (read-only) — theo quy định TCH-01/02/03</p>
        </div>
      </div>

      <div className="filter-bar">
        <Select label="Lớp (năm học)" placeholder="Chọn lớp chủ nhiệm..." value={classYearId}
          onChange={(e) => setClassYearId(e.target.value)}
          options={(classes || []).map((c) => ({
            value: c._id,
            label: `${c.class_name || c.class?.name || ''} · ${c.academic_year?.start_year}-${c.academic_year?.end_year || ''}`,
          }))} />
        <div className="form-group" style={{ minWidth: 220 }}>
          <label className="form-label">Tìm kiếm</label>
          <div className="input-wrap has-icon">
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input className="form-input" placeholder="Tên hoặc mã học sinh..."
              value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
        </div>
      </div>

      {loadingClasses && <div className="text-center py-6"><Spinner /></div>}
      {error && <Alert type="error">{error.message}</Alert>}

      {!classYearId && !loadingClasses && <p className="text-secondary">Vui lòng chọn lớp chủ nhiệm để xem danh sách.</p>}
      {classYearId && (
        <Card>
          <Table columns={columns} data={filtered || []} loading={loading}
            emptyText="Không có học sinh trong lớp này" />
        </Card>
      )}
    </div>
  )
}
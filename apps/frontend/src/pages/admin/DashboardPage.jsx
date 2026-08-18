import { useFetch } from '../../hooks/useFetch'
import { adminCoreService } from '../../services/adminCore.service'
import { adminDiplomaService } from '../../services/adminDiploma.service'
import StatCard from '../../components/ui/statCard'
import Spinner from '../../components/ui/spinner'
import Alert from '../../components/feedback/alert'
import Card from '../../components/ui/card'
import { formatAcademicYear } from '../../utils/formatDate'
import { ACADEMIC_STATUS } from '../../config/constants'

export default function DashboardPage() {
  const { data: years, loading: loadingYears, error: errYears } = useFetch(() => adminCoreService.getYears(), [])
  const { data: students, loading: loadingStudents } = useFetch(
    () => adminCoreService.getStudents({}),
    []
  )
  // Module Diploma chưa có backend — bắt lỗi graceful
  const { data: diplomaStats, loading: loadingStats } = useFetch(
    () => adminDiplomaService.getStats().catch(() => null),
    []
  )
  const { data: staff } = useFetch(() => adminCoreService.getStaff({}).catch(() => []), [])

  if (loadingYears) return <div className="text-center py-6"><Spinner size="lg" /></div>
  if (errYears) return <Alert type="error">{errYears.message}</Alert>

  const currentYear = years?.find((y) => y.is_current)
  const activeStudents = students?.filter((s) => s.academic_status === ACADEMIC_STATUS.ACTIVE).length ?? '—'
  const graduatedStudents = students?.filter((s) => s.academic_status === ACADEMIC_STATUS.GRADUATED).length ?? '—'

  const stats = [
    { label: 'Năm học hiện tại', value: currentYear ? `${currentYear.start_year}-${currentYear.end_year}` : '—', icon: 'calendar', tone: 'primary' },
    { label: 'Học sinh đang học', value: activeStudents, icon: 'users', tone: 'success' },
    { label: 'Học sinh đã tốt nghiệp', value: graduatedStudents, icon: 'award', tone: 'accent' },
    { label: 'Cán bộ / Giáo viên', value: staff?.length ?? '—', icon: 'userCircle', tone: 'info' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">{currentYear ? formatAcademicYear(currentYear) : 'Chưa có năm học nào được kích hoạt'}</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid-2">
        <Card title="Thống kê bằng tốt nghiệp" subtitle="Module Diploma (chờ backend)">
          {loadingStats ? <Spinner /> : !diplomaStats ? (
            <p className="text-secondary">Chưa có dữ liệu thống kê bằng. Khi backend Diploma được cài đặt (Phụ lục A), số liệu sẽ hiển thị tại đây.</p>
          ) : (
            <div className="info-grid">
              <div className="info-item"><div className="info-item-label">Tổng bằng</div><div className="info-item-value">{diplomaStats.total_diplomas ?? '—'}</div></div>
              <div className="info-item"><div className="info-item-label">Đã trao</div><div className="info-item-value">{diplomaStats.handed_over ?? '—'}</div></div>
              <div className="info-item"><div className="info-item-label">Chưa trao</div><div className="info-item-value">{diplomaStats.not_handed_over ?? '—'}</div></div>
            </div>
          )}
        </Card>
        <Card title="Hướng dẫn nhanh" subtitle="Các bước vận hành">
          <ol className="text-secondary" style={{ paddingLeft: 20 }}>
            <li>Tạo & kích hoạt <strong>Năm học</strong> mới.</li>
            <li>Thiết lập <strong>danh mục lớp</strong> (10A1, 11A2...).</li>
            <li>Tạo tài khoản <strong>học sinh / giáo viên</strong> (hoặc import Excel).</li>
            <li>Khởi tạo <strong>lớp theo năm học</strong> và phân công GVCN.</li>
            <li>Phân <strong>học sinh vào lớp</strong>.</li>
            <li>Cuối năm: chuyển trạng thái học sinh sang <strong>Tốt nghiệp</strong>.</li>
          </ol>
        </Card>
      </div>
    </div>
  )
}
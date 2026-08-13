import { useEffect, useState } from 'react'
import { adminDiplomaService } from '../../services/adminDiploma.service'
import { adminCoreService } from '../../services/adminCore.service'
import Spinner from '../../components/ui/spinner'
import Alert from '../../components/feedback/alert'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [currentYear, setCurrentYear] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      adminDiplomaService.getStats(),
      adminCoreService.getYears().catch(() => null),
    ])
      .then(([statsData, yearsData]) => {
        setStats(statsData.stats || statsData)
        const current = (yearsData?.years || yearsData || []).find((y) => y.is_current)
        setCurrentYear(current)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-8"><Spinner /></div>
  if (error) return <Alert type="error">{error}</Alert>

  const cards = [
    { label: 'Tổng học sinh', value: stats?.total_students ?? '—' },
    { label: 'Tổng bằng tốt nghiệp', value: stats?.total_diplomas ?? '—' },
    { label: 'Đã trao', value: stats?.handed_over ?? '—' },
    { label: 'Chưa trao', value: stats?.not_handed_over ?? '—' },
  ]

  return (
    <div className="container">
      <h1 className="page-title">Dashboard</h1>
      {currentYear && (
        <p className="text-secondary mb-4">Năm học hiện tại: <strong>{currentYear.name}</strong></p>
      )}
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { profileService } from '../../services/profile.service'
import { adminCoreService } from '../../services/adminCore.service'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/ui/card'
import Badge from '../../components/ui/badge'
import Spinner from '../../components/ui/spinner'
import Alert from '../../components/feedback/alert'
import Modal from '../../components/ui/modal'
import Input from '../../components/ui/input'
import Button from '../../components/ui/button'
import { formatDate } from '../../utils/formatDate'
import { ACADEMIC_STATUS_LABELS, ACADEMIC_STATUS_COLORS, GENDER_LABELS } from '../../config/constants'

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [openPwd, setOpenPwd] = useState(false)
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [saving, setSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState(null)

  const { data: profile, loading, error } = useFetch(() => profileService.getMe(), [])
  const { data: history } = useFetch(
    () => (user?.id ? adminCoreService.getStudentHistory(user.id) : Promise.resolve(null)),
    [user?.id],
    { skip: !user?.id }
  )

  const handleChangePassword = async () => {
    setSaving(true)
    setPwdMsg(null)
    try {
      await profileService.changePassword(oldPwd, newPwd)
      setPwdMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' })
      setOldPwd(''); setNewPwd('')
      setTimeout(() => setOpenPwd(false), 1200)
    } catch (e) {
      setPwdMsg({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-6"><Spinner size="lg" /></div>
  if (error) return <Alert type="error">{error.message}</Alert>
  if (!profile) return null

  const p = profile
  const initials = (p.full_name || '?').slice(0, 2).toUpperCase()

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Hồ sơ cá nhân</h2>
          <p className="page-subtitle">Thông tin học sinh của bạn</p>
        </div>
        <div className="page-actions">
          <Button variant="soft" icon={<span>🔑</span>} onClick={() => setOpenPwd(true)}>Đổi mật khẩu</Button>
        </div>
      </div>

      <div className="grid-2">
        <Card>
          <div className="profile-header">
            <div className="profile-avatar-lg">{initials}</div>
            <div>
              <div className="profile-name">{p.full_name}</div>
              <div className="profile-meta">{p.student_code} · {GENDER_LABELS[p.gender] || '—'}</div>
              <div className="mt-2">
                <Badge variant={ACADEMIC_STATUS_COLORS[p.academic_status] || 'secondary'}>
                  {ACADEMIC_STATUS_LABELS[p.academic_status] || p.academic_status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="info-grid">
            <div className="info-item"><div className="info-item-label">Ngày sinh</div><div className="info-item-value">{formatDate(p.birthdate)}</div></div>
            <div className="info-item"><div className="info-item-label">Email</div><div className="info-item-value">{p.email || '—'}</div></div>
            <div className="info-item"><div className="info-item-label">Số điện thoại</div><div className="info-item-value">{p.phone || '—'}</div></div>
            <div className="info-item"><div className="info-item-label">Năm nhập học</div><div className="info-item-value">{p.enrollment_year || '—'}</div></div>
            <div className="info-item"><div className="info-item-label">Điện thoại bố</div><div className="info-item-value">{p.father_phone || '—'}</div></div>
            <div className="info-item"><div className="info-item-label">Điện thoại mẹ</div><div className="info-item-value">{p.mother_phone || '—'}</div></div>
          </div>
        </Card>

        <Card title="Lịch sử học tập theo năm" subtitle="Quá trình học tại trường">
          {!history || history.length === 0 ? (
            <p className="text-secondary">Chưa có dữ liệu phân lớp.</p>
          ) : (
            <div className="timeline">
              {history.map((item, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="timeline-item-title">{item.class_name || item.class?.name || 'Lớp ' + (idx + 1)}</div>
                  <div className="timeline-item-sub">
                    {item.academic_year?.start_year} - {item.academic_year?.end_year}
                    {item.homeroom_staff_name ? ` · GVCN: ${item.homeroom_staff_name}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal đổi mật khẩu */}
      <Modal
        open={openPwd}
        title="Đổi mật khẩu"
        onClose={() => { setOpenPwd(false); setPwdMsg(null) }}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenPwd(false)}>Hủy</Button>
            <Button onClick={handleChangePassword} loading={saving}>Lưu</Button>
          </>
        }
      >
        {pwdMsg && <Alert type={pwdMsg.type}>{pwdMsg.text}</Alert>}
        <Input label="Mật khẩu cũ" type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
        <Input label="Mật khẩu mới" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} hint="Tối thiểu 6 ký tự" />
      </Modal>
    </div>
  )
}
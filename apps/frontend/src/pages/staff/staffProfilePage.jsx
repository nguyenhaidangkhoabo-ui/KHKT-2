import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { profileService } from '../../services/profile.service'
import Card from '../../components/ui/card'
import Badge from '../../components/ui/badge'
import Spinner from '../../components/ui/spinner'
import Alert from '../../components/feedback/alert'
import Modal from '../../components/ui/modal'
import Input from '../../components/ui/input'
import Button from '../../components/ui/button'
import { ROLE_LABELS } from '../../config/constants'

export default function StaffProfilePage() {
  const [openPwd, setOpenPwd] = useState(false)
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [saving, setSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState(null)

  const { data: profile, loading, error } = useFetch(() => profileService.getMe(), [])

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
    } finally { setSaving(false) }
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
          <p className="page-subtitle">Thông tin giáo viên</p>
        </div>
        <div className="page-actions">
          <Button variant="soft" onClick={() => setOpenPwd(true)}>🔑 Đổi mật khẩu</Button>
        </div>
      </div>

      <div style={{ maxWidth: 720 }}>
        <Card>
          <div className="profile-header">
            <div className="profile-avatar-lg">{initials}</div>
            <div>
              <div className="profile-name">{p.full_name}</div>
              <div className="profile-meta">{p.staff_code} · {p.email || ''}</div>
              <div className="mt-2">
                <Badge variant="primary">{ROLE_LABELS[p.role] || p.role}</Badge>
              </div>
            </div>
          </div>
          <div className="info-grid">
            <div className="info-item"><div className="info-item-label">Mã cán bộ</div><div className="info-item-value">{p.staff_code || '—'}</div></div>
            <div className="info-item"><div className="info-item-label">Email</div><div className="info-item-value">{p.email || '—'}</div></div>
            <div className="info-item"><div className="info-item-label">Số điện thoại</div><div className="info-item-value">{p.phone || '—'}</div></div>
            <div className="info-item"><div className="info-item-label">Vai trò</div><div className="info-item-value">{ROLE_LABELS[p.role] || p.role}</div></div>
          </div>
        </Card>
      </div>

      <Modal open={openPwd} title="Đổi mật khẩu" onClose={() => { setOpenPwd(false); setPwdMsg(null) }}
        footer={<><Button variant="ghost" onClick={() => setOpenPwd(false)}>Hủy</Button><Button onClick={handleChangePassword} loading={saving}>Lưu</Button></>}>
        {pwdMsg && <Alert type={pwdMsg.type}>{pwdMsg.text}</Alert>}
        <Input label="Mật khẩu cũ" type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
        <Input label="Mật khẩu mới" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} hint="Tối thiểu 6 ký tự" />
      </Modal>
    </div>
  )
}
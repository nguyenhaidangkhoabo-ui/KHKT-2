import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  GraduationCap, 
  Building, 
  Award, 
  KeyRound,
  IdCard,
  HeartHandshake
} from 'lucide-react'
import { useAuth } from '../../context'
import { authService } from '../../services'
import { 
  ROLE_LABELS, 
  USER_STATUS_LABELS, 
  ACADEMIC_STATUS_LABELS,
  GENDER_LABELS 
} from '../../config/constants'

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth()
  const [profile, setProfile] = useState(authUser)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeAction, setActiveAction] = useState(null)

  const [submittingPassword, setSubmittingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')




  useEffect(() => {
    async function loadProfile() {
      try {
        setLoadingProfile(true)
        const res = await authService.getCurrentUser()
        if (res?.data) {
          setProfile(res.data)
          updateUser(res.data)
        }
      } catch (err) {
        console.warn('Không thể tải lại profile:', err.message)
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [])

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!oldPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.')
      return
    }

    if (!newPassword) {
      setPasswordError('Vui lòng nhập mật khẩu mới.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu mới không khớp.')
      return
    }

    try {
      setSubmittingPassword(true)
      const res = await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      })

      setPasswordSuccess(res?.message || 'Đổi mật khẩu thành công!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.')
    } finally {
      setSubmittingPassword(false)
    }
  }

  const currentUser = profile || authUser
  const isStudent = currentUser?.role === 'STUDENT'
  const initials = (currentUser?.full_name || currentUser?.username || 'HVN').slice(0, 2).toUpperCase()

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'TEACHER':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'ADMIN':
      case 'SYSTEM_ADMIN':
      case 'BGH':
        return 'bg-primary-100 text-primary-900 border-primary-300'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa cập nhật'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('vi-VN')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* 1. Header Banner & Profile Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-sm shrink-0">
            {initials}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentUser?.full_name || currentUser?.username || 'Người dùng'}
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  @{currentUser?.username}
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-bold ${getRoleBadgeStyle(currentUser?.role)}`}>
                  {ROLE_LABELS[currentUser?.role] || currentUser?.role}
                </span>
                <span className="inline-block px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold">
                  {USER_STATUS_LABELS[currentUser?.status] || currentUser?.status || 'Hoạt động'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              {isStudent 
                ? `Học sinh niên khóa ${currentUser?.enrollment_year || 'hiện tại'} tại Trường THPT Huỳnh Văn Nghệ` 
                : `Cán bộ / Giáo viên thuộc hệ thống quản lý THPT Huỳnh Văn Nghệ`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Detailed Profile Info */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <IdCard className="w-5 h-5 text-primary" />
            <span>Thông tin chi tiết hồ sơ</span>
          </h2>
        </div>

        {isStudent ? (
          /* Student specific info grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Mã học sinh</span>
              <p className="text-sm font-bold text-slate-900 font-mono">{currentUser?.student_code || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Trạng thái học tập</span>
              <p className="text-sm font-bold text-primary">
                {ACADEMIC_STATUS_LABELS[currentUser?.academic_status] || currentUser?.academic_status || 'Đang học'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Ngày sinh</span>
              <p className="text-sm font-semibold text-slate-800">{formatDate(currentUser?.birthdate)}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Giới tính</span>
              <p className="text-sm font-semibold text-slate-800">
                {GENDER_LABELS[currentUser?.gender] || currentUser?.gender || 'Chưa cập nhật'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Năm nhập học</span>
              <p className="text-sm font-semibold text-slate-800">{currentUser?.enrollment_year || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Email cá nhân</span>
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser?.email || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Số điện thoại học sinh</span>
              <p className="text-sm font-semibold text-slate-800">{currentUser?.phone || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Số điện thoại Phụ huynh (Cha / Mẹ)</span>
              <p className="text-sm font-semibold text-slate-800">
                {currentUser?.father_phone ? `Cha: ${currentUser.father_phone}` : ''}
                {currentUser?.father_phone && currentUser?.mother_phone ? ' | ' : ''}
                {currentUser?.mother_phone ? `Mẹ: ${currentUser.mother_phone}` : ''}
                {!currentUser?.father_phone && !currentUser?.mother_phone ? 'Chưa cập nhật' : ''}
              </p>
            </div>
          </div>
        ) : (
          /* Staff / Teacher specific info grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Mã cán bộ / Giáo viên</span>
              <p className="text-sm font-bold text-slate-900 font-mono">{currentUser?.staff_code || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Vai trò hệ thống</span>
              <p className="text-sm font-bold text-primary">
                {ROLE_LABELS[currentUser?.role] || currentUser?.role}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Email công vụ / liên hệ</span>
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser?.email || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Số điện thoại liên hệ</span>
              <p className="text-sm font-semibold text-slate-800">{currentUser?.phone || 'Chưa cập nhật'}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Account Actions & Settings Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Cài đặt & Thao tác tài khoản</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn thao tác bạn muốn thực hiện cho tài khoản này
            </p>
          </div>
        </div>

        {/* Action Selection Cards / List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveAction(activeAction === 'CHANGE_PASSWORD' ? null : 'CHANGE_PASSWORD')}
            className={`p-4 rounded-xl border text-left transition-all duration-150 flex items-center gap-3.5 cursor-pointer ${
              activeAction === 'CHANGE_PASSWORD'
                ? 'border-primary bg-primary-50/40 ring-2 ring-primary/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              activeAction === 'CHANGE_PASSWORD' 
                ? 'bg-primary text-white' 
                : 'bg-primary-50 text-primary'
            }`}>
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Đổi mật khẩu</span>
                {activeAction === 'CHANGE_PASSWORD' && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-primary text-white">Đang mở</span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Cập nhật mật khẩu mới để bảo vệ an toàn cho tài khoản
              </p>
            </div>
          </button>
        </div>

        {/* Dynamic Action Content Renderer */}
        {activeAction === 'CHANGE_PASSWORD' && (
          <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>Biểu mẫu thay đổi mật khẩu</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveAction(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Đóng lại
              </button>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/40 focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>


              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {submittingPassword ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Cập nhật mật khẩu</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveAction(null)
                    setPasswordError('')
                    setPasswordSuccess('')
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}


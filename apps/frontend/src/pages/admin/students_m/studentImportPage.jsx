import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminCoreService } from '../../../services/adminCore.service'
import Button from '../../../components/ui/button'
import Alert from '../../../components/feedback/alert'
import { useNotification } from '../../../hooks/useNotification'

export default function StudentImportPage() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useNotification()
  const navigate = useNavigate()

  const handleImport = async () => {
    if (!file) {
      setError('Vui lòng chọn file Excel.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      await adminCoreService.importStudents(formData)
      toast.success('Import học sinh thành công!')
      navigate('/admin/students')
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Import danh sách học sinh</h1>
      <div className="card">
        {error && <Alert type="error">{error}</Alert>}
        <div className="form-group">
          <label className="form-label">File Excel (.xlsx)</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="form-input"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleImport} disabled={submitting}>
            {submitting ? 'Đang import...' : 'Import'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/students')}>Quay lại</Button>
        </div>
      </div>
    </div>
  )
}
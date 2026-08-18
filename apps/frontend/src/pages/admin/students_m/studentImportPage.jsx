import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminCoreService } from '../../../services/adminCore.service'
import Card from '../../../components/ui/card'
import Button from '../../../components/ui/button'
import Alert from '../../../components/feedback/alert'
import Icon from '../../../components/ui/icon'
import { useNotification } from '../../../hooks/useNotification'
import { APP_CONFIG } from '../../../config/app.config'

export default function StudentImportPage() {
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useNotification()
  const navigate = useNavigate()

  const handleUpload = async () => {
    if (!file) return toast.error('Vui lòng chọn file Excel')
    setUploading(true)
    setError('')
    setResult(null)
    try {
      const res = await adminCoreService.importStudents(file)
      setResult(res)
      toast.success('Import xong')
    } catch (e) {
      setError(e.message)
    } finally { setUploading(false) }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Import học sinh từ Excel</h2>
          <p className="page-subtitle">File phải có các cột: username, password, student_code, full_name, birthdate, gender, email, phone...</p>
        </div>
        <div className="page-actions">
          <Button variant="ghost" onClick={() => navigate('/admin/students')}>← Quay lại</Button>
        </div>
      </div>

      <Card>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files[0])} />
        <button className="btn btn-outline btn-lg btn-full" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={18} /> {file ? file.name : 'Chọn file Excel (.xlsx)'}
        </button>
        <div className="mt-6">
          <Button onClick={handleUpload} loading={uploading} fullWidth size="lg" disabled={!file}>
            Import học sinh
          </Button>
        </div>
        {error && <div className="mt-4"><Alert type="error">{error}</Alert></div>}
        {result && (
          <div className="mt-4">
            <Alert type="success">
              Thành công: <strong>{result.success ?? 0}</strong> · Thất bại: <strong>{result.failed ?? 0}</strong>
            </Alert>
            {result.errors?.length > 0 && (
              <div className="table-wrapper mt-4">
                <table className="table">
                  <thead><tr><th>Dòng</th><th>Lỗi</th></tr></thead>
                  <tbody>{result.errors.map((e, i) => (
                    <tr key={i}><td>{e.row}</td><td>{e.message}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
import { useState } from 'react'
import { useFetch } from '../../../hooks/useFetch'
import { adminDiplomaService } from '../../../services/adminDiploma.service'
import Card from '../../../components/ui/card'
import Button from '../../../components/ui/button'
import Table from '../../../components/ui/table'
import Alert from '../../../components/feedback/alert'
import ConfirmDialog from '../../../components/feedback/confirmDialog'
import { useNotification } from '../../../hooks/useNotification'

export default function ReceiveDiplomasPage() {
  const [selected, setSelected] = useState([])
  const [confirmReceive, setConfirmReceive] = useState(false)
  const { toast } = useNotification()
  const { data: diplomas, loading, error, refetch } = useFetch(
    () => adminDiplomaService.getDiplomas({ status: 'NOT_STORED' }),
    []
  )

  const toggle = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  const handleReceive = async () => {
    try {
      if (selected.length > 1) await adminDiplomaService.bulkReceive(selected)
      else await adminDiplomaService.receiveDiploma(selected[0])
      toast.success('Đã cập nhật trạng thái bằng về trường')
      setSelected([]); setConfirmReceive(false); refetch()
    } catch (e) { toast.error(e.message) }
  }

  const columns = [
    { key: 'student_code', label: 'Mã HS', render: (r) => <strong>{r.student_code}</strong> },
    { key: 'student_name', label: 'Họ tên' },
    { key: 'diploma_number', label: 'Số hiệu' },
    { key: 'select', label: 'Chọn', align: 'right', render: (r) => (
      <input type="checkbox" checked={selected.includes(r._id)} onChange={() => toggle(r._id)} />
    ) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Nhận bằng về trường</h2>
          <p className="page-subtitle">Đánh dấu các bằng đã được Sở GD giao về trường</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => setConfirmReceive(true)} disabled={!selected.length}>
            Nhận {selected.length > 0 ? `(${selected.length})` : ''}
          </Button>
        </div>
      </div>

      {error && <Alert type="warning">{error.message} — Tính năng cần module Diploma (Phụ lục A).</Alert>}
      <Card>
        <Table columns={columns} data={diplomas || []} loading={loading} emptyText="Không có bằng chờ nhận" />
      </Card>

      <ConfirmDialog open={confirmReceive} title="Xác nhận nhận bằng" variant="primary"
        message={`Xác nhận ${selected.length} bằng đã về trường?`} confirmText="Xác nhận"
        onConfirm={handleReceive} onCancel={() => setConfirmReceive(false)} />
    </div>
  )
}
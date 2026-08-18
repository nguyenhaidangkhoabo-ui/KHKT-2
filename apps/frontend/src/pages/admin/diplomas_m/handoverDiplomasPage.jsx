import { useState } from 'react'
import { useFetch } from '../../../hooks/useFetch'
import { adminDiplomaService } from '../../../services/adminDiploma.service'
import Card from '../../../components/ui/card'
import Button from '../../../components/ui/button'
import Table from '../../../components/ui/table'
import Alert from '../../../components/feedback/alert'
import ConfirmDialog from '../../../components/feedback/confirmDialog'
import { useNotification } from '../../../hooks/useNotification'

export default function HandoverDiplomasPage() {
  const [selected, setSelected] = useState([])
  const [confirmHandover, setConfirmHandover] = useState(false)
  const { toast } = useNotification()
  const { data: diplomas, loading, error, refetch } = useFetch(
    () => adminDiplomaService.getDiplomas({ status: 'STORED' }),
    []
  )

  const toggle = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  const handleHandover = async () => {
    try {
      if (selected.length > 1) await adminDiplomaService.bulkHandover(selected)
      else await adminDiplomaService.handoverDiploma(selected[0])
      toast.success('Đã trao bằng thành công')
      setSelected([]); setConfirmHandover(false); refetch()
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
          <h2 className="page-title">Trao bằng cho học sinh</h2>
          <p className="page-subtitle">Chỉ các bằng đã về trường mới được trao</p>
        </div>
        <div className="page-actions">
          <Button variant="success" onClick={() => setConfirmHandover(true)} disabled={!selected.length}>
            Trao bằng {selected.length > 0 ? `(${selected.length})` : ''}
          </Button>
        </div>
      </div>

      {error && <Alert type="warning">{error.message} — Tính năng cần module Diploma (Phụ lục A).</Alert>}
      <Card>
        <Table columns={columns} data={diplomas || []} loading={loading} emptyText="Không có bằng sẵn sàng trao" />
      </Card>

      <ConfirmDialog open={confirmHandover} title="Xác nhận trao bằng" variant="success"
        message={`Xác nhận trao ${selected.length} bằng cho học sinh?`} confirmText="Trao bằng"
        onConfirm={handleHandover} onCancel={() => setConfirmHandover(false)} />
    </div>
  )
}
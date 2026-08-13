import { STATUS_LABELS } from '../../config/constants'

const STATUS_TYPE = {
  NOT_STORED: 'warning',
  STORED: 'info',
  HANDED_OVER: 'success',
}

export default function Badge({ status }) {
  const label = STATUS_LABELS[status] || status
  const type = STATUS_TYPE[status] || 'secondary'
  return <span className={`badge badge-${type}`}>{label}</span>
}
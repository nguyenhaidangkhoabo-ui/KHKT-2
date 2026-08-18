import EmptyState from '../feedback/emptyState'
import Spinner from './spinner'

export default function Table({
  columns = [], // [{ key, label, render?, align? }]
  data = [],
  loading = false,
  rowKey = '_id',
  emptyText = 'Không có dữ liệu',
  onRowClick,
}) {
  if (loading) {
    return <div className="text-center py-6"><Spinner size="lg" /></div>
  }

  if (!data.length) {
    return <EmptyState text={emptyText} />
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: col.align || 'left' }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[rowKey]} onClick={() => onRowClick?.(row)}>
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
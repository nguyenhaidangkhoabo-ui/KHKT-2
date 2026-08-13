import Spinner from './spinner'

export default function Table({ columns = [], data = [], loading, emptyText = 'Không có dữ liệu' }) {
  if (loading) {
    return <div className="text-center mt-4"><Spinner /></div>
  }
  if (data.length === 0) {
    return <div className="text-center text-secondary mt-4">{emptyText}</div>
  }
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map((col) => (
                <td key={col.key}>
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
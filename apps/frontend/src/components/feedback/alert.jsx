import { useState } from 'react'

export default function Alert({ type = 'info', children, closable = true }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className={`alert alert-${type}`}>
      <span>{children}</span>
      {closable && (
        <button className="alert-close" onClick={() => setVisible(false)}>×</button>
      )}
    </div>
  )
}
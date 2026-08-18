export default function Input({ label, error, hint, icon, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className={`input-wrap ${icon ? 'has-icon' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input className={`form-input ${error ? 'form-input-error' : ''}`} {...props} />
      </div>
      {error && <span className="form-error">{error}</span>}
      {!error && hint && <span className="form-hint">{hint}</span>}
    </div>
  )
}
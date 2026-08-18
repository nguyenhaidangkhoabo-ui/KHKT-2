export default function Select({ label, error, options = [], placeholder, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select className={`form-input form-select ${error ? 'form-input-error' : ''}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
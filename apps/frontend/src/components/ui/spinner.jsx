export default function Spinner({ size = 'md' }) {
  return <div className={`spinner spinner-${size}`} aria-label="Đang tải" />
}
import Spinner from './spinner'

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading = false,
  icon,
  children,
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  )
}
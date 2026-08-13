export default function Button({ variant = 'primary', fullWidth, children, ...props }) {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`}
      {...props}
    >
      {children}
    </button>
  )
}
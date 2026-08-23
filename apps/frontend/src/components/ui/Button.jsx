// Nút dùng chung toàn hệ thống.
// Props: variant ('primary' | 'secondary' | 'danger' | 'ghost' | 'outline'),
//        size ('sm' | 'md'), loading, disabled, type, onClick, className, children

const VARIANT_CLASSES = {
  primary:
    'bg-primary text-white hover:bg-primary-600 shadow-primary shadow-xs focus-visible:ring-primary/40',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 focus-visible:ring-slate-300',
  danger:
    'bg-accent text-white hover:bg-accent-600 shadow-accent shadow-xs focus-visible:ring-accent/40',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300',
  outline:
    'bg-white text-slate-700 border border-slate-200 hover:border-primary-300 hover:text-primary hover:bg-primary-50/50 focus-visible:ring-primary/30',
}

const SIZE_CLASSES = {
  sm: 'px-3 py-2 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'sm',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  children,
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-semibold whitespace-nowrap
        transition-all duration-150 cursor-pointer select-none
        focus:outline-none focus-visible:ring-2
        disabled:opacity-60 disabled:pointer-events-none
        ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary}
        ${SIZE_CLASSES[size] || SIZE_CLASSES.sm}
        ${className}
      `}
    >
      {loading && (
        <span
          className={`w-3.5 h-3.5 rounded-full animate-spin border-2 ${
            variant === 'primary' || variant === 'danger'
              ? 'border-white/40 border-t-white'
              : 'border-slate-400/40 border-t-slate-600'
          }`}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}

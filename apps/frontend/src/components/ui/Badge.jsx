// Nhãn trạng thái (Badge) dùng chung.
// Props: color — khóa màu, children — nội dung.

const COLOR_CLASSES = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  primary: 'bg-primary-50 text-primary border-primary-200',
}

export default function Badge({ color = 'slate', children }) {
  const colorClass = COLOR_CLASSES[color] || COLOR_CLASSES.slate

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md border
        text-[11px] font-bold leading-4 whitespace-nowrap
        ${colorClass}
      `}
    >
      {children}
    </span>
  )
}

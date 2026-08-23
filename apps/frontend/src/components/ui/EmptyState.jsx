// Trạng thái trống (EmptyState) dùng chung.
// Props: icon? (component lucide-react), title, description?, action?

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 animate-in fade-in duration-300">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

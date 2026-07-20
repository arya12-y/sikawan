function StatCard({ title, value, icon = 'bi-graph-up', variant = 'indigo', subtitle, trend }) {
  const variantStyles = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    primary: 'bg-indigo-500/10 text-indigo-400' // fallback for old usage
  }

  const iconStyle = variantStyles[variant] || variantStyles.indigo

  return (
    <div className="rounded-2xl border border-[#1E1E2E] bg-[#14141E] p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-100">{value}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconStyle}`}>
          <i className={`bi ${icon} text-xl`}></i>
        </div>
      </div>
      {trend && <div className="mt-4 flex items-center text-sm">{trend}</div>}
    </div>
  )
}

export default StatCard

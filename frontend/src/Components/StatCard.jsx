function StatCard({ title, value, icon = 'bi-graph-up', variant = 'primary', subtitle, trend }) {
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-body">
        <div>
          <p className="stat-card-title">{title}</p>
          <h3 className="stat-card-value">{value}</h3>
          {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
        </div>
        <div className="stat-card-icon">
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
      {trend && <div className="stat-card-footer">{trend}</div>}
    </div>
  )
}

export default StatCard

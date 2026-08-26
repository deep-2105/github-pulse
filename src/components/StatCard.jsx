export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = "#aa3bff",
  trend,
  onClick,
}) {
  return (
    <div
      className={`stat-card ${onClick ? "stat-card-clickable" : ""}`}
      onClick={onClick}
      style={{ "--card-accent": accentColor }}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-wrap" style={{ backgroundColor: `${accentColor}18`, color: accentColor }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      </div>

      {trend && (
        <div className="stat-card-footer">
          <span className="stat-card-trend">{trend}</span>
        </div>
      )}
    </div>
  );
}


export function Card({ color, icon, label, value, growth, onClick }) {
  return (
    <div className={`card card-${color}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <div className="card-menu">⋮</div>
      </div>
      
      <p className="card-label">{label}</p>
      <h2 className="card-value">{value}</h2>
      <div className="card-growth">{growth}</div>
    </div>
  );
}

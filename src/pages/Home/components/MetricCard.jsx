export function MetricCard({ label, value, growth }) {
  return (
    <div className="metric-card">
      <p>{label}</p>
      <h2>{value}</h2>
      <span className="metric-growth up">{growth}</span>
    </div>
  );
}

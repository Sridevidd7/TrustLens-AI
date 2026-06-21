export default function StatCard({ label, value, hint, icon }) {
  return <div className="statCard"><div className="statIcon">{icon}</div><div><p>{label}</p><h3>{value}</h3><span>{hint}</span></div></div>;
}

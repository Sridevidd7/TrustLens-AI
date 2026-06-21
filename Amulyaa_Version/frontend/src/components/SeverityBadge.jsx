export default function SeverityBadge({ severity }) {
  const normalized = severity?.toLowerCase() || 'low'
  return <span className={`badge ${normalized}`}>{severity}</span>
}

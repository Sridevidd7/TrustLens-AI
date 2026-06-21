export default function ConfidenceBadge({ confidence }) {
  const label = confidence >= 85 ? 'confident' : 'review'
  return <span className={`badge ${label}`}>{confidence}%</span>
}

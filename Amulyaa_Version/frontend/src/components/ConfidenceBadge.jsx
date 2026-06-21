export default function ConfidenceBadge({ label, score }) {
  const cls = label?.toLowerCase().includes('high') ? 'high' : label?.toLowerCase().includes('low') ? 'low' : 'review';
  return <span className={`confidence ${cls}`}>{label || 'Review recommended'} {score ? `• ${score}%` : ''}</span>;
}

export default function SeverityBadge({ severity }) {
  return <span className={`severity ${String(severity || '').toLowerCase()}`}>{severity}</span>;
}

export default function GlassPanel({ children, className = '' }) {
  return <section className={`glass ${className}`}>{children}</section>;
}

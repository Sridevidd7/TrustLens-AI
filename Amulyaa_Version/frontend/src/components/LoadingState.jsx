export default function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="empty-state">
      <h3>{message}</h3>
    </div>
  )
}

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return <div className="modalBackdrop" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modalHead"><h3>{title}</h3><button onClick={onClose}>×</button></div>{children}</div></div>;
}

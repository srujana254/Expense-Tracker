function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button type="button" className="toast-close" onClick={() => onRemove(toast.id)}>
            x
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer

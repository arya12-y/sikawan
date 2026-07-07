function LoadingSpinner({ text = 'Memuat data...' }) {
  return (
    <div className="loading-state">
      <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
      <span>{text}</span>
    </div>
  )
}

export default LoadingSpinner

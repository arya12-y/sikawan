function FormModal({ id, title, children, onSubmit, submitText = 'Simpan', size = 'modal-lg', loading = false }) {
  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-labelledby={`${id}Label`} aria-hidden="true">
      <div className={`modal-dialog modal-dialog-centered ${size}`}>
        <form className="modal-content border-0 shadow-lg" onSubmit={onSubmit}>
          <div className="modal-header">
            <h5 className="modal-title" id={`${id}Label`}>{title}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Batal</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormModal

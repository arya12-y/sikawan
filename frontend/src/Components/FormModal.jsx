function FormModal({ id, title, children, onSubmit, submitText = 'Simpan', size = 'max-w-3xl', loading = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity" id={id} role="dialog" aria-modal="true" aria-labelledby={`${id}Label`}>
      <div className={`relative w-full ${size} mx-4 transition-all transform scale-100`}>
        <form className="flex flex-col rounded-2xl bg-[#14141E] shadow-2xl" onSubmit={onSubmit}>
          <div className="flex items-center justify-between border-b border-[#1E1E2E] px-6 py-4">
            <h5 className="text-lg font-bold text-slate-100" id={`${id}Label`}>{title}</h5>
            <button type="button" className="text-slate-400 hover:text-slate-400 focus:outline-none" data-bs-dismiss="modal" aria-label="Close">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
            {children}
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-[#1E1E2E] bg-[#09090E]/50 px-6 py-4 rounded-b-2xl">
            <button type="button" className="rounded-xl border border-[#1E1E2E] bg-[#14141E] px-5 py-2.5 text-sm font-semibold text-slate-300 shadow-sm transition hover:bg-[#14141E]/[0.03] focus:outline-none focus:ring-2 focus:ring-slate-200" data-bs-dismiss="modal">
              Batal
            </button>
            <button type="submit" className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
              {loading && <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormModal

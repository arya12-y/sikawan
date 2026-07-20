function LoadingSpinner({ text = 'Memuat data...' }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#09090E]">
      <div className="spinner-premium h-10 w-10" />
      <div className="mt-5 text-center">
        <p className="text-sm font-semibold text-indigo-400">SIKAWAN</p>
        <p className="mt-2 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner

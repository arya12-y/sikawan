import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

function DataTable({ columns = [], data = [], pageSize = 10, title, actions, emptyText = 'Tidak ada data' }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim()

    if (!keyword) {
      return data
    }

    return data.filter((row) => columns.some((column) => String(column.render ? column.render(row) : row[column.key] ?? '').toLowerCase().includes(keyword)))
  }, [columns, data, search])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSearch = (event) => {
    setSearch(event.target.value)
    setPage(1)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#14141E] shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#1E1E2E] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h5 className="text-lg font-bold text-slate-100">{title}</h5>}
          <span className="text-sm text-slate-400">{filteredData.length} data ditemukan</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input 
              className="block w-full rounded-xl border border-[#1E1E2E] bg-[#09090E] py-2 pl-10 pr-3 text-sm text-slate-100 focus:border-indigo-500 focus:bg-[#14141E] focus:outline-none focus:ring-2 focus:ring-indigo-100 sm:w-64" 
              value={search} 
              onChange={handleSearch} 
              placeholder="Cari data..." 
            />
          </div>
          {actions}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#09090E] text-xs uppercase tracking-wider text-slate-400">
            <tr>{columns.map((column) => <th className="px-6 py-4 font-semibold" key={column.key}>{column.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-[#14141E]">
            {visibleData.length > 0 ? visibleData.map((row, index) => (
              <tr className="transition hover:bg-[#14141E]/[0.03]" key={row.id ?? index}>
                {columns.map((column) => <td className="px-6 py-4 text-slate-300" key={column.key}>{column.render ? column.render(row, index) : row[column.key]}</td>)}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">{emptyText}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-[#1E1E2E] bg-[#09090E] px-6 py-4">
        <span className="text-sm text-slate-400">Halaman <span className="font-medium text-slate-100">{currentPage}</span> dari <span className="font-medium text-slate-100">{totalPages}</span></span>
        <div className="flex gap-2">
          <button className="rounded-lg border border-[#1E1E2E] bg-[#14141E] px-3 py-1.5 text-sm font-medium text-slate-300 shadow-sm transition hover:bg-[#14141E]/[0.03] disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Sebelumnya</button>
          <button className="rounded-lg border border-[#1E1E2E] bg-[#14141E] px-3 py-1.5 text-sm font-medium text-slate-300 shadow-sm transition hover:bg-[#14141E]/[0.03] disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Berikutnya</button>
        </div>
      </div>
    </div>
  )
}

export default DataTable

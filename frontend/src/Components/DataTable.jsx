import { useMemo, useState } from 'react'

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
    <div className="card admin-card">
      <div className="card-header admin-card-header">
        <div>
          {title && <h5 className="card-title mb-0">{title}</h5>}
          <span className="text-muted small">{filteredData.length} data ditemukan</span>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="input-group input-group-sm table-search">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input className="form-control" value={search} onChange={handleSearch} placeholder="Cari data..." />
          </div>
          {actions}
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {visibleData.length > 0 ? visibleData.map((row, index) => (
              <tr key={row.id ?? index}>
                {columns.map((column) => <td key={column.key}>{column.render ? column.render(row, index) : row[column.key]}</td>)}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-5">{emptyText}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="card-footer admin-card-footer">
        <span className="small text-muted">Halaman {currentPage} dari {totalPages}</span>
        <div className="btn-group btn-group-sm">
          <button className="btn btn-outline-secondary" type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Sebelumnya</button>
          <button className="btn btn-outline-secondary" type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Berikutnya</button>
        </div>
      </div>
    </div>
  )
}

export default DataTable

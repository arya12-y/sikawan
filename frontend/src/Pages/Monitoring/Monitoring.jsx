import { useCallback, useEffect, useState } from 'react'
import api from '../../api/axios'

const normalizeRows = (payload) => {
  const rows = payload?.data ?? payload
  return Array.isArray(rows) ? rows : []
}

function Monitoring() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/monitoring')
      setRows(normalizeRows(res.data))
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => load())
  }, [load])

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1">Monitoring Kompetensi</h4>
            <p className="text-muted mb-0">Pantau perkembangan asesmen dan progres belajar seluruh OPD secara real-time.</p>
          </div>
          <button className="btn btn-outline-secondary" onClick={load}><i className="bi bi-arrow-clockwise me-1"></i>Refresh</button>
        </div>

        {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : rows.length === 0 ? (
          <div className="text-center py-5 text-muted">Belum ada data progres.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Peserta</th>
                  <th>Asesmen</th>
                  <th>Progress / Nilai</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="fw-semibold">{row.user?.name ?? '-'}</div>
                      <small className="text-muted">{row.user?.opd_name ?? 'OPD'}</small>
                    </td>
                    <td>{row.asesmen?.judul ?? '-'}</td>
                    <td style={{ minWidth: 200 }}>
                      <div className="d-flex justify-content-between mb-1">
                        <small className="fw-bold">{row.status === 'selesai' ? `Nilai: ${row.nilai}` : 'Sedang mengerjakan'}</small>
                        <small className="text-muted">{row.status === 'selesai' ? '100%' : '50%'}</small>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div className={`progress-bar ${row.status === 'selesai' ? (row.lulus ? 'bg-success' : 'bg-danger') : 'bg-primary progress-bar-striped progress-bar-animated'}`} style={{ width: row.status === 'selesai' ? '100%' : '50%' }}></div>
                      </div>
                    </td>
                    <td>
                      {row.status === 'selesai' ? (
                        row.lulus ? <span className="badge bg-success">Lulus</span> : <span className="badge bg-danger">Tidak Lulus</span>
                      ) : (
                        <span className="badge bg-info">Mengerjakan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Monitoring

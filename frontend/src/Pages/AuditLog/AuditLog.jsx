import { useCallback, useEffect, useState } from 'react'
import api from '../../api/axios'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

function AuditLog() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/audit-logs')
      setRows(normalize(res.data))
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
            <h4 className="fw-bold mb-1">Audit Log</h4>
            <p className="text-muted mb-0">Catatan riwayat aktivitas pengguna di dalam sistem.</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={load}><i className="bi bi-arrow-clockwise me-1"></i>Refresh</button>
        </div>
        {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : rows.length === 0 ? (
          <div className="text-center py-5 text-muted">Belum ada riwayat aktivitas.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light"><tr><th>Waktu</th><th>User</th><th>Action</th><th>Module</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.id}>
                <td className="text-muted"><small>{new Date(row.created_at).toLocaleString('id-ID')}</small></td>
                <td>{row.user?.name || '-'}</td>
                <td><span className={`badge bg-${row.action === 'create' ? 'success' : row.action === 'update' ? 'primary' : row.action === 'delete' ? 'danger' : 'secondary'}`}>{row.action}</span></td>
                <td>{row.module}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditLog

import { useEffect, useState } from 'react'
import api from '../../api/axios'

const normalizeRows = (payload) => {
  const rows = payload?.data ?? payload
  return Array.isArray(rows) ? rows : []
}

function Monitoring() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    api.get('/monitoring').then((res) => setRows(normalizeRows(res.data))).catch(() => setRows([]))
  }, [])

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="mb-3">Monitoring</h4>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead><tr><th>Nama</th><th>OPD</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id}><td>{row.nama ?? row.name ?? '-'}</td><td>{row.opd ?? row.opd_name ?? '-'}</td><td>{row.progress ?? '-'}</td><td>{row.status ?? '-'}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Monitoring

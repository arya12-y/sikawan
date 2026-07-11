import { useCallback, useEffect, useState } from 'react'
import api from '../../api/axios'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

function Laporan() {
  const [type, setType] = useState('asesmen')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/laporan/${type}`)
      setRows(normalize(res.data))
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    queueMicrotask(() => load())
  }, [load])

  const download = async (format) => {
    try {
      const endpoint = format === 'pdf' ? '/laporan/export-pdf' : '/laporan/export-excel'
      const res = await api.get(endpoint, { params: { type }, responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `laporan-${type}.${format === 'pdf' ? 'pdf' : 'csv'}`
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal export laporan')
    }
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold mb-1">Laporan</h4>
            <p className="text-muted mb-0">Laporan asesmen dan sertifikasi dalam bentuk tabel, PDF, dan Excel/CSV.</p>
          </div>
          <div className="d-flex gap-2">
            <select className="form-select bg-light border-0" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="asesmen">Asesmen</option>
              <option value="sertifikat">Sertifikat</option>
            </select>
            <button className="btn btn-danger d-flex align-items-center gap-2" onClick={() => download('pdf')}>
              <i className="bi bi-file-earmark-pdf"></i> PDF
            </button>
            <button className="btn btn-success d-flex align-items-center gap-2" onClick={() => download('excel')}>
              <i className="bi bi-file-earmark-excel"></i> Excel
            </button>
          </div>
        </div>

        {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : rows.length === 0 ? (
          <div className="text-center py-5 text-muted">Belum ada data laporan.</div>
        ) : (
          <div className="table-responsive mt-2">
            <table className="table table-hover align-middle">
              <thead className="table-light"><tr><th>Nama</th><th>Asesmen</th><th>Nilai</th><th>Status</th><th>Tanggal</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.id}>
                <td>{row.user?.name || '-'}</td>
                <td>{row.asesmen?.judul || row.nomor_sertifikat || '-'}</td>
                <td>{row.nilai || row.nilai_akhir || '-'}</td>
                <td>{row.status || (row.is_active ? 'aktif' : '-')}</td>
                <td>{new Date(row.created_at || row.tanggal_terbit).toISOString().split('T')[0]}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Laporan

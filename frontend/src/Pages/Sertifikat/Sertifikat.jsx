import { useCallback, useEffect, useState } from 'react'
import api from '../../api/axios'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

function Sertifikat() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/sertifikats')
      setRows(normalize(res.data))
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memuat sertifikat')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => load())
  }, [load])

  const download = async (row) => {
    try {
      const res = await api.get(`/sertifikats/${row.id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `${row.nomor_sertifikat}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal download sertifikat')
    }
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold mb-1">Sertifikat</h4>
            <p className="text-muted mb-0">Sertifikat kompetensi Walidata yang sudah lulus asesmen.</p>
          </div>
          <button className="btn btn-outline-secondary" onClick={load}><i className="bi bi-arrow-clockwise me-1"></i>Refresh</button>
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2"></div>Memuat...</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-award d-block mb-2" style={{ fontSize: '2.5rem' }}></i>
            Belum ada sertifikat. Selesaikan asesmen dan capai nilai lulus.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Nama</th>
                  <th>Kompetensi</th>
                  <th>Level</th>
                  <th>Nilai</th>
                  <th>Tanggal Terbit</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="fw-semibold">{row.nomor_sertifikat}</td>
                    <td>{row.user?.name || '-'}</td>
                    <td>{row.kompetensi?.nama || '-'}</td>
                    <td><span className="badge bg-primary">{row.level?.nama || row.kategori_kompetensi || '-'}</span></td>
                    <td>{row.nilai_akhir}</td>
                    <td>{row.tanggal_terbit}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-success" onClick={() => download(row)}>
                        <i className="bi bi-download me-1"></i>Download
                      </button>
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

export default Sertifikat

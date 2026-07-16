import { useEffect, useState } from 'react'
import api from '../../api/axios'

function Settings() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    api.get('/settings').then((res) => {
      setUrl(res.data?.cert_verify_url || '')
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/settings', { cert_verify_url: url })
      setMsg({ type: 'success', text: 'Pengaturan berhasil disimpan' })
    } catch (e) {
      setMsg({ type: 'danger', text: e.response?.data?.message || 'Gagal menyimpan' })
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(null), 4000)
    }
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h4 className="fw-bold mb-1">Pengaturan</h4>
        <p className="text-muted mb-4">Konfigurasi URL verifikasi untuk QR Code sertifikat.</p>

        {msg && <div className={`alert alert-${msg.type} alert-dismissible fade show py-2`}>{msg.text}<button type="button" className="btn-close" onClick={() => setMsg(null)}></button></div>}

        {loading ? <div className="text-center py-4 text-muted">Memuat...</div> : (
          <div className="row g-3" style={{ maxWidth: 600 }}>
            <div className="col-12">
              <label className="form-label fw-semibold">URL Verifikasi Sertifikat</label>
              <input className="form-control" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/verify" />
              <small className="text-muted">QR Code pada sertifikat akan mengarah ke URL ini + nomor sertifikat (contoh: https://example.com/verify/SKW-20260716-ABC123)</small>
            </div>
            <div className="col-12">
              <button className="btn btn-primary" disabled={saving} onClick={save}>
                {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Menyimpan...</> : 'Simpan Pengaturan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings

import { useForm } from 'react-hook-form'
import api from '../../api/axios'

function BroadcastNotifikasi() {
  const { register, handleSubmit, reset } = useForm()

  const submit = async (data) => {
    try {
      const res = await api.post('/notifikasis', data)
      alert(res.data?.message || 'Notifikasi berhasil dikirim')
      reset({ role: '', judul: '', pesan: '', tipe: 'info', link: '' })
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal mengirim notifikasi')
    }
  }

  return (
    <div className="card shadow-sm border-0" style={{ maxWidth: 600 }}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-4 gap-3">
          <div className="pembelajaran-icon-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
            <i className="bi bi-bell-fill"></i>
          </div>
          <div>
            <h4 className="fw-bold mb-1">Kirim Notifikasi</h4>
            <p className="text-muted mb-0">Kirim pemberitahuan ke pengguna tertentu.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(submit)}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Tujuan (Role)</label>
            <select className="form-select" {...register('role', { required: true })}>
              <option value="">-- Pilih Role --</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin Diskominfo">Admin Diskominfo</option>
              <option value="Penguji">Penguji</option>
              <option value="Walidata">Walidata</option>
              <option value="Pimpinan">Pimpinan</option>
            </select>
            <small className="text-muted">Notifikasi akan dikirim ke semua pengguna dengan role yang dipilih.</small>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Judul Notifikasi</label>
            <input className="form-control" {...register('judul', { required: true })} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Pesan</label>
            <textarea className="form-control" rows="3" {...register('pesan', { required: true })}></textarea>
          </div>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Tipe (Warna Icon)</label>
              <select className="form-select" {...register('tipe')}>
                <option value="info">Info (Biru)</option>
                <option value="success">Success (Hijau)</option>
                <option value="warning">Warning (Kuning)</option>
                <option value="danger">Danger (Merah)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Link / URL (Opsional)</label>
              <input className="form-control" placeholder="https://..." {...register('link')} />
            </div>
          </div>
          <div className="text-end">
            <button className="btn btn-primary px-4"><i className="bi bi-send me-2"></i>Kirim</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BroadcastNotifikasi

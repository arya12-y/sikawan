import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../../api/axios'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

function Bidang() {
  const [rows, setRows] = useState([])
  const [opds, setOpds] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      const res = await api.get('/bidangs', { params })
      setRows(normalize(res.data))
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [search])

  const loadRefs = useCallback(async () => {
    try {
      const res = await api.get('/opds')
      setOpds(normalize(res.data))
    } catch {
      setOpds([])
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => { load(); loadRefs() })
  }, [load, loadRefs])

  const openCreate = () => {
    setEditing(null)
    reset({ opd_id: '', nama: '', deskripsi: '', is_active: 1 })
    setShowForm(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    reset({ opd_id: row.opd_id || '', nama: row.nama || '', deskripsi: row.deskripsi || '', is_active: row.is_active ? 1 : 0 })
    setShowForm(true)
  }

  const save = async (data) => {
    const payload = { opd_id: Number(data.opd_id), nama: data.nama, deskripsi: data.deskripsi || null, is_active: Number(data.is_active) === 1 }
    try {
      if (editing?.id) await api.put(`/bidangs/${editing.id}`, payload)
      else await api.post('/bidangs', payload)
      setShowForm(false)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan data')
    }
  }

  const remove = async (row) => {
    if (!confirm('Hapus bidang ini?')) return
    try {
      await api.delete(`/bidangs/${row.id}`)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menghapus')
    }
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3"><Link className="btn btn-outline-secondary btn-sm" to="/master-data"><i className="bi bi-arrow-left me-1"></i>Kembali</Link><h4 className="fw-bold mb-0">Bidang</h4></div>
          <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Tambah</button>
        </div>

        <div className="row g-2 mb-4">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
              <input className="form-control border-start-0 ps-0" placeholder="Cari bidang..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
            </div>
          </div>
          <div className="col-md-3"><button className="btn btn-outline-secondary w-100" onClick={load}><i className="bi bi-arrow-clockwise me-1"></i>Refresh</button></div>
        </div>

        {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light"><tr><th>Nama Bidang</th><th>OPD</th><th>Deskripsi</th><th className="text-end">Aksi</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.id}>
                <td className="fw-semibold">{row.nama}</td>
                <td>{row.opd?.nama || opds.find((o) => o.id === row.opd_id)?.nama || '-'}</td>
                <td><small className="text-muted">{row.deskripsi || '-'}</small></td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(row)} title="Edit"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(row)} title="Hapus"><i className="bi bi-trash"></i></button>
                </td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-dialog"><div className="modal-content"><form onSubmit={handleSubmit(save)}>
            <div className="modal-header"><h5 className="modal-title">{editing ? 'Edit' : 'Tambah'} Bidang</h5><button type="button" className="btn-close" onClick={() => setShowForm(false)} /></div>
            <div className="modal-body"><div className="row g-3">
              <div className="col-12"><label className="form-label fw-semibold">OPD <span className="text-danger">*</span></label><select className="form-select" {...register('opd_id', { required: true })}><option value="">Pilih OPD</option>{opds.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}</select></div>
              <div className="col-12"><label className="form-label fw-semibold">Nama Bidang <span className="text-danger">*</span></label><input className="form-control" {...register('nama', { required: true })} /></div>
              <div className="col-12"><label className="form-label fw-semibold">Deskripsi</label><textarea className="form-control" rows="2" {...register('deskripsi')}></textarea></div>
              <div className="col-12"><label className="form-label fw-semibold">Status</label><select className="form-select" {...register('is_active')}><option value={1}>Aktif</option><option value={0}>Nonaktif</option></select></div>
            </div></div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button><button className="btn btn-primary">Simpan</button></div>
          </form></div></div>
        </div>
      )}
    </div>
  )
}

export default Bidang

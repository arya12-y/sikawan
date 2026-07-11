import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../../api/axios'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

function Penguji() {
  const [rows, setRows] = useState([])
  const [users, setUsers] = useState([])
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
      const res = await api.get('/pengujis', { params })
      setRows(normalize(res.data))
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [search])

  const loadRefs = useCallback(async () => {
    try {
      const res = await api.get('/users?per_page=200')
      setUsers(normalize(res.data))
    } catch {
      setUsers([])
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => { load(); loadRefs() })
  }, [load, loadRefs])

  const openCreate = () => {
    setEditing(null)
    reset({ user_id: '', nip: '', bidang_keahlian: '', bio: '', is_active: 1 })
    setShowForm(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    reset({
      user_id: row.user_id || '',
      nip: row.nip || '',
      bidang_keahlian: row.bidang_keahlian || '',
      bio: row.bio || '',
      is_active: row.is_active ? 1 : 0,
    })
    setShowForm(true)
  }

  const save = async (data) => {
    const payload = {
      user_id: Number(data.user_id),
      nip: data.nip || null,
      bidang_keahlian: data.bidang_keahlian || null,
      bio: data.bio || null,
      is_active: Number(data.is_active) === 1,
    }

    try {
      if (editing?.id) await api.put(`/pengujis/${editing.id}`, payload)
      else await api.post('/pengujis', payload)
      setShowForm(false)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan data')
    }
  }

  const remove = async (row) => {
    if (!confirm('Hapus penguji ini?')) return
    try {
      await api.delete(`/pengujis/${row.id}`)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menghapus')
    }
  }

  const getUserName = (id) => users.find((u) => u.id === Number(id))?.name || '-'

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3"><Link className="btn btn-outline-secondary btn-sm" to="/master-data"><i className="bi bi-arrow-left me-1"></i>Kembali</Link><h4 className="fw-bold mb-0">Penguji</h4></div>
          <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Tambah</button>
        </div>

        <div className="row g-2 mb-4">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
              <input className="form-control border-start-0 ps-0" placeholder="Cari penguji..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
            </div>
          </div>
          <div className="col-md-3"><button className="btn btn-outline-secondary w-100" onClick={load}><i className="bi bi-arrow-clockwise me-1"></i>Refresh</button></div>
        </div>

        {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light"><tr><th>Nama</th><th>NIP</th><th>Bidang Keahlian</th><th>Status</th><th className="text-end">Aksi</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.id}>
                <td className="fw-semibold">{row.user?.name || getUserName(row.user_id)}</td>
                <td>{row.nip || '-'}</td>
                <td>{row.bidang_keahlian || '-'}</td>
                <td>{row.is_active ? <span className="badge bg-success">Aktif</span> : <span className="badge bg-secondary">Nonaktif</span>}</td>
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
          <div className="modal-dialog modal-lg"><div className="modal-content"><form onSubmit={handleSubmit(save)}>
            <div className="modal-header"><h5 className="modal-title">{editing ? 'Edit' : 'Tambah'} Penguji</h5><button type="button" className="btn-close" onClick={() => setShowForm(false)} /></div>
            <div className="modal-body"><div className="row g-3">
              <div className="col-md-6"><label className="form-label fw-semibold">Nama User <span className="text-danger">*</span></label><select className="form-select" {...register('user_id', { required: true })}><option value="">Pilih User</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}</select></div>
              <div className="col-md-6"><label className="form-label fw-semibold">NIP</label><input className="form-control" {...register('nip')} /></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Bidang Keahlian</label><input className="form-control" {...register('bidang_keahlian')} /></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Status</label><select className="form-select" {...register('is_active')}><option value={1}>Aktif</option><option value={0}>Nonaktif</option></select></div>
              <div className="col-12"><label className="form-label fw-semibold">Bio</label><textarea className="form-control" rows="3" {...register('bio')}></textarea></div>
            </div></div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button><button className="btn btn-primary">Simpan</button></div>
          </form></div></div>
        </div>
      )}
    </div>
  )
}

export default Penguji

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../../api/axios'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

function Walidata() {
  const [rows, setRows] = useState([])
  const [users, setUsers] = useState([])
  const [opds, setOpds] = useState([])
  const [bidangs, setBidangs] = useState([])
  const [jabatans, setJabatans] = useState([])
  const [levels, setLevels] = useState([])
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
      const res = await api.get('/walidatas', { params })
      setRows(normalize(res.data))
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [search])

  const loadRefs = useCallback(async () => {
    try {
      const [u, o, b, j, l] = await Promise.all([api.get('/users?per_page=200'), api.get('/opds'), api.get('/bidangs'), api.get('/jabatans'), api.get('/levels')])
      setUsers(normalize(u.data))
      setOpds(normalize(o.data))
      setBidangs(normalize(b.data))
      setJabatans(normalize(j.data))
      setLevels(normalize(l.data))
    } catch {
      setUsers([]); setOpds([]); setBidangs([]); setJabatans([]); setLevels([])
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => { load(); loadRefs() })
  }, [load, loadRefs])

  const openCreate = () => {
    setEditing(null)
    reset({ user_id: '', opd_id: '', bidang_id: '', jabatan_id: '', level_id: '', nip: '', nilai_kompetensi: 0, is_active: 1 })
    setShowForm(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    reset({
      user_id: row.user_id || '',
      opd_id: row.opd_id || '',
      bidang_id: row.bidang_id || '',
      jabatan_id: row.jabatan_id || '',
      level_id: row.level_id || '',
      nip: row.nip || '',
      nilai_kompetensi: row.nilai_kompetensi || 0,
      is_active: row.is_active ? 1 : 0,
    })
    setShowForm(true)
  }

  const save = async (data) => {
    const payload = {
      user_id: Number(data.user_id),
      opd_id: Number(data.opd_id),
      bidang_id: data.bidang_id ? Number(data.bidang_id) : null,
      jabatan_id: data.jabatan_id ? Number(data.jabatan_id) : null,
      level_id: data.level_id ? Number(data.level_id) : null,
      nip: data.nip || null,
      nilai_kompetensi: Number(data.nilai_kompetensi || 0),
      is_active: Number(data.is_active) === 1,
    }

    try {
      if (editing?.id) await api.put(`/walidatas/${editing.id}`, payload)
      else await api.post('/walidatas', payload)
      setShowForm(false)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan data')
    }
  }

  const remove = async (row) => {
    if (!confirm(`Hapus walidata ini?`)) return
    try {
      await api.delete(`/walidatas/${row.id}`)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menghapus')
    }
  }

  const getName = (items, id) => items.find((i) => i.id === Number(id))?.nama || '-'
  const getUserName = (id) => users.find((u) => u.id === Number(id))?.name || '-'

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3"><Link className="btn btn-outline-secondary btn-sm" to="/master-data"><i className="bi bi-arrow-left me-1"></i>Kembali</Link><h4 className="fw-bold mb-0">Walidata</h4></div>
          <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Tambah</button>
        </div>

        <div className="row g-2 mb-4">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
              <input className="form-control border-start-0 ps-0" placeholder="Cari walidata..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
            </div>
          </div>
          <div className="col-md-3"><button className="btn btn-outline-secondary w-100" onClick={load}><i className="bi bi-arrow-clockwise me-1"></i>Refresh</button></div>
        </div>

        {loading ? <div className="text-center py-5 text-muted">Memuat...</div> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light"><tr><th>Nama</th><th>NIP</th><th>OPD</th><th>Bidang</th><th>Jabatan</th><th>Level</th><th>Nilai</th><th className="text-end">Aksi</th></tr></thead>
              <tbody>{rows.map((row) => <tr key={row.id}>
                <td className="fw-semibold">{row.user?.name || getUserName(row.user_id)}</td>
                <td>{row.nip || '-'}</td>
                <td>{row.opd?.nama || getName(opds, row.opd_id)}</td>
                <td>{row.bidang?.nama || getName(bidangs, row.bidang_id)}</td>
                <td>{row.jabatan?.nama || getName(jabatans, row.jabatan_id)}</td>
                <td>{row.level?.nama || getName(levels, row.level_id)}</td>
                <td>{row.nilai_kompetensi}</td>
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
            <div className="modal-header"><h5 className="modal-title">{editing ? 'Edit' : 'Tambah'} Walidata</h5><button type="button" className="btn-close" onClick={() => setShowForm(false)} /></div>
            <div className="modal-body"><div className="row g-3">
              <div className="col-md-6"><label className="form-label fw-semibold">Nama User <span className="text-danger">*</span></label><select className="form-select" {...register('user_id', { required: true })}><option value="">Pilih User</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}</select></div>
              <div className="col-md-6"><label className="form-label fw-semibold">NIP</label><input className="form-control" {...register('nip')} /></div>
              <div className="col-md-6"><label className="form-label fw-semibold">OPD <span className="text-danger">*</span></label><select className="form-select" {...register('opd_id', { required: true })}><option value="">Pilih OPD</option>{opds.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}</select></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Bidang</label><select className="form-select" {...register('bidang_id')}><option value="">Pilih Bidang</option>{bidangs.map((b) => <option key={b.id} value={b.id}>{b.nama}</option>)}</select></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Jabatan</label><select className="form-select" {...register('jabatan_id')}><option value="">Pilih Jabatan</option>{jabatans.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}</select></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Level</label><select className="form-select" {...register('level_id')}><option value="">Pilih Level</option>{levels.map((l) => <option key={l.id} value={l.id}>{l.nama}</option>)}</select></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Nilai Kompetensi</label><input className="form-control" type="number" step="0.01" {...register('nilai_kompetensi')} /></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Status</label><select className="form-select" {...register('is_active')}><option value={1}>Aktif</option><option value={0}>Nonaktif</option></select></div>
            </div></div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button><button className="btn btn-primary">Simpan</button></div>
          </form></div></div>
        </div>
      )}
    </div>
  )
}

export default Walidata

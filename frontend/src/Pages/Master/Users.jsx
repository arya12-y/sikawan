import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

const roles = ['Super Admin', 'Admin Diskominfo', 'Penguji', 'Walidata', 'Pimpinan']
const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])
const getRole = (user) => user.roles?.[0]?.name ?? user.roles?.[0] ?? 'Walidata'

function Users() {
  const { user: currentUser } = useAuth()
  const canManage = currentUser?.roles?.some((role) => ['Super Admin', 'Admin Diskominfo'].includes(role.name ?? role))
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/users', { params: { search } })
      setRows(normalize(res.data))
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memuat pengguna')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { queueMicrotask(load) }, [load])

  const update = async (user, data) => {
    try {
      await api.patch(`/users/${user.id}`, data)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memperbarui pengguna')
    }
  }

  const updateRole = (user, role) => {
    if (role !== getRole(user) && confirm(`Ubah role ${user.name} menjadi ${role}?`)) update(user, { roles: [role] })
  }

  const toggleActive = (user) => {
    const isActive = !user.is_active
    if (confirm(`${isActive ? 'Aktifkan' : 'Nonaktifkan'} akun ${user.name}?`)) update(user, { is_active: isActive })
  }

  const openCreate = () => {
    reset({ name: '', email: '', password: '', nip: '', phone: '', role: 'Admin Diskominfo', is_active: 1 })
    setShowForm(true)
  }

  const createUser = async (data) => {
    try {
      await api.post('/users', { ...data, roles: [data.role], is_active: Number(data.is_active) === 1 })
      setShowForm(false)
      load()
    } catch (e) {
      const messages = e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join('\n') : e.response?.data?.message
      alert(messages || 'Gagal membuat akun')
    }
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-start gap-3"><Link className="btn btn-outline-secondary btn-sm mt-1" to="/master-data"><i className="bi bi-arrow-left me-1"></i>Kembali</Link><div><h4 className="fw-bold mb-1">Pengguna & Hak Akses</h4><p className="text-muted mb-0">Buat akun internal dan atur role pengguna sistem.</p></div></div>
          {canManage && <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-person-plus me-1"></i>Tambah Pengguna</button>}
        </div>
        <div className="row g-2 mb-4">
          <div className="col-md-6"><div className="input-group"><span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span><input className="form-control border-start-0 ps-0" placeholder="Cari nama, email, atau NIP..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} /></div></div>
          <div className="col-md-3"><button className="btn btn-outline-secondary w-100" onClick={load} disabled={loading}><i className="bi bi-arrow-clockwise me-1"></i>{loading ? 'Memuat...' : 'Refresh'}</button></div>
        </div>
        <div className="table-responsive"><table className="table table-hover align-middle">
          <thead className="table-light"><tr><th>Nama</th><th>Email</th><th>NIP</th><th>Role</th><th>Status</th><th className="text-end">Aksi</th></tr></thead>
          <tbody>{rows.map((item) => <tr key={item.id}>
            <td className="fw-semibold">{item.name}</td><td>{item.email}</td><td>{item.nip || '-'}</td>
            <td>{canManage ? <select className="form-select form-select-sm" value={getRole(item)} onChange={(e) => updateRole(item, e.target.value)}>{roles.map((role) => <option key={role}>{role}</option>)}</select> : getRole(item)}</td>
            <td><span className={`badge ${item.is_active ? 'text-bg-success' : 'text-bg-secondary'}`}>{item.is_active ? 'Aktif' : 'Menunggu Verifikasi'}</span></td>
            <td className="text-end">{canManage ? <button className={`btn btn-sm ${item.is_active ? 'btn-outline-secondary' : 'btn-success'}`} onClick={() => toggleActive(item)} title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}><i className={`bi ${item.is_active ? 'bi-person-dash' : 'bi-person-check'}`}></i></button> : '-'}</td>
          </tr>)}{rows.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">Tidak ada data pengguna</td></tr>}</tbody>
        </table></div>
      </div>
      {showForm && <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}><div className="modal-dialog"><div className="modal-content"><form onSubmit={handleSubmit(createUser)}>
        <div className="modal-header"><h5 className="modal-title">Tambah Pengguna Internal</h5><button type="button" className="btn-close" onClick={() => setShowForm(false)} /></div>
        <div className="modal-body"><div className="alert alert-info small">Pendaftaran publik hanya untuk Walidata. Gunakan menu ini untuk membuat akun Admin, Penguji, Pimpinan, atau akun internal lain.</div><div className="row g-3">
          <div className="col-12"><label className="form-label fw-semibold">Nama</label><input className="form-control" {...register('name', { required: true })} /></div>
          <div className="col-12"><label className="form-label fw-semibold">Email</label><input className="form-control" type="email" {...register('email', { required: true })} /></div>
          <div className="col-12"><label className="form-label fw-semibold">Password</label><input className="form-control" type="password" {...register('password', { required: true, minLength: 8 })} /></div>
          <div className="col-md-6"><label className="form-label fw-semibold">NIP</label><input className="form-control" {...register('nip')} /></div>
          <div className="col-md-6"><label className="form-label fw-semibold">No. HP</label><input className="form-control" {...register('phone')} /></div>
          <div className="col-md-6"><label className="form-label fw-semibold">Role</label><select className="form-select" {...register('role')}>{roles.map((role) => <option key={role}>{role}</option>)}</select></div>
          <div className="col-md-6"><label className="form-label fw-semibold">Status Akun</label><select className="form-select" {...register('is_active')}><option value={1}>Aktif</option><option value={0}>Menunggu Verifikasi</option></select></div>
        </div></div>
        <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button><button className="btn btn-primary">Buat Akun</button></div>
      </form></div></div></div>}
    </div>
  )
}

export default Users

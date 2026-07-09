import { useCallback, useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

const normalizeRows = (payload) => {
  const rows = payload?.data ?? payload
  return Array.isArray(rows) ? rows : []
}

const roleOptions = ['Super Admin', 'Admin Diskominfo', 'Penguji', 'Walidata', 'Pimpinan']

const getUserRole = (user) => user.roles?.[0]?.name ?? user.roles?.[0] ?? 'Walidata'

function Users() {
  const { user: currentUser } = useAuth()
  const canManageUserAccess = currentUser?.roles?.some((role) => ['Super Admin', 'Admin Diskominfo'].includes(role.name ?? role))
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/users', { params: { search } })
      setRows(normalizeRows(res.data))
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memuat pengguna')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    queueMicrotask(load)
  }, [load])

  const toggleActive = async (user) => {
    const nextStatus = !user.is_active
    const label = nextStatus ? 'aktifkan' : 'nonaktifkan'

    if (!confirm(`Yakin ingin ${label} akun ${user.name}?`)) return

    try {
      await api.patch(`/users/${user.id}`, { is_active: nextStatus })
      load()
    } catch (error) {
      const validationErrors = error.response?.data?.errors
      const messages = validationErrors ? Object.values(validationErrors).flat().join('\n') : error.response?.data?.message
      alert(messages || `Gagal ${label} pengguna`)
    }
  }

  const updateRole = async (user, role) => {
    if (role === getUserRole(user)) return
    if (!confirm(`Ubah role ${user.name} menjadi ${role}?`)) return

    try {
      await api.patch(`/users/${user.id}`, { roles: [role] })
      load()
    } catch (error) {
      const validationErrors = error.response?.data?.errors
      const messages = validationErrors ? Object.values(validationErrors).flat().join('\n') : error.response?.data?.message
      alert(messages || 'Gagal mengubah role pengguna')
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-1">Users</h4>
            <p className="text-muted mb-0">Kelola status aktif dan role akun pengguna</p>
          </div>
          <button className="btn btn-outline-primary" onClick={load} disabled={loading}>{loading ? 'Memuat...' : 'Refresh'}</button>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <input className="form-control" placeholder="Cari nama, email, atau NIP..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="col-md-3 d-grid">
            <button className="btn btn-primary" onClick={load}>Cari</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>NIP</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.nip || '-'}</td>
                  <td>
                    {canManageUserAccess ? (
                      <select className="form-select form-select-sm" value={getUserRole(user)} onChange={(event) => updateRole(user, event.target.value)}>
                        {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    ) : getUserRole(user)}
                  </td>
                  <td><span className={`badge ${user.is_active ? 'text-bg-success' : 'text-bg-secondary'}`}>{user.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td className="text-end">
                    {canManageUserAccess ? (
                      <button className={`btn btn-sm ${user.is_active ? 'btn-outline-secondary' : 'btn-success'}`} onClick={() => toggleActive(user)}>
                        {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">Tidak ada data pengguna</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users

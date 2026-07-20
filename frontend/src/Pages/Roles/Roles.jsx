import { useCallback, useEffect, useState } from 'react'
import { Shield, Plus, Check, Users, Pencil, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import { confirmDelete } from '../../utils/confirm'

const actionLabels = { view: 'Lihat', create: 'Tambah', update: 'Ubah', delete: 'Hapus', import: 'Import', export: 'Export', publish: 'Publikasi', start: 'Mulai', grade: 'Nilai', review: 'Review', download: 'Download', print: 'Cetak', 'export-pdf': 'Export PDF', 'export-excel': 'Export Excel' }
const moduleLabels = { dashboard: 'Dashboard', opd: 'OPD', bidang: 'Bidang', jabatan: 'Jabatan', walidata: 'Walidata', penguji: 'Penguji', kompetensi: 'Kompetensi', level: 'Level', badge: 'Badge', materi: 'Materi', kategori: 'Kategori', pengguna: 'Pengguna', 'bank-soal': 'Bank Soal', quiz: 'Quiz', asesmen: 'Asesmen', penilaian: 'Penilaian', sertifikat: 'Sertifikat', monitoring: 'Monitoring', laporan: 'Laporan', 'audit-log': 'Audit Log', notifikasi: 'Notifikasi', profile: 'Profile', password: 'Password', session: 'Session' }

function Roles() {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try { const [r, p] = await Promise.all([api.get('/roles'), api.get('/permissions')]); setRoles(r.data); setPermissions(p.data) }
    catch (e) { alert(e.response?.data?.message || 'Gagal memuat') } finally { setLoading(false) }
  }, [])
  useEffect(() => { queueMicrotask(() => load()) }, [load])

  const openCreate = () => { setEditing(null); setFormName(''); setSelectedPerms([]); setShowForm(true) }
  const openEdit = (role) => { setEditing(role); setFormName(role.name); setSelectedPerms(role.permissions || []); setShowForm(true) }
  const togglePerm = (name) => setSelectedPerms((prev) => prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name])

  const selectAll = (perms) => { const allSelected = perms.every((p) => selectedPerms.includes(p.name)); perms.forEach((p) => { if (!allSelected) { setSelectedPerms((prev) => prev.includes(p.name) ? prev : [...prev, p.name]) } else { setSelectedPerms((prev) => prev.filter((x) => x !== p.name)) } }) }

  const save = async () => {
    if (!formName.trim()) return alert('Nama role harus diisi')
    setSaving(true)
    try {
      if (editing) await api.put(`/roles/${editing.id}`, { name: formName.trim(), permissions: selectedPerms })
      else await api.post('/roles', { name: formName.trim(), permissions: selectedPerms })
      setShowForm(false); load()
    } catch (e) { alert(e.response?.data?.message || 'Gagal menyimpan') } finally { setSaving(false) }
  }

  const remove = async (role) => { if (await confirmDelete(role.name)) { try { await api.delete(`/roles/${role.id}`); load() } catch (e) { alert(e.response?.data?.message || 'Gagal menghapus') } } }

  const permCount = (perms) => {
    const groups = {}
    perms.forEach((p) => { const m = p.split('.')[0]; groups[m] = (groups[m] || 0) + 1 })
    return Object.entries(groups).map(([m, c]) => `${moduleLabels[m] || m}(${c})`).join(', ')
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-indigo-950/20 p-7 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTI0IDI0di0ySDI0djJ6TTI0IDE2di0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"><Shield className="h-3 w-3" /> Akses Sistem</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-100">Role & Hak Akses</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">Kelola role dan atur permission untuk setiap role.</p>
          </div>
          {!showForm && <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"><Plus className="h-4 w-4" />Role Baru</button>}
        </div>
      </div>

      {/* List */}
      {!showForm && (
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-500"><Shield className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada role</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-[#262636] bg-[#09090E]">
                    <th className="px-5 py-3.5 font-semibold">Role</th><th className="px-5 py-3.5 font-semibold">Permission</th><th className="px-5 py-3.5 font-semibold text-center w-20">Pengguna</th><th className="px-5 py-3.5 text-left font-semibold w-28 translate-x-[27px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262636]">
                  {roles.map((role) => (
                    <tr className="transition hover:bg-white/[0.02]" key={role.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-100">{role.name}</p>
                      </td>
                      <td className="px-5 py-4"><span className="text-xs text-slate-400 line-clamp-1">{permCount(role.permissions || []) || '-'}</span></td>
                      <td className="px-5 py-4 text-center"><span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400"><Users className="h-3 w-3" />{role.users_count}</span></td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(role)} className="mr-2 inline-flex items-center justify-center rounded-xl border border-[#262636] p-2 text-sm text-slate-400 transition-colors hover:bg-[#1A1A26] hover:text-slate-200" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(role)} className="inline-flex items-center justify-center rounded-xl border border-rose-600/20 p-2 text-sm text-rose-400 transition-colors hover:bg-rose-500/10" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-[#262636] pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-100">{editing ? 'Edit' : 'Buat'} Role</h2>
              <p className="mt-0.5 text-sm text-slate-400">Atur nama role dan permission yang tersedia.</p>
            </div>
          </div>

          <div className="mb-6 max-w-xs">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Role <span className="text-rose-400">*</span></label>
            <input className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="contoh: Admin OPD" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100">Permission</h3>
            <span className="text-xs text-slate-500">{selectedPerms.length} dipilih</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(permissions).map(([module, perms]) => (
              <div key={module} className="rounded-xl border border-[#262636] bg-[#09090E]/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-indigo-400">{moduleLabels[module] || module}</h4>
                  <button onClick={() => selectAll(perms)} className="text-xs text-slate-500 hover:text-indigo-400 transition">
                    {perms.every((p) => selectedPerms.includes(p.name)) ? 'Hapus' : 'Semua'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {perms.map((perm) => {
                    const active = selectedPerms.includes(perm.name)
                    return (
                      <button key={perm.name} onClick={() => togglePerm(perm.name)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          active ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 hover:text-slate-300'
                        }`}
                      >{active && <Check className="h-3 w-3" />}{actionLabels[perm.action] || perm.action}</button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[#262636] pt-5">
            <button onClick={() => setShowForm(false)} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400">Batal</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50">
              {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Menyimpan...</> : 'Simpan'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Roles

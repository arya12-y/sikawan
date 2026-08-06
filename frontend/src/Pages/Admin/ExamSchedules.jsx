import { useState, useEffect, useCallback } from 'react'
import { Calendar, Plus, X, Trash2, UserCheck, FileCheck, ClipboardCheck, Award, Play, Clock } from 'lucide-react'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'
import { can } from '../../utils/can'
import { confirmDelete } from '../../utils/confirm'
import { toast } from '../../utils/toast'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])
const inputClass = 'w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'
const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5'

function ExamSchedules() {
  const [schedules, setSchedules] = useState([])
  const [kompetensis, setKompetensis] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [current, setCurrent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [selectedScheduleId, setSelectedScheduleId] = useState('active')
  const [form, setForm] = useState({
    title: '',
    pretest_start: '',
    pretest_end: '',
    exam_start: '',
    exam_end: '',
    kompetensi_ids: [],
    pretest_jumlah_per_kompetensi: 5,
    pretest_durasi: 30,
    status: 'draft',
  })
  const { user } = useAuth()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, k] = await Promise.all([api.get('/exam-schedules'), api.get('/kompetensis')])
      setSchedules(normalize(s.data))
      setKompetensis(normalize(k.data))
    } catch (e) {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { queueMicrotask(() => load()) }, [load])
  const fetchStats = useCallback(() => {
    const url = selectedScheduleId === 'active' ? '/exam-schedules/stats' : `/exam-schedules/stats?schedule_id=${selectedScheduleId}`
    api.get(url).then(r => setStats(r.data)).catch(() => setStats(null))
  }, [selectedScheduleId])
  useEffect(() => { fetchStats() }, [fetchStats])

  const toDatetimeLocal = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const openCreate = () => {
    setCurrent(null)
    setForm({
      title: '', pretest_start: '', pretest_end: '',
      exam_start: '', exam_end: '',
      kompetensi_ids: [], pretest_jumlah_per_kompetensi: 5, pretest_durasi: 30, status: 'draft',
    })
    setShowModal(true)
  }

  const openEdit = (row) => {
    setCurrent(row)
    setForm({
      title: row.title || '',
      pretest_start: toDatetimeLocal(row.pretest_start),
      pretest_end: toDatetimeLocal(row.pretest_end),
      exam_start: toDatetimeLocal(row.exam_start),
      exam_end: toDatetimeLocal(row.exam_end),
      kompetensi_ids: row.kompetensi_ids || [],
      pretest_jumlah_per_kompetensi: row.pretest_jumlah_per_kompetensi || 5,
      pretest_durasi: row.pretest_durasi || 30,
      status: row.status || 'draft',
    })
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox' && name === 'kompetensi_ids') {
      setForm(prev => ({
        ...prev,
        kompetensi_ids: checked
          ? [...prev.kompetensi_ids, Number(value)]
          : prev.kompetensi_ids.filter(id => id !== Number(value)),
      }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        pretest_start: form.pretest_start ? new Date(form.pretest_start).toISOString() : null,
        pretest_end: form.pretest_end ? new Date(form.pretest_end).toISOString() : null,
        exam_start: form.exam_start ? new Date(form.exam_start).toISOString() : null,
        exam_end: form.exam_end ? new Date(form.exam_end).toISOString() : null,
        kompetensi_ids: form.kompetensi_ids,
        pretest_jumlah_per_kompetensi: Number(form.pretest_jumlah_per_kompetensi || 5),
        pretest_durasi: Number(form.pretest_durasi || 30),
        is_active: form.status === 'published' || form.status === 'active',
        status: form.status,
      }
      if (current?.id) await api.put(`/exam-schedules/${current.id}`, payload)
      else await api.post('/exam-schedules', payload)
      await load()
      toast('success', 'Berhasil menyimpan Jadwal')
      setShowModal(false)
    } catch (err) {
      toast('error', err.response?.data?.message || 'Gagal menyimpan jadwal')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (row) => {
    if (await confirmDelete(row.title || 'Jadwal ini')) {
      try {
        await api.delete(`/exam-schedules/${row.id}`)
        load()
      } catch (err) {
        toast('error', err.response?.data?.message || 'Gagal menghapus jadwal')
      }
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'      
    return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const statusStyle = (s) => {
    if (s === 'published' || s === 'active') return 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20'
    if (s === 'completed' || s === 'finished') return 'bg-slate-500/10 text-slate-400 ring-slate-400/20'
    return 'bg-amber-500/10 text-amber-400 ring-amber-400/20'
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-indigo-950/20 p-7 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTI0IDI0di0ySDI0djJ6TTI0IDE2di0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex items-start justify-between gap-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"><Calendar className="h-3 w-3" /> Penjadwalan</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-100">Schedules</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">Atur jadwal pretest, pembelajaran, dan ujian untuk peserta.</p>
          </div>
          <div className="flex shrink-0 gap-3">
            {can(user, 'exam-schedules.create') && (
              <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"><Plus className="h-4 w-4" />Tambah Jadwal</button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Selector */}
      {schedules.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-400">Lihat statistik jadwal:</label>
          <select className="h-8 rounded-full border border-[#262636] bg-[#1A1A26] px-3 text-xs text-slate-100 outline-none" value={selectedScheduleId} onChange={(e) => setSelectedScheduleId(e.target.value)}>
            <option value="active">— Jadwal Aktif —</option>
            {schedules.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>

        </div>
      )}
      {stats && !stats.active && (
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-6 text-center text-sm text-slate-500">Tidak ada data untuk jadwal ini.</div>
      )}
      {stats && stats.active && (
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {[
            { label: 'Total Walidata', value: stats.total_walidata, icon: UserCheck, color: 'from-indigo-600 to-indigo-800' },
            { label: 'Belum Pretest', value: stats.belum_pretest, icon: Play, color: 'from-amber-600 to-amber-800' },
            { label: 'Pretest Selesai', value: stats.pretest_selesai, icon: FileCheck, color: 'from-sky-600 to-cyan-800' },
            { label: 'Sedang Asesmen', value: stats.sedang_asesmen, icon: ClipboardCheck, color: 'from-violet-600 to-purple-800' },
            { label: 'Menunggu Dinilai', value: stats.menunggu_dinilai, icon: Clock, color: 'from-amber-500 to-orange-600' },
            { label: 'Asesmen Selesai', value: stats.asesmen_selesai, icon: Award, color: 'from-emerald-600 to-emerald-800' },
            { label: 'Lulus', value: stats.lulus, icon: Award, color: 'from-cyan-600 to-teal-800' },
          ].map((s) => (
            <div key={s.label} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${s.color} p-4 shadow-lg`}>
              <s.icon className="absolute right-2 top-2 h-8 w-8 text-white/10" />
              <p className="min-h-[28px] text-[10px] font-semibold uppercase leading-4 tracking-wider text-white/70">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-500"><Calendar className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada jadwal</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr className="border-b border-[#262636] bg-[#09090E]">
                  <th className="px-4 py-3 text-center font-semibold">Judul</th>
                  <th className="px-4 py-3 text-center font-semibold hidden lg:table-cell">Pretest</th>
                  <th className="px-4 py-3 text-center font-semibold hidden lg:table-cell">Asesmen</th>
                  <th className="px-4 py-3 text-center font-semibold w-24">Status</th>
                  <th className="px-4 py-3 text-center font-semibold w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262636]">
                {schedules.map((row) => (
                  <tr className="transition hover:bg-white/[0.02]" key={row.id}>
                    <td className="px-4 py-3 text-center">
                      <p className="font-medium text-slate-100">{row.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{row.kompetensi_ids?.length || 0} kompetensi</p>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 hidden lg:table-cell">
                      <span className="text-xs text-slate-500">Mulai:</span>
                      <p className="text-slate-300">{formatDate(row.pretest_start)}</p>
                      <span className="text-xs text-slate-500">Selesai:</span>
                      <p className="text-slate-300">{formatDate(row.pretest_end)}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 hidden lg:table-cell">
                      <span className="text-xs text-slate-500">Mulai:</span>
                      <p className="text-slate-300">{formatDate(row.exam_start)}</p>
                      <span className="text-xs text-slate-500">Selesai:</span>
                      <p className="text-slate-300">{formatDate(row.exam_end)}</p>
                    </td>
                    <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyle(row.status)}`}>{row.status || 'draft'}</span></td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {can(user, 'exam-schedules.update') && <button onClick={() => openEdit(row)} className="mr-2 inline-flex items-center justify-center rounded-xl border border-[#262636] p-2 text-sm text-slate-400 transition-colors hover:bg-[#1A1A26] hover:text-slate-200" title="Edit"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></button>}
                      {can(user, 'exam-schedules.delete') && <button onClick={() => remove(row)} className="inline-flex items-center justify-center rounded-xl border border-rose-600/20 p-2 text-sm text-rose-400 transition-colors hover:bg-rose-500/10" title="Hapus"><Trash2 className="h-4 w-4" /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#262636] bg-[#14141E] shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#262636] px-6 py-4 shrink-0">
              <h2 className="text-lg font-bold text-slate-100">{current ? 'Edit' : 'Tambah'} Jadwal</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={save} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
              <div>
                <label className={labelClass}>Judul <span className="text-rose-400">*</span></label>
                <input className={inputClass} name="title" value={form.title} onChange={handleChange} placeholder="Masukkan judul jadwal" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Pretest Mulai</label><input type="datetime-local" className={inputClass} name="pretest_start" value={form.pretest_start} onChange={handleChange} /></div>
                <div><label className={labelClass}>Pretest Selesai</label><input type="datetime-local" className={inputClass} name="pretest_end" value={form.pretest_end} onChange={handleChange} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Ujian (Asesmen) Mulai</label><input type="datetime-local" className={inputClass} name="exam_start" value={form.exam_start} onChange={handleChange} /></div>
                <div><label className={labelClass}>Ujian (Asesmen) Selesai</label><input type="datetime-local" className={inputClass} name="exam_end" value={form.exam_end} onChange={handleChange} /></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Status</label>
                  <select className={inputClass} name="status" value={form.status} onChange={handleChange}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Jumlah Soal Per Kompetensi</label>
                  <input type="number" className={inputClass} name="pretest_jumlah_per_kompetensi" value={form.pretest_jumlah_per_kompetensi} onChange={handleChange} min="0" />
                </div>
                <div>
                  <label className={labelClass}>Durasi Pretest (menit)</label>
                  <input type="number" className={inputClass} name="pretest_durasi" value={form.pretest_durasi} onChange={handleChange} min="5" max="120" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Kompetensi</label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-[#262636] bg-[#1A1A26]">
                  {kompetensis.length === 0 && <p className="text-xs text-slate-500">Tidak ada kompetensi</p>}
                  {kompetensis.map((item) => (
                    <button key={item.id} type="button" onClick={() => {
                      const checked = form.kompetensi_ids.includes(item.id)
                      handleChange({ target: { name: 'kompetensi_ids', value: item.id, type: 'checkbox', checked: !checked } })
                    }} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      form.kompetensi_ids.includes(item.id) ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 hover:text-slate-300'
                    }`}>{item.nama}</button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#262636]">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition">Batal</button>
                <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50" disabled={saving}>{saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Menyimpan...</> : <>Simpan</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamSchedules

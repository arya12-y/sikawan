import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Bell, Send, Inbox, ArrowRight, CheckCircle } from 'lucide-react'
import api from '../../api/axios'
import { can } from '../../utils/can'
import { useAuth } from '../../hooks/useAuth'
import { showSuccess, showError } from '../../utils/alert'

const inputClass = 'w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'
const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5'

function NotifikasiPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('inbox')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const { register, handleSubmit, reset } = useForm()
  const roles = ['Super Admin', 'Admin Diskominfo', 'Penguji', 'Walidata', 'Pimpinan']

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifikasis?per_page=50')
      const data = res.data?.data ?? res.data
      setRows(Array.isArray(data) ? data : [])
    } catch { setRows([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { queueMicrotask(() => load()) }, [load])

  const markRead = async (id) => {
    try {
      await api.post(`/notifikasis/${id}/mark-read`)
      setRows(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r))
    } catch { /* ignore */ }
  }

  const markAllRead = async () => {
    try {
      await api.post('/notifikasis/mark-all-read')
      setRows(prev => prev.map(r => ({ ...r, is_read: true })))
    } catch { /* ignore */ }
  }

  const submit = async (data) => {
    try {
      const res = await api.post('/notifikasis', data)
      showSuccess('Terkirim', res.data?.message || 'Notifikasi berhasil dikirim', 'Oke')
      reset({ role: '', judul: '', pesan: '', tipe: 'info', link: '' })
    } catch (e) {
      showError('Gagal', e.response?.data?.message || 'Gagal mengirim notifikasi', 'Tutup')
    }
  }

  const unreadCount = rows.filter(r => !r.is_read).length

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-amber-950/20 p-7 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmNTllMGIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTI0IDI0di0ySDI0djJ6TTI0IDE2di0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400"><Bell className="h-3 w-3" /> Notifikasi</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-100">Pusat Notifikasi</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Lihat riwayat notifikasi dan kelola pengiriman pesan.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-[#262636] bg-[#14141E] p-2">
        <button onClick={() => setTab('inbox')} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${tab === 'inbox' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <Inbox className="h-4 w-4" /> Kotak Masuk {unreadCount > 0 && <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount}</span>}
        </button>
        {can(user, 'notifikasi.create') && (
          <button onClick={() => setTab('kirim')} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${tab === 'kirim' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}>
            <Send className="h-4 w-4" /> Kirim
          </button>
        )}
      </div>

      {/* Inbox */}
      {tab === 'inbox' && (
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#262636] px-6 py-4">
            <h2 className="text-sm font-bold text-slate-100">Riwayat Notifikasi</h2>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition">Tandai Semua Dibaca</button>}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-500"><Bell className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada notifikasi</p></div>
          ) : (
            <div className="divide-y divide-[#262636]">
              {rows.map((row) => (
                <div key={row.id} className={`px-6 py-4 transition hover:bg-white/[0.02] ${row.is_read ? '' : 'bg-indigo-500/[0.03]'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100">{row.judul}</span>
                        {!row.is_read && <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{row.pesan}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">{new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {row.link && <a href={row.link} className="inline-flex items-center gap-0.5 text-[10px] font-medium text-indigo-400 hover:text-indigo-300">Lihat <ArrowRight className="h-2.5 w-2.5" /></a>}
                      </div>
                    </div>
                    {!row.is_read && <button onClick={() => markRead(row.id)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-white/5 hover:text-indigo-400 transition" title="Tandai dibaca"><CheckCircle className="h-4 w-4" /></button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kirim */}
      {tab === 'kirim' && (
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div>
              <label className={labelClass}>Tujuan (Role) <span className="text-rose-400">*</span></label>
              <select className={inputClass} {...register('role', { required: true })}>
                <option value="">-- Pilih Role --</option>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <p className="mt-1.5 text-xs text-slate-500">Notifikasi akan dikirim ke semua pengguna dengan role yang dipilih.</p>
            </div>
            <div><label className={labelClass}>Judul <span className="text-rose-400">*</span></label><input className={inputClass} {...register('judul', { required: true })} placeholder="Contoh: Pengumuman Asesmen Baru" /></div>
            <div><label className={labelClass}>Pesan <span className="text-rose-400">*</span></label><textarea className={`${inputClass} min-h-[100px]`} rows="3" {...register('pesan', { required: true })} placeholder="Tulis pesan..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Tipe</label><select className={inputClass} {...register('tipe')}><option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="danger">Danger</option></select></div>
              <div><label className={labelClass}>Link</label><input className={inputClass} placeholder="https://..." {...register('link')} /></div>
            </div>
            <div className="flex justify-end border-t border-[#262636] pt-5">
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-400 hover:to-orange-500"><Send className="h-4 w-4" />Kirim Notifikasi</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default NotifikasiPage

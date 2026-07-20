import { useForm } from 'react-hook-form'
import { Bell, Send, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import api from '../../api/axios'
import { can } from '../../utils/can'
import { useAuth } from '../../hooks/useAuth'

const inputClass = 'w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'
const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5'

function BroadcastNotifikasi() {
  const { user } = useAuth()
  const { register, handleSubmit, reset } = useForm()

  const submit = async (data) => {
    try {
      const res = await api.post('/notifikasis', data)
      alert(res.data?.message || 'Notifikasi berhasil dikirim')
      reset({ role: '', judul: '', pesan: '', tipe: 'info', link: '' })
    } catch (e) { alert(e.response?.data?.message || 'Gagal mengirim notifikasi') }
  }

  const roles = ['Super Admin', 'Admin Diskominfo', 'Penguji', 'Walidata', 'Pimpinan']

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-amber-950/20 p-7 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmNTllMGIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTI0IDI0di0ySDI0djJ6TTI0IDE2di0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400"><Bell className="h-3 w-3" /> Notifikasi</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-100">Kirim Notifikasi</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Kirim pemberitahuan ke pengguna tertentu berdasarkan role.</p>
        </div>
      </div>

      {/* Form */}
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
          <div>
            <label className={labelClass}>Judul Notifikasi <span className="text-rose-400">*</span></label>
            <input className={inputClass} {...register('judul', { required: true })} placeholder="Contoh: Pengumuman Asesmen Baru" />
          </div>
          <div>
            <label className={labelClass}>Pesan <span className="text-rose-400">*</span></label>
            <textarea className={`${inputClass} min-h-[100px]`} rows="3" {...register('pesan', { required: true })} placeholder="Tulis pesan notifikasi..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipe</label>
              <select className={inputClass} {...register('tipe')}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Link / URL</label>
              <input className={inputClass} placeholder="https://..." {...register('link')} />
            </div>
          </div>
          <div className="flex justify-end border-t border-[#262636] pt-5">
            {can(user, 'notifikasi.create') && (
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-400 hover:to-orange-500"><Send className="h-4 w-4" />Kirim Notifikasi</button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default BroadcastNotifikasi

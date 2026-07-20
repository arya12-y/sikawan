import { RefreshCw, Award, Download, FileCheck, Users, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import api from '../../api/axios'
import { can } from '../../utils/can'
import { useAuth } from '../../hooks/useAuth'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

function Sertifikat() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/sertifikats')
      setRows(normalize(res.data))
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal memuat sertifikat')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { queueMicrotask(() => load()) }, [load])

  const download = async (row) => {
    try {
      const res = await api.get(`/sertifikats/${row.id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url; link.download = `${row.nomor_sertifikat}.pdf`
      link.click(); URL.revokeObjectURL(url)
    } catch (e) { alert(e.response?.data?.message || 'Gagal download sertifikat') }
  }

  const totalSertifikat = rows.length
  const totalUsers = new Set(rows.map((r) => r.user_id)).size

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-indigo-950/20 p-7 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTI0IDI0di0ySDI0djJ6TTI0IDE2di0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"><Award className="h-3 w-3" /> Sertifikat Kompetensi</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-100">Sertifikat</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">Sertifikat kompetensi Walidata yang sudah lulus asesmen.</p>
          </div>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#262636] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sertifikat', value: totalSertifikat, icon: Award, color: 'from-indigo-600 to-indigo-800' },
          { label: 'Penerima Sertifikat', value: totalUsers, icon: Users, color: 'from-emerald-600 to-emerald-800' },
          { label: 'Nilai Rata-rata', value: rows.length ? Math.round(rows.reduce((s, r) => s + Number(r.nilai_akhir || 0), 0) / rows.length) : 0, icon: TrendingUp, color: 'from-amber-600 to-amber-800' },
        ].map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${s.color} p-5 shadow-lg`}>
            <s.icon className="absolute right-3 top-3 h-10 w-10 text-white/10" />
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{s.label}</p>
            <p className="mt-1.5 text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-500">
            <Award className="mb-3 h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">Belum ada sertifikat</p>
            <p className="mt-1 text-xs text-slate-500">Selesaikan asesmen dan capai nilai lulus.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr className="border-b border-[#262636] bg-[#09090E]">
                  <th className="px-4 py-3 font-semibold">Nomor</th><th className="px-4 py-3 font-semibold">Nama</th><th className="px-4 py-3 font-semibold hidden md:table-cell">Kompetensi</th><th className="px-4 py-3 font-semibold hidden md:table-cell translate-x-[5px]">Level</th><th className="px-4 py-3 font-semibold text-center w-16">Nilai</th><th className="px-4 py-3 font-semibold hidden lg:table-cell">Tanggal</th><th className="px-4 py-3 text-left font-semibold w-28 translate-x-[35px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262636]">
                {rows.map((row) => (
                  <tr className="transition hover:bg-white/[0.02]" key={row.id}>
                    <td className="px-4 py-3 font-medium text-slate-100 text-xs">{row.nomor_sertifikat}</td>
                    <td className="px-4 py-3 text-slate-300">{row.user?.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{row.kompetensi?.nama || '-'}</td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400">{row.level?.nama || row.kategori_kompetensi || '-'}</span></td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-100">{row.nilai_akhir}</td>
                    <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{row.tanggal_terbit}</td>
                    <td className="px-4 py-3 text-right">
                      {can(user, 'sertifikat.download') && (
                        <button onClick={() => download(row)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20"><Download className="h-3.5 w-3.5" />Download</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sertifikat

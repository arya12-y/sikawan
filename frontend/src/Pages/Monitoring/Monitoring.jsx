import { RefreshCw, Activity, UserCheck, Clock, CheckCircle, XCircle, Play, Award } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import api from '../../api/axios'

const normalizeRows = (payload) => {
  const rows = payload?.data ?? payload
  return Array.isArray(rows) ? rows : []
}

function Monitoring() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/monitoring')
      setRows(normalizeRows(res.data))
    } catch { setRows([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { queueMicrotask(() => load()) }, [load])

  const stats = {
    total: rows.length,
    selesai: rows.filter((r) => r.status === 'selesai').length,
    lulus: rows.filter((r) => r.lulus).length,
    sedang: rows.filter((r) => r.status !== 'selesai').length,
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-indigo-950/20 p-7 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTI0IDI0di0ySDI0djJ6TTI0IDE2di0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"><Activity className="h-3 w-3" /> Pemantauan Langsung</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-100">Monitoring Kompetensi</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">Pantau perkembangan asesmen dan progres belajar seluruh OPD secara real-time.</p>
          </div>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#262636] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Peserta', value: stats.total, icon: UserCheck, color: 'from-indigo-600 to-indigo-800' },
          { label: 'Sedang Mengerjakan', value: stats.sedang, icon: Play, color: 'from-amber-600 to-amber-800' },
          { label: 'Selesai', value: stats.selesai, icon: CheckCircle, color: 'from-emerald-600 to-emerald-800' },
          { label: 'Lulus', value: stats.lulus, icon: Award, color: 'from-cyan-600 to-cyan-800' },
        ].map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${s.color} p-5 shadow-lg`}>
            <s.icon className="absolute right-3 top-3 h-10 w-10 text-white/10" />
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{s.label}</p>
            <p className="mt-1.5 text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-500"><Activity className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada data progres</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr className="border-b border-[#262636] bg-[#09090E]">
                  <th className="px-5 py-3.5 font-semibold">Peserta</th><th className="px-5 py-3.5 font-semibold">Asesmen</th><th className="px-5 py-3.5 font-semibold">Progress / Nilai</th><th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262636]">
                {rows.map((row) => {
                  const completed = row.status === 'selesai'
                  const passed = row.lulus
                  const progress = completed ? 100 : 50
                  const color = completed ? (passed ? 'from-emerald-500 to-emerald-400' : 'from-rose-500 to-rose-400') : 'from-indigo-500 to-violet-500'
                  return (
                    <tr className="transition hover:bg-white/[0.02]" key={row.id}>
                      <td className="px-5 py-4"><p className="font-medium text-slate-100">{row.user?.name ?? '-'}</p><p className="mt-0.5 text-xs text-slate-500">{row.user?.opd_name ?? 'OPD'}</p></td>
                      <td className="px-5 py-4 text-slate-400">{row.asesmen?.judul ?? '-'}</td>
                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs font-medium text-slate-300">{completed ? `Nilai: ${row.nilai}` : 'Sedang mengerjakan'}</span>
                          <span className="text-xs text-slate-500">{completed ? '100%' : '50%'}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#1E1E2E] overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all ${!completed ? 'animate-pulse' : ''}`} style={{ width: completed ? '100%' : '50%' }} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {completed ? (
                          passed ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"><CheckCircle className="h-3 w-3" /> Lulus</span>
                            : <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400"><XCircle className="h-3 w-3" /> Tidak Lulus</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400"><Play className="h-3 w-3" /> Mengerjakan</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Monitoring

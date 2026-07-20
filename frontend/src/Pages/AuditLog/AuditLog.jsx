import { RefreshCw, ShieldCheck, Clock, User, Activity, Filter } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import api from '../../api/axios'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

const actionConfig = {
  create: { label: 'Create', color: 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20' },
  update: { label: 'Update', color: 'bg-indigo-500/10 text-indigo-400 ring-indigo-400/20' },
  delete: { label: 'Delete', color: 'bg-rose-500/10 text-rose-400 ring-rose-400/20' },
}

function AuditLog() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get('/audit-logs'); setRows(normalize(res.data)) }
    catch { setRows([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { queueMicrotask(() => load()) }, [load])

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-indigo-950/20 p-7 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTI0IDI0di0ySDI0djJ6TTI0IDE2di0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"><ShieldCheck className="h-3 w-3" /> Jejak Aktivitas</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-100">Audit Log</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">Catatan riwayat aktivitas pengguna di dalam sistem.</p>
          </div>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#262636] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Quick summary */}
      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Aktivitas', value: rows.length, icon: Activity, color: 'from-indigo-600 to-indigo-800' },
            { label: 'Create', value: rows.filter((r) => r.action === 'create').length, icon: ShieldCheck, color: 'from-emerald-600 to-emerald-800' },
            { label: 'Delete', value: rows.filter((r) => r.action === 'delete').length, icon: ShieldCheck, color: 'from-rose-600 to-rose-800' },
          ].map((s) => (
            <div key={s.label} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${s.color} p-5 shadow-lg`}>
              <s.icon className="absolute right-3 top-3 h-10 w-10 text-white/10" />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{s.label}</p>
              <p className="mt-1.5 text-3xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-500"><ShieldCheck className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada riwayat aktivitas</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr className="border-b border-[#262636] bg-[#09090E]">
                  <th className="px-5 py-3.5 font-semibold">Waktu</th><th className="px-5 py-3.5 font-semibold">User</th><th className="px-5 py-3.5 font-semibold">Aksi</th><th className="px-5 py-3.5 font-semibold">Modul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262636]">
                {rows.map((row) => {
                  const cfg = actionConfig[row.action] || { label: row.action, color: 'bg-slate-500/10 text-slate-400 ring-slate-400/20' }
                  return (
                    <tr className="transition hover:bg-white/[0.02]" key={row.id}>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{new Date(row.created_at).toLocaleString('id-ID')}</td>
                      <td className="px-5 py-4 font-medium text-slate-100">{row.user?.name || '-'}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cfg.color}`}>{cfg.label}</span></td>
                      <td className="px-5 py-4 text-slate-400">{row.module}</td>
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

export default AuditLog

import { RefreshCw, Activity, UserCheck, CheckCircle, XCircle, Play, Award, FileCheck, Trash2, ClipboardCheck, Clock } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { can } from '../../utils/can'
import api from '../../api/axios'
import { showConfirm } from '../../utils/alert'
import { toast } from '../../utils/toast'

const normalizeRows = (payload) => {
  const rows = payload?.data ?? payload
  return Array.isArray(rows) ? rows : []
}

function Monitoring() {
  const { user } = useAuth()
  const [tab, setTab] = useState('asesmen')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [pretestRows, setPretestRows] = useState([])
  const [pretestLoading, setPretestLoading] = useState(false)
  const [pendingActivation, setPendingActivation] = useState([])
  const [statusFilter, setStatusFilter] = useState('semua')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/monitoring')
      setRows(normalizeRows(res.data))
    } catch { setRows([]) } finally { setLoading(false) }
  }, [])

  const loadPretest = useCallback(async () => {
    setPretestLoading(true)
    try {
      const res = await api.get('/pretest/monitoring')
      setPretestRows(res.data?.data ?? res.data ?? [])
    } catch { setPretestRows([]) } finally { setPretestLoading(false) }
  }, [])

  useEffect(() => { queueMicrotask(() => { load(); loadPretest() }) }, [load, loadPretest])
  useEffect(() => { api.get('/pretest/pending').then(r => setPendingActivation(Array.isArray(r.data) ? r.data : [])).catch(() => {}) }, [])
  useEffect(() => { const t = setInterval(() => { load(); loadPretest() }, 30000); return () => clearInterval(t) }, [load, loadPretest])

  const resetExam = async (row) => {
    const confirmed = await showConfirm(
      'Reset ujian?',
      `"${row.user?.name}" — "${row.asesmen?.judul}". Jawaban dan sertifikat akan dihapus.`,
      'Ya, Reset',
      'Batal',
      'warning'
    )
    if (!confirmed) return
    try {
      await api.post(`/peserta-asesmens/${row.id}/reset`)
      load()
      toast('success', 'Berhasil mereset ujian')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal reset')
    }
  }

  const deleteMonitoring = async (row) => {
    const confirmed = await showConfirm(
      'Hapus data?',
      `"${row.user?.name}" — "${row.asesmen?.judul}". Data akan dihapus permanen.`,
      'Ya, Hapus',
      'Batal',
      'warning'
    )
    if (!confirmed) return
    try {
      await api.delete(`/monitoring/${row.id}`)
      load()
      toast('success', 'Berhasil menghapus Data monitoring')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal hapus')
    }
  }

  const resetPretest = async (row) => {
    const confirmed = await showConfirm(
      'Reset pretest?',
      `"${row.user_name}" — Semua jawaban pretest akan dihapus.`,
      'Ya, Reset',
      'Batal',
      'warning'
    )
    if (!confirmed) return
    try {
      await api.post('/pretest/reset', { user_id: row.user_id })
      loadPretest()
      toast('success', 'Berhasil mereset pretest')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal reset pretest')
    }
  }

  const cleanupPretest = async () => {
    const confirmed = await showConfirm(
      'Bersihkan data sampah?',
      'Data pretest dari akun yang sudah dihapus akan dibersihkan.',
      'Ya, bersihkan',
      'Batal',
      'warning'
    )
    if (!confirmed) return
    try {
      const res = await api.post('/pretest/cleanup')
      toast('success', res.data?.message || `Berhasil menghapus ${res.data?.deleted || 0} data`)
      loadPretest()
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal bersihkan data')
    }
  }

  const activatePretest = async (userId, userName) => {
    const confirmed = await showConfirm(
      'Aktifkan pretest?',
      `Pretest untuk "${userName}" akan diaktifkan.`,
      'Ya, Aktifkan',
      'Batal',
      'question'
    )
    if (!confirmed) return
    try {
      await api.post('/pretest/activate', { user_id: userId })
      setPendingActivation(prev => prev.filter(p => p.user_id !== userId))
      toast('success', `Berhasil mengaktifkan pretest untuk ${userName}`)
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal aktivasi')
    }
  }

  const activateAllPretest = async () => {
    const confirmed = await showConfirm(
      'Aktifkan semua?',
      `Pretest untuk ${pendingActivation.length} walidata akan diaktifkan sekaligus.`,
      'Ya, Aktifkan Semua',
      'Batal',
      'question'
    )
    if (!confirmed) return
    try {
      const res = await api.post('/pretest/activate-all')
      setPendingActivation([])
      toast('success', res.data?.message || 'Berhasil mengaktifkan semua walidata')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal aktivasi massal')
    }
  }

  const asesmenStats = {
    total: rows.length,
    selesai: rows.filter((r) => r.status === 'selesai').length,
    lulus: rows.filter((r) => r.lulus).length,
    sedang: rows.filter((r) => r.status === 'sedang_mengerjakan').length,
    menunggu: rows.filter((r) => ['menunggu_dinilai', 'dinilai', 'wawancara'].includes(r.status)).length,
  }

  const filteredRows = statusFilter === 'semua' ? rows : rows.filter((row) => statusFilter === 'mengerjakan'
    ? row.status === 'sedang_mengerjakan'
    : statusFilter === 'menunggu'
      ? ['menunggu_dinilai', 'dinilai', 'wawancara'].includes(row.status)
      : row.status === 'selesai')

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
          <button onClick={() => { tab === 'asesmen' ? load() : loadPretest() }} disabled={loading || pretestLoading} className="inline-flex items-center gap-2 rounded-full border border-[#262636] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading || pretestLoading ? 'animate-spin' : ''}`} />Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {tab === 'asesmen' && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'Total Peserta', value: asesmenStats.total, icon: UserCheck, color: 'from-indigo-600 to-indigo-800' },
            { label: 'Sedang Mengerjakan', value: asesmenStats.sedang, icon: Play, color: 'from-amber-600 to-amber-800' },
            { label: 'Menunggu Dinilai', value: asesmenStats.menunggu, icon: Clock, color: 'from-amber-600 to-amber-800' },
            { label: 'Selesai', value: asesmenStats.selesai, icon: CheckCircle, color: 'from-emerald-600 to-emerald-800' },
            { label: 'Lulus', value: asesmenStats.lulus, icon: Award, color: 'from-cyan-600 to-cyan-800' },
          ].map((s) => (
            <div key={s.label} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${s.color} p-5 shadow-lg`}>
              <s.icon className="absolute right-3 top-3 h-10 w-10 text-white/10" />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{s.label}</p>
              <p className="mt-1.5 text-3xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'pretest' && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Peserta', value: pretestRows.length, icon: UserCheck, color: 'from-indigo-600 to-indigo-800' },
            { label: 'Rata-rata Nilai', value: pretestRows.length ? Math.round(pretestRows.reduce((s, r) => s + (r.rata_rata || 0), 0) / pretestRows.length) : 0, icon: Award, color: 'from-cyan-600 to-cyan-800' },
            { label: 'Level Pemula', value: pretestRows.filter(r => (r.level_name || '').toLowerCase().includes('pemula')).length, icon: Play, color: 'from-amber-600 to-amber-800' },
            { label: 'Level Lanjutan', value: pretestRows.filter(r => !(r.level_name || '').toLowerCase().includes('pemula') && r.level_name).length, icon: CheckCircle, color: 'from-emerald-600 to-emerald-800' },
          ].map((s) => (
            <div key={s.label} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${s.color} p-5 shadow-lg`}>
              <s.icon className="absolute right-3 top-3 h-10 w-10 text-white/10" />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{s.label}</p>
              <p className="mt-1.5 text-3xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#262636] px-6 py-4">
          <div className="flex gap-1">
            <button onClick={() => setTab('asesmen')} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${tab === 'asesmen' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <ClipboardCheck className="inline-block h-3.5 w-3.5 -mt-0.5 mr-1" />Asesmen
            </button>
            <button onClick={() => setTab('pretest')} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${tab === 'pretest' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <FileCheck className="inline-block h-3.5 w-3.5 -mt-0.5 mr-1" />Pretest
            </button>
          </div>
          {tab === 'asesmen' ? (
            <div className="flex flex-wrap justify-end gap-1">
              {[
                { label: 'Semua', value: 'semua' },
                { label: 'Mengerjakan', value: 'mengerjakan' },
                { label: 'Menunggu Dinilai', value: 'menunggu' },
                { label: 'Selesai', value: 'selesai' },
              ].map((filter) => (
                <button key={filter.value} onClick={() => setStatusFilter(filter.value)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${statusFilter === filter.value ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                  {filter.label}
                </button>
              ))}
            </div>
          ) : tab === 'pretest' && (user?.roles?.includes('Super Admin') || user?.roles?.includes('Admin Diskominfo')) && (
            <button onClick={cleanupPretest} className="inline-flex items-center gap-1.5 rounded-full border border-rose-600/20 px-3 py-1.5 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" />Bersihkan</button>
          )}
        </div>

        {/* Tab: Asesmen */}
        {tab === 'asesmen' && (
          loading ? (
            <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-500"><Activity className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada data progres</p></div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-500"><Activity className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Tidak ada peserta pada filter ini</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-[#262636] bg-[#09090E]">
                    <th className="px-5 py-3.5 font-semibold">Peserta</th><th className="px-5 py-3.5 font-semibold">Asesmen</th><th className="px-5 py-3.5 font-semibold">Progress / Nilai</th><th className="px-5 py-3.5 font-semibold">Status</th><th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262636]">
                  {filteredRows.map((row) => {
                    const completed = row.status === 'selesai'
                    const belumMulai = row.status === 'belum_mulai'
                    const waiting = ['menunggu_dinilai', 'dinilai', 'wawancara'].includes(row.status)
                    const passed = row.lulus
                    const progress = completed ? 100 : (belumMulai ? 0 : (waiting ? 100 : 50))
                    const color = completed ? (passed ? 'from-emerald-500 to-emerald-400' : 'from-rose-500 to-rose-400') : (belumMulai ? 'from-slate-500 to-slate-400' : (waiting ? 'from-amber-500 to-amber-400' : 'from-indigo-500 to-violet-500'))
                    return (
                      <tr className="transition hover:bg-white/[0.02]" key={row.id}>
                        <td className="px-5 py-4"><p className="font-medium text-slate-100">{row.user?.name ?? '-'}</p><p className="mt-0.5 text-xs text-slate-500">{row.user?.opd_name ?? 'OPD'}</p></td>
                        <td className="px-5 py-4 text-slate-400">{row.asesmen?.judul ?? '-'}</td>
                        <td className="px-5 py-4 min-w-[200px]">
                          <div className="flex justify-between mb-1.5">
                            <span className="text-xs font-medium text-slate-300">{completed ? `Nilai: ${row.nilai}` : (belumMulai ? 'Belum mulai' : (waiting ? (row.status === 'dinilai' ? 'Dinilai' : row.status === 'wawancara' ? 'Wawancara' : 'Menunggu dinilai') : 'Sedang mengerjakan'))}</span>
                            <span className="text-xs text-slate-500">{completed ? '100%' : (belumMulai ? '0%' : '50%')}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#1E1E2E] overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all ${(!completed && !belumMulai && !waiting) ? 'animate-pulse' : ''}`} style={{ width: `${progress}%` }} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {completed ? (
                            passed ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"><CheckCircle className="h-3 w-3" /> Lulus</span>
                              : <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400"><XCircle className="h-3 w-3" /> Tidak Lulus</span>
                          ) : belumMulai ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-400">Belum mulai</span>
                          ) : waiting ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">{row.status === 'dinilai' ? 'Dinilai' : row.status === 'wawancara' ? 'Wawancara' : 'Menunggu dinilai'}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400"><Play className="h-3 w-3" /> Mengerjakan</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          {(user?.roles?.includes('Super Admin') || user?.roles?.includes('Admin Diskominfo')) && (
                            <>
                              {completed && <button onClick={() => resetExam(row)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10">Reset</button>}
                              <button onClick={() => deleteMonitoring(row)} className="ml-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-200"><Trash2 className="inline-block h-3 w-3 -mt-0.5" /> Hapus</button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab: Pretest */}
        {tab === 'pretest' && (
          /* Pending Activation */
          pendingActivation.length > 0 && (
            <div className="border-b border-[#262636] p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-bold text-slate-100">Aktivasi Pretest ({pendingActivation.length} menunggu)</h4>
                {pendingActivation.length > 1 && (
                  <button onClick={activateAllPretest} className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] font-medium text-indigo-400 hover:bg-indigo-500/30 transition ml-auto">Aktifkan Semua</button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pendingActivation.map((p) => (
                  <div key={p.user_id} className="flex items-center gap-2 rounded-full border border-[#262636] bg-[#1A1A26] pl-3 pr-1.5 py-1">
                    <span className="text-xs text-slate-300">{p.user_name}</span>
                    <span className="text-[10px] text-slate-500">{p.opd}</span>
                    <button onClick={() => activatePretest(p.user_id, p.user_name)} className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-400 hover:bg-indigo-500/30 transition">Aktifkan</button>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
        {tab === 'pretest' && (
          pretestLoading ? (
            <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
          ) : pretestRows.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-500"><FileCheck className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada hasil pretest</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-[#262636] bg-[#09090E]">
                    <th className="px-5 py-3.5 font-semibold">Peserta</th><th className="px-5 py-3.5 font-semibold">Level</th><th className="px-5 py-3.5 font-semibold">Nilai Rata-rata</th><th className="px-5 py-3.5 font-semibold">Tanggal</th><th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262636]">
                  {pretestRows.map((row) => (
                    <tr className="transition hover:bg-white/[0.02]" key={row.sesi_id}>
                      <td className="px-5 py-4"><p className="font-medium text-slate-100">{row.user_name}</p></td>
                      <td className="px-5 py-4 text-slate-400">{row.level_name}</td>
                      <td className="px-5 py-4 text-slate-300">{row.rata_rata}</td>
                      <td className="px-5 py-4 text-slate-400">{row.completed_at ? new Date(row.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</td>
                      <td className="px-5 py-4 text-right">
                        {(user?.roles?.includes('Super Admin') || user?.roles?.includes('Admin Diskominfo')) && (
                          <button onClick={() => resetPretest(row)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10">Reset</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Monitoring

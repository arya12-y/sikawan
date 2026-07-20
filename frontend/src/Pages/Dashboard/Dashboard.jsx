import { useCallback, useEffect, useState } from 'react'
import { BarChart3, Sparkles, RefreshCw, MapPin, Building, Users, BadgeCheck, Hourglass, TrendingUp } from 'lucide-react'
import { Bar, Doughnut, Pie, Radar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend } from 'chart.js'
import api from '../../api/axios'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend)

const theme = { indigo: '#6366f1', cyan: '#06b6d4', emerald: '#10b981', amber: '#f59e0b', rose: '#f43f5e', purple: '#a855f7', pink: '#ec4899', teal: '#14b8a6' }

const palette = Object.values(theme)

const makeChart = (items = [], label) => ({
  labels: items.map((i) => i.label),
  datasets: [{ label, data: items.map((i) => i.value), backgroundColor: palette, borderRadius: 6, borderSkipped: false }],
})

const makeRadar = (items = []) => ({
  labels: items.map((i) => i.label),
  datasets: [{
    label: 'Nilai Kompetensi', data: items.map((i) => i.value),
    backgroundColor: 'rgba(99,102,241,0.12)', borderColor: theme.indigo, borderWidth: 2,
    pointBackgroundColor: theme.indigo, pointBorderColor: '#fff', pointRadius: 4,
  }],
})

const statCards = [
  { icon: Building, value: 'opd', label: 'Jumlah OPD', gradient: 'from-indigo-600 to-indigo-800', badge: 'bg-indigo-500/100/10 text-indigo-400' },
  { icon: Users, value: 'walidata', label: 'Jumlah Walidata', gradient: 'from-cyan-600 to-cyan-800', badge: 'bg-cyan-500/10 text-cyan-400' },
  { icon: BadgeCheck, value: 'sudah_sertifikasi', label: 'Sudah Sertifikasi', gradient: 'from-emerald-600 to-emerald-800', badge: 'bg-emerald-500/10 text-emerald-400' },
  { icon: Hourglass, value: 'belum_sertifikasi', label: 'Belum Sertifikasi', gradient: 'from-amber-600 to-amber-800', badge: 'bg-amber-500/10 text-amber-400' },
  { icon: TrendingUp, value: 'nilai_rata_rata', label: 'Nilai Rata-rata', gradient: 'from-rose-600 to-rose-800', badge: 'bg-rose-500/10 text-rose-400' },
]

function Empty({ text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <BarChart3 className="mb-3 h-12 w-12 opacity-20" />
      <span className="text-sm font-medium">Belum ada data {text}</span>
      {sub && <span className="mt-1 text-xs">{sub}</span>}
    </div>
  )
}

function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get('/dashboard'); setData(res.data) } catch { setData(null) } finally { setLoading(false) }
  }, [])

  useEffect(() => { queueMicrotask(() => load()) }, [load])

  const totals = data?.totals || {}
  const progress = data?.training_progress
  const progressValue = Number(progress?.value || 0)
  const hasProgress = (progress?.total ?? 0) > 0

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14141E]/50 px-3 py-1 text-xs font-semibold tracking-wider text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              SIKAWAN ANALYTICS
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white">Dashboard Kompetensi Walidata</h1>
            <p className="text-sm text-indigo-200">Monitoring capaian kompetensi dan pembelajaran seluruh OPD</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#14141E]/50 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-[#14141E]/25 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loading ? 'Memuat...' : 'Perbarui Data'}
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-5 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon
              const val = totals[card.value] ?? 0
              return (
                <div key={card.value} className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${card.gradient} p-5 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5`}>
                  <div className="absolute right-3 top-3 opacity-10 transition group-hover:scale-110 group-hover:opacity-20">
                    <Icon className="h-12 w-12 text-white" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{card.label}</p>
                    <p className="mt-1.5 text-3xl font-bold text-white">{val}</p>
                    <p className="mt-1 text-xs text-white/50">Data terkini</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Level Distribution */}
            <div className="rounded-xl border border-[#1E1E2E] bg-[#14141E] p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-100">Distribusi Level</h3>
                <p className="mt-0.5 text-xs text-slate-400">Pemetaan level kompetensi Walidata</p>
              </div>
              <div className="flex items-center justify-center" style={{ height: 250 }}>
                {data?.level_distribution?.length ? (
                  <Doughnut data={makeChart(data.level_distribution, 'Walidata')} options={{
                    maintainAspectRatio: false, cutout: '60%',
                    plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, boxWidth: 8 } } },
                  }} />
                ) : <Empty text="level" sub="Belum ada level yang ditetapkan" />}
              </div>
            </div>

            {/* Assessment Status */}
            <div className="rounded-xl border border-[#1E1E2E] bg-[#14141E] p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-100">Status Asesmen</h3>
                <p className="mt-0.5 text-xs text-slate-400">Progres pengerjaan ujian Walidata</p>
              </div>
              <div className="flex items-center justify-center" style={{ height: 250 }}>
                {data?.asesmen_status?.length ? (
                  <Pie data={{
                    labels: data.asesmen_status.map((i) => i.label),
                    datasets: [{
                      data: data.asesmen_status.map((i) => i.value),
                      backgroundColor: ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e'],
                      borderWidth: 2,
                      borderColor: '#14141E',
                    }],
                  }} options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, boxWidth: 8 } },
                    },
                  }} />
                ) : <Empty text="asesmen" sub="Belum ada aktivitas ujian" />}
              </div>
            </div>

            {/* Training Progress */}
            <div className="rounded-xl border border-[#1E1E2E] bg-[#14141E] p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-100">Progress Pelatihan</h3>
                <p className="mt-0.5 text-xs text-slate-400">Penyelesaian materi pembelajaran</p>
              </div>
              {hasProgress ? (
                <div className="flex flex-col items-center justify-center" style={{ minHeight: 250 }}>
                  <div className="relative flex items-center justify-center">
                    <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="54" fill="none" stroke="#1E1E2E" strokeWidth="8" />
                      <circle
                        cx="64" cy="64" r="54" fill="none" stroke="#6366f1" strokeWidth="8"
                        strokeDasharray={`${progressValue * 3.39} 340`}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold text-indigo-400">{progressValue}%</span>
                      <span className="text-xs text-slate-400">Progres</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-6 text-center">
                    <div>
                      <span className="text-xs text-slate-400">Selesai</span>
                      <p className="text-lg font-bold text-slate-100">{progress?.completed ?? 0}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Total</span>
                      <p className="text-lg font-bold text-slate-100">{progress?.total ?? 0}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center" style={{ minHeight: 250 }}><Empty text="pelatihan" sub="Walidata belum mengakses materi" /></div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top 10 OPD */}
            <div className="rounded-xl border border-[#1E1E2E] bg-[#14141E] p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-100">Top 10 OPD</h3>
                <p className="mt-0.5 text-xs text-slate-400">Berdasarkan jumlah Walidata aktif</p>
              </div>
              <div style={{ height: 300 }}>
                {data?.top_opd?.length ? (
                  <Bar data={makeChart(data.top_opd, 'Jumlah Walidata')} options={{
                    maintainAspectRatio: false, indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true, grid: { color: '#1E1E2E' } }, y: { grid: { display: false } } },
                  }} />
                ) : <Empty text="OPD" sub="Belum ada Walidata terdaftar" />}
              </div>
            </div>

            {/* Top 10 Walidata */}
            <div className="rounded-xl border border-[#1E1E2E] bg-[#14141E] p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-100">Top 10 Walidata</h3>
                <p className="mt-0.5 text-xs text-slate-400">Berdasarkan nilai kompetensi tertinggi</p>
              </div>
              <div style={{ height: 300 }}>
                {data?.top_walidata?.length ? (
                  <Bar data={makeChart(data.top_walidata, 'Nilai Kompetensi')} options={{
                    maintainAspectRatio: false, indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: { x: { min: 0, max: 100, grid: { color: '#1E1E2E' } }, y: { grid: { display: false } } },
                  }} />
                ) : <Empty text="walidata" sub="Belum ada nilai kompetensi" />}
              </div>
            </div>
          </div>

          {/* Kompetensi Charts */}
          <div className="grid grid-cols-5 gap-4">
            {/* Radar */}
            <div className="col-span-2 rounded-xl border border-[#1E1E2E] bg-[#14141E] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Grafik Kompetensi</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Nilai rata-rata per domain</p>
                </div>
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400">0–100</span>
              </div>
              <div className="flex items-center justify-center" style={{ height: 320 }}>
                {data?.kompetensi_scores?.length ? (
                  <Radar data={makeRadar(data.kompetensi_scores)} options={{
                    maintainAspectRatio: false,
                    scales: { r: { min: 0, max: 100, ticks: { stepSize: 20, display: false }, grid: { color: '#1E1E2E' }, angleLines: { color: '#1E1E2E' }, pointLabels: { font: { size: 10, weight: '600' }, color: '#94A3B8' } } },
                    plugins: { legend: { display: false } },
                  }} />
                ) : <Empty text="grafik kompetensi" sub="Belum ada penilaian" />}
              </div>
            </div>

            {/* Competency Map */}
            <div className="col-span-3 rounded-xl border border-[#1E1E2E] bg-[#14141E] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Peta Sebaran Kompetensi</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Ringkasan capaian nilai per OPD</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400">
                  <MapPin className="h-3 w-3" />OPD
                </span>
              </div>
              {data?.kompetensi_map?.length ? (
                <div className="space-y-2" style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {data.kompetensi_map.map((item) => {
                    const color = item.nilai >= 80 ? '#10b981' : item.nilai >= 60 ? '#f59e0b' : '#ef4444'
                    return (
                      <div key={item.opd} className="flex items-center gap-3 rounded-lg border border-[#1E1E2E] bg-[#14141E]/[0.02] p-3 transition hover:bg-[#14141E]/[0.03]">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: color }}>{item.nilai}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-100">{item.opd}</p>
                          <p className="text-xs text-slate-400">{item.walidata} Walidata</p>
                        </div>
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full rounded-full transition-all" style={{ width: `${item.nilai}%`, background: color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : <Empty text="peta sebaran" sub="Belum ada data OPD" />}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard

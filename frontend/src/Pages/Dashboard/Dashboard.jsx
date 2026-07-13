import { useCallback, useEffect, useState } from 'react'
import { Bar, Doughnut, Radar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend } from 'chart.js'
import api from '../../api/axios'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend)

const palette = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const chart = (items = [], label) => ({ labels: items.map((item) => item.label), datasets: [{ label, data: items.map((item) => item.value), backgroundColor: palette, borderRadius: 8, borderSkipped: false }] })
const radar = (items = []) => ({ labels: items.map((item) => item.label), datasets: [{ label: 'Nilai Kompetensi', data: items.map((item) => item.value), backgroundColor: 'rgba(99,102,241,0.20)', borderColor: '#6366f1', borderWidth: 2, pointBackgroundColor: '#fff', pointBorderColor: '#6366f1', pointRadius: 4 }] })

function Empty({ text }) { return <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100 min-vh-25"><i className="bi bi-bar-chart-line mb-2" style={{ fontSize: '2.5rem', opacity: 0.3 }}></i><span className="small">Belum ada data {text}</span></div> }

function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get('/dashboard'); setData(res.data) } catch { setData(null) } finally { setLoading(false) }
  }, [])

  useEffect(() => { queueMicrotask(() => load()) }, [load])

  const totals = data?.totals || {}
  const stats = [
    { title: 'Jumlah OPD', value: totals.opd ?? 0, icon: 'bi-building', className: 'stat-card-primary' },
    { title: 'Jumlah Walidata', value: totals.walidata ?? 0, icon: 'bi-people', className: 'stat-card-info' },
    { title: 'Sudah Sertifikasi', value: totals.sudah_sertifikasi ?? 0, icon: 'bi-patch-check', className: 'stat-card-success' },
    { title: 'Belum Sertifikasi', value: totals.belum_sertifikasi ?? 0, icon: 'bi-hourglass-split', className: 'stat-card-danger' },
    { title: 'Nilai Rata-rata', value: totals.nilai_rata_rata ?? 0, icon: 'bi-graph-up-arrow', className: 'stat-card-warning' },
  ]
  const progress = data?.training_progress
  const progressValue = Number(progress?.value || 0)

  return (
    <div>
      <div className="dashboard-hero mb-4">
        <div><span className="dashboard-kicker"><i className="bi bi-stars me-1"></i>SIKAWAN ANALYTICS</span><h3>Dashboard Kompetensi Walidata</h3><p>Monitoring capaian kompetensi dan pembelajaran seluruh OPD.</p></div>
        <button className="btn btn-light shadow-sm" onClick={load}><i className="bi bi-arrow-clockwise me-1"></i>Perbarui Data</button>
      </div>

      {loading ? <div className="text-center py-5 text-muted">Memuat dashboard...</div> : <>
        <div className="row g-3 mb-4">{stats.map((s) => <div className="col-sm-6 col-lg col-12" key={s.title}><div className={`stat-card ${s.className} h-100`}><div className="stat-card-body d-flex align-items-center"><div><p className="stat-card-title">{s.title}</p><p className="stat-card-value">{s.value}</p><p className="stat-card-subtitle">Data terkini</p></div><div className="stat-card-icon ms-auto"><i className={`bi ${s.icon}`}></i></div></div></div></div>)}</div>

        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-4"><div className="card h-100"><div className="card-body d-flex flex-column"><div className="chart-head mb-auto"><div><h6>Distribusi Level</h6><p>Pemetaan level kompetensi</p></div></div><div style={{ position: 'relative', height: '240px', width: '100%' }}>{data?.level_distribution?.length ? <Doughnut data={chart(data.level_distribution, 'Walidata')} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /> : <Empty text="level" />}</div></div></div></div>
          <div className="col-md-6 col-lg-4"><div className="card h-100"><div className="card-body d-flex flex-column"><div className="chart-head mb-auto"><div><h6>Status Asesmen</h6><p>Progres pengerjaan ujian</p></div></div><div style={{ position: 'relative', height: '240px', width: '100%' }}>{data?.asesmen_status?.length ? <Doughnut data={chart(data.asesmen_status, 'Peserta')} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /> : <Empty text="asesmen" />}</div></div></div></div>
          <div className="col-md-12 col-lg-4"><div className="card h-100"><div className="card-body d-flex flex-column"><div className="chart-head mb-auto"><div><h6>Progress Pelatihan</h6><p>Penyelesaian materi</p></div></div><div className="training-progress h-100"><div className="progress-ring" style={{ '--progress': `${progressValue * 3.6}deg` }}><div className="progress-ring-inner"><strong>{progressValue}%</strong><span>Progres</span></div></div><div className="training-details mt-3 text-center d-flex gap-3 justify-content-center"><div><span>Selesai</span><strong>{progress?.completed ?? 0}</strong></div><div><span>Total</span><strong>{progress?.total ?? 0}</strong></div></div></div></div></div></div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-6"><div className="card h-100"><div className="card-body"><div className="chart-head"><div><h6>Top 10 OPD</h6><p>Berdasarkan jumlah Walidata</p></div></div><div style={{ height: '300px', width: '100%' }}>{data?.top_opd?.length ? <Bar data={chart(data.top_opd, 'Jumlah Walidata')} options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: '#eef2ff' } }, y: { grid: { display: false } } } }} /> : <Empty text="OPD" />}</div></div></div></div>
          <div className="col-lg-6"><div className="card h-100"><div className="card-body"><div className="chart-head"><div><h6>Top 10 Walidata</h6><p>Berdasarkan nilai kompetensi</p></div></div><div style={{ height: '300px', width: '100%' }}>{data?.top_walidata?.length ? <Bar data={chart(data.top_walidata, 'Nilai Kompetensi')} options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { min: 0, max: 100, grid: { color: '#eef2ff' } }, y: { grid: { display: false } } } }} /> : <Empty text="walidata" />}</div></div></div></div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-5"><div className="card h-100"><div className="card-body d-flex flex-column"><div className="chart-head mb-auto"><div><h6>Grafik Kompetensi</h6><p>Nilai rata-rata per domain</p></div><span className="chart-chip">0–100</span></div><div style={{ position: 'relative', height: '320px', width: '100%', marginTop: '10px' }}>{data?.kompetensi_scores?.length ? <Radar data={radar(data.kompetensi_scores)} options={{ maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { stepSize: 20, display: false }, grid: { color: '#e0e7ff' }, angleLines: { color: '#e0e7ff' }, pointLabels: { font: { size: 10, weight: '600' }, color: '#475569' } } }, plugins: { legend: { display: false } } }} /> : <Empty text="grafik kompetensi" />}</div></div></div></div>
          <div className="col-lg-7"><div className="card h-100"><div className="card-body"><div className="chart-head mb-4"><div><h6>Peta Sebaran Kompetensi</h6><p>Ringkasan capaian nilai Walidata di tiap OPD</p></div><span className="chart-chip"><i className="bi bi-geo-alt me-1"></i>OPD</span></div>{data?.kompetensi_map?.length ? <div className="kompetensi-map" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>{data.kompetensi_map.map((item) => <div className="map-item mb-2" key={item.opd}><div className="map-score" style={{ background: item.nilai >= 80 ? '#10b981' : item.nilai >= 60 ? '#f59e0b' : '#ef4444' }}>{item.nilai}</div><div className="map-info"><strong>{item.opd}</strong><span>{item.walidata} Walidata</span></div><div className="map-bar"><div style={{ width: `${item.nilai}%`, background: item.nilai >= 80 ? '#10b981' : item.nilai >= 60 ? '#f59e0b' : '#ef4444' }}></div></div></div>)}</div> : <Empty text="peta sebaran" />}</div></div></div>
        </div>
      </>}
    </div>
  )
}

export default Dashboard

import { useEffect, useState } from 'react'
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from 'chart.js'
import api from '../../api/axios'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#20c997']
const fallback = { labels: ['Jan', 'Feb', 'Mar', 'Apr'], values: [12, 19, 8, 15] }
const chart = (item = fallback, label = 'Data') => ({ labels: item.labels || fallback.labels, datasets: [{ label, data: item.values || fallback.values, backgroundColor: colors, borderColor: colors[0] }] })

const toChart = (items, labelKeys = ['label', 'nama', 'name'], valueKeys = ['total', 'jumlah', 'count', 'value']) => {
  if (!Array.isArray(items)) return fallback
  return {
    labels: items.map((item) => labelKeys.map((key) => item[key]).find(Boolean) ?? '-'),
    values: items.map((item) => valueKeys.map((key) => item[key]).find((value) => value !== undefined) ?? 0),
  }
}

const normalizeDashboard = (payload) => {
  const data = payload?.data ?? payload ?? {}
  const totals = data.totals ?? data.stats ?? {}
  return {
    ...data,
    stats: totals,
    recent_activity: data.recent_audit_logs ?? data.recent_activity ?? [],
    top_opd: toChart(data.top_opd),
    top_walidata: toChart(data.top_walidata),
  }
}

function StatCards({ stats }) {
  return <div className="row g-3 mb-3">{Object.entries(stats).map(([k, v]) => <div className="col-md-3" key={k}><div className="card shadow-sm"><div className="card-body"><div className="text-muted text-capitalize">{k.replaceAll('_', ' ')}</div><h3>{v}</h3></div></div></div>)}</div>
}

function Dashboard() {
  const [data, setData] = useState({ stats: { user: 0, materi: 0, asesmen: 0, sertifikat: 0 }, recent_activity: [] })

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(normalizeDashboard(res.data))).catch(() => {})
  }, [])

  return (
    <>
      <h4 className="mb-3">Dashboard</h4>
      <StatCards stats={data.stats || {}} />
      <div className="row g-3">
        <div className="col-lg-6"><div className="card shadow-sm"><div className="card-body"><h6>Kompetensi</h6><Bar data={chart(data.kompetensi, 'Kompetensi')} /></div></div></div>
        <div className="col-lg-6"><div className="card shadow-sm"><div className="card-body"><h6>Nilai</h6><Line data={chart(data.nilai, 'Nilai')} /></div></div></div>
        <div className="col-lg-4"><div className="card shadow-sm"><div className="card-body"><h6>Level</h6><Pie data={chart(data.level, 'Level')} /></div></div></div>
        <div className="col-lg-8"><div className="card shadow-sm"><div className="card-body"><h6>Progress</h6><Line data={chart(data.progress, 'Progress')} /></div></div></div>
        <div className="col-lg-6"><div className="card shadow-sm"><div className="card-body"><h6>Top OPD</h6><Bar data={chart(data.top_opd, 'OPD')} /></div></div></div>
        <div className="col-lg-6"><div className="card shadow-sm"><div className="card-body"><h6>Top Walidata</h6><Doughnut data={chart(data.top_walidata, 'Walidata')} /></div></div></div>
        <div className="col-12"><div className="card shadow-sm"><div className="card-body"><h6>Recent Activity</h6><div className="list-group list-group-flush">{(data.recent_activity || []).map((x, i) => <div className="list-group-item" key={x.id || i}>{x.title || x.activity || x.description || x.action}</div>)}</div></div></div></div>
      </div>
    </>
  )
}

export default Dashboard

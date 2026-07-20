import { useCallback, useEffect, useState } from 'react'
import { FileText, FileSpreadsheet, Download, FileBarChart, Loader, ChevronDown } from 'lucide-react'
import api from '../../api/axios'
import { can } from '../../utils/can'
import { useAuth } from '../../hooks/useAuth'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])

function Laporan() {
  const { user } = useAuth()
  const [type, setType] = useState('asesmen')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/laporan/${type}`)
      setRows(normalize(res.data))
    } catch (e) { alert(e.response?.data?.message || 'Gagal memuat laporan') } finally { setLoading(false) }
  }, [type])

  useEffect(() => { queueMicrotask(() => load()) }, [load])

  const download = async (format) => {
    setExporting(format)
    try {
      const endpoint = format === 'pdf' ? '/laporan/export-pdf' : '/laporan/export-excel'
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const res = await api.get(endpoint, { params: { type }, responseType: 'blob', signal: controller.signal })
      clearTimeout(timeout)
      const disposition = res.headers?.['content-disposition']
      const filename = disposition?.match(/filename=(.+)/)?.[1] || `laporan-${type}.${format === 'pdf' ? 'pdf' : 'csv'}`
      const url = URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url; link.download = filename
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
    } catch (e) {
      if (e.name === 'AbortError') { alert('Waktu permintaan habis. Coba lagi.') }
      else if (e.response?.data instanceof Blob) { const text = await e.response.data.text(); try { const json = JSON.parse(text); alert(json.message || 'Gagal export laporan') } catch { alert(text || 'Gagal export laporan') } }
      else { alert(e.response?.data?.message || e.message || 'Gagal export laporan') }
    } finally { setExporting(null) }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-indigo-950/20 p-7 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTI0IDI0di0ySDI0djJ6TTI0IDE2di0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"><FileBarChart className="h-3 w-3" /> Pusat Dokumen</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-100">Laporan</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">Laporan asesmen dan sertifikasi dalam bentuk tabel, PDF, dan Excel/CSV.</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="relative">
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="h-10 appearance-none rounded-full border border-[#262636] bg-[#1A1A26] pl-4 pr-9 text-sm text-slate-100 outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20">
                <option value="asesmen">Asesmen</option>
                <option value="sertifikat">Sertifikat</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
            {can(user, 'laporan.export-pdf') && (
              <button onClick={() => download('pdf')} disabled={exporting !== null}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition-all hover:from-rose-500 hover:to-rose-600 disabled:opacity-50">
                {exporting === 'pdf' ? <Loader className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {exporting === 'pdf' ? 'Mendownload...' : 'PDF'}
              </button>
            )}
            {can(user, 'laporan.export-excel') && (
              <button onClick={() => download('excel')} disabled={exporting !== null}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50">
                {exporting === 'excel' ? <Loader className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                {exporting === 'excel' ? 'Mendownload...' : 'Excel'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#262636] px-6 py-4">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            type === 'asesmen' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
          }`}>{type === 'asesmen' ? '📋 Asesmen' : '📜 Sertifikat'}</span>
          <span className="text-xs text-slate-500">{rows.length} data</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-500"><FileBarChart className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada data laporan</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr className="border-b border-[#262636] bg-[#09090E]">
                  <th className="px-5 py-3.5 font-semibold">Nama</th><th className="px-5 py-3.5 font-semibold">Asesmen</th><th className="px-5 py-3.5 font-semibold text-center w-16">Nilai</th><th className="px-5 py-3.5 font-semibold w-24">Status</th><th className="px-5 py-3.5 font-semibold w-28">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262636]">
                {rows.map((row) => (
                  <tr className="transition hover:bg-white/[0.02]" key={row.id}>
                    <td className="px-5 py-4 font-medium text-slate-100">{row.user?.name || '-'}</td>
                    <td className="px-5 py-4 text-slate-400">{row.asesmen?.judul || row.nomor_sertifikat || '-'}</td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-100">{row.nilai || row.nilai_akhir || '-'}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      row.status === 'selesai' || row.lulus ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20' :
                      row.status === 'sedang_mengerjakan' ? 'bg-amber-500/10 text-amber-400 ring-amber-400/20' :
                      row.is_active ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20' :
                      'bg-slate-500/10 text-slate-400 ring-slate-400/20'
                    }`}>{row.lulus ? 'Lulus' : row.status || (row.is_active ? 'Aktif' : '-')}</span></td>
                    <td className="px-5 py-4 text-slate-400">{new Date(row.created_at || row.tanggal_terbit).toISOString().split('T')[0]}</td>
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

export default Laporan

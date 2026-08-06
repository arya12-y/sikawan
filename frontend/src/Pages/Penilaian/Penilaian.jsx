import { useCallback, useEffect, useState } from 'react'
import { ClipboardCheck, RefreshCw, CheckCircle, XCircle, MessageSquare, Search, ThumbsUp, ThumbsDown } from 'lucide-react'
import api from '../../api/axios'
import { showConfirm, showConfirmWithInput } from '../../utils/alert'
import { toast } from '../../utils/toast'

const inputClass = 'w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'

function Penilaian() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('belum')
  const [verifTab, setVerifTab] = useState('menunggu')
  const [selected, setSelected] = useState(null)
  const [nilai, setNilai] = useState('')
  const [catatan, setCatatan] = useState('')
  const [wawancaraList, setWawancaraList] = useState([])
  const [wawancaraLoading, setWawancaraLoading] = useState(false)
  const [riwayat, setRiwayat] = useState([])
  const [riwayatLoading, setRiwayatLoading] = useState(false)

  // State: Jadwal Wawancara Modal
  const [jadwalModal, setJadwalModal] = useState(null)
  const [jadwalForm, setJadwalForm] = useState({ waktu_mulai: '', durasi_menit: 30, metode: 'tatap_muka', catatan_jadwal: '' })

  // State: Nilai Wawancara Modal
  const [nilaiWawancara, setNilaiWawancara] = useState(null)
  const [nilaiForm, setNilaiForm] = useState({ pemahaman: 3, komunikasi: 3, penerapan: 3, sikap: 3 })
  const [catatanWawancara, setCatatanWawancara] = useState('')
  const [rekomendasi, setRekomendasi] = useState('lulus')
  const [wSaving, setWSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/penilaian/essay')
      setRows(res.data?.data ?? (Array.isArray(res.data) ? res.data : []))
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadWawancara = useCallback(async () => {
    setWawancaraLoading(true)
    try {
      const res = await api.get('/penilaian/wawancara', { params: { per_page: 50 } })
      setWawancaraList(res.data?.data ?? res.data ?? [])
    } catch {
      setWawancaraList([])
    } finally {
      setWawancaraLoading(false)
    }
  }, [])

  const loadRiwayat = useCallback(async () => {
    setRiwayatLoading(true)
    try {
      const res = await api.get('/penilaian/riwayat')
      const data = res.data?.data ?? res.data
      setRiwayat(Array.isArray(data) ? data : [])
    } catch {
      setRiwayat([])
    } finally {
      setRiwayatLoading(false)
    }
  }, [])

  useEffect(() => { queueMicrotask(() => { load(); loadWawancara(); loadRiwayat() }) }, [load, loadWawancara, loadRiwayat])

  const openGrading = (row) => { setSelected(row); setNilai(row.nilai ?? ''); setCatatan(row.catatan_penguji ?? '') }

  const saveGrade = async () => {
    if (nilai === '' || isNaN(nilai)) return
    setSaving(true)
    try {
      await api.post(`/jawaban-pesertas/${selected.id}/grade-essay`, { nilai: Number(nilai), catatan_penguji: catatan || null })
      setSelected(null); load()
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal menyimpan nilai')
    } finally { setSaving(false) }
  }

  const doApprove = async (pesertaId, nama) => {
    const result = await showConfirmWithInput(
      `Approve ${nama}?`,
      'Peserta akan dinyatakan LULUS.',
      'Catatan (opsional)',
      'Ya, Approve'
    )
    if (!result.isConfirmed) return
    try {
      await api.post(`/peserta-asesmens/${pesertaId}/approve`, { catatan: result.value || null })
      setRows(prev => prev.map(r => r.peserta_id === pesertaId ? { ...r, lulus: true } : r))
      toast('success', 'Berhasil menyetujui peserta')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal approve')
    }
  }

  const doTolak = async (pesertaId, nama) => {
    const result = await showConfirmWithInput(
      `Tolak ${nama}?`,
      'Peserta akan dinyatakan TIDAK LULUS.',
      'Alasan penolakan (opsional)',
      'Ya, Tolak'
    )
    if (!result.isConfirmed) return
    try {
      await api.post(`/peserta-asesmens/${pesertaId}/tolak`, { catatan: result.value || null })
      setRows(prev => prev.map(r => r.peserta_id === pesertaId ? { ...r, lulus: false } : r))
      toast('success', 'Peserta berhasil ditolak')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal tolak')
    }
  }

  const simpanJadwal = async () => {
    if (!jadwalForm.waktu_mulai) return
    setSaving(true)
    try {
      const payload = { ...jadwalForm, waktu_mulai: new Date(jadwalForm.waktu_mulai).toISOString() }
      await api.post(`/penilaian/wawancara/${jadwalModal.peserta_id}/jadwal`, payload)
      setJadwalModal(null)
      loadWawancara()
      load()
      toast('success', 'Wawancara berhasil dijadwalkan')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal simpan jadwal')
    } finally { setSaving(false) }
  }

  const openNilaiWawancara = (w) => {
    setNilaiWawancara(w)
    setNilaiForm({ pemahaman: w.nilai_pemahaman ?? 3, komunikasi: w.nilai_komunikasi ?? 3, penerapan: w.nilai_penerapan ?? 3, sikap: w.nilai_sikap ?? 3 })
    setCatatanWawancara(w.catatan_wawancara ?? '')
    setRekomendasi(w.rekomendasi ?? 'lulus')
  }

  const hapusWawancara = async (id, nama) => {
    const confirmed = await showConfirm(
      'Hapus wawancara?',
      `Wawancara "${nama}" akan dihapus.`,
      'Ya, Hapus'
    )
    if (!confirmed) return
    try {
      await api.delete(`/penilaian/wawancara/${id}`)
      loadWawancara()
      toast('success', 'Berhasil menghapus Wawancara')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal hapus wawancara')
    }
  }

  const simpanNilaiWawancara = async () => {
    setWSaving(true)
    try {
      await api.put(`/penilaian/wawancara/${nilaiWawancara.id}/nilai`, {
        nilai_pemahaman: nilaiForm.pemahaman, nilai_komunikasi: nilaiForm.komunikasi,
        nilai_penerapan: nilaiForm.penerapan, nilai_sikap: nilaiForm.sikap,
      })
      toast('success', 'Berhasil menyimpan Nilai wawancara')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal simpan nilai')
      setWSaving(false); return
    }
    try {
      await api.post(`/penilaian/wawancara/${nilaiWawancara.id}/selesai`, { catatan_wawancara: catatanWawancara, rekomendasi })
      setNilaiWawancara(null)
      loadWawancara()
      toast('success', 'Berhasil menyelesaikan Wawancara')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal selesaikan wawancara')
    } finally { setWSaving(false) }
  }

  const filteredRows = rows.filter(r => !search || r.peserta_nama.toLowerCase().includes(search.toLowerCase()) || r.asesmen.toLowerCase().includes(search.toLowerCase()))
  const belumDinilai = filteredRows.filter(r => !r.dinilai)
  const sudahDinilai = filteredRows.filter(r => r.dinilai)
  const pesertaGroups = {}
  sudahDinilai.forEach(r => {
    if (!pesertaGroups[r.peserta_id]) pesertaGroups[r.peserta_id] = { peserta_id: r.peserta_id, nama: r.peserta_nama, asesmen: r.asesmen, total: 0, graded: 0, lulus: r.lulus, nilai_total: r.nilai_total, wawancara_pending: r.wawancara_pending ?? (r.status === 'wawancara'), status: r.status }
    pesertaGroups[r.peserta_id].wawancara_pending = r.wawancara_pending ?? (r.status === 'wawancara')
    pesertaGroups[r.peserta_id].status = r.status
    if (r.nilai_total !== null && r.nilai_total !== undefined) pesertaGroups[r.peserta_id].nilai_total = r.nilai_total
    pesertaGroups[r.peserta_id].total++; pesertaGroups[r.peserta_id].graded++; if (r.lulus !== null) pesertaGroups[r.peserta_id].lulus = r.lulus
  })
  belumDinilai.forEach(r => {
    if (!pesertaGroups[r.peserta_id]) pesertaGroups[r.peserta_id] = { peserta_id: r.peserta_id, nama: r.peserta_nama, asesmen: r.asesmen, total: 0, graded: 0, lulus: null, nilai_total: r.nilai_total, wawancara_pending: r.wawancara_pending ?? (r.status === 'wawancara'), status: r.status }
    pesertaGroups[r.peserta_id].wawancara_pending = r.wawancara_pending ?? (r.status === 'wawancara')
    pesertaGroups[r.peserta_id].status = r.status
    if (r.nilai_total !== null && r.nilai_total !== undefined) pesertaGroups[r.peserta_id].nilai_total = r.nilai_total
    pesertaGroups[r.peserta_id].total++
  })
  const siapVerifikasi = Object.values(pesertaGroups).filter(p => p.total === p.graded)

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-indigo-950/20 p-7 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"><ClipboardCheck className="h-3 w-3" /> Penilaian</span>
        <h1 className="mt-3 text-2xl font-bold text-slate-100">Penilaian & Verifikasi</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">Nilai essay, kelola wawancara, dan verifikasi kelulusan peserta.</p>
      </div>

      <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#262636] px-6 py-4">
          <div className="flex gap-1">
            <button onClick={() => setTab('belum')} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${tab === 'belum' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Belum Dinilai ({belumDinilai.length})</button>
            <button onClick={() => setTab('sudah')} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${tab === 'sudah' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Sudah Dinilai ({sudahDinilai.length})</button>
            <button onClick={() => { setTab('wawancara'); loadWawancara() }} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${tab === 'wawancara' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>Wawancara ({wawancaraList.length})</button>
            <button onClick={() => { setTab('verifikasi'); loadRiwayat() }} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${tab === 'verifikasi' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Verifikasi ({siapVerifikasi.length})</button>
          </div>
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input className="h-9 w-48 rounded-full border border-[#262636] bg-[#1A1A26] pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => { load(); loadWawancara() }} disabled={loading} className="inline-flex items-center gap-1.5 rounded-full border border-[#262636] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-indigo-500/30 hover:text-indigo-400"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
        </div>

        {/* Tab: Belum/Sudah Dinilai */}
        {tab !== 'verifikasi' && tab !== 'wawancara' && (
          loading ? (
            <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
          ) : (tab === 'belum' ? belumDinilai : sudahDinilai).length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-500"><ClipboardCheck className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">{tab === 'belum' ? 'Semua sudah dinilai' : 'Belum ada nilai'}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-[#262636] bg-[#09090E]">
                    <th className="px-5 py-3.5 font-semibold">Peserta</th><th className="px-5 py-3.5 font-semibold">Asesmen</th><th className="px-5 py-3.5 font-semibold hidden lg:table-cell">Soal</th><th className="px-5 py-3.5 font-semibold w-20">Nilai</th><th className="px-5 py-3.5 text-right font-semibold w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262636]">
                  {(tab === 'belum' ? belumDinilai : sudahDinilai).map((row) => (
                    <tr className="transition hover:bg-white/[0.02]" key={row.id}>
                      <td className="px-5 py-4"><p className="font-medium text-slate-100">{row.peserta_nama}</p><p className="mt-0.5 text-xs text-slate-500">{row.asesmen}</p></td>
                      <td className="px-5 py-4 text-slate-400">{row.asesmen}</td>
                      <td className="px-5 py-4 text-slate-400 hidden lg:table-cell max-w-xs truncate">{row.soal}</td>
                      <td className="px-5 py-4">{row.dinilai ? <span className="font-medium text-slate-100">{row.nilai}</span> : <span className="text-slate-500">-</span>}</td>
                      <td className="px-5 py-4 text-right"><button onClick={() => openGrading(row)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/10">{row.dinilai ? 'Edit' : 'Nilai'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab: Wawancara */}
        {tab === 'wawancara' && (
          wawancaraLoading ? (
            <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
          ) : wawancaraList.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-500"><MessageSquare className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada wawancara</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-[#262636] bg-[#09090E]">
                    <th className="px-5 py-3.5 font-semibold">Peserta</th><th className="px-5 py-3.5 font-semibold hidden md:table-cell">Asesmen</th><th className="px-5 py-3.5 font-semibold">Status</th><th className="px-5 py-3.5 text-right font-semibold w-48">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262636]">
                  {wawancaraList.map((w) => {
                    const nama = w.peserta_asesmen?.user?.name ?? '-'
                    const asesmen = w.peserta_asesmen?.asesmen?.judul ?? '-'
                    const statusBadge = w.status === 'selesai' ? 'bg-emerald-500/10 text-emerald-400'
                      : w.status === 'terjadwal' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                    const statusLabel = w.status === 'selesai' ? '✅ Selesai' : w.status === 'terjadwal' ? '🟡 Terjadwal' : '🔴 Belum'
                    return (
                      <tr className="transition hover:bg-white/[0.02]" key={w.id}>
                        <td className="px-5 py-4"><p className="font-medium text-slate-100">{nama}</p><p className="mt-0.5 text-xs text-slate-500">{asesmen}</p></td>
                        <td className="px-5 py-4 text-slate-400 hidden md:table-cell">{asesmen}</td>
                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge}`}>{statusLabel}</span></td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          {w.status === 'belum' && (
                            <button onClick={() => setJadwalModal({ id: w.id, peserta_id: w.peserta_asesmen_id, nama, asesmen })} className="rounded-lg px-2.5 py-1 text-xs font-medium text-amber-400 transition hover:bg-amber-500/10">🗓️ Jadwalkan</button>
                          )}
                          {w.status === 'terjadwal' && (
                            <button onClick={() => openNilaiWawancara(w)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/10">Mulai Wawancara</button>
                          )}
                          {w.status === 'selesai' && (
                            <span className="text-xs text-slate-500 mr-2">{w.rekomendasi === 'lulus' ? '✅ Lulus' : '❌ Tidak Lulus'}</span>
                          )}
                          <button onClick={() => hapusWawancara(w.id, nama)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10 ml-1">Hapus</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab: Verifikasi */}
        {tab === 'verifikasi' && (
          <div className="space-y-5 p-5">
            <div className="flex gap-1 px-1 pt-0">
              <button onClick={() => setVerifTab('menunggu')} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${verifTab === 'menunggu' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Menunggu Verifikasi ({siapVerifikasi.length})</button>
              <button onClick={() => setVerifTab('riwayat')} className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${verifTab === 'riwayat' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Riwayat ({riwayat.length})</button>
            </div>
            {verifTab === 'menunggu' && (
            <section className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
              <div className="border-b border-[#262636] px-5 py-4"><h3 className="text-sm font-bold text-slate-100">Menunggu Verifikasi</h3></div>
              {loading ? (
                <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
              ) : siapVerifikasi.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-slate-500"><ClipboardCheck className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada peserta siap verifikasi</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-slate-500"><tr className="border-b border-[#262636] bg-[#09090E]"><th className="px-5 py-3.5 text-center font-semibold">Peserta</th><th className="px-5 py-3.5 text-center font-semibold">Asesmen</th><th className="px-5 py-3.5 text-center font-semibold">Essay</th><th className="px-5 py-3.5 text-center font-semibold">Nilai Total</th><th className="px-5 py-3.5 text-center font-semibold w-72">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-[#262636]">
                      {siapVerifikasi.map((p) => {
                        const sudahDiVerifikasi = p.lulus !== null && p.lulus !== undefined
                        const wawancara = p.wawancara_pending === true || p.status === 'wawancara'
                        return <tr className="transition hover:bg-white/[0.02]" key={p.peserta_id}>
                          <td className="px-5 py-4 text-center"><p className="font-medium text-slate-100">{p.nama}</p>{sudahDiVerifikasi && <p className={`mt-0.5 text-xs ${p.lulus ? 'text-emerald-400' : 'text-rose-400'}`}>{p.lulus ? '✅ Lulus' : '❌ Tidak Lulus'}</p>}</td><td className="px-5 py-4 text-center text-slate-400">{p.asesmen}</td><td className="px-5 py-4 text-center"><span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"><CheckCircle className="h-3 w-3" /> {p.graded}/{p.total}</span></td><td className="px-5 py-4 text-center"><span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">{p.nilai_total ?? '-'}</span></td><td className="px-5 py-4 text-center">
                            {!sudahDiVerifikasi && !wawancara ? <div className="flex items-center justify-center gap-1.5"><button onClick={() => setJadwalModal({ peserta_id: p.peserta_id, nama: p.nama, asesmen: p.asesmen })} className="rounded-lg border border-amber-600/20 px-2.5 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/10"><MessageSquare className="inline-block h-3.5 w-3.5 -mt-0.5" /> Wawancara</button><button onClick={() => doApprove(p.peserta_id, p.nama)} className="rounded-lg border border-emerald-600/20 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10"><ThumbsUp className="inline-block h-3.5 w-3.5 -mt-0.5" /> Approve</button><button onClick={() => doTolak(p.peserta_id, p.nama)} className="rounded-lg border border-rose-600/20 px-2.5 py-1.5 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"><ThumbsDown className="inline-block h-3.5 w-3.5 -mt-0.5" /> Tolak</button></div> : wawancara ? <div className="flex items-center justify-center gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">🟡 Wawancara dijadwalkan</span><span className="text-xs text-slate-500">Menunggu</span></div> : <span className="text-xs text-slate-500">Selesai</span>}
                          </td></tr>
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            )}
            {verifTab === 'riwayat' && (
            <section className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
              <div className="border-b border-[#262636] px-5 py-4"><h3 className="text-sm font-bold text-slate-100">Riwayat Verifikasi</h3></div>
              {riwayatLoading ? <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div> : riwayat.length === 0 ? <div className="py-12 text-center text-sm text-slate-500">Belum ada riwayat verifikasi</div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-500"><tr className="border-b border-[#262636] bg-[#09090E]"><th className="px-5 py-3.5 font-semibold">Peserta</th><th className="px-5 py-3.5 font-semibold">Asesmen</th><th className="px-5 py-3.5 font-semibold">Nilai</th><th className="px-5 py-3.5 font-semibold">Hasil</th><th className="px-5 py-3.5 font-semibold">Cara Verifikasi</th><th className="px-5 py-3.5 font-semibold">Waktu</th></tr></thead><tbody className="divide-y divide-[#262636]">{riwayat.map((r, i) => <tr key={`${r.peserta_id}-${r.approved_at}-${i}`}><td className="px-5 py-4 font-medium text-slate-100">{r.nama}</td><td className="px-5 py-4 text-slate-400">{r.asesmen}</td><td className="px-5 py-4 text-slate-300">{r.nilai ?? '-'}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.lulus ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{r.lulus ? '✅ Lulus' : '❌ Tidak Lulus'}</span></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.via_wawancara ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>{r.via_wawancara ? '🟡 Via Wawancara' : '⚡ Langsung'}</span></td><td className="px-5 py-4 text-slate-400">{r.approved_at ? new Date(r.approved_at).toLocaleDateString('id-ID') : '-'}</td></tr>)}</tbody></table></div>}
            </section>
            )}
          </div>
        )}
      </div>

      {/* Modal Grading Essay */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-[#262636] bg-[#14141E] shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#262636] px-6 py-4 shrink-0">
              <h2 className="text-lg font-bold text-slate-100">Nilai Essay</h2>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
              <div><p className="text-xs font-semibold text-slate-500 mb-1">Peserta</p><p className="text-sm text-slate-100">{selected.peserta_nama}</p></div>
              <div><p className="text-xs font-semibold text-slate-500 mb-1">Asesmen</p><p className="text-sm text-slate-100">{selected.asesmen}</p></div>
              <div><p className="text-xs font-semibold text-slate-500 mb-1">Soal</p><p className="text-sm text-slate-100">{selected.soal}</p></div>
              <div><p className="text-xs font-semibold text-slate-500 mb-1">Jawaban</p><div className="rounded-xl border border-[#262636] bg-[#1A1A26] p-4"><p className="text-sm text-slate-200 whitespace-pre-wrap">{selected.jawaban}</p></div></div>
              <div><p className="text-xs font-semibold text-slate-500 mb-1">Referensi</p><div className="rounded-xl border border-[#262636] bg-[#1A1A26] p-4"><p className="text-sm text-slate-200 whitespace-pre-wrap">{selected.jawaban_benar || '-'}</p></div></div>
              <div><p className="text-xs font-semibold text-slate-500 mb-1">Pembahasan</p><div className="rounded-xl border border-[#262636] bg-[#1A1A26] p-4"><p className="text-sm text-slate-200 whitespace-pre-wrap">{selected.pembahasan || '-'}</p></div></div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">Nilai (0-100)</label><input type="number" min="0" max="100" className={inputClass} value={nilai} onChange={e => setNilai(e.target.value)} /></div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">Catatan</label><textarea className={inputClass} rows="3" value={catatan} onChange={e => setCatatan(e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#262636] px-6 py-4 shrink-0">
              <button onClick={() => setSelected(null)} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition">Batal</button>
              <button onClick={saveGrade} disabled={saving || nilai === '' || isNaN(nilai)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50">
                {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Menyimpan...</> : 'Simpan Nilai'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Jadwal Wawancara */}
      {jadwalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setJadwalModal(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-[#262636] bg-[#14141E] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#262636] px-6 py-4">
              <h2 className="text-lg font-bold text-slate-100">Jadwalkan Wawancara</h2>
              <button onClick={() => setJadwalModal(null)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-300">Peserta: <strong className="text-slate-100">{jadwalModal.nama}</strong></p>
              <p className="text-sm text-slate-300">Asesmen: <strong className="text-slate-100">{jadwalModal.asesmen}</strong></p>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tanggal & Waktu</label>
                <input type="datetime-local" className={inputClass} value={jadwalForm.waktu_mulai} onChange={e => setJadwalForm(p => ({ ...p, waktu_mulai: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Durasi (menit)</label>
                  <select className={inputClass} value={jadwalForm.durasi_menit} onChange={e => setJadwalForm(p => ({ ...p, durasi_menit: Number(e.target.value) }))}>
                    <option value={15}>15 menit</option>
                    <option value={30}>30 menit</option>
                    <option value={45}>45 menit</option>
                    <option value={60}>60 menit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Metode</label>
                  <select className={inputClass} value={jadwalForm.metode} onChange={e => setJadwalForm(p => ({ ...p, metode: e.target.value }))}>
                    <option value="tatap_muka">Tatap Muka</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Catatan</label>
                <textarea className={inputClass} rows="3" value={jadwalForm.catatan_jadwal} onChange={e => setJadwalForm(p => ({ ...p, catatan_jadwal: e.target.value }))} placeholder="Catatan untuk peserta (opsional)" />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#262636] px-6 py-4">
              <button onClick={() => setJadwalModal(null)} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition">Batal</button>
              <button onClick={simpanJadwal} disabled={saving || !jadwalForm.waktu_mulai} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nilai Wawancara */}
      {nilaiWawancara && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setNilaiWawancara(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-[#262636] bg-[#14141E] shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#262636] px-6 py-4 sticky top-0 bg-[#14141E] z-10">
              <h2 className="text-lg font-bold text-slate-100">Penilaian Wawancara</h2>
              <button onClick={() => setNilaiWawancara(null)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <p className="text-sm text-slate-300">Peserta: <strong className="text-slate-100">{nilaiWawancara.peserta_asesmen?.user?.name ?? '-'}</strong></p>
              <p className="text-sm text-slate-300">Asesmen: <strong className="text-slate-100">{nilaiWawancara.peserta_asesmen?.asesmen?.judul ?? '-'}</strong></p>

              {[ 
                { key: 'pemahaman', label: 'Pemahaman Konsep' },
                { key: 'komunikasi', label: 'Kemampuan Komunikasi' },
                { key: 'penerapan', label: 'Penerapan di Lapangan' },
                { key: 'sikap', label: 'Sikap & Profesionalisme' },
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">{item.label}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setNilaiForm(p => ({ ...p, [item.key]: star }))}
                        className={`h-10 w-10 rounded-lg text-sm font-bold transition ${nilaiForm[item.key] >= star ? 'bg-amber-500/20 text-amber-400' : 'bg-[#1A1A26] text-slate-600 hover:text-slate-400'}`}>
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Catatan Wawancara</label>
                <textarea className={inputClass} rows="4" value={catatanWawancara} onChange={e => setCatatanWawancara(e.target.value)} placeholder="Catat hasil wawancara..." />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rekomendasi Akhir</label>
                <div className="flex gap-2">
                  <button onClick={() => setRekomendasi('lulus')} className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${rekomendasi === 'lulus' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-[#262636] text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400'}`}>✅ Lulus</button>
                  <button onClick={() => setRekomendasi('tidak_lulus')} className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${rekomendasi === 'tidak_lulus' ? 'border-rose-500/50 bg-rose-500/10 text-rose-400' : 'border-[#262636] text-slate-400 hover:border-rose-500/30 hover:text-rose-400'}`}>❌ Tidak Lulus</button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#262636] px-6 py-4">
              <button onClick={() => setNilaiWawancara(null)} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition">Batal</button>
              <button onClick={simpanNilaiWawancara} disabled={wSaving} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-500 hover:to-orange-500 disabled:opacity-50">
                {wSaving ? 'Menyimpan...' : 'Simpan & Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Penilaian

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle as AlertCircleIcon, ClipboardCheck, Clock, Award, BookOpen, Plus, X, Pencil, Trash2, XCircle } from 'lucide-react'
import api from '../../api/axios'
import { confirmAction, confirmDelete } from '../../utils/confirm'
import Swal from 'sweetalert2'
import { useAuth } from '../../hooks/useAuth'
import { can } from '../../utils/can'

const normalize = (payload) => Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])
const inputClass = 'w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'
const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5'

function Asesmen() {
  const navigate = useNavigate()
  const submitRef = useRef()
  const [asesmens, setAsesmens] = useState([])
  const [kompetensis, setKompetensis] = useState([])
  const [levels, setLevels] = useState([])
  const [activeTab, setActiveTab] = useState('list')
  const [current, setCurrent] = useState(null)
  const [peserta, setPeserta] = useState(null)
  const [answers, setAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [phase, setPhase] = useState(null)
  const [asesmenLulus, setAsesmenLulus] = useState(null)
  const [asesmenNilai, setAsesmenNilai] = useState(null)
  const [asesmenStatus, setAsesmenStatus] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [ready, setReady] = useState(false)
  const { user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors, isSubmitted } } = useForm()
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const isWalidata = roles.includes('Walidata')
  const questions = useMemo(() => peserta?.asesmen?.bank_soals || peserta?.asesmen?.bankSoals || [], [peserta])
  const answeredCount = Object.values(answers).filter((value) => String(value || '').trim() !== '').length

  const load = useCallback(async () => {
    const [a, k, l, status] = await Promise.all([
      api.get('/asesmens'), api.get('/kompetensis'), api.get('/levels'),
      api.get('/my-status').catch(() => null),
    ])
    setAsesmens(normalize(a.data)); setKompetensis(normalize(k.data)); setLevels(normalize(l.data))
    setPhase(status?.data?.phase || null)
    setAsesmenStatus(status?.data?.asesmen_status || null)
    setAsesmenLulus(status?.data?.asesmen_lulus ?? null)
    setAsesmenNilai(status?.data?.asesmen_nilai ?? null)
    setSchedule(status?.data?.schedule ?? null)
    setReady(true)
  }, [])
  useEffect(() => { queueMicrotask(() => load()) }, [load])

  const submitExam = async (auto = false) => {
    if (!auto) {
      const belumDijawab = questions.filter(s =>
        !s.jenis || !String(answers[s.id] || '').trim()
      )
      if (belumDijawab.length > 0) {
        const isDark = document.documentElement.classList.contains('dark')
        Swal.fire({
          icon: 'warning',
          title: 'Soal Belum Dijawab',
          text: `Ada ${belumDijawab.length} soal yang masih kosong (${belumDijawab.filter(s => s.jenis === 'essay').length} essay, ${belumDijawab.filter(s => s.jenis !== 'essay').length} PG). Jawab terlebih dahulu.`,
          confirmButtonText: 'Oke',
          background: isDark ? '#14141E' : '#FFFFFF',
          color: isDark ? '#F1F5F9' : '#0F172A',
          confirmButtonColor: '#6366f1',
        })
        return
      }
      if (!await confirmAction({ title: 'Kumpulkan asesmen?', text: 'Jawaban yang sudah dikirim tidak dapat diubah lagi.', confirmButtonText: 'Ya, kumpulkan', icon: 'question' })) return
    }
    try {
      const submitRes = await api.post(`/peserta-asesmens/${peserta.id}/submit`)
      setPeserta(null)
      setAsesmenStatus('selesai')
      setAsesmenLulus(null)
      setAsesmenNilai(submitRes.data?.nilai ?? null)
      setActiveTab('list')
      load()
    } catch (e) {
      const isDark = document.documentElement.classList.contains('dark')
      Swal.fire({ icon: 'error', title: 'Gagal', text: e.response?.data?.message || 'Gagal submit asesmen', confirmButtonText: 'Tutup', background: isDark ? '#14141E' : '#FFFFFF', color: isDark ? '#F1F5F9' : '#0F172A', confirmButtonColor: '#6366f1', customClass: { popup: 'swal-premium', confirmButton: 'swal-confirm-btn' } })
    }
  }
  submitRef.current = submitExam
  useEffect(() => {
    if (asesmenLulus === true) {
      const t = setTimeout(() => navigate('/sertifikat'), 3000)
      return () => clearTimeout(t)
    }
  }, [asesmenLulus, navigate])
  useEffect(() => {
    if (!secondsLeft || !peserta || peserta.status === 'selesai') return
    const timer = setInterval(() => setSecondsLeft((value) => {
      if (value <= 1) { clearInterval(timer); submitRef.current(true); return 0 }
      return value - 1
    }), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft, peserta])

  const formatTime = (value) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
  const getName = (items, id) => items.find((item) => item.id === id)?.nama || '-'
  const openCreate = () => { setCurrent(null); reset({ judul: '', deskripsi: '', kompetensi_id: '', level_id: '', jumlah_soal: 10, durasi: 30, nilai_lulus: 60, acak_soal: 1, acak_jawaban: 1, status: 'published' }); setActiveTab('form') }
  const openEdit = (row) => { setCurrent(row); reset({ ...row, acak_soal: row.acak_soal ? 1 : 0, acak_jawaban: row.acak_jawaban ? 1 : 0 }); setActiveTab('form') }
  const save = async (data) => {
    setSaving(true)
    const payload = { ...data, jumlah_soal: Number(data.jumlah_soal || 0), durasi: Number(data.durasi || 0), nilai_lulus: Number(data.nilai_lulus || 0), level_id: data.level_id || null, acak_soal: Number(data.acak_soal) === 1, acak_jawaban: Number(data.acak_jawaban) === 1 }
    try { if (current?.id) await api.put(`/asesmens/${current.id}`, payload); else await api.post('/asesmens', payload); await load(); setActiveTab('list') } catch (e) { alert(e.response?.data?.message || 'Gagal menyimpan asesmen') } finally { setSaving(false) }
  }
  const remove = async (row) => { if (await confirmDelete(row.judul)) { await api.delete(`/asesmens/${row.id}`); load() } }
  const startExam = async (row) => {
    try { setLoading(true); const res = await api.post(`/asesmens/${row.id}/start`); setPeserta(res.data); const saved = {}; (res.data.jawaban_pesertas || res.data.jawabanPesertas || []).forEach((item) => { saved[item.bank_soal_id] = item.jawaban }); setAnswers(saved); setSecondsLeft(Number(res.data.asesmen?.durasi || row.durasi || 0) * 60); setActiveTab('exam') } catch (e) {
      const msg = e.response?.data?.message || 'Gagal memulai asesmen. Pastikan bank soal tersedia.'
      const isDark = document.documentElement.classList.contains('dark')
      Swal.fire({ icon: 'warning', title: 'Tidak dapat memulai', text: msg, confirmButtonText: 'Mengerti', background: isDark ? '#14141E' : '#FFFFFF', color: isDark ? '#F1F5F9' : '#0F172A', confirmButtonColor: '#6366f1', customClass: { popup: 'swal-premium', confirmButton: 'swal-confirm-btn' } })
    } finally { setLoading(false) }
  }
  const saveAnswer = async (soalId, value) => { setAnswers((state) => ({ ...state, [soalId]: value })); if (!peserta?.id) return; try { await api.post(`/peserta-asesmens/${peserta.id}/save-answer`, { bank_soal_id: soalId, jawaban: value }) } catch (e) { alert(e.response?.data?.message || 'Gagal menyimpan jawaban') } }

  const resetExam = async (row) => {
    const isDark = document.documentElement.classList.contains('dark')
    const result = await Swal.fire({
      title: 'Reset ujian?',
      text: `"${row.judul}" — Jawaban dan sertifikat akan dihapus. User bisa mengulang dari awal.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Reset',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      confirmButtonColor: '#EF4444',
      background: isDark ? '#14141E' : '#FFFFFF',
      color: isDark ? '#F1F5F9' : '#0F172A',
      customClass: { popup: 'swal-premium', confirmButton: 'swal-confirm-btn swal-reset-btn', cancelButton: 'swal-cancel-btn' },
    })
    if (!result.isConfirmed) return
    try {
      await api.post(`/peserta-asesmens/${row.pivot?.peserta_asesmen_id || row.id}/reset`)
      load()
    } catch (e) { Swal.fire({ icon: 'error', title: 'Gagal', text: e.response?.data?.message || 'Gagal reset ujian', background: isDark ? '#14141E' : '#FFFFFF', color: isDark ? '#F1F5F9' : '#0F172A', confirmButtonColor: '#6366f1', customClass: { popup: 'swal-premium', confirmButton: 'swal-confirm-btn' } }) }
  }

  const statusStyle = (s) => s === 'published' || s === 'ongoing' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20' : s === 'finished' ? 'bg-slate-500/10 text-slate-400 ring-slate-400/20' : 'bg-amber-500/10 text-amber-400 ring-amber-400/20'

  const isAdmin = !isWalidata
  const examLocked = isWalidata && phase && phase !== 'exam'

  if (!ready) {
    return <div className="flex items-center justify-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" /></div>
  }

  // Status: Menunggu penilaian essay oleh penguji
  if (isWalidata && asesmenStatus === 'selesai' && asesmenLulus === null) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-amber-500/40 bg-[#14141E] p-8 text-center shadow-lg shadow-black/10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 mb-5">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 mb-3">Menunggu Penilaian</span>
          <h2 className="mt-3 text-2xl font-bold text-slate-100">Asesmen Selesai</h2>
          <p className="mt-2 text-sm text-slate-400">Nilai sementara (PG): <strong className="text-slate-100">{asesmenNilai}</strong></p>
          <p className="mt-1 text-sm text-slate-500">Jawaban essay sedang dinilai oleh penguji. Hasil akan muncul setelah diverifikasi.</p>
        </div>
      </div>
    )
  }

  // Status: Lulus ✅
  if (isWalidata && asesmenStatus === 'selesai' && asesmenLulus === true) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-emerald-500/40 bg-[#14141E] p-8 text-center shadow-lg shadow-black/10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 mb-5">
            <Award className="h-8 w-8 text-white" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3">Lulus</span>
          <h2 className="mt-3 text-2xl font-bold text-slate-100">Selamat, Anda Lulus!</h2>
          <p className="mt-2 text-sm text-slate-400">Nilai akhir: <strong className="text-slate-100">{asesmenNilai}</strong></p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/sertifikat" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"><Award className="h-4 w-4" />Lihat Sertifikat</Link>
          </div>
        </div>
      </div>
    )
  }

  // Status: Tidak Lulus ❌
  if (isWalidata && asesmenStatus === 'selesai' && asesmenLulus === false) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-rose-500/40 bg-[#14141E] p-8 text-center shadow-lg shadow-black/10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 mb-5">
            <XCircle className="h-8 w-8 text-white" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 mb-3">Belum Lulus</span>
          <h2 className="mt-3 text-2xl font-bold text-slate-100">Anda belum lulus asesmen</h2>
          <p className="mt-2 text-sm text-slate-400">Nilai Anda: <strong className="text-slate-100">{asesmenNilai}</strong></p>
          <p className="mt-1 text-sm text-slate-500">Silakan pelajari materi terlebih dahulu, lalu hubungi admin untuk mereset asesmen agar bisa ujian ulang.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => navigate('/pembelajaran')} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500">
              <BookOpen className="h-4 w-4" /> Pelajari Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Status: Belum waktunya exam
  if (examLocked) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#262636] bg-[#14141E] py-20 shadow-sm">
        <Clock className="mb-4 h-16 w-16 text-slate-500 opacity-30" />
        <h2 className="text-xl font-bold text-slate-100">Asesmen Belum Tersedia</h2>
        <p className="mt-2 text-sm text-slate-400">Asesmen hanya dapat diakses pada jadwal yang telah ditentukan.</p>
        {schedule?.exam_start && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-3 text-center">
            <p className="text-xs text-amber-400/80 mb-0.5">Jadwal Ujian</p>
            <p className="text-sm font-semibold text-amber-400">
              {new Date(schedule.exam_start).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {' — '}
              {new Date(schedule.exam_start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262636] bg-gradient-to-br from-[#14141E] via-[#14141E] to-indigo-950/20 p-7 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTI0IDI0di0ySDI0djJ6TTI0IDE2di0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex items-start justify-between gap-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"><ClipboardCheck className="h-3 w-3" /> Evaluasi Kompetensi</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-100">Asesmen</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">Kelola evaluasi berbasis Bank Soal atau mulai ujian untuk mengukur kompetensi Anda.</p>
          </div>
          <div className="flex shrink-0 gap-3">
            {activeTab === 'list' && can(user, 'asesmen.create') && (
              <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"><Plus className="h-4 w-4" />Buat Asesmen</button>
            )}
            {activeTab !== 'list' && activeTab !== 'form' && (
              <button onClick={() => setActiveTab('list')} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"><X className="h-5 w-5" /></button>
            )}
          </div>
        </div>
      </div>

      {/* List View */}
      {activeTab === 'list' && (
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] shadow-sm">
          <div className="overflow-x-auto">
            {asesmens.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-slate-500"><ClipboardCheck className="mb-3 h-12 w-12 opacity-30" /><p className="text-sm font-medium">Belum ada asesmen</p></div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-[#262636] bg-[#09090E]">
                    <th className="px-4 py-3 font-semibold">Judul</th><th className="px-4 py-3 font-semibold hidden md:table-cell">Kompetensi</th><th className="px-4 py-3 font-semibold hidden md:table-cell">Level</th><th className="px-4 py-3 font-semibold text-center w-16">Soal</th><th className="px-4 py-3 font-semibold w-20">Durasi</th><th className="px-4 py-3 font-semibold w-20">Status</th><th className="px-4 py-3 text-right font-semibold w-32 -translate-x-[25px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262636]">
                  {asesmens.map((row) => (
                    <tr className="transition hover:bg-white/[0.02]" key={row.id}>
                      <td className="px-4 py-3"><p className="font-medium text-slate-100">{row.judul}</p><p className="text-xs text-slate-500 mt-0.5">Nilai lulus {row.nilai_lulus}</p></td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{row.kompetensi?.nama || getName(kompetensis, row.kompetensi_id)}</td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{row.level?.nama || getName(levels, row.level_id)}</td>
                      <td className="px-4 py-3 text-center text-slate-300">{row.jumlah_soal}</td>
                      <td className="px-4 py-3 text-slate-400">{row.durasi} menit</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyle(row.status)}`}>{row.status}</span></td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {can(user, 'asesmen.update') && <button onClick={() => openEdit(row)} className="mr-2 inline-flex items-center justify-center rounded-xl border border-[#262636] p-2 text-sm text-slate-400 transition-colors hover:bg-[#1A1A26] hover:text-slate-200" title="Edit"><Pencil className="h-4 w-4" /></button>}{can(user, 'asesmen.delete') && <button onClick={() => remove(row)} className="inline-flex items-center justify-center rounded-xl border border-rose-600/20 p-2 text-sm text-rose-400 transition-colors hover:bg-rose-500/10" title="Hapus"><Trash2 className="h-4 w-4" /></button>}
                        {can(user, 'asesmen.start') && <button className="rounded-lg px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-40 ml-1" disabled={loading || !['published', 'ongoing'].includes(row.status)} onClick={() => startExam(row)}>{loading ? '...' : 'Mulai'}</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Form View */}
      {activeTab === 'form' && (
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-[#262636] pb-5">
            <h2 className="text-lg font-bold text-slate-100">{current ? 'Edit' : 'Buat'} Asesmen</h2>
          </div>
          <form className="grid grid-cols-12 gap-5" onSubmit={handleSubmit(save)}>
            {isSubmitted && Object.keys(errors).length > 0 && <div className="col-span-12 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"><AlertCircleIcon className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />Harap isi semua field yang wajib diisi (tanda bintang merah).</div>}
            <div className="col-span-8"><label className={labelClass}>Judul <span className="text-rose-400">*</span></label><input className={inputClass} placeholder="Masukkan judul asesmen" {...register('judul', { required: true })} /></div>
            <div className="col-span-4"><label className={labelClass}>Status</label><select className={inputClass} {...register('status')}><option value="draft">Draft</option><option value="published">Published</option><option value="ongoing">Ongoing</option><option value="finished">Finished</option></select></div>
            <div className="col-span-12"><label className={labelClass}>Deskripsi</label><textarea className={inputClass} rows="3" placeholder="Masukkan deskripsi asesmen" {...register('deskripsi')} /></div>
            <div className="col-span-6"><label className={labelClass}>Kompetensi <span className="text-rose-400">*</span></label><select className={inputClass} {...register('kompetensi_id', { required: true })}><option value="">Pilih Kompetensi</option>{kompetensis.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></div>
            <div className="col-span-6"><label className={labelClass}>Level</label><select className={inputClass} {...register('level_id')}><option value="">Semua Level</option>{levels.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></div>
            {[['jumlah_soal', 'Jumlah Soal'], ['durasi', 'Durasi (menit)'], ['nilai_lulus', 'Nilai Lulus']].map(([name, label]) => <div className="col-span-4" key={name}><label className={labelClass}>{label} <span className="text-rose-400">*</span></label><input type="number" className={inputClass} placeholder={`Masukkan ${label.toLowerCase()}`} {...register(name, { required: true })} /></div>)}
            <div className="col-span-6"><label className={labelClass}>Acak Soal</label><select className={inputClass} {...register('acak_soal')}><option value={1}>Ya</option><option value={0}>Tidak</option></select></div>
            <div className="col-span-6"><label className={labelClass}>Acak Jawaban</label><select className={inputClass} {...register('acak_jawaban')}><option value={1}>Ya</option><option value={0}>Tidak</option></select></div>
            <div className="col-span-12 flex justify-end gap-3 pt-4 border-t border-[#262636]">
              <button type="button" onClick={() => setActiveTab('list')} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition">Batal</button>
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50" disabled={saving}>{saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Menyimpan...</> : 'Simpan'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Exam View */}
      {activeTab === 'exam' && peserta && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-4">
            <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-4"><Clock className="h-3 w-3" /> Sedang Berlangsung</span>
              <h2 className="text-lg font-bold text-slate-100">{peserta.asesmen?.judul}</h2>
            </div>
            {questions.map((soal, index) => {
              const choices = typeof soal.pilihan === 'string' ? JSON.parse(soal.pilihan || '[]') : (Array.isArray(soal.pilihan) ? soal.pilihan : [])
              return (
                <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-6 shadow-sm" key={soal.id}>
                  <p className="text-sm leading-6 text-slate-100"><span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-400 mr-2">{String(index + 1).padStart(2, '0')}</span>{soal.pertanyaan}</p>
                  <div className="mt-4 space-y-2">
                    {soal.jenis === 'pilihan_ganda' && choices.length > 0 ? choices.map((choice, i) => (
                      <label key={i} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                        answers[soal.id] === choice ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-[#262636] hover:border-indigo-500/30 hover:bg-indigo-500/5'
                      }`}>
                        <input className="h-4 w-4 accent-indigo-500" type="radio" name={`soal-${soal.id}`} checked={answers[soal.id] === choice} onChange={() => saveAnswer(soal.id, choice)} />
                        <span className="text-slate-300">{choice}</span>
                      </label>
                    )) : (
                      <textarea className={inputClass} rows="4" value={answers[soal.id] || ''} onChange={(e) => saveAnswer(soal.id, e.target.value)} placeholder="Tulis jawaban Anda..." />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="col-span-4">
            <div className="sticky top-6 rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sisa Waktu</span>
              <p className={`mt-2 text-4xl font-bold tracking-tight ${secondsLeft < 300 ? 'text-rose-400' : 'text-slate-100'}`}>{formatTime(secondsLeft)}</p>
              <div className="mt-6 rounded-xl bg-[#09090E] p-4">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Terjawab</span><strong className="text-slate-100">{answeredCount}/{questions.length}</strong></div>
                <div className="mt-3 h-2 rounded-full bg-[#1E1E2E] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} /></div>
              </div>
              <button onClick={() => submitExam(false)} className="mt-5 w-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500">Kumpulkan Jawaban</button>
            </div>
          </div>
        </div>
      )}

      {/* Result View - Replaced by status checks above */}
    </div>
  )
}

export default Asesmen

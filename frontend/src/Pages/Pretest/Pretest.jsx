import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, Clock, FileCheck, FileText, GraduationCap, RefreshCw, Trophy, XCircle } from 'lucide-react'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'
import { showConfirm } from '../../utils/alert'
import { toast } from '../../utils/toast'

const inputClass = 'w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'

function SkorKompetensi({ scores }) {
  if (!Array.isArray(scores) || scores.length === 0) return null
  return <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm"><h3 className="text-base font-bold text-slate-100 mb-5">Skor per Kompetensi</h3><div className="space-y-4">{scores.map((item, i) => { const score = Number(item.skor ?? item.nilai ?? 0); return <div key={i}><div className="flex items-center justify-between mb-1.5"><span className="text-sm font-medium text-slate-300">{item.kompetensi || '-'}</span><span className="text-sm font-bold text-slate-100">{Math.round(score)}</span></div><div className="h-2.5 rounded-full bg-[#1E1E2E] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} /></div></div> })}</div></div>
}

function Pretest() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState('start')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [sesi, setSesi] = useState(null)
  const [soals, setSoals] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [result, setResult] = useState(null)
  const [pretestDetail, setPretestDetail] = useState(null)
  const detailFetched = useRef(false)

  const currentSoal = soals[currentIndex]
  const answeredCount = Object.keys(answers).length
  const isLastQuestion = currentIndex === soals.length - 1

  useEffect(() => {
    api.get('/my-status').then((res) => {
      setStatus(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!status?.pretest_done || step !== 'start' || detailFetched.current) return
    detailFetched.current = true
    api.get('/pretest/detail').then((res) => setPretestDetail(res.data)).catch(() => {})
  }, [status?.pretest_done, step])

  const startPretest = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.post('/pretest/start')
      const data = res.data
      setSesi(data)
      const list = Array.isArray(data.soals) ? data.soals : []
      setSoals(list)
      setAnswers({})
      setCurrentIndex(0)
      setSecondsLeft(Number(data.durasi || 30) * 60)
      setStep('exam')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal memulai pretest')
    } finally {
      setLoading(false)
    }
  }, [])

  const isAdmin = user?.roles?.some(r => ['Super Admin', 'Admin Diskominfo'].includes(r))

  const resetPretest = useCallback(async () => {
    const confirmed = await showConfirm(
      'Reset pretest?',
      'Semua jawaban dan nilai pretest akan dihapus. Anda bisa mengulang pretest.',
      'Ya, Reset'
    )
    if (!confirmed) return
    try {
      await api.post('/pretest/reset', { user_id: user.id })
      setStatus(prev => ({ ...prev, pretest_done: false }))
      setPretestDetail(null)
      detailFetched.current = false
      toast('success', 'Berhasil mereset pretest')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal reset pretest')
    }
  }, [user])

  useEffect(() => {
    if (!secondsLeft || step !== 'exam') return
    const timer = setInterval(() => setSecondsLeft((v) => {
      if (v <= 1) { clearInterval(timer); return 0 }
      return v - 1
    }), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft, step])

  useEffect(() => {
    if (secondsLeft === 0 && step === 'exam' && soals.length > 0) {
      submitPretest(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  const submitPretest = useCallback(async (auto = false) => {
    if (!auto) {
      const confirmed = await showConfirm(
        'Kumpulkan pretest?',
        'Jawaban yang sudah dikirim tidak dapat diubah lagi.',
        'Ya, kumpulkan',
        'Batal',
        'question'
      )
      if (!confirmed) return
    }

    try {
      setSubmitting(true)
      const jawaban = soals.map((s) => ({
        soal_id: s.id,
        jawaban: answers[s.id] || '',
      }))
      const res = await api.post('/pretest/submit', { sesi_id: sesi.sesi_id, jawaban })
      setResult(res.data)
      setStep('result')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal submit pretest')
    } finally {
      setSubmitting(false)
    }
  }, [sesi, soals, answers])

  const saveAnswer = (soalId, value) => {
    setAnswers((prev) => ({ ...prev, [soalId]: value }))
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const goToQuestion = (index) => setCurrentIndex(index)

  if (loading && step === 'start') {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Memuat status pretest...</p>
        </div>
      </div>
    )
  }

  /* ── Step 1: Start / Status ── */
  if (step === 'start') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-indigo-500/40 bg-[#14141E] p-6 shadow-lg shadow-black/10">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <FileCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-indigo-400">Pretest</span>
                {status?.pretest_done && (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">Selesai</span>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-100">Tes Awal (Pretest)</h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
                Ukur kemampuan awal Anda sebelum memulai pembelajaran. Pretest akan menentukan level awal
                dan memberikan rekomendasi materi yang sesuai.
              </p>
            </div>
          </div>
        </div>

        {status?.pretest_done ? (
          <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 mb-5">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3">Pretest Selesai</span>
            <div className="mb-2">
              <p className="text-sm text-slate-400">Skor Total</p>
              <p className="text-2xl font-bold text-slate-100">{pretestDetail?.rata_rata ?? '-'}</p>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-slate-100">Level Anda: {status?.level_name || '-'}</h2>
            <p className="mt-2 text-sm text-slate-400">Anda telah menyelesaikan pretest. Mulai pembelajaran sesuai level Anda.</p>
            <div className="mt-6 text-left"><SkorKompetensi scores={pretestDetail?.kompetensi_scores} /></div>
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => window.location.href = '/pembelajaran/video'}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"
              >
                <BookOpen className="h-4 w-4" /> Mulai Pembelajaran
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await api.get('/pretest/detail')
                    setPretestDetail(res.data)
                    setStep('detail')
                  } catch { /* ignore */ }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition"
              >
                <FileText className="h-4 w-4" /> Lihat Detail
              </button>
              {isAdmin && (
                <button
                  onClick={resetPretest}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-600/40 px-5 py-2.5 text-sm font-semibold text-rose-400 transition-all hover:bg-rose-500/10"
                >
                  <RefreshCw className="h-4 w-4" /> Reset Pretest
                </button>
              )}
            </div>
          </div>
        ) : !isAdmin && !status?.pretest_activated ? (
          <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 mb-5">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 mb-3">Menunggu Aktivasi</span>
            <h2 className="mt-3 text-2xl font-bold text-slate-100">Pretest Belum Aktif</h2>
            <p className="mt-2 text-sm text-slate-400">Admin belum mengaktifkan pretest untuk akun Anda. Silakan hubungi admin untuk mengaktifkan pretest.</p>
          </div>
        ) : (
          <div className="space-y-4">
<div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
              <h3 className="text-base font-bold text-slate-100 mb-4">Atur Waktu Pretest</h3>
              <ul className="space-y-3 mb-5">
                {[
                  { icon: GraduationCap, text: 'Pretest terdiri dari beberapa soal dari berbagai kompetensi' },
                  { icon: Trophy, text: 'Hasil pretest menentukan level awal Anda' },
                  { icon: BookOpen, text: 'Rekomendasi materi akan disesuaikan dengan level Anda' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                      <item.icon className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="pt-1.5">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={startPretest}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
            >
              {loading ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Memulai...</>
              ) : (
                <><FileCheck className="h-4 w-4" /> Mulai Pretest</>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  /* ── Step 2: Exam ── */
  if (step === 'exam') {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
                <FileCheck className="h-3 w-3" /> Pretest
              </span>
              <h2 className="mt-2 text-lg font-bold text-slate-100">Tes Awal</h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sisa Waktu</span>
              <p className={`text-3xl font-bold tracking-tight ${secondsLeft < 300 ? 'text-rose-400' : 'text-slate-100'}`}>
                {formatTime(secondsLeft)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Progress</span>
              <strong className="text-slate-100">{answeredCount}/{soals.length} terjawab</strong>
            </div>
            <div className="h-2 rounded-full bg-[#1E1E2E] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                style={{ width: `${soals.length ? (answeredCount / soals.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            {currentSoal && (
              <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-400">
                    {String(currentIndex + 1).padStart(2, '0')}
                  </span>
                  {currentSoal.kompetensi && (
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                      {currentSoal.kompetensi}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">dari {soals.length} soal</span>
                </div>

                <p className="text-sm leading-6 text-slate-100 mb-5">{currentSoal.pertanyaan}</p>

                <div className="space-y-2">
                  {Array.isArray(currentSoal.pilihan) && currentSoal.pilihan.length > 0 ? currentSoal.pilihan.map((choice, i) => (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                        answers[currentSoal.id] === choice
                          ? 'border-indigo-500/50 bg-indigo-500/10'
                          : 'border-[#262636] hover:border-indigo-500/30 hover:bg-indigo-500/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`soal-${currentSoal.id}`}
                        className="h-4 w-4 accent-indigo-500"
                        checked={answers[currentSoal.id] === choice}
                        onChange={() => saveAnswer(currentSoal.id, choice)}
                      />
                      <span className="text-slate-300">{choice}</span>
                    </label>
                  )) : (
                    <textarea
                      className={inputClass}
                      rows="4"
                      value={answers[currentSoal.id] || ''}
                      onChange={(e) => saveAnswer(currentSoal.id, e.target.value)}
                      placeholder="Tulis jawaban Anda..."
                    />
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#262636] pt-5">
                  <button
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-[#262636] px-4 py-2 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="h-4 w-4" /> Sebelumnya
                  </button>

                  {isLastQuestion ? (
                    <button
                      onClick={() => submitPretest(false)}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
                    >
                      {submitting ? (
                        <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Mengirim...</>
                      ) : (
                        <><FileCheck className="h-4 w-4" /> Kumpulkan</>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentIndex((i) => Math.min(soals.length - 1, i + 1))}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"
                    >
                      Selanjutnya <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6 rounded-2xl border border-[#262636] bg-[#14141E] p-5 shadow-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Navigasi Soal</h4>
              <div className="grid grid-cols-5 gap-2">
                {soals.map((soal, i) => {
                  const isAnswered = answers[soal.id] !== undefined && String(answers[soal.id] || '').trim() !== ''
                  const isActive = i === currentIndex
                  return (
                    <button
                      key={soal.id}
                      onClick={() => goToQuestion(i)}
                      className={`h-9 w-full rounded-lg text-xs font-bold transition ${
                        isActive
                          ? 'bg-indigo-500 text-white'
                          : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[#1E1E2E] text-slate-500 hover:bg-[#262636] hover:text-slate-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-emerald-500/40" /> Terjawab</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-[#1E1E2E]" /> Belum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Step 3: Result ── */
  if (step === 'result' && result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-indigo-500/40 bg-[#14141E] p-8 text-center shadow-lg shadow-black/10">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-5">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-3">Hasil Pretest</span>
          <div className="mb-2">
            {result.simulasi && <p className="mb-3 text-xs font-semibold text-amber-400">MODE SIMULASI — hasil tidak disimpan</p>}
            <p className="text-sm text-slate-400">Skor Total</p>
            <p className="text-2xl font-bold text-slate-100">{result.rata_rata ?? '-'}</p>
          </div>
          <h2 className="mt-4 text-5xl font-bold text-slate-100">{result.level_name || '-'}</h2>
          <p className="mt-2 text-sm text-slate-400">Level awal Anda berdasarkan hasil pretest</p>
        </div>

        {Array.isArray(result.kompetensi_scores) && result.kompetensi_scores.length > 0 && (
          <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
            <h3 className="text-base font-bold text-slate-100 mb-5">Skor per Kompetensi</h3>
            <div className="space-y-4">
              {result.kompetensi_scores.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-300">{item.kompetensi}</span>
                    <span className="text-sm font-bold text-slate-100">{Math.round(item.skor)}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#1E1E2E] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                      style={{ width: `${Math.min(100, item.skor)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 text-center shadow-sm">
          <p className="text-sm text-slate-400 mb-5">
            Berdasarkan hasil pretest, kami telah menyiapkan materi pembelajaran yang sesuai dengan level Anda.
          </p>
          <button
            onClick={() => window.location.href = '/pembelajaran/video'}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"
          >
            <BookOpen className="h-4 w-4" /> Lihat Rekomendasi Belajar
          </button>
        </div>
      </div>
    )
  }

  if (step === 'detail' && pretestDetail) {
    const benarCount = pretestDetail.jawaban?.filter(j => j.benar).length ?? 0
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-indigo-500/40 bg-[#14141E] p-6 shadow-lg shadow-black/10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">Detail Pretest</span>
              <h1 className="mt-2 text-xl font-bold text-slate-100">Riwayat Jawaban</h1>
              <p className="text-sm text-slate-400">{benarCount}/{pretestDetail.jawaban?.length ?? 0} benar | Skor Total: {pretestDetail.rata_rata ?? '-'}</p>
            </div>
          </div>
        </div>
        <SkorKompetensi scores={pretestDetail.kompetensi_scores} />
        {pretestDetail.jawaban?.map((j, i) => (
          <div key={j.soal_id} className={`rounded-2xl border p-6 shadow-sm ${j.benar ? 'border-emerald-500/20 bg-[#14141E]' : 'border-rose-500/20 bg-[#14141E]'}`}>
            <div className="flex items-start gap-3">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${j.benar ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 mb-3">{j.pertanyaan}</p>
                {Array.isArray(j.pilihan) && j.pilihan.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {j.pilihan.map((p, pi) => {
                      const isUserChoice = j.jawaban_user === p
                      const isCorrectChoice = j.jawaban_benar === p
                      let cls = 'border-[#262636] text-slate-400'
                      if (isCorrectChoice) cls = 'border-emerald-500/40 text-emerald-300 bg-emerald-500/5'
                      if (isUserChoice && !j.benar) cls = 'border-rose-500/40 text-rose-300 bg-rose-500/5'
                      return <div key={pi} className={`rounded-lg border px-3 py-2 text-xs ${cls}`}>{p}</div>
                    })}
                  </div>
                )}
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>Jawaban Anda: <strong className={j.benar ? 'text-emerald-400' : 'text-rose-400'}>{j.jawaban_user || '(kosong)'}</strong></span>
                  {!j.benar && <span>Benar: <strong className="text-slate-200">{j.jawaban_benar}</strong></span>}
                </div>
                {j.pembahasan && (
                  <div className="mt-2 rounded-lg bg-[#1A1A26] p-3 border border-[#262636]">
                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Pembahasan:</p>
                    <p className="text-xs text-slate-300">{j.pembahasan}</p>
                  </div>
                )}
              </div>
              {j.benar ? <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" /> : <XCircle className="h-5 w-5 shrink-0 text-rose-400" />}
            </div>
          </div>
        ))}
        <div className="flex justify-center pb-6">
          <button onClick={() => setStep('start')} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition">Kembali</button>
        </div>
      </div>
    )
  }

  return null
}

export default Pretest

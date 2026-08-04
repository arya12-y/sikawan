import { useCallback, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, HelpCircle, Trophy, XCircle, RefreshCw } from 'lucide-react'
import api from '../../api/axios'
import { toast } from '../../utils/toast'

const inputClass = 'w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'

function MateriQuiz() {
  const [step, setStep] = useState('menu')
  const [loading, setLoading] = useState(false)
  const [soals, setSoals] = useState([])
  const [quizInfo, setQuizInfo] = useState(null)
  const [jumlah, setJumlah] = useState(10)
  const [tersedia, setTersedia] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [results, setResults] = useState({})
  const [checked, setChecked] = useState({})
  const [checking, setChecking] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const currentSoal = soals[currentIndex]
  const isLastQuestion = currentIndex === soals.length - 1
  const allChecked = soals.length > 0 && soals.every(s => checked[s.id])

  const checkAvailability = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/quiz/start', { params: { jumlah: 1 } })
      setTersedia(res.data?.tersedia ?? 0)
      setJumlah(Math.min(10, res.data?.tersedia ?? 10))
      if ((res.data?.tersedia ?? 0) === 0) {
        const Swal = (await import('sweetalert2')).default
        const isDark = document.documentElement.classList.contains('dark')
        Swal.fire({ icon: 'info', title: 'Soal tidak tersedia', text: 'Belum ada soal untuk level Anda.', background: isDark ? '#14141E' : '#FFFFFF', color: isDark ? '#F1F5F9' : '#0F172A', confirmButtonColor: '#6366f1' })
        return
      }
      setStep('setup')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal memulai kuis')
    } finally {
      setLoading(false)
    }
  }, [])

  const startQuiz = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/quiz/start', { params: { jumlah } })
      const list = Array.isArray(res.data.soals) ? res.data.soals : []
      if (list.length === 0) {
        const Swal = (await import('sweetalert2')).default
        const isDark = document.documentElement.classList.contains('dark')
        Swal.fire({ icon: 'info', title: 'Soal tidak tersedia', text: 'Belum ada soal untuk level Anda.', background: isDark ? '#14141E' : '#FFFFFF', color: isDark ? '#F1F5F9' : '#0F172A', confirmButtonColor: '#6366f1' })
        return
      }
      setSoals(list)
      setUserAnswers({})
      setResults({})
      setChecked({})
      setCurrentIndex(0)
      setScore({ correct: 0, total: 0 })
      setStep('quiz')
    } catch (e) {
      toast('error', e.response?.data?.message || 'Gagal memulai kuis')
    } finally {
      setLoading(false)
    }
  }, [jumlah])

  const saveAnswer = (soalId, value) => {
    setUserAnswers(prev => ({ ...prev, [soalId]: value }))
  }

  const checkAnswer = useCallback(async (soalId) => {
    if (checked[soalId]) return
    const jawaban = userAnswers[soalId] ?? ''
    if (!jawaban.trim()) {
      const Swal = (await import('sweetalert2')).default
      const isDark = document.documentElement.classList.contains('dark')
      const isEssay = soals.find(s => s.id === soalId)?.jenis === 'essay'
      Swal.fire({ icon: 'warning', title: 'Jawaban kosong', text: isEssay ? 'Tulis jawaban Anda terlebih dahulu.' : 'Pilih jawaban terlebih dahulu.', background: isDark ? '#14141E' : '#FFFFFF', color: isDark ? '#F1F5F9' : '#0F172A', confirmButtonColor: '#6366f1' })
      return
    }
    try {
      setChecking(true)
      const res = await api.post('/quiz/check', { soal_id: soalId, jawaban })
      const data = res.data
      setResults(prev => ({ ...prev, [soalId]: data }))
      setChecked(prev => ({ ...prev, [soalId]: true }))
      setScore(prev => ({ ...prev, correct: prev.correct + (data.benar ? 1 : 0), total: prev.total + 1 }))
    } catch {
      // silently fail
    } finally {
      setChecking(false)
    }
  }, [userAnswers, checked, soals])

  const hasil = checked[currentSoal?.id]
  const isCorrect = results[currentSoal?.id]?.benar

  if (step === 'menu') {
    return (
      <div className="space-y-6">
        <header className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-indigo-500/40 bg-[#14141E] p-6 shadow-lg shadow-black/10">
          <div className="mb-2 flex items-center gap-2"><span className="text-xs font-medium uppercase tracking-wider text-indigo-400">Quiz & Latihan</span></div>
          <h1 className="text-xl font-bold text-slate-100">Quiz & Latihan</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">Uji pemahaman Anda dengan soal acak dari bank soal.</p>
        </header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <button onClick={checkAvailability} disabled={loading} className="group block text-left">
            <article className="relative flex h-full items-center overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#14141E]/95 p-5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 shadow-lg"><HelpCircle className="h-6 w-6 text-white" /></div>
              <div className="ml-4 flex-1">
                <h2 className="font-bold text-slate-100">{loading ? 'Memuat...' : 'Mulai Kuis'}</h2>
                <p className="mt-0.5 text-sm text-slate-400">Kerjakan soal acak pilihan ganda & essay</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-400" />
            </article>
          </button>
        </div>
      </div>
    )
  }

  if (step === 'setup') {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">Kuis Latihan</span>
              <h2 className="mt-2 text-lg font-bold text-slate-100">Atur Kuis</h2>
              <p className="text-sm text-slate-400">Tersedia <strong className="text-slate-200">{tersedia}</strong> soal untuk level Anda (PG & Essay).</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">Jumlah Soal</label>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setJumlah(v => Math.max(1, v - 5))} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#262636] text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition text-lg font-bold">-</button>
              <input type="number" min="1" max={tersedia} className="h-12 w-24 rounded-xl border border-[#262636] bg-[#1A1A26] text-center text-2xl font-bold text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" value={jumlah} onChange={e => setJumlah(Math.min(tersedia, Math.max(1, Number(e.target.value) || 1)))} />
              <button onClick={() => setJumlah(v => Math.min(tersedia, v + 5))} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#262636] text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition text-lg font-bold">+</button>
            </div>
          </div>

          <div className="mt-6 h-1.5 rounded-full bg-[#1E1E2E] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${(jumlah / Math.max(tersedia, 50)) * 100}%` }} />
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setStep('menu')} className="rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition">Batal</button>
            <button onClick={startQuiz} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50">
              {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Memuat...</> : <><span>Mulai Kuis</span> <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'quiz' && currentSoal) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
              <HelpCircle className="h-3 w-3" /> Kuis Latihan
            </span>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span>{score.correct}/{score.total} benar</span>
              <span className="text-slate-600">|</span>
              <span>{currentIndex + 1}/{soals.length}</span>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[#1E1E2E] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${(Object.keys(checked).length / soals.length) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-400">{String(currentIndex + 1).padStart(2, '0')}</span>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">{currentSoal.jenis === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'}</span>
          </div>

          <p className="text-sm leading-6 text-slate-100 mb-5">{currentSoal.pertanyaan}</p>

          {currentSoal.jenis === 'pilihan_ganda' ? (
            <div className="space-y-2">
              {Array.isArray(currentSoal.pilihan) && currentSoal.pilihan.length > 0 ? currentSoal.pilihan.map((choice, i) => {
                const isSelected = userAnswers[currentSoal.id] === choice
                const isAnswerCorrect = hasil && isCorrect
                const isAnswerWrong = hasil && !isCorrect && isSelected
                const isCorrectChoice = hasil && results[currentSoal.id]?.jawaban_benar === choice
                let borderColor = 'border-[#262636]'
                if (isAnswerCorrect) borderColor = 'border-emerald-500/50 bg-emerald-500/10'
                else if (isAnswerWrong) borderColor = 'border-rose-500/50 bg-rose-500/10'
                else if (hasil && isCorrectChoice) borderColor = 'border-emerald-500/50 bg-emerald-500/10'
                else if (isSelected) borderColor = 'border-indigo-500/50 bg-indigo-500/10'
                return (
                  <label key={i} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${borderColor}`}>
                    <input
                      type="radio"
                      name={`soal-${currentSoal.id}`}
                      className="h-4 w-4 accent-indigo-500"
                      checked={userAnswers[currentSoal.id] === choice}
                      onChange={() => !hasil && saveAnswer(currentSoal.id, choice)}
                      disabled={!!hasil}
                    />
                    <span className={`${hasil && isCorrectChoice ? 'text-emerald-300 font-medium' : hasil && isSelected && !isCorrect ? 'text-rose-300' : 'text-slate-300'}`}>{choice}</span>
                    {hasil && isCorrectChoice && <CheckCircle className="ml-auto h-4 w-4 text-emerald-400 shrink-0" />}
                    {isAnswerWrong && <XCircle className="ml-auto h-4 w-4 text-rose-400 shrink-0" />}
                  </label>
                )
              }) : null}
            </div>
          ) : (
            <div>
              <textarea
                className={inputClass}
                rows="4"
                value={userAnswers[currentSoal.id] || ''}
                onChange={(e) => !hasil && saveAnswer(currentSoal.id, e.target.value)}
                placeholder="Tulis jawaban Anda..."
                disabled={!!hasil}
              />
            </div>
          )}

          {hasil && currentSoal.jenis === 'essay' && (
            <div className={`mt-4 rounded-xl border p-4 ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <><CheckCircle className="h-5 w-5 text-emerald-400" /><span className="font-semibold text-emerald-400">Benar!</span></>
                ) : (
                  <><XCircle className="h-5 w-5 text-rose-400" /><span className="font-semibold text-rose-400">Salah</span></>
                )}
              </div>
              <p className="text-sm text-slate-300 mb-1">Jawaban Anda: <span className="text-slate-100">{userAnswers[currentSoal.id]}</span></p>
              {!isCorrect && (
                <p className="text-sm text-slate-300">Referensi: <strong className="text-slate-100">{results[currentSoal.id]?.jawaban_benar}</strong></p>
              )}
              {results[currentSoal.id]?.pembahasan && (
                <div className="mt-2 rounded-lg border border-[#262636] bg-[#1A1A26] p-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Pembahasan:</p>
                  <p className="text-sm text-slate-300">{results[currentSoal.id]?.pembahasan}</p>
                </div>
              )}
            </div>
          )}
          {hasil && currentSoal.jenis === 'pilihan_ganda' && (
            <div className={`mt-4 rounded-xl border p-4 ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <><CheckCircle className="h-5 w-5 text-emerald-400" /><span className="font-semibold text-emerald-400">Benar!</span></>
                ) : (
                  <><XCircle className="h-5 w-5 text-rose-400" /><span className="font-semibold text-rose-400">Salah</span></>
                )}
              </div>
              {!isCorrect && (
                <p className="text-sm text-slate-300 mb-2">Jawaban benar: <strong className="text-slate-100">{results[currentSoal.id]?.jawaban_benar}</strong></p>
              )}
              {results[currentSoal.id]?.pembahasan && (
                <div className="mt-2 rounded-lg border border-[#262636] bg-[#1A1A26] p-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Pembahasan:</p>
                  <p className="text-sm text-slate-300">{results[currentSoal.id]?.pembahasan}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-full border border-[#262636] px-4 py-2 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="h-4 w-4" /> Sebelumnya
          </button>

          <div className="flex gap-2">
            {!hasil && (
              <button
                onClick={() => checkAnswer(currentSoal.id)}
                disabled={checking || !!hasil}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-500 hover:to-orange-500 disabled:opacity-50"
              >
                {checking ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Mengecek...</> : <><CheckCircle className="h-4 w-4" /> Cek Jawaban</>}
              </button>
            )}

            {isLastQuestion ? (
              hasil && (
                <button
                  onClick={() => setStep('result')}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"
                >
                  <Trophy className="h-4 w-4" /> Lihat Hasil
                </button>
              )
            ) : (
              hasil && (
                <button
                  onClick={() => setCurrentIndex(i => Math.min(soals.length - 1, i + 1))}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"
                >
                  Selanjutnya <ArrowRight className="h-4 w-4" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result') {
    const persen = soals.length > 0 ? Math.round((score.correct / soals.length) * 100) : 0
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-indigo-500/40 bg-[#14141E] p-8 text-center shadow-lg shadow-black/10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-5">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-3">Hasil Kuis</span>
          <h2 className="mt-4 text-4xl font-bold text-slate-100">{score.correct}/{soals.length} ({persen}%)</h2>
          <p className="mt-2 text-sm text-slate-400">Jawaban benar dari total soal</p>
        </div>

        <div className="rounded-2xl border border-[#262636] bg-[#14141E] p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-100 mb-4">Ringkasan Jawaban</h3>
          <div className="space-y-3">
            {soals.map((soal, i) => {
              const r = results[soal.id]
              return (
                <div key={soal.id} className={`rounded-xl border p-4 ${r?.benar ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-400">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-100 mb-1">{soal.pertanyaan}</p>
                      <p className="text-xs text-slate-500">Jawaban Anda: <span className={r?.benar ? 'text-emerald-400' : 'text-rose-400'}>{userAnswers[soal.id] || '(kosong)'}</span></p>
                      {!r?.benar && <p className="text-xs text-slate-500 mt-0.5">Benar: <span className="text-slate-300">{r?.jawaban_benar}</span></p>}
                    </div>
                    {r?.benar ? <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" /> : <XCircle className="h-5 w-5 shrink-0 text-rose-400" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setStep('menu')}
            className="inline-flex items-center gap-2 rounded-full border border-[#262636] px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
          <button
            onClick={checkAvailability}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-violet-500"
          >
            <RefreshCw className="h-4 w-4" /> Ulangi Kuis
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default MateriQuiz

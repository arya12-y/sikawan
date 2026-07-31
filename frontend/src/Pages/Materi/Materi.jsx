import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Play, FileText, Presentation, HelpCircle, BookOpen, ArrowRight, Target } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSchedule } from '../../hooks/useSchedule'

const menuItems = [
  { title: 'Video Pembelajaran', description: 'Kumpulan video materi pembelajaran interaktif', icon: Play, path: '/pembelajaran/video', gradient: 'from-blue-600 to-cyan-500' },
  { title: 'Modul PDF', description: 'Dokumen dan modul pembelajaran dalam format PDF', icon: FileText, path: '/pembelajaran/pdf', gradient: 'from-red-600 to-rose-500' },
  { title: 'Presentasi', description: 'Materi presentasi dan slide pembelajaran', icon: Presentation, path: '/pembelajaran/presentasi', gradient: 'from-amber-500 to-orange-500' },
  { title: 'Quiz & Latihan', description: 'Uji pemahaman dengan quiz dan latihan soal', icon: HelpCircle, path: '/pembelajaran/quiz', gradient: 'from-emerald-600 to-green-500' },
]

function Materi() {
  const { user } = useAuth()
  const { asesmenLulus, status } = useSchedule()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlKompetensiId = searchParams.get('kompetensi_id')

  const recommendedNama = useMemo(() => {
    if (!urlKompetensiId) return null
    const scores = status?.nilai_kompetensi
    if (!Array.isArray(scores)) return null
    const match = scores.find(s => String(s.kompetensi_id) === urlKompetensiId)
    return match?.kompetensi || null
  }, [urlKompetensiId, status])

  useEffect(() => {
    if (urlKompetensiId) return
    const roles = Array.isArray(user?.roles) ? user.roles : []
    if (!roles.includes('Walidata')) return
    if (asesmenLulus !== false) return

    const scores = status?.nilai_kompetensi
    if (!Array.isArray(scores) || scores.length === 0) return

    const rendah = scores
      .filter(s => s.nilai < 70 && s.kompetensi_id)
      .sort((a, b) => a.nilai - b.nilai)
    if (rendah.length === 0) return

    navigate(`/pembelajaran?kompetensi_id=${rendah[0].kompetensi_id}`, { replace: true })
  }, [urlKompetensiId, asesmenLulus, status, user, navigate])

  return (
    <div className="space-y-6">
      {urlKompetensiId && recommendedNama && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600/15 via-violet-600/10 to-transparent p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Rekomendasi Belajar</p>
              <p className="mt-0.5 text-sm text-slate-300">Pelajari materi untuk <strong className="text-indigo-300">{recommendedNama}</strong>. Pilih format di bawah:</p>
            </div>
            <Link to="/pembelajaran" className="shrink-0 rounded-full border border-[#262636] px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-indigo-500/30 hover:text-indigo-400 transition">
              Lihat Semua
            </Link>
          </div>
        </div>
      )}

      <header className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-indigo-500/40 bg-[#14141E] p-6 shadow-lg shadow-black/10">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30"><BookOpen className="h-6 w-6 text-white" /></div>
          <div>
            <div className="mb-2 flex items-center gap-2"><span className="text-xs font-medium uppercase tracking-wider text-indigo-400">Learning Center</span><span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">{menuItems.length} koleksi</span></div>
            <h1 className="text-xl font-bold text-slate-100">Pembelajaran</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">Modul untuk Walidata belajar sebelum ujian, dipisahkan berdasarkan format materi.</p>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {menuItems.map((item) => (
          <Link key={item.path} to={urlKompetensiId ? `${item.path}?kompetensi_id=${urlKompetensiId}` : item.path} className="group block">
            <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#14141E]/95 p-6 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10">
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${item.gradient}`} />
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg transition-transform duration-200 group-hover:scale-110`}><item.icon className="h-6 w-6 text-white" /></div>
              <h2 className="mt-5 text-base font-bold text-slate-100">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
              <div className="mt-5 flex items-center gap-1 text-xs font-medium text-indigo-400">Jelajahi materi <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
export default Materi
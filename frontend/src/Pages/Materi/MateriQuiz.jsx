import { Link } from 'react-router-dom'
import { HelpCircle, ClipboardCheck, ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { can } from '../../utils/can'

function MateriQuiz() {
  const { user } = useAuth()
  const items = [
    { to: '/asesmen', icon: ClipboardCheck, gradient: 'from-violet-600 to-purple-500', title: 'Ikuti Asesmen', desc: 'Uji kompetensi Anda melalui sistem asesmen.', glow: 'indigo' },
    ...(can(user, 'bank-soal.view') ? [{ to: '/bank-soal', icon: HelpCircle, gradient: 'from-sky-500 to-cyan-400', title: 'Bank Soal', desc: 'Kelola kumpulan soal latihan dan ujian', glow: 'sky' }] : []),
  ]

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-[#1E1E2E] border-b-indigo-500/40 bg-[#14141E] p-6 shadow-lg shadow-black/10">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        <div className="mb-2 flex items-center gap-2"><span className="text-xs font-medium uppercase tracking-wider text-indigo-400">Quiz & Latihan</span></div>
        <h1 className="text-xl font-bold text-slate-100">Quiz & Latihan</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">Uji pemahaman dan kelola soal latihan.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => (
          <Link key={i} to={item.to} className="group block">
            <article className="relative flex h-full items-center overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#14141E]/95 p-5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}><item.icon className="h-6 w-6 text-white" /></div>
              <div className="ml-4 flex-1">
                <h2 className="font-bold text-slate-100">{item.title}</h2>
                <p className="mt-0.5 text-sm text-slate-400">{item.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-400" />
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
export default MateriQuiz

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

const stagger = { animate: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [showPassword, setShowPassword] = useState(false)
  const [loginNote, setLoginNote] = useState(location.state?.notice ? { type: 'success', message: location.state.notice } : null)

  const onSubmit = async (data) => {
    setLoginNote(null)
    try {
      const response = await login(data)
      setLoginNote({ type: 'success', message: response.message || 'Login berhasil. Mengalihkan...' })
      setTimeout(() => navigate('/', { replace: true }), 650)
    } catch (error) {
      setLoginNote({ type: 'danger', message: error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.' })
    }
  }

  return (
    <main className="flex min-h-screen bg-[#09090E]">
      <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        className="hidden w-[480px] shrink-0 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 p-12 lg:flex relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative z-10">
          <p className="mt-8 text-sm font-semibold tracking-[0.2em] text-indigo-200">SIKAWAN</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white">Data yang terkelola,<br />keputusan yang lebih baik.</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-indigo-200">Sistem Informasi Kompetensi dan Asesmen Walidata untuk pengelolaan data pemerintahan yang terpadu.</p>
        </div>
        <p className="relative z-10 text-sm text-indigo-300">&copy; {new Date().getFullYear()} Pemerintah Daerah</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-1 items-center justify-center px-6">
        <motion.div variants={stagger} initial="initial" animate="animate" className="w-full max-w-sm">
          <motion.div variants={fadeUp} className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg">S</div>
            <p className="text-sm font-semibold tracking-[0.2em] text-indigo-400">SIKAWAN</p>
          </motion.div>
          <motion.p variants={fadeUp} className="text-sm font-semibold text-indigo-400">SELAMAT DATANG</motion.p>
          <motion.h2 variants={fadeUp} className="mt-2 text-2xl font-bold text-slate-100">Masuk ke akun Anda</motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-sm text-slate-400">Gunakan kredensial resmi Anda untuk melanjutkan.</motion.p>
          {loginNote && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 rounded-xl border px-4 py-3 text-sm ${loginNote.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400'}`}>{loginNote.message}</motion.div>}
          <motion.form variants={fadeUp} onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input type="email" placeholder="nama@email.com" className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" {...register('email', { required: 'Email wajib diisi' })} />
              {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Masukkan password" className="w-full rounded-xl border border-[#262636] bg-[#1A1A26] px-4 py-3 pr-11 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 [&::-ms-reveal]:hidden" {...register('password', { required: 'Password wajib diisi' })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-medium text-rose-400">{errors.password.message}</p>}
            </div>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-50" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Memproses...</> : <><LogIn className="h-4 w-4" /> Masuk ke SIKAWAN</>}
            </button>
          </motion.form>
          <motion.div variants={fadeUp} className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#262636]" /></div>
            <div className="relative flex justify-center"><span className="bg-[#09090E] px-3 text-xs text-slate-500">atau</span></div>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-6 flex items-center justify-between text-sm">
            <Link className="font-medium text-indigo-400 hover:text-indigo-300 transition" to="/forgot-password">Lupa password?</Link>
            <Link className="font-medium text-slate-400 hover:text-slate-200 transition" to="/register">Daftar baru</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  )
}

export default Login

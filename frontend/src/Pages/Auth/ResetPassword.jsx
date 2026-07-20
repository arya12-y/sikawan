import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'

function Field({ label, name, type = 'text', rules, register, error }) {
  const placeholders = { email: 'Masukkan email', token: 'Masukkan token reset', password: 'Masukkan kata sandi baru', password_confirmation: 'Ulangi kata sandi baru' }
  return <div><label className="block text-sm font-semibold text-slate-300">{label} <span className="text-rose-400">*</span></label><input className={`mt-2 w-full rounded-xl border bg-[#09090E] px-4 py-3 text-sm outline-none transition focus:bg-[#14141E] focus:ring-4 ${error ? 'border-rose-400 focus:ring-rose-100' : 'border-[#1E1E2E] focus:border-indigo-500 focus:ring-indigo-100'}`} type={type} placeholder={placeholders[name] || `Masukkan ${label.toLowerCase()}`} {...register(name, rules)} />{error && <p className="mt-2 text-xs font-medium text-rose-600">{error.message}</p>}</div>
}

function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: params.get('email') || '', token: params.get('token') || '' } })
  const [note, setNote] = useState(null)
  const onSubmit = async (data) => { setNote(null); try { const res = await api.post('/reset-password', data); navigate('/login', { replace: true, state: { notice: res.data?.message || 'Password berhasil diperbarui. Silakan login dengan password baru.' } }) } catch (e) { setNote(e.response?.data?.message || 'Reset password gagal. Periksa token dan email Anda.') } }
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-8 py-12"><section className="w-full max-w-md rounded-3xl bg-[#14141E] p-10 shadow-2xl shadow-black/30"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">S</div><p className="mt-7 text-sm font-semibold tracking-[0.2em] text-indigo-400">SIKAWAN</p><h1 className="mt-2 text-3xl font-bold text-slate-100">Reset kata sandi</h1><p className="mt-3 text-sm leading-6 text-slate-400">Masukkan token dari email dan kata sandi baru Anda.</p>{note && <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{note}</div>}<form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5"><Field label="Email" name="email" type="email" register={register} error={errors.email} rules={{ required: 'Email wajib diisi' }} /><Field label="Token Reset" name="token" register={register} error={errors.token} rules={{ required: 'Token wajib diisi' }} /><Field label="Kata Sandi Baru" name="password" type="password" register={register} error={errors.password} rules={{ required: 'Password wajib diisi', minLength: { value: 8, message: 'Minimal 8 karakter' } }} /><Field label="Konfirmasi Kata Sandi" name="password_confirmation" type="password" register={register} error={errors.password_confirmation} rules={{ required: 'Konfirmasi password wajib diisi', validate: (value) => value === getValues('password') || 'Konfirmasi password tidak sama' }} /><button className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Simpan Kata Sandi Baru'}</button></form><Link className="mt-7 inline-block text-sm font-semibold text-indigo-400 hover:text-indigo-800" to="/login">← Kembali ke Login</Link></section></main>
}
export default ResetPassword

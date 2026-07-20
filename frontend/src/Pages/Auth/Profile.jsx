import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { can } from '../../utils/can'
import { useAuth } from '../../hooks/useAuth'

function Field({ label, name, type = 'text', register, error }) {
  const required = name === 'name' || name === 'email'
  return <div><label className="mb-2 block text-sm font-semibold text-slate-300">{label}{required && <span className="text-rose-400"> *</span>}</label><input className={`w-full rounded-xl border bg-[#09090E] px-4 py-3 text-sm outline-none transition focus:bg-[#14141E] focus:ring-4 ${error ? 'border-rose-400 focus:ring-rose-100' : 'border-[#1E1E2E] focus:border-indigo-500 focus:ring-indigo-100'}`} type={type} placeholder={`Masukkan ${label.toLowerCase()}`} {...register(name, { required })} />{error && <p className="mt-2 text-xs font-medium text-rose-600">Kolom ini wajib diisi.</p>}</div>
}

function Profile() {
  const navigate = useNavigate()
  const { setUser, user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const [notice, setNotice] = useState(null)
  useEffect(() => { api.get('/me').then((res) => reset(res.data?.user || res.data || {})).catch(() => setNotice({ type: 'danger', message: 'Profil tidak dapat dimuat.' })) }, [reset])
  const onSubmit = async (data) => { setNotice(null); try { const res = await api.put('/profile', data); setUser(res.data?.user || res.data); setNotice({ type: 'success', message: 'Profil berhasil diperbarui.' }) } catch (e) { setNotice({ type: 'danger', message: e.response?.data?.message || 'Gagal menyimpan profil' }) } }
  return <main className="mx-auto w-full max-w-4xl"><section className="overflow-hidden rounded-3xl border border-[#1E1E2E] bg-[#14141E] shadow-sm"><header className="flex items-center gap-5 border-b border-[#1E1E2E] bg-gradient-to-r from-indigo-500/10 to-transparent px-10 py-8"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-600/25">P</div><div><p className="text-sm font-semibold text-indigo-400">PENGATURAN AKUN</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-100">Profil Saya</h1><p className="mt-1 text-sm text-slate-400">Perbarui informasi akun Anda.</p></div></header><div className="p-10">{notice && <div role="alert" className={`mb-6 rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400'}`}>{notice.message}</div>}<form className="grid grid-cols-2 gap-6" onSubmit={handleSubmit(onSubmit)}><Field label="Nama" name="name" register={register} error={errors.name} /><Field label="Email" name="email" type="email" register={register} error={errors.email} /><Field label="NIP" name="nip" register={register} error={errors.nip} /><Field label="No. HP" name="phone" register={register} error={errors.phone} /><div className="col-span-2"><label className="mb-2 block text-sm font-semibold text-slate-300">Alamat</label><textarea className="w-full rounded-xl border border-[#1E1E2E] bg-[#09090E] px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-[#14141E] focus:ring-4 focus:ring-indigo-100" rows="3" placeholder="Masukkan alamat" {...register('address')} /></div><div className="col-span-2 flex justify-end gap-3 border-t border-[#1E1E2E] pt-6"><button type="button" className="rounded-xl border border-[#1E1E2E] px-5 py-3 text-sm font-semibold text-slate-400 hover:bg-[#14141E]/[0.03]" onClick={() => navigate(-1)}>Batal</button>{can(user, 'profile.update') && <button className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>}</div></form></div></section></main>
}
export default Profile

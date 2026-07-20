import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'

const steps = ['Informasi Akun', 'Data Diri', 'Informasi Instansi']
const inputClass = 'mt-2 w-full rounded-xl border border-[#1E1E2E] bg-[#09090E] px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-[#14141E] focus:ring-4 focus:ring-indigo-100'
const errorClass = 'mt-1.5 text-xs font-medium text-rose-600'

function Field({ label, error, children }) {
  return <div><label className="block text-sm font-semibold text-slate-300">{label} <span className="text-rose-400">*</span></label>{children}{error && <p className={errorClass}>{error.message}</p>}</div>
}

function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [serverErrors, setServerErrors] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const { register, handleSubmit, trigger, getValues, formState: { errors, isSubmitting } } = useForm()
  const nextStep = async () => {
    const fields = [['email', 'password', 'password_confirmation'], ['name', 'nip', 'jabatan', 'phone'], ['tingkat_instansi', 'nama_instansi', 'nama_bidang', 'alamat_kantor', 'sk_walidata']]
    if (await trigger(fields[step])) setStep((current) => Math.min(current + 1, steps.length - 1))
  }
  const onSubmit = async (data) => {
    setServerErrors([])
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => { if (key === 'sk_walidata') { if (value?.[0]) formData.append(key, value[0]); return }; formData.append(key, value ?? '') })
    try { await api.post('/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); navigate('/login', { replace: true, state: { notice: 'Pendaftaran berhasil dikirim. Akun Anda menunggu verifikasi SK dan persetujuan Admin Diskominfo sebelum dapat digunakan.' } }) } catch (error) { const validationErrors = error.response?.data?.errors; setServerErrors(validationErrors ? Object.values(validationErrors).flat() : [error.response?.data?.message || 'Pendaftaran gagal diproses']) }
  }
  return <main className="min-h-screen bg-slate-950 px-8 py-12"><div className="mx-auto w-full max-w-3xl"><header className="mb-8 text-center text-white"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/100 text-xl font-bold shadow-lg shadow-indigo-500/30">S</div><p className="text-sm font-semibold tracking-[0.2em] text-indigo-300">SIKAWAN</p><h1 className="mt-2 text-3xl font-bold">Registrasi Walidata</h1><p className="mt-2 text-sm text-slate-300">Lengkapi data resmi penanggung jawab data instansi.</p></header><section className="rounded-3xl bg-[#14141E] p-10 shadow-2xl shadow-black/30">
    <div className="mb-10 grid grid-cols-3 gap-3">{steps.map((item, index) => <div key={item} className="flex items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${index <= step ? 'bg-indigo-600 text-white' : 'bg-[#1A1A26] text-slate-400'}`}>{index + 1}</span><span className={`text-xs font-semibold ${index === step ? 'text-indigo-700' : 'text-slate-400'}`}>{item}</span></div>)}</div>
    {serverErrors.length > 0 && <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{serverErrors.map((message) => <p key={message}>{message}</p>)}</div>}
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {step === 0 && <><Field label="Email Resmi Instansi" error={errors.email}><input className={inputClass} type="email" placeholder="walidata@mail.go.id" {...register('email', { required: 'Email wajib diisi', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' } })} /></Field><Field label="Kata Sandi" error={errors.password}><div className="relative"><input className={inputClass} type={showPassword ? 'text' : 'password'} placeholder="Minimal 8 karakter" {...register('password', { required: 'Password wajib diisi', pattern: { value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, message: 'Minimal 8 karakter, huruf besar, angka, dan simbol' } })} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-5 text-xs font-semibold text-indigo-400">{showPassword ? 'Sembunyikan' : 'Tampilkan'}</button></div></Field><Field label="Konfirmasi Kata Sandi" error={errors.password_confirmation}><div className="relative"><input className={inputClass} type={showPasswordConfirmation ? 'text' : 'password'} placeholder="Ulangi password" {...register('password_confirmation', { required: 'Konfirmasi password wajib diisi', validate: (value) => value === getValues('password') || 'Konfirmasi password tidak sama' })} /><button type="button" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} className="absolute right-3 top-5 text-xs font-semibold text-indigo-400">{showPasswordConfirmation ? 'Sembunyikan' : 'Tampilkan'}</button></div></Field></>}
      {step === 1 && <><Field label="Nama Lengkap" error={errors.name}><input className={inputClass} placeholder="Nama lengkap beserta gelar" {...register('name', { required: 'Nama wajib diisi' })} /></Field><Field label="NIP / NIK" error={errors.nip}><input className={inputClass} placeholder="Nomor Induk Pegawai atau NIK" {...register('nip', { required: 'NIP/NIK wajib diisi' })} /></Field><Field label="Jabatan" error={errors.jabatan}><input className={inputClass} placeholder="Pranata Komputer Ahli Muda" {...register('jabatan', { required: 'Jabatan wajib diisi' })} /></Field><Field label="Nomor WhatsApp Aktif" error={errors.phone}><input className={inputClass} placeholder="08xxxxxxxxxx" {...register('phone', { required: 'Nomor WhatsApp wajib diisi' })} /></Field></>}
      {step === 2 && <><Field label="Tingkat Instansi" error={errors.tingkat_instansi}><select className={inputClass} {...register('tingkat_instansi', { required: 'Tingkat instansi wajib dipilih' })}><option value="">Pilih tingkat instansi</option><option value="Pemerintah Pusat">Pemerintah Pusat</option><option value="Pemerintah Provinsi">Pemerintah Provinsi</option><option value="Pemerintah Kabupaten">Pemerintah Kabupaten</option><option value="Pemerintah Kota">Pemerintah Kota</option></select></Field><Field label="Nama Instansi/SKPD" error={errors.nama_instansi}><input className={inputClass} placeholder="Dinas Komunikasi dan Informatika Provinsi X" {...register('nama_instansi', { required: 'Nama instansi wajib diisi' })} /></Field><Field label="Nama Bidang/Bagian" error={errors.nama_bidang}><input className={inputClass} placeholder="Bidang Statistik Sektoral" {...register('nama_bidang', { required: 'Nama bidang wajib diisi' })} /></Field><Field label="Alamat Kantor Instansi" error={errors.alamat_kantor}><textarea className={inputClass} rows="3" placeholder="Alamat lengkap kantor" {...register('alamat_kantor', { required: 'Alamat kantor wajib diisi' })} /></Field><Field label="Upload SK / Surat Tugas Wali Data" error={errors.sk_walidata}><input className={inputClass} type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('sk_walidata', { required: 'SK/Surat tugas wajib diunggah' })} /><p className="mt-2 text-xs text-slate-400">Format PDF/JPG/PNG, maksimal 2MB.</p></Field></>}
      <div className="flex justify-between border-t border-[#1E1E2E] pt-6">{step > 0 ? <button type="button" className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-[#1A1A26]" onClick={() => setStep(step - 1)}>Kembali</button> : <span />}{step < steps.length - 1 ? <button type="button" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700" onClick={nextStep}>Lanjut</button> : <button className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}</button>}</div>
    </form><p className="mt-7 text-center text-sm text-slate-400">Sudah punya akun? <Link className="font-semibold text-indigo-400 hover:text-indigo-800" to="/login">Masuk</Link></p>
  </section></div></main>
}
export default Register

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'

const steps = ['Informasi Akun', 'Data Diri', 'Informasi Instansi']

function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [serverErrors, setServerErrors] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const { register, handleSubmit, trigger, getValues, formState: { errors, isSubmitting } } = useForm()

  const nextStep = async () => {
    const fields = [
      ['email', 'password', 'password_confirmation'],
      ['name', 'nip', 'jabatan', 'phone'],
      ['tingkat_instansi', 'nama_instansi', 'nama_bidang', 'alamat_kantor', 'sk_walidata'],
    ]

    const valid = await trigger(fields[step])
    if (valid) setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  const onSubmit = async (data) => {
    setServerErrors([])

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'sk_walidata') {
        if (value?.[0]) formData.append(key, value[0])
        return
      }

      formData.append(key, value ?? '')
    })

    try {
      await api.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/login', { replace: true })
    } catch (error) {
      const validationErrors = error.response?.data?.errors
      const messages = validationErrors ? Object.values(validationErrors).flat() : [error.response?.data?.message || 'Pendaftaran gagal diproses']
      setServerErrors(messages)
    }
  }

  return (
    <div className="register-dark">
      <div className="register-dark-container">
        <div className="login-dark-brand">
          <div className="login-dark-logo"><i className="bi bi-person-badge-fill" /></div>
          <h1 className="login-dark-title">REGISTRASI WALIDATA</h1>
          <p className="login-dark-subtitle">Lengkapi data resmi penanggung jawab data instansi</p>
        </div>

        <div className="register-dark-card">
          <div className="register-steps">
            {steps.map((item, index) => (
              <div className={`register-step ${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} key={item}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>

          {serverErrors.length > 0 && (
            <div className="alert alert-danger py-2 small">
              {serverErrors.map((message) => <div key={message}>{message}</div>)}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="login-dark-form">
            {step === 0 && (
              <>
                <div className="login-dark-field">
                  <label className="login-dark-label">Email Resmi Instansi</label>
                  <div className="login-dark-input-wrap">
                    <i className="bi bi-envelope" />
                    <input className={`login-dark-input ${errors.email ? 'login-dark-input-error' : ''}`} type="email" placeholder="walidata@mail.go.id" {...register('email', { required: 'Email wajib diisi', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' } })} />
                  </div>
                  {errors.email && <span className="login-dark-error">{errors.email.message}</span>}
                </div>

                <div className="login-dark-field">
                  <label className="login-dark-label">Kata Sandi</label>
                  <div className="login-dark-input-wrap">
                    <i className="bi bi-lock" />
                    <input className={`login-dark-input ${errors.password ? 'login-dark-input-error' : ''}`} type={showPassword ? 'text' : 'password'} placeholder="Minimal 8 karakter" {...register('password', { required: 'Password wajib diisi', pattern: { value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, message: 'Minimal 8 karakter, huruf besar, angka, dan simbol' } })} />
                    <button type="button" className="login-dark-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                  {errors.password && <span className="login-dark-error">{errors.password.message}</span>}
                </div>

                <div className="login-dark-field">
                  <label className="login-dark-label">Konfirmasi Kata Sandi</label>
                  <div className="login-dark-input-wrap">
                    <i className="bi bi-shield-check" />
                    <input className={`login-dark-input ${errors.password_confirmation ? 'login-dark-input-error' : ''}`} type={showPasswordConfirmation ? 'text' : 'password'} placeholder="Ulangi password" {...register('password_confirmation', { required: 'Konfirmasi password wajib diisi', validate: (value) => value === getValues('password') || 'Konfirmasi password tidak sama' })} />
                    <button type="button" className="login-dark-toggle" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} tabIndex={-1}>
                      <i className={`bi ${showPasswordConfirmation ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                  {errors.password_confirmation && <span className="login-dark-error">{errors.password_confirmation.message}</span>}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="login-dark-field">
                  <label className="login-dark-label">Nama Lengkap</label>
                  <div className="login-dark-input-wrap"><i className="bi bi-person" /><input className="login-dark-input" placeholder="Nama lengkap beserta gelar" {...register('name', { required: 'Nama wajib diisi' })} /></div>
                  {errors.name && <span className="login-dark-error">{errors.name.message}</span>}
                </div>
                <div className="login-dark-field">
                  <label className="login-dark-label">NIP / NIK</label>
                  <div className="login-dark-input-wrap"><i className="bi bi-credit-card" /><input className="login-dark-input" placeholder="Nomor Induk Pegawai atau NIK" {...register('nip', { required: 'NIP/NIK wajib diisi' })} /></div>
                  {errors.nip && <span className="login-dark-error">{errors.nip.message}</span>}
                </div>
                <div className="login-dark-field">
                  <label className="login-dark-label">Jabatan</label>
                  <div className="login-dark-input-wrap"><i className="bi bi-briefcase" /><input className="login-dark-input" placeholder="Contoh: Pranata Komputer Ahli Muda" {...register('jabatan', { required: 'Jabatan wajib diisi' })} /></div>
                  {errors.jabatan && <span className="login-dark-error">{errors.jabatan.message}</span>}
                </div>
                <div className="login-dark-field">
                  <label className="login-dark-label">Nomor WhatsApp Aktif</label>
                  <div className="login-dark-input-wrap"><i className="bi bi-whatsapp" /><input className="login-dark-input" placeholder="08xxxxxxxxxx" {...register('phone', { required: 'Nomor WhatsApp wajib diisi' })} /></div>
                  {errors.phone && <span className="login-dark-error">{errors.phone.message}</span>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="login-dark-field">
                  <label className="login-dark-label">Tingkat Instansi</label>
                  <select className="login-dark-input register-select" {...register('tingkat_instansi', { required: 'Tingkat instansi wajib dipilih' })}>
                    <option value="">Pilih tingkat instansi</option>
                    <option value="Pemerintah Pusat">Pemerintah Pusat</option>
                    <option value="Pemerintah Provinsi">Pemerintah Provinsi</option>
                    <option value="Pemerintah Kabupaten">Pemerintah Kabupaten</option>
                    <option value="Pemerintah Kota">Pemerintah Kota</option>
                  </select>
                  {errors.tingkat_instansi && <span className="login-dark-error">{errors.tingkat_instansi.message}</span>}
                </div>
                <div className="login-dark-field">
                  <label className="login-dark-label">Nama Instansi/SKPD</label>
                  <div className="login-dark-input-wrap"><i className="bi bi-building" /><input className="login-dark-input" placeholder="Dinas Komunikasi dan Informatika Provinsi X" {...register('nama_instansi', { required: 'Nama instansi wajib diisi' })} /></div>
                  {errors.nama_instansi && <span className="login-dark-error">{errors.nama_instansi.message}</span>}
                </div>
                <div className="login-dark-field">
                  <label className="login-dark-label">Nama Bidang/Bagian</label>
                  <div className="login-dark-input-wrap"><i className="bi bi-diagram-3" /><input className="login-dark-input" placeholder="Bidang Statistik Sektoral" {...register('nama_bidang', { required: 'Nama bidang wajib diisi' })} /></div>
                  {errors.nama_bidang && <span className="login-dark-error">{errors.nama_bidang.message}</span>}
                </div>
                <div className="login-dark-field">
                  <label className="login-dark-label">Alamat Kantor Instansi</label>
                  <textarea className="login-dark-input register-textarea" rows="3" placeholder="Alamat lengkap kantor" {...register('alamat_kantor', { required: 'Alamat kantor wajib diisi' })} />
                  {errors.alamat_kantor && <span className="login-dark-error">{errors.alamat_kantor.message}</span>}
                </div>
                <div className="login-dark-field">
                  <label className="login-dark-label">Upload SK / Surat Tugas Wali Data</label>
                  <input className="login-dark-input register-file" type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('sk_walidata', { required: 'SK/Surat tugas wajib diunggah' })} />
                  <span className="register-help">Format PDF/JPG/PNG, maksimal 2MB.</span>
                  {errors.sk_walidata && <span className="login-dark-error">{errors.sk_walidata.message}</span>}
                </div>
              </>
            )}

            <div className="register-actions">
              {step > 0 && <button type="button" className="register-secondary-btn" onClick={() => setStep(step - 1)}>Kembali</button>}
              {step < steps.length - 1 ? <button type="button" className="login-dark-btn" onClick={nextStep}>Lanjut</button> : <button className="login-dark-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Mengirim...' : 'Daftar'}</button>}
            </div>
          </form>

          <div className="login-dark-footer">
            <Link to="/login">Sudah punya akun? Masuk</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

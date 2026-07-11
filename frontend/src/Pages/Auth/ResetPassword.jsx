import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'

function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: params.get('email') || '', token: params.get('token') || '' } })
  const [note, setNote] = useState(null)

  const onSubmit = async (data) => {
    setNote(null)
    try {
      const res = await api.post('/reset-password', data)
      navigate('/login', { replace: true, state: { notice: res.data?.message || 'Password berhasil diperbarui. Silakan login dengan password baru.' } })
    } catch (e) {
      setNote(e.response?.data?.message || 'Reset password gagal. Periksa token dan email Anda.')
    }
  }

  return (
    <div className="login-dark"><div className="login-dark-container">
      <div className="login-dark-brand"><div className="login-dark-logo"><i className="bi bi-shield-lock-fill" /></div><h1 className="login-dark-title">SIKAWAN</h1><p className="login-dark-subtitle">Buat kata sandi baru</p></div>
      <div className="login-dark-card">
        <div className="login-dark-card-header"><h2>Reset Kata Sandi</h2><p>Masukkan token dari email dan kata sandi baru Anda.</p></div>
        {note && <div className="login-note login-note-danger"><i className="bi bi-exclamation-triangle-fill" /><span>{note}</span></div>}
        <form onSubmit={handleSubmit(onSubmit)} className="login-dark-form">
          <div className="login-dark-field"><label className="login-dark-label">Email</label><div className="login-dark-input-wrap"><i className="bi bi-envelope" /><input className="login-dark-input" type="email" {...register('email', { required: 'Email wajib diisi' })} /></div>{errors.email && <span className="login-dark-error">{errors.email.message}</span>}</div>
          <div className="login-dark-field"><label className="login-dark-label">Token Reset</label><div className="login-dark-input-wrap"><i className="bi bi-key" /><input className="login-dark-input" {...register('token', { required: 'Token wajib diisi' })} /></div>{errors.token && <span className="login-dark-error">{errors.token.message}</span>}</div>
          <div className="login-dark-field"><label className="login-dark-label">Kata Sandi Baru</label><div className="login-dark-input-wrap"><i className="bi bi-lock" /><input className="login-dark-input" type="password" {...register('password', { required: 'Password wajib diisi', minLength: { value: 8, message: 'Minimal 8 karakter' } })} /></div>{errors.password && <span className="login-dark-error">{errors.password.message}</span>}</div>
          <div className="login-dark-field"><label className="login-dark-label">Konfirmasi Kata Sandi</label><div className="login-dark-input-wrap"><i className="bi bi-shield-check" /><input className="login-dark-input" type="password" {...register('password_confirmation', { required: 'Konfirmasi password wajib diisi', validate: (value) => value === getValues('password') || 'Konfirmasi password tidak sama' })} /></div>{errors.password_confirmation && <span className="login-dark-error">{errors.password_confirmation.message}</span>}</div>
          <button className="login-dark-btn" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Simpan Kata Sandi Baru'}</button>
        </form>
        <div className="login-dark-footer"><Link to="/login">Kembali ke Login</Link></div>
      </div>
    </div></div>
  )
}

export default ResetPassword

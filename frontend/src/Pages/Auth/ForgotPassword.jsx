import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'

function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [note, setNote] = useState(null)

  const onSubmit = async (data) => {
    setNote(null)
    try {
      const res = await api.post('/forgot-password', data)
      setNote({ type: 'success', message: res.data?.message || 'Instruksi reset password telah dikirim ke email Anda.' })
    } catch (e) {
      setNote({ type: 'danger', message: e.response?.data?.message || 'Gagal mengirim instruksi reset password.' })
    }
  }

  return (
    <div className="login-dark">
      <div className="login-dark-container">
        <div className="login-dark-brand">
          <div className="login-dark-logo"><i className="bi bi-key-fill" /></div>
          <h1 className="login-dark-title">SIKAWAN</h1>
          <p className="login-dark-subtitle">Pemulihan akses akun</p>
        </div>
        <div className="login-dark-card">
          <div className="login-dark-card-header"><h2>Lupa Kata Sandi?</h2><p>Masukkan email akun Anda. Kami akan mengirim instruksi untuk membuat kata sandi baru.</p></div>
          {note && <div className={`login-note login-note-${note.type}`}><i className={`bi ${note.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} /><span>{note.message}</span></div>}
          <form onSubmit={handleSubmit(onSubmit)} className="login-dark-form">
            <div className="login-dark-field">
              <label className="login-dark-label">Email Akun</label>
              <div className="login-dark-input-wrap"><i className="bi bi-envelope" /><input className={`login-dark-input ${errors.email ? 'login-dark-input-error' : ''}`} type="email" placeholder="nama@email.com" {...register('email', { required: 'Email wajib diisi' })} /></div>
              {errors.email && <span className="login-dark-error">{errors.email.message}</span>}
            </div>
            <button className="login-dark-btn" disabled={isSubmitting}>{isSubmitting ? 'Mengirim...' : 'Kirim Instruksi Reset'}</button>
          </form>
          <div className="login-dark-footer"><Link to="/login"><i className="bi bi-arrow-left me-1"></i>Kembali ke Login</Link></div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

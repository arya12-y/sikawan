import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [showPassword, setShowPassword] = useState(false)
  const [loginNote, setLoginNote] = useState(null)

  const onSubmit = async (data) => {
    setLoginNote(null)

    try {
      const response = await login(data)
      setLoginNote({ type: 'success', message: response.message || 'Login berhasil. Mengalihkan ke dashboard...' })
      setTimeout(() => navigate(location.state?.from?.pathname || '/', { replace: true }), 650)
    } catch (error) {
      setLoginNote({ type: 'danger', message: error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.' })
    }
  }

  return (
    <div className="login-dark">
      <div className="login-dark-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="login-dark-particle" style={{ animationDelay: `${i * 0.8}s` }} />
        ))}
      </div>

      <div className="login-dark-container">
        <div className="login-dark-brand">
          <div className="login-dark-logo">
            <i className="bi bi-shield-lock-fill" />
          </div>
          <h1 className="login-dark-title">SIKAWAN</h1>
          <p className="login-dark-subtitle">Sistem Informasi Kompetensi dan Asesmen Walidata</p>
        </div>

        <div className="login-dark-card">
          <div className="login-dark-card-header">
            <h2>Masuk ke Akun</h2>
            <p>Silakan masukkan kredensial Anda</p>
          </div>

          {loginNote && (
            <div className={`login-note login-note-${loginNote.type}`}>
              <i className={`bi ${loginNote.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} />
              <span>{loginNote.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="login-dark-form">
            <div className="login-dark-field">
              <label className="login-dark-label">Email</label>
              <div className="login-dark-input-wrap">
                <i className="bi bi-envelope" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  className={`login-dark-input ${errors.email ? 'login-dark-input-error' : ''}`}
                  {...register('email', { required: 'Email wajib diisi' })}
                />
              </div>
              {errors.email && <span className="login-dark-error">{errors.email.message}</span>}
            </div>

            <div className="login-dark-field">
              <label className="login-dark-label">Password</label>
              <div className="login-dark-input-wrap">
                <i className="bi bi-lock" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  className={`login-dark-input ${errors.password ? 'login-dark-input-error' : ''}`}
                  {...register('password', { required: 'Password wajib diisi' })}
                />
                <button
                  type="button"
                  className="login-dark-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {errors.password && <span className="login-dark-error">{errors.password.message}</span>}
            </div>

            <button className="login-dark-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Memproses...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="login-dark-footer">
            <Link to="/forgot-password">
              <i className="bi bi-question-circle me-1" />
              Lupa password?
            </Link>
            <span className="login-dark-separator">|</span>
            <Link to="/register">Daftar pengguna baru</Link>
          </div>
        </div>

        <div className="login-dark-copyright">
          &copy; {new Date().getFullYear()} SIKAWAN &mdash; Pemerintah Daerah
        </div>
      </div>
    </div>
  )
}

export default Login

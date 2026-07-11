import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

function Profile() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    api.get('/me').then((res) => reset(res.data?.user || res.data || {})).catch(() => {})
  }, [reset])

  const onSubmit = async (data) => {
    try {
      const res = await api.put('/profile', data)
      const updatedUser = res.data?.user || res.data
      setUser(updatedUser)
      navigate('/', { replace: true })
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan profil')
    }
  }

  return (
    <div className="card shadow-sm border-0" style={{ maxWidth: 760 }}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="pembelajaran-icon-sm" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}><i className="bi bi-person-gear"></i></div>
          <div><h4 className="fw-bold mb-1">Profil Saya</h4><p className="text-muted mb-0">Perbarui informasi akun Anda.</p></div>
        </div>
        <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-md-6"><label className="form-label fw-semibold">Nama</label><input className="form-control" {...register('name', { required: true })} /></div>
          <div className="col-md-6"><label className="form-label fw-semibold">Email</label><input className="form-control" type="email" {...register('email', { required: true })} /></div>
          <div className="col-md-6"><label className="form-label fw-semibold">NIP</label><input className="form-control" {...register('nip')} /></div>
          <div className="col-md-6"><label className="form-label fw-semibold">No. HP</label><input className="form-control" {...register('phone')} /></div>
          <div className="col-12"><label className="form-label fw-semibold">Alamat</label><textarea className="form-control" rows="3" {...register('address')}></textarea></div>
          <div className="col-12 d-flex justify-content-end gap-2"><button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Batal</button><button className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button></div>
        </form>
      </div>
    </div>
  )
}

export default Profile

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'

function Profile() {
  const { register, handleSubmit, reset, formState: { isSubmitting, isSubmitSuccessful } } = useForm()

  useEffect(() => {
    api.get('/profile').then((res) => reset(res.data?.data || res.data || {})).catch(() => {})
  }, [reset])

  const onSubmit = (data) => api.put('/profile', data)

  return (
    <div className="card shadow-sm"><div className="card-body">
      <h4 className="mb-3">Profile</h4>
      {isSubmitSuccessful && <div className="alert alert-success">Profile tersimpan.</div>}
      <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="col-md-6"><label className="form-label">Nama</label><input className="form-control" {...register('name', { required: true })} /></div>
        <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" {...register('email', { required: true })} /></div>
        <div className="col-md-6"><label className="form-label">No HP</label><input className="form-control" {...register('phone')} /></div>
        <div className="col-12"><button className="btn btn-primary" disabled={isSubmitting}>Simpan</button></div>
      </form>
    </div></div>
  )
}

export default Profile

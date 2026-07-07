import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'

function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { email: params.get('email') || '', token: params.get('token') || '' } })
  const onSubmit = async (data) => {
    await api.post('/reset-password', data)
    navigate('/login')
  }

  return (
    <div className="row justify-content-center"><div className="col-md-5"><div className="card shadow-sm"><div className="card-body p-4">
      <h4 className="mb-3">Reset Password</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input className="form-control mb-3" type="email" placeholder="Email" {...register('email', { required: true })} />
        <input className="form-control mb-3" placeholder="Token" {...register('token', { required: true })} />
        <input className="form-control mb-3" type="password" placeholder="Password baru" {...register('password', { required: true })} />
        <input className="form-control mb-3" type="password" placeholder="Konfirmasi password" {...register('password_confirmation', { required: true })} />
        <button className="btn btn-primary" disabled={isSubmitting}>Reset</button>
      </form>
    </div></div></div></div>
  )
}

export default ResetPassword

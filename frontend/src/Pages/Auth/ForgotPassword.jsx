import { useForm } from 'react-hook-form'
import api from '../../api/axios'

function ForgotPassword() {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful } } = useForm()
  const onSubmit = (data) => api.post('/forgot-password', data)

  return (
    <div className="row justify-content-center"><div className="col-md-5"><div className="card shadow-sm"><div className="card-body p-4">
      <h4 className="mb-3">Forgot Password</h4>
      {isSubmitSuccessful && <div className="alert alert-success">Instruksi reset telah dikirim.</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input className="form-control mb-3" type="email" placeholder="Email" {...register('email', { required: true })} />
        <button className="btn btn-primary" disabled={isSubmitting}>Kirim</button>
      </form>
    </div></div></div></div>
  )
}

export default ForgotPassword

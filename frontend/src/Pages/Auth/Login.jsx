import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    await login(data)
    navigate(location.state?.from?.pathname || '/', { replace: true })
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5 col-lg-4">
        <div className="card shadow-sm"><div className="card-body p-4">
          <h4 className="mb-3">Login</h4>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input className="form-control mb-3" type="email" placeholder="Email" {...register('email', { required: true })} />
            <input className="form-control mb-3" type="password" placeholder="Password" {...register('password', { required: true })} />
            <button className="btn btn-primary w-100" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Login'}</button>
          </form>
          <Link className="d-block mt-3" to="/forgot-password">Lupa password?</Link>
        </div></div>
      </div>
    </div>
  )
}

export default Login

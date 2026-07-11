import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function MateriQuiz() {
  const { user } = useAuth()
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const canManage = roles.includes('Super Admin') || roles.includes('Admin Diskominfo') || roles.includes('Penguji')

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Link className="btn btn-outline-secondary btn-sm me-3" to="/pembelajaran">
          <i className="bi bi-arrow-left me-1"></i>Kembali
        </Link>
        <div className="pembelajaran-icon-sm me-3" style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
          <i className="bi bi-patch-question-fill"></i>
        </div>
        <h4 className="mb-0 fw-bold">Quiz & Latihan</h4>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <Link to="/asesmen" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100 pembelajaran-card">
              <div className="card-body d-flex align-items-center p-4">
                <div className="pembelajaran-icon-sm me-3" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                  <i className="bi bi-clipboard-check"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Ikuti Asesmen</h5>
                  <p className="text-muted small mb-0">Uji kompetensi Anda melalui sistem asesmen.</p>
                </div>
                <i className="bi bi-chevron-right ms-auto text-muted"></i>
              </div>
            </div>
          </Link>
        </div>
        {canManage && (
          <div className="col-md-6">
            <Link to="/bank-soal" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 pembelajaran-card">
                <div className="card-body d-flex align-items-center p-4">
                  <div className="pembelajaran-icon-sm me-3" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
                    <i className="bi bi-question-circle"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">Bank Soal</h5>
                    <p className="text-muted small mb-0">Kelola kumpulan soal latihan dan ujian</p>
                  </div>
                  <i className="bi bi-chevron-right ms-auto text-muted"></i>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MateriQuiz

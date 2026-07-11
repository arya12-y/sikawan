import { Link } from 'react-router-dom'

const menuItems = [
  {
    title: 'Video Pembelajaran',
    description: 'Kumpulan video materi pembelajaran interaktif',
    icon: 'bi-play-circle-fill',
    path: '/pembelajaran/video',
    gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    count: null,
  },
  {
    title: 'Modul PDF',
    description: 'Dokumen dan modul pembelajaran dalam format PDF',
    icon: 'bi-file-earmark-pdf-fill',
    path: '/pembelajaran/pdf',
    gradient: 'linear-gradient(135deg, #dc2626, #f43f5e)',
    count: null,
  },
  {
    title: 'Presentasi',
    description: 'Materi presentasi dan slide pembelajaran',
    icon: 'bi-easel-fill',
    path: '/pembelajaran/presentasi',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    count: null,
  },
  {
    title: 'Quiz & Latihan',
    description: 'Uji pemahaman dengan quiz dan latihan soal',
    icon: 'bi-patch-question-fill',
    path: '/pembelajaran/quiz',
    gradient: 'linear-gradient(135deg, #16a34a, #22c55e)',
    count: null,
  },
]

function Materi() {
  return (
    <div>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex align-items-start gap-3">
          <div className="pembelajaran-icon-sm" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}><i className="bi bi-journal-bookmark"></i></div>
          <div>
            <h4 className="fw-bold mb-1">Pembelajaran</h4>
            <p className="text-muted mb-0">Modul ini dipakai Walidata untuk belajar sebelum ujian. Materi dipisahkan berdasarkan format: video, PDF, presentasi, dan quiz/latihan.</p>
          </div>
        </div>
      </div>
      <div className="row g-4">
        {menuItems.map((item) => (
          <div className="col-md-6 col-xl-3" key={item.path}>
            <Link to={item.path} className="text-decoration-none">
              <div className="card border-0 h-100 shadow-sm pembelajaran-card">
                <div className="card-body d-flex flex-column align-items-center text-center p-4">
                  <div className="pembelajaran-icon mb-3" style={{ background: item.gradient }}>
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <h5 className="fw-bold mb-2 text-dark">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.description}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Materi

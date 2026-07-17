import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoadingSpinner from './Components/LoadingSpinner'
import AdminLayout from './Layouts/AdminLayout'
import Asesmen from './Pages/Asesmen/Asesmen'
import AuditLog from './Pages/AuditLog/AuditLog'
import BankSoal from './Pages/BankSoal/BankSoal'
import ForgotPassword from './Pages/Auth/ForgotPassword'
import Login from './Pages/Auth/Login'
import Profile from './Pages/Auth/Profile'
import Register from './Pages/Auth/Register'
import ResetPassword from './Pages/Auth/ResetPassword'
import Dashboard from './Pages/Dashboard/Dashboard'
import Laporan from './Pages/Laporan/Laporan'
import GenericMasterPage from './Pages/Master/GenericMasterPage'
import BidangPage from './Pages/Master/Bidang/Bidang'
import WalidataPage from './Pages/Master/Walidata/Walidata'
import PengujiPage from './Pages/Master/Penguji/Penguji'
import Users from './Pages/Master/Users'
import Materi from './Pages/Materi/Materi'
import MateriList from './Pages/Materi/MateriList'
import MateriQuiz from './Pages/Materi/MateriQuiz'
import Monitoring from './Pages/Monitoring/Monitoring'
import Notifikasi from './Pages/Notifikasi/Notifikasi'
import Sertifikat from './Pages/Sertifikat/Sertifikat'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { canAccessPath, firstAllowedPath } from './utils/access'

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />

  return <AdminLayout />
}

function AccessRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!canAccessPath(user, location.pathname)) return <Navigate to={firstAllowedPath(user)} replace />

  return children
}

const protect = (element) => <AccessRoute>{element}</AccessRoute>

const baseFields = [
  { name: 'nama', label: 'Nama', required: true },
  { name: 'deskripsi', label: 'Deskripsi' },
]

const routes = [
  { path: 'opd', element: <GenericMasterPage title="OPD" endpoint="/opds" fields={[{ name: 'kode', label: 'Kode', required: true, maxLength: 20 }, { name: 'nama', label: 'Nama OPD', required: true, maxLength: 255 }, { name: 'singkatan', label: 'Singkatan', maxLength: 50 }, { name: 'email', label: 'Email', type: 'email', maxLength: 255 }]} /> },
  { path: 'bidang', element: <BidangPage /> },
  { path: 'jabatan', element: <GenericMasterPage title="Jabatan" endpoint="/jabatans" fields={[...baseFields, { name: 'level', label: 'Level', type: 'number' }]} /> },
  { path: 'kompetensi', element: <GenericMasterPage title="Kompetensi" endpoint="/kompetensis" fields={[{ name: 'kode', label: 'Kode', required: true }, { name: 'nama', label: 'Nama', required: true }, { name: 'domain', label: 'Domain' }, { name: 'deskripsi', label: 'Deskripsi' }]} /> },
  { path: 'level', element: <GenericMasterPage title="Level" endpoint="/levels" fields={[{ name: 'kode', label: 'Kode', required: true }, { name: 'nama', label: 'Nama', required: true }, { name: 'urutan', label: 'Urutan', type: 'number' }, { name: 'nilai_min', label: 'Nilai Min', type: 'number' }, { name: 'nilai_max', label: 'Nilai Max', type: 'number' }]} /> },
  { path: 'badge', element: <GenericMasterPage title="Badge" endpoint="/badges" fields={[{ name: 'nama', label: 'Nama', required: true }, { name: 'icon', label: 'Icon' }, { name: 'nilai_min', label: 'Nilai Min', type: 'number' }]} /> },
  { path: 'kategori', element: <GenericMasterPage title="Kategori" endpoint="/kategoris" fields={[{ name: 'nama', label: 'Nama', required: true }, { name: 'slug', label: 'Slug', required: true }, { name: 'deskripsi', label: 'Deskripsi' }]} /> },
  { path: 'walidata', element: <WalidataPage /> },
  { path: 'penguji', element: <PengujiPage /> },
]

const masterIcons = {
  opd: { icon: 'bi-building', color: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
  bidang: { icon: 'bi-diagram-2', color: 'linear-gradient(135deg, #10b981, #22c55e)' },
  jabatan: { icon: 'bi-person-badge', color: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  kompetensi: { icon: 'bi-star', color: 'linear-gradient(135deg, #8b5cf6, #d946ef)' },
  level: { icon: 'bi-bar-chart-steps', color: 'linear-gradient(135deg, #ef4444, #f43f5e)' },
  badge: { icon: 'bi-patch-check', color: 'linear-gradient(135deg, #eab308, #f59e0b)' },
  kategori: { icon: 'bi-tags', color: 'linear-gradient(135deg, #6366f1, #a855f7)' },
  walidata: { icon: 'bi-person-gear', color: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' },
  penguji: { icon: 'bi-person-check', color: 'linear-gradient(135deg, #14b8a6, #10b981)' },
}

function MasterData() {
  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Master Data</h4>
        <p className="text-muted">Kelola seluruh data referensi dan pengaturan sistem.</p>
      </div>
      <div className="row g-4">
        {routes.map((item) => {
          const config = masterIcons[item.path] || { icon: 'bi-database', color: 'linear-gradient(135deg, #64748b, #94a3b8)' }
          return (
            <div className="col-md-6 col-xl-4" key={item.path}>
              <Link className="card admin-card text-decoration-none h-100 pembelajaran-card border-0" to={`/${item.path}`}>
                <div className="card-body d-flex align-items-center p-4">
                  <div className="pembelajaran-icon-sm me-3 shadow-sm" style={{ background: config.color }}>
                    <i className={`bi ${config.icon}`}></i>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1 text-dark text-capitalize">{item.path.replaceAll('-', ' ')}</h5>
                    <p className="text-muted small mb-0">Kelola data {item.path.replaceAll('-', ' ')}</p>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
        <div className="col-md-6 col-xl-4">
          <Link className="card admin-card text-decoration-none h-100 pembelajaran-card border-0" to="/users">
            <div className="card-body d-flex align-items-center p-4">
              <div className="pembelajaran-icon-sm me-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #475569, #64748b)' }}>
                <i className="bi bi-people-fill"></i>
              </div>
              <div>
                <h5 className="fw-bold mb-1 text-dark">Pengguna</h5>
                <p className="text-muted small mb-0">Kelola akun dan hak akses pengguna</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={protect(<Dashboard />)} />
        <Route path="profile" element={<Profile />} />
        <Route path="master-data" element={protect(<MasterData />)} />
        {routes.map((item) => <Route key={item.path} path={item.path} element={protect(item.element)} />)}
        <Route path="users" element={protect(<Users />)} />
        <Route path="pembelajaran" element={protect(<Materi />)} />
        <Route path="pembelajaran/video" element={protect(<MateriList jenis="video" />)} />
        <Route path="pembelajaran/pdf" element={protect(<MateriList jenis="pdf" />)} />
        <Route path="pembelajaran/presentasi" element={protect(<MateriList jenis="presentasi" />)} />
        <Route path="pembelajaran/quiz" element={protect(<MateriQuiz />)} />
        <Route path="bank-soal" element={protect(<BankSoal />)} />
        <Route path="asesmen" element={protect(<Asesmen />)} />
        <Route path="monitoring" element={protect(<Monitoring />)} />
        <Route path="sertifikat" element={protect(<Sertifikat />)} />
        <Route path="laporan" element={protect(<Laporan />)} />
        <Route path="audit-log" element={protect(<AuditLog />)} />
        <Route path="notifikasi" element={<Notifikasi />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App

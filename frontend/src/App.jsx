import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoadingSpinner from './Components/LoadingSpinner'
import AdminLayout from './Layouts/AdminLayout'
import Asesmen from './Pages/Asesmen/Asesmen'
import AuditLog from './Pages/AuditLog/AuditLog'
import BankSoal from './Pages/BankSoal/BankSoal'
import ForgotPassword from './Pages/Auth/ForgotPassword'
import Login from './Pages/Auth/Login'
import Profile from './Pages/Auth/Profile'
import ResetPassword from './Pages/Auth/ResetPassword'
import Dashboard from './Pages/Dashboard/Dashboard'
import Laporan from './Pages/Laporan/Laporan'
import GenericMasterPage from './Pages/Master/GenericMasterPage'
import Users from './Pages/Master/Users'
import Materi from './Pages/Materi/Materi'
import Monitoring from './Pages/Monitoring/Monitoring'
import Notifikasi from './Pages/Notifikasi/Notifikasi'
import Sertifikat from './Pages/Sertifikat/Sertifikat'
import { AuthProvider, useAuth } from './hooks/useAuth'

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />

  return <AdminLayout />
}

const baseFields = [
  { name: 'nama', label: 'Nama', required: true },
  { name: 'deskripsi', label: 'Deskripsi' },
]

const routes = [
  { path: 'opd', element: <GenericMasterPage title="OPD" endpoint="/opds" fields={[{ name: 'kode', label: 'Kode', required: true }, { name: 'nama', label: 'Nama OPD', required: true }, { name: 'singkatan', label: 'Singkatan' }, { name: 'email', label: 'Email', type: 'email' }]} /> },
  { path: 'bidang', element: <GenericMasterPage title="Bidang" endpoint="/bidangs" fields={[{ name: 'opd_id', label: 'OPD ID', type: 'number', required: true }, ...baseFields]} /> },
  { path: 'jabatan', element: <GenericMasterPage title="Jabatan" endpoint="/jabatans" fields={[...baseFields, { name: 'level', label: 'Level', type: 'number' }]} /> },
  { path: 'kompetensi', element: <GenericMasterPage title="Kompetensi" endpoint="/kompetensis" fields={[{ name: 'kode', label: 'Kode', required: true }, { name: 'nama', label: 'Nama', required: true }, { name: 'domain', label: 'Domain' }, { name: 'deskripsi', label: 'Deskripsi' }]} /> },
  { path: 'level', element: <GenericMasterPage title="Level" endpoint="/levels" fields={[{ name: 'kode', label: 'Kode', required: true }, { name: 'nama', label: 'Nama', required: true }, { name: 'urutan', label: 'Urutan', type: 'number' }, { name: 'nilai_min', label: 'Nilai Min', type: 'number' }, { name: 'nilai_max', label: 'Nilai Max', type: 'number' }]} /> },
  { path: 'badge', element: <GenericMasterPage title="Badge" endpoint="/badges" fields={[{ name: 'nama', label: 'Nama', required: true }, { name: 'icon', label: 'Icon' }, { name: 'nilai_min', label: 'Nilai Min', type: 'number' }]} /> },
  { path: 'kategori', element: <GenericMasterPage title="Kategori" endpoint="/kategoris" fields={[{ name: 'nama', label: 'Nama', required: true }, { name: 'slug', label: 'Slug', required: true }, { name: 'deskripsi', label: 'Deskripsi' }]} /> },
]

function MasterData() {
  return (
    <div className="row g-3">
      {routes.map((item) => <div className="col-md-6 col-xl-4" key={item.path}><Link className="card admin-card text-decoration-none h-100" to={`/${item.path}`}><div className="card-body"><h5 className="mb-1">{item.path.toUpperCase()}</h5><p className="text-muted mb-0">Kelola data {item.path}</p></div></Link></div>)}
      <div className="col-md-6 col-xl-4"><Link className="card admin-card text-decoration-none h-100" to="/users"><div className="card-body"><h5 className="mb-1">PENGGUNA</h5><p className="text-muted mb-0">Kelola user dan role</p></div></Link></div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="master-data" element={<MasterData />} />
        {routes.map((item) => <Route key={item.path} path={item.path} element={item.element} />)}
        <Route path="users" element={<Users />} />
        <Route path="pembelajaran" element={<Materi />} />
        <Route path="bank-soal" element={<BankSoal />} />
        <Route path="asesmen" element={<Asesmen />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="sertifikat" element={<Sertifikat />} />
        <Route path="laporan" element={<Laporan />} />
        <Route path="audit-log" element={<AuditLog />} />
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

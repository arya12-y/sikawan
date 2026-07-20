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
import Roles from './Pages/Roles/Roles'
import Materi from './Pages/Materi/Materi'
import MateriList from './Pages/Materi/MateriList'
import MateriQuiz from './Pages/Materi/MateriQuiz'
import Monitoring from './Pages/Monitoring/Monitoring'
import Notifikasi from './Pages/Notifikasi/Notifikasi'
import Sertifikat from './Pages/Sertifikat/Sertifikat'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { canAccessPath, firstAllowedPath } from './utils/access'
import { Building2, UsersIcon, Briefcase, Star, BarChart3, Award, Tags, Shield, UserCheck, UserCog, ArrowRight } from 'lucide-react'

const masterItems = [
  { path: 'opd', label: 'OPD', desc: 'Kelola data Organisasi Perangkat Daerah', icon: Building2, color: 'from-blue-500 to-cyan-500' },
  { path: 'bidang', label: 'Bidang', desc: 'Kelola data Bidang', icon: Briefcase, color: 'from-emerald-500 to-green-500' },
  { path: 'jabatan', label: 'Jabatan', desc: 'Kelola data Jabatan', icon: UserCog, color: 'from-amber-500 to-orange-500' },
  { path: 'kompetensi', label: 'Kompetensi', desc: 'Kelola data Kompetensi', icon: Star, color: 'from-violet-500 to-pink-500' },
  { path: 'level', label: 'Level', desc: 'Kelola data Level', icon: BarChart3, color: 'from-red-500 to-rose-500' },
  { path: 'badge', label: 'Badge', desc: 'Kelola data Badge', icon: Award, color: 'from-yellow-500 to-amber-500' },
  { path: 'kategori', label: 'Kategori', desc: 'Kelola data Kategori', icon: Tags, color: 'from-indigo-500 to-purple-500' },
  { path: 'walidata', label: 'Walidata', desc: 'Kelola data Walidata', icon: UsersIcon, color: 'from-sky-500 to-blue-500' },
  { path: 'penguji', label: 'Penguji', desc: 'Kelola data Penguji', icon: UserCheck, color: 'from-teal-500 to-emerald-500' },
]

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

function MasterData() {
  return (
    <div>
      <div className="mb-6">
        <h4 className="text-xl font-bold text-gray-900">Master Data</h4>
        <p className="text-sm text-gray-500 mt-1">Kelola seluruh data referensi dan pengaturan sistem.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {masterItems.map((item) => (
          <Link
            key={item.path}
            to={`/${item.path}`}
            className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-sm`}>
              <item.icon className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900 text-sm">{item.label}</h5>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
          </Link>
        ))}
        <Link
          to="/users"
          className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0 shadow-sm">
            <Shield className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-gray-900 text-sm">Pengguna</h5>
            <p className="text-xs text-gray-500 mt-0.5">Kelola akun dan hak akses pengguna</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
        </Link>
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
        <Route path="roles" element={protect(<Roles />)} />
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

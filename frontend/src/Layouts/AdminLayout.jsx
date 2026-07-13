import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { canAccessPath } from '../utils/access'
import { useAuth } from '../hooks/useAuth'
import NotificationDropdown from '../Components/NotificationDropdown'

const menuItems = [
  { label: 'Dashboard', icon: 'bi-speedometer2', path: '/' },
  { label: 'Master Data', icon: 'bi-database', path: '/master-data' },
  { label: 'Pembelajaran', icon: 'bi-journal-bookmark', path: '/pembelajaran' },
  { label: 'Bank Soal', icon: 'bi-question-circle', path: '/bank-soal' },
  { label: 'Asesmen', icon: 'bi-clipboard-check', path: '/asesmen' },
  { label: 'Monitoring', icon: 'bi-activity', path: '/monitoring' },
  { label: 'Sertifikat', icon: 'bi-award', path: '/sertifikat' },
  { label: 'Laporan', icon: 'bi-file-earmark-bar-graph', path: '/laporan' },
  { label: 'Audit Log', icon: 'bi-shield-check', path: '/audit-log' },
  { label: 'Notifikasi', icon: 'bi-bell', path: '/notifikasi' },
]

const titleMap = {
  '/profile': 'Profile',
  '/opd': 'OPD',
  '/bidang': 'Bidang',
  '/jabatan': 'Jabatan',
  '/kompetensi': 'Kompetensi',
  '/level': 'Level',
  '/badge': 'Badge',
  '/kategori': 'Kategori',
  '/walidata': 'Walidata',
  '/penguji': 'Penguji',
  '/users': 'Pengguna',
  '/pembelajaran/video': 'Video Pembelajaran',
  '/pembelajaran/pdf': 'Modul PDF',
  '/pembelajaran/presentasi': 'Presentasi',
  '/pembelajaran/quiz': 'Quiz & Latihan',
}

function SidebarContent({ user, onNavigate }) {
  const visibleMenus = menuItems.filter((item) => canAccessPath(user, item.path))

  return (
    <>
      <Link className="brand-link" to="/" onClick={onNavigate}>
        <span className="brand-icon"><i className="bi bi-mortarboard-fill"></i></span>
        <div><div className="brand-text">SIKAWAN</div><div className="brand-sub">Kompetensi Walidata</div></div>
      </Link>
      <nav className="sidebar-nav">
        {visibleMenus.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={onNavigate}>
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const title = titleMap[location.pathname] ?? menuItems.find((item) => item.path === location.pathname)?.label ?? 'Dashboard'

  const closeMobileSidebar = () => {
    const el = document.getElementById('mobileSidebar')
    if (el) {
      const offcanvas = window.bootstrap?.Offcanvas?.getInstance(el) || (window.bootstrap?.Offcanvas ? new window.bootstrap.Offcanvas(el) : null)
      try { offcanvas?.hide() } catch { undefined }
    }
  }

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar d-none d-lg-flex">
        <SidebarContent user={user} onNavigate={() => {}} />
      </aside>
      <div className="offcanvas offcanvas-start admin-offcanvas" tabIndex="-1" id="mobileSidebar">
        <div className="offcanvas-body p-0">
          <SidebarContent user={user} onNavigate={closeMobileSidebar} />
        </div>
      </div>
      <div className="admin-main">
        <header className="admin-navbar navbar navbar-expand bg-white">
          <div className="container-fluid px-3 px-lg-4">
            <button className="btn btn-icon d-lg-none me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar" aria-controls="mobileSidebar">
              <i className="bi bi-list fs-5"></i>
            </button>
            <div className="flex-grow-1">
              <h1 className="page-title">{title}</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">{title}</li>
                </ol>
              </nav>
            </div>
            <div className="d-flex align-items-center gap-2 ms-3">
              <NotificationDropdown />
              <div className="dropdown">
                <button className="btn user-menu dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <span className="avatar">{(user?.name ?? 'A').slice(0, 1).toUpperCase()}</span>
                  <span className="d-none d-sm-inline">{user?.name ?? 'Administrator'}</span>
                  <span className="mobile-user-name d-sm-none">{(user?.name ?? 'Admin').split(' ')[0]}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-1" style={{ borderRadius: 14, minWidth: 180 }}>
                  <li><Link className="dropdown-item py-2" to="/profile"><i className="bi bi-person me-2"></i>Profil Saya</Link></li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li><button className="dropdown-item text-danger py-2" type="button" onClick={logout}><i className="bi bi-box-arrow-right me-2"></i>Keluar</button></li>
                </ul>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
        <footer className="admin-footer">
          <span>Copyright © 2026 SIKAWAN</span>
          <span>Admin Dashboard v1.0</span>
        </footer>
      </div>
    </div>
  )
}

export default AdminLayout

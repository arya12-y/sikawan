import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { canAccessPath } from '../utils/access'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import NotificationDropdown from '../Components/NotificationDropdown'
import {
  GraduationCap, LayoutDashboard, Database, BookOpen, HelpCircle, ClipboardCheck,
  Activity, Award, FileBarChart, ShieldCheck, Shield, Bell, User, LogOut,
  ChevronDown, Menu, X, Building2, UsersIcon, Briefcase, Star, BarChart3,
  Tags, UserCheck, UserCog, Play, FileText, BookMarked, Sun, Moon,
} from 'lucide-react'

const navSections = [
  { title: 'Umum', items: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  ]},
  { title: 'Master Data', items: [
    { label: 'Master Data', icon: Database, path: '/master-data', children: [
      { label: 'OPD', path: '/opd', icon: Building2 },
      { label: 'Bidang', path: '/bidang', icon: Briefcase },
      { label: 'Jabatan', path: '/jabatan', icon: UserCog },
      { label: 'Kompetensi', path: '/kompetensi', icon: Star },
      { label: 'Level', path: '/level', icon: BarChart3 },
      { label: 'Badge', path: '/badge', icon: Award },
      { label: 'Kategori', path: '/kategori', icon: Tags },
      { label: 'Walidata', path: '/walidata', icon: UsersIcon },
      { label: 'Penguji', path: '/penguji', icon: UserCheck },
      { label: 'Pengguna', path: '/users', icon: Shield },
      { label: 'Role & Hak Akses', path: '/roles', icon: ShieldCheck },
    ]},
  ]},
  { title: 'Pembelajaran', items: [
    { label: 'Materi', icon: BookOpen, path: '/pembelajaran', children: [
      { label: 'Video', path: '/pembelajaran/video', icon: Play },
      { label: 'Modul PDF', path: '/pembelajaran/pdf', icon: FileText },
      { label: 'Presentasi', path: '/pembelajaran/presentasi', icon: BookMarked },
      { label: 'Quiz', path: '/pembelajaran/quiz', icon: HelpCircle },
    ]},
    { label: 'Bank Soal', icon: HelpCircle, path: '/bank-soal' },
    { label: 'Asesmen', icon: ClipboardCheck, path: '/asesmen' },
  ]},
  { title: 'Monitoring & Laporan', items: [
    { label: 'Monitoring', icon: Activity, path: '/monitoring' },
    { label: 'Sertifikat', icon: Award, path: '/sertifikat' },
    { label: 'Laporan', icon: FileBarChart, path: '/laporan' },
    { label: 'Audit Log', icon: ShieldCheck, path: '/audit-log' },
  ]},
  { title: 'Pengaturan', items: [
    { label: 'Notifikasi', icon: Bell, path: '/notifikasi' },
  ]},
]

function NavItem({ item, collapsed, onNavClick, location, user }) {
  const [open, setOpen] = useState(() => item.children?.some(c => location.pathname === c.path) ?? false)
  const visibleChildren = item.children?.filter(c => canAccessPath(user, c.path)) ?? []
  const hasChildren = visibleChildren.length > 0
  const isActive = item.path ? location.pathname === item.path : false
  const isChildActive = item.children?.some(c => location.pathname === c.path) ?? false

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => !collapsed && setOpen(o => !o)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            isChildActive ? 'text-slate-100 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <item.icon className={`w-[18px] h-[18px] shrink-0 ${isChildActive ? 'text-indigo-400' : 'text-slate-500'}`} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 text-left truncate">
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
          {!collapsed && (
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </motion.div>
          )}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-8 mt-0.5 space-y-0.5 border-l border-[#1E1E2E] pl-2">
                {visibleChildren.map((child) => {
                  const childActive = location.pathname === child.path
                  return (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      end
                      onClick={onNavClick}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                        childActive ? 'text-indigo-400 bg-indigo-500/10 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <child.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{child.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      end
      onClick={onNavClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive ? 'text-slate-100 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  )
}

function SidebarContent({ user, collapsed, onNavClick }) {
  const location = useLocation()
  return (
    <>
      <Link to="/" className="flex items-center gap-3 px-4 py-5 border-b border-[#1E1E2E] shrink-0">
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-4.5 h-4.5 text-white" />
          </div>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
              <div className="text-slate-100 font-bold text-base tracking-tight">SIKAWAN</div>
              <div className="text-[10px] text-slate-500 font-medium">Kompetensi Walidata</div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-5">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => canAccessPath(user, item.path))
          if (visibleItems.length === 0) return null
          return (
            <div key={section.title}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 mb-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-500">
                    {section.title}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavItem key={item.label} item={item} collapsed={collapsed} onNavClick={onNavClick} location={location} user={user} />
                ))}
              </div>
            </div>
          )
        })}
      </nav>
    </>
  )
}

function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, toggle: toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const flatTitles = { '/profile': 'Profile', '/users': 'Pengguna', '/roles': 'Role & Hak Akses' }
  const findTitle = () => {
    if (flatTitles[location.pathname]) return flatTitles[location.pathname]
    for (const section of navSections) {
      for (const item of section.items) {
        if (item.path === location.pathname) return item.label
        if (item.children) {
          for (const child of item.children) {
            if (child.path === location.pathname) return child.label
          }
        }
      }
    }
    return 'Dashboard'
  }
  const title = findTitle()

  return (
    <div className="flex h-screen bg-[#09090E] overflow-hidden">
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-[#0F0F17] border-r border-[#1E1E2E] overflow-hidden shrink-0 sidebar-surface"
      >
        <SidebarContent user={user} collapsed={collapsed} onNavClick={() => {}} />
      </motion.aside>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }} transition={{ duration: 0.2, ease: 'easeInOut' }} className="fixed inset-y-0 left-0 z-50 w-[220px] flex flex-col bg-[#0F0F17] border-r border-[#1E1E2E] lg:hidden">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#1E1E2E]">
              <span className="text-slate-100 font-bold">SIKAWAN</span>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <SidebarContent user={user} collapsed={false} onNavClick={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-[#1E1E2E] bg-[#0F0F17]/80 backdrop-blur-xl flex items-center px-6 gap-4 shrink-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={() => setCollapsed(c => !c)} className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="text-slate-500 shrink-0">SIKAWAN</span>
            <span className="text-slate-600 shrink-0">/</span>
            <span className="text-slate-200 font-medium truncate">{title}</span>
          </div>
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <NotificationDropdown />
            <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center text-slate-400 transition hover:text-indigo-400" title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}>
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <div className="relative">
              <button onClick={() => setShowUserMenu(o => !o)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-7 h-7 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                  {(user?.name ?? 'A').slice(0, 1).toUpperCase()}
                </div>
                <span className="text-sm text-slate-300 max-w-[120px] truncate hidden sm:block">{user?.name ?? 'Admin'}</span>
              </button>
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-1 w-48 bg-[#14141E] border border-[#1E1E2E] rounded-xl shadow-2xl py-1 z-50">
                      <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors" onClick={() => setShowUserMenu(false)}><User className="w-4 h-4 text-slate-500" /> Profil Saya</Link>
                      <hr className="my-1 border-[#1E1E2E]" />
                      <button onClick={() => { setShowUserMenu(false); logout() }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-white/5 transition-colors"><LogOut className="w-4 h-4" /> Keluar</button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="h-10 border-t border-[#1E1E2E] flex items-center justify-between px-6 text-[11px] text-slate-600 shrink-0">
          <span>&copy; 2026 SIKAWAN</span>
          <span>Admin Dashboard v1.0</span>
        </footer>
      </div>
    </div>
  )
}

export default AdminLayout
